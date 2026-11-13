"""Maps of the official Roborock integration, turned into the payload the card draws.

The Roborock integration already fetches and parses the maps (its coordinators, one per device, refresh them about
every 30 s while cleaning); this module only reads them: no extra cloud or device traffic.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .geometry import Geometry, Grid, parse_grid, vectorize

_LOGGER = logging.getLogger(__name__)

ROBOROCK = "roborock"


@dataclass
class MapRef:
    """One map of one Roborock device."""

    coordinator: Any
    map_flag: int
    name: str


def roborock_coordinators(hass: HomeAssistant) -> list[Any]:
    """The V1 coordinators of every loaded Roborock entry."""
    coordinators: list[Any] = []
    for entry in hass.config_entries.async_entries(ROBOROCK):
        if entry.state is ConfigEntryState.LOADED and (data := getattr(entry, "runtime_data", None)):
            coordinators.extend(getattr(data, "v1", None) or [])
    return coordinators


def _identifiers(coordinator: Any) -> set[tuple[str, str]]:
    info = getattr(coordinator, "device_info", None) or {}
    return set(info.get("identifiers") or ())


def coordinator_for_entity(hass: HomeAssistant, entity_id: str) -> Any | None:
    """The Roborock coordinator of the device that owns a vacuum entity."""
    entity = er.async_get(hass).async_get(entity_id)
    if entity is None or entity.device_id is None:
        return None
    device = dr.async_get(hass).async_get(entity.device_id)
    if device is None:
        return None
    for coordinator in roborock_coordinators(hass):
        if _identifiers(coordinator) & device.identifiers:
            return coordinator
        duid = getattr(coordinator, "duid", None)
        if duid and (ROBOROCK, duid) in device.identifiers:
            return coordinator
    return None


def _home(coordinator: Any) -> Any | None:
    api = getattr(coordinator, "properties_api", None)
    return getattr(api, "home", None) if api is not None else None


def current_map_flag(coordinator: Any) -> int | None:
    api = getattr(coordinator, "properties_api", None)
    maps = getattr(api, "maps", None) if api is not None else None
    return getattr(maps, "current_map", None)


def list_maps(coordinator: Any) -> list[MapRef]:
    if (home := _home(coordinator)) is None:
        return []
    return [
        MapRef(coordinator, info.map_flag, info.name or f"Map {info.map_flag}")
        for info in (getattr(home, "home_map_info", None) or {}).values()
    ]


def map_content(coordinator: Any, map_flag: int) -> Any | None:
    if (home := _home(coordinator)) is None:
        return None
    return (getattr(home, "home_map_content", None) or {}).get(map_flag)


def room_names(coordinator: Any) -> dict[int, str]:
    """Room names from the Roborock app, by segment number."""
    home = _home(coordinator)
    rooms_trait = getattr(home, "_rooms_trait", None) or getattr(home, "rooms", None)
    room_map = getattr(rooms_trait, "room_map", None) or {}
    names = {}
    for number, room in room_map.items():
        name = getattr(room, "name", None)
        if name:
            names[int(number)] = name
    return names


class GeometryCache:
    """Vectorized geometry per map, rebuilt only when the map image changes."""

    def __init__(self) -> None:
        self._cache: dict[tuple[str, int], tuple[bytes, Grid | None, Geometry | None]] = {}

    async def async_get(self, hass: HomeAssistant, key: tuple[str, int], raw: bytes) -> tuple[Grid, Geometry] | None:
        cached = self._cache.get(key)
        if cached is not None and cached[0] is raw:
            return (cached[1], cached[2]) if cached[1] is not None else None
        grid = await hass.async_add_executor_job(parse_grid, raw)
        if grid is None:
            self._cache[key] = (raw, None, None)
            return None
        previous = self._cache.get(key)
        if previous is not None and previous[1] is not None and previous[1].digest == grid.digest:
            geometry = previous[2]  # same image: the robot moved, the rooms did not
        else:
            geometry = await hass.async_add_executor_job(vectorize, grid)
        self._cache[key] = (raw, grid, geometry)
        return grid, geometry


def _point(grid: Grid, point: Any) -> dict[str, float] | None:
    if point is None:
        return None
    x, y = grid.to_image(point.x, point.y)
    out = {"x": round(x, 1), "y": round(y, 1)}
    if (angle := getattr(point, "a", None)) is not None:
        out["a"] = angle
    return out


def _path(grid: Grid, path: Any) -> list[list[float]]:
    if path is None:
        return []
    lines = []
    for line in getattr(path, "path", None) or []:
        flat: list[float] = []
        for point in line:
            x, y = grid.to_image(point.x, point.y)
            flat.extend((round(x, 1), round(y, 1)))
        if flat:
            lines.append(flat)
    return lines


def _areas(grid: Grid, areas: Any) -> list[list[float]]:
    out = []
    for area in areas or []:
        corners = [(area.x0, area.y0), (area.x1, area.y1), (area.x2, area.y2), (area.x3, area.y3)]
        out.append([round(v, 1) for x, y in corners for v in grid.to_image(x, y)])
    return out


def _lines(grid: Grid, walls: Any) -> list[list[float]]:
    return [
        [round(v, 1) for x, y in ((wall.x0, wall.y0), (wall.x1, wall.y1)) for v in grid.to_image(x, y)]
        for wall in walls or []
    ]


def _obstacles(grid: Grid, map_data: Any) -> list[dict[str, Any]]:
    out = []
    for name in ("obstacles", "obstacles_with_photo"):
        for obstacle in getattr(map_data, name, None) or []:
            x, y = grid.to_image(obstacle.x, obstacle.y)
            details = getattr(obstacle, "details", None)
            out.append({"x": round(x, 1), "y": round(y, 1), "type": getattr(details, "description", None)})
    return out


def live_payload(grid: Grid, map_data: Any) -> dict[str, Any]:
    """The moving part: robot, path, zones."""
    mop = getattr(map_data, "mop_path", None)
    return {
        "robot": _point(grid, getattr(map_data, "vacuum_position", None)),
        "charger": _point(grid, getattr(map_data, "charger", None)),
        "room": getattr(map_data, "vacuum_room", None),
        "path": _path(grid, getattr(map_data, "path", None)),
        "mop_path": _path(grid, mop) if mop is not None else [],
        "no_go": _areas(grid, getattr(map_data, "no_go_areas", None)),
        "no_mop": _areas(grid, getattr(map_data, "no_mopping_areas", None)),
        "virtual_walls": _lines(grid, getattr(map_data, "walls", None)),
        "obstacles": _obstacles(grid, map_data),
    }
