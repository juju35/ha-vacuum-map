import { VACUUM_MAP_CARD_VERSION } from "./header.js";
import { vmT } from "./helpers.js";
import { VM_ROBOROCK_MODELS } from "./models.js";
import { VacuumMapCard } from "./card.js";

export class VacuumMapCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    else this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement('ha-form');
      this._form.computeLabel = (schema) => !schema.name ? '' : vmT(this._hass, `e_${schema.name === 'show_labels' ? 'labels' : schema.name.replace('show_', '')}`);
      this._form.addEventListener('value-changed', (ev) => {
        this._config = { ...ev.detail.value };
        if (this._config.illustration_theme === 'auto') delete this._config.illustration_theme;
        if (this._config.model === 'auto') delete this._config.model;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = [
      { name: 'entity', required: true, selector: { entity: { domain: 'vacuum' } } },
      { name: 'title', selector: { text: {} } },
      { name: 'view', selector: { select: { mode: 'dropdown', options: ['2d', '3d'].map((v) => ({ value: v, label: v.toUpperCase() })) } } },
      {
        name: 'rotation',
        selector: { select: { mode: 'dropdown', options: ['0', '90', '180', '270'].map((v) => ({ value: v, label: `${v}°` })) } },
      },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'show_labels', selector: { boolean: {} } },
          { name: 'show_path', selector: { boolean: {} } },
          { name: 'show_zones', selector: { boolean: {} } },
          { name: 'show_obstacles', selector: { boolean: {} } },
          { name: 'show_view_toggle', selector: { boolean: {} } },
          { name: 'show_camera_buttons', selector: { boolean: {} } },
          { name: 'show_fullscreen', selector: { boolean: {} } },
          { name: 'illustration', selector: { boolean: {} } },
        ],
      },
      {
        name: 'illustration_theme',
        selector: { select: { mode: 'dropdown', options: ['auto', 'day', 'night'].map((v) => ({ value: v, label: vmT(this._hass, `theme_${v}`) })) } },
      },
      {
        name: 'model',
        selector: { select: { mode: 'dropdown', options: [{ value: 'auto', label: vmT(this._hass, 'model_auto') }, ...VM_ROBOROCK_MODELS] } },
      },
    ];
    this._form.data = {
      show_labels: true,
      show_path: true,
      show_zones: true,
      show_obstacles: false,
      show_view_toggle: true,
      show_camera_buttons: true,
      show_fullscreen: true,
      illustration: true,
      illustration_theme: 'auto',
      model: 'auto',
      view: '2d',
      ...this._config,
      rotation: String(this._config.rotation ?? 0),
    };
  }
}

if (!customElements.get('vacuum-map-card')) customElements.define('vacuum-map-card', VacuumMapCard);
if (!customElements.get('vacuum-map-card-editor')) customElements.define('vacuum-map-card-editor', VacuumMapCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'vacuum-map-card')) {
  window.customCards.push({
    type: 'vacuum-map-card',
    name: 'Vacuum Map',
    description: 'A clean, live map of a Roborock vacuum: rooms, path and robot.',
    preview: false,
    documentationURL: 'https://github.com/juju35/ha-vacuum-map',
  });
}

console.info(`%c VACUUM-MAP-CARD %c ${VACUUM_MAP_CARD_VERSION} `, 'color:#fff;background:#4f8ef7;font-weight:700', 'color:#4f8ef7');
