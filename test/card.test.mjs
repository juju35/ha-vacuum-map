// Pure functions of the card, run without a browser: node --test test/*.test.mjs
import assert from 'node:assert/strict';
import { bundle } from '../scripts/bundle.mjs';
import { test } from 'node:test';
import vm from 'node:vm';

// The card assembled from its ES modules (src/vacuum-map-card/), as scripts/build-frontend.mjs does.
const source = bundle('src/vacuum-map-card/index.js');
const defined = {};
const context = {
  HTMLElement: class {},
  customElements: { get: (name) => defined[name], define: (name, cls) => (defined[name] = cls) },
  console: { info() {} },
};
context.window = context;
vm.createContext(context);
vm.runInContext(`${source}\nthis.api = { vmRoomIcon, vmLang, vmT, vmTone, vmEscape, VM_STRINGS, vmIsNight, vmActivity, vmDevice, vmAutoSvg, vmPlace, VM_ROBOROCK_MODELS, vmModelDevice, vmCameraView };`, context);
const { vmRoomIcon, vmLang, vmT, vmTone, vmEscape, VM_STRINGS, vmIsNight, vmActivity, vmDevice, vmAutoSvg, vmPlace, VM_ROBOROCK_MODELS, vmModelDevice, vmCameraView } = context.api;

test('elements and card picker entry are defined once', () => {
  assert.ok(defined['vacuum-map-card']);
  assert.ok(defined['vacuum-map-card-editor']);
  assert.equal(context.customCards.filter((c) => c.type === 'vacuum-map-card').length, 1);
});

test('room icons from names, in several languages', () => {
  const cases = {
    'Chambre Parents': 'mdi:bed',
    "Chambre d'amis": 'mdi:bed',
    'Salle à manger': 'mdi:silverware-fork-knife',
    'Salle de bains': 'mdi:shower',
    Cuisine: 'mdi:stove',
    Toilettes: 'mdi:toilet',
    Couloir: 'mdi:shoe-print',
    Entrée: 'mdi:door',
    Salon: 'mdi:sofa',
    'Living room': 'mdi:sofa',
    Küche: 'mdi:stove',
    Badezimmer: 'mdi:shower',
    'Kids room': 'mdi:bed',
    Bureau: 'mdi:desk',
    Somewhere: 'mdi:square-rounded-outline',
  };
  for (const [name, icon] of Object.entries(cases)) assert.equal(vmRoomIcon(name), icon, name);
});

test('every language has every key', () => {
  const keys = Object.keys(VM_STRINGS.en).sort();
  for (const [lang, table] of Object.entries(VM_STRINGS)) assert.deepEqual(Object.keys(table).sort(), keys, lang);
  assert.equal(Object.keys(VM_STRINGS).length, 22);
});

test('language fallback', () => {
  assert.equal(vmLang({ locale: { language: 'fr' } }), 'fr');
  assert.equal(vmLang({ locale: { language: 'pt-BR' } }), 'pt');
  assert.equal(vmLang({ locale: { language: 'sr-Latn' } }), 'sr-Latn');
  assert.equal(vmLang({ locale: { language: 'ja' } }), 'en');
  assert.equal(vmT({ locale: { language: 'de' } }, 'e_path'), 'Weg');
});

