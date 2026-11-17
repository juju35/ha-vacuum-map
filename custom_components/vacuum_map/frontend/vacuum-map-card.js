// Vacuum Map card: a clean, live map of a Roborock vacuum, drawn from the vectors the vacuum_map integration sends.
// Vanilla JS, no dependency. Served by the integration at /vacuum_map/vacuum-map-card.js.

const VACUUM_MAP_CARD_VERSION = '1.6.0';

const VM_STRINGS = {
  en: { loading: 'Loading the map…', no_map: 'No map for this vacuum yet', not_set_up: 'Set up the Vacuum Map integration first', no_entity: 'Choose a vacuum', e_entity: 'Vacuum', e_title: 'Title', e_rotation: 'Rotation', e_labels: 'Room names', e_path: 'Path', e_zones: 'No-go zones', e_obstacles: 'Obstacles', fullscreen: 'Full screen', close: 'Close', e_view: 'View', e_view_toggle: '2D / 3D button', e_fullscreen: 'Full screen button', e_illustration: 'Animated illustration', e_illustration_theme: 'Illustration theme', theme_auto: 'Automatic (sun)', theme_day: 'Day', theme_night: 'Night', e_model: 'Robot model', model_auto: 'Automatic (from the device)' },
  fr: { loading: 'Chargement de la carte…', no_map: 'Pas encore de carte pour cet aspirateur', not_set_up: "Configurez d'abord l'intégration Vacuum Map", no_entity: 'Choisissez un aspirateur', e_entity: 'Aspirateur', e_title: 'Titre', e_rotation: 'Rotation', e_labels: 'Noms des pièces', e_path: 'Trajet', e_zones: 'Zones interdites', e_obstacles: 'Obstacles', fullscreen: 'Plein écran', close: 'Fermer', e_view: 'Vue', e_view_toggle: 'Bouton 2D / 3D', e_fullscreen: 'Bouton plein écran', e_illustration: 'Illustration animée', e_illustration_theme: 'Thème de l’illustration', theme_auto: 'Automatique (soleil)', theme_day: 'Jour', theme_night: 'Nuit', e_model: 'Modèle du robot', model_auto: 'Automatique (selon l’appareil)' },
  de: { loading: 'Karte wird geladen…', no_map: 'Noch keine Karte für diesen Sauger', not_set_up: 'Richte zuerst die Vacuum-Map-Integration ein', no_entity: 'Wähle einen Sauger', e_entity: 'Sauger', e_title: 'Titel', e_rotation: 'Drehung', e_labels: 'Raumnamen', e_path: 'Weg', e_zones: 'Sperrzonen', e_obstacles: 'Hindernisse', fullscreen: 'Vollbild', close: 'Schließen', e_view: 'Ansicht', e_view_toggle: '2D-/3D-Schaltfläche', e_fullscreen: 'Vollbild-Schaltfläche', e_illustration: 'Animierte Illustration', e_illustration_theme: 'Thema der Illustration', theme_auto: 'Automatisch (Sonne)', theme_day: 'Tag', theme_night: 'Nacht', e_model: 'Robotermodell', model_auto: 'Automatisch (vom Gerät)' },
  es: { loading: 'Cargando el mapa…', no_map: 'Aún no hay mapa para este robot', not_set_up: 'Configura primero la integración Vacuum Map', no_entity: 'Elige un robot aspirador', e_entity: 'Robot aspirador', e_title: 'Título', e_rotation: 'Rotación', e_labels: 'Nombres de habitaciones', e_path: 'Recorrido', e_zones: 'Zonas prohibidas', e_obstacles: 'Obstáculos', fullscreen: 'Pantalla completa', close: 'Cerrar', e_view: 'Vista', e_view_toggle: 'Botón 2D / 3D', e_fullscreen: 'Botón de pantalla completa', e_illustration: 'Ilustración animada', e_illustration_theme: 'Tema de la ilustración', theme_auto: 'Automático (sol)', theme_day: 'Día', theme_night: 'Noche', e_model: 'Modelo del robot', model_auto: 'Automático (según el dispositivo)' },
  it: { loading: 'Caricamento della mappa…', no_map: 'Nessuna mappa per questo robot', not_set_up: "Configura prima l'integrazione Vacuum Map", no_entity: 'Scegli un robot aspirapolvere', e_entity: 'Robot aspirapolvere', e_title: 'Titolo', e_rotation: 'Rotazione', e_labels: 'Nomi delle stanze', e_path: 'Percorso', e_zones: 'Zone vietate', e_obstacles: 'Ostacoli', fullscreen: 'Schermo intero', close: 'Chiudi', e_view: 'Vista', e_view_toggle: 'Pulsante 2D / 3D', e_fullscreen: 'Pulsante schermo intero', e_illustration: 'Illustrazione animata', e_illustration_theme: 'Tema dell’illustrazione', theme_auto: 'Automatico (sole)', theme_day: 'Giorno', theme_night: 'Notte', e_model: 'Modello del robot', model_auto: 'Automatico (dal dispositivo)' },
  nl: { loading: 'Kaart laden…', no_map: 'Nog geen kaart voor deze robot', not_set_up: 'Stel eerst de Vacuum Map-integratie in', no_entity: 'Kies een robotstofzuiger', e_entity: 'Robotstofzuiger', e_title: 'Titel', e_rotation: 'Rotatie', e_labels: 'Kamernamen', e_path: 'Route', e_zones: 'Verboden zones', e_obstacles: 'Obstakels', fullscreen: 'Volledig scherm', close: 'Sluiten', e_view: 'Weergave', e_view_toggle: '2D/3D-knop', e_fullscreen: 'Knop volledig scherm', e_illustration: 'Geanimeerde illustratie', e_illustration_theme: 'Thema van de illustratie', theme_auto: 'Automatisch (zon)', theme_day: 'Dag', theme_night: 'Nacht', e_model: 'Robotmodel', model_auto: 'Automatisch (van het apparaat)' },
  pt: { loading: 'A carregar o mapa…', no_map: 'Ainda não há mapa para este aspirador', not_set_up: 'Configure primeiro a integração Vacuum Map', no_entity: 'Escolha um aspirador', e_entity: 'Aspirador', e_title: 'Título', e_rotation: 'Rotação', e_labels: 'Nomes das divisões', e_path: 'Trajeto', e_zones: 'Zonas proibidas', e_obstacles: 'Obstáculos', fullscreen: 'Ecrã inteiro', close: 'Fechar', e_view: 'Vista', e_view_toggle: 'Botão 2D / 3D', e_fullscreen: 'Botão de ecrã inteiro', e_illustration: 'Ilustração animada', e_illustration_theme: 'Tema da ilustração', theme_auto: 'Automático (sol)', theme_day: 'Dia', theme_night: 'Noite', e_model: 'Modelo do robô', model_auto: 'Automático (pelo dispositivo)' },
  pl: { loading: 'Wczytywanie mapy…', no_map: 'Brak mapy dla tego odkurzacza', not_set_up: 'Najpierw skonfiguruj integrację Vacuum Map', no_entity: 'Wybierz odkurzacz', e_entity: 'Odkurzacz', e_title: 'Tytuł', e_rotation: 'Obrót', e_labels: 'Nazwy pomieszczeń', e_path: 'Trasa', e_zones: 'Strefy zakazane', e_obstacles: 'Przeszkody', fullscreen: 'Pełny ekran', close: 'Zamknij', e_view: 'Widok', e_view_toggle: 'Przycisk 2D / 3D', e_fullscreen: 'Przycisk pełnego ekranu', e_illustration: 'Animowana ilustracja', e_illustration_theme: 'Motyw ilustracji', theme_auto: 'Automatycznie (słońce)', theme_day: 'Dzień', theme_night: 'Noc', e_model: 'Model robota', model_auto: 'Automatycznie (z urządzenia)' },
  ro: { loading: 'Se încarcă harta…', no_map: 'Încă nu există o hartă pentru acest aspirator', not_set_up: 'Configurați mai întâi integrarea Vacuum Map', no_entity: 'Alegeți un aspirator', e_entity: 'Aspirator', e_title: 'Titlu', e_rotation: 'Rotire', e_labels: 'Numele camerelor', e_path: 'Traseu', e_zones: 'Zone interzise', e_obstacles: 'Obstacole', fullscreen: 'Ecran complet', close: 'Închide', e_view: 'Vizualizare', e_view_toggle: 'Buton 2D / 3D', e_fullscreen: 'Buton ecran complet', e_illustration: 'Ilustrație animată', e_illustration_theme: 'Tema ilustrației', theme_auto: 'Automat (soare)', theme_day: 'Zi', theme_night: 'Noapte', e_model: 'Modelul robotului', model_auto: 'Automat (după dispozitiv)' },
  da: { loading: 'Indlæser kortet…', no_map: 'Intet kort for denne robot endnu', not_set_up: 'Opsæt først Vacuum Map-integrationen', no_entity: 'Vælg en robotstøvsuger', e_entity: 'Robotstøvsuger', e_title: 'Titel', e_rotation: 'Rotation', e_labels: 'Rumnavne', e_path: 'Rute', e_zones: 'Forbudte zoner', e_obstacles: 'Forhindringer', fullscreen: 'Fuld skærm', close: 'Luk', e_view: 'Visning', e_view_toggle: '2D/3D-knap', e_fullscreen: 'Knap til fuld skærm', e_illustration: 'Animeret illustration', e_illustration_theme: 'Illustrationens tema', theme_auto: 'Automatisk (sol)', theme_day: 'Dag', theme_night: 'Nat', e_model: 'Robotmodel', model_auto: 'Automatisk (fra enheden)' },
  sv: { loading: 'Laddar kartan…', no_map: 'Ingen karta för den här roboten ännu', not_set_up: 'Konfigurera först integrationen Vacuum Map', no_entity: 'Välj en robotdammsugare', e_entity: 'Robotdammsugare', e_title: 'Titel', e_rotation: 'Rotation', e_labels: 'Rumsnamn', e_path: 'Rutt', e_zones: 'Förbjudna zoner', e_obstacles: 'Hinder', fullscreen: 'Helskärm', close: 'Stäng', e_view: 'Vy', e_view_toggle: '2D/3D-knapp', e_fullscreen: 'Helskärmsknapp', e_illustration: 'Animerad illustration', e_illustration_theme: 'Illustrationens tema', theme_auto: 'Automatiskt (sol)', theme_day: 'Dag', theme_night: 'Natt', e_model: 'Robotmodell', model_auto: 'Automatiskt (från enheten)' },
  bg: { loading: 'Картата се зарежда…', no_map: 'Все още няма карта за тази прахосмукачка', not_set_up: 'Първо настройте интеграцията Vacuum Map', no_entity: 'Изберете прахосмукачка', e_entity: 'Прахосмукачка', e_title: 'Заглавие', e_rotation: 'Завъртане', e_labels: 'Имена на стаите', e_path: 'Маршрут', e_zones: 'Забранени зони', e_obstacles: 'Препятствия', fullscreen: 'Цял екран', close: 'Затвори', e_view: 'Изглед', e_view_toggle: 'Бутон 2D / 3D', e_fullscreen: 'Бутон за цял екран', e_illustration: 'Анимирана илюстрация', e_illustration_theme: 'Тема на илюстрацията', theme_auto: 'Автоматично (слънце)', theme_day: 'Ден', theme_night: 'Нощ', e_model: 'Модел на робота', model_auto: 'Автоматично (от устройството)' },
  ru: { loading: 'Загрузка карты…', no_map: 'Для этого пылесоса ещё нет карты', not_set_up: 'Сначала настройте интеграцию Vacuum Map', no_entity: 'Выберите пылесос', e_entity: 'Пылесос', e_title: 'Заголовок', e_rotation: 'Поворот', e_labels: 'Названия комнат', e_path: 'Маршрут', e_zones: 'Запретные зоны', e_obstacles: 'Препятствия', fullscreen: 'Полный экран', close: 'Закрыть', e_view: 'Вид', e_view_toggle: 'Кнопка 2D / 3D', e_fullscreen: 'Кнопка полного экрана', e_illustration: 'Анимированная иллюстрация', e_illustration_theme: 'Тема иллюстрации', theme_auto: 'Автоматически (солнце)', theme_day: 'День', theme_night: 'Ночь', e_model: 'Модель робота', model_auto: 'Автоматически (по устройству)' },
  uk: { loading: 'Завантаження карти…', no_map: 'Для цього пилососа ще немає карти', not_set_up: 'Спершу налаштуйте інтеграцію Vacuum Map', no_entity: 'Виберіть пилосос', e_entity: 'Пилосос', e_title: 'Заголовок', e_rotation: 'Поворот', e_labels: 'Назви кімнат', e_path: 'Маршрут', e_zones: 'Заборонені зони', e_obstacles: 'Перешкоди', fullscreen: 'Повний екран', close: 'Закрити', e_view: 'Вигляд', e_view_toggle: 'Кнопка 2D / 3D', e_fullscreen: 'Кнопка повного екрана', e_illustration: 'Анімована ілюстрація', e_illustration_theme: 'Тема ілюстрації', theme_auto: 'Автоматично (сонце)', theme_day: 'День', theme_night: 'Ніч', e_model: 'Модель робота', model_auto: 'Автоматично (за пристроєм)' },
  hu: { loading: 'Térkép betöltése…', no_map: 'Ehhez a porszívóhoz még nincs térkép', not_set_up: 'Előbb állítsa be a Vacuum Map integrációt', no_entity: 'Válasszon porszívót', e_entity: 'Porszívó', e_title: 'Cím', e_rotation: 'Elforgatás', e_labels: 'Helyiségnevek', e_path: 'Útvonal', e_zones: 'Tiltott zónák', e_obstacles: 'Akadályok', fullscreen: 'Teljes képernyő', close: 'Bezárás', e_view: 'Nézet', e_view_toggle: '2D / 3D gomb', e_fullscreen: 'Teljes képernyő gomb', e_illustration: 'Animált illusztráció', e_illustration_theme: 'Az illusztráció témája', theme_auto: 'Automatikus (nap)', theme_day: 'Nappal', theme_night: 'Éjszaka', e_model: 'Robot típusa', model_auto: 'Automatikus (az eszköz alapján)' },
  sk: { loading: 'Načítava sa mapa…', no_map: 'Pre tento vysávač zatiaľ nie je mapa', not_set_up: 'Najprv nastavte integráciu Vacuum Map', no_entity: 'Vyberte vysávač', e_entity: 'Vysávač', e_title: 'Názov', e_rotation: 'Otočenie', e_labels: 'Názvy miestností', e_path: 'Trasa', e_zones: 'Zakázané zóny', e_obstacles: 'Prekážky', fullscreen: 'Celá obrazovka', close: 'Zavrieť', e_view: 'Zobrazenie', e_view_toggle: 'Tlačidlo 2D / 3D', e_fullscreen: 'Tlačidlo celej obrazovky', e_illustration: 'Animovaná ilustrácia', e_illustration_theme: 'Téma ilustrácie', theme_auto: 'Automaticky (slnko)', theme_day: 'Deň', theme_night: 'Noc', e_model: 'Model robota', model_auto: 'Automaticky (podľa zariadenia)' },
  cs: { loading: 'Načítání mapy…', no_map: 'Pro tento vysavač zatím není mapa', not_set_up: 'Nejprve nastavte integraci Vacuum Map', no_entity: 'Vyberte vysavač', e_entity: 'Vysavač', e_title: 'Název', e_rotation: 'Otočení', e_labels: 'Názvy místností', e_path: 'Trasa', e_zones: 'Zakázané zóny', e_obstacles: 'Překážky', fullscreen: 'Celá obrazovka', close: 'Zavřít', e_view: 'Zobrazení', e_view_toggle: 'Tlačítko 2D / 3D', e_fullscreen: 'Tlačítko celé obrazovky', e_illustration: 'Animovaná ilustrace', e_illustration_theme: 'Motiv ilustrace', theme_auto: 'Automaticky (slunce)', theme_day: 'Den', theme_night: 'Noc', e_model: 'Model robota', model_auto: 'Automaticky (podle zařízení)' },
  sl: { loading: 'Nalaganje zemljevida…', no_map: 'Za ta sesalnik še ni zemljevida', not_set_up: 'Najprej nastavite integracijo Vacuum Map', no_entity: 'Izberite sesalnik', e_entity: 'Sesalnik', e_title: 'Naslov', e_rotation: 'Zasuk', e_labels: 'Imena prostorov', e_path: 'Pot', e_zones: 'Prepovedana območja', e_obstacles: 'Ovire', fullscreen: 'Celoten zaslon', close: 'Zapri', e_view: 'Pogled', e_view_toggle: 'Gumb 2D / 3D', e_fullscreen: 'Gumb za celoten zaslon', e_illustration: 'Animirana ilustracija', e_illustration_theme: 'Tema ilustracije', theme_auto: 'Samodejno (sonce)', theme_day: 'Dan', theme_night: 'Noč', e_model: 'Model robota', model_auto: 'Samodejno (glede na napravo)' },
  lv: { loading: 'Notiek kartes ielāde…', no_map: 'Šim putekļsūcējam vēl nav kartes', not_set_up: 'Vispirms iestatiet Vacuum Map integrāciju', no_entity: 'Izvēlieties putekļsūcēju', e_entity: 'Putekļsūcējs', e_title: 'Virsraksts', e_rotation: 'Pagrieziens', e_labels: 'Telpu nosaukumi', e_path: 'Maršruts', e_zones: 'Aizliegtās zonas', e_obstacles: 'Šķēršļi', fullscreen: 'Pilnekrāns', close: 'Aizvērt', e_view: 'Skats', e_view_toggle: '2D / 3D poga', e_fullscreen: 'Pilnekrāna poga', e_illustration: 'Animēta ilustrācija', e_illustration_theme: 'Ilustrācijas motīvs', theme_auto: 'Automātiski (saule)', theme_day: 'Diena', theme_night: 'Nakts', e_model: 'Robota modelis', model_auto: 'Automātiski (no ierīces)' },
  el: { loading: 'Φόρτωση χάρτη…', no_map: 'Δεν υπάρχει ακόμη χάρτης για αυτή τη σκούπα', not_set_up: 'Ρυθμίστε πρώτα την ενσωμάτωση Vacuum Map', no_entity: 'Επιλέξτε σκούπα', e_entity: 'Σκούπα', e_title: 'Τίτλος', e_rotation: 'Περιστροφή', e_labels: 'Ονόματα δωματίων', e_path: 'Διαδρομή', e_zones: 'Απαγορευμένες ζώνες', e_obstacles: 'Εμπόδια', fullscreen: 'Πλήρης οθόνη', close: 'Κλείσιμο', e_view: 'Προβολή', e_view_toggle: 'Κουμπί 2D / 3D', e_fullscreen: 'Κουμπί πλήρους οθόνης', e_illustration: 'Κινούμενη εικονογράφηση', e_illustration_theme: 'Θέμα εικονογράφησης', theme_auto: 'Αυτόματα (ήλιος)', theme_day: 'Ημέρα', theme_night: 'Νύχτα', e_model: 'Μοντέλο ρομπότ', model_auto: 'Αυτόματα (από τη συσκευή)' },
  sr: { loading: 'Учитавање мапе…', no_map: 'За овај усисивач још нема мапе', not_set_up: 'Прво подесите интеграцију Vacuum Map', no_entity: 'Изаберите усисивач', e_entity: 'Усисивач', e_title: 'Наслов', e_rotation: 'Ротација', e_labels: 'Називи просторија', e_path: 'Путања', e_zones: 'Забрањене зоне', e_obstacles: 'Препреке', fullscreen: 'Цео екран', close: 'Затвори', e_view: 'Приказ', e_view_toggle: 'Дугме 2D / 3D', e_fullscreen: 'Дугме за цео екран', e_illustration: 'Анимирана илустрација', e_illustration_theme: 'Тема илустрације', theme_auto: 'Аутоматски (сунце)', theme_day: 'Дан', theme_night: 'Ноћ', e_model: 'Модел робота', model_auto: 'Аутоматски (према уређају)' },
  'sr-Latn': { loading: 'Učitavanje mape…', no_map: 'Za ovaj usisivač još nema mape', not_set_up: 'Prvo podesite integraciju Vacuum Map', no_entity: 'Izaberite usisivač', e_entity: 'Usisivač', e_title: 'Naslov', e_rotation: 'Rotacija', e_labels: 'Nazivi prostorija', e_path: 'Putanja', e_zones: 'Zabranjene zone', e_obstacles: 'Prepreke', fullscreen: 'Ceo ekran', close: 'Zatvori', e_view: 'Prikaz', e_view_toggle: 'Dugme 2D / 3D', e_fullscreen: 'Dugme za ceo ekran', e_illustration: 'Animirana ilustracija', e_illustration_theme: 'Tema ilustracije', theme_auto: 'Automatski (sunce)', theme_day: 'Dan', theme_night: 'Noć', e_model: 'Model robota', model_auto: 'Automatski (prema uređaju)' },
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
function vmToneColor(state) {
  return { error: 'var(--error-color, #db4437)', active: 'var(--info-color, #4f8ef7)', warning: 'var(--warning-color, #f4b400)', ok: 'var(--success-color, #43a047)', idle: 'var(--secondary-text-color)' }[vmTone(state)];
}

function vmTone(state) {
  if (['error', 'unavailable'].includes(state)) return 'error';
  if (['cleaning', 'returning'].includes(state)) return 'active';
  if (state === 'paused') return 'warning';
  if (['docked', 'idle'].includes(state)) return 'ok';
  return 'idle';
}

// Roborock pictures: drawn illustrations, picked from the device name (robot with or without LiDAR turret,
// with or without its dock, dark or white) or the wet-dry vacuum kind, and animated by what the device is doing
// (`activity`): vacuum, mop, vacmop (vacuum and mop), returning, washing (the mops), drying (the mops).
const VM_ROBOT_COLORS = {
  dark: { top: "#3a3d42", side: "#1f2124", rim: "#55595f", lens: "#0e0f11" },
  white: { top: "#f4f4f2", side: "#cfd0cd", rim: "#e2e2df", lens: "#2a2c30" },
};
// Animations, shared by every picture. Pictures are <img>, so CSS animations run but no script does.
const VM_ANIM_CSS = `
  .spin { transform-box: fill-box; transform-origin: center; animation: spin .5s linear infinite; }
  .sway { animation: sway 2.4s ease-in-out infinite alternate; }
  .home { animation: home 2.6s cubic-bezier(.3,.7,.4,1) infinite; }
  .tilt { transform-box: fill-box; transform-origin: 50% 100%; animation: tilt 1.6s ease-in-out infinite alternate; }
  .dust { animation: dust 1.2s ease-in infinite; } .drop { animation: drop 1.1s ease-in infinite; }
  .wet { animation: wet 1.6s ease-in-out infinite alternate; }
  .bub { transform-box: fill-box; transform-origin: center; animation: bub 1.8s ease-out infinite; }
  .heat { animation: heat 2.2s ease-out infinite; }
  .roll { animation: roll .4s linear infinite; }
  .evac { animation: evac 1.5s ease-in infinite; }
  .d1 { animation-delay: -.3s; } .d2 { animation-delay: -.6s; } .d3 { animation-delay: -.9s; } .d4 { animation-delay: -1.2s; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes sway { from { transform: translateX(-6px); } to { transform: translateX(6px); } }
  @keyframes home { 0% { transform: translateX(-70px); opacity: 0; } 15% { opacity: 1; } 60%, 100% { transform: none; opacity: 1; } }
  @keyframes tilt { from { transform: rotate(-4deg); } to { transform: rotate(4deg); } }
  @keyframes dust { from { transform: translateY(14px); opacity: 0; } 30% { opacity: .9; } to { transform: translateY(-4px); opacity: 0; } }
  @keyframes drop { from { transform: translateY(-6px); opacity: 0; } 30% { opacity: 1; } to { transform: translateY(10px); opacity: 0; } }
  @keyframes wet { from { opacity: .25; } to { opacity: .6; } }
  @keyframes bub { from { transform: translateY(0) scale(.4); opacity: 0; } 25% { opacity: .9; } to { transform: translateY(-34px) scale(1.1); opacity: 0; } }
  @keyframes heat { from { transform: translateY(6px); opacity: 0; } 35% { opacity: .9; } to { transform: translateY(-30px); opacity: 0; } }
  @keyframes roll { to { stroke-dashoffset: -12; } }
  @keyframes evac { from { transform: translateY(0); opacity: 0; } 20% { opacity: .95; } 85% { opacity: .8; } to { transform: translateY(-78px); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;
// Robot seen from the front, slightly from above: disc of radius r centred on (cx, cy).
const vmRobotShape = (cx, cy, r, turret, col) => {
  const ry = r * 0.3, h = r * 0.2;
  let s = `<ellipse cx="${cx}" cy="${cy + h + ry * 0.35}" rx="${r * 0.98}" ry="${ry * 0.7}" opacity=".22"/>`;
  s += `<path d="M${cx - r} ${cy} v${h} a${r} ${ry} 0 0 0 ${2 * r} 0 v${-h} z" fill="${col.side}"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${ry}" fill="${col.top}"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.97}" ry="${ry * 0.93}" fill="none" stroke="${col.rim}" stroke-width="${r * 0.02}"/>`;
  s += `<rect x="${cx - r * 0.3}" y="${cy + h * 0.35}" width="${r * 0.6}" height="${h * 0.35}" rx="${h * 0.17}" fill="${col.lens}"/>`;
  if (turret) {
    const tr = r * 0.24, th = r * 0.17, ty = cy - ry * 0.25;
    s += `<path d="M${cx - tr} ${ty} v${-th} a${tr} ${tr * 0.3} 0 0 1 ${2 * tr} 0 v${th} a${tr} ${tr * 0.3} 0 0 1 ${-2 * tr} 0 z" fill="${col.side}"/>`;
    s += `<ellipse cx="${cx}" cy="${ty - th}" rx="${tr}" ry="${tr * 0.3}" fill="${col.top}"/>`;
    s += `<rect x="${cx - tr * 0.55}" y="${ty - th * 0.75}" width="${tr * 1.1}" height="${th * 0.4}" rx="${th * 0.2}" fill="${col.lens}"/>`;
  } else {
    s += `<circle cx="${cx + r * 0.55}" cy="${cy - ry * 0.25}" r="${r * 0.04}" fill="#e3212d"/>`;
  }
  return s;
};
// `box`: the bounding box of what is drawn (x0 y0 x1 y1), so that the illustrated header sizes the device by its
// drawing rather than by its viewBox margins, and sets it on the floor.
const vmSvgDoc = (w, h, body, defs = "", anim = false, box = null) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${box ? ` data-box="${box.join(" ")}"` : ""}>${anim ? `<style>${VM_ANIM_CSS}</style>` : ""}${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>`;
// Side brush: three spokes turning, at (x, y).
const vmBrush = (x, y, r) =>
  `<g class="spin"><circle cx="${x}" cy="${y}" r="${r}" fill="none"/>${[0, 120, 240]
    .map((a) => {
      const rad = (a * Math.PI) / 180;
      return `<line x1="${x}" y1="${y}" x2="${(x + r * Math.cos(rad)).toFixed(1)}" y2="${(y + r * 0.45 * Math.sin(rad)).toFixed(1)}" stroke="#8a8f96" stroke-width="1.6" stroke-linecap="round"/>`;
    })
    .join("")}</g>`;
// Rising bubbles (washing) or heat waves (drying) around (cx, y), spread over w.
const vmBubbles = (cx, y, w) =>
  [-0.4, -0.15, 0.1, 0.35, 0.45]
    .map((f, i) => `<circle class="bub d${i % 5}" cx="${cx + f * w}" cy="${y - (i % 2) * 6}" r="${3.5 + (i % 3) * 1.5}" fill="#9fd3ff" stroke="#3f8fd4" stroke-width=".8"/>`)
    .join("");
const vmHeat = (cx, y, w) =>
  [-0.3, 0, 0.3]
    .map(
      (f, i) =>
        `<path class="heat d${i + 1}" d="M${cx + f * w} ${y} q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="#ff9f43" stroke-width="2.2" stroke-linecap="round"/>`
    )
    .join("");
// A robot drawn on the floor (160 × 104): swaying while it cleans, dust trailing behind when it vacuums, a wet trail
// and drops when it mops (activity vacuum / mop / vacmop; null: at rest, no animation).
const vmOnFloor = (robot, activity, box = [8, 27, 152, 88]) => {
  const cleaning = ["vacuum", "mop", "vacmop"].includes(activity);
  const vac = activity === "vacuum" || activity === "vacmop";
  const mop = activity === "mop" || activity === "vacmop";
  let s = "";
  if (mop) s += `<ellipse class="wet" cx="80" cy="84" rx="78" ry="13" fill="#3f8fd4"/>`;
  s += `<g class="${cleaning ? "sway" : ""}">${robot}</g>`;
  if (vac) s += [56, 72, 88, 104].map((x, i) => `<circle class="dust d${i + 1}" cx="${x}" cy="94" r="2.6" fill="#c9ccd0"/>`).join("");
  if (mop) s += [40, 66, 94, 120].map((x, i) => `<path class="drop d${i + 1}" d="M${x} 88 q-3 4 0 6 q3 -2 0 -6z" fill="#3f8fd4"/>`).join("");
  return vmSvgDoc(160, 104, s, "", cleaning, box);
};
// Drawing of a dock / Clean Base with its robot: the same box for every brand, so that all the models with a base are
// drawn at the same size in the illustrated header.
const VM_BASE_BOX = [14, 8, 146, 158];
// Robot alone or in front of its dock, animated by `activity`.
const vmRobotSvg = ({ turret = true, white = false, dock = true, activity = null } = {}) => {
  const col = VM_ROBOT_COLORS[white ? "white" : "dark"];
  const cleaning = ["vacuum", "mop", "vacmop"].includes(activity);
  // Cleaning: the robot is out on the floor, drawn alone whatever its dock.
  if (!dock || cleaning) {
    const vac = activity === "vacuum" || activity === "vacmop";
    let robot = vmRobotShape(80, 50, 72, turret, col);
    if (vac) robot += vmBrush(26, 75, 10) + vmBrush(134, 75, 10);
    return vmOnFloor(robot, activity);
  }
  const [dTop, dBot, panel, seam] = white
    ? ["#fafaf8", "#d7d8d5", "#ecece9", "#c4c5c2"]
    : ["#b9bcc0", "#62666c", "#2b2e33", "#4a4e54"];
  const defs = `<linearGradient id="d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${dTop}"/><stop offset="1" stop-color="${dBot}"/></linearGradient>`;
  let s = `<ellipse cx="80" cy="152" rx="66" ry="6" opacity=".22"/>`;
  s += `<path d="M18 140 L30 126 H130 L142 140 Q142 146 136 146 H24 Q18 146 18 140 Z" fill="${white ? "#e6e6e3" : "#2b2e33"}"/>`;
  s += `<rect x="34" y="8" width="92" height="124" rx="10" fill="url(#d)"/>`;
  s += `<rect x="40" y="16" width="80" height="54" rx="6" fill="${panel}"/>`;
  s += `<line x1="80" y1="18" x2="80" y2="68" stroke="${seam}" stroke-width="1.5"/>`;
  s += `<rect x="40" y="76" width="80" height="4" rx="2" fill="${seam}"/>`;
  s += `<circle cx="112" cy="90" r="2" fill="${activity === "washing" ? "#2fa3ff" : activity === "drying" ? "#ff9f43" : "#43c463"}"/>`;
  s += `<g class="${activity === "returning" ? "home" : ""}">${vmRobotShape(80, 122, 52, turret, col)}</g>`;
  if (activity === "washing") s += vmBubbles(80, 112, 100);
  if (activity === "drying") s += vmHeat(80, 108, 100);
  return vmSvgDoc(160, 160, s, defs, !!activity, VM_BASE_BOX);
};
// Upright wet-dry vacuum: floor head, body with the two water tanks, handle. Cleaning: it rocks back and forth
// and its roller turns; washing / drying (self-cleaning on its base): bubbles / heat waves at the floor head.
// Dyson 360 robot (Eye, Heurist, Vis Nav): a tall, narrow drum on two tank tracks with the 360° camera on top
// (Vis Nav: wider and lower, purple band). Vacuuming: the robot sways, its tracks roll and dust is sucked in;
// returning: it slides in from the side (it has no dock station to draw).
const vmDysonSvg = ({ visnav = false, white = false, activity = null } = {}) => {
  const cleaning = ["vacuum", "mop", "vacmop"].includes(activity);
  const [top, side, rim] = white ? ["#ececea", "#c4c5c2", "#d8d9d6"] : ["#55585e", "#33363b", "#6a6e75"];
  const band = visnav ? "#8a63c4" : "#4f7fd8";
  const w = visnav ? 44 : 34, cy = visnav ? 44 : 34, h = visnav ? 30 : 40, ry = w * 0.26;
  let r = `<ellipse cx="80" cy="${cy + h + ry + 4}" rx="${w + 22}" ry="7" opacity=".22"/>`;
  // Tracks, on both sides of the drum.
  for (const x of [80 - w - 14, 80 + w - 2]) {
    r += `<rect x="${x}" y="${cy + h - 18}" width="16" height="${ry * 2 + 20}" rx="7" fill="#1d1f22"/>`;
    r += `<line class="${cleaning ? "roll" : ""}" x1="${x + 8}" y1="${cy + h - 14}" x2="${x + 8}" y2="${cy + h + ry * 2 - 2}" stroke="#4a4e54" stroke-width="3" stroke-dasharray="3 3"/>`;
  }
  r += `<path d="M${80 - w} ${cy} v${h} a${w} ${ry} 0 0 0 ${2 * w} 0 v${-h} z" fill="${side}"/>`;
  r += `<path d="M${80 - w} ${cy + h * 0.55} v${h * 0.16} a${w} ${ry} 0 0 0 ${2 * w} 0 v${-h * 0.16} a${w} ${ry} 0 0 1 ${-2 * w} 0 z" fill="${band}"/>`;
  r += `<ellipse cx="80" cy="${cy}" rx="${w}" ry="${ry}" fill="${top}"/>`;
  r += `<ellipse cx="80" cy="${cy}" rx="${w * 0.96}" ry="${ry * 0.92}" fill="none" stroke="${rim}" stroke-width="1"/>`;
  // 360° camera: a short glass cylinder with its dark lens ring.
  const cw = w * 0.36, ch = 9, ct = cy - ry * 0.15;
  r += `<path d="M${80 - cw} ${ct} v${-ch} a${cw} ${cw * 0.3} 0 0 1 ${2 * cw} 0 v${ch} a${cw} ${cw * 0.3} 0 0 1 ${-2 * cw} 0 z" fill="#0e0f11"/>`;
  r += `<ellipse cx="80" cy="${ct - ch}" rx="${cw}" ry="${cw * 0.3}" fill="${side}"/>`;
  r += `<path d="M${80 - cw * 0.7} ${ct - ch * 0.45} h${cw * 1.4}" stroke="#6fa8ff" stroke-width="1.6" opacity=".8"/>`;
  let s = `<g class="${cleaning ? "sway" : activity === "returning" ? "home" : ""}">${r}</g>`;
  if (cleaning) s += [62, 74, 86, 98].map((x, i) => `<circle class="dust d${i + 1}" cx="${x}" cy="98" r="2.6" fill="#c9ccd0"/>`).join("");
  return vmSvgDoc(160, 104, s, "", cleaning || activity === "returning", visnav ? [14, 28, 146, 99] : [24, 20, 136, 94]);
};
// iRobot: Roomba (round, no LiDAR turret, its CLEAN button with a light ring on top and a single side brush; the
// s series D-shaped, the j series with a front camera, the 974 / 976 with a silver faceplate) or Braava jet (a rounded square mopping robot with its water
// tank), alone or in front of a slim Clean Base (the "+" models). Vacuuming: the robot sways, its side brush spins and
// dust trails behind; mopping (Braava, Combo): wet trail and spray; returning: it slides in front of its base;
// emptying (Clean Base): dust rises up the base's duct.
const vmRoombaShape = (cx, cy, r, col, { shape = "round", camera = false, silver = false, ring = "#bfe9ff" } = {}) => {
  const ry = r * 0.3, h = r * 0.2;
  // 974 / 976: the dark body of the 900 series under a silver faceplate.
  if (silver) col = { ...col, top: "#a8adb3", rim: "#6f757c" };
  let s = `<ellipse cx="${cx}" cy="${cy + h + ry * 0.35}" rx="${r * 0.98}" ry="${ry * 0.7}" opacity=".22"/>`;
  if (shape === "square") {
    // Braava jet: a rounded square seen from above (deeper than a disc), its CLEAN button in the middle of the
    // lid, the spray nozzle on the front and the cleaning pad under it.
    const w = r * 0.86, d = r * 0.46;
    s = `<ellipse cx="${cx}" cy="${cy + d + h * 0.9}" rx="${w * 1.05}" ry="${ry * 0.6}" opacity=".22"/>`;
    s += `<rect x="${cx - w * 1.02}" y="${cy + d - h * 0.2}" width="${w * 2.04}" height="${h * 1.35}" rx="${h * 0.5}" fill="#9fd3ff" opacity=".85"/>`;
    s += `<rect x="${cx - w}" y="${cy - d}" width="${2 * w}" height="${2 * d + h}" rx="${d * 0.45}" fill="${col.side}"/>`;
    s += `<rect x="${cx - w}" y="${cy - d}" width="${2 * w}" height="${2 * d}" rx="${d * 0.45}" fill="${col.top}"/>`;
    s += `<rect x="${cx - w * 0.92}" y="${cy - d * 0.92}" width="${w * 1.84}" height="${d * 1.84}" rx="${d * 0.4}" fill="none" stroke="${col.rim}" stroke-width="${r * 0.02}"/>`;
    s += `<rect x="${cx - w * 0.35}" y="${cy - d * 0.72}" width="${w * 0.7}" height="${d * 0.16}" rx="${d * 0.08}" fill="${col.side}"/>`;
    s += `<ellipse cx="${cx}" cy="${cy + d * 0.1}" rx="${r * 0.15}" ry="${r * 0.11}" fill="none" stroke="${ring}" stroke-width="${r * 0.03}" opacity=".9"/>`;
    s += `<ellipse cx="${cx}" cy="${cy + d * 0.1}" rx="${r * 0.09}" ry="${r * 0.065}" fill="#8a8f96"/>`;
    s += `<rect x="${cx - r * 0.09}" y="${cy + d + h * 0.32}" width="${r * 0.18}" height="${h * 0.38}" rx="${h * 0.19}" fill="${col.lens}"/>`;
    return s;
  }
  if (shape === "d") {
    // s series: round back, flat front.
    const fy = cy + ry * 0.62;
    s += `<path d="M${cx - r} ${fy - ry * 0.25} v${h} q0 ${ry * 0.25} ${ry * 0.4} ${ry * 0.25} h${2 * r - ry * 0.8} q${ry * 0.4} 0 ${ry * 0.4} ${-ry * 0.25} v${-h} z" fill="${col.side}"/>`;
    s += `<path d="M${cx - r} ${fy - ry * 0.25} V${cy} A${r} ${ry} 0 0 1 ${cx + r} ${cy} V${fy - ry * 0.25} q0 ${ry * 0.25} ${-ry * 0.4} ${ry * 0.25} H${cx - r + ry * 0.4} q${-ry * 0.4} 0 ${-ry * 0.4} ${-ry * 0.25} z" fill="${col.top}"/>`;
    s += `<rect x="${cx - r * 0.5}" y="${fy + h * 0.3}" width="${r}" height="${h * 0.3}" rx="${h * 0.15}" fill="#b07a4e" opacity=".85"/>`;
  } else {
    s += `<path d="M${cx - r} ${cy} v${h} a${r} ${ry} 0 0 0 ${2 * r} 0 v${-h} z" fill="${col.side}"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${ry}" fill="${col.top}"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.66}" ry="${ry * 0.66}" fill="none" stroke="${col.rim}" stroke-width="${r * 0.025}"/>`;
  }
  // CLEAN button and its light ring.
  s += `<ellipse cx="${cx}" cy="${cy - ry * 0.05}" rx="${r * 0.22}" ry="${ry * 0.22}" fill="none" stroke="${ring}" stroke-width="${r * 0.03}" opacity=".9"/>`;
  s += `<ellipse cx="${cx}" cy="${cy - ry * 0.05}" rx="${r * 0.15}" ry="${ry * 0.15}" fill="${col.lens}"/>`;
  // j series: the front camera, on the bumper.
  if (camera) s += `<circle cx="${cx}" cy="${cy + ry + h * 0.5}" r="${h * 0.26}" fill="${col.lens}" stroke="#6fa8ff" stroke-width="${h * 0.07}"/>`;
  return s;
};
const vmRoombaSvg = ({ shape = "round", camera = false, silver = false, white = false, base = false, combo = false, activity = null } = {}) => {
  const col = VM_ROBOT_COLORS[white ? "white" : "dark"];
  const braava = shape === "square";
  const cleaning = ["vacuum", "mop", "vacmop"].includes(activity);
  if (!base || cleaning) {
    // What it cleans comes from the robot: a Braava mops, a Combo vacuums and mops, a Roomba vacuums.
    const act = cleaning ? (braava ? "mop" : combo ? "vacmop" : "vacuum") : null;
    let robot = vmRoombaShape(80, 50, 72, col, { shape, camera, silver });
    if ((act === "vacuum" || act === "vacmop") && !braava) robot += vmBrush(128, 76, 11);
    return vmOnFloor(robot, act, braava ? [15, 17, 145, 100] : undefined);
  }
  // Clean Base: a slim tower (wider for the Combo, its water tank on the side), the robot docked in front.
  const w = combo ? 64 : 50, x = 80 - w / 2;
  const [body, edge, lid, duct] = white ? ["#f2f2f0", "#cfd0cd", "#e3e3e0", "#c4c5c2"] : ["#363a40", "#4a4e54", "#464a51", "#1d1f22"];
  let s = `<ellipse cx="80" cy="152" rx="66" ry="6" opacity=".22"/>`;
  s += `<path d="M18 140 L30 128 H130 L142 140 Q142 146 136 146 H24 Q18 146 18 140 Z" fill="${white ? "#e6e6e3" : "#2b2e33"}"/>`;
  s += `<rect x="${x}" y="10" width="${w}" height="122" rx="9" fill="${body}" stroke="${edge}" stroke-width="1.5"/>`;
  s += `<rect x="${x + 4}" y="14" width="${w - 8}" height="20" rx="6" fill="${lid}"/>`;
  // Evacuation duct up the front of the base.
  s += `<rect x="74" y="40" width="12" height="80" rx="6" fill="${duct}" opacity=".9"/>`;
  if (combo) s += `<rect x="${x + w - 15}" y="48" width="8" height="46" rx="4" fill="#7cc4f2" opacity=".7"/>`;
  s += `<circle cx="80" cy="26" r="2.2" fill="${activity === "emptying" ? "#2fa3ff" : "#64a70b"}"/>`;
  if (activity === "emptying") s += [0, 1, 2, 3, 4].map((i) => `<circle class="evac d${i}" cx="${78 + (i % 3) * 2}" cy="116" r="${2 + (i % 2) * 0.8}" fill="#c9ccd0"/>`).join("");
  s += `<g class="${activity === "returning" ? "home" : ""}">${vmRoombaShape(80, 122, 52, col, { shape, camera, silver })}</g>`;
  return vmSvgDoc(160, 160, s, "", activity === "returning" || activity === "emptying", VM_BASE_BOX);
};
const vmWetdrySvg = ({ white = true, activity = null } = {}) => {
  const [body, edge, accent] = white ? ["#f2f2f0", "#c9cac7", "#3a3d42"] : ["#4a4e54", "#26282c", "#9aa0a6"];
  const cleaning = ["vacuum", "mop", "vacmop"].includes(activity);
  let s = `<ellipse cx="50" cy="194" rx="40" ry="4" opacity=".22"/>`;
  let v = `<path d="M12 178 Q12 168 22 168 H78 Q88 168 88 178 V186 Q88 192 82 192 H18 Q12 192 12 186 Z" fill="${body}" stroke="${edge}" stroke-width="1.5"/>`;
  v += `<rect x="16" y="182" width="68" height="6" rx="3" fill="#3f8fd4" opacity=".7"/>`;
  if (cleaning) v += `<line class="roll" x1="18" y1="185" x2="82" y2="185" stroke="#d6ecff" stroke-width="2" stroke-dasharray="4 8"/>`;
  v += `<rect x="30" y="70" width="40" height="104" rx="14" fill="${body}" stroke="${edge}" stroke-width="1.5"/>`;
  v += `<rect x="35" y="80" width="30" height="34" rx="6" fill="#9fc6e6" opacity=".75"/>`;
  v += `<rect x="35" y="120" width="30" height="40" rx="6" fill="#8a8f96" opacity=".55"/>`;
  v += `<rect x="47" y="14" width="6" height="58" rx="3" fill="${accent}"/>`;
  v += `<path d="M38 6 Q50 -2 62 6 L60 22 Q50 18 40 22 Z" fill="${accent}"/>`;
  v += `<rect x="45" y="26" width="10" height="12" rx="2" fill="#2fa3ff" opacity=".85"/>`;
  s += cleaning ? `<g class="tilt">${v}</g>` : v;
  if (activity === "washing") s += vmBubbles(50, 176, 70);
  if (activity === "drying") s += vmHeat(50, 168, 60);
  return vmSvgDoc(100, 200, s, "", !!activity, [10, 2, 90, 198]);
};
// iRobot (roomba integration): the model is the robot's SKU — series letter, three digits, three digits of region
// (020 Europe, 840 / 820 America…): R980020 → Roomba 980, i755020 → Roomba i7+ (5 or 7 as second digit: with its
// Clean Base), c975020 → Roomba Combo j9+, m611020 → Braava jet m6. null when the model is not an iRobot SKU.
const vmIrobotName = (model) => {
  const m = /^([reijscm])(\d)(\d)(\d)\d{3}$/.exec(String(model || "").toLowerCase());
  if (!m) return null;
  const [, l, d1, d2, d3] = m;
  const plus = d2 === "5" || d2 === "7" ? "+" : "";
  if (l === "r") return `Roomba ${d1}${d2}${d3}`;
  if (l === "e") return `Roomba e${d1}`;
  if (l === "m") return `Braava jet m${d1}`;
  return l === "c" ? `Roomba Combo j${d1}${plus}` : `Roomba ${l}${d1}${plus}`;
};
// The iRobot models offered in the editor and recognized out of the box (European SKUs; the others are named by
// irobotName all the same).
const VM_IROBOT_SKUS = [
  "r675020", "r694020", "r696020", "r960020", "r974020", "r976020", "r980020", "e515020", "i315020", "i355020", "i515020", "i555020",
  "i715020", "i755020", "s915020", "s955020", "j715020", "j755020", "j955020", "c755020", "c975020", "m611020",
];
// Commercial names of the common Roborock models, by the model id the integrations report (Roborock, Xiaomi Miio
// and Xiaomi Home alike): the picture and the logo then follow the model even when the device was renamed
// (« DustBusters »). Sources: python-roborock (const.py, device_info.yaml), python-miio, the tested vacuums of
// python-roborock's local server and the Mijia list of Tasshack/dreame-vacuum (Xiaomi Home).
const VM_MODEL_NAMES = {
  "rockrobo.vacuum.v1": "Mi Robot Vacuum",
  "roborock.vacuum.m1s": "Mi Robot Vacuum 1S",
  "mijia.vacuum.v1": "Mi Robot Vacuum-Mop Essential",
  "mijia.vacuum.v2": "Mi Robot Vacuum-Mop Essential G1",
  "dreame.vacuum.mc1808": "Mi Robot Vacuum-Mop 1C",
  "viomi.vacuum.v7": "Mi Robot Vacuum-Mop P",
  "viomi.vacuum.v8": "Mi Robot Vacuum-Mop P",
  "dreame.vacuum.p2150o": "Mi Robot Vacuum-Mop",
  "dreame.vacuum.p2140o": "Mi Robot Vacuum-Mop 2",
  "dreame.vacuum.p2140p": "Mi Robot Vacuum-Mop 2",
  "dreame.vacuum.p2140q": "Mi Robot Vacuum-Mop 2",
  "ijai.vacuum.v3": "Mi Robot Vacuum-Mop 2 Pro",
  "dreame.vacuum.p2041o": "Mi Robot Vacuum-Mop 2 Pro+",
  "dreame.vacuum.p2150a": "Mi Robot Vacuum-Mop 2 Ultra",
  "dreame.vacuum.p2150b": "Mi Robot Vacuum-Mop 2 Ultra Set",
  "dreame.vacuum.p2148o": "Mi Robot Vacuum-Mop Ultra Slim",
  "dreame.vacuum.r2209": "Mi Robot Vacuum X10",
  "dreame.vacuum.p2114a": "Mi Robot Vacuum X10+",
  "xiaomi.vacuum.c102gl": "Mi Robot Vacuum X20+",
  "dreame.vacuum.r2211o": "Robot Vacuum S10+",
  "dreame.vacuum.r2254": "Mijia 1S",
  "dreame.vacuum.p2041": "Mijia 1T",
  "dreame.vacuum.p2140": "Mijia 2C",
  "dreame.vacuum.p2140a": "Mijia 2C",
  "dreame.vacuum.r2210": "Mijia Cleaning and Mopping Robot 2 Pro",
  "dreame.vacuum.p2114o": "Mijia Self-Cleaning Robot Vacuum-Mop",
  "dreame.vacuum.p2149o": "Mijia Self-Cleaning Robot Vacuum-Mop Pro",
  "xiaomi.vacuum.d110ch": "Mijia M40",
  "xiaomi.vacuum.c102cn": "Mijia Omni 2",
  "xiaomi.vacuum.d103cn": "Mijia Omni M30S",
  "roborock.vacuum.c1": "C1",
  "roborock.vacuum.e2": "E2",
  "roborock.vacuum.a01": "E4",
  "roborock.vacuum.s4": "S4",
  "roborock.vacuum.a19": "S4 Max",
  "roborock.vacuum.s5": "S5",
  "roborock.vacuum.s5e": "S5 Max",
  "roborock.vacuum.s6": "S6",
  "roborock.vacuum.t6": "T6",
  "roborock.vacuum.a08": "S6 Pure",
  "roborock.vacuum.a10": "S6 MaxV",
  "roborock.vacuum.a11": "T7",
  "roborock.vacuum.a14": "T7S",
  "roborock.vacuum.a23": "T7S Plus",
  "roborock.vacuum.a15": "S7",
  "roborock.vacuum.a27": "S7 MaxV",
  "roborock.vacuum.a62": "S7 Pro Ultra",
  "roborock.vacuum.a65": "S7 MaxV Ultra",
  "roborock.vacuum.a51": "S8",
  "roborock.vacuum.a70": "S8 Pro Ultra",
  "roborock.vacuum.a97": "S8 MaxV Ultra",
  "roborock.vacuum.a29": "G10",
  "roborock.vacuum.a30": "G10",
  "roborock.vacuum.a46": "G10S",
  "roborock.vacuum.a26": "G10S Pro",
  "roborock.vacuum.a34": "Q5",
  "roborock.vacuum.a72": "Q5 Pro",
  "roborock.vacuum.a125": "Q5 Max+",
  "roborock.vacuum.a40": "Q7",
  "roborock.vacuum.a38": "Q7 Max",
  "roborock.vacuum.a73": "Q8 Max",
  "roborock.vacuum.sc01": "Q7 Series",
  "roborock.vacuum.sc05": "Q7 Series",
  "roborock.vacuum.ss07": "Q10",
  "roborock.vacuum.a75": "Qrevo",
  "roborock.vacuum.a87": "Qrevo MaxV",
  "roborock.vacuum.a101": "Qrevo Pro",
  "roborock.vacuum.a104": "Qrevo S",
  "roborock.vacuum.a117": "Qrevo Master",
  "roborock.vacuum.a135": "Qrevo Curv",
  "roborock.vacuum.a123": "Qrevo Plus",
  "roborock.vacuum.a170": "Qrevo C",
  "roborock.vacuum.a187": "Qrevo Edge",
  "roborock.vacuum.a245": "Qrevo Curv 2 Flow",
  "roborock.vacuum.a294": "Qrevo 2 Pro",
  "roborock.vacuum.a298": "Qrevo Edge 2",
  "roborock.vacuum.a326": "Qrevo S Pro",
  "roborock.vacuum.a168": "QV 35A",
  "roborock.vacuum.a306": "P30 Pro",
  "roborock.vacuum.a146": "G30",
  "roborock.vacuum.a143": "Saros 10R",
  "roborock.vacuum.a144": "Saros 10R",
  "roborock.vacuum.a147": "Saros 10",
  "roborock.vacuum.a288": "Saros 20",
  "roborock.vacuum.a279": "Saros 20 Sonic",
  "roborock.vacuum.a307": "Saros 20 Flow",
  "roborock.wetdryvac.a56": "Dyad Pro",
  "roborock.wetdryvac.a83": "Dyad Pro Combo",
  "roborock.wetdryvac.a107": "Dyad Air",
  "roborock.wdv.a194": "F25 Ultra",
  "roborock.wetdryvac.a01": "Dyad",
  "dreame.vacuum.p2008": "F9",
  "dreame.vacuum.p2009": "D9",
  "dreame.vacuum.p2028": "Z10 Pro",
  "dreame.vacuum.p2029": "L10 Pro",
  "dreame.vacuum.r2205": "D10 Plus",
  "dreame.vacuum.r2228o": "L10s Ultra",
  // Ecovacs: the integration reports the commercial name (deviceName) as the model.
  "deebot n8": "DEEBOT N8",
  "deebot n8 pro": "DEEBOT N8 Pro",
  "deebot n8 pro+": "DEEBOT N8 Pro+",
  "deebot ozmo 920": "DEEBOT OZMO 920",
  "deebot ozmo 950": "DEEBOT OZMO 950",
  "deebot ozmo t8": "DEEBOT OZMO T8",
  "deebot t8 aivi": "DEEBOT T8 AIVI",
  "deebot t8+": "DEEBOT T8+",
  "deebot t9": "DEEBOT T9",
  "deebot t9+": "DEEBOT T9+",
  "deebot t10 omni": "DEEBOT T10 Omni",
  "deebot t20 omni": "DEEBOT T20 Omni",
  "deebot t30 omni": "DEEBOT T30 Omni",
  "deebot x1 omni": "DEEBOT X1 Omni",
  "deebot x1 turbo": "DEEBOT X1 Turbo",
  "deebot x2 omni": "DEEBOT X2 Omni",
  "deebot x5 pro omni": "DEEBOT X5 Pro Omni",
  // Dyson: the integration reports the product type as the model.
  n223: "360 Eye",
  276: "360 Heurist",
  277: "360 Vis Nav",
  // iRobot: the SKU as the model.
  ...Object.fromEntries(VM_IROBOT_SKUS.map((sku) => [sku, vmIrobotName(sku)])),
};
// Brand of a model id, for the logo: Xiaomi for the Mi / Xiaomi robots (built by Roborock for the first ones),
// Roborock for the other Roborock models, null when unknown (the logo of the integration is shown).
const VM_XIAOMI_MODELS = new Set(["rockrobo.vacuum.v1", "roborock.vacuum.m1s"]);
const VM_DYSON_MODELS = new Set(["n223", "276", "277"]);
const vmBrandOf = (model) => {
  const m = String(model || "").toLowerCase();
  // Dreame and Viomi build some of the Mi / Xiaomi / Mijia robots: their names in the table tell them apart.
  if (VM_XIAOMI_MODELS.has(m) || /^(xiaomi|mijia|ijai)\./.test(m) || (/^(dreame|viomi)\./.test(m) && /^(mi |mijia|robot vacuum)/i.test(VM_MODEL_NAMES[m] || ""))) return "xiaomi";
  if (/^(roborock|rockrobo)\./.test(m)) return "roborock";
  if (/^(deebot|ecovacs)\b/.test(m)) return "ecovacs";
  if (VM_DYSON_MODELS.has(m)) return "dyson";
  if (vmIrobotName(m)) return "irobot";
  return /^dreame\./.test(m) ? "dreame" : null;
};
// Roborock models offered by the `model` option (the model id as value, as in ha-vacuum-card's `image` option), one
// per commercial name, sorted by name.
const VM_ROBOROCK_MODELS = Object.entries(VM_MODEL_NAMES)
  .filter(([value, name], i, all) => vmBrandOf(value) === 'roborock' && all.findIndex(([, n]) => n === name) === i)
  .map(([value, name]) => ({ value, label: `Roborock ${name}` }))
  .sort((a, b) => a.label.localeCompare(b.label, 'en', { numeric: true }));
// Device of a chosen model, drawn like an automatic picture (without the dock the integration reports).
const vmModelDevice = (model) => ({ kind: /\.(wdv|wetdryvac)\./.test(model) ? 'wetdry' : 'robot', model, dock: {} });
// Name the picture is drawn from: the device name and the commercial name of its model.
const vmModelName = (dev) => {
  const m = String(dev.model || "").toLowerCase();
  return [dev.rawName || dev.name, VM_MODEL_NAMES[m] || vmIrobotName(m)].filter(Boolean).join(" ");
};
// Automatic picture: Saros robots, the E / C1 series and the Mi Essential / 1C have no LiDAR turret, the Q series
// (Q5…Q10, Qrevo), the Mi / Xiaomi and the Dreame robots are white, the dock is drawn when the integration reports one (or the
// model name implies it: Ultra, Plus / +, Saros, Qrevo, Omni, Self-Cleaning, G10 / G30); Dyad wet-dry vacuums are dark.
const vmAutoSvg = (dev, activity = null, white = undefined) => {
  const name = vmModelName(dev);
  if (dev.kind === "wetdry") return vmWetdrySvg({ white: white ?? !/dyad/i.test(name), activity });
  if (dev.kind !== "robot") return null;
  if (vmBrandOf(dev.model) === "dyson" || dev.platform === "dyson_local") return vmDysonSvg({ visnav: /vis nav/i.test(name), white, activity });
  if (vmBrandOf(dev.model) === "irobot" || dev.platform === "roomba") {
    const braava = /braava|\bm6\b/i.test(name);
    return vmRoombaSvg({
      shape: braava ? "square" : /\bs9/i.test(name) ? "d" : "round",
      camera: /\bj\d/i.test(name),
      silver: white === undefined && /\b97[46]\b/.test(name),
      white: white ?? braava,
      base: /\+|clean base/i.test(name),
      combo: /combo/i.test(name),
      activity,
    });
  }
  return vmRobotSvg({
    turret: !/saros|essential|\b(e\d|c1|1c)\b/i.test(name),
    white: white ?? (/\bq\s?(revo|\d)|\bmi robot/i.test(name) || ["xiaomi", "dreame", "ecovacs"].includes(vmBrandOf(dev.model))),
    dock: Object.keys(dev.dock || {}).length > 0 || /ultra|plus|\+|saros|q\s?revo|omni|self-cleaning|\bg\d\d/i.test(name),
    activity,
  });
};

// ── Illustrated header ("banner", 90 px) ──────────────────────────────────
// The title on the wall of a living room at the left, the vacuum drawn at the right (the same pictures and model
// selection as ha-vacuum-card: robot with or without its dock or Clean Base, animated by what it does), on a 10 px
// parquet strip edge to edge. Day or night: illustration_theme, else the sun, else Home Assistant's dark mode.
const VM_NO_VALUE = new Set(['unknown', 'unavailable', '']);
function vmIsNight(hass, config) {
  const theme = config?.illustration_theme;
  if (theme === 'night') return true;
  if (theme === 'day') return false;
  const sun = hass?.states?.['sun.sun'];
  if (sun && !VM_NO_VALUE.has(String(sun.state))) return sun.state === 'below_horizon';
  return !!hass?.themes?.darkMode;
}

// The living room (200 × 80, its floor at y 80): a sofa and a floor lamp (lit at night), zoomed in from its bottom
// right corner so that they stand beside the device. No id inside: several cards on a page cannot clash.
function vmSceneSvg(n) {
  return `<svg class="vm-room" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false"><g transform="translate(200 80) scale(1.28) translate(-200 -80)"><rect x="0" y="62" width="200" height="1.2" fill="${n ? '#3a4050' : '#e2d6c6'}"/><g fill="${n ? '#4a4470' : '#9d97e0'}"><rect x="58" y="52" width="56" height="20" rx="5"/><rect x="54" y="46" width="10" height="26" rx="4"/><rect x="108" y="46" width="10" height="26" rx="4"/></g>${n ? '<circle cx="127" cy="38" r="12" fill="#ffcf6e" opacity=".15"/>' : ''}<rect x="126" y="40" width="2" height="34" fill="#888"/><path d="M121 40h12l-3-8h-6z" fill="${n ? '#ffcf6e' : '#e8e0d0'}"/></g></svg>`;
}

// The vacuum's device, from the device registry: its model and name pick the picture (as in ha-vacuum-card); its dock
// (a device of its own with the Roborock integration: "<model> Dock", or an identifier ending in _dock) draws the dock.
function vmDevice(hass, entityId) {
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
function vmActivity(state) {
  if (state === 'cleaning') return 'vacuum';
  if (state === 'returning') return 'returning';
  return null;
}

// Size and right edge of the device in the 200 × 80 scene: a robot with its dock or Clean Base (square drawing),
// an upright wet-dry vacuum, a robot on the floor (out cleaning: about the size of the robot docked in its base, so
// that it does not dominate the banner, and room left at the right for its sway).
const VM_TARGETS = { base: [104, 70, 196], floor: [58, 30, 186], tall: [56, 76, 190] };
const vmPct = (v) => `${+(v * 100).toFixed(2)}%`;
// Position of a picture in the scene (percent of the scene), its drawing standing on the floor
function vmPlace(svg) {
  const num4 = (re) => re.exec(svg)?.[1].trim().split(/\s+/).map(Number);
  const [, , W, H] = num4(/viewBox="([^"]+)"/);
  const box = num4(/data-box="([^"]+)"/);
  const [x0, y0, x1, y1] = box?.length === 4 ? box : [0, 0, W, H];
  const [bw, bh, right] = VM_TARGETS[W === H ? 'base' : H > W * 1.5 ? 'tall' : 'floor'];
  const s = Math.min(bw / (x1 - x0), bh / (y1 - y0));
  return `left:${vmPct((right - x1 * s) / 200)};top:${vmPct((80 - y1 * s) / 80)};width:${vmPct((W * s) / 200)};height:${vmPct((H * s) / 80)}`;
}

