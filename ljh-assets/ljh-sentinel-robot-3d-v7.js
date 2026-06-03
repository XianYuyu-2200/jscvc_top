import * as THREE from './three.module.ljh-20260603.js';

const holder = document.querySelector('[data-robot-scene]');
const canvas = document.querySelector('#ljhRobotScene');

if (!holder || !canvas) {
  throw new Error('LJH reference robot scene mount was not found.');
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x061018, 8, 22);

const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 80);
camera.position.set(1.18, 3.18, 9.75);
camera.lookAt(0.08, 1.04, 0);

let renderer;

try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
} catch (error) {
  holder.classList.add('is-fallback');
  throw error;
}

renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.34;

const cyan = new THREE.Color(0x45d8ff);
const amber = new THREE.Color(0xffd166);
const red = new THREE.Color(0xff5b6f);
const green = new THREE.Color(0x78ff9c);

const materials = {
  matte: new THREE.MeshStandardMaterial({
    color: 0x07131b,
    metalness: 0.58,
    roughness: 0.38,
    emissive: 0x04131b,
    emissiveIntensity: 0.32
  }),
  armor: new THREE.MeshStandardMaterial({
    color: 0x132735,
    metalness: 0.72,
    roughness: 0.31,
    emissive: 0x061b25,
    emissiveIntensity: 0.42
  }),
  darkGlass: new THREE.MeshStandardMaterial({
    color: 0x041018,
    metalness: 0.3,
    roughness: 0.16,
    emissive: 0x06121a,
    emissiveIntensity: 0.4
  }),
  brass: new THREE.MeshStandardMaterial({
    color: 0xe2c37a,
    metalness: 0.54,
    roughness: 0.28,
    emissive: 0x3a2c12,
    emissiveIntensity: 0.22
  }),
  cyanLine: new THREE.MeshBasicMaterial({ color: cyan }),
  amberLine: new THREE.MeshBasicMaterial({ color: amber }),
  redLine: new THREE.MeshBasicMaterial({ color: red }),
  greenLine: new THREE.MeshBasicMaterial({ color: green }),
  glowLens: new THREE.MeshBasicMaterial({
    color: cyan,
    transparent: true,
    opacity: 0.9
  }),
  wheel: new THREE.MeshStandardMaterial({
    color: 0x071018,
    metalness: 0.36,
    roughness: 0.32,
    emissive: 0x00121a,
    emissiveIntensity: 0.28
  }),
  roller: new THREE.MeshStandardMaterial({
    color: 0xd9f4ff,
    metalness: 0.22,
    roughness: 0.16,
    emissive: 0x7be8ff,
    emissiveIntensity: 0.42
  }),
  projectile: new THREE.MeshBasicMaterial({ color: 0xfff7bc }),
  beam: new THREE.MeshBasicMaterial({
    color: 0xffd166,
    transparent: true,
    opacity: 0.72,
    depthWrite: false
  }),
  hitPulse: new THREE.MeshBasicMaterial({
    color: 0xff5b6f,
    transparent: true,
    opacity: 0,
    depthWrite: false
  }),
  trail: new THREE.LineBasicMaterial({
    color: 0xffd166,
    transparent: true,
    opacity: 0.72
  }),
  flash: new THREE.MeshBasicMaterial({
    color: 0xfff3b0,
    transparent: true,
    opacity: 0.9
  }),
  iconLine: new THREE.MeshBasicMaterial({ color: 0xbff7ff })
};

const robot = new THREE.Group();
robot.rotation.y = -0.42;
robot.position.y = -0.28;
robot.scale.setScalar(0.98);
scene.add(robot);

function mesh(parent, geometry, material, position, rotation, scale) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  if (rotation) item.rotation.set(...rotation);
  if (scale) item.scale.set(...scale);
  parent.add(item);
  return item;
}

function box(parent, size, material, position, rotation) {
  return mesh(parent, new THREE.BoxGeometry(...size), material, position, rotation);
}

function cyl(parent, radiusTop, radiusBottom, height, material, position, rotation, segments = 48) {
  return mesh(parent, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material, position, rotation);
}

function capsule(parent, radius, length, material, position, rotation) {
  const group = new THREE.Group();
  group.position.set(...position);
  if (rotation) group.rotation.set(...rotation);
  parent.add(group);
  cyl(group, radius, radius, length, material, [0, 0, 0], [0, 0, Math.PI / 2], 36);
  mesh(group, new THREE.SphereGeometry(radius, 24, 12), material, [length / 2, 0, 0]);
  mesh(group, new THREE.SphereGeometry(radius, 24, 12), material, [-length / 2, 0, 0]);
  return group;
}

