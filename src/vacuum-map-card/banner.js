// ── Illustrated header ("banner", 90 px) ──────────────────────────────────
// The title on the wall of a living room at the left, the vacuum drawn at the right (the same pictures and model
// selection as ha-vacuum-card: robot with or without its dock or Clean Base, animated by what it does), on a 10 px
// parquet strip edge to edge. Day or night: illustration_theme, else Home Assistant's dark theme alone (a light theme
// keeps the day picture after sunset).
export function vmIsNight(hass, config) {
  const theme = config?.illustration_theme;
  if (theme === 'night') return true;
  if (theme === 'day') return false;
  return !!hass?.themes?.darkMode;
}

// The living room (200 × 80, its floor at y 80): a sofa and a floor lamp (lit at night), zoomed in from its bottom
// right corner so that they stand beside the device. No id inside: several cards on a page cannot clash.
export function vmSceneSvg(n) {
  return `<svg class="vm-room" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false"><g transform="translate(200 80) scale(1.28) translate(-200 -80)"><rect x="0" y="62" width="200" height="1.2" fill="${n ? '#3a4050' : '#e2d6c6'}"/><g fill="${n ? '#4a4470' : '#9d97e0'}"><rect x="58" y="52" width="56" height="20" rx="5"/><rect x="54" y="46" width="10" height="26" rx="4"/><rect x="108" y="46" width="10" height="26" rx="4"/></g>${n ? '<circle cx="127" cy="38" r="12" fill="#ffcf6e" opacity=".15"/>' : ''}<rect x="126" y="40" width="2" height="34" fill="#888"/><path d="M121 40h12l-3-8h-6z" fill="${n ? '#ffcf6e' : '#e8e0d0'}"/></g></svg>`;
}

// The vacuum's device, from the device registry: its model and name pick the picture (as in ha-vacuum-card); its dock
// (a device of its own with the Roborock integration: "<model> Dock", or an identifier ending in _dock) draws the dock.
export function vmDevice(hass, entityId) {
  const entry = hass?.entities?.[entityId];
  const d = entry?.device_id ? hass.devices?.[entry.device_id] : null;
  const model = String(d?.model || '');
  const ids = (d?.identifiers || []).map((i) => String(i[1]));
  const dock = {};
  if (d) {
    for (const [id, other] of Object.entries(hass.devices || {})) {
      if (id === entry.device_id) continue;
      const own = (other.identifiers || []).some((i) => /_dock$/.test(String(i[1])) && ids.includes(String(i[1]).replace(/_dock$/, '')));
      if (own || (d.name && other.name === `${d.name} Dock`) || (model && other.model === `${model} Dock`)) dock[id] = true;
    }
  }
  return {
    kind: /\.(wdv|wetdryvac)\./.test(model) ? 'wetdry' : 'robot',
    model,
    name: d?.name_by_user || d?.name || hass?.states?.[entityId]?.attributes?.friendly_name || '',
    rawName: d?.name || '',
    platform: entry?.platform,
    dock,
  };
}

// What the robot does, for the picture's animation: out cleaning, back to its dock, or at rest (null)
export function vmActivity(state) {
  if (state === 'cleaning') return 'vacuum';
  if (state === 'returning') return 'returning';
  return null;
}

// Size and right edge of the device in the 200 × 80 scene: a robot with its dock or Clean Base (square drawing),
// an upright wet-dry vacuum, a robot on the floor (out cleaning: about the size of the robot docked in its base, so
// that it does not dominate the banner, and room left at the right for its sway).
export const VM_TARGETS = { base: [104, 70, 196], floor: [58, 30, 186], tall: [56, 76, 190] };
export const vmPct = (v) => `${+(v * 100).toFixed(2)}%`;
// Position of a picture in the scene (percent of the scene), its drawing standing on the floor
export function vmPlace(svg) {
  const num4 = (re) => re.exec(svg)?.[1].trim().split(/\s+/).map(Number);
  const [, , W, H] = num4(/viewBox="([^"]+)"/);
  const box = num4(/data-box="([^"]+)"/);
  const [x0, y0, x1, y1] = box?.length === 4 ? box : [0, 0, W, H];
  const [bw, bh, right] = VM_TARGETS[W === H ? 'base' : H > W * 1.5 ? 'tall' : 'floor'];
  const s = Math.min(bw / (x1 - x0), bh / (y1 - y0));
  return `left:${vmPct((right - x1 * s) / 200)};top:${vmPct((80 - y1 * s) / 80)};width:${vmPct((W * s) / 200)};height:${vmPct((H * s) / 80)}`;
}

export const VM_BANNER_STYLE = `
ha-card.ill { padding: 0; container-type: inline-size; }
ha-card.ill > .head { display: block; margin: 0; }
ha-card.ill > .body { padding: 8px 10px 12px; }
.banner { position: relative; overflow: hidden; height: 90px; background: #f4ede3; color: #0d2a45; --vm-scene-w: min(200px, 58%); }
.banner.night { background: #2a2f3d; color: #fff; }
.vm-scene { position: absolute; right: 0; bottom: 10px; width: var(--vm-scene-w); aspect-ratio: 5 / 2; }
.vm-room { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.vm-dev { position: absolute; }
.vm-dev img { width: 100%; height: 100%; display: block; object-fit: contain; object-position: 50% 100%; filter: drop-shadow(0 2px 3px rgba(0,0,0,.16)); }
.night .vm-dev img { filter: drop-shadow(0 0 1.2px rgba(255,255,255,.55)) drop-shadow(0 0 5px rgba(170,200,255,.28)) brightness(1.12); }
.vm-alert { position: absolute; right: 4%; top: 2px; width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center;
  font: 700 12px/1 system-ui, sans-serif; color: #fff; background: var(--error-color, #db4437); box-shadow: 0 1px 3px rgba(0,0,0,.25);
  animation: vm-blink 1.4s ease-in-out infinite; }
@keyframes vm-blink { 50% { opacity: .45; } }
.vm-ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px;
  background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow: inset 0 2px 0 #a97c50; }
.night .vm-ground { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #5c4836; }
.htext { position: absolute; left: 14px; top: 0; bottom: 10px; right: calc(var(--vm-scene-w) + 4px); display: flex; align-items: center; gap: 10px; min-width: 0; }
.htext .titles { flex: 1 1 0; min-width: 0; }
.htext .sub { font-size: 13px; color: #3b5b78; }
/* Status pill in the state's colour on a frosted tint (where it goes: see the rule below and _fitPill). */
.chip { --c: var(--vm-tone); display: inline-flex; align-items: center; gap: 4px; flex: 0 1 auto; min-width: 0; max-width: 51%;
  box-sizing: border-box; overflow: hidden; white-space: nowrap; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
  line-height: 16px; background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
.night .chip { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
.chip .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); flex: none; }
.chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.night .htext .sub { color: rgba(255,255,255,.78); }
.banner .badge { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px rgba(47,128,237,.18); }
.banner.night .badge { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
ha-card.ill .fs { top: 6px; left: 6px; width: 30px; height: 30px; background: #fff; color: #44515f; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
ha-card.ill.night .fs { background: #1f2633; color: #e6ebf1; }
ha-card.ill .fs:hover { background: #f1f3f6; color: #10283f; }
ha-card.ill.night .fs:hover { background: #2a3344; color: #fff; }
@container (max-width: 300px) { .banner { --vm-scene-w: 44%; } }
@container (max-width: 200px) { .vm-scene { display: none; } .htext { right: 8px; } }
@media (prefers-reduced-motion: reduce) { .vm-alert { animation: none; } }
`;
