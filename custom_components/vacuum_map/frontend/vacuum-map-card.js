// Vacuum Map card: a clean, live map of a Roborock vacuum, drawn from the vectors the vacuum_map integration sends.
// Vanilla JS, no dependency. Served by the integration at /vacuum_map/vacuum-map-card.js.

const VACUUM_MAP_CARD_VERSION = '1.4.0';

const VM_STRINGS = {
  en: { loading: 'Loading the map…', no_map: 'No map for this vacuum yet', not_set_up: 'Set up the Vacuum Map integration first', no_entity: 'Choose a vacuum', e_entity: 'Vacuum', e_title: 'Title', e_rotation: 'Rotation', e_labels: 'Room names', e_path: 'Path', e_zones: 'No-go zones', e_obstacles: 'Obstacles', fullscreen: 'Full screen', close: 'Close', e_view: 'View', e_view_toggle: '2D / 3D button', e_fullscreen: 'Full screen button' },
  fr: { loading: 'Chargement de la carte…', no_map: 'Pas encore de carte pour cet aspirateur', not_set_up: "Configurez d'abord l'intégration Vacuum Map", no_entity: 'Choisissez un aspirateur', e_entity: 'Aspirateur', e_title: 'Titre', e_rotation: 'Rotation', e_labels: 'Noms des pièces', e_path: 'Trajet', e_zones: 'Zones interdites', e_obstacles: 'Obstacles', fullscreen: 'Plein écran', close: 'Fermer', e_view: 'Vue', e_view_toggle: 'Bouton 2D / 3D', e_fullscreen: 'Bouton plein écran' },
  de: { loading: 'Karte wird geladen…', no_map: 'Noch keine Karte für diesen Sauger', not_set_up: 'Richte zuerst die Vacuum-Map-Integration ein', no_entity: 'Wähle einen Sauger', e_entity: 'Sauger', e_title: 'Titel', e_rotation: 'Drehung', e_labels: 'Raumnamen', e_path: 'Weg', e_zones: 'Sperrzonen', e_obstacles: 'Hindernisse', fullscreen: 'Vollbild', close: 'Schließen', e_view: 'Ansicht', e_view_toggle: '2D-/3D-Schaltfläche', e_fullscreen: 'Vollbild-Schaltfläche' },
  es: { loading: 'Cargando el mapa…', no_map: 'Aún no hay mapa para este robot', not_set_up: 'Configura primero la integración Vacuum Map', no_entity: 'Elige un robot aspirador', e_entity: 'Robot aspirador', e_title: 'Título', e_rotation: 'Rotación', e_labels: 'Nombres de habitaciones', e_path: 'Recorrido', e_zones: 'Zonas prohibidas', e_obstacles: 'Obstáculos', fullscreen: 'Pantalla completa', close: 'Cerrar', e_view: 'Vista', e_view_toggle: 'Botón 2D / 3D', e_fullscreen: 'Botón de pantalla completa' },
  it: { loading: 'Caricamento della mappa…', no_map: 'Nessuna mappa per questo robot', not_set_up: "Configura prima l'integrazione Vacuum Map", no_entity: 'Scegli un robot aspirapolvere', e_entity: 'Robot aspirapolvere', e_title: 'Titolo', e_rotation: 'Rotazione', e_labels: 'Nomi delle stanze', e_path: 'Percorso', e_zones: 'Zone vietate', e_obstacles: 'Ostacoli', fullscreen: 'Schermo intero', close: 'Chiudi', e_view: 'Vista', e_view_toggle: 'Pulsante 2D / 3D', e_fullscreen: 'Pulsante schermo intero' },
  nl: { loading: 'Kaart laden…', no_map: 'Nog geen kaart voor deze robot', not_set_up: 'Stel eerst de Vacuum Map-integratie in', no_entity: 'Kies een robotstofzuiger', e_entity: 'Robotstofzuiger', e_title: 'Titel', e_rotation: 'Rotatie', e_labels: 'Kamernamen', e_path: 'Route', e_zones: 'Verboden zones', e_obstacles: 'Obstakels', fullscreen: 'Volledig scherm', close: 'Sluiten', e_view: 'Weergave', e_view_toggle: '2D/3D-knop', e_fullscreen: 'Knop volledig scherm' },
  pt: { loading: 'A carregar o mapa…', no_map: 'Ainda não há mapa para este aspirador', not_set_up: 'Configure primeiro a integração Vacuum Map', no_entity: 'Escolha um aspirador', e_entity: 'Aspirador', e_title: 'Título', e_rotation: 'Rotação', e_labels: 'Nomes das divisões', e_path: 'Trajeto', e_zones: 'Zonas proibidas', e_obstacles: 'Obstáculos', fullscreen: 'Ecrã inteiro', close: 'Fechar', e_view: 'Vista', e_view_toggle: 'Botão 2D / 3D', e_fullscreen: 'Botão de ecrã inteiro' },
  pl: { loading: 'Wczytywanie mapy…', no_map: 'Brak mapy dla tego odkurzacza', not_set_up: 'Najpierw skonfiguruj integrację Vacuum Map', no_entity: 'Wybierz odkurzacz', e_entity: 'Odkurzacz', e_title: 'Tytuł', e_rotation: 'Obrót', e_labels: 'Nazwy pomieszczeń', e_path: 'Trasa', e_zones: 'Strefy zakazane', e_obstacles: 'Przeszkody', fullscreen: 'Pełny ekran', close: 'Zamknij', e_view: 'Widok', e_view_toggle: 'Przycisk 2D / 3D', e_fullscreen: 'Przycisk pełnego ekranu' },
  ro: { loading: 'Se încarcă harta…', no_map: 'Încă nu există o hartă pentru acest aspirator', not_set_up: 'Configurați mai întâi integrarea Vacuum Map', no_entity: 'Alegeți un aspirator', e_entity: 'Aspirator', e_title: 'Titlu', e_rotation: 'Rotire', e_labels: 'Numele camerelor', e_path: 'Traseu', e_zones: 'Zone interzise', e_obstacles: 'Obstacole', fullscreen: 'Ecran complet', close: 'Închide', e_view: 'Vizualizare', e_view_toggle: 'Buton 2D / 3D', e_fullscreen: 'Buton ecran complet' },
  da: { loading: 'Indlæser kortet…', no_map: 'Intet kort for denne robot endnu', not_set_up: 'Opsæt først Vacuum Map-integrationen', no_entity: 'Vælg en robotstøvsuger', e_entity: 'Robotstøvsuger', e_title: 'Titel', e_rotation: 'Rotation', e_labels: 'Rumnavne', e_path: 'Rute', e_zones: 'Forbudte zoner', e_obstacles: 'Forhindringer', fullscreen: 'Fuld skærm', close: 'Luk', e_view: 'Visning', e_view_toggle: '2D/3D-knap', e_fullscreen: 'Knap til fuld skærm' },
  sv: { loading: 'Laddar kartan…', no_map: 'Ingen karta för den här roboten ännu', not_set_up: 'Konfigurera först integrationen Vacuum Map', no_entity: 'Välj en robotdammsugare', e_entity: 'Robotdammsugare', e_title: 'Titel', e_rotation: 'Rotation', e_labels: 'Rumsnamn', e_path: 'Rutt', e_zones: 'Förbjudna zoner', e_obstacles: 'Hinder', fullscreen: 'Helskärm', close: 'Stäng', e_view: 'Vy', e_view_toggle: '2D/3D-knapp', e_fullscreen: 'Helskärmsknapp' },
  bg: { loading: 'Картата се зарежда…', no_map: 'Все още няма карта за тази прахосмукачка', not_set_up: 'Първо настройте интеграцията Vacuum Map', no_entity: 'Изберете прахосмукачка', e_entity: 'Прахосмукачка', e_title: 'Заглавие', e_rotation: 'Завъртане', e_labels: 'Имена на стаите', e_path: 'Маршрут', e_zones: 'Забранени зони', e_obstacles: 'Препятствия', fullscreen: 'Цял екран', close: 'Затвори', e_view: 'Изглед', e_view_toggle: 'Бутон 2D / 3D', e_fullscreen: 'Бутон за цял екран' },
  ru: { loading: 'Загрузка карты…', no_map: 'Для этого пылесоса ещё нет карты', not_set_up: 'Сначала настройте интеграцию Vacuum Map', no_entity: 'Выберите пылесос', e_entity: 'Пылесос', e_title: 'Заголовок', e_rotation: 'Поворот', e_labels: 'Названия комнат', e_path: 'Маршрут', e_zones: 'Запретные зоны', e_obstacles: 'Препятствия', fullscreen: 'Полный экран', close: 'Закрыть', e_view: 'Вид', e_view_toggle: 'Кнопка 2D / 3D', e_fullscreen: 'Кнопка полного экрана' },
  uk: { loading: 'Завантаження карти…', no_map: 'Для цього пилососа ще немає карти', not_set_up: 'Спершу налаштуйте інтеграцію Vacuum Map', no_entity: 'Виберіть пилосос', e_entity: 'Пилосос', e_title: 'Заголовок', e_rotation: 'Поворот', e_labels: 'Назви кімнат', e_path: 'Маршрут', e_zones: 'Заборонені зони', e_obstacles: 'Перешкоди', fullscreen: 'Повний екран', close: 'Закрити', e_view: 'Вигляд', e_view_toggle: 'Кнопка 2D / 3D', e_fullscreen: 'Кнопка повного екрана' },
  hu: { loading: 'Térkép betöltése…', no_map: 'Ehhez a porszívóhoz még nincs térkép', not_set_up: 'Előbb állítsa be a Vacuum Map integrációt', no_entity: 'Válasszon porszívót', e_entity: 'Porszívó', e_title: 'Cím', e_rotation: 'Elforgatás', e_labels: 'Helyiségnevek', e_path: 'Útvonal', e_zones: 'Tiltott zónák', e_obstacles: 'Akadályok', fullscreen: 'Teljes képernyő', close: 'Bezárás', e_view: 'Nézet', e_view_toggle: '2D / 3D gomb', e_fullscreen: 'Teljes képernyő gomb' },
  sk: { loading: 'Načítava sa mapa…', no_map: 'Pre tento vysávač zatiaľ nie je mapa', not_set_up: 'Najprv nastavte integráciu Vacuum Map', no_entity: 'Vyberte vysávač', e_entity: 'Vysávač', e_title: 'Názov', e_rotation: 'Otočenie', e_labels: 'Názvy miestností', e_path: 'Trasa', e_zones: 'Zakázané zóny', e_obstacles: 'Prekážky', fullscreen: 'Celá obrazovka', close: 'Zavrieť', e_view: 'Zobrazenie', e_view_toggle: 'Tlačidlo 2D / 3D', e_fullscreen: 'Tlačidlo celej obrazovky' },
  cs: { loading: 'Načítání mapy…', no_map: 'Pro tento vysavač zatím není mapa', not_set_up: 'Nejprve nastavte integraci Vacuum Map', no_entity: 'Vyberte vysavač', e_entity: 'Vysavač', e_title: 'Název', e_rotation: 'Otočení', e_labels: 'Názvy místností', e_path: 'Trasa', e_zones: 'Zakázané zóny', e_obstacles: 'Překážky', fullscreen: 'Celá obrazovka', close: 'Zavřít', e_view: 'Zobrazení', e_view_toggle: 'Tlačítko 2D / 3D', e_fullscreen: 'Tlačítko celé obrazovky' },
  sl: { loading: 'Nalaganje zemljevida…', no_map: 'Za ta sesalnik še ni zemljevida', not_set_up: 'Najprej nastavite integracijo Vacuum Map', no_entity: 'Izberite sesalnik', e_entity: 'Sesalnik', e_title: 'Naslov', e_rotation: 'Zasuk', e_labels: 'Imena prostorov', e_path: 'Pot', e_zones: 'Prepovedana območja', e_obstacles: 'Ovire', fullscreen: 'Celoten zaslon', close: 'Zapri', e_view: 'Pogled', e_view_toggle: 'Gumb 2D / 3D', e_fullscreen: 'Gumb za celoten zaslon' },
  lv: { loading: 'Notiek kartes ielāde…', no_map: 'Šim putekļsūcējam vēl nav kartes', not_set_up: 'Vispirms iestatiet Vacuum Map integrāciju', no_entity: 'Izvēlieties putekļsūcēju', e_entity: 'Putekļsūcējs', e_title: 'Virsraksts', e_rotation: 'Pagrieziens', e_labels: 'Telpu nosaukumi', e_path: 'Maršruts', e_zones: 'Aizliegtās zonas', e_obstacles: 'Šķēršļi', fullscreen: 'Pilnekrāns', close: 'Aizvērt', e_view: 'Skats', e_view_toggle: '2D / 3D poga', e_fullscreen: 'Pilnekrāna poga' },
  el: { loading: 'Φόρτωση χάρτη…', no_map: 'Δεν υπάρχει ακόμη χάρτης για αυτή τη σκούπα', not_set_up: 'Ρυθμίστε πρώτα την ενσωμάτωση Vacuum Map', no_entity: 'Επιλέξτε σκούπα', e_entity: 'Σκούπα', e_title: 'Τίτλος', e_rotation: 'Περιστροφή', e_labels: 'Ονόματα δωματίων', e_path: 'Διαδρομή', e_zones: 'Απαγορευμένες ζώνες', e_obstacles: 'Εμπόδια', fullscreen: 'Πλήρης οθόνη', close: 'Κλείσιμο', e_view: 'Προβολή', e_view_toggle: 'Κουμπί 2D / 3D', e_fullscreen: 'Κουμπί πλήρους οθόνης' },
  sr: { loading: 'Учитавање мапе…', no_map: 'За овај усисивач још нема мапе', not_set_up: 'Прво подесите интеграцију Vacuum Map', no_entity: 'Изаберите усисивач', e_entity: 'Усисивач', e_title: 'Наслов', e_rotation: 'Ротација', e_labels: 'Називи просторија', e_path: 'Путања', e_zones: 'Забрањене зоне', e_obstacles: 'Препреке', fullscreen: 'Цео екран', close: 'Затвори', e_view: 'Приказ', e_view_toggle: 'Дугме 2D / 3D', e_fullscreen: 'Дугме за цео екран' },
  'sr-Latn': { loading: 'Učitavanje mape…', no_map: 'Za ovaj usisivač još nema mape', not_set_up: 'Prvo podesite integraciju Vacuum Map', no_entity: 'Izaberite usisivač', e_entity: 'Usisivač', e_title: 'Naslov', e_rotation: 'Rotacija', e_labels: 'Nazivi prostorija', e_path: 'Putanja', e_zones: 'Zabranjene zone', e_obstacles: 'Prepreke', fullscreen: 'Ceo ekran', close: 'Zatvori', e_view: 'Prikaz', e_view_toggle: 'Dugme 2D / 3D', e_fullscreen: 'Dugme za ceo ekran' },
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

// three.js, served by the integration and loaded only for the 3D view
const VM_THREE_URL = '/vacuum_map/vendor/three.min.js';
let vmThree = null;
function vmLoadThree() {
  vmThree ??= import(`${VM_THREE_URL}?v=${VACUUM_MAP_CARD_VERSION}`).catch((err) => {
    vmThree = null;
    throw err;
  });
  return vmThree;
}

// Walls of the 3D view, in map pixels (1 px = 5 cm): 60 cm, low like in the Roborock app, so rooms stay visible
const VM_WALL_HEIGHT = 12;
const VM_FLOOR_HEIGHT = 0.8;

function vmRingArea(ring) {
  let area = 0;
  for (let i = 0; i < ring.length; i += 2) {
    const j = (i + 2) % ring.length;
    area += ring[i] * ring[j + 1] - ring[j] * ring[i + 1];
  }
  return area / 2;
}

function vmInside(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const [xi, yi, xj, yj] = [ring[i], ring[i + 1], ring[j], ring[j + 1]];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Rings as polygons with holes: traced with the inside on their right, outer rings have a positive area (y down)
function vmPolygons(rings) {
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

// The 3D view: floors, walls, zones, path and robot, drawn by three.js; rendered only when something changes
class VmScene {
  constructor(T, card) {
    this.T = T;
    this.card = card;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFShadowMap;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    this.renderer = renderer;
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(36, 1, 1, 10000);
    this.scene.add(new T.HemisphereLight(0xe4eaff, 0x1c2028, 1.1));
    this.sun = new T.DirectionalLight(0xffffff, 1.3);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.scene.add(this.sun, this.sun.target);
    this.fixed = new T.Group();
    this.moving = new T.Group();
    this.scene.add(this.fixed, this.moving);
    this.robot = this._robot();
    this.robot.visible = false;
    this.scene.add(this.robot);
    this.tail = null;
    this.rooms = new Map();
    this.labels = [];
    this.v = new T.Vector3();
    this._listen();
    this.home();
  }

  attach(box, labelsBox) {
    this.box = box;
    this.labelsBox = labelsBox;
    box.appendChild(this.renderer.domElement);
    this.resizer?.disconnect();
    this.resizer = new ResizeObserver(() => this.resize());
    this.resizer.observe(box);
    this.resize();
  }

  resize() {
    const w = this.box?.clientWidth;
    const h = this.box?.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.request();
  }

  home() {
    this.theta = Math.PI / 2 - 0.45;
    this.phi = 0.82;
    this.zoom = 1;
    this.request();
  }

  // Map pixels (after the card's rotation) → scene: x right, z down the plan, y up
  _xz(x, y) {
    const [tx, ty] = this.card._tp(x, y);
    return [tx - this.cx, ty - this.cy];
  }

  _shape(poly) {
    const T = this.T;
    const trace = (path, ring) => {
      for (let i = 0; i < ring.length; i += 2) {
        const [x, z] = this._xz(ring[i], ring[i + 1]);
        if (i) path.lineTo(x, -z);
        else path.moveTo(x, -z);
      }
      return path;
    };
    const shape = trace(new T.Shape(), poly.outer);
    for (const hole of poly.holes) shape.holes.push(trace(new T.Path(), hole));
    return shape;
  }

  // One mesh for the polygons of these rings. A polygon three.js cannot triangulate is left out (and logged): the rest
  // of the map is still drawn.
  _slab(rings, depth, material) {
    const T = this.T;
    const make = (shapes) => (depth ? new T.ExtrudeGeometry(shapes, { depth, bevelEnabled: false }) : new T.ShapeGeometry(shapes));
    const shapes = vmPolygons(rings).map((p) => this._shape(p));
    if (!shapes.length) return null;
    let geometry;
    try {
      geometry = make(shapes);
    } catch (err) {
      console.warn('vacuum-map-card: 3D shapes drawn one by one', err);
      const kept = shapes.filter((shape) => {
        try {
          make([shape]).dispose();
          return true;
        } catch {
          return false;
        }
      });
      if (!kept.length) return null;
      geometry = make(kept);
    }
    if (!geometry.attributes.position?.count || Number.isNaN(geometry.attributes.position.array[0])) {
      console.warn('vacuum-map-card: empty or invalid 3D shape', rings.length);
      geometry.dispose();
      return null;
    }
    const mesh = new T.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.castShadow = depth > 2;
    return mesh;
  }

  _theme() {
    const css = getComputedStyle(this.card);
    const read = (name, fallback) => {
      try {
        return new this.T.Color(css.getPropertyValue(name).trim() || fallback);
      } catch {
        return new this.T.Color(fallback);
      }
    };
    const bg = read('--card-background-color', '#1c1c1c');
    const dark = bg.r * 0.3 + bg.g * 0.59 + bg.b * 0.11 < 0.5;
    return { bg, dark };
  }

  _clear(group) {
    for (const child of [...group.children]) {
      group.remove(child);
      child.traverse((o) => {
        o.geometry?.dispose();
        if (o.material && !o.material.shared) o.material.dispose();
      });
    }
  }

  build(geometry, labelsHtml) {
    try {
      this._build(geometry, labelsHtml);
    } catch (err) {
      console.error('vacuum-map-card: 3D view', err);
    }
    this.request();
  }

  _build(geometry, labelsHtml) {
    const T = this.T;
    const [vx, vy, vw, vh] = this.card._view;
    this.cx = vx + vw / 2;
    this.cy = vy + vh / 2;
    this.span = Math.max(vw, vh);
    this._clear(this.fixed);
    this.rooms.clear();
    const theme = this._theme();
    this.themeBg = theme.bg;
    const floorColor = new T.Color(theme.dark ? '#3a404c' : '#d9dde4');
    const floor = this._slab(geometry.floor, 0, new T.MeshStandardMaterial({ color: floorColor, roughness: 0.95 }));
    if (floor) this.fixed.add(floor);
    geometry.rooms.forEach((room, i) => {
      const style = this.card._roomStyle(room, i);
      const material = new T.MeshStandardMaterial({ color: style.color, roughness: 0.85 });
      const mesh = this._slab(room.rings, VM_FLOOR_HEIGHT, material);
      if (!mesh) return;
      this.fixed.add(mesh);
      this.rooms.set(room.id, { material, color: new T.Color(style.color) });
    });
    const wallMaterial = [
      new T.MeshStandardMaterial({ color: theme.dark ? '#e9edf3' : '#ffffff', roughness: 0.6 }),
      new T.MeshStandardMaterial({ color: theme.dark ? '#8d96a6' : '#a7afbd', roughness: 0.8 }),
    ];
    const walls = this._slab(geometry.walls, VM_WALL_HEIGHT, wallMaterial);
    if (walls) this.fixed.add(walls);
    const s = this.span;
    this.sun.position.set(-s * 0.35, s * 0.9, s * 0.25);
    Object.assign(this.sun.shadow.camera, { left: -s * 0.7, right: s * 0.7, top: s * 0.7, bottom: -s * 0.7, near: 1, far: s * 3 });
    this.sun.shadow.camera.updateProjectionMatrix();
    this.robot.scale.setScalar(1.6); // a bit larger than life, to be seen from afar
    // Labels: the card's markup, placed over the projected center of each room
    this.labelsBox.innerHTML = labelsHtml;
    this.labels = [...this.labelsBox.querySelectorAll('.label')].map((el) => {
      const room = geometry.rooms.find((r) => String(r.id) === el.dataset.room);
      const [x, z] = this._xz(room.center[0], room.center[1]);
      el.style.transform = 'translate(-50%, -100%)';
      // A name too wide for its room in 2D shows the icon alone here too
      const flat = this.card.shadowRoot.querySelector(`.labels .label[data-room="${el.dataset.room}"]`);
      if (flat?.classList.contains('compact')) el.classList.add('compact');
      return { el, pos: new T.Vector3(x, VM_WALL_HEIGHT + 3, z) };
    });
    this.setActive(this.card._active ?? null);
  }

  setActive(active) {
    for (const [id, room] of this.rooms) {
      const amount = active == null ? 0.38 : id === active ? 0.95 : 0.22;
      room.material.color.copy(room.color).lerp(this.themeBg, 1 - amount);
    }
    for (const label of this.labels) label.el.classList.toggle('dim', active != null && Number(label.el.dataset.room) !== active);
    this.request();
  }

  _line(flat, from, to, color, opacity, y) {
    const T = this.T;
    const positions = [];
    for (let i = from; i < to; i += 2) {
      const [x, z] = this._xz(flat[i], flat[i + 1]);
      positions.push(x, y, z);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(positions), 3));
    return new T.Line(geometry, new T.LineBasicMaterial({ color, transparent: true, opacity }));
  }

  setLive(live, anim, config) {
    const T = this.T;
    this._clear(this.moving);
    this.tail = null;
    const lineColor = this._theme().dark ? 0xffffff : 0x1f2328;
    if (config.show_path && anim.from > 2) this.moving.add(this._line(anim.flat, 0, anim.from, lineColor, 0.55, VM_FLOOR_HEIGHT + 0.3));
    if (config.show_zones) {
      const zone = (rings, color) => {
        const mesh = this._slab(rings, 0, new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: T.DoubleSide }));
        if (mesh) {
          mesh.position.y = VM_FLOOR_HEIGHT + 0.2;
          this.moving.add(mesh);
        }
      };
      // Zones are drawn as given (corners in any order): one outer ring each
      const outer = (area) => (vmRingArea(area) > 0 ? area : area.slice().reverse().reduce((acc, _, i, a) => (i % 2 ? acc : acc.concat(a[i + 1], a[i])), []));
      zone((live.no_go || []).map(outer), 0xdb4437);
      zone((live.no_mop || []).map(outer), 0xa36cf0);
    }
    if (live.charger) {
      const dock = new T.Group();
      const base = new T.Mesh(new T.BoxGeometry(9, 8, 6), new T.MeshStandardMaterial({ color: 0x2b313c, roughness: 0.4 }));
      base.position.y = 4;
      base.castShadow = true;
      const light = new T.Mesh(new T.BoxGeometry(4, 0.6, 0.4), new T.MeshBasicMaterial({ color: 0x4f8ef7 }));
      light.position.set(0, 6.5, -3.1);
      dock.add(base, light);
      const [x, z] = this._xz(live.charger.x, live.charger.y);
      dock.position.set(x, 0, z);
      this.moving.add(dock);
    }
    this.request();
  }

  setRobot(x, y, heading, tailFlat, showPath) {
    const [px, pz] = this._xz(x, y);
    this.robot.visible = true;
    this.robot.position.set(px, VM_FLOOR_HEIGHT, pz);
    this.robot.rotation.y = (-(heading || 0) * Math.PI) / 180;
    if (this.tail) {
      this.moving.remove(this.tail);
      this.tail.geometry.dispose();
      this.tail.material.dispose();
      this.tail = null;
    }
    if (showPath && tailFlat.length >= 4) {
      this.tail = this._line(tailFlat, 0, tailFlat.length, this._theme().dark ? 0xffffff : 0x1f2328, 0.55, VM_FLOOR_HEIGHT + 0.3);
      this.moving.add(this.tail);
    }
    this.request();
  }

  // A round robot: body, top, turret, a light ring and a bumper showing where it heads (+x)
  _robot() {
    const T = this.T;
    const robot = new T.Group();
    const part = (geometry, color, y, options = {}) => {
      const mesh = new T.Mesh(geometry, new T.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.25, ...options }));
      mesh.position.y = y;
      mesh.castShadow = true;
      robot.add(mesh);
      return mesh;
    };
    part(new T.CylinderGeometry(4.6, 4.6, 2.2, 48), 0xeef1f5, 1.1);
    part(new T.CylinderGeometry(4.3, 4.3, 0.3, 48), 0xd3d8e0, 2.35);
    part(new T.CylinderGeometry(1.5, 1.5, 0.9, 32), 0x2a2f38, 2.9);
    const ring = part(new T.CylinderGeometry(4.65, 4.65, 0.25, 48, 1, true), 0x5dcaa5, 1.6, { emissive: 0x5dcaa5, emissiveIntensity: 0.8 });
    ring.castShadow = false;
    const bumper = part(new T.BoxGeometry(0.6, 1.2, 5), 0x4f8ef7, 1.2, { emissive: 0x4f8ef7, emissiveIntensity: 0.6 });
    bumper.position.x = 4.3;
    const halo = new T.Mesh(new T.RingGeometry(5.5, 7.5, 48), new T.MeshBasicMaterial({ color: 0x4f8ef7, transparent: true, opacity: 0.4, side: T.DoubleSide }));
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.15;
    robot.add(halo);
    return robot;
  }

  request() {
    if (this.pending || !this.box) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      this.render();
    });
  }

  render() {
    if (!this.span || !this.box?.isConnected) return;
    const distance = (this.span * 1.55) / this.zoom;
    this.camera.position.set(
      distance * Math.sin(this.phi) * Math.cos(this.theta),
      distance * Math.cos(this.phi),
      distance * Math.sin(this.phi) * Math.sin(this.theta),
    );
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
    const w = this.box.clientWidth;
    const h = this.box.clientHeight;
    for (const label of this.labels) {
      this.v.copy(label.pos).project(this.camera);
      const visible = this.v.z < 1;
      label.el.style.display = visible ? '' : 'none';
      if (visible) label.el.style.cssText += `;left:${(((this.v.x + 1) / 2) * w).toFixed(1)}px;top:${(((1 - this.v.y) / 2) * h).toFixed(1)}px`;
    }
  }

  // Drag to turn around the map, wheel or pinch to zoom, double-click to come back to the start view.
  // A drag is not a click: the card that shows this one (ha-vacuum-card) only gets the click of a tap.
  _listen() {
    const el = this.renderer.domElement;
    const pointers = new Map();
    let moved = 0;
    let pinch = 0;
    el.addEventListener('pointerdown', (ev) => {
      pointers.set(ev.pointerId, [ev.clientX, ev.clientY]);
      el.setPointerCapture?.(ev.pointerId);
      if (pointers.size === 1) moved = 0;
      pinch = 0;
    });
    el.addEventListener('pointermove', (ev) => {
      const last = pointers.get(ev.pointerId);
      if (!last) return;
      const dx = ev.clientX - last[0];
      const dy = ev.clientY - last[1];
      pointers.set(ev.pointerId, [ev.clientX, ev.clientY]);
      moved += Math.abs(dx) + Math.abs(dy);
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (pinch) this.zoom = Math.min(Math.max(this.zoom * (d / pinch), 0.5), 4);
        pinch = d;
      } else {
        this.theta += dx * 0.008;
        this.phi = Math.min(Math.max(this.phi - dy * 0.006, 0.12), 1.35);
      }
      this.request();
    });
    const up = (ev) => {
      pointers.delete(ev.pointerId);
      pinch = 0;
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', (ev) => moved > 6 && ev.stopPropagation(), true);
    el.addEventListener('dblclick', (ev) => {
      ev.stopPropagation();
      this.home();
    });
    el.addEventListener(
      'wheel',
      (ev) => {
        ev.preventDefault();
        this.zoom = Math.min(Math.max(this.zoom * Math.exp(-ev.deltaY * 0.0015), 0.5), 4);
        this.request();
      },
      { passive: false },
    );
  }

  dispose() {
    this.resizer?.disconnect();
    this._clear(this.fixed);
    this._clear(this.moving);
    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
    this.renderer.domElement.remove();
    this.box = null;
  }
}

