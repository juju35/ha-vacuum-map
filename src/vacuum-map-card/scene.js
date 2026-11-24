// The 3D view: floors, walls, zones, path and robot, drawn by three.js; rendered only when something changes
import { VM_FLOOR_HEIGHT, VM_WALL_HEIGHT, vmPolygons, vmRingArea } from "./three.js";

export class VmScene {
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
