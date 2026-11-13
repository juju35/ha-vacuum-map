"""The robot and its path, almost live, while a card is open on a vacuum cleaning on the local network.

The Roborock integration reads the whole map every 30 s while cleaning. While at least one card follows a vacuum
that is cleaning and reachable on the local network:
- when the cleaning starts, the whole map is read once (maps, map content, rooms), so that it starts from an up to
  date floor plan;
- then only the map content is read (robot, path, zones: one local request, no cloud), every `live_interval`
  seconds (1 by default, options), start to start; a reading that takes longer delays the next one, never stacks.
Nothing changes for a vacuum only reachable through the cloud (its rate limits), or when no card is open.
"""

from __future__ import annotations

import asyncio
import logging
import time
from collections.abc import Callable
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback

from .const import CONF_LIVE_INTERVAL, DEFAULT_LIVE_INTERVAL, MIN_LIVE_INTERVAL

_LOGGER = logging.getLogger(__name__)

LIVE_TIMEOUT = 10
# While the vacuum does not clean: how often to check whether it started
IDLE_INTERVAL = 2


def is_cleaning(coordinator: Any) -> bool:
    status = getattr(getattr(coordinator, "properties_api", None), "status", None)
    return bool(getattr(status, "in_cleaning", None))


def is_local(coordinator: Any) -> bool:
    device = getattr(coordinator, "_device", None)
    return bool(getattr(device, "is_local_connected", False))


class LivePoller:
    """One reading loop per vacuum, while cards follow it."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self._listeners: dict[int, set[Callable[[], None]]] = {}
        self._tasks: dict[int, asyncio.Task] = {}

    @property
    def interval(self) -> float:
        return max(float(self.entry.options.get(CONF_LIVE_INTERVAL, DEFAULT_LIVE_INTERVAL)), MIN_LIVE_INTERVAL)

    @callback
    def add(self, coordinator: Any, listener: Callable[[], None]) -> Callable[[], None]:
        key = id(coordinator)
        self._listeners.setdefault(key, set()).add(listener)
        if key not in self._tasks or self._tasks[key].done():
            self._tasks[key] = self.hass.async_create_background_task(
                self._run(key, coordinator), "vacuum_map live position"
            )

        @callback
        def remove() -> None:
            self._listeners.get(key, set()).discard(listener)

        return remove

    @callback
    def stop(self) -> None:
        for task in self._tasks.values():
            task.cancel()
        self._tasks.clear()
        self._listeners.clear()

    def _notify(self, key: int) -> None:
        for listener in list(self._listeners.get(key, ())):
            listener()

    async def _read(self, what: str, refresh: Callable[[], Any]) -> bool:
        try:
            async with asyncio.timeout(LIVE_TIMEOUT):
                await refresh()
        except Exception as err:  # noqa: BLE001 - the 30 s maps of the integration go on anyway
            _LOGGER.debug("Live %s refresh failed: %s", what, err)
            return False
        return True

    async def _run(self, key: int, coordinator: Any) -> None:
        api = getattr(coordinator, "properties_api", None)
        trait = getattr(api, "map_content", None)
        home = getattr(api, "home", None)
        if trait is None or not hasattr(trait, "refresh"):
            return
        was_cleaning = is_cleaning(coordinator)
        while self._listeners.get(key):
            started = time.monotonic()
            cleaning = is_cleaning(coordinator)
            if cleaning and is_local(coordinator):
                if not was_cleaning and home is not None and hasattr(home, "refresh"):
                    # A cleaning starts: the whole map once (maps, content, rooms)
                    if await self._read("map", home.refresh):
                        self._notify(key)
                else:
                    before = trait.raw_api_response
                    if await self._read("position", trait.refresh) and trait.raw_api_response is not before:
                        self._notify(key)
            was_cleaning = cleaning
            pause = self.interval if cleaning else max(self.interval, IDLE_INTERVAL)
            await asyncio.sleep(max(0.0, pause - (time.monotonic() - started)))
        self._listeners.pop(key, None)
        self._tasks.pop(key, None)