// The full screen sheet, over the page (appended to the document body)
const VM_FULL_STYLE = `
.sheet { position: absolute; inset: 0; display: flex; flex-direction: column; box-sizing: border-box;
  padding: max(10px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  color: var(--primary-text-color); font-family: var(--paper-font-body1_-_font-family, inherit);
  background: linear-gradient(var(--card-background-color, #fff), var(--card-background-color, #fff)), var(--primary-background-color, #fafafa);
  animation: vm-sheet .28s cubic-bezier(.2,.8,.2,1) both; }
.sheet .head { max-width: 1800px; width: 100%; margin: 0 auto 8px; }
.stage { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
.stage vacuum-map-card { width: 100%; }
@keyframes vm-sheet { from { opacity: 0; transform: translateY(16px); } }
@media (prefers-reduced-motion: reduce) { .sheet { animation: none; } }
`;

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
.label .name { overflow: hidden; text-overflow: ellipsis; max-width: var(--vm-name-width, none); }
.label.compact { padding: 2px; }
.label.compact .name { display: none; }
.dock { position: absolute; transform: translate(-50%, -50%); width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: var(--vm-accent);
  background: var(--card-background-color, #1c1c1c); border: 1.5px solid var(--vm-accent); }
.dock ha-icon { --mdc-icon-size: 13px; }
.msg { padding: 32px 8px; text-align: center; color: var(--secondary-text-color); font-size: 14px; }
.room { transition: fill-opacity 0.6s ease; }
.three, .labels3d { position: absolute; inset: 0; display: none; }
.three { touch-action: none; cursor: grab; border-radius: 10px; overflow: hidden; }
.three:active { cursor: grabbing; }
.labels3d { pointer-events: none; overflow: hidden; }
.map.is3d .three, .map.is3d .labels3d { display: block; }
.map.is3d > svg, .map.is3d .labels { visibility: hidden; }
.vt { position: absolute; top: 4px; right: 4px; z-index: 2; display: flex; padding: 2px; border-radius: 999px;
  background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 82%, transparent); }
.vt button { border: none; background: none; font: inherit; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 999px;
  cursor: pointer; color: var(--secondary-text-color); }
.vt button.on { color: var(--primary-text-color); background: color-mix(in srgb, var(--vm-accent) 24%, transparent); }
.vt button:focus-visible { outline: 2px solid var(--vm-accent); }
.icon-btn { all: unset; flex: none; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
  color: var(--secondary-text-color); }
.icon-btn ha-icon { --mdc-icon-size: 20px; }
.icon-btn:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
.icon-btn:focus-visible { outline: 2px solid var(--vm-accent); outline-offset: 1px; }
.fs { position: absolute; top: 4px; left: 4px; z-index: 2; width: 28px; height: 28px;
  background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 82%, transparent); }
