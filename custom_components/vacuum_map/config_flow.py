"""Config flow: nothing to enter, the maps come from the Roborock integration."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN
from .source import ROBOROCK


class VacuumMapConfigFlow(ConfigFlow, domain=DOMAIN):
    """Single entry, set up from the UI."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if not self.hass.config_entries.async_entries(ROBOROCK):
            return self.async_abort(reason="no_roborock")
        if user_input is not None:
            return self.async_create_entry(title="Vacuum Map", data={})
        return self.async_show_form(step_id="user")