test('tone and escaping', () => {
  assert.equal(vmTone('cleaning'), 'active');
  assert.equal(vmTone('docked'), 'ok');
  assert.equal(vmTone('error'), 'error');
  assert.equal(vmEscape('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
});

test('illustrated header: night, activity, device picture', () => {
  // The theme alone decides: a light theme keeps the day after sunset, a dark one gives the night even while the sun
  // is up; forced wins.
  assert.equal(vmIsNight({ states: { 'sun.sun': { state: 'below_horizon' } } }, {}), false);
  assert.equal(vmIsNight({ states: { 'sun.sun': { state: 'below_horizon' } }, themes: { darkMode: true } }, {}), true);
  assert.equal(vmIsNight({ states: { 'sun.sun': { state: 'above_horizon' } }, themes: { darkMode: true } }, {}), true);
  assert.equal(vmIsNight({ states: { 'sun.sun': { state: 'above_horizon' } }, themes: { darkMode: false } }, {}), false);
  assert.equal(vmIsNight({ states: { 'sun.sun': { state: 'unavailable' } }, themes: { darkMode: false } }, {}), false);
  assert.equal(vmIsNight({ states: { 'sun.sun': { state: 'above_horizon' } }, themes: { darkMode: true } }, { illustration_theme: 'day' }), false);
  assert.equal(vmIsNight({ states: { 'sun.sun': { state: 'above_horizon' } }, themes: { darkMode: false } }, { illustration_theme: 'night' }), true);
  assert.equal(vmIsNight({ states: {}, themes: { darkMode: true } }, {}), true);
  assert.equal(vmIsNight({ states: { 'sun.sun': { state: 'below_horizon' } } }, { illustration_theme: 'day' }), false);
  assert.equal(vmActivity('cleaning'), 'vacuum');
  assert.equal(vmActivity('returning'), 'returning');
  assert.equal(vmActivity('docked'), null);
  const hass = {
    states: {},
    entities: { 'vacuum.s': { device_id: 'r', platform: 'roborock' } },
    devices: { r: { name: 'Robot', model: 'roborock.vacuum.a70', identifiers: [['roborock', 'x']] }, d: { name: 'Robot Dock', identifiers: [['roborock', 'x_dock']] } },
  };
  const dev = vmDevice(hass, 'vacuum.s');
  assert.deepEqual(Object.keys(dev.dock), ['d']);
  const docked = vmAutoSvg(dev, null);
  assert.match(docked, /viewBox="0 0 160 160"/); // the robot in front of its dock
  assert.match(vmAutoSvg(dev, 'vacuum'), /viewBox="0 0 160 104"/); // out on the floor
  assert.match(vmPlace(docked), /^left:[\d.]+%;top:[\d.]+%;width:[\d.]+%;height:[\d.]+%$/);
});

test('model option: Roborock models, drawn like the device', () => {
  const values = VM_ROBOROCK_MODELS.map((o) => o.value);
  assert.ok(values.includes('roborock.vacuum.a75') && values.includes('roborock.wdv.a194'));
  assert.ok(VM_ROBOROCK_MODELS.every((o) => /^Roborock /.test(o.label)));
  assert.ok(!values.some((v) => /^(dreame|xiaomi|deebot)/.test(v) || v === 'rockrobo.vacuum.v1'));
  assert.equal(new Set(VM_ROBOROCK_MODELS.map((o) => o.label)).size, VM_ROBOROCK_MODELS.length);
  assert.match(vmAutoSvg(vmModelDevice('roborock.wdv.a194'), null), /viewBox="0 0 100 200"/); // F25 Ultra: upright
  assert.match(vmAutoSvg(vmModelDevice('roborock.vacuum.a75'), null), /viewBox="0 0 160 160"/); // Qrevo: in its dock
  assert.match(vmAutoSvg(vmModelDevice('roborock.vacuum.a38'), null), /viewBox="0 0 160 104"/); // Q7 Max: no dock
});

test('robot on the floor: sized like the docked robot, standing on the floor, not clipped', () => {
  const dev = vmModelDevice('roborock.vacuum.a143');
  const n = (svg) => Object.fromEntries(vmPlace(svg).split(';').map((kv) => kv.split(':')).map(([k, v]) => [k, parseFloat(v)]));
  const floor = n(vmAutoSvg(dev, 'vacuum'));
  // 160 × 104 drawing, robot box 8…152 × 27…88: robot about 29 % of the scene width, at most 45 % of its height
  assert.ok((floor.width * 144) / 160 <= 30, `robot ${floor.width}`);
  assert.ok((floor.height * 61) / 104 <= 45);
  assert.ok(floor.left + floor.width <= 100);
  assert.ok(Math.abs(floor.top + (floor.height * 88) / 104 - 100) < 0.1); // its box stands on the floor (y 80)
});

test('status pill: after the whole title, else under the subtitle, else its dot; measured, in both headers', () => {
  const pill = source.match(/\n\.chip \{[^}]*\}/)?.[0] ?? '';
  assert.match(pill, /font-size: 11px/);
  // On the title row only with the whole title beside it; under the (one-line) subtitle otherwise; no fixed threshold
  assert.match(source, /\.titles \.trow > \.title \{ flex: 0 1 auto; min-width: 0; \}/);
  assert.match(source, /\.titles\.below \.trow \{ display: contents; \}/);
  assert.match(source, /\.titles\.below :is\(\.sub\) \{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; \}/);
  assert.match(source, /@container \(max-width: 200px\) \{ \.titles \.trow > \.chip \{ padding: 4px; \}/);
  assert.doesNotMatch(source, /max-width: 260px|data-wrap|min-width: 4ch/);
  assert.match(source, /_fitPill\(root = this\.shadowRoot\)/);
  assert.match(source, /class="chip" title="\$\{vmEscape\(status\)\}" aria-label="\$\{vmEscape\(status\)\}"/);
  // the classic header (and the full screen one) has the same pill on its title row
  assert.match(source, /<div class="trow"><div class="title">\$\{vmEscape\(title\)\}<\/div>\$\{\n {8}status \? `<span class="chip flat"/);
  // the status is in the pill, not repeated in the subtitle
  assert.doesNotMatch(source, /\[status, this\._geometry/);
});

test('room colours from the configuration are escaped in the labels', () => {
  const card = Object.create(defined['vacuum-map-card'].prototype);
  card._config = { show_labels: true, rooms: { 1: { name: 'Hall', color: 'red"><img src=x onerror=alert(1)>' } } };
  card._geometry = { rooms: [{ id: 1, name: 'Hall' }] };
  const html = card._labelsHtml();
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /background:red&quot;&gt;&lt;img/);
});

test('hass of another entity: the header is not worked out again', () => {
  const card = Object.create(defined['vacuum-map-card'].prototype);
  card._config = { entity: 'vacuum.s' };
  card._unsub = () => {};
  let heads = 0;
  let rooms = 0;
  card._renderHead = () => heads++;
  card._updateActiveRoom = () => rooms++;
  const vac = { state: 'cleaning', attributes: {} };
  const base = { states: { 'vacuum.s': vac, 'light.a': { state: 'on' } }, themes: { darkMode: false }, devices: {}, entities: {} };
  card.hass = base;
  card.hass = { ...base, states: { ...base.states, 'light.a': { state: 'off' } } };
  assert.equal(heads, 1);
  assert.equal(rooms, 1);
  card.hass = { ...base, states: { ...base.states, 'vacuum.s': { state: 'returning', attributes: {} } } };
  card.hass = { ...base, states: { ...base.states, 'vacuum.s': { state: 'returning', attributes: {} } }, themes: { darkMode: true } };
  assert.equal(heads, 3);
  assert.equal(rooms, 3);
});

test('3D camera views: start view by default, values rounded and kept in range', () => {
  const view = (v) => ({ ...vmCameraView(v) }); // out of the sandbox's realm
  assert.deepEqual(view(null), { rotation: 0, tilt: 47, zoom: 1, pan_x: 0, pan_y: 0 });
  assert.deepEqual(view({ rotation: 200, tilt: 90, zoom: 9, pan_x: -2, pan_y: '0.12345' }), { rotation: -160, tilt: 77, zoom: 4, pan_x: -0.6, pan_y: 0.123 });
  assert.deepEqual(view({ rotation: 'x', tilt: '', zoom: null }), { rotation: 0, tilt: 47, zoom: 1, pan_x: 0, pan_y: 0 });
  assert.equal(vmCameraView({ rotation: -190 }).rotation, 170);
});