const VM_BANNER_STYLE = `
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
.htext .sub { font-size: 13px; color: #3b5b78; }
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
    const tone = vmToneColor(state);
    const title = this._config.title || stateObj?.attributes?.friendly_name || this._config.entity || '';
    const status = stateObj ? (this._hass.formatEntityState?.(stateObj) ?? state) : '';
    const sub = this._geometry ? this._subtitle() : '';
    const html = `<div class="badge"><ha-icon icon="mdi:robot-vacuum"></ha-icon></div>
      <div class="titles"><div class="title">${vmEscape(title)}</div>${sub ? `<div class="sub">${vmEscape(sub)}</div>` : ''}</div>
      ${status ? `<div class="pill">${vmEscape(status)}</div>` : ''}${buttons}`;
    return { tone, html };
  }

  // Illustrated header (the default; `illustration: false` keeps the classic one)
  _illustrated() {
    return !this._embedded && this._config.illustration !== false;
  }

  // The banner: the badge (its color is the vacuum's state), the title and "status · room" on the wall at the left,
  // the vacuum drawn at the right, on the parquet strip
  _banner() {
    const stateObj = this._hass.states[this._config.entity];
    const state = stateObj?.state ?? 'unavailable';
    const night = vmIsNight(this._hass, this._config);
    const title = this._config.title || stateObj?.attributes?.friendly_name || this._config.entity || '';
    const status = stateObj ? (this._hass.formatEntityState?.(stateObj) ?? state) : '';
    const sub = [status, this._geometry ? this._subtitle() : ''].filter(Boolean).join(' · ');
    const art = this._art(state);
    const alert = vmTone(state) === 'error' && stateObj ? '<div class="vm-alert" aria-hidden="true">!</div>' : '';
    const html = `<div class="banner${night ? ' night' : ''}">
      <div class="vm-scene">${vmSceneSvg(night)}${art}${alert}</div>
      <div class="vm-ground" aria-hidden="true"></div>
      <div class="htext"><div class="badge"><ha-icon icon="mdi:robot-vacuum"></ha-icon></div>
        <div class="titles"><div class="title">${vmEscape(title)}</div>${sub ? `<div class="sub">${vmEscape(sub)}</div>` : ''}</div></div>
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
