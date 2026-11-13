// Pure functions of the card, run without a browser: node --test test/*.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../custom_components/vacuum_map/frontend/vacuum-map-card.js', import.meta.url), 'utf8');
const defined = {};
const context = {
  HTMLElement: class {},
  customElements: { get: (name) => defined[name], define: (name, cls) => (defined[name] = cls) },
  console: { info() {} },
};
context.window = context;
vm.createContext(context);
vm.runInContext(`${source}\nthis.api = { vmRoomIcon, vmLang, vmT, vmTone, vmEscape, VM_STRINGS };`, context);
const { vmRoomIcon, vmLang, vmT, vmTone, vmEscape, VM_STRINGS } = context.api;

test('elements and card picker entry are defined once', () => {
  assert.ok(defined['vacuum-map-card']);
  assert.ok(defined['vacuum-map-card-editor']);
  assert.equal(context.customCards.filter((c) => c.type === 'vacuum-map-card').length, 1);
});

test('room icons from names, in several languages', () => {
  const cases = {
    'Chambre Parents': 'mdi:bed',
    'Chambre Léa': 'mdi:bed',
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
