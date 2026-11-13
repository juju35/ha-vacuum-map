"""Vector geometry from a raw Roborock map: rooms, floor and walls as simplified polygons.

Pure Python, no Home Assistant import: everything here is CPU bound and runs in the executor.

Coordinates are map image pixels (1 px = 50 mm), x to the right and y down, the origin being the
top-left corner of the map image. Polygons are rings of vertices on the pixel grid, simplified.
"""

from __future__ import annotations

import hashlib
import math
from array import array
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any

# Raw pixel types of the Roborock image block (vacuum_map_parser_roborock.image_parser)
PIXEL_OUTSIDE = 0x00
PIXEL_WALL = 0x01
PIXEL_INSIDE = 0xFF
PIXEL_SCAN = 0x07

# Labels of the grid
OUTSIDE = 0
WALL = -1
FLOOR = -2  # mapped floor that belongs to no room

BLOCK_IMAGE = 2
# A map pixel is 50 mm: vacuum coordinates are in mm
MM_PER_PIXEL = 50
# Vertices closer than this to the simplified line are dropped (pixels)
SIMPLIFY_TOLERANCE = 0.9
# Cleaning of the map before tracing it (pixels, 1 px = 5 cm):
# - non-room areas enclosed by a single room up to this size (10 m²) are furniture and specks: they become that room
MAX_ISLAND = 4000
# - gaps up to this width between two parts of the same room (furniture legs, notches) are filled
MAX_GAP = 5
# - and what has the same room on three sides within this distance (2 m): furniture against a wall
MAX_REACH = 40
# - parts of a room narrower than 2 × PROTRUSION + 1 that touch no other room within NEIGHBOUR_REACH are cut: what
#   the vacuum saw through a window (a strip of balcony labelled as the room); corridors touch other rooms, they stay
PROTRUSION = 6
NEIGHBOUR_REACH = 6
# - walls are drawn as a band of this width around the rooms, whatever the vacuum saw beyond them (through windows)
WALL_BAND = 2
# Rings smaller than this are noise (pixels², 1 px² = 25 cm²): furniture legs, specks, the holes they leave in rooms
MIN_RING_AREA = 8.0


@dataclass
class Grid:
    """The labelled map image, rows top-down."""

    width: int
    height: int
    left: int
    top: int
    labels: list[int]
    digest: str = ""

    def to_image(self, x_mm: float, y_mm: float) -> tuple[float, float]:
        """Vacuum coordinates (mm) to map image pixels (y down)."""
        return (x_mm / MM_PER_PIXEL - self.left, self.height - (y_mm / MM_PER_PIXEL - self.top))


@dataclass
class Geometry:
    """Polygons of the map, by layer."""

    width: int
    height: int
    rooms: dict[int, list[list[float]]] = field(default_factory=dict)
    centers: dict[int, tuple[float, float]] = field(default_factory=dict)
    areas: dict[int, float] = field(default_factory=dict)
    floor: list[list[float]] = field(default_factory=list)
    walls: list[list[float]] = field(default_factory=list)
    digest: str = ""


def _int16(data: bytes, address: int) -> int:
    return data[address] | (data[address + 1] << 8)


def _int32(data: bytes, address: int) -> int:
    return data[address] | (data[address + 1] << 8) | (data[address + 2] << 16) | (data[address + 3] << 24)


def _label(pixel: int) -> int:
    if pixel in (PIXEL_INSIDE, PIXEL_SCAN):
        return FLOOR
    if pixel == PIXEL_OUTSIDE:
        return OUTSIDE
    if pixel == PIXEL_WALL:
        return WALL
    kind = pixel & 0x07
    if kind == 7:
        return pixel >> 3  # room number
    if kind in (0, 1):
        return WALL  # grey wall, wall v2
    return OUTSIDE


_LABELS = [_label(value) for value in range(256)]