const base = new THREE.Group();
base.position.y = 0.18;
robot.add(base);

box(base, [4.8, 0.58, 2.0], materials.armor, [0, 0.34, 0]);
box(base, [5.36, 0.22, 2.36], materials.matte, [0, 0.02, 0]);
box(base, [4.2, 0.42, 1.65], materials.matte, [0, 0.82, 0]);
box(base, [1.1, 0.66, 1.74], materials.armor, [-2.05, 0.66, 0]);
box(base, [1.1, 0.66, 1.74], materials.armor, [2.05, 0.66, 0]);
box(base, [1.52, 0.76, 1.86], materials.matte, [0, 0.7, 0.04]);

const frontPlate = box(base, [1.48, 0.82, 0.12], materials.darkGlass, [0, 0.82, 1.04]);
const icon = new THREE.Group();
icon.position.set(0, 0.82, 1.111);
base.add(icon);
box(icon, [0.64, 0.055, 0.035], materials.iconLine, [0, 0.13, 0]);
box(icon, [0.055, 0.45, 0.035], materials.iconLine, [-0.17, -0.05, 0]);
box(icon, [0.46, 0.055, 0.035], materials.iconLine, [0.04, -0.27, 0]);
box(icon, [0.32, 0.055, 0.035], materials.iconLine, [0.2, 0.0, 0], [0, 0, 0.28]);
frontPlate.userData.baseY = frontPlate.position.y;

box(base, [0.08, 0.64, 0.08], materials.amberLine, [-0.92, 0.74, 1.13]);
box(base, [0.08, 0.64, 0.08], materials.amberLine, [0.92, 0.74, 1.13]);
box(base, [0.52, 0.12, 1.92], materials.brass, [-2.62, 0.32, 0.02]);
box(base, [0.52, 0.12, 1.92], materials.brass, [2.62, 0.32, 0.02]);
capsule(base, 0.13, 0.42, materials.cyanLine, [-2.98, 0.2, 1.04]);
capsule(base, 0.13, 0.42, materials.cyanLine, [2.98, 0.2, 1.04]);

const omniWheels = [];
const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.42, 56);
const rimGeo = new THREE.TorusGeometry(0.43, 0.026, 10, 56);
const hubGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 32);
const rollerGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.46, 16);
const rollerCapGeo = new THREE.SphereGeometry(0.053, 16, 8);
const faceRollerOffsets = [-0.23, 0, 0.23];

function addMecanumRoller(parent, position, axis) {
  const unit = new THREE.Group();
  unit.position.copy(position);
  unit.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
  parent.add(unit);

  unit.add(new THREE.Mesh(rollerGeo, materials.roller));
  mesh(unit, rollerCapGeo, materials.roller, [0, 0.23, 0]);
  mesh(unit, rollerCapGeo, materials.roller, [0, -0.23, 0]);
  return unit;
}

function createOmniWheel(position, handedness) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.x = Math.PI / 2;
  robot.add(group);

  const tire = new THREE.Mesh(wheelGeo, materials.wheel);
  group.add(tire);

  const outerRim = new THREE.Mesh(rimGeo, materials.cyanLine);
  outerRim.position.z = 0.17;
  group.add(outerRim);

  const innerRim = new THREE.Mesh(rimGeo, materials.greenLine);
  innerRim.position.z = -0.17;
  group.add(innerRim);

  const hub = new THREE.Mesh(hubGeo, materials.armor);
  group.add(hub);

  const hubGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 32), materials.cyanLine);
  hubGlow.position.z = 0.22;
  group.add(hubGlow);

  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI * 2 * i) / 10;
    const radial = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
    const axis = new THREE.Vector3(0, handedness * 0.86, 0).add(tangent.multiplyScalar(0.68)).normalize();
    addMecanumRoller(group, radial.multiplyScalar(0.44), axis);
  }

  const faceAngle = handedness * Math.PI / 4;
  faceRollerOffsets.forEach((offset) => {
    capsule(group, 0.035, 0.56, materials.roller, [offset * Math.cos(faceAngle + Math.PI / 2), 0.235, offset * Math.sin(faceAngle + Math.PI / 2)], [0, faceAngle, 0]);
    capsule(group, 0.029, 0.44, materials.cyanLine, [offset * Math.cos(faceAngle + Math.PI / 2), 0.27, offset * Math.sin(faceAngle + Math.PI / 2)], [0, faceAngle, 0]);
  });

  for (let i = -1; i <= 1; i += 2) {
    const sideMarker = capsule(group, 0.022, 0.58, materials.amberLine, [0, i * 0.255, 0], [0, faceAngle, 0]);
    sideMarker.scale.z = 0.9;
  }

  omniWheels.push({ group, hubGlow, handedness });
}

