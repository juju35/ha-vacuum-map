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
# Wall shapes thicker than this on average (pixels) are blocked areas (furniture, places the robot cannot reach),
# not walls: a wall of the map is one or two pixels thick
MAX_WALL_THICKNESS = 3.0
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
    blocked: list[list[float]] = field(default_factory=list)
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


def vectorize(grid: Grid) -> Geometry:
    """Polygons of every room, of the floor outside rooms, and of the walls."""
    width, height, labels = grid.width, grid.height, grid.labels
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
        # Walls keep their detail: a wall is one or two pixels thick
        tolerance = 0.5 if label == WALL else SIMPLIFY_TOLERANCE
        rings = [ring for raw_ring in _trace(bucket) if (ring := simplify(raw_ring, tolerance))]
        if not rings:
            continue
        if label == WALL:
            geometry.walls, geometry.blocked = split_walls(rings)
        elif label == FLOOR:
            geometry.floor = rings
        else:
            geometry.rooms[label] = rings
            sx, sy, count = sums[label]
            geometry.areas[label] = round(count * (MM_PER_PIXEL / 1000) ** 2, 1)
            geometry.centers[label] = _label_point(labels, width, label, sx / count, sy / count)
    return geometry


def _signed_area(flat: list[float]) -> float:
    total = 0.0
    count = len(flat)
    for i in range(0, count, 2):
        j = (i + 2) % count
        total += flat[i] * flat[j + 1] - flat[j] * flat[i + 1]
    return total / 2


def _perimeter(flat: list[float]) -> float:
    count = len(flat)
    return sum(math.dist(flat[i : i + 2], flat[(i + 2) % count : (i + 2) % count + 2]) for i in range(0, count, 2))


def _inside(flat: list[float], x: float, y: float) -> bool:
    inside = False
    count = len(flat)
    for i in range(0, count, 2):
        j = (i - 2) % count
        xi, yi, xj, yj = flat[i], flat[i + 1], flat[j], flat[j + 1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
    return inside


def split_walls(rings: list[list[float]]) -> tuple[list[list[float]], list[list[float]]]:
    """Thin shapes (walls) and thick ones (blocked areas), each shape being an outer ring with its holes.

    Rings are traced with the inside on their right: outer rings have a positive area (y down), holes a negative one.
    """
    shapes = [[ring] for ring in rings if _signed_area(ring) > 0]
    for hole in (ring for ring in rings if _signed_area(ring) <= 0):
        owners = [shape for shape in shapes if _inside(shape[0], hole[0], hole[1])]
        if owners:
            min(owners, key=lambda shape: _signed_area(shape[0])).append(hole)
    walls: list[list[float]] = []
    blocked: list[list[float]] = []
    for shape in shapes:
        area = sum(_signed_area(ring) for ring in shape)
        thickness = 2 * area / (sum(_perimeter(ring) for ring in shape) or 1)
        (blocked if thickness > MAX_WALL_THICKNESS else walls).extend(shape)
    return walls, blocked


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
        "blocked": geometry.blocked,
    }
