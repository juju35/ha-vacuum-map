// Vacuum Map card: a clean, live map of a Roborock vacuum, drawn from the vectors the vacuum_map integration sends.
// Vanilla JS, no dependency. Served by the integration at /vacuum_map/vacuum-map-card.js.

const VACUUM_MAP_CARD_VERSION = '1.0.0';

const VM_STRINGS = {
  en: { loading: 'Loading the map…', no_map: 'No map for this vacuum yet', not_set_up: 'Set up the Vacuum Map integration first', no_entity: 'Choose a vacuum', e_entity: 'Vacuum', e_title: 'Title', e_rotation: 'Rotation', e_labels: 'Room names', e_path: 'Path', e_zones: 'No-go zones', e_obstacles: 'Obstacles' },
  fr: { loading: 'Chargement de la carte…', no_map: 'Pas encore de carte pour cet aspirateur', not_set_up: "Configurez d'abord l'intégration Vacuum Map", no_entity: 'Choisissez un aspirateur', e_entity: 'Aspirateur', e_title: 'Titre', e_rotation: 'Rotation', e_labels: 'Noms des pièces', e_path: 'Trajet', e_zones: 'Zones interdites', e_obstacles: 'Obstacles' },
  de: { loading: 'Karte wird geladen…', no_map: 'Noch keine Karte für diesen Sauger', not_set_up: 'Richte zuerst die Vacuum-Map-Integration ein', no_entity: 'Wähle einen Sauger', e_entity: 'Sauger', e_title: 'Titel', e_rotation: 'Drehung', e_labels: 'Raumnamen', e_path: 'Weg', e_zones: 'Sperrzonen', e_obstacles: 'Hindernisse' },
  es: { loading: 'Cargando el mapa…', no_map: 'Aún no hay mapa para este robot', not_set_up: 'Configura primero la integración Vacuum Map', no_entity: 'Elige un robot aspirador', e_entity: 'Robot aspirador', e_title: 'Título', e_rotation: 'Rotación', e_labels: 'Nombres de habitaciones', e_path: 'Recorrido', e_zones: 'Zonas prohibidas', e_obstacles: 'Obstáculos' },
  it: { loading: 'Caricamento della mappa…', no_map: 'Nessuna mappa per questo robot', not_set_up: "Configura prima l'integrazione Vacuum Map", no_entity: 'Scegli un robot aspirapolvere', e_entity: 'Robot aspirapolvere', e_title: 'Titolo', e_rotation: 'Rotazione', e_labels: 'Nomi delle stanze', e_path: 'Percorso', e_zones: 'Zone vietate', e_obstacles: 'Ostacoli' },
  nl: { loading: 'Kaart laden…', no_map: 'Nog geen kaart voor deze robot', not_set_up: 'Stel eerst de Vacuum Map-integratie in', no_entity: 'Kies een robotstofzuiger', e_entity: 'Robotstofzuiger', e_title: 'Titel', e_rotation: 'Rotatie', e_labels: 'Kamernamen', e_path: 'Route', e_zones: 'Verboden zones', e_obstacles: 'Obstakels' },
  pt: { loading: 'A carregar o mapa…', no_map: 'Ainda não há mapa para este aspirador', not_set_up: 'Configure primeiro a integração Vacuum Map', no_entity: 'Escolha um aspirador', e_entity: 'Aspirador', e_title: 'Título', e_rotation: 'Rotação', e_labels: 'Nomes das divisões', e_path: 'Trajeto', e_zones: 'Zonas proibidas', e_obstacles: 'Obstáculos' },
  pl: { loading: 'Wczytywanie mapy…', no_map: 'Brak mapy dla tego odkurzacza', not_set_up: 'Najpierw skonfiguruj integrację Vacuum Map', no_entity: 'Wybierz odkurzacz', e_entity: 'Odkurzacz', e_title: 'Tytuł', e_rotation: 'Obrót', e_labels: 'Nazwy pomieszczeń', e_path: 'Trasa', e_zones: 'Strefy zakazane', e_obstacles: 'Przeszkody' },
  ro: { loading: 'Se încarcă harta…', no_map: 'Încă nu există o hartă pentru acest aspirator', not_set_up: 'Configurați mai întâi integrarea Vacuum Map', no_entity: 'Alegeți un aspirator', e_entity: 'Aspirator', e_title: 'Titlu', e_rotation: 'Rotire', e_labels: 'Numele camerelor', e_path: 'Traseu', e_zones: 'Zone interzise', e_obstacles: 'Obstacole' },
  da: { loading: 'Indlæser kortet…', no_map: 'Intet kort for denne robot endnu', not_set_up: 'Opsæt først Vacuum Map-integrationen', no_entity: 'Vælg en robotstøvsuger', e_entity: 'Robotstøvsuger', e_title: 'Titel', e_rotation: 'Rotation', e_labels: 'Rumnavne', e_path: 'Rute', e_zones: 'Forbudte zoner', e_obstacles: 'Forhindringer' },
  sv: { loading: 'Laddar kartan…', no_map: 'Ingen karta för den här roboten ännu', not_set_up: 'Konfigurera först integrationen Vacuum Map', no_entity: 'Välj en robotdammsugare', e_entity: 'Robotdammsugare', e_title: 'Titel', e_rotation: 'Rotation', e_labels: 'Rumsnamn', e_path: 'Rutt', e_zones: 'Förbjudna zoner', e_obstacles: 'Hinder' },
  bg: { loading: 'Картата се зарежда…', no_map: 'Все още няма карта за тази прахосмукачка', not_set_up: 'Първо настройте интеграцията Vacuum Map', no_entity: 'Изберете прахосмукачка', e_entity: 'Прахосмукачка', e_title: 'Заглавие', e_rotation: 'Завъртане', e_labels: 'Имена на стаите', e_path: 'Маршрут', e_zones: 'Забранени зони', e_obstacles: 'Препятствия' },
  ru: { loading: 'Загрузка карты…', no_map: 'Для этого пылесоса ещё нет карты', not_set_up: 'Сначала настройте интеграцию Vacuum Map', no_entity: 'Выберите пылесос', e_entity: 'Пылесос', e_title: 'Заголовок', e_rotation: 'Поворот', e_labels: 'Названия комнат', e_path: 'Маршрут', e_zones: 'Запретные зоны', e_obstacles: 'Препятствия' },
  uk: { loading: 'Завантаження карти…', no_map: 'Для цього пилососа ще немає карти', not_set_up: 'Спершу налаштуйте інтеграцію Vacuum Map', no_entity: 'Виберіть пилосос', e_entity: 'Пилосос', e_title: 'Заголовок', e_rotation: 'Поворот', e_labels: 'Назви кімнат', e_path: 'Маршрут', e_zones: 'Заборонені зони', e_obstacles: 'Перешкоди' },
  hu: { loading: 'Térkép betöltése…', no_map: 'Ehhez a porszívóhoz még nincs térkép', not_set_up: 'Előbb állítsa be a Vacuum Map integrációt', no_entity: 'Válasszon porszívót', e_entity: 'Porszívó', e_title: 'Cím', e_rotation: 'Elforgatás', e_labels: 'Helyiségnevek', e_path: 'Útvonal', e_zones: 'Tiltott zónák', e_obstacles: 'Akadályok' },
  sk: { loading: 'Načítava sa mapa…', no_map: 'Pre tento vysávač zatiaľ nie je mapa', not_set_up: 'Najprv nastavte integráciu Vacuum Map', no_entity: 'Vyberte vysávač', e_entity: 'Vysávač', e_title: 'Názov', e_rotation: 'Otočenie', e_labels: 'Názvy miestností', e_path: 'Trasa', e_zones: 'Zakázané zóny', e_obstacles: 'Prekážky' },
  cs: { loading: 'Načítání mapy…', no_map: 'Pro tento vysavač zatím není mapa', not_set_up: 'Nejprve nastavte integraci Vacuum Map', no_entity: 'Vyberte vysavač', e_entity: 'Vysavač', e_title: 'Název', e_rotation: 'Otočení', e_labels: 'Názvy místností', e_path: 'Trasa', e_zones: 'Zakázané zóny', e_obstacles: 'Překážky' },
  sl: { loading: 'Nalaganje zemljevida…', no_map: 'Za ta sesalnik še ni zemljevida', not_set_up: 'Najprej nastavite integracijo Vacuum Map', no_entity: 'Izberite sesalnik', e_entity: 'Sesalnik', e_title: 'Naslov', e_rotation: 'Zasuk', e_labels: 'Imena prostorov', e_path: 'Pot', e_zones: 'Prepovedana območja', e_obstacles: 'Ovire' },
  lv: { loading: 'Notiek kartes ielāde…', no_map: 'Šim putekļsūcējam vēl nav kartes', not_set_up: 'Vispirms iestatiet Vacuum Map integrāciju', no_entity: 'Izvēlieties putekļsūcēju', e_entity: 'Putekļsūcējs', e_title: 'Virsraksts', e_rotation: 'Pagrieziens', e_labels: 'Telpu nosaukumi', e_path: 'Maršruts', e_zones: 'Aizliegtās zonas', e_obstacles: 'Šķēršļi' },
  el: { loading: 'Φόρτωση χάρτη…', no_map: 'Δεν υπάρχει ακόμη χάρτης για αυτή τη σκούπα', not_set_up: 'Ρυθμίστε πρώτα την ενσωμάτωση Vacuum Map', no_entity: 'Επιλέξτε σκούπα', e_entity: 'Σκούπα', e_title: 'Τίτλος', e_rotation: 'Περιστροφή', e_labels: 'Ονόματα δωματίων', e_path: 'Διαδρομή', e_zones: 'Απαγορευμένες ζώνες', e_obstacles: 'Εμπόδια' },
  sr: { loading: 'Учитавање мапе…', no_map: 'За овај усисивач још нема мапе', not_set_up: 'Прво подесите интеграцију Vacuum Map', no_entity: 'Изаберите усисивач', e_entity: 'Усисивач', e_title: 'Наслов', e_rotation: 'Ротација', e_labels: 'Називи просторија', e_path: 'Путања', e_zones: 'Забрањене зоне', e_obstacles: 'Препреке' },
  'sr-Latn': { loading: 'Učitavanje mape…', no_map: 'Za ovaj usisivač još nema mape', not_set_up: 'Prvo podesite integraciju Vacuum Map', no_entity: 'Izaberite usisivač', e_entity: 'Usisivač', e_title: 'Naslov', e_rotation: 'Rotacija', e_labels: 'Nazivi prostorija', e_path: 'Putanja', e_zones: 'Zabranjene zone', e_obstacles: 'Prepreke' },
};