def parse_grid(raw: bytes) -> Grid | None:
    """Find the image block of an (unpacked) Roborock map and label its pixels."""
    if len(raw) < 0x14:
        return None
    position = _int16(raw, 0x02)
    while position + 8 <= len(raw):
        header_length = _int16(raw, position + 0x02)
        header = raw[position : position + header_length]
        if len(header) < 8:
            return None
        block_type = _int16(header, 0x00)
        data_length = _int32(header, 0x04)
        if block_type == BLOCK_IMAGE and header_length >= 24:
            top = _int32(header, header_length - 16)
            left = _int32(header, header_length - 12)
            height = _int32(header, header_length - 8)
            width = _int32(header, header_length - 4)
            data = raw[position + header_length : position + header_length + width * height]
            if width <= 0 or height <= 0 or len(data) < width * height:
                return None
            labels = [0] * (width * height)
            table = _LABELS
            # Raw rows are bottom-up: flip them so the grid reads top-down like the image
            for row in range(height):
                src = (height - 1 - row) * width
                dst = row * width
                labels[dst : dst + width] = [table[value] for value in data[src : src + width]]
            # Digest of the labels, not of the raw pixels: the scanned area grows while cleaning, the rooms stay
            digest = hashlib.blake2b(array("b", labels).tobytes(), digest_size=8).hexdigest()
            return Grid(width, height, left, top, labels, digest)
        position += data_length + header[2]
    return None


def _trace(edges: dict[tuple[int, int], list[tuple[int, int]]]) -> list[list[tuple[int, int]]]:
    """Chain directed boundary edges into closed rings."""
    rings = []
    while edges:
        start, ends = next(iter(edges.items()))
        ring = [start]
        current = ends.pop()
        if not ends:
            del edges[start]
        while current != start:
            ring.append(current)
            nexts = edges.get(current)
            if not nexts:
                break  # open chain: cannot happen on a grid, but never loop forever
            following = nexts.pop()
            if not nexts:
                del edges[current]
            current = following
        if len(ring) >= 4:
            rings.append(ring)
    return rings


def _drop_collinear(ring: list[tuple[int, int]]) -> list[tuple[int, int]]:
    out = []
    count = len(ring)
    for i, point in enumerate(ring):
        prev, nxt = ring[i - 1], ring[(i + 1) % count]
        if (point[0] - prev[0]) * (nxt[1] - point[1]) != (point[1] - prev[1]) * (nxt[0] - point[0]):
            out.append(point)
    return out


