"""Constants for the Vacuum Map integration."""

DOMAIN = "vacuum_map"
VERSION = "1.5.0"

# The card, served by the integration and added to the dashboard resources
CARD_URL = f"/{DOMAIN}/vacuum-map-card.js"
# three.js, loaded by the card only for the 3D view
THREE_URL = f"/{DOMAIN}/vendor/three.min.js"

# hass.data[DOMAIN] keys
DATA_CACHE = "cache"
DATA_SUBSCRIPTIONS = "subscriptions"
DATA_LIVE = "live"

# Robot position and path while cleaning on the local network, in seconds (options)
CONF_LIVE_INTERVAL = "live_interval"
DEFAULT_LIVE_INTERVAL = 1
MIN_LIVE_INTERVAL = 1
MAX_LIVE_INTERVAL = 30