.fs ha-icon { --mdc-icon-size: 18px; }
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
      view: '2d',
      show_view_toggle: true,
      show_fullscreen: true,
      ...config,
    };
    if (!previous || previous.view !== this._config.view) this._is3d = this._config.view === '3d';
    // embedded: the map alone, without card nor header, for another card that shows it (ha-vacuum-card)
    const embedded = this._config.embedded === true;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    if (this._embedded !== embedded || !this.shadowRoot.firstChild) {
      this._embedded = embedded;
      this._headKey = null;
      this.shadowRoot.innerHTML = embedded
        ? `<style>${VM_STYLE}</style><div class="body"></div>`
        : `<style>${VM_STYLE}</style><ha-card><div class="head"></div><div class="body"></div></ha-card>`;
    }
    if (previous && (previous.entity !== this._config.entity || previous.map !== this._config.map)) this._resubscribe();
    else this._drawAll();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    this._renderHead();
    if (this._fullMap) this._fullMap.hass = hass;
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
    clearTimeout(this._leaving);
    if (this._hass && !this._unsub) this._subscribe();
    const box = this.shadowRoot?.querySelector('.labels');
    if (this._resize && box) this._resize.observe(box);
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
    const tone = { error: 'var(--error-color, #db4437)', active: 'var(--info-color, #4f8ef7)', warning: 'var(--warning-color, #f4b400)', ok: 'var(--success-color, #43a047)', idle: 'var(--secondary-text-color)' }[vmTone(state)];
    const title = this._config.title || stateObj?.attributes?.friendly_name || this._config.entity || '';
    const status = stateObj ? (this._hass.formatEntityState?.(stateObj) ?? state) : '';
    const sub = this._geometry ? this._subtitle() : '';
    const html = `<div class="badge"><ha-icon icon="mdi:robot-vacuum"></ha-icon></div>
      <div class="titles"><div class="title">${vmEscape(title)}</div>${sub ? `<div class="sub">${vmEscape(sub)}</div>` : ''}</div>
      ${status ? `<div class="pill">${vmEscape(status)}</div>` : ''}${buttons}`;
    return { tone, html };
  }

  _renderHead() {
    if (this._full) this._renderFullHead();
    const head = this.shadowRoot?.querySelector('.head');
    if (!head || !this._hass) return;
    const label = vmT(this._hass, 'fullscreen');
    const button = this._config.show_fullscreen ? `<button class="icon-btn" data-action="fullscreen" title="${label}" aria-label="${label}"><ha-icon icon="mdi:fullscreen"></ha-icon></button>` : '';
    const { tone, html } = this._head(button);
    if (html === this._headKey) return;
    this._headKey = html;
    this.style.setProperty('--vm-tone', tone);
    head.innerHTML = html;
    head.querySelector('[data-action="fullscreen"]')?.addEventListener('click', () => this.openFullscreen());
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
    this.shadowRoot?.querySelector('[data-action="fullscreen"]')?.focus({ preventScroll: true });
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
    body.innerHTML = `<div class="map" style="aspect-ratio:${vw.toFixed(1)} / ${vh.toFixed(1)};width:min(100%, calc(${this._config.max_height || '70vh'} * ${(vw / vh).toFixed(4)}))">
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
      ${this._embedded && this._config.show_fullscreen ? `<button class="icon-btn fs" data-action="fullscreen" title="${vmT(this._hass, 'fullscreen')}" aria-label="${vmT(this._hass, 'fullscreen')}"><ha-icon icon="mdi:fullscreen"></ha-icon></button>` : ''}
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
    this._drawLabels();
    this._active = undefined; // new elements: apply the active room again
    this._setView(this._is3d, true);
    if (this._live) this._applyLive(this._live, true);
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
      html += `<div class="label" data-room="${room.id}" style="${at(room)}"><span class="ic" style="background:${style.color}"><ha-icon icon="${vmEscape(style.icon)}"></ha-icon></span><span class="name">${vmEscape(style.name)}</span></div>`;
    });
    return html;
  }

  _drawLabels() {
    const box = this.shadowRoot.querySelector('.labels');
    if (!box) return;
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
        duration: moving ? Math.min((this._interval || 30000) * 0.95, 33000) : 0,
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
          { name: 'show_fullscreen', selector: { boolean: {} } },
        ],
      },
    ];
    this._form.data = {
      show_labels: true,
      show_path: true,
      show_zones: true,
      show_obstacles: false,
      show_view_toggle: true,
      show_fullscreen: true,
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
