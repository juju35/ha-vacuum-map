"""A demo apartment as the card receives it: geometry and a cleaning run, written as JSON.

Used by the screenshots and to try the card without a vacuum: python scripts/demo_map.py > demo.json
No family name, no real floor plan: a made-up apartment.
"""

from __future__ import annotations

import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tests"))

from maps import WALL, raw_map, room  # noqa: E402

from custom_components.vacuum_map.geometry import geometry_payload, parse_grid, vectorize  # noqa: E402

W, H = 300, 190
ROOMS = {
    # number: (name, rectangles x0, y0, x1, y1 in px, 1 px = 5 cm)
    1: ("Master bedroom", [(10, 10, 95, 75)]),
    2: ("Toilet", [(97, 10, 120, 42)]),
    3: ("Bathroom", [(122, 10, 160, 42)]),
    4: ("Hallway", [(97, 44, 205, 70)]),
    5: ("Entrance", [(207, 8, 290, 70), (207, 70, 250, 95)]),
    6: ("Living room", [(10, 77, 80, 178)]),
    7: ("Dining room", [(82, 72, 140, 140)]),
    8: ("Kitchen", [(82, 142, 140, 178)]),
    9: ("Bedroom", [(142, 72, 200, 178)]),
    10: ("Kids room", [(202, 97, 290, 178)]),
}
DOORS = [
    (96, 30, 2, 0),
    (60, 76, 0, 2),
    (121, 25, 2, 0),
    (130, 43, 0, 2),
    (150, 71, 0, 2),
    (170, 71, 0, 2),
    (206, 40, 2, 0),
    (230, 96, 0, 2),
    (81, 100, 2, 0),
    (110, 141, 0, 2),
    (141, 110, 2, 0),
]


def build() -> bytes:
    rows = [[0] * W for _ in range(H)]
    for number, (_, rects) in ROOMS.items():
        for x0, y0, x1, y1 in rects:
            for y in range(y0 - 2, y1 + 2):
                for x in range(x0 - 2, x1 + 2):
                    if 0 <= x < W and 0 <= y < H and rows[y][x] == 0:
                        rows[y][x] = WALL
            for y in range(y0, y1):
                for x in range(x0, x1):
                    rows[y][x] = room(number)
    for x, y, dx, _dy in DOORS:  # 80 cm openings in the walls
        for i in range(16):
            for j in range(3):
                px, py = (x + j * (dx > 0) - (dx > 0), y + i - 8) if dx else (x + i - 8, y + j - 1)
                if 0 <= px < W and 0 <= py < H and rows[py][px] == WALL:
                    rows[py][px] = room(
                        next(
                            n
                            for n, (_, r) in ROOMS.items()
                            for a, b, c, d in r
                            if a - 3 <= px <= c + 2 and b - 3 <= py <= d + 2
                        )
                    )
    rng = random.Random(4)
    for _ in range(60):  # furniture legs: specks the card must ignore
        x, y = rng.randrange(12, 288), rng.randrange(12, 176)
        if rows[y][x] & 7 == 7:
            rows[y][x] = WALL
    return raw_map(rows)


def serpentine(x0: float, y0: float, x1: float, y1: float, step: float = 3.0) -> list[float]:
    flat, y, right = [], y0, True
    while y <= y1:
        flat += [x0, y, x1, y] if right else [x1, y, x0, y]
        right, y = not right, y + step
    return flat


def payload() -> dict:
    raw = build()
    grid = parse_grid(raw)
    geometry = vectorize(grid)
    names = {number: name for number, (name, _) in ROOMS.items()}
    path = [*serpentine(12, 80, 78, 176), 80, 120, 84, 120, *serpentine(85, 75, 137, 118)]
    robot = {"x": path[-2], "y": path[-1], "a": 0}
    live = {
        "robot": robot,
        "charger": {"x": 111, "y": 175},
        "room": 7,
        "path": [path],
        "mop_path": [],
        "no_go": [[100, 150, 120, 150, 120, 165, 100, 165]],
        "no_mop": [],
        "virtual_walls": [],
        "obstacles": [],
    }
    return {"map": 0, "geometry": geometry_payload(geometry, names), "live": live}


if __name__ == "__main__":
    json.dump(payload(), sys.stdout)
