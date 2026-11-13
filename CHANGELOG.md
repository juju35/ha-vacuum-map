# Changelog

## 1.0.0 - 2026-11-13

### Features
- Vacuum Map integration: reads the maps the official Roborock integration already fetches (no extra cloud or device traffic) and turns them into vectors — the outline of each room, the floor and the walls, simplified so the edges are clean instead of pixelated.
- `custom:vacuum-map-card`, served and registered by the integration: rooms in soft colors with their name and an icon guessed from the name, walls, doors, dock, no-go and no-mop zones, virtual walls and, optionally, obstacles.
- Live: the robot travels the new part of its path between two map updates (about every 30 s while cleaning) instead of jumping, the path grows behind it, and the room being cleaned stands out.
- Options: `rotation` (0, 90, 180, 270), `show_labels`, `show_path`, `show_zones`, `show_obstacles`, `rooms` (name, icon, color or hidden per room), `map`, `max_height`; visual editor.
- Room names too wide for their room show the icon alone, with the name as a tooltip.
- Diagnostics include the raw maps, to reproduce a rendering issue.
- Translations: English, French, German, Spanish, Italian, Dutch, Portuguese, Polish, Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian, Greek, Serbian (Cyrillic and Latin).