createOmniWheel([-1.82, -0.08, 1.34], 1);
createOmniWheel([1.82, -0.08, 1.34], -1);
createOmniWheel([-2.18, -0.08, -1.04], -1);
createOmniWheel([2.18, -0.08, -1.04], 1);

capsule(robot, 0.06, 4.28, materials.matte, [0, -0.08, 1.36]);
capsule(robot, 0.06, 4.06, materials.matte, [0, -0.08, -1.16]);
box(robot, [0.1, 0.14, 2.5], materials.armor, [-2.12, -0.06, 0.08]);
box(robot, [0.1, 0.14, 2.5], materials.armor, [2.12, -0.06, 0.08]);

const pods = [];

function createVisionTower(x) {
  const tower = new THREE.Group();
  tower.position.set(x, 1.0, 0.08);
  robot.add(tower);

  box(tower, [0.16, 2.16, 0.16], materials.armor, [-0.12, 0.96, 0]);
  box(tower, [0.16, 2.16, 0.16], materials.armor, [0.12, 0.96, 0]);
  box(tower, [0.58, 0.34, 0.44], materials.darkGlass, [0, 0.12, 0]);
  box(tower, [0.74, 0.72, 0.82], materials.armor, [0, 1.72, 0]);
  box(tower, [0.58, 0.44, 0.66], materials.darkGlass, [0, 2.16, 0.02]);
  box(tower, [0.76, 0.1, 0.86], materials.brass, [0, 1.28, 0.02]);
  box(tower, [0.52, 0.08, 0.72], materials.redLine, [0, 1.47, 0.43]);
  box(tower, [0.42, 0.08, 0.72], materials.cyanLine, [-0.2, 1.47, 0.44]);

  const lensGroup = new THREE.Group();
  lensGroup.position.set(0, 1.72, 0.48);
  tower.add(lensGroup);
  cyl(lensGroup, 0.22, 0.28, 0.18, materials.matte, [0, 0, 0], [Math.PI / 2, 0, 0], 42);
  cyl(lensGroup, 0.11, 0.12, 0.2, materials.glowLens, [0, 0, 0.07], [Math.PI / 2, 0, 0], 32);

  const hood = box(tower, [0.58, 0.28, 0.76], materials.darkGlass, [0, 2.62, -0.02]);
  hood.rotation.x = -0.08;
  pods.push({ tower, lensGroup });
}

createVisionTower(-1.12);
createVisionTower(1.12);

const topBar = new THREE.Group();
topBar.position.set(0, 3.94, 0.08);
robot.add(topBar);
box(topBar, [3.0, 0.14, 0.3], materials.armor, [0, 0, 0]);
box(topBar, [0.8, 0.055, 0.34], materials.amberLine, [-0.9, 0.09, 0.01]);
box(topBar, [0.8, 0.055, 0.34], materials.amberLine, [0.9, 0.09, 0.01]);

const eye = new THREE.Group();
eye.position.set(0, 1.36, 0.94);
robot.add(eye);
cyl(eye, 0.43, 0.5, 0.3, materials.brass, [0, 0, -0.05], [Math.PI / 2, 0, 0], 56);
mesh(eye, new THREE.SphereGeometry(0.38, 42, 24), materials.darkGlass, [0, 0.08, 0.04], null, [1.1, 0.76, 0.78]);
cyl(eye, 0.2, 0.22, 0.16, materials.glowLens, [0, 0.08, 0.34], [Math.PI / 2, 0, 0], 42);

const barrelPitch = new THREE.Group();
barrelPitch.position.set(0, 0.08, 0.34);
eye.add(barrelPitch);
cyl(barrelPitch, 0.08, 0.1, 0.7, materials.matte, [0, 0, 0.35], [Math.PI / 2, 0, 0], 36);
cyl(barrelPitch, 0.14, 0.16, 0.08, materials.brass, [0, 0, 0.72], [Math.PI / 2, 0, 0], 42);
box(barrelPitch, [0.44, 0.045, 0.07], materials.amberLine, [0, 0, 0.71]);
cyl(barrelPitch, 0.055, 0.055, 0.64, materials.brass, [0, 0, 0.02], [0, 0, Math.PI / 2], 28);
box(barrelPitch, [0.06, 0.32, 0.08], materials.cyanLine, [-0.36, 0, 0.03]);
box(barrelPitch, [0.06, 0.32, 0.08], materials.cyanLine, [0.36, 0, 0.03]);
const eyeLight = new THREE.PointLight(0x45d8ff, 3.6, 4.2);
eyeLight.position.set(0, 0.02, 0.64);
barrelPitch.add(eyeLight);