function vmLang(hass) {
  const lang = hass?.locale?.language || hass?.language || 'en';
  if (VM_STRINGS[lang]) return lang;
  if (lang.startsWith('sr')) return lang.toLowerCase().includes('latn') ? 'sr-Latn' : 'sr';
  const base = lang.split('-')[0];
  return VM_STRINGS[base] ? base : 'en';
}

function vmT(hass, key) {
  return VM_STRINGS[vmLang(hass)][key] ?? VM_STRINGS.en[key] ?? key;
}

// Soft room colors, readable on light and dark themes
const VM_PALETTE = ['#7f9cf5', '#5dcaa5', '#efc56a', '#f0997b', '#ed93b1', '#85b7eb', '#a3d977', '#c6a3f0'];

// Room icon from its name, in the languages of the card (accents removed, lower case)
const VM_ICONS = [
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

function vmRoomIcon(name) {
  const key = (name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  for (const [pattern, icon] of VM_ICONS) if (pattern.test(key)) return icon;
  return 'mdi:square-rounded-outline';
}

function vmEscape(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Vacuum state → tone of the header badge and status pill
function vmTone(state) {
  if (['error', 'unavailable'].includes(state)) return 'error';
  if (['cleaning', 'returning'].includes(state)) return 'active';
  if (state === 'paused') return 'warning';
  if (['docked', 'idle'].includes(state)) return 'ok';
  return 'idle';
}

const VM_STYLE = `
:host { display: block; }
ha-card { padding: 16px; overflow: hidden; }
.head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.badge { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  flex: none; background: color-mix(in srgb, var(--vm-tone) 18%, transparent); color: var(--vm-tone); }
.badge ha-icon { --mdc-icon-size: 22px; }
.titles { flex: 1; min-width: 0; }
.title { font-size: 16px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pill { flex: none; font-size: 12px; padding: 3px 10px; border-radius: 999px; color: var(--vm-tone);
  background: color-mix(in srgb, var(--vm-tone) 14%, transparent); }
.map { position: relative; width: 100%; margin: 0 auto; }
.map > svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.labels { position: absolute; inset: 0; pointer-events: none; }
.label { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 4px;
  font-size: 11px; line-height: 1; white-space: nowrap; padding: 2px 7px 2px 2px; border-radius: 999px;
  color: var(--primary-text-color); background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 78%, transparent); }
.label .ic { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #12151b; }
.label .ic ha-icon { --mdc-icon-size: 12px; }
.label.dim { opacity: 0.75; }
.label.compact { padding: 2px; }
.label.compact .name { display: none; }
.dock { position: absolute; transform: translate(-50%, -50%); width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: var(--vm-accent);
  background: var(--card-background-color, #1c1c1c); border: 1.5px solid var(--vm-accent); }
.dock ha-icon { --mdc-icon-size: 13px; }
.msg { padding: 32px 8px; text-align: center; color: var(--secondary-text-color); font-size: 14px; }
.room { transition: fill-opacity 0.6s ease; }
`;

class VacuumMapCard extends HTMLElement {
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
    this._config = {
      rotation: 0,
      show_labels: true,
      show_path: true,
      show_zones: true,
      show_obstacles: false,
      ...config,
    };
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>${VM_STYLE}</style><ha-card><div class="head"></div><div class="body"></div></ha-card>`;
    }
    if (previous && (previous.entity !== this._config.entity || previous.map !== this._config.map)) this._resubscribe();
    else this._drawAll();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    this._renderHead();
    if (first || !this._unsub) this._subscribe();
    this._updateActiveRoom();
  }

  getCardSize() {
    return 7;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, min_rows: 4 };
  }

  connectedCallback() {
    if (this._hass && !this._unsub) this._subscribe();
    const box = this.shadowRoot?.querySelector('.labels');
    if (this._resize && box) this._resize.observe(box);
  }

  disconnectedCallback() {
    this._unsubscribe();
    this._resize?.disconnect();
    cancelAnimationFrame(this._raf);
    this._raf = 0;
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
      this._geometry = event.geometry;
      this._live = null;
      this._robotAt = null;
      this._drawAll();
    }
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

  _renderHead() {
    const head = this.shadowRoot?.querySelector('.head');
    if (!head || !this._hass) return;
    const stateObj = this._hass.states[this._config.entity];
    const state = stateObj?.state ?? 'unavailable';
    const tone = { error: 'var(--error-color, #db4437)', active: 'var(--info-color, #4f8ef7)', warning: 'var(--warning-color, #f4b400)', ok: 'var(--success-color, #43a047)', idle: 'var(--secondary-text-color)' }[vmTone(state)];
    const title = this._config.title || stateObj?.attributes?.friendly_name || this._config.entity || '';
    const status = stateObj ? (this._hass.formatEntityState?.(stateObj) ?? state) : '';
    const sub = this._geometry ? this._subtitle() : '';
    const key = `${tone}|${title}|${status}|${sub}`;
    if (key === this._headKey) return;
    this._headKey = key;
    this.style.setProperty('--vm-tone', tone);
    head.innerHTML = `<div class="badge"><ha-icon icon="mdi:robot-vacuum"></ha-icon></div>
      <div class="titles"><div class="title">${vmEscape(title)}</div>${sub ? `<div class="sub">${vmEscape(sub)}</div>` : ''}</div>
      ${status ? `<div class="pill">${vmEscape(status)}</div>` : ''}`;
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
        return `<path class="room" data-room="${room.id}" d="${d}" fill="${style.color}" fill-opacity="0.38" fill-rule="evenodd"></path>`;
      })
      .join('');
    const floor = g.floor.map((ring) => this._ringPath(ring)).join('');
    const walls = g.walls.map((ring) => this._ringPath(ring)).join('');
    body.innerHTML = `<div class="map" style="aspect-ratio:${vw.toFixed(1)} / ${vh.toFixed(1)};max-height:${this._config.max_height || '70vh'}">
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
    </div>`;
    this.style.setProperty('--vm-accent', 'var(--info-color, #4f8ef7)');
    this._drawLabels();
    this._active = undefined; // new elements: apply the active room again
    if (this._live) this._applyLive(this._live, true);
  }

  _pct(x, y) {
    const [vx, vy, vw, vh] = this._view;
    return `left:${(((x - vx) / vw) * 100).toFixed(2)}%;top:${(((y - vy) / vh) * 100).toFixed(2)}%`;
  }

  _drawLabels() {
    const box = this.shadowRoot.querySelector('.labels');
    if (!box) return;
    let html = '';
    if (this._config.show_labels) {
      this._geometry.rooms.forEach((room, i) => {
        const style = this._roomStyle(room, i);
        if (style.hidden) return;
        const [x, y] = this._tp(room.center[0], room.center[1]);
        html += `<div class="label" data-room="${room.id}" style="${this._pct(x, y)}"><span class="ic" style="background:${style.color}"><ha-icon icon="${vmEscape(style.icon)}"></ha-icon></span><span class="name">${vmEscape(style.name)}</span></div>`;
      });
    }
    html += '<div class="dock" style="display:none"><ha-icon icon="mdi:lightning-bolt"></ha-icon></div>';
    box.innerHTML = html;
    if (!this._resize) {
      this._resize = new ResizeObserver(() => this._fitLabels());
    }
    this._resize.disconnect();
    this._resize.observe(box);
  }

  // A name wider than its room shows the icon alone (the name stays as a tooltip)
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
      label.classList.remove('compact');
      const fits = label.offsetWidth <= (max - min) * scale - 4;
      label.classList.toggle('compact', !fits);
      label.title = fits ? '' : label.textContent;
    }
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

    // Path and robot: the robot travels the new part of the path until the next update
    const flat = (live.path || []).flat();
    const robot = live.robot;
    const prevFlat = previous && !redraw ? (previous.path || []).flat() : null;
    // Same cleaning run: the path grew. Anything else (new run, other map, redraw): no animation
    const animate = !!prevFlat?.length && flat.length >= prevFlat.length && flat[0] === prevFlat[0] && flat[1] === prevFlat[1];
    const from = animate ? prevFlat.length : flat.length;
    const segment = [];
    if (animate && this._robotAt) segment.push(...this._robotAt);
    segment.push(...flat.slice(from));
    if (robot) segment.push(robot.x, robot.y);
    this._anim = {
      done: this._config.show_path ? this._points(flat, 0, from) : '',
      segment,
      lengths: this._lengths(segment),
      startTime: performance.now(),
      duration: animate ? Math.min((this._interval || 30000) * 0.95, 33000) : 0,
      angle: robot?.a,
    };
    const done = root.querySelector('.path .done');
    if (done) done.setAttribute('points', this._anim.done);
    if (!this._raf) this._raf = requestAnimationFrame((t) => this._frame(t));
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
    const tail = root.querySelector('.path .tail');
    if (tail) tail.setAttribute('points', this._config.show_path ? `${this._points(seg, 0, i * 2)}${this._points([x, y])}` : '');
    const robot = root.querySelector('.robot');
    if (robot) {
      const [px, py] = this._tp(x, y);
      if (dir !== null) {
        const [dx, dy] = this._tp(x + Math.cos(dir), y + Math.sin(dir));
        this._heading = (Math.atan2(dy - py, dx - px) * 180) / Math.PI;
      } else if (this._heading === undefined && anim.angle != null) this._heading = -anim.angle;
      robot.style.display = '';
      robot.setAttribute('transform', `translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${(this._heading || 0).toFixed(1)})`);
    }
    if (progress < 1 && !document.hidden) this._raf = requestAnimationFrame((t) => this._frame(t));
    else if (progress < 1) setTimeout(() => !this._raf && (this._raf = requestAnimationFrame((t) => this._frame(t))), 1000);
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
    for (const label of root.querySelectorAll('.label')) {
      label.classList.toggle('dim', active != null && Number(label.dataset.room) !== active);
    }
  }
}

class VacuumMapCardEditor extends HTMLElement {
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
        this._config = ev.detail.value;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = [
      { name: 'entity', required: true, selector: { entity: { domain: 'vacuum' } } },
      { name: 'title', selector: { text: {} } },
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
        ],
      },
    ];
    this._form.data = {
      show_labels: true,
      show_path: true,
      show_zones: true,
      show_obstacles: false,
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
