import { VM_STRINGS } from "./i18n/vm-strings.js";

export function vmLang(hass) {
  const lang = hass?.locale?.language || hass?.language || 'en';
  if (VM_STRINGS[lang]) return lang;
  if (lang.startsWith('sr')) return lang.toLowerCase().includes('latn') ? 'sr-Latn' : 'sr';
  const base = lang.split('-')[0];
  return VM_STRINGS[base] ? base : 'en';
}

export function vmT(hass, key) {
  return VM_STRINGS[vmLang(hass)][key] ?? VM_STRINGS.en[key] ?? key;
}

// Soft room colors, readable on light and dark themes
export const VM_PALETTE = ['#7f9cf5', '#5dcaa5', '#efc56a', '#f0997b', '#ed93b1', '#85b7eb', '#a3d977', '#c6a3f0'];

// Room icon from its name, in the languages of the card (accents removed, lower case)
export const VM_ICONS = [
  [/toilet|\bwc\b|aseo|gabinetto|wychodek/, 'mdi:toilet'],
  [/bain|bath|\bbad|bano|bagno|lazienk|banheiro|douche|shower|dusch/, 'mdi:shower'],
  [/manger|dining|esszimmer|comedor|pranzo|eetkamer|jadal|jantar|spisestue|matsal/, 'mdi:silverware-fork-knife'],
  [/cuisin|kitchen|kuche|cocina|cucina|keuken|kuchni|cozinha|kok|bucatari/, 'mdi:stove'],
  [/chamb|bed|schlaf|dormit|camera|slaapk|sypial|spaln|habitac|quarto|sovrum|sovev|kinder|enfant|kid|child|nursery/, 'mdi:bed'],
  [/bureau|office|study|buro|arbeit|despacho|studio|kantoor|gabinet/, 'mdi:desk'],
  [/buanderie|laundry|wasch|lavadero|lavanderia|cellier|utility/, 'mdi:washing-machine'],
  [/entree|entry|entrance|eingang|entrada|ingresso|vestib|foyer|diele|hal d/, 'mdi:door'],
  [/couloir|corridor|hall|flur|pasillo|\bgang|korytarz|degagement|passage|gang/, 'mdi:shoe-print'],
  [/salon|sejour|living|wohn|lounge|soggiorno|woonkamer|\bsala|stue|vardagsrum|obyvak/, 'mdi:sofa'],
  [/garage/, 'mdi:garage'],
  [/\bjeu|play|spiel|juego|gioco/, 'mdi:toy-brick'],
  [/dressing|closet|placard|ankleide/, 'mdi:hanger'],
];

export function vmRoomIcon(name) {
  const key = (name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  for (const [pattern, icon] of VM_ICONS) if (pattern.test(key)) return icon;
  return 'mdi:square-rounded-outline';
}

export function vmEscape(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Vacuum state → tone of the header badge and status pill
export function vmToneColor(state) {
  return { error: 'var(--error-color, #db4437)', active: 'var(--info-color, #4f8ef7)', warning: 'var(--warning-color, #f4b400)', ok: 'var(--success-color, #43a047)', idle: 'var(--secondary-text-color)' }[vmTone(state)];
}

export function vmTone(state) {
  if (['error', 'unavailable'].includes(state)) return 'error';
  if (['cleaning', 'returning'].includes(state)) return 'active';
  if (state === 'paused') return 'warning';
  if (['docked', 'idle'].includes(state)) return 'ok';
  return 'idle';
}
