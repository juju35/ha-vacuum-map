"""Vacuum Map: a clean, live map of Roborock vacuums, drawn by its own Lovelace card."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import (
    SIGNAL_CONFIG_ENTRY_CHANGED,
    ConfigEntry,
    ConfigEntryChange,
    ConfigEntryState,
)
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, Event, HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.typing import ConfigType

from .const import CARD_URL, DATA_CACHE, DATA_LIVE, DATA_SUBSCRIPTIONS, DOMAIN, THREE_URL, VERSION
from .live import LivePoller
from .source import ROBOROCK, GeometryCache
from .websocket import async_register

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
# Set once the card is loaded, cleared when the entry is removed
CARD_LOADED = f"{DOMAIN}_card_loaded"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Serve the card and load it on every dashboard."""
    base = Path(__file__).parent
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(CARD_URL, str(base / "frontend" / "vacuum-map-card.js"), True),
            StaticPathConfig(THREE_URL, str(base / "frontend" / "vendor" / "three.min.js"), True),
        ]
    )
    async_register(hass)

    async def _register(_: Event | None = None) -> None:
        if not hass.data.get(CARD_LOADED) and hass.config_entries.async_entries(DOMAIN):
            await _async_load_card(hass)

    if hass.state is CoreState.running:
        await _register()
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register)
    return True


async def _async_load_card(hass: HomeAssistant) -> None:
    """Add the card to the dashboard resources, or load it on every page in YAML mode."""
    hass.data[CARD_LOADED] = True
    if not await _async_register_resource(hass):
        add_extra_js_url(hass, f"{CARD_URL}?v={VERSION}")


def _storage_resources(hass: HomeAssistant) -> Any | None:
    """The dashboard resources collection when it is editable from the UI.

    hass.data["lovelace"] is a dataclass whose `mode` field became `resource_mode` in Home Assistant 2026.2.
    """
    lovelace = hass.data.get("lovelace")
    if getattr(lovelace, "resource_mode", getattr(lovelace, "mode", None)) != "storage":
        return None
    return getattr(lovelace, "resources", None)


async def _async_register_resource(hass: HomeAssistant) -> bool:
    """Add or update the card in Settings → Dashboards → Resources."""
    if (resources := _storage_resources(hass)) is None:
        return False
    url = f"{CARD_URL}?v={VERSION}"
    try:
        await resources.async_get_info()  # loads the collection from storage
        existing = [item for item in resources.async_items() if item.get("url", "").split("?")[0] == CARD_URL]
        if not existing:
            await resources.async_create_item({"res_type": "module", "url": url})
            return True
        if existing[0]["url"] != url:
            await resources.async_update_item(existing[0]["id"], {"res_type": "module", "url": url})
        for duplicate in existing[1:]:
            await resources.async_delete_item(duplicate["id"])
    except Exception:  # noqa: BLE001 - never block the integration on the card
        _LOGGER.exception("Could not register the Vacuum Map card as a dashboard resource")
        return False
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Follow the Roborock maps."""
    hass.data[DOMAIN] = {DATA_CACHE: GeometryCache(), DATA_SUBSCRIPTIONS: set(), DATA_LIVE: LivePoller(hass, entry)}
    if hass.state is CoreState.running and not hass.data.get(CARD_LOADED):
        await _async_load_card(hass)

    @callback
    def _entry_changed(change: ConfigEntryChange, changed: ConfigEntry) -> None:
        """A Roborock entry unloads: its coordinators are gone, the cards subscribe again to the new ones."""
        if changed.domain == ROBOROCK and changed.state is not ConfigEntryState.LOADED:
            _end_subscriptions(hass)

    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_CONFIG_ENTRY_CHANGED, _entry_changed))
    return True


@callback
def _end_subscriptions(hass: HomeAssistant) -> None:
    for end in list(hass.data.get(DOMAIN, {}).get(DATA_SUBSCRIPTIONS, ())):
        end()


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    _end_subscriptions(hass)
    if live := hass.data.get(DOMAIN, {}).get(DATA_LIVE):
        live.stop()
    hass.data.pop(DOMAIN, None)
    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Remove the card resource with the entry."""
    if (resources := _storage_resources(hass)) is None:
        return
    hass.data[CARD_LOADED] = False
    for item in list(resources.async_items()):
        if item.get("url", "").split("?")[0] == CARD_URL:
            await resources.async_delete_item(item["id"])
