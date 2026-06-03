import * as THREE from './three.module.min.js';

const holder = document.querySelector('[data-robot-scene]');
const canvas = document.querySelector('#ljhRobotScene');

if (!holder || !canvas) {
  throw new Error('LJH system robot scene mount was not found.');
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x061018, 9, 24);

const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 80);
camera.position.set(5.4, 3.2, 7.5);
camera.lookAt(0, 0.9, 0);

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
renderer.toneMappingExposure = 1.2;

const cyan = new THREE.Color(0x45d8ff);
const green = new THREE.Color(0x78ff9c);
const amber = new THREE.Color(0xffd166);
const red = new THREE.Color(0xff5b6f);
const violet = new THREE.Color(0xb68cff);

const materials = {
  dark: new THREE.MeshStandardMaterial({
    color: 0x07131e,
    metalness: 0.62,
    roughness: 0.36,
    emissive: 0x061522,
    emissiveIntensity: 0.38
  }),
  armor: new THREE.MeshStandardMaterial({
    color: 0x132636,
    metalness: 0.74,
    roughness: 0.3,
    emissive: 0x071c28,
    emissiveIntensity: 0.42
  }),
  steel: new THREE.MeshStandardMaterial({
    color: 0xc8d4dd,
    metalness: 0.7,
    roughness: 0.24,
    emissive: 0x172832,
    emissiveIntensity: 0.18
  }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x132f3c,
    metalness: 0.18,
    roughness: 0.16,
    emissive: 0x0e5368,
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0.74
  }),
  cyanLine: new THREE.MeshBasicMaterial({ color: cyan }),
  greenLine: new THREE.MeshBasicMaterial({ color: green }),
  amberLine: new THREE.MeshBasicMaterial({ color: amber }),
  redLine: new THREE.MeshBasicMaterial({ color: red }),
  violetLine: new THREE.MeshBasicMaterial({ color: violet }),
  wheel: new THREE.MeshStandardMaterial({
    color: 0xf8fcff,
    metalness: 0.16,
    roughness: 0.18,
    emissive: 0xcdeeff,
    emissiveIntensity: 0.24
  })
};

const robot = new THREE.Group();
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

function cylinder(parent, radiusTop, radiusBottom, height, material, position, rotation, segments = 42) {
  return mesh(parent, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material, position, rotation);
}

function glow(parent, size, material, position) {
  const item = box(parent, size, material, position);
  item.userData.glowBase = material.color.clone();
  return item;
}

const body = new THREE.Group();
body.position.y = 0.88;
robot.add(body);

box(body, [4.2, 0.66, 2.0], materials.armor, [0, 0, 0]);
box(body, [4.78, 0.18, 2.36], materials.dark, [0, -0.34, 0]);
box(body, [1.62, 0.6, 1.06], materials.glass, [0.2, 0.62, 0]);
box(body, [0.82, 0.32, 2.18], materials.steel, [-1.46, 0.2, 0]);
box(body, [1.02, 0.26, 1.72], materials.dark, [1.42, 0.44, 0]);

glow(body, [1.16, 0.045, 0.055], materials.cyanLine, [-1.16, 0.43, 1.02]);
glow(body, [1.12, 0.045, 0.055], materials.greenLine, [0.1, 0.43, 1.02]);
glow(body, [1.06, 0.045, 0.055], materials.amberLine, [1.24, 0.43, 1.02]);
glow(body, [1.7, 0.045, 0.055], materials.violetLine, [0, 0.05, -1.02]);

const mast = new THREE.Group();
mast.position.set(0.28, 1.48, 0);
robot.add(mast);

cylinder(mast, 0.12, 0.14, 0.92, materials.steel, [0, 0.28, 0], [0, 0, 0], 32);
const head = box(mast, [1.18, 0.58, 0.82], materials.dark, [0, 0.92, 0]);
const lens = cylinder(mast, 0.2, 0.25, 0.16, materials.cyanLine, [0.62, 0.94, 0], [0, 0, Math.PI / 2], 36);
const sideLens = cylinder(mast, 0.11, 0.13, 0.13, materials.amberLine, [0.62, 0.75, 0.28], [0, 0, Math.PI / 2], 28);
const scanCone = new THREE.Mesh(
  new THREE.ConeGeometry(1.3, 2.9, 40, 1, true),
  new THREE.MeshBasicMaterial({
    color: 0x45d8ff,
    transparent: true,
    opacity: 0.11,
    side: THREE.DoubleSide,
    depthWrite: false
  })
);
scanCone.position.set(2.08, 0.92, 0);
scanCone.rotation.z = -Math.PI / 2;
mast.add(scanCone);

