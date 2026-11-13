"""Diagnostics: what the card receives, and the raw maps to reproduce a rendering issue."""

from __future__ import annotations

import base64
import gzip
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .geometry import parse_grid, vectorize
from .source import current_map_flag, list_maps, map_content, roborock_coordinators


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    devices = []
    for coordinator in roborock_coordinators(hass):
        maps = []
        for ref in list_maps(coordinator):
            content = map_content(coordinator, ref.map_flag)
            raw = getattr(content, "raw_api_response", None)
            item: dict[str, Any] = {"map": ref.map_flag, "has_raw": raw is not None}
            if raw is not None:
                grid = await hass.async_add_executor_job(parse_grid, raw)
                if grid is not None:
                    geometry = await hass.async_add_executor_job(vectorize, grid)
                    item["size"] = [grid.width, grid.height]
                    item["rooms"] = {number: len(rings) for number, rings in geometry.rooms.items()}
                    item["wall_rings"] = len(geometry.walls)
                # The floor plan only, no name: lets the card be tested on this map
                item["raw_gzip_base64"] = base64.b64encode(gzip.compress(raw)).decode()
            maps.append(item)
        devices.append({"current_map": current_map_flag(coordinator), "maps": maps})
    return {"devices": devices}
