# Changelog

## 1.5.0 - 2026-11-13

### Improvements
- The robot and its path every second while it cleans on the local network (was 5 s): only the map content is read (robot, path, zones), one local request at a time — a reading that takes longer delays the next one, never stacks. The interval is an option of the integration (**Configure**, 1 to 30 s).
- When a cleaning starts, the whole map is read once (maps, map content, rooms), so that the cleaning starts from an up to date floor plan; the rooms and walls are not read again during the cleaning.
- The first move of the robot after the card opens no longer crawls (it was spread over 30 s until two updates had been seen).

## 1.4.1 - 2026-11-13

### Fixes
- Room names no longer cover each other: the small rooms keep their label in their center, a larger room moves its label to the nearest free spot inside it.
- No focus ring on the full screen button after closing the full screen with a tap: the focus only goes back to it for the keyboard.

## 1.4.0 - 2026-11-13

### Improvements
- Robot position every 5 s instead of 30 s while it cleans: as long as a card follows a vacuum reachable on the local network, Vacuum Map reads its map content more often (one local request, no cloud). The Roborock integration's own 30 s reading goes on as before; a vacuum only reachable through the cloud is not asked more often. The robot on the map is now about 5 s behind the real one instead of 30 s.
- The robot turns smoothly towards where it goes instead of snapping round.

## 1.3.0 - 2026-11-13

### Improvements
- Strips the vacuum saw through a window and labelled as a room (a balcony beyond the living room, a terrace beyond the kitchen) are cut: a part of a room narrower than about 65 cm that touches no other room goes, and the wall follows the cut. Corridors and passages, next to other rooms, stay.

### Fixes
- 3D view: a shape three.js cannot build is left out (and logged in the browser console) instead of leaving the whole map empty but for the path and the robot.

## 1.2.0 - 2026-11-13

### Improvements
- A clean floor plan, as in the Roborock app. The map is cleaned before it is traced:
  - no more spots on the floors: what is enclosed by a single room (furniture, specks, the outlines of furniture, up to 10 m²) belongs to that room, and so do narrow gaps (up to 25 cm) and furniture against a wall (the same room on three sides within 2 m);
  - walls are a band around the rooms, drawn even where the vacuum saw through a window, and smoothed like the rooms; doors between two rooms stay open;
  - what the vacuum saw beyond the rooms (balcony through a window, unsegmented floor, blocked areas) is no longer drawn.

## 1.1.1 - 2026-11-13

### Fixes
- Smoother robot: it now always moves on from where it is shown, along the new part of its path, until the next map update. It jumped when the map image changed while cleaning (the whole map was sent and drawn again, and the move started over) and when Roborock shortened its path (the new path was no longer taken for the same cleaning).
- The rooms are only sent again when they change: the area the robot scans while cleaning no longer counts.

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