const wheels = [];
const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.36, 56);
const rimGeo = new THREE.TorusGeometry(0.51, 0.026, 10, 56);
const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.44, 36);
const rollerGeo = new THREE.BoxGeometry(0.11, 0.04, 0.42);
const wheelPositions = [
  [-1.62, 0.05, 1.28],
  [1.62, 0.05, 1.28],
  [-1.62, 0.05, -1.28],
  [1.62, 0.05, -1.28]
];

for (const position of wheelPositions) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.x = Math.PI / 2;
  robot.add(group);

  const wheel = new THREE.Mesh(wheelGeo, materials.wheel);
  group.add(wheel);

  const outerRim = new THREE.Mesh(rimGeo, materials.cyanLine);
  outerRim.position.z = 0.16;
  group.add(outerRim);

  const innerRim = new THREE.Mesh(rimGeo, materials.greenLine);
  innerRim.position.z = -0.16;
  group.add(innerRim);

  const hub = new THREE.Mesh(hubGeo, materials.armor);
  group.add(hub);

  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI * 2 * i) / 10;
    const tread = new THREE.Mesh(rollerGeo, i % 2 === 0 ? materials.steel : materials.wheel);
    tread.position.set(Math.cos(angle) * 0.52, Math.sin(angle) * 0.52, 0);
    tread.rotation.z = angle;
    group.add(tread);
  }

  wheels.push(group);
}

const nodeGroup = new THREE.Group();
scene.add(nodeGroup);

function createNode(label, colorMaterial, position) {
  const group = new THREE.Group();
  group.position.set(...position);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), colorMaterial);
  group.add(core);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.012, 8, 52),
    new THREE.MeshBasicMaterial({ color: colorMaterial.color, transparent: true, opacity: 0.68 })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  group.userData.label = label;
  nodeGroup.add(group);
  return group;
}

const nodes = [
  createNode('vision', materials.cyanLine, [-2.4, 2.6, -0.2]),
  createNode('algo', materials.amberLine, [2.5, 2.22, 0.22]),
  createNode('ops', materials.violetLine, [-2.0, 0.78, 2.46]),
  createNode('mech', materials.greenLine, [2.2, 0.64, -2.34]),
  createNode('ctrl', materials.redLine, [0.1, 2.95, 1.82])
];

const lines = [];
function line(points, color, opacity = 0.78) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(...point)));
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity
  });
  const item = new THREE.Line(geometry, material);
  scene.add(item);
  lines.push(item);
  return item;
}

line([[-2.4, 2.6, -0.2], [0.28, 2.42, 0], [2.5, 2.22, 0.22]], cyan, 0.72);
line([[0.1, 2.95, 1.82], [0.2, 1.6, 0.8], [-2.0, 0.78, 2.46]], violet, 0.68);
line([[2.2, 0.64, -2.34], [0.4, 0.9, -1.05], [0.1, 2.95, 1.82]], green, 0.64);
line([[-2.4, 2.6, -0.2], [-0.9, 1.2, -0.8], [2.2, 0.64, -2.34]], amber, 0.58);
line([[2.5, 2.22, 0.22], [1.1, 1.05, 0.9], [-2.0, 0.78, 2.46]], red, 0.58);

const floor = new THREE.GridHelper(16, 32, 0x45d8ff, 0x314e5d);
floor.position.y = -0.42;
floor.material.transparent = true;
floor.material.opacity = 0.36;
scene.add(floor);

const fieldRing = new THREE.Mesh(
  new THREE.TorusGeometry(3.12, 0.012, 8, 128),
  new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.54 })
);
fieldRing.position.y = -0.18;
fieldRing.rotation.x = Math.PI / 2;
scene.add(fieldRing);

const scanRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.74, 0.01, 8, 128),
  new THREE.MeshBasicMaterial({ color: 0x78ff9c, transparent: true, opacity: 0.72 })
);
scanRing.position.y = 1.92;
scanRing.rotation.x = Math.PI / 2;
scene.add(scanRing);

const dots = new THREE.Group();
const dotGeo = new THREE.SphereGeometry(0.025, 10, 10);
const dotMaterials = [materials.cyanLine, materials.greenLine, materials.amberLine, materials.violetLine];
for (let i = 0; i < 96; i += 1) {
  const dot = new THREE.Mesh(dotGeo, dotMaterials[i % dotMaterials.length]);
  const radius = 5.8 + Math.random() * 4.6;
  const angle = Math.random() * Math.PI * 2;
  dot.position.set(Math.cos(angle) * radius, Math.random() * 3.8, Math.sin(angle) * radius);
  dots.add(dot);
}
scene.add(dots);

scene.add(new THREE.HemisphereLight(0x9eeaff, 0x081018, 1.42));

const key = new THREE.PointLight(0x45d8ff, 7.1, 18);
key.position.set(-4.8, 4.4, 5.2);
scene.add(key);

const rim = new THREE.PointLight(0xffd166, 5.0, 14);
rim.position.set(4.8, 2.4, -4.2);
scene.add(rim);

const greenLight = new THREE.PointLight(0x78ff9c, 3.4, 12);
greenLight.position.set(0, 3.2, 5.5);
scene.add(greenLight);

const clock = new THREE.Clock();
let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;

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

holder.addEventListener('pointermove', onPointerMove, { passive: true });
window.addEventListener('resize', resize);

function animate() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const elapsed = clock.elapsedTime;
  pointerX += (targetX - pointerX) * Math.min(1, delta * 3.2);
  pointerY += (targetY - pointerY) * Math.min(1, delta * 3.2);

  if (!reducedMotion) {
    robot.rotation.y = Math.sin(elapsed * 0.34) * 0.17 + pointerX * 0.12;
    robot.rotation.x = -0.035 + pointerY * 0.05;
    body.position.y = 0.88 + Math.sin(elapsed * 1.2) * 0.035;
    mast.rotation.y = Math.sin(elapsed * 0.86) * 0.44 + pointerX * 0.24;
    mast.rotation.z = Math.sin(elapsed * 0.72) * 0.035;
    head.position.y = 0.92 + Math.sin(elapsed * 1.4) * 0.025;
    lens.scale.setScalar(1 + Math.sin(elapsed * 3.1) * 0.08);
    sideLens.scale.setScalar(1 + Math.cos(elapsed * 2.5) * 0.06);
    scanCone.material.opacity = 0.08 + Math.sin(elapsed * 1.8) * 0.035;

    wheels.forEach((wheel, index) => {
      wheel.rotation.y = elapsed * (index % 2 === 0 ? 2.4 : -2.4);
    });

    nodes.forEach((node, index) => {
      node.rotation.y = elapsed * (0.8 + index * 0.08);
      node.rotation.x = Math.sin(elapsed * 0.9 + index) * 0.34;
      node.position.y += Math.sin(elapsed * 1.4 + index) * 0.0008;
      node.children[1].scale.setScalar(1 + Math.sin(elapsed * 1.8 + index) * 0.12);
    });

    lines.forEach((item, index) => {
      item.material.opacity = 0.48 + Math.sin(elapsed * 1.35 + index * 0.9) * 0.16;
    });

    floor.position.z = (elapsed * 0.44) % 1;
    fieldRing.rotation.z = elapsed * 0.24;
    scanRing.scale.setScalar(1 + Math.sin(elapsed * 1.4) * 0.1);
    scanRing.material.opacity = 0.48 + Math.sin(elapsed * 1.4) * 0.2;
    dots.rotation.y = elapsed * 0.035;
    key.intensity = 6.6 + Math.sin(elapsed * 1.8) * 1.25;
    rim.intensity = 4.7 + Math.cos(elapsed * 1.3) * 0.85;
    greenLight.intensity = 3.0 + Math.sin(elapsed * 1.15) * 0.8;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
animate();
