"""WebSocket commands of the card: list the maps of a vacuum, follow one map live."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from .const import DATA_CACHE, DATA_SUBSCRIPTIONS, DOMAIN
from .geometry import geometry_payload
from .source import (
    GeometryCache,
    coordinator_for_entity,
    current_map_flag,
    list_maps,
    live_payload,
    map_content,
    room_names,
)

_LOGGER = logging.getLogger(__name__)


@callback
def async_register(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_maps)
    websocket_api.async_register_command(hass, ws_subscribe)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/maps", vol.Required("entity_id"): cv.entity_id})
@callback
def ws_maps(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The maps of a Roborock vacuum, the selected one first."""
    if (coordinator := coordinator_for_entity(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", "No Roborock map for this entity")
        return
    current = current_map_flag(coordinator)
    maps = [
        {"map": ref.map_flag, "name": ref.name, "current": ref.map_flag == current} for ref in list_maps(coordinator)
    ]
    maps.sort(key=lambda item: not item["current"])
    connection.send_result(msg["id"], maps)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/subscribe",
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("map"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Send the map, then every change of it: the geometry only when it changed, the live part each time."""
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "not_loaded", "Vacuum Map is not set up")
        return
    if (coordinator := coordinator_for_entity(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", "No Roborock map for this entity")
        return
    cache: GeometryCache = hass.data[DOMAIN][DATA_CACHE]
    fixed_map = msg.get("map")
    state = {"geometry": None, "raw": None, "busy": False, "again": False}

    async def _async_push() -> None:
        if state["busy"]:
            state["again"] = True  # an update arrived while the previous one was computed
            return
        state["busy"] = True
        try:
            while True:
                state["again"] = False
                await _async_send_once()
                if not state["again"]:
                    break
        except Exception:
            _LOGGER.exception("Could not build the map of %s", msg["entity_id"])
        finally:
            state["busy"] = False

    async def _async_send_once() -> None:
        map_flag = fixed_map if fixed_map is not None else current_map_flag(coordinator)
        content = map_content(coordinator, map_flag) if map_flag is not None else None
        raw = getattr(content, "raw_api_response", None)
        map_data = getattr(content, "map_data", None)
        if raw is None or map_data is None or raw is state["raw"]:
            return
        state["raw"] = raw
        key = (str(getattr(coordinator, "duid_slug", id(coordinator))), map_flag)
        if (result := await cache.async_get(hass, key, raw)) is None:
            return
        grid, geometry = result
        event: dict[str, Any] = {"map": map_flag, "live": live_payload(grid, map_data)}
        if geometry.digest != state["geometry"]:
            event["geometry"] = geometry_payload(geometry, room_names(coordinator))
            state["geometry"] = geometry.digest
        connection.send_message(websocket_api.event_message(msg["id"], event))

    @callback
    def _on_update() -> None:
        hass.async_create_task(_async_push(), eager_start=True)

    remove_listener = coordinator.async_add_listener(_on_update)
    subscriptions: set = hass.data[DOMAIN][DATA_SUBSCRIPTIONS]

    @callback
    def _close() -> None:
        if state.get("closed"):
            return
        state["closed"] = True
        remove_listener()
        subscriptions.discard(_end)

    @callback
    def _end() -> None:
        """The integration unloads: tell the card, which subscribes again."""
        _close()
        connection.send_message(websocket_api.event_message(msg["id"], {"reset": True}))

    subscriptions.add(_end)
    connection.subscriptions[msg["id"]] = _close
    connection.send_result(msg["id"])
    await _async_push()
