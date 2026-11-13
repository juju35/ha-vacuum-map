"""Synthetic raw Roborock maps for the tests."""

from __future__ import annotations

import struct

WALL = 0x01
FLOOR = 0xFF


def room(number: int) -> int:
    """Raw pixel value of a room segment."""
    return (number << 3) | 0x07


def raw_map(rows: list[list[int]], left: int = 400, top: int = 450) -> bytes:
    """An unpacked map with one image block; rows are given top-down, as on screen."""
    height, width = len(rows), len(rows[0])
    pixels = bytes(value for row in reversed(rows) for value in row)  # stored bottom-up
    header = struct.pack("<HHIIIIII", 2, 28, len(pixels), 0, top, left, height, width)
    map_header = struct.pack("<HHIIII", 0x7272, 20, 0, 0, 0, 0)
    return map_header + header + pixels


def apartment() -> list[list[int]]:
    """Two rooms side by side, a wall around them and a door between them."""
    width, height = 22, 12
    rows = [[0] * width for _ in range(height)]
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            rows[y][x] = room(1) if x < 11 else room(2)
    for x in range(width):
        rows[0][x] = rows[height - 1][x] = WALL
    for y in range(height):
        rows[y][0] = rows[y][width - 1] = WALL
        if not 4 <= y <= 6:
            rows[y][11] = WALL  # the door: no wall on rows 4 to 6
    return rows
