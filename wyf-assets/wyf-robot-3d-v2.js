import * as THREE from './three.module.min.js';

const holder = document.querySelector('[data-robot-scene]');
const canvas = document.querySelector('#wyfRobotScene');

if (!holder || !canvas) {
  throw new Error('WYF robot scene mount was not found.');
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x061018, 9, 24);

const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 80);
camera.position.set(5.2, 3.1, 7.8);
camera.lookAt(0, 0.6, 0);

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
renderer.toneMappingExposure = 1.22;

const cyan = new THREE.Color(0x45d8ff);
const green = new THREE.Color(0x78ff9c);
const red = new THREE.Color(0xff4e6a);
const amber = new THREE.Color(0xffd166);

const materials = {
  dark: new THREE.MeshStandardMaterial({
    color: 0x07131e,
    metalness: 0.58,
    roughness: 0.38,
    emissive: 0x061522,
    emissiveIntensity: 0.4
  }),
  armor: new THREE.MeshStandardMaterial({
    color: 0x122535,
    metalness: 0.72,
    roughness: 0.31,
    emissive: 0x071c28,
    emissiveIntensity: 0.44
  }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x132b36,
    metalness: 0.18,
    roughness: 0.18,
    emissive: 0x0e5368,
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0.76
  }),
  cyanLine: new THREE.MeshBasicMaterial({ color: cyan }),
  greenLine: new THREE.MeshBasicMaterial({ color: green }),
  redLine: new THREE.MeshBasicMaterial({ color: red }),
  amberLine: new THREE.MeshBasicMaterial({ color: amber }),
  wheel: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.18,
    roughness: 0.18,
    emissive: 0xdff8ff,
    emissiveIntensity: 0.32
  }),
  wheelSide: new THREE.MeshStandardMaterial({
    color: 0xf7fcff,
    metalness: 0.22,
    roughness: 0.2,
    emissive: 0xb9f0ff,
    emissiveIntensity: 0.28
  }),
  roller: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.16,
    roughness: 0.16,
    emissive: 0xe8fbff,
    emissiveIntensity: 0.36
  }),
  projectile: new THREE.MeshBasicMaterial({ color: 0xfff2a8 }),
  trail: new THREE.LineBasicMaterial({
    color: 0xffd166,
    transparent: true,
    opacity: 0.72
  }),
  flash: new THREE.MeshBasicMaterial({
    color: 0xfff3b0,
    transparent: true,
    opacity: 0.9
  })
};

const robot = new THREE.Group();
scene.add(robot);

function mesh(geometry, material, position, scale, rotation) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  if (scale) item.scale.set(...scale);
  if (rotation) item.rotation.set(...rotation);
  robot.add(item);
  return item;
}

function glowBox(position, scale, colorMaterial) {
  const bar = mesh(new THREE.BoxGeometry(1, 1, 1), colorMaterial, position, scale);
  bar.userData.glowBase = colorMaterial.color.clone();
  return bar;
}

const chassis = mesh(
  new THREE.BoxGeometry(4.4, 0.72, 2.18),
  materials.armor,
  [0, 0.58, 0],
  [1, 1, 1],
  [0, 0, 0]
);

mesh(new THREE.BoxGeometry(4.85, 0.22, 2.46), materials.dark, [0, 0.25, 0], null, [0, 0, 0]);
mesh(new THREE.BoxGeometry(2.25, 0.2, 2.56), materials.dark, [0, 1.03, 0], null, [0, 0, 0]);
mesh(new THREE.BoxGeometry(1.34, 0.82, 1.18), materials.glass, [0, 1.42, 0], null, [0, 0, 0]);

const turret = new THREE.Group();
turret.position.set(0, 1.98, 0);
robot.add(turret);

const turretBase = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.88, 0.44, 48), materials.armor);
turretBase.rotation.y = Math.PI / 10;
turret.add(turretBase);

const turretHead = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.72, 0.98), materials.dark);
turretHead.position.y = 0.42;
turret.add(turretHead);

const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 2.18, 28), materials.dark);
barrel.rotation.z = Math.PI / 2;
barrel.position.set(1.54, 0.42, 0);
turret.add(barrel);

const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 28), materials.cyanLine);
muzzle.rotation.z = Math.PI / 2;
muzzle.position.set(2.68, 0.42, 0);
turret.add(muzzle);

const muzzleFlash = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 18), materials.flash);
muzzleFlash.position.set(2.78, 0.42, 0);
muzzleFlash.visible = false;
turret.add(muzzleFlash);

