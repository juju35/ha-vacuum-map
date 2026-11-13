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


def test_thick_wall_shapes_are_blocked_areas() -> None:
    rows = apartment()
    for y in range(2, 10):  # an 8 x 8 block in room 1: furniture, not a wall
        for x in range(2, 10):
            rows[y][x] = 0x01
    geometry = vectorize(parse_grid(raw_map(rows)))
    assert _bounds(geometry.blocked) == (2, 2, 10, 10)
    assert _bounds(geometry.walls) == (0, 0, 22, 12)


def test_digest_ignores_scanned_pixels() -> None:
    # A room pixel becoming scanned floor changes the geometry; floor becoming scanned floor does not
    rows = apartment()
    first = parse_grid(raw_map(rows))
    rows[5][5] = 0x07
    assert parse_grid(raw_map(rows)).digest != first.digest
    outside = [[0xFF, 0x07, room(3)]]
    scanned = [[0x07, 0xFF, room(3)]]
    assert parse_grid(raw_map(outside)).digest == parse_grid(raw_map(scanned)).digest
