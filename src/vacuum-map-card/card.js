import { VM_PALETTE, vmEscape, vmRoomIcon, vmT, vmTone, vmToneColor } from "./helpers.js";
import { VM_MODEL_NAMES, vmAutoSvg, vmModelDevice } from "./models.js";
import { VM_BANNER_STYLE, vmActivity, vmDevice, vmIsNight, vmPlace, vmSceneSvg } from "./banner.js";
import { vmInside, vmLoadThree } from "./three.js";
import { VmScene } from "./scene.js";
import { VM_FULL_STYLE, VM_STYLE } from "./styles.js";

export class VacuumMapCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('vacuum-map-card-editor');
  }

  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states || {}).find((id) => id.startsWith('vacuum.'));
    return { entity: entity || '' };
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    const previous = this._config;
    this._hassDeps = null;
    this._config = {
      rotation: 0,
      show_labels: true,
      show_path: true,
      show_zones: true,
      show_obstacles: false,
      view: '2d',
      show_view_toggle: true,
      show_camera_buttons: true,
      show_fullscreen: true,
      ...config,
    };
    if (!previous || previous.view !== this._config.view) this._is3d = this._config.view === '3d';
    // embedded: the map alone, without card nor header, for another card that shows it (ha-vacuum-card)
    const embedded = this._config.embedded === true;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.addEventListener('pointerdown', () => (this._pointer = true));
      this.shadowRoot.addEventListener('keydown', () => (this._pointer = false));
    }
    if (this._embedded !== embedded || !this.shadowRoot.firstChild) {
      this._embedded = embedded;
      this._headKey = null;
      this.shadowRoot.innerHTML = embedded
        ? `<style>${VM_STYLE}</style><div class="body"></div>`
        : `<style>${VM_STYLE}${VM_BANNER_STYLE}</style><ha-card><div class="head"></div><div class="body"></div></ha-card>`;
    }
    if (previous && (previous.entity !== this._config.entity || previous.map !== this._config.map)) this._resubscribe();
    else this._drawAll();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    // Home Assistant sets hass on every state change of the instance: the header and the active room are only worked
    // out again when what they read changed (the vacuum's state, the theme, the registries, the language).
    const deps = [hass.states?.[this._config?.entity], hass.themes?.darkMode, hass.devices, hass.entities, hass.formatEntityState, hass.language, hass.locale];
    const changed = !this._hassDeps || deps.some((d, i) => d !== this._hassDeps[i]);
    this._hassDeps = deps;
    if (changed) this._renderHead();
    if (this._fullMap) this._fullMap.hass = hass;
    if (first || !this._unsub) this._subscribe();
    if (changed) this._updateActiveRoom();
  }

  getCardSize() {
    return 7;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, min_rows: 4 };
  }

  connectedCallback() {
    clearTimeout(this._leaving);
    if (this._hass && !this._unsub) this._subscribe();
    const box = this.shadowRoot?.querySelector('.labels');
    if (this._resize && box) this._resize.observe(box);
    const card = this.shadowRoot?.querySelector('ha-card');
    if (this._pillResize && card) this._pillResize.observe(card);
    if (this._anim && !this._raf) this._raf = requestAnimationFrame((t) => this._frame(t));
  }

  // A card that shows this one (ha-vacuum-card) moves it at each of its renders: the subscription is only ended a
  // moment after leaving the page, so a move keeps it and the drawing.
  disconnectedCallback() {
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    clearTimeout(this._leaving);
    this._leaving = setTimeout(() => {
      if (this.isConnected) return;
      this._unsubscribe();
      this._resize?.disconnect();
      this._pillResize?.disconnect();
      this._scene?.dispose(); // frees its WebGL context (a page only gets a few)
      this._scene = null;
      this.closeFullscreen();
    }, 3000);
  }

  // ── data ────────────────────────────────────────────────────────────────

  _subscribe() {
    const entity = this._config?.entity;
    if (!this._hass?.connection || !entity || this._subscribing || this._unsub || this._waiting || !this.isConnected) return;
    this._subscribing = true;
    const message = { type: 'vacuum_map/subscribe', entity_id: entity };
    if (this._config.map !== undefined && this._config.map !== '') message.map = Number(this._config.map);
    this._hass.connection
      .subscribeMessage((event) => this._onEvent(event), message)
      .then((unsub) => {
        this._unsub = unsub;
        this._error = null;
      })
      .catch((err) => {
        this._error = err?.code === 'not_found' ? 'no_map' : err?.code === 'unknown_command' ? 'not_set_up' : 'no_map';
        this._drawAll();
        this._retryLater(15000);
      })
      .finally(() => {
        this._subscribing = false;
      });
  }

  // Wait before subscribing again: hass updates must not retry on every state change
  _retryLater(delay) {
    clearTimeout(this._retry);
    this._waiting = true;
    this._retry = setTimeout(() => {
      this._waiting = false;
      this._subscribe();
    }, delay);
  }

  _unsubscribe() {
    clearTimeout(this._retry);
    this._waiting = false;
    if (this._unsub) {
      this._unsub();
      this._unsub = null;
    }
  }

  _resubscribe() {
    this._unsubscribe();
    this._geometry = null;
    this._live = null;
    this._drawAll();
    this._subscribe();
  }

  _onEvent(event) {
    if (event.reset) {
      this._unsub = null; // the server already ended the subscription
      this._retryLater(3000);
      return;
    }
    const now = Date.now();
    if (this._lastEvent) this._interval = Math.min(Math.max(now - this._lastEvent, 1000), 35000);
    this._lastEvent = now;
    if (event.geometry) {
      // The same map redrawn (its image changed while cleaning): the robot carries on from where it is shown
      const sameMap = !!this._geometry && event.map === this._mapId;
      this._geometry = event.geometry;
      if (!sameMap) {
        this._live = null;
        this._robotAt = null;
        this._anim = null;
      }
      this._drawAll();
    }
    this._mapId = event.map;
    this._applyLive(event.live);
  }

  // ── geometry helpers ────────────────────────────────────────────────────

  _tp(x, y) {
    const [w, h] = this._geometry.size;
    switch (Number(this._config.rotation)) {
      case 90:
        return [h - y, x];
      case 180:
        return [w - x, h - y];
      case 270:
        return [y, w - x];
      default:
        return [x, y];
    }
  }

  _ringPath(flat) {
    let d = '';
    for (let i = 0; i < flat.length; i += 2) {
      const [x, y] = this._tp(flat[i], flat[i + 1]);
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return `${d}Z`;
  }

  _points(flat, from = 0, to = flat.length) {
    let out = '';
    for (let i = from; i < to; i += 2) {
      const [x, y] = this._tp(flat[i], flat[i + 1]);
      out += `${x.toFixed(1)},${y.toFixed(1)} `;
    }
    return out;
  }

  _bounds() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const g = this._geometry;
    const rings = [...g.walls, ...g.floor, ...g.rooms.flatMap((r) => r.rings)];
    for (const ring of rings) {
      for (let i = 0; i < ring.length; i += 2) {
        const [x, y] = this._tp(ring[i], ring[i + 1]);
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (!Number.isFinite(minX)) return [0, 0, ...g.size];
    const pad = 4;
    return [minX - pad, minY - pad, maxX - minX + 2 * pad, maxY - minY + 2 * pad];
  }

  _roomStyle(room, index) {
    const rooms = this._config.rooms || {};
    const own = rooms[room.id] || rooms[String(room.id)] || rooms[room.name] || {};
    return {
      name: own.name || room.name,
      icon: own.icon || vmRoomIcon(own.name || room.name),
      color: own.color || VM_PALETTE[index % VM_PALETTE.length],
      hidden: own.hidden === true,
    };
  }

  // ── rendering ───────────────────────────────────────────────────────────

  // Header: badge tinted with the vacuum state, title, room being cleaned, status pill; `buttons` at the right
  _head(buttons) {
    const stateObj = this._hass.states[this._config.entity];
    const state = stateObj?.state ?? 'unavailable';
    const tone = vmToneColor(state);
    const title = this._config.title || stateObj?.attributes?.friendly_name || this._config.entity || '';
    const status = stateObj ? (this._hass.formatEntityState?.(stateObj) ?? state) : '';
    const sub = this._geometry ? this._subtitle() : '';
    const html = `<div class="badge"><ha-icon icon="mdi:robot-vacuum"></ha-icon></div>
      <div class="titles"><div class="trow"><div class="title">${vmEscape(title)}</div>${
        status ? `<span class="chip flat" title="${vmEscape(status)}" aria-label="${vmEscape(status)}"><span class="dot"></span><span class="chip-text">${vmEscape(status)}</span></span>` : ''
      }</div>${sub ? `<div class="sub" title="${vmEscape(sub)}">${vmEscape(sub)}</div>` : ''}</div>${buttons}`;
    return { tone, html };
  }

  // Illustrated header (the default; `illustration: false` keeps the classic one)
  _illustrated() {
    return !this._embedded && this._config.illustration !== false;
  }

  // The banner: the badge (its color is the vacuum's state), the title with the status pill and the room on the wall
  // at the left,
  // the vacuum drawn at the right, on the parquet strip
  _banner() {
    const stateObj = this._hass.states[this._config.entity];
    const state = stateObj?.state ?? 'unavailable';
    const night = vmIsNight(this._hass, this._config);
    const title = this._config.title || stateObj?.attributes?.friendly_name || this._config.entity || '';
    const status = stateObj ? (this._hass.formatEntityState?.(stateObj) ?? state) : '';
    const sub = this._geometry ? this._subtitle() : '';
    const art = this._art(state);
    const alert = vmTone(state) === 'error' && stateObj ? '<div class="vm-alert" aria-hidden="true">!</div>' : '';
    const html = `<div class="banner${night ? ' night' : ''}">
      <div class="vm-scene">${vmSceneSvg(night)}${art}${alert}</div>
      <div class="vm-ground" aria-hidden="true"></div>
      <div class="htext"><div class="badge"><ha-icon icon="mdi:robot-vacuum"></ha-icon></div>
        <div class="titles"><div class="trow"><div class="title">${vmEscape(title)}</div>${
          status ? `<span class="chip" title="${vmEscape(status)}" aria-label="${vmEscape(status)}"><span class="dot"></span><span class="chip-text">${vmEscape(status)}</span></span>` : ''
        }</div>${sub ? `<div class="sub" title="${vmEscape(sub)}">${vmEscape(sub)}</div>` : ''}</div></div>
    </div>`;
    return { tone: vmToneColor(state), html, night };
  }

  // The vacuum's picture, drawn again only when its device or what it does changes
  _art(state) {
    const h = this._hass;
    const entity = this._config.entity;
    if (!entity) return '';
    if (this._devFor?.[0] !== entity || this._devFor[1] !== h.devices || this._devFor[2] !== h.entities) {
      this._devFor = [entity, h.devices, h.entities];
      this._dev = vmDevice(h, entity);
    }
    // `model`: a model id to draw that model instead of the device's own (auto: the device's)
    const model = this._config.model;
    const dev = model && model !== 'auto' && Object.hasOwn(VM_MODEL_NAMES, String(model).toLowerCase()) ? vmModelDevice(String(model).toLowerCase()) : this._dev;
    const key = `${JSON.stringify(dev)}|${vmActivity(state)}`;
    if (key !== this._artKey) {
      this._artKey = key;
      const svg = vmAutoSvg(dev, vmActivity(state));
      this._artHtml = svg ? `<div class="vm-dev" style="${vmPlace(svg)}"><img src="data:image/svg+xml,${encodeURIComponent(svg)}" alt=""></div>` : '';
    }
    return this._artHtml;
  }

  _renderHead() {
    if (this._full) this._renderFullHead();
    const head = this.shadowRoot?.querySelector('.head');
    if (!head || !this._hass) return;
    const ill = this._illustrated();
    let tone;
    let html;
    let night = false;
    if (ill) ({ tone, html, night } = this._banner());
    else {
      const label = vmT(this._hass, 'fullscreen');
      const button = this._config.show_fullscreen ? `<button class="icon-btn" data-action="fullscreen" title="${label}" aria-label="${label}"><ha-icon icon="mdi:fullscreen"></ha-icon></button>` : '';
      ({ tone, html } = this._head(button));
    }
    if (html === this._headKey) return;
    this._headKey = html;
    this.style.setProperty('--vm-tone', tone);
    const card = this.shadowRoot.querySelector('ha-card');
    card?.classList.toggle('ill', ill);
    card?.classList.toggle('night', night);
    head.innerHTML = html;
    // A new width (or the web font loaded) fits the status pill again, in the next frame
    if (card && !this._pillResize && typeof ResizeObserver === 'function') {
      this._pillResize = new ResizeObserver(() => {
        cancelAnimationFrame(this._fitFrame);
        this._fitFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._pillResize.observe(card);
      document.fonts?.ready?.then(() => this._fitPill());
    }
    this._fitPill();
    head.querySelector('[data-action="fullscreen"]')?.addEventListener('click', () => this.openFullscreen());
  }

  // The status pill goes right after the title only when the whole title and the pill's whole label fit on that row;
  // otherwise it takes a line of its own under the subtitle (.titles.below, the subtitle cut to one line). In the
  // banner (where that line may run over the picture), when the titles still run below the top of the ground strip or
  // out of the banner, and in the classic header when the label does not fit even alone, the pill keeps its dot alone,
  // beside the title (.titles.dotonly). Measured in fractional pixels.
  _fitPill(root = this.shadowRoot) {
    for (const t of root?.querySelectorAll?.('.titles') || []) {
      const row = t.querySelector('.trow');
      const chips = row ? [...row.querySelectorAll(':scope > .chip')] : [];
      if (!chips.length || !row.getBoundingClientRect) continue;
      t.classList.remove('below', 'dotonly');
      const name = row.querySelector(':scope > .title');
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const widths = chips.map((c) => c.getBoundingClientRect().width);
      let need = -gap;
      if (name && getComputedStyle(name).display !== 'none') {
        name.style.flex = 'none';
        need = name.getBoundingClientRect().width;
        name.style.flex = '';
      }
      for (const w of widths) need += gap + w;
      const room = row.getBoundingClientRect().width + 0.01;
      if (need <= room) continue;
      t.classList.add('below');
      const banner = t.closest('.banner');
      const cut = !banner && widths.some((w) => w > room);
      let out = false;
      if (banner) {
        const b = banner.getBoundingClientRect();
        const floor = b.bottom - (banner.querySelector('.vm-ground')?.getBoundingClientRect().height ?? 10) + 0.5;
        out = [...t.querySelectorAll('.title, .sub, .chip')].some((e) => {
          const r = e.getBoundingClientRect();
          return r.height && (r.bottom > floor || r.top < b.top - 0.5 || r.right > b.right + 0.5);
        });
      }
      if (cut || out) t.classList.replace('below', 'dotonly');
    }
  }

  // ── full screen (like the weather card): a sheet over the page with the map at its largest ──

  openFullscreen() {
    if (this._full?.isConnected || !this._hass) return;
    const host = document.createElement('div');
    host.className = 'vacuum-map-fullscreen';
    host.style.cssText = 'position:fixed;inset:0;z-index:9999';
    const root = host.attachShadow({ mode: 'open' });
    const label = vmEscape(this._config.title || this._hass.states[this._config.entity]?.attributes?.friendly_name || vmT(this._hass, 'fullscreen'));
    root.innerHTML = `<style>${VM_STYLE}${VM_FULL_STYLE}</style><div class="sheet" role="dialog" aria-modal="true" aria-label="${label}"><div class="head"></div><div class="stage"></div></div>`;
    const map = document.createElement('vacuum-map-card');
    map.setConfig({ ...this._config, embedded: true, show_fullscreen: false, max_height: 'calc(100dvh - 96px)', view: this._is3d ? '3d' : '2d' });
    map.hass = this._hass;
    root.querySelector('.stage').appendChild(map);
    root.addEventListener('pointerdown', () => (this._pointer = true));
    root.addEventListener('keydown', () => (this._pointer = false));
    root.addEventListener('click', (ev) => {
      if (ev.composedPath().some((n) => n.dataset?.action === 'close')) this.closeFullscreen();
    });
    this._onFullKey = (ev) => {
      if (ev.key === 'Escape') this.closeFullscreen();
    };
    // The back button (or gesture) closes it, as a dialog of Home Assistant
    this._onFullBack = (ev) => {
      if (!ev?.state?.vacuumMapFullscreen) this.closeFullscreen(true);
    };
    document.addEventListener('keydown', this._onFullKey);
    window.addEventListener('popstate', this._onFullBack);
    window.history.pushState({ vacuumMapFullscreen: true }, '');
    this._bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.appendChild(host);
    this._full = host;
    this._fullMap = map;
    this._fullKey = null;
    this._renderFullHead();
    root.querySelector('.close')?.focus({ preventScroll: true });
  }

  // fromBack: the back button already left the history entry the full screen added
  closeFullscreen(fromBack = false) {
    if (!this._full) return;
    this._full.remove();
    this._full = null;
    this._fullMap = null;
    document.removeEventListener('keydown', this._onFullKey);
    window.removeEventListener('popstate', this._onFullBack);
    document.body.style.overflow = this._bodyOverflow || '';
    if (!fromBack && window.history.state?.vacuumMapFullscreen) window.history.back();
    // Back to the full screen button for the keyboard only: after a tap, the browser would draw a focus ring on it
    if (!this._pointer) this.shadowRoot?.querySelector('[data-action="fullscreen"]')?.focus({ preventScroll: true });
  }

  _renderFullHead() {
    const head = this._full?.shadowRoot.querySelector('.head');
    if (!head || !this._hass) return;
    const close = vmT(this._hass, 'close');
    const { tone, html } = this._head(`<button class="icon-btn close" data-action="close" title="${close}" aria-label="${close}"><ha-icon icon="mdi:close"></ha-icon></button>`);
    if (html === this._fullKey) return;
    this._fullKey = html;
    this._full.style.setProperty('--vm-tone', tone);
    head.innerHTML = html;
    this._fitPill(this._full.shadowRoot);
  }

  _subtitle() {
    const id = this._live?.room;
    const index = this._geometry.rooms.findIndex((r) => r.id === id);
    if (index < 0) return '';
    return this._roomStyle(this._geometry.rooms[index], index).name;
  }

  _drawAll() {
    const body = this.shadowRoot?.querySelector('.body');
    if (!body) return;
    this._headKey = null;
    this._renderHead();
    if (!this._config.entity) {
      body.innerHTML = `<div class="msg">${vmT(this._hass, 'no_entity')}</div>`;
      return;
    }
    if (!this._geometry) {
      body.innerHTML = `<div class="msg">${vmT(this._hass, this._error || 'loading')}</div>`;
      return;
    }
    const g = this._geometry;
    const [vx, vy, vw, vh] = this._bounds();
    this._view = [vx, vy, vw, vh];
    const roomPaths = g.rooms
      .map((room, i) => {
        const style = this._roomStyle(room, i);
        const d = room.rings.map((ring) => this._ringPath(ring)).join('');
        return `<path class="room" data-room="${room.id}" d="${d}" fill="${vmEscape(style.color)}" fill-opacity="0.38" fill-rule="evenodd"></path>`;
      })
      .join('');
    const floor = g.floor.map((ring) => this._ringPath(ring)).join('');
    const walls = g.walls.map((ring) => this._ringPath(ring)).join('');
    body.innerHTML = `<div class="map" style="aspect-ratio:${vw.toFixed(1)} / ${vh.toFixed(1)};width:min(100%, calc(${vmEscape(this._config.max_height || '70vh')} * ${(vw / vh).toFixed(4)}))">
      <svg viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}" preserveAspectRatio="xMidYMid meet">
        <path d="${floor}" fill="var(--secondary-text-color)" fill-opacity="0.16" fill-rule="evenodd"></path>
        <g class="rooms">${roomPaths}</g>
        <g class="zones"></g>
        <g class="path" fill="none" stroke="var(--primary-text-color)" stroke-opacity="0.45" stroke-width="0.45" stroke-linejoin="round" stroke-linecap="round">
          <polyline class="done"></polyline><polyline class="tail"></polyline>
        </g>
        <path d="${walls}" fill="var(--primary-text-color)" fill-opacity="0.55" fill-rule="evenodd"></path>
        <g class="obstacles"></g>
        <g class="robot" style="display:none"><g transform="scale(1.35)">
          <circle r="7" fill="var(--vm-accent)" fill-opacity="0.18"></circle>
          <circle r="3.6" fill="#f4f6f9" stroke="#8b93a3" stroke-width="0.5"></circle>
          <circle r="1.4" fill="#c9cfd8" stroke="#8b93a3" stroke-width="0.35"></circle>
          <path class="heading" d="M2.4 -1.2 L3.4 0 L2.4 1.2" fill="none" stroke="var(--vm-accent)" stroke-width="0.6" stroke-linecap="round"></path>
        </g></g>
      </svg>
      <div class="labels"></div>
      <div class="three"></div><div class="labels3d"></div>
      ${this._config.show_view_toggle ? `<div class="vt" role="group"><button data-view="2d">2D</button><button data-view="3d">3D</button></div>` : ''}
      ${this._config.show_camera_buttons ? `<div class="cam" role="group"><button class="icon-btn" data-cam="save" title="${vmT(this._hass, 'view_save')}" aria-label="${vmT(this._hass, 'view_save')}"><ha-icon icon="mdi:content-save-outline"></ha-icon></button><button class="icon-btn" data-cam="reset" title="${vmT(this._hass, 'view_reset')}" aria-label="${vmT(this._hass, 'view_reset')}"><ha-icon icon="mdi:camera-retake-outline"></ha-icon></button></div>` : ''}
      ${(this._embedded || this._illustrated()) && this._config.show_fullscreen ? `<button class="icon-btn fs" data-action="fullscreen" title="${vmT(this._hass, 'fullscreen')}" aria-label="${vmT(this._hass, 'fullscreen')}"><ha-icon icon="mdi:fullscreen"></ha-icon></button>` : ''}
    </div>`;
    this.style.setProperty('--vm-accent', 'var(--info-color, #4f8ef7)');
    body.querySelector('.fs')?.addEventListener('click', (ev) => {
      ev.stopPropagation(); // not a click on the map for a card that shows this one
      this.openFullscreen();
    });
    for (const button of body.querySelectorAll('.vt button')) {
      button.addEventListener('click', (ev) => {
        ev.stopPropagation(); // not a click on the map for a card that shows this one
        this._setView(button.dataset.view === '3d');
      });
    }
    for (const button of body.querySelectorAll('.cam button')) {
      button.addEventListener('click', (ev) => {
        ev.stopPropagation(); // not a click on the map for a card that shows this one
        if (button.dataset.cam === 'save') this._saveView3d(button);
        else this._resetView3d();
      });
    }
    this._drawLabels();
    this._active = undefined; // new elements: apply the active room again
    this._setView(this._is3d, true);
    if (this._live) this._applyLive(this._live, true);
  }

  // The 3D camera: the view saved on this device (browser storage, per vacuum and map) wins over camera_3d, which
  // wins over the start view. Saving keeps the current view for the next loads; resetting forgets it.
  _viewKey() {
    return `vacuum-map-card.view3d.${this._config.entity}.${this._config.map ?? ''}`;
  }

  _defaultView3d() {
    try {
      const saved = JSON.parse(window.localStorage?.getItem(this._viewKey()) || 'null');
      if (saved && typeof saved === 'object') return saved;
    } catch {
      // no storage here (private mode, a webview without it): camera_3d or the start view
    }
    return this._config.camera_3d && typeof this._config.camera_3d === 'object' ? this._config.camera_3d : null;
  }

  _saveView3d(button) {
    if (!this._scene) return;
    try {
      window.localStorage.setItem(this._viewKey(), JSON.stringify(this._scene.view()));
    } catch {
      return;
    }
    const icon = button?.querySelector('ha-icon');
    if (!icon) return;
    icon.setAttribute('icon', 'mdi:check');
    button.title = vmT(this._hass, 'view_saved');
    clearTimeout(this._savedTimer);
    this._savedTimer = setTimeout(() => {
      icon.setAttribute('icon', 'mdi:content-save-outline');
      button.title = vmT(this._hass, 'view_save');
    }, 1500);
  }

  _resetView3d() {
    try {
      window.localStorage?.removeItem(this._viewKey());
    } catch {
      // nothing saved to forget
    }
    this._scene?.home();
  }

  // 2D or 3D: three.js is loaded and the scene built the first time the 3D view is shown
  async _setView(is3d, rebuild = false) {
    this._is3d = is3d;
    const map = this.shadowRoot.querySelector('.map');
    if (!map) return;
    for (const button of map.querySelectorAll('.vt button')) {
      const on = (button.dataset.view === '3d') === is3d;
      button.classList.toggle('on', on);
      button.setAttribute('aria-pressed', String(on));
    }
    map.classList.toggle('is3d', is3d);
    if (!is3d) return;
    if (!this._scene) {
      try {
        const T = await vmLoadThree();
        if (!this._is3d || this._scene) return;
        this._scene = new VmScene(T, this);
      } catch (err) {
        console.warn('vacuum-map-card: no 3D view', err);
        this._is3d = false;
        map.classList.remove('is3d');
        map.querySelector('.vt')?.remove();
        return;
      }
      rebuild = true;
    }
    const box = map.querySelector('.three');
    if (rebuild || this._scene.box !== box) {
      this._scene.attach(box, map.querySelector('.labels3d'));
      this._scene.build(this._geometry, this._labelsHtml());
    }
    // The 3D scene is only updated while it is shown: catch up with the live part
    this._scene.setActive(this._active ?? null);
    if (this._anim && this._live) this._scene.setLive(this._live, this._anim, this._config);
    if (this._robotAt) this._scene.setRobot(...this._robotAt, this._heading, [], false);
  }

  _pct(x, y) {
    const [vx, vy, vw, vh] = this._view;
    return `left:${(((x - vx) / vw) * 100).toFixed(2)}%;top:${(((y - vy) / vh) * 100).toFixed(2)}%`;
  }

  // Room labels; `at` places them (2D: in % of the map; 3D: set at each render)
  _labelsHtml(at = () => '') {
    if (!this._config.show_labels) return '';
    let html = '';
    this._geometry.rooms.forEach((room, i) => {
      const style = this._roomStyle(room, i);
      if (style.hidden) return;
      html += `<div class="label" data-room="${room.id}" style="${at(room)}"><span class="ic" style="background:${vmEscape(style.color)}"><ha-icon icon="${vmEscape(style.icon)}"></ha-icon></span><span class="name">${vmEscape(style.name)}</span></div>`;
    });
    return html;
  }

  _drawLabels() {
    const box = this.shadowRoot.querySelector('.labels');
    if (!box) return;
    this._spots = null;
    let html = this._labelsHtml((room) => this._pct(...this._tp(room.center[0], room.center[1])));
    html += '<div class="dock" style="display:none"><ha-icon icon="mdi:lightning-bolt"></ha-icon></div>';
    box.innerHTML = html;
    if (!this._resize) {
      this._resize = new ResizeObserver(() => this._fitLabels());
    }
    this._resize.disconnect();
    this._resize.observe(box);
  }

  // A name wider than its room is cut with "…" at the room's width (the full name stays as a tooltip), as in the
  // Roborock app; a room too small even for that shows the icon alone
  _fitLabels() {
    const box = this.shadowRoot?.querySelector('.labels');
    if (!box?.clientWidth || !this._geometry) return;
    const scale = box.clientWidth / this._view[2];
    for (const label of box.querySelectorAll('.label')) {
      const room = this._geometry.rooms.find((r) => String(r.id) === label.dataset.room);
      if (!room) continue;
      let min = Infinity;
      let max = -Infinity;
      for (const ring of room.rings) {
        for (let i = 0; i < ring.length; i += 2) {
          const [x] = this._tp(ring[i], ring[i + 1]);
          min = Math.min(min, x);
          max = Math.max(max, x);
        }
      }
      const width = (max - min) * scale - 4;
      const nameEl = label.querySelector('.name');
      label.style.removeProperty('--vm-name-width');
      label.classList.remove('compact');
      const full = label.offsetWidth <= width;
      // icon (18 px) + padding: what is left for the name
      const left = Math.floor(width - 30);
      if (!full && left >= 28) label.style.setProperty('--vm-name-width', `${left}px`);
      label.classList.toggle('compact', !full && left < 28);
      label.title = full ? '' : (nameEl?.textContent ?? '');
    }
    this._spreadLabels(box, scale);
  }

  // Labels that would cover each other: the small rooms keep their center, a larger room moves its label to another
  // spot inside it, the nearest to its center that is free. No free spot: it stays where it was.
  _spreadLabels(box, scale) {
    const [vx, vy] = this._view;
    const placed = [];
    const rooms = new Map(this._geometry.rooms.map((r) => [String(r.id), r]));
    const labels = [...box.querySelectorAll('.label')].filter((l) => rooms.has(l.dataset.room));
    labels.sort((a, b) => (rooms.get(a.dataset.room).area || 0) - (rooms.get(b.dataset.room).area || 0));
    for (const label of labels) {
      const w = label.offsetWidth + 4;
      const h = label.offsetHeight + 4;
      const rect = ([x, y]) => ({ x: (x - vx) * scale - w / 2, y: (y - vy) * scale - h / 2, w, h });
      const free = (r) => !placed.some((p) => r.x < p.x + p.w && p.x < r.x + r.w && r.y < p.y + p.h && p.y < r.y + r.h);
      const spots = this._labelSpots(rooms.get(label.dataset.room));
      const spot = spots.find((s) => free(rect(s))) || spots[0];
      label.setAttribute('style', `${this._pct(...spot)}${label.style.getPropertyValue('--vm-name-width') ? `;--vm-name-width:${label.style.getPropertyValue('--vm-name-width')}` : ''}`);
      placed.push(rect(spot));
    }
  }

  // Where a room's label can go (view coordinates): its center, then points inside it, the nearest first
  _labelSpots(room) {
    this._spots ??= new Map();
    const cached = this._spots.get(room);
    if (cached) return cached;
    const center = this._tp(room.center[0], room.center[1]);
    const rings = room.rings.map((ring) => {
      const out = [];
      for (let i = 0; i < ring.length; i += 2) out.push(...this._tp(ring[i], ring[i + 1]));
      return out;
    });
    const xs = rings.flatMap((r) => r.filter((_, i) => i % 2 === 0));
    const ys = rings.flatMap((r) => r.filter((_, i) => i % 2 === 1));
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const spots = [];
    const steps = 8;
    for (let i = 1; i < steps; i++) {
      for (let j = 1; j < steps; j++) {
        const x = x0 + ((x1 - x0) * i) / steps;
        const y = y0 + ((y1 - y0) * j) / steps;
        if (rings.filter((r) => vmInside(r, x, y)).length % 2) spots.push([x, y]);
      }
    }
    spots.sort((a, b) => Math.hypot(a[0] - center[0], a[1] - center[1]) - Math.hypot(b[0] - center[0], b[1] - center[1]));
    const out = [center, ...spots];
    this._spots.set(room, out);
    return out;
  }

  _applyLive(live, redraw = false) {
    if (!live || !this._view) {
      this._live = live;
      return;
    }
    const root = this.shadowRoot;
    const previous = this._live;
    this._live = live;
    this._renderHead();
    this._updateActiveRoom();

    // Charger
    const dock = root.querySelector('.dock');
    if (dock) {
      if (live.charger) {
        const [x, y] = this._tp(live.charger.x, live.charger.y);
        dock.setAttribute('style', this._pct(x, y));
      } else dock.style.display = 'none';
    }

    // No-go and no-mop zones, virtual walls
    const zones = root.querySelector('.zones');
    if (zones) {
      let html = '';
      if (this._config.show_zones) {
        for (const area of live.no_go || []) html += `<path d="${this._ringPath(area)}" fill="var(--error-color, #db4437)" fill-opacity="0.18" stroke="var(--error-color, #db4437)" stroke-width="0.5"></path>`;
        for (const area of live.no_mop || []) html += `<path d="${this._ringPath(area)}" fill="#a36cf0" fill-opacity="0.16" stroke="#a36cf0" stroke-width="0.5"></path>`;
        for (const line of live.virtual_walls || []) html += `<polyline points="${this._points(line)}" stroke="var(--error-color, #db4437)" stroke-width="0.8" stroke-linecap="round"></polyline>`;
      }
      zones.innerHTML = html;
    }
    const obstacles = root.querySelector('.obstacles');
    if (obstacles) {
      obstacles.innerHTML = this._config.show_obstacles
        ? (live.obstacles || [])
            .map((o) => {
              const [x, y] = this._tp(o.x, o.y);
              return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.2" fill="var(--warning-color, #f4b400)"><title>${vmEscape(o.type || '')}</title></circle>`;
            })
            .join('')
        : '';
    }

    // Path and robot: the robot travels from where it is shown to its new position, along the new part of the path,
    // until the next update (Roborock sends one about every 30 s while cleaning)
    const flat = (live.path || []).flat();
    const robot = live.robot;
    if (redraw && this._anim) {
      // New drawing of the same data: the running move goes on
      this._anim.done = this._config.show_path ? this._points(this._anim.flat, 0, this._anim.from) : '';
    } else {
      const from = this._resumeAt(flat, previous);
      const segment = [];
      const moving = this._robotAt && robot && (from < flat.length || Math.hypot(robot.x - this._robotAt[0], robot.y - this._robotAt[1]) < 200);
      if (moving) segment.push(...this._robotAt);
      segment.push(...flat.slice(from));
      if (robot) segment.push(robot.x, robot.y);
      this._anim = {
        done: this._config.show_path ? this._points(flat, 0, from) : '',
        segment,
        lengths: this._lengths(segment),
        startTime: performance.now(),
        // Until two updates have been seen, assume the live rate (1 s): a 30 s guess made the first move crawl
      duration: moving ? Math.min((this._interval || 1000) * 0.95, 33000) : 0,
        angle: robot?.a,
        flat,
        from,
      };
    }
    if (this._is3d && this._scene?.box) this._scene.setLive(live, this._anim, this._config);
    const done = root.querySelector('.path .done');
    if (done) done.setAttribute('points', this._anim.done);
    if (!this._raf) this._raf = requestAnimationFrame((t) => this._frame(t));
  }

  // Where the robot shown on the map is on the new path: the path point nearest to it, looked for around the end of
  // the previous path, else anywhere near the end (Roborock may shorten or resample the path). The new part starts
  // there. No such point (new cleaning, other map): the whole path is already done.
  _resumeAt(flat, previous) {
    if (!this._robotAt || !previous) return flat.length;
    const [rx, ry] = this._robotAt;
    const near = (lo, hi) => {
      let best = -1;
      let bestD = 15 * 15; // 75 cm
      for (let i = lo - (lo % 2); i < hi; i += 2) {
        const d = (flat[i] - rx) ** 2 + (flat[i + 1] - ry) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    };
    const before = (previous.path || []).flat().length;
    let at = near(Math.max(0, before - 800), Math.min(flat.length, before + 200));
    if (at < 0) at = near(Math.max(0, flat.length - 4000), flat.length);
    return at < 0 ? flat.length : at + 2;
  }

  _lengths(seg) {
    const out = [0];
    for (let i = 2; i < seg.length; i += 2) out.push(out[out.length - 1] + Math.hypot(seg[i] - seg[i - 2], seg[i + 1] - seg[i - 1]));
    return out;
  }

  _frame(time) {
    this._raf = 0;
    const anim = this._anim;
    const root = this.shadowRoot;
    if (!anim || !root || !this.isConnected) return;
    const total = anim.lengths[anim.lengths.length - 1] || 0;
    const progress = anim.duration ? Math.min((time - anim.startTime) / anim.duration, 1) : 1;
    const target = total * progress;
    let i = 1;
    while (i < anim.lengths.length - 1 && anim.lengths[i] < target) i++;
    const seg = anim.segment;
    if (seg.length < 2) return;
    let x = seg[seg.length - 2];
    let y = seg[seg.length - 1];
    let dir = null;
    if (anim.lengths.length > 1 && total > 0) {
      const l0 = anim.lengths[i - 1];
      const l1 = anim.lengths[i];
      const f = l1 > l0 ? (target - l0) / (l1 - l0) : 1;
      const ax = seg[(i - 1) * 2];
      const ay = seg[(i - 1) * 2 + 1];
      const bx = seg[i * 2];
      const by = seg[i * 2 + 1];
      x = ax + (bx - ax) * f;
      y = ay + (by - ay) * f;
      if (bx !== ax || by !== ay) dir = Math.atan2(by - ay, bx - ax);
    }
    this._robotAt = [x, y];
    let turning = 0;
    const tail = root.querySelector('.path .tail');
    if (tail) tail.setAttribute('points', this._config.show_path ? `${this._points(seg, 0, i * 2)}${this._points([x, y])}` : '');
    const robot = root.querySelector('.robot');
    if (robot) {
      const [px, py] = this._tp(x, y);
      if (dir !== null) {
        const [dx, dy] = this._tp(x + Math.cos(dir), y + Math.sin(dir));
        this._target = (Math.atan2(dy - py, dx - px) * 180) / Math.PI;
      } else if (this._target === undefined && anim.angle != null) this._target = -anim.angle;
      // The robot turns towards where it goes (about a quarter turn in 0.25 s) instead of snapping round
      const dt = this._lastFrame ? Math.min((time - this._lastFrame) / 1000, 0.1) : 1;
      this._lastFrame = time;
      if (this._target !== undefined) {
        if (this._heading === undefined) this._heading = this._target;
        turning = ((this._target - this._heading + 540) % 360) - 180;
        this._heading += turning * Math.min(1, dt * 8);
      }
      robot.style.display = '';
      robot.setAttribute('transform', `translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${(this._heading || 0).toFixed(1)})`);
    }
    if (this._is3d && this._scene?.box) this._scene.setRobot(x, y, this._heading, [...seg.slice(0, i * 2), x, y], this._config.show_path);
    const moving = progress < 1 || Math.abs(turning) > 1;
    if (!moving) this._lastFrame = 0;
    if (moving && !document.hidden) this._raf = requestAnimationFrame((t) => this._frame(t));
    else if (moving) setTimeout(() => !this._raf && (this._raf = requestAnimationFrame((t) => this._frame(t))), 1000);
  }

  _updateActiveRoom() {
    const root = this.shadowRoot;
    if (!root || !this._geometry) return;
    const state = this._hass?.states[this._config.entity]?.state;
    const active = state === 'cleaning' ? (this._live?.room ?? null) : null;
    if (active === this._active) return;
    this._active = active;
    for (const path of root.querySelectorAll('.room')) {
      const on = active != null && Number(path.dataset.room) === active;
      path.setAttribute('fill-opacity', active == null ? '0.38' : on ? '0.85' : '0.22');
      if (on) path.setAttribute('data-active', '');
      else path.removeAttribute('data-active');
    }
    for (const label of root.querySelectorAll('.labels .label')) {
      label.classList.toggle('dim', active != null && Number(label.dataset.room) !== active);
    }
    if (this._is3d && this._scene?.box) this._scene.setActive(active);
  }
}