const muzzleFlashLight = new THREE.PointLight(0xffd166, 0, 4);
muzzleFlashLight.position.copy(muzzleFlash.position);
turret.add(muzzleFlashLight);

glowBox([-1.16, 1.15, 1.13], [1.42, 0.05, 0.06], materials.cyanLine);
glowBox([1.16, 1.15, 1.13], [1.42, 0.05, 0.06], materials.greenLine);
glowBox([-1.18, 0.92, -1.13], [1.2, 0.05, 0.06], materials.redLine);
glowBox([1.22, 0.92, -1.13], [1.16, 0.05, 0.06], materials.cyanLine);

const wheels = [];
const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 56);
const sidePlateGeo = new THREE.TorusGeometry(0.52, 0.028, 10, 56);
const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.48, 36);
const rollerGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.58, 16);
const wheelPositions = [
  { position: [-1.74, 0.08, 1.42], handedness: 1 },
  { position: [1.74, 0.08, 1.42], handedness: -1 },
  { position: [-1.74, 0.08, -1.42], handedness: -1 },
  { position: [1.74, 0.08, -1.42], handedness: 1 }
];

for (const { position, handedness } of wheelPositions) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.x = Math.PI / 2;
  robot.add(group);

  const tire = new THREE.Mesh(wheelGeo, materials.wheel);
  group.add(tire);

  const leftPlate = new THREE.Mesh(sidePlateGeo, materials.wheelSide);
  leftPlate.position.z = 0.15;
  group.add(leftPlate);

  const rightPlate = new THREE.Mesh(sidePlateGeo, materials.wheelSide);
  rightPlate.position.z = -0.15;
  group.add(rightPlate);

  const hub = new THREE.Mesh(hubGeo, materials.cyanLine);
  group.add(hub);

  const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.08, 36), materials.wheel);
  hubCap.position.y = 0.25;
  group.add(hubCap);

  for (let i = 0; i < 12; i += 1) {
    const angle = (Math.PI * 2 * i) / 12;
    const radial = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
    const axis = new THREE.Vector3(0, handedness * 0.72, 0).add(tangent.multiplyScalar(0.7)).normalize();
    const roller = new THREE.Mesh(rollerGeo, materials.roller);
    roller.position.copy(radial.multiplyScalar(0.55));
    roller.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
    group.add(roller);
  }

  wheels.push(group);
}

const busGroup = new THREE.Group();
scene.add(busGroup);

function line(points, color, opacity = 1) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity
  });
  const item = new THREE.Line(geometry, material);
  busGroup.add(item);
  return item;
}

line([[-2.7, 0.06, -1.72], [-1.8, 0.52, -1.24], [-0.3, 0.74, -1.24], [0.42, 1.4, -0.7]], cyan, 0.72);
line([[2.7, 0.06, -1.72], [1.8, 0.52, -1.24], [0.3, 0.74, -1.24], [-0.38, 1.4, -0.7]], green, 0.72);
line([[-2.52, 0.08, 1.72], [-1.5, 0.48, 1.26], [0.1, 0.78, 1.26], [0.55, 1.44, 0.62]], red, 0.62);
line([[2.52, 0.08, 1.72], [1.5, 0.48, 1.26], [-0.1, 0.78, 1.26], [-0.55, 1.44, 0.62]], cyan, 0.62);

const floor = new THREE.GridHelper(16, 32, 0x45d8ff, 0x24495e);
floor.position.y = -0.42;
floor.material.transparent = true;
floor.material.opacity = 0.36;
scene.add(floor);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(3.1, 0.012, 8, 128),
  new THREE.MeshBasicMaterial({ color: 0x78ff9c, transparent: true, opacity: 0.54 })
);
ring.position.y = -0.18;
ring.rotation.x = Math.PI / 2;
scene.add(ring);

const scan = new THREE.Mesh(
  new THREE.TorusGeometry(1.8, 0.01, 8, 128),
  new THREE.MeshBasicMaterial({ color: 0x45d8ff, transparent: true, opacity: 0.72 })
);
scan.position.y = 1.9;
scan.rotation.x = Math.PI / 2;
scene.add(scan);

const dots = new THREE.Group();
const dotGeo = new THREE.SphereGeometry(0.025, 10, 10);
for (let i = 0; i < 92; i += 1) {
  const dot = new THREE.Mesh(dotGeo, i % 5 === 0 ? materials.greenLine : materials.cyanLine);
  const radius = 5.8 + Math.random() * 4.6;
  const angle = Math.random() * Math.PI * 2;
  dot.position.set(Math.cos(angle) * radius, Math.random() * 3.5, Math.sin(angle) * radius);
  dots.add(dot);
}
scene.add(dots);