const muzzleFlash = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 18), materials.flash);
muzzleFlash.position.set(0, 0, 0.82);
muzzleFlash.visible = false;
barrelPitch.add(muzzleFlash);

const muzzleFlashLight = new THREE.PointLight(0xffd166, 0, 3.8);
muzzleFlashLight.position.copy(muzzleFlash.position);
barrelPitch.add(muzzleFlashLight);

const cableGroup = new THREE.Group();
robot.add(cableGroup);

function cable(x, z, curve = 0) {
  const points = [
    new THREE.Vector3(x, 3.86, z),
    new THREE.Vector3(x + curve, 3.1, z + 0.02),
    new THREE.Vector3(x - curve * 0.3, 2.15, z + 0.08),
    new THREE.Vector3(x, 1.56, z + 0.12)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x637d8d, transparent: true, opacity: 0.7 });
  const item = new THREE.Line(geometry, material);
  cableGroup.add(item);
}

cable(-0.78, -0.06, 0.08);
cable(0.78, -0.06, -0.08);
cable(0, -0.08, 0);

const scanCone = new THREE.Mesh(
  new THREE.ConeGeometry(1.25, 3.2, 40, 1, true),
  new THREE.MeshBasicMaterial({
    color: 0x45d8ff,
    transparent: true,
    opacity: 0.09,
    side: THREE.DoubleSide,
    depthWrite: false
  })
);
scanCone.position.set(0, 1.54, 2.45);
scanCone.rotation.x = Math.PI / 2;
robot.add(scanCone);

const autoAim = new THREE.Group();
robot.add(autoAim);

const movingTarget = new THREE.Group();
movingTarget.position.set(2.04, 1.92, 2.58);
scene.add(movingTarget);

box(movingTarget, [0.5, 0.3, 0.08], materials.darkGlass, [0, 0, -0.06]);
box(movingTarget, [0.58, 0.04, 0.1], materials.redLine, [0, 0.18, -0.04]);
box(movingTarget, [0.58, 0.04, 0.1], materials.cyanLine, [0, -0.18, -0.04]);
box(movingTarget, [0.04, 0.36, 0.1], materials.amberLine, [-0.3, 0, -0.04]);
box(movingTarget, [0.04, 0.36, 0.1], materials.amberLine, [0.3, 0, -0.04]);
const targetCore = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 12), materials.redLine);
targetCore.position.set(0, 0, 0.03);
movingTarget.add(targetCore);

const impactGroup = new THREE.Group();
impactGroup.visible = false;
movingTarget.add(impactGroup);

const impactSparks = [];
for (let i = 0; i < 10; i += 1) {
  const angle = (Math.PI * 2 * i) / 10;
  const sparkMaterial = new THREE.MeshBasicMaterial({
    color: i % 2 ? 0xffd166 : 0x45d8ff,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 8), sparkMaterial);
  spark.userData.direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0.22 * Math.sin(angle * 1.7)).normalize();
  impactGroup.add(spark);
  impactSparks.push(spark);
}

const targetReticle = new THREE.Group();
targetReticle.position.set(0, 0, 0.08);
movingTarget.add(targetReticle);

const targetRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.34, 0.014, 8, 72),
  new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.86 })
);
targetReticle.add(targetRing);

const targetInner = new THREE.Mesh(
  new THREE.TorusGeometry(0.18, 0.01, 8, 52),
  new THREE.MeshBasicMaterial({ color: 0x45d8ff, transparent: true, opacity: 0.78 })
);
targetReticle.add(targetInner);

const targetHitPulse = new THREE.Mesh(
  new THREE.TorusGeometry(0.28, 0.022, 8, 64),
  materials.hitPulse
);
targetHitPulse.visible = false;
targetReticle.add(targetHitPulse);

box(targetReticle, [0.72, 0.018, 0.018], materials.amberLine, [0, 0, 0]);
box(targetReticle, [0.018, 0.72, 0.018], materials.amberLine, [0, 0, 0]);

const aimLines = [];
function aimLine(from, to, color, opacity = 0.74) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ]);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const item = new THREE.Line(geometry, material);
  item.userData.from = new THREE.Vector3(...from);
  autoAim.add(item);
  aimLines.push(item);
  return item;
}

