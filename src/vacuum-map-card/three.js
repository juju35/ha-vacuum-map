// three.js, served by the integration and loaded only for the 3D view
import { VACUUM_MAP_CARD_VERSION } from "./header.js";

export const VM_THREE_URL = '/vacuum_map/vendor/three.min.js';
export let vmThree = null;
export function vmLoadThree() {
  vmThree ??= import(`${VM_THREE_URL}?v=${VACUUM_MAP_CARD_VERSION}`).catch((err) => {
    vmThree = null;
    throw err;
  });
  return vmThree;
}

// Walls of the 3D view, in map pixels (1 px = 5 cm): 60 cm, low like in the Roborock app, so rooms stay visible
export const VM_WALL_HEIGHT = 12;
export const VM_FLOOR_HEIGHT = 0.8;

export function vmRingArea(ring) {
  let area = 0;
  for (let i = 0; i < ring.length; i += 2) {
    const j = (i + 2) % ring.length;
    area += ring[i] * ring[j + 1] - ring[j] * ring[i + 1];
  }
  return area / 2;
}

export function vmInside(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const [xi, yi, xj, yj] = [ring[i], ring[i + 1], ring[j], ring[j + 1]];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Rings as polygons with holes: traced with the inside on their right, outer rings have a positive area (y down)
export function vmPolygons(rings) {
  const polygons = [];
  const holes = [];
  for (const ring of rings) {
    const area = vmRingArea(ring);
    if (area > 0) polygons.push({ outer: ring, holes: [], area });
    else holes.push(ring);
  }
  for (const hole of holes) {
    let best = null;
    for (const p of polygons) if (vmInside(p.outer, hole[0], hole[1]) && (!best || p.area < best.area)) best = p;
    best?.holes.push(hole);
  }
  return polygons;
}