scene.add(new THREE.HemisphereLight(0x9eeaff, 0x081018, 1.45));

const key = new THREE.PointLight(0x45d8ff, 7.5, 18);
key.position.set(-4.8, 4.4, 5.2);
scene.add(key);

const rim = new THREE.PointLight(0x78ff9c, 5.2, 14);
rim.position.set(4.8, 2.4, -4.2);
scene.add(rim);

const redLight = new THREE.PointLight(0xff4e6a, 3.2, 12);
redLight.position.set(0, 3.2, 5.5);
scene.add(redLight);

const projectileGeo = new THREE.SphereGeometry(0.075, 18, 18);
const projectiles = [];
const fireIntervalMs = 155;
let fireTimer = 0;
let flashPower = 0;
let recoil = 0;
const worldPosition = new THREE.Vector3();
const worldDirection = new THREE.Vector3();
const worldQuaternion = new THREE.Quaternion();

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

function fireShot() {
  muzzle.getWorldPosition(worldPosition);
  turret.getWorldQuaternion(worldQuaternion);
  worldDirection.set(1, 0, 0).applyQuaternion(worldQuaternion).normalize();

  const mesh = new THREE.Mesh(projectileGeo, materials.projectile);
  mesh.position.copy(worldPosition).addScaledVector(worldDirection, 0.22);
  scene.add(mesh);

  const trailPositions = new Float32Array(6);
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  const trail = new THREE.Line(trailGeometry, materials.trail.clone());
  scene.add(trail);

  projectiles.push({
    mesh,
    trail,
    velocity: worldDirection.clone().multiplyScalar(11.8),
    age: 0,
    maxAge: 1.35
  });

  flashPower = 1;
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
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const shot = projectiles[i];
    shot.age += delta;
    const previous = shot.mesh.position.clone();
    shot.mesh.position.addScaledVector(shot.velocity, delta);

    const positions = shot.trail.geometry.attributes.position.array;
    positions[0] = previous.x;
    positions[1] = previous.y;
    positions[2] = previous.z;
    positions[3] = shot.mesh.position.x;
    positions[4] = shot.mesh.position.y;
    positions[5] = shot.mesh.position.z;
    shot.trail.geometry.attributes.position.needsUpdate = true;
    shot.trail.material.opacity = Math.max(0, 0.72 * (1 - shot.age / shot.maxAge));

    if (shot.age > shot.maxAge) {
      scene.remove(shot.mesh);
      scene.remove(shot.trail);
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
window.addEventListener('resize', resize);

function animate() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const elapsed = clock.elapsedTime;
  pointerX += (targetX - pointerX) * 0.04;
  pointerY += (targetY - pointerY) * 0.04;
  recoil = Math.max(0, recoil - delta * 4.8);
  flashPower = Math.max(0, flashPower - delta * 5.5);

  turretHead.position.x = -0.1 * recoil;
  barrel.position.x = 1.54 - 0.18 * recoil;
  muzzle.position.x = 2.68 - 0.22 * recoil;
  muzzleFlash.position.x = 2.78 - 0.22 * recoil;
  muzzleFlash.visible = flashPower > 0.02;
  muzzleFlash.scale.setScalar(0.55 + flashPower * 1.65);
  muzzleFlash.material.opacity = 0.9 * flashPower;
  muzzleFlashLight.intensity = 7.5 * flashPower;
  updateProjectiles(delta);

  if (!reducedMotion) {
    robot.rotation.y = Math.sin(elapsed * 0.34) * 0.18 + pointerX * 0.12;
    robot.rotation.x = -0.03 + pointerY * 0.05;
    turret.rotation.y = Math.sin(elapsed * 0.86) * 0.42 + pointerX * 0.2;
    turret.rotation.z = Math.sin(elapsed * 0.74) * 0.035;
    chassis.position.y = Math.sin(elapsed * 1.2) * 0.035;

    wheels.forEach((wheel, index) => {
      wheel.rotation.y = elapsed * (index < 4 ? 2.7 : -2.7);
    });

    floor.position.z = (elapsed * 0.44) % 1;
    ring.rotation.z = elapsed * 0.24;
    scan.scale.setScalar(1 + Math.sin(elapsed * 1.4) * 0.1);
    scan.material.opacity = 0.48 + Math.sin(elapsed * 1.4) * 0.2;
    dots.rotation.y = elapsed * 0.035;
    key.intensity = 6.8 + Math.sin(elapsed * 1.8) * 1.3;
    rim.intensity = 4.8 + Math.cos(elapsed * 1.3) * 0.9;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
animate();
