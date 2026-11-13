"""Faster robot positions while a card is open: the map content read from the robot every LIVE_INTERVAL.

The Roborock integration reads the map every 30 s while cleaning. While at least one card follows a vacuum that is
cleaning and reachable on the local network, the map content alone (one local request, no cloud) is read more often.
Nothing changes for a vacuum only reachable through the cloud (its rate limits), or when no card is open.
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable
from typing import Any

from homeassistant.core import HomeAssistant, callback

_LOGGER = logging.getLogger(__name__)

LIVE_INTERVAL = 5  # seconds
LIVE_TIMEOUT = 10


def is_cleaning(coordinator: Any) -> bool:
    status = getattr(getattr(coordinator, "properties_api", None), "status", None)
    return bool(getattr(status, "in_cleaning", None))


def is_local(coordinator: Any) -> bool:
    device = getattr(coordinator, "_device", None)
    return bool(getattr(device, "is_local_connected", False))


class LivePoller:
    """One reading loop per vacuum, while cards follow it."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._listeners: dict[int, set[Callable[[], None]]] = {}
        self._tasks: dict[int, asyncio.Task] = {}

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

    async def _run(self, key: int, coordinator: Any) -> None:
        trait = getattr(getattr(coordinator, "properties_api", None), "map_content", None)
        if trait is None or not hasattr(trait, "refresh"):
            return
        while self._listeners.get(key):
            await asyncio.sleep(LIVE_INTERVAL)
            if not self._listeners.get(key) or not is_cleaning(coordinator) or not is_local(coordinator):
                continue
            before = trait.raw_api_response
            try:
                async with asyncio.timeout(LIVE_TIMEOUT):
                    await trait.refresh()
            except Exception as err:  # noqa: BLE001 - the 30 s maps of the integration go on anyway
                _LOGGER.debug("Live map refresh failed: %s", err)
                continue
            if trait.raw_api_response is not before:
                for listener in list(self._listeners.get(key, ())):
                    listener()
        self._listeners.pop(key, None)
        self._tasks.pop(key, None)
