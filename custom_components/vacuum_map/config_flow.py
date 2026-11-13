"""Config flow: nothing to enter, the maps come from the Roborock integration. Options: the live interval."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import CONF_LIVE_INTERVAL, DEFAULT_LIVE_INTERVAL, DOMAIN, MAX_LIVE_INTERVAL, MIN_LIVE_INTERVAL
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

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> VacuumMapOptionsFlow:
        return VacuumMapOptionsFlow()


class VacuumMapOptionsFlow(OptionsFlow):
    """How often the robot and its path are read while it cleans on the local network."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data={CONF_LIVE_INTERVAL: int(user_input[CONF_LIVE_INTERVAL])})
        current = self.config_entry.options.get(CONF_LIVE_INTERVAL, DEFAULT_LIVE_INTERVAL)
        schema = vol.Schema(
            {
                vol.Required(CONF_LIVE_INTERVAL, default=current): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=MIN_LIVE_INTERVAL,
                        max=MAX_LIVE_INTERVAL,
                        step=1,
                        mode=selector.NumberSelectorMode.BOX,
                        unit_of_measurement="s",
                    )
                )
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