aimLine([0, 1.48, 1.28], [2.04, 2.18, 2.58], 0x45d8ff, 0.7);
aimLine([-1.12, 2.72, 0.62], [2.04, 2.18, 2.58], 0x78ff9c, 0.48);
aimLine([1.12, 2.72, 0.62], [2.04, 2.18, 2.58], 0xffd166, 0.48);

const navGroup = new THREE.Group();
scene.add(navGroup);

const navPoints = [
  [-3.1, -0.36, 1.55],
  [-1.9, -0.36, 0.56],
  [-0.2, -0.36, 0.92],
  [1.5, -0.36, 0.18],
  [3.0, -0.36, 1.1]
];
const navLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(navPoints.map((point) => new THREE.Vector3(...point))),
  new THREE.LineBasicMaterial({ color: 0x78ff9c, transparent: true, opacity: 0.64 })
);
navGroup.add(navLine);

const navNodes = [];
for (const point of navPoints) {
  const node = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.018, 24),
    materials.greenLine
  );
  node.position.set(...point);
  navGroup.add(node);
  navNodes.push(node);
}

const radarSweep = new THREE.Mesh(
  new THREE.RingGeometry(0.3, 3.2, 72, 1, 0, Math.PI * 0.32),
  new THREE.MeshBasicMaterial({
    color: 0x45d8ff,
    transparent: true,
    opacity: 0.13,
    side: THREE.DoubleSide,
    depthWrite: false
  })
);
radarSweep.position.y = -0.34;
radarSweep.rotation.x = -Math.PI / 2;
scene.add(radarSweep);

const floor = new THREE.GridHelper(16, 32, 0x45d8ff, 0x314e5d);
floor.position.y = -0.42;
floor.material.transparent = true;
floor.material.opacity = 0.28;
scene.add(floor);

const backRing = new THREE.Mesh(
  new THREE.TorusGeometry(3.05, 0.012, 8, 128),
  new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.42 })
);
backRing.position.y = -0.12;
backRing.rotation.x = Math.PI / 2;
scene.add(backRing);

const dots = new THREE.Group();
const dotGeo = new THREE.SphereGeometry(0.024, 10, 10);
const dotMaterials = [materials.cyanLine, materials.amberLine, materials.greenLine, materials.redLine];
for (let i = 0; i < 72; i += 1) {
  const dot = new THREE.Mesh(dotGeo, dotMaterials[i % dotMaterials.length]);
  const radius = 5.4 + Math.random() * 4.4;
  const angle = Math.random() * Math.PI * 2;
  dot.position.set(Math.cos(angle) * radius, Math.random() * 3.7, Math.sin(angle) * radius - 1.4);
  dots.add(dot);
}
scene.add(dots);

scene.add(new THREE.HemisphereLight(0x9eeaff, 0x081018, 1.36));

const key = new THREE.PointLight(0x45d8ff, 7.4, 18);
key.position.set(-4.6, 4.0, 5.2);
scene.add(key);

const warm = new THREE.PointLight(0xffd166, 5.4, 14);
warm.position.set(4.2, 2.8, 4.5);
scene.add(warm);

const rim = new THREE.PointLight(0x78ff9c, 2.8, 12);
rim.position.set(0, 3.6, -4.2);
scene.add(rim);

const projectileGeo = new THREE.SphereGeometry(0.11, 20, 20);
const beamGeo = new THREE.CylinderGeometry(0.036, 0.066, 1, 14);
const projectiles = [];
const shotTraces = [];
const fireIntervalMs = 145;
let fireTimer = 0;
let demoShotTimer = 0;
let flashPower = 0;
let hitPower = 0;
let recoil = 0;
const muzzleWorldPosition = new THREE.Vector3();
const targetWorldPosition = new THREE.Vector3();
const shotDirection = new THREE.Vector3();
const segmentDirection = new THREE.Vector3();
const segmentMidpoint = new THREE.Vector3();
const gimbalTarget = new THREE.Vector3();
const eyeWorldPosition = new THREE.Vector3();
const targetAimWorldPosition = new THREE.Vector3();
const targetAimLocalPosition = new THREE.Vector3();
const lineTargetLocalPosition = new THREE.Vector3();
const driveInput = new THREE.Vector3();
const driveVelocity = new THREE.Vector3();

const clock = new THREE.Clock();
let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;
let wheelTravel = 0;
let driveYawOffset = 0;
let driveYawVelocity = 0;

