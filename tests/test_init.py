"""Setup, card resource and WebSocket commands, against a fake Roborock integration."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace
from typing import Any

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.vacuum_map.const import CARD_URL, DOMAIN, VERSION

from .maps import apartment, raw_map

DUID = "abc123"
ENTITY = "vacuum.saros"


def _point(x: float, y: float, a: float | None = None) -> SimpleNamespace:
    return SimpleNamespace(x=x, y=y, a=a)


class FakeCoordinator:
    """What the Vacuum Map reads from a Roborock V1 coordinator."""

    def __init__(self, raw: bytes) -> None:
        self.listeners: list = []
        self.duid_slug = DUID
        self.device_info = {"identifiers": {("roborock", DUID)}}
        self.map_data = SimpleNamespace(
            vacuum_position=_point(20600, 22900, 90),
            charger=_point(20300, 22600),
            vacuum_room=1,
            path=SimpleNamespace(path=[[_point(20500, 22800), _point(20600, 22900)]]),
            mop_path=None,
            no_go_areas=[
                SimpleNamespace(x0=21000, y0=22600, x1=21100, y1=22600, x2=21100, y2=22700, x3=21000, y3=22700)
            ],
            no_mopping_areas=None,
            walls=None,
            obstacles=None,
            obstacles_with_photo=None,
        )
        self.content = SimpleNamespace(raw_api_response=raw, map_data=self.map_data)
        home = SimpleNamespace(
            home_map_info={0: SimpleNamespace(map_flag=0, name="Appartement")},
            home_map_content={0: self.content},
            _rooms_trait=SimpleNamespace(room_map={1: SimpleNamespace(name="Salon")}),
        )
        self.properties_api = SimpleNamespace(home=home, maps=SimpleNamespace(current_map=0))

    def async_add_listener(self, listener):
        self.listeners.append(listener)
        return lambda: self.listeners.remove(listener)

    def notify(self) -> None:
        for listener in list(self.listeners):
            listener()


@pytest.fixture
def roborock(hass: HomeAssistant):
    # The real integration needs python-roborock: mark it as set up, the fake entry stands for it
    hass.config.components.add("roborock")
    entry = MockConfigEntry(domain="roborock", title="Roborock")
    entry.add_to_hass(hass)
    coordinator = FakeCoordinator(raw_map(apartment()))
    entry.runtime_data = SimpleNamespace(v1=[coordinator])
    entry.mock_state(hass, ConfigEntryState.LOADED)
    device = dr.async_get(hass).async_get_or_create(config_entry_id=entry.entry_id, identifiers={("roborock", DUID)})
    er.async_get(hass).async_get_or_create(
        "vacuum", "roborock", DUID, config_entry=entry, device_id=device.id, suggested_object_id="saros"
    )
    yield coordinator
    # Unloading the fake entry at teardown would import the real integration
    entry.mock_state(hass, ConfigEntryState.NOT_LOADED)


@pytest.fixture
async def setup(hass: HomeAssistant, roborock: FakeCoordinator) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, title="Vacuum Map")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_config_flow_needs_roborock(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] == "abort"
    assert result["reason"] == "no_roborock"


async def test_config_flow_creates_entry(hass: HomeAssistant, roborock: FakeCoordinator) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] == "form"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] == "create_entry"


async def test_maps(hass: HomeAssistant, hass_ws_client, setup: MockConfigEntry) -> None:
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/maps", "entity_id": ENTITY})
    msg = await client.receive_json()
    assert msg["success"]
    assert msg["result"] == [{"map": 0, "name": "Appartement", "current": True}]

    await client.send_json({"id": 2, "type": f"{DOMAIN}/maps", "entity_id": "vacuum.unknown"})
    msg = await client.receive_json()
    assert not msg["success"]
    assert msg["error"]["code"] == "not_found"


async def _subscribe(client) -> dict[str, Any]:
    await client.send_json({"id": 5, "type": f"{DOMAIN}/subscribe", "entity_id": ENTITY})
    msg = await client.receive_json()
    assert msg["success"]
    return (await client.receive_json())["event"]


async def test_subscribe_sends_geometry_then_live_updates(
    hass: HomeAssistant, hass_ws_client, setup: MockConfigEntry, roborock: FakeCoordinator
) -> None:
    client = await hass_ws_client(hass)
    event = await _subscribe(client)
    geometry = event["geometry"]
    assert geometry["size"] == [22, 12]
    assert [room["name"] for room in geometry["rooms"]] == ["Salon", "Room 2"]
    assert geometry["walls"]
    live = event["live"]
    # (20600 mm / 50) - left 400 = 12; height 12 - (22900 / 50 - top 450) = 4
    assert live["robot"] == {"x": 12.0, "y": 4.0, "a": 90}
    assert live["room"] == 1
    assert live["path"] == [[10.0, 6.0, 12.0, 4.0]]
    assert len(live["no_go"][0]) == 8

    # The robot moves, the map image is the same: live part only
    roborock.map_data.vacuum_position = _point(20650, 22900, 0)
    roborock.content.raw_api_response = raw_map(apartment())
    roborock.notify()
    event = (await client.receive_json())["event"]
    assert "geometry" not in event
    assert event["live"]["robot"]["x"] == 13.0

    # Same raw object: nothing sent; unsubscribing removes the listener
    roborock.notify()
    await client.send_json({"id": 6, "type": "unsubscribe_events", "subscription": 5})
    msg = await client.receive_json()
    assert msg["id"] == 6 and msg["success"]
    assert roborock.listeners == []


async def test_unload_resets_subscriptions(
    hass: HomeAssistant, hass_ws_client, setup: MockConfigEntry, roborock: FakeCoordinator
) -> None:
    client = await hass_ws_client(hass)
    await _subscribe(client)
    assert await hass.config_entries.async_unload(setup.entry_id)
    event = (await client.receive_json())["event"]
    assert event == {"reset": True}
    assert roborock.listeners == []


async def test_card_resource(hass: HomeAssistant, roborock: FakeCoordinator) -> None:
    assert await async_setup_component(hass, "lovelace", {})
    resources = hass.data["lovelace"].resources
    lovelace = hass.data["lovelace"]
    hass.data["lovelace"] = SimpleNamespace(resource_mode="storage", resources=resources)
    entry = MockConfigEntry(domain=DOMAIN, title="Vacuum Map")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert [item["url"] for item in resources.async_items()] == [f"{CARD_URL}?v={VERSION}"]
    await hass.config_entries.async_remove(entry.entry_id)
    assert list(resources.async_items()) == []
    hass.data["lovelace"] = lovelace


async def test_diagnostics(hass: HomeAssistant, setup: MockConfigEntry) -> None:
    from custom_components.vacuum_map.diagnostics import async_get_config_entry_diagnostics

    data = await async_get_config_entry_diagnostics(hass, setup)
    item = data["devices"][0]["maps"][0]
    assert item["size"] == [22, 12]
    assert item["rooms"] == {1: 1, 2: 1}
    assert item["raw_gzip_base64"]


async def test_live_positions_while_cleaning_locally(
    hass: HomeAssistant, hass_ws_client, setup: MockConfigEntry, roborock: FakeCoordinator, monkeypatch
) -> None:
    """While a card follows a vacuum cleaning on the local network, its map content is read every LIVE_INTERVAL."""
    monkeypatch.setattr("custom_components.vacuum_map.live.MIN_LIVE_INTERVAL", 0.01)
    hass.config_entries.async_update_entry(setup, options={"live_interval": 0.01})
    moves = iter(range(20700, 30000, 50))

    class Trait(SimpleNamespace):
        async def refresh(self) -> None:
            roborock.map_data.vacuum_position = _point(next(moves), 22900, 0)
            self.raw_api_response = raw_map(apartment())
            self.map_data = roborock.map_data

    roborock.properties_api.map_content = Trait(raw_api_response=None, map_data=None)
    full = []

    async def full_refresh() -> None:
        full.append(1)

    roborock.properties_api.home.refresh = full_refresh
    roborock.properties_api.status = SimpleNamespace(in_cleaning=1)
    roborock._device = SimpleNamespace(is_local_connected=True)
    client = await hass_ws_client(hass)
    await _subscribe(client)
    event = (await client.receive_json())["event"]
    assert event["live"]["robot"]["x"] > 12.0
    assert full == []  # the cleaning was already going on: no full reading
    await client.send_json({"id": 6, "type": "unsubscribe_events", "subscription": 5})
    await client.receive_json()


async def test_full_map_read_when_a_cleaning_starts(
    hass: HomeAssistant, hass_ws_client, setup: MockConfigEntry, roborock: FakeCoordinator, monkeypatch
) -> None:
    monkeypatch.setattr("custom_components.vacuum_map.live.MIN_LIVE_INTERVAL", 0.01)
    monkeypatch.setattr("custom_components.vacuum_map.live.IDLE_INTERVAL", 0.01)
    hass.config_entries.async_update_entry(setup, options={"live_interval": 0.01})
    status = SimpleNamespace(in_cleaning=0)
    roborock.properties_api.status = status
    roborock._device = SimpleNamespace(is_local_connected=True)
    started = asyncio.Event()

    async def full_refresh() -> None:
        started.set()

    async def position() -> None:
        pass

    roborock.properties_api.home.refresh = full_refresh
    roborock.properties_api.map_content = SimpleNamespace(raw_api_response=None, map_data=None, refresh=position)
    client = await hass_ws_client(hass)
    await _subscribe(client)
    status.in_cleaning = 1  # the cleaning starts
    await asyncio.wait_for(started.wait(), 2)


async def test_options_flow(hass: HomeAssistant, setup: MockConfigEntry) -> None:
    result = await hass.config_entries.options.async_init(setup.entry_id)
    assert result["type"] == "form"
    result = await hass.config_entries.options.async_configure(result["flow_id"], {"live_interval": 3})
    assert result["type"] == "create_entry"
    assert setup.options == {"live_interval": 3}
