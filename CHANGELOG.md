# Changelog

## 1.1.0 - 2026-11-13

### Features
- **3D view**: the floors in their colors, the walls raised (doors stay open), the dock, the zones, the path and the robot moving on it, rendered with three.js — served by the integration and only loaded when the 3D view is opened. Drag to turn around the map, wheel or pinch to zoom, double-click to come back to the start view. `view: 3d` opens the card in 3D; the **2D / 3D** button switches (`show_view_toggle: false` hides it).
- **Full screen** button in the header, as on the weather card: the map at its largest over the page, in 2D or 3D; ✕, Escape or the back button close it (`show_fullscreen: false` hides the button).
- `embedded: true` option: the map alone, without card background, padding nor header, for another card that shows it. [ha-vacuum-card](https://github.com/juju35/ha-vacuum-card) uses it to draw this map instead of the Roborock map picture.

### Fixes
- Room names too wide for their room are cut with "…" at the room's width, as in the Roborock app, instead of showing the icon alone; only a very small room keeps the icon alone. The full name stays as a tooltip.
- Thick shapes of the wall layer (furniture, places out of reach) are no longer drawn as walls: they are drawn faintly, like the floor, and stay flat in 3D. Only thin shapes are walls.

## 1.0.0 - 2026-11-13

### Features
- Vacuum Map integration: reads the maps the official Roborock integration already fetches (no extra cloud or device traffic) and turns them into vectors — the outline of each room, the floor and the walls, simplified so the edges are clean instead of pixelated.
- `custom:vacuum-map-card`, served and registered by the integration: rooms in soft colors with their name and an icon guessed from the name, walls, doors, dock, no-go and no-mop zones, virtual walls and, optionally, obstacles.
- Live: the robot travels the new part of its path between two map updates (about every 30 s while cleaning) instead of jumping, the path grows behind it, and the room being cleaned stands out.
- Options: `rotation` (0, 90, 180, 270), `show_labels`, `show_path`, `show_zones`, `show_obstacles`, `rooms` (name, icon, color or hidden per room), `map`, `max_height`; visual editor.
- Room names too wide for their room show the icon alone, with the name as a tooltip.
- Diagnostics include the raw maps, to reproduce a rendering issue.
- Translations: English, French, German, Spanish, Italian, Dutch, Portuguese, Polish, Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian, Greek, Serbian (Cyrillic and Latin).