const pressedKeys = new Set();
const driveKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE']);

function resize() {
  const rect = holder.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function onPointerMove(event) {
  const rect = holder.getBoundingClientRect();
  targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
}

function fireShot() {
  muzzleFlash.getWorldPosition(muzzleWorldPosition);
  targetReticle.getWorldPosition(targetWorldPosition);
  shotDirection.copy(targetWorldPosition).sub(muzzleWorldPosition).normalize();

  const shotMesh = new THREE.Mesh(projectileGeo, materials.projectile);
  shotMesh.position.copy(muzzleWorldPosition).addScaledVector(shotDirection, 0.16);
  scene.add(shotMesh);

  const beam = new THREE.Mesh(beamGeo, materials.beam.clone());
  beam.position.copy(shotMesh.position);
  scene.add(beam);

  const traceVector = targetWorldPosition.clone().sub(muzzleWorldPosition);
  const traceLength = Math.max(0.001, traceVector.length());
  const trace = new THREE.Mesh(beamGeo, materials.beam.clone());
  trace.position.copy(muzzleWorldPosition).add(targetWorldPosition).multiplyScalar(0.5);
  trace.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), traceVector.normalize());
  trace.scale.set(1.18, traceLength, 1.18);
  scene.add(trace);
  shotTraces.push({ mesh: trace, age: 0, maxAge: 0.24 });

  const trailPositions = new Float32Array(6);
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  const trail = new THREE.Line(trailGeometry, materials.trail.clone());
  scene.add(trail);

  projectiles.push({
    mesh: shotMesh,
    beam,
    trail,
    velocity: shotDirection.clone().multiplyScalar(7.8),
    age: 0,
    maxAge: 0.95
  });

  flashPower = 1;
  hitPower = 1;
  recoil = 1;
}

function startFiring(event) {
  event.preventDefault();
  if (event.pointerId !== undefined) {
    holder.setPointerCapture(event.pointerId);
  }
  if (!fireTimer) {
    fireShot();
    fireTimer = window.setInterval(fireShot, fireIntervalMs);
  }
}

function stopFiring(event) {
  if (event?.pointerId !== undefined && holder.hasPointerCapture(event.pointerId)) {
    holder.releasePointerCapture(event.pointerId);
  }
  if (fireTimer) {
    window.clearInterval(fireTimer);
    fireTimer = 0;
  }
}

function updateProjectiles(delta) {
  for (let i = shotTraces.length - 1; i >= 0; i -= 1) {
    const trace = shotTraces[i];
    trace.age += delta;
    trace.mesh.material.opacity = Math.max(0, 0.86 * (1 - trace.age / trace.maxAge));
    if (trace.age > trace.maxAge) {
      scene.remove(trace.mesh);
      trace.mesh.material.dispose();
      shotTraces.splice(i, 1);
    }
  }

  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const shot = projectiles[i];
    shot.age += delta;
    const previous = shot.mesh.position.clone();
    shot.mesh.position.addScaledVector(shot.velocity, delta);
    segmentDirection.copy(shot.mesh.position).sub(previous);
    const segmentLength = Math.max(0.001, segmentDirection.length());
    segmentMidpoint.copy(previous).add(shot.mesh.position).multiplyScalar(0.5);
    shot.beam.position.copy(segmentMidpoint);
    shot.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), segmentDirection.normalize());
    shot.beam.scale.set(1, segmentLength, 1);

    const positions = shot.trail.geometry.attributes.position.array;
    positions[0] = previous.x;
    positions[1] = previous.y;
    positions[2] = previous.z;
    positions[3] = shot.mesh.position.x;
    positions[4] = shot.mesh.position.y;
    positions[5] = shot.mesh.position.z;
    shot.trail.geometry.attributes.position.needsUpdate = true;
    shot.trail.material.opacity = Math.max(0, 0.9 * (1 - shot.age / shot.maxAge));
    shot.beam.material.opacity = Math.max(0, 0.68 * (1 - shot.age / shot.maxAge));

    if (shot.age > shot.maxAge) {
      scene.remove(shot.mesh);
      scene.remove(shot.beam);
      scene.remove(shot.trail);
      shot.beam.material.dispose();
      shot.trail.geometry.dispose();
      shot.trail.material.dispose();
      projectiles.splice(i, 1);
    }
  }
}

