"""Geometry: raw map parsing and vectorization."""

from custom_components.vacuum_map.geometry import FLOOR, OUTSIDE, WALL, parse_grid, simplify, vectorize

from .maps import apartment, raw_map, room


def _bounds(rings: list[list[float]]) -> tuple[float, float, float, float]:
    xs = [v for ring in rings for v in ring[0::2]]
    ys = [v for ring in rings for v in ring[1::2]]
    return min(xs), min(ys), max(xs), max(ys)


def test_parse_grid_flips_rows_and_labels() -> None:
    grid = parse_grid(raw_map(apartment()))
    assert grid is not None
    assert (grid.width, grid.height, grid.left, grid.top) == (22, 12, 400, 450)
    assert grid.labels[0] == WALL
    assert grid.labels[1 * 22 + 1] == 1
    assert grid.labels[1 * 22 + 12] == 2
    assert grid.labels[5 * 22 + 11] == 2  # door pixel belongs to room 2


def test_parse_grid_rejects_garbage() -> None:
    assert parse_grid(b"") is None
    assert parse_grid(b"\x00" * 64) is None


def test_floor_and_outside_labels() -> None:
    rows = [[0, FLOOR_PIXEL := 0xFF, 0x07, room(3)]]
    grid = parse_grid(raw_map(rows))
    assert grid is not None
    assert grid.labels == [OUTSIDE, FLOOR, FLOOR, 3]
    assert FLOOR_PIXEL == 0xFF


def test_vectorize_rooms_are_rectangles() -> None:
    geometry = vectorize(parse_grid(raw_map(apartment())))
    assert set(geometry.rooms) == {1, 2}
    # Room 1 is x 1..11, y 1..11 on the pixel grid: one simplified ring of 4 corners
    assert len(geometry.rooms[1]) == 1
    assert _bounds(geometry.rooms[1]) == (1, 1, 11, 11)
    assert len(geometry.rooms[1][0]) == 8
    # Room 2 has the door bump into the wall column
    assert _bounds(geometry.rooms[2]) == (11, 1, 21, 11)
    assert geometry.areas[1] == round(100 * 0.05**2, 1)
    cx, cy = geometry.centers[1]
    assert 4 < cx < 7 and 4 < cy < 7


def test_vectorize_walls_keep_the_door() -> None:
    geometry = vectorize(parse_grid(raw_map(apartment())))
    assert geometry.walls
    # The wall ring set covers the whole outline
    assert _bounds(geometry.walls) == (0, 0, 22, 12)
    # No wall vertex inside the door opening (x 11..12, y 4..7 exclusive)
    for ring in geometry.walls:
        for x, y in zip(ring[0::2], ring[1::2], strict=True):
            assert not (11 < x < 12 and 4 < y < 7)


def test_simplify_staircase_becomes_diagonal() -> None:
    # A staircase of 1 px steps, closed by two long edges
    ring = [(0, 0)]
    for i in range(10):
        ring += [(i + 1, i), (i + 1, i + 1)]
    ring += [(0, 10)]
    flat = simplify(ring, 0.9)
    assert flat is not None
    assert len(flat) // 2 <= 4


def test_to_image() -> None:
    grid = parse_grid(raw_map(apartment()))
    # Pixel (left + 2, top + 3) from the bottom = image x 2, y height - 3
    assert grid.to_image((400 + 2) * 50, (450 + 3) * 50) == (2, 9)


def test_furniture_inside_a_room_is_filled() -> None:
    rows = apartment()
    for y in range(3, 7):  # a 4 x 4 block of furniture and a speck in room 1
        for x in range(3, 7):
            rows[y][x] = 0x01
    rows[9][8] = 0x00
    geometry = vectorize(parse_grid(raw_map(rows)))
    assert len(geometry.rooms[1]) == 1  # no hole
    assert _bounds(geometry.walls) == (0, 0, 22, 12)


def test_walls_are_a_band_around_the_rooms() -> None:
    rows = [[0] * 30 for _ in range(16)]
    for y in range(4, 12):
        for x in range(4, 26):
            rows[y][x] = room(1)
    for y in range(4, 12):  # what the vacuum saw through a window: floor beyond the room, no wall
        for x in range(26, 30):
            rows[y][x] = 0xFF
    geometry = vectorize(parse_grid(raw_map(rows)))
    assert geometry.floor == []
    # a wall all around, 2 px from the room, also on the window side
    assert _bounds(geometry.walls) == (2, 2, 28, 14)


def test_digest_ignores_scanned_pixels() -> None:
    # A room pixel becoming scanned floor changes the geometry; floor becoming scanned floor does not
    rows = apartment()
    first = parse_grid(raw_map(rows))
    rows[5][5] = 0x07
    assert parse_grid(raw_map(rows)).digest != first.digest
    outside = [[0xFF, 0x07, room(3)]]
    scanned = [[0x07, 0xFF, room(3)]]
    assert parse_grid(raw_map(outside)).digest == parse_grid(raw_map(scanned)).digest


def test_strip_seen_through_a_window_is_cut_corridor_kept() -> None:
    rows = [[0] * 60 for _ in range(40)]
    for y in range(5, 25):
        for x in range(5, 25):
            rows[y][x] = room(1)
        for x in range(30, 55):
            rows[y][x] = room(2)
    for y in range(25, 38):  # a 6 px (30 cm) strip of room 1 going out through a window, touching nothing
        for x in range(12, 18):
            rows[y][x] = room(1)
    for y in range(25, 35):  # a 10 px (50 cm) corridor of room 2 running along room 1, behind a 2 px wall
        for x in range(30, 40):
            rows[y][x] = room(2)
        for x in range(20, 28):
            rows[y][x] = room(1)
    geometry = vectorize(parse_grid(raw_map(rows)))
    strip = [ring for ring in geometry.rooms[1] if max(ring[1::2]) > 36]
    assert not strip  # the strip is gone
    assert _bounds(geometry.rooms[2])[3] >= 34  # the corridor stays
