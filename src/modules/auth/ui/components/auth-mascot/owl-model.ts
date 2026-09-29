import {
  BackSide,
  BoxGeometry,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  DataTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  OctahedronGeometry,
  PlaneGeometry,
  Quaternion,
  RedFormat,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const PALETTE = {
  body: "#34d399",
  wing: "#10b981",
  belly: "#ecfdf5",
  bellyMark: "#a7f3d0",
  face: "#d1fae5",
  outline: "#064e3b",
  beak: "#f59e0b",
  cap: "#1e293b",
  capTop: "#334155",
  tassel: "#fbbf24",
  blush: "#fda4af",
  pupil: "#0f172a",
  white: "#ffffff",
  pages: "#f8fafc",
  pencilWood: "#fde68a",
  metal: "#cbd5e1",
} as const;

export interface WingRig {
  pivot: Group;
  side: 1 | -1;
  restPosition: Vector3;
  coverPosition: Vector3;
  coverQuaternion: Quaternion;
}

export interface FloatingProp {
  object: Object3D;
  base: Vector3;
  phase: number;
  spin: number;
}

export interface OwlRig {
  /** Yaw / pitch toward the gaze target. */
  root: Group;
  /** Idle bob, hops and squash. */
  bob: Group;
  eyes: Group[];
  pupils: Group[];
  wings: WingRig[];
  tassel: Group;
  shadow: Mesh;
  props: FloatingProp[];
  sparkles: Mesh[];
}

// Three-band ramp gives the flat, cartoon "cel" shading.
const createToonRamp = () => {
  const ramp = new DataTexture(new Uint8Array([110, 190, 255]), 3, 1, RedFormat);
  ramp.minFilter = NearestFilter;
  ramp.magFilter = NearestFilter;
  ramp.generateMipmaps = false;
  ramp.needsUpdate = true;
  return ramp;
};

const createShadowTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(2, 44, 34, 0.55)");
    gradient.addColorStop(1, "rgba(2, 44, 34, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(canvas);
};

export const buildOwlScene = (): OwlRig => {
  const ramp = createToonRamp();
  const toonCache = new Map<string, MeshToonMaterial>();
  const toon = (color: string) => {
    let material = toonCache.get(color);
    if (!material) {
      material = new MeshToonMaterial({ color, gradientMap: ramp });
      toonCache.set(color, material);
    }
    return material;
  };
  const flat = (color: string, opacity = 1) =>
    new MeshBasicMaterial({ color, transparent: opacity < 1, opacity });
  const outlineMaterial = new MeshBasicMaterial({ color: PALETTE.outline, side: BackSide });

  const mesh = (geometry: BufferGeometry, material: Material, outline = 0) => {
    const m = new Mesh(geometry, material);
    if (outline > 0) {
      // Inverted hull: a slightly larger back-face copy draws the ink line.
      const hull = new Mesh(geometry, outlineMaterial);
      hull.scale.setScalar(1 + outline);
      m.add(hull);
    }
    return m;
  };

  const sphere = new SphereGeometry(1, 48, 32);

  const root = new Group();
  const bob = new Group();
  root.add(bob);

  // Body
  const body = mesh(sphere, toon(PALETTE.body), 0.035);
  body.scale.set(1, 1.12, 0.92);
  bob.add(body);

  const belly = mesh(sphere, toon(PALETTE.belly), 0.03);
  belly.scale.set(0.7, 0.72, 0.5);
  belly.position.set(0, -0.3, 0.42);
  bob.add(belly);

  // Scalloped belly feathers
  const featherGeometry = new TorusGeometry(0.09, 0.018, 8, 20, Math.PI);
  const bellySurfaceZ = (x: number, y: number) =>
    0.42 + 0.5 * Math.sqrt(Math.max(0, 1 - (x / 0.7) ** 2 - ((y + 0.3) / 0.72) ** 2));
  [
    [-0.17, -0.22],
    [0.17, -0.22],
    [-0.32, -0.48],
    [0, -0.48],
    [0.32, -0.48],
    [-0.17, -0.74],
    [0.17, -0.74],
  ].forEach(([x, y]) => {
    const feather = mesh(featherGeometry, toon(PALETTE.bellyMark));
    feather.position.set(x, y, bellySurfaceZ(x, y) + 0.005);
    feather.rotation.set(-((y + 0.3) / 0.72) * 0.7, (x / 0.7) * 0.7, Math.PI);
    bob.add(feather);
  });

  // Face discs
  [-1, 1].forEach((side) => {
    const disc = mesh(sphere, toon(PALETTE.face), 0.04);
    disc.scale.set(0.46, 0.5, 0.22);
    disc.position.set(side * 0.34, 0.38, 0.72);
    disc.rotation.y = side * 0.3;
    bob.add(disc);
  });

  // Eyes
  const eyes: Group[] = [];
  const pupils: Group[] = [];
  const pupilGeometry = new SphereGeometry(0.15, 32, 16);
  const highlightGeometry = new SphereGeometry(0.05, 16, 12);
  [-1, 1].forEach((side) => {
    const eye = new Group();
    eye.position.set(side * 0.33, 0.42, 0.86);
    const eyeball = mesh(sphere, toon(PALETTE.white), 0.08);
    eyeball.scale.setScalar(0.27);
    eye.add(eyeball);

    const pupilPivot = new Group();
    const pupil = mesh(pupilGeometry, flat(PALETTE.pupil));
    pupil.scale.z = 0.4;
    pupil.position.z = 0.22;
    pupilPivot.add(pupil);
    const highlight = mesh(highlightGeometry, flat(PALETTE.white));
    highlight.position.set(0.06, 0.07, 0.27);
    pupilPivot.add(highlight);
    eye.add(pupilPivot);

    bob.add(eye);
    eyes.push(eye);
    pupils.push(pupilPivot);
  });

  // Blush
  [-1, 1].forEach((side) => {
    const blush = mesh(sphere, flat(PALETTE.blush, 0.75));
    blush.scale.set(0.12, 0.07, 0.02);
    blush.position.set(side * 0.62, 0.12, 0.73);
    blush.rotation.y = side * 0.75;
    bob.add(blush);
  });

  // Beak
  const beak = mesh(new ConeGeometry(0.12, 0.3, 24), toon(PALETTE.beak), 0.08);
  beak.position.set(0, 0.08, 0.97);
  beak.rotation.x = Math.PI - 0.4;
  bob.add(beak);

  // Ear tufts
  const tuftGeometry = new ConeGeometry(0.2, 0.45, 24);
  [-1, 1].forEach((side) => {
    const tuft = mesh(tuftGeometry, toon(PALETTE.wing), 0.06);
    tuft.position.set(side * 0.6, 0.92, 0);
    tuft.rotation.z = -side * 0.5;
    bob.add(tuft);
  });

  // Feet
  const toeGeometry = new SphereGeometry(0.1, 16, 12);
  [-1, 1].forEach((side) => {
    [-0.11, 0, 0.11].forEach((offset) => {
      const toe = mesh(toeGeometry, toon(PALETTE.beak), 0.1);
      toe.scale.set(1, 0.7, 1.3);
      toe.position.set(side * 0.36 + offset, -1.08, 0.5 + (offset === 0 ? 0.05 : 0));
      toe.rotation.y = offset * 2;
      bob.add(toe);
    });
  });

  // Wings — pivot at the shoulder so they can flap and cover the eyes.
  const wingGeometry = sphere;
  const down = new Vector3(0, -1, 0);
  const wings: WingRig[] = ([-1, 1] as const).map((side) => {
    const pivot = new Group();
    const restPosition = new Vector3(side * 0.92, 0.25, 0.05);
    const coverPosition = new Vector3(side * 0.62, 0.02, 0.62);
    pivot.position.copy(restPosition);
    const wing = mesh(wingGeometry, toon(PALETTE.wing), 0.05);
    wing.scale.set(0.26, 0.62, 0.48);
    wing.position.set(side * 0.06, -0.5, 0);
    wing.rotation.z = side * 0.15;
    pivot.add(wing);
    bob.add(pivot);

    const target = new Vector3(side * 0.3, 0.46, 1.25).sub(coverPosition).normalize();
    const coverQuaternion = new Quaternion().setFromUnitVectors(down, target);
    return { pivot, side, restPosition, coverPosition, coverQuaternion };
  });

  // Graduation cap
  const cap = new Group();
  cap.position.set(0, 1.1, 0);
  cap.rotation.set(-0.06, 0, 0.1);
  const capBase = mesh(new CylinderGeometry(0.46, 0.52, 0.26, 40), toon(PALETTE.cap), 0.05);
  cap.add(capBase);
  const board = mesh(new BoxGeometry(1.3, 0.07, 1.3), toon(PALETTE.capTop), 0.03);
  board.position.y = 0.16;
  board.rotation.y = Math.PI / 4;
  cap.add(board);
  const button = mesh(new CylinderGeometry(0.07, 0.07, 0.05, 20), toon(PALETTE.tassel));
  button.position.y = 0.215;
  cap.add(button);
  const cord = mesh(new CylinderGeometry(0.018, 0.018, 0.86, 8), toon(PALETTE.tassel));
  cord.rotation.z = Math.PI / 2;
  cord.position.set(0.43, 0.205, 0);
  cap.add(cord);

  const tassel = new Group();
  tassel.position.set(0.86, 0.19, 0);
  const tasselString = mesh(new CylinderGeometry(0.018, 0.018, 0.4, 8), toon(PALETTE.tassel));
  tasselString.position.y = -0.2;
  tassel.add(tasselString);
  const tasselEnd = mesh(new CylinderGeometry(0.035, 0.08, 0.2, 16), toon(PALETTE.tassel), 0.08);
  tasselEnd.position.y = -0.48;
  tassel.add(tasselEnd);
  cap.add(tassel);
  bob.add(cap);

  // Soft contact shadow
  const shadow = new Mesh(
    new PlaneGeometry(2.6, 2.6),
    new MeshBasicMaterial({ map: createShadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1, 0.38, 1);
  shadow.position.y = -1.22;

  // Floating props: a book, a play tile and a pencil.
  const book = new Group();
  const pages = mesh(new BoxGeometry(0.86, 0.12, 0.62), toon(PALETTE.pages), 0.04);
  book.add(pages);
  const coverGeometry = new RoundedBoxGeometry(0.94, 0.04, 0.7, 2, 0.015);
  [0.075, -0.075].forEach((y) => {
    const cover = mesh(coverGeometry, toon(PALETTE.beak), 0.04);
    cover.position.set(-0.02, y, 0);
    book.add(cover);
  });
  const spine = mesh(new BoxGeometry(0.05, 0.19, 0.7), toon(PALETTE.beak), 0.04);
  spine.position.x = -0.47;
  book.add(spine);
  book.rotation.set(0.5, 0.5, -0.3);

  const playTile = new Group();
  const tile = mesh(new RoundedBoxGeometry(0.66, 0.66, 0.16, 4, 0.12), toon(PALETTE.white), 0.04);
  playTile.add(tile);
  const triangleGeometry = new CylinderGeometry(0.17, 0.17, 0.06, 3);
  triangleGeometry.rotateX(Math.PI / 2).rotateZ(Math.PI / 2);
  const triangle = mesh(triangleGeometry, toon(PALETTE.wing));
  triangle.position.set(0.03, 0, 0.09);
  playTile.add(triangle);
  playTile.rotation.set(-0.15, -0.45, 0.12);

  const pencil = new Group();
  const pencilBody = mesh(new CylinderGeometry(0.07, 0.07, 0.9, 6), toon(PALETTE.tassel), 0.08);
  pencil.add(pencilBody);
  const pencilTip = mesh(new ConeGeometry(0.07, 0.22, 6), toon(PALETTE.pencilWood), 0.08);
  pencilTip.rotation.x = Math.PI;
  pencilTip.position.y = -0.56;
  pencil.add(pencilTip);
  const graphite = mesh(new ConeGeometry(0.026, 0.07, 6), flat(PALETTE.pupil));
  graphite.rotation.x = Math.PI;
  graphite.position.y = -0.64;
  pencil.add(graphite);
  const ferrule = mesh(new CylinderGeometry(0.072, 0.072, 0.07, 12), toon(PALETTE.metal));
  ferrule.position.y = 0.485;
  pencil.add(ferrule);
  const eraser = mesh(new CylinderGeometry(0.07, 0.07, 0.12, 12), toon(PALETTE.blush), 0.08);
  eraser.position.y = 0.58;
  pencil.add(eraser);
  pencil.rotation.set(0.3, 0, 0.75);

  const props: FloatingProp[] = [
    { object: book, base: new Vector3(-2.05, 0.75, -0.2), phase: 0, spin: 0.35 },
    { object: playTile, base: new Vector3(2.05, 1.05, -0.3), phase: 2.1, spin: 0 },
    { object: pencil, base: new Vector3(1.95, -0.7, 0.2), phase: 4.2, spin: 0 },
  ];
  props.forEach(({ object, base }) => object.position.copy(base));

  const sparkleGeometry = new OctahedronGeometry(0.07);
  const sparkles = [
    [-1.4, 1.6, -0.6],
    [1.35, 1.75, -0.4],
    [-2.3, -0.4, -0.8],
    [2.5, 0.2, -1],
    [-1.25, -1.0, 0.6],
    [0.2, 2.05, -1.2],
    [1.2, -1.35, 0.4],
  ].map(([x, y, z], i) => {
    const sparkle = mesh(sparkleGeometry, flat(i % 2 === 0 ? PALETTE.white : PALETTE.tassel));
    sparkle.position.set(x, y, z);
    return sparkle;
  });

  return { root, bob, eyes, pupils, wings, tassel, shadow, props, sparkles };
};

export const disposeObject = (object: Object3D) => {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  object.traverse((child) => {
    if (child instanceof Mesh) {
      geometries.add(child.geometry);
      const list: Material[] = Array.isArray(child.material) ? child.material : [child.material];
      list.forEach((material) => materials.add(material));
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => {
    if (material instanceof MeshToonMaterial) material.gradientMap?.dispose();
    if (material instanceof MeshBasicMaterial) material.map?.dispose();
    material.dispose();
  });
};