holder.addEventListener('pointermove', onPointerMove, { passive: true });
holder.addEventListener('pointerdown', startFiring);
holder.addEventListener('pointerup', stopFiring);
holder.addEventListener('pointerleave', stopFiring);
holder.addEventListener('pointercancel', stopFiring);
document.querySelectorAll('[data-drive-turn]').forEach((button) => {
  const code = button.dataset.driveTurn === 'left' ? 'KeyQ' : 'KeyE';
  const press = (event) => {
    pressedKeys.add(code);
    if (event.pointerId !== undefined) {
      button.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
  };
  const release = (event) => {
    pressedKeys.delete(code);
    if (event?.pointerId !== undefined && button.hasPointerCapture(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }
    event?.preventDefault();
  };
  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointerleave', release);
  button.addEventListener('pointercancel', release);
});
window.addEventListener('keydown', (event) => {
  if (driveKeys.has(event.code)) {
    pressedKeys.add(event.code);
    event.preventDefault();
  }
});
window.addEventListener('keyup', (event) => {
  if (driveKeys.has(event.code)) {
    pressedKeys.delete(event.code);
    event.preventDefault();
  }
});
window.addEventListener('resize', resize);

function animate() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const elapsed = clock.elapsedTime;
  pointerX += (targetX - pointerX) * Math.min(1, delta * 3.2);
  pointerY += (targetY - pointerY) * Math.min(1, delta * 3.2);
  recoil = Math.max(0, recoil - delta * 5.2);
  flashPower = Math.max(0, flashPower - delta * 6.4);
  hitPower = Math.max(0, hitPower - delta * 3.8);
  muzzleFlash.visible = flashPower > 0.02;
  muzzleFlash.scale.setScalar(0.56 + flashPower * 1.65);
  muzzleFlash.material.opacity = 0.9 * flashPower;
  muzzleFlashLight.intensity = 7.5 * flashPower;
  updateProjectiles(delta);

  if (!reducedMotion) {
    driveInput.set(
      (pressedKeys.has('KeyD') ? 1 : 0) - (pressedKeys.has('KeyA') ? 1 : 0),
      0,
      (pressedKeys.has('KeyS') ? 1 : 0) - (pressedKeys.has('KeyW') ? 1 : 0)
    );
    if (driveInput.lengthSq() > 0) {
      driveInput.normalize().multiplyScalar(1.45);
    }
    const turnInput = (pressedKeys.has('KeyE') ? 1 : 0) - (pressedKeys.has('KeyQ') ? 1 : 0);
    driveVelocity.lerp(driveInput, Math.min(1, delta * 5.8));
    driveYawVelocity += (turnInput * 1.55 - driveYawVelocity) * Math.min(1, delta * 7.2);
    driveYawOffset += driveYawVelocity * delta;
    robot.position.x = THREE.MathUtils.clamp(robot.position.x + driveVelocity.x * delta, -0.72, 0.72);
    robot.position.z = THREE.MathUtils.clamp(robot.position.z + driveVelocity.z * delta, -0.58, 0.58);
    wheelTravel += (driveVelocity.length() + Math.abs(driveYawVelocity) * 0.44) * delta * 5.4;

    movingTarget.position.set(
      1.62 + Math.sin(elapsed * 0.78) * 1.02 + Math.sin(elapsed * 1.9 + 1.2) * 0.28,
      1.92 + Math.sin(elapsed * 1.16 + 0.4) * 0.52 + Math.cos(elapsed * 2.15) * 0.16,
      2.42 + Math.cos(elapsed * 0.64) * 0.48 + Math.sin(elapsed * 1.62 + 0.8) * 0.18
    );
    const hitShake = hitPower * 0.055;
    movingTarget.position.x += Math.sin(elapsed * 36) * hitShake;
    movingTarget.position.y += Math.cos(elapsed * 31) * hitShake;
    movingTarget.rotation.y = Math.sin(elapsed * 0.9) * 0.28;
    movingTarget.rotation.x = Math.cos(elapsed * 0.72) * 0.08;
    targetCore.scale.setScalar(1 + Math.sin(elapsed * 5.2) * 0.22 + hitPower * 1.15);
    impactGroup.visible = hitPower > 0.02;
    impactGroup.rotation.z = elapsed * 3.1;
    impactSparks.forEach((spark, index) => {
      const distance = 0.08 + (1 - hitPower) * (0.34 + index * 0.012);
      spark.position.copy(spark.userData.direction).multiplyScalar(distance);
      spark.scale.setScalar(0.7 + hitPower * 1.9);
      spark.material.opacity = Math.max(0, hitPower * 0.95);
    });

    eye.position.z = 0.94 - recoil * 0.08;
    eye.getWorldPosition(eyeWorldPosition);
    targetReticle.getWorldPosition(targetAimWorldPosition);
    robot.worldToLocal(targetAimLocalPosition.copy(targetAimWorldPosition));
    gimbalTarget.copy(targetAimLocalPosition).sub(eye.position);
    const gimbalDistance = Math.max(0.001, Math.hypot(gimbalTarget.x, gimbalTarget.z));
    const desiredYaw = THREE.MathUtils.clamp(Math.atan2(gimbalTarget.x, gimbalTarget.z), -0.72, 0.72);
    const desiredPitch = THREE.MathUtils.clamp(-Math.atan2(gimbalTarget.y, gimbalDistance), -0.36, 0.22);
    eye.rotation.y += (desiredYaw - eye.rotation.y) * Math.min(1, delta * 6.4);
    eye.rotation.x += (pointerY * 0.025 - eye.rotation.x) * Math.min(1, delta * 4.2);
    barrelPitch.rotation.x += (desiredPitch - barrelPitch.rotation.x) * Math.min(1, delta * 5.8);

    if (!fireTimer) {
      demoShotTimer += delta;
      if (demoShotTimer > 1.55) {
        fireShot();
        demoShotTimer = 0;
      }
    }
    robot.rotation.y = -0.42 + driveYawOffset + Math.sin(elapsed * 0.24) * 0.07 + pointerX * 0.08;
    robot.rotation.x = -0.02 + pointerY * 0.04;
    base.position.y = 0.18 + Math.sin(elapsed * 1.0) * 0.025;
    scanCone.rotation.y = eye.rotation.y * 0.35;
    scanCone.rotation.z = Math.sin(elapsed * 0.7) * 0.12 + pointerX * 0.1;
    scanCone.material.opacity = 0.07 + Math.sin(elapsed * 1.8) * 0.028;
    eyeLight.intensity = 3.0 + Math.sin(elapsed * 2.5) * 0.8;
    targetReticle.rotation.z = elapsed * 0.9;
    targetRing.scale.setScalar(1 + Math.sin(elapsed * 2.1) * 0.08);
    targetInner.scale.setScalar(1 + Math.cos(elapsed * 2.6) * 0.1);
    targetHitPulse.visible = hitPower > 0.02;
    targetHitPulse.scale.setScalar(0.78 + (1 - hitPower) * 1.35);
    targetHitPulse.material.opacity = 0.74 * hitPower;
    aimLines.forEach((item, index) => {
      const positions = item.geometry.attributes.position.array;
      positions[0] = item.userData.from.x;
      positions[1] = item.userData.from.y;
      positions[2] = item.userData.from.z;
      autoAim.worldToLocal(lineTargetLocalPosition.copy(targetAimWorldPosition));
      positions[3] = lineTargetLocalPosition.x;
      positions[4] = lineTargetLocalPosition.y;
      positions[5] = lineTargetLocalPosition.z;
      item.geometry.attributes.position.needsUpdate = true;
      item.material.opacity = 0.36 + Math.sin(elapsed * 2.4 + index * 0.7) * 0.18;
    });
    navLine.material.opacity = 0.44 + Math.sin(elapsed * 1.35) * 0.16;
    navNodes.forEach((node, index) => {
      node.scale.setScalar(1 + Math.sin(elapsed * 1.8 + index * 0.9) * 0.22);
    });
    radarSweep.rotation.z = -elapsed * 0.72;
    radarSweep.material.opacity = 0.09 + Math.sin(elapsed * 1.6) * 0.04;
    omniWheels.forEach((wheel, index) => {
      const spinDirection = wheel.handedness > 0 ? 1 : -1;
      wheel.group.rotation.y = elapsed * spinDirection * 2.2 + wheelTravel * spinDirection;
      wheel.hubGlow.scale.setScalar(1 + Math.sin(elapsed * 2.1 + index) * 0.08);
    });

    pods.forEach((pod, index) => {
      pod.tower.rotation.y = Math.sin(elapsed * 0.52 + index) * 0.06 + pointerX * 0.05;
      pod.lensGroup.scale.setScalar(1 + Math.sin(elapsed * 2.2 + index) * 0.055);
    });

    floor.position.z = (elapsed * 0.36) % 1;
    backRing.rotation.z = elapsed * 0.18;
    dots.rotation.y = elapsed * 0.03;
    key.intensity = 6.8 + Math.sin(elapsed * 1.8) * 1.1;
    warm.intensity = 4.8 + Math.cos(elapsed * 1.2) * 0.8;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
animate();