def _rdp(points: list[tuple[float, float]], tolerance: float) -> list[tuple[float, float]]:
    """Ramer-Douglas-Peucker on an open polyline (iterative)."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        first, last = stack.pop()
        (x1, y1), (x2, y2) = points[first], points[last]
        dx, dy = x2 - x1, y2 - y1
        norm = math.hypot(dx, dy) or 1.0
        best, index = 0.0, -1
        for i in range(first + 1, last):
            x0, y0 = points[i]
            distance = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / norm
            if distance > best:
                best, index = distance, i
        if best > tolerance and index > 0:
            keep[index] = True
            stack.extend(((first, index), (index, last)))
    return [point for point, kept in zip(points, keep, strict=True) if kept]


def _ring_area(ring: list[tuple[float, float]]) -> float:
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1], strict=True))) / 2


def simplify(ring: list[tuple[int, int]], tolerance: float = SIMPLIFY_TOLERANCE) -> list[float] | None:
    """Simplify a pixel ring; returns flat [x0, y0, x1, y1, …] or None when it is noise."""
    corners = _drop_collinear(ring)
    if len(corners) < 3 or _ring_area(corners) < MIN_RING_AREA:
        return None
    # Split the closed ring at its farthest point from the start, simplify both halves
    start = corners[0]
    far = max(range(len(corners)), key=lambda i: (corners[i][0] - start[0]) ** 2 + (corners[i][1] - start[1]) ** 2)
    first = _rdp(corners[: far + 1], tolerance)
    second = _rdp([*corners[far:], start], tolerance)
    points = first[:-1] + second[:-1]
    if len(points) < 3:
        return None
    return [round(value, 1) for point in points for value in point]


def _nearest_rooms(labels: list[int], width: int, height: int) -> list[list[tuple[int, int]]]:
    """For each pixel, the nearest room pixel to its left, right, top and bottom: (room, distance) or (0, 0)."""
    size = len(labels)
    out = [[(0, 0)] * size for _ in range(4)]
    lines = [(range(y * width, (y + 1) * width), 0, 1) for y in range(height)] + [
        (range(x, size, width), 2, 3) for x in range(width)
    ]
    for line, before, after in lines:
        for target, order in ((out[before], line), (out[after], reversed(line))):
            room, distance = 0, 0
            for i in order:
                if labels[i] > 0:
                    room, distance = labels[i], 0
                else:
                    distance += 1
                    target[i] = (room, distance) if room else (0, 0)
    return out


def _fill_gaps(labels: list[int], width: int, height: int) -> None:
    """Non-room pixels that belong to a room: the same room on both sides within MAX_GAP (furniture legs, notches),
    or the same room on three sides within MAX_REACH (furniture against a wall, kitchen units)."""
    left, right, up, down = _nearest_rooms(labels, width, height)
    filled = []
    for i, value in enumerate(labels):
        if value > 0:
            continue
        sides = (left[i], right[i], up[i], down[i])
        room = 0
        for a, b in ((sides[0], sides[1]), (sides[2], sides[3])):
            if a[0] and a[0] == b[0] and a[1] + b[1] - 1 <= MAX_GAP:
                room = a[0]
        if not room:
            near = [r for r, d in sides if r and d <= MAX_REACH]
            room = next((r for r in set(near) if near.count(r) >= 3), 0)
        if room:
            filled.append((i, room))
    for i, room in filled:
        labels[i] = room


def _fill_islands(labels: list[int], width: int, height: int) -> None:
    """Non-room areas enclosed by a single room (furniture, specks, the black spots of the map) become that room."""
    seen = bytearray(len(labels))
    for start, value in enumerate(labels):
        if value > 0 or seen[start]:
            continue
        seen[start] = 1
        stack = [start]
        component = []
        rooms: set[int] = set()
        border = False
        while stack:
            i = stack.pop()
            component.append(i)
            x, y = i % width, i // width
            if x in (0, width - 1) or y in (0, height - 1):
                border = True
            for j, inside in ((i - 1, x > 0), (i + 1, x < width - 1), (i - width, y > 0), (i + width, y < height - 1)):
                if not inside:
                    continue
                if labels[j] > 0:
                    rooms.add(labels[j])
                elif not seen[j]:
                    seen[j] = 1
                    stack.append(j)
        if not border and len(rooms) == 1 and len(component) <= MAX_ISLAND:
            room = rooms.pop()
            for i in component:
                labels[i] = room


def _grow(mask: bytearray, width: int, height: int, radius: int) -> bytearray:
    """The mask grown by `radius` pixels (square neighbourhood): along the rows, then along the columns."""
    rows = bytearray(len(mask))
    for y in range(height):
        row = y * width
        for x in range(width):
            if any(mask[row + max(0, x - radius) : row + min(width, x + radius + 1)]):
                rows[row + x] = 1
    out = bytearray(len(mask))
    for x in range(width):
        column = rows[x::width]
        for y in range(height):
            if any(column[max(0, y - radius) : y + radius + 1]):
                out[y * width + x] = 1
    return out


def _cut_protrusions(labels: list[int], width: int, height: int) -> None:
    """Cut the narrow parts of each room that reach out into nothing (seen through a window)."""
    r = PROTRUSION
    for room in sorted({value for value in labels if value > 0}):
        cells = [i for i, value in enumerate(labels) if value == room]
        xs = [i % width for i in cells]
        ys = [i // width for i in cells]
        margin = r + NEIGHBOUR_REACH + 1
        x0, y0 = max(0, min(xs) - margin), max(0, min(ys) - margin)
        x1, y1 = min(width, max(xs) + margin + 1), min(height, max(ys) + margin + 1)
        w, h = x1 - x0, y1 - y0
        inside = bytearray(w * h)
        others = bytearray(w * h)
        for y in range(h):
            src = (y0 + y) * width + x0
            for x in range(w):
                value = labels[src + x]
                if value == room:
                    inside[y * w + x] = 1
                elif value > 0:
                    others[y * w + x] = 1
        # opening: shrink then grow back; what does not come back is narrower than 2r + 1
        outside = bytearray(1 - v for v in inside)
        shrunk = bytearray(1 - v for v in _grow(outside, w, h, r))
        kept = _grow(shrunk, w, h, r)
        # A room that is mostly narrow (a corridor on its own) is what it is: nothing to cut
        if sum(kept[i] and inside[i] for i in range(w * h)) < len(cells) / 2:
            continue
        near_others = _grow(others, w, h, NEIGHBOUR_REACH)
        seen = bytearray(w * h)
        for start in range(w * h):
            if not inside[start] or kept[start] or seen[start]:
                continue
            seen[start] = 1
            stack, part, touches = [start], [], False
            while stack:
                i = stack.pop()
                part.append(i)
                touches = touches or bool(near_others[i])
                x, y = i % w, i // w
                for j, ok in ((i - 1, x > 0), (i + 1, x < w - 1), (i - w, y > 0), (i + w, y < h - 1)):
                    if ok and inside[j] and not kept[j] and not seen[j]:
                        seen[j] = 1
                        stack.append(j)
            if not touches:
                for i in part:
                    labels[(y0 + i // w) * width + x0 + i % w] = OUTSIDE


def _wall_band(labels: list[int], width: int, height: int) -> None:
    """Walls: the non-room pixels within WALL_BAND of a room. Everything else is left out (what the vacuum saw through
    windows, unsegmented floor, blocked areas), and there is a wall even where the map has none (a window)."""
    near = _grow(bytearray(1 if value > 0 else 0 for value in labels), width, height, WALL_BAND)
    for i, value in enumerate(labels):
        if value <= 0:
            labels[i] = WALL if near[i] else OUTSIDE


def clean(grid: Grid) -> list[int]:
    """The labels as the card shows them: rooms without spots, walls as a band around them, nothing else."""
    labels = list(grid.labels)
    _fill_gaps(labels, grid.width, grid.height)
    _fill_islands(labels, grid.width, grid.height)
    _cut_protrusions(labels, grid.width, grid.height)
    _wall_band(labels, grid.width, grid.height)
    return labels


def vectorize(grid: Grid) -> Geometry:
    """Polygons of every room and of the walls, from the cleaned labels."""
    width, height, labels = grid.width, grid.height, clean(grid)
    edges: dict[int, dict[tuple[int, int], list[tuple[int, int]]]] = defaultdict(lambda: defaultdict(list))
    sums: dict[int, list[int]] = defaultdict(lambda: [0, 0, 0])

    for y in range(height):
        row = y * width
        for x in range(width):
            label = labels[row + x]
            if label == OUTSIDE:
                continue
            if label > 0:
                total = sums[label]
                total[0] += x
                total[1] += y
                total[2] += 1
            bucket = edges[label]
            # Interior on the right of each directed edge (clockwise with y down)
            if y == 0 or labels[row - width + x] != label:
                bucket[(x, y)].append((x + 1, y))
            if x == width - 1 or labels[row + x + 1] != label:
                bucket[(x + 1, y)].append((x + 1, y + 1))
            if y == height - 1 or labels[row + width + x] != label:
                bucket[(x + 1, y + 1)].append((x, y + 1))
            if x == 0 or labels[row + x - 1] != label:
                bucket[(x, y + 1)].append((x, y))

    geometry = Geometry(width, height, digest=grid.digest)
    for label, bucket in edges.items():
        tolerance = SIMPLIFY_TOLERANCE
        rings = [ring for raw_ring in _trace(bucket) if (ring := simplify(raw_ring, tolerance))]
        if not rings:
            continue
        if label == WALL:
            geometry.walls = rings
        elif label == FLOOR:
            geometry.floor = rings
        else:
            geometry.rooms[label] = rings
            sx, sy, count = sums[label]
            geometry.areas[label] = round(count * (MM_PER_PIXEL / 1000) ** 2, 1)
            geometry.centers[label] = _label_point(labels, width, label, sx / count, sy / count)
    return geometry


def _label_point(labels: list[int], width: int, label: int, cx: float, cy: float) -> tuple[float, float]:
    """Where to put a room's label: its centroid, or its pixel nearest to it when the room is not convex."""
    x, y = int(cx), int(cy)
    if 0 <= y * width + x < len(labels) and labels[y * width + x] == label:
        return (round(cx, 1), round(cy, 1))
    best, point = math.inf, (cx, cy)
    for index, value in enumerate(labels):
        if value == label:
            px, py = index % width, index // width
            distance = (px - cx) ** 2 + (py - cy) ** 2
            if distance < best:
                best, point = distance, (px + 0.5, py + 0.5)
    return (round(point[0], 1), round(point[1], 1))


def geometry_payload(geometry: Geometry, names: dict[int, str]) -> dict[str, Any]:
    """The static part: changes only when the map itself changes."""
    return {
        "id": geometry.digest,
        "size": [geometry.width, geometry.height],
        "rooms": [
            {
                "id": number,
                "name": names.get(number) or f"Room {number}",
                "rings": rings,
                "center": list(geometry.centers.get(number, (0, 0))),
                "area": geometry.areas.get(number),
            }
            for number, rings in sorted(geometry.rooms.items())
        ],
        "floor": geometry.floor,
        "walls": geometry.walls,
    }
