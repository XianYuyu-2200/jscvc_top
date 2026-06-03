import * as THREE from './three.module.min.js';

const holder = document.querySelector('[data-robot-scene]');
const canvas = document.querySelector('#wyfRobotScene');

if (!holder || !canvas) {
  throw new Error('JJX leg robot scene mount was not found.');
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x071018, 9, 24);

const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 80);
camera.position.set(5.4, 3.1, 7.4);
camera.lookAt(0, 1.05, 0);

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
renderer.toneMappingExposure = 1.18;

const cyan = new THREE.Color(0x45d8ff);
const amber = new THREE.Color(0xffd166);
const red = new THREE.Color(0xff5b6f);

const materials = {
  dark: new THREE.MeshStandardMaterial({
    color: 0x08090c,
    metalness: 0.62,
    roughness: 0.42,
    emissive: 0x120407,
    emissiveIntensity: 0.28
  }),
  armor: new THREE.MeshStandardMaterial({
    color: 0x11151a,
    metalness: 0.76,
    roughness: 0.34,
    emissive: 0x160609,
    emissiveIntensity: 0.36
  }),
  steel: new THREE.MeshStandardMaterial({
    color: 0xc9d4dd,
    metalness: 0.74,
    roughness: 0.23,
    emissive: 0x182833,
    emissiveIntensity: 0.18
  }),
  rubber: new THREE.MeshStandardMaterial({
    color: 0x17191d,
    metalness: 0.12,
    roughness: 0.34,
    emissive: 0x050506,
    emissiveIntensity: 0.08
  }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x142e39,
    metalness: 0.18,
    roughness: 0.18,
    emissive: 0x0d5268,
    emissiveIntensity: 0.48,
    transparent: true,
    opacity: 0.72
  }),
  cyanLine: new THREE.MeshBasicMaterial({ color: cyan }),
  amberLine: new THREE.MeshBasicMaterial({ color: amber }),
  redLine: new THREE.MeshBasicMaterial({ color: red }),
  whiteMark: new THREE.MeshBasicMaterial({ color: 0xffffff }),
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

function mesh(parent, geometry, material, position, rotation) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  if (rotation) item.rotation.set(...rotation);
  parent.add(item);
  return item;
}

function box(parent, size, material, position, rotation) {
  return mesh(parent, new THREE.BoxGeometry(...size), material, position, rotation);
}

function cylinder(parent, radiusTop, radiusBottom, height, material, position, rotation, segments = 42) {
  return mesh(parent, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material, position, rotation);
}

function link(parent, length, material, y = 0, z = 0) {
  const item = box(parent, [length, 0.13, 0.11], material, [length / 2, y, z]);
  item.castShadow = true;
  return item;
}

function glowBox(parent, size, material, position) {
  const item = box(parent, size, material, position);
  item.userData.glowBase = material.color.clone();
  return item;
}

function createNumberMaterial(value) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.font = '900 118px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(value, canvas.width / 2, canvas.height / 2 + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
}

const numberThreeMaterial = createNumberMaterial('3');

function addNumberDecal(plate, face, width, height) {
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(width, height), numberThreeMaterial);
  const offset = 0.006;

  if (face === 'front') {
    decal.position.x = 0.046 + offset;
    decal.rotation.y = Math.PI / 2;
  } else if (face === 'back') {
    decal.position.x = -0.046 - offset;
    decal.rotation.y = -Math.PI / 2;
  } else if (face === 'right') {
    decal.position.z = 0.046 + offset;
  } else if (face === 'left') {
    decal.position.z = -0.046 - offset;
    decal.rotation.y = Math.PI;
  }

  plate.add(decal);
}

function createArmorPlate(parent, size, position, rotation, accentMaterial, lightPosition, numberFace) {
  const geometry = new THREE.BoxGeometry(...size);
  const plate = new THREE.Mesh(geometry, materials.dark);
  plate.position.set(...position);
  if (rotation) plate.rotation.set(...rotation);
  parent.add(plate);

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: accentMaterial.color,
    transparent: true,
    opacity: 0.92
  });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMaterial);
  plate.add(edges);

  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.055, 0.055), accentMaterial);
  lamp.position.set(...lightPosition);
  plate.add(lamp);

  const redGlow = new THREE.PointLight(0xff3040, 1.35, 1.8);
  redGlow.position.set(...lightPosition);
  plate.add(redGlow);

  if (numberFace) {
    const isSideFace = numberFace === 'left' || numberFace === 'right';
    addNumberDecal(plate, numberFace, isSideFace ? size[0] * 0.52 : size[2] * 0.42, size[1] * 0.72);
  }

  return plate;
}

const body = new THREE.Group();
body.position.y = 1.18;
robot.add(body);

box(body, [3.05, 0.48, 1.22], materials.armor, [0, 0.08, 0]);
box(body, [2.62, 0.18, 1.48], materials.dark, [0, -0.2, 0]);
box(body, [1.7, 0.34, 1.02], materials.dark, [0.22, 0.5, 0]);
box(body, [1.42, 0.16, 1.18], materials.armor, [0.34, 0.78, 0]);
box(body, [0.66, 0.26, 1.46], materials.dark, [-1.18, 0.16, 0]);
glowBox(body, [1.22, 0.06, 0.06], materials.redLine, [-0.52, 0.58, 0.64]);
glowBox(body, [1.16, 0.06, 0.06], materials.redLine, [0.72, 0.44, -0.64]);
glowBox(body, [0.08, 0.08, 1.08], materials.redLine, [-1.54, 0.08, 0]);

createArmorPlate(body, [0.1, 0.44, 0.92], [1.56, 0.16, 0], [0, 0, -0.12], materials.redLine, [0.056, 0.02, 0], 'front');
createArmorPlate(body, [0.1, 0.42, 0.86], [-1.54, 0.12, 0], [0, 0, 0.12], materials.redLine, [-0.056, 0, 0], 'back');
createArmorPlate(body, [1.0, 0.44, 0.1], [0.12, 0.14, 0.78], [0.08, 0, 0], materials.redLine, [0, 0.02, 0.056], 'right');
createArmorPlate(body, [1.0, 0.44, 0.1], [0.12, 0.14, -0.78], [-0.08, 0, 0], materials.redLine, [0, 0.02, -0.056], 'left');

const turret = new THREE.Group();
turret.position.set(0.18, 2.04, 0);
robot.add(turret);

const turretBase = cylinder(turret, 0.5, 0.58, 0.24, materials.armor, [-0.32, 0, 0], [0, Math.PI / 10, 0], 40);
const turretHead = box(turret, [1.58, 0.42, 1.02], materials.dark, [0.22, 0.28, 0]);
box(turret, [1.2, 0.08, 0.84], materials.armor, [0.38, 0.52, 0]);
const barrel = cylinder(turret, 0.09, 0.12, 0.74, materials.dark, [1.12, 0.28, 0], [0, 0, Math.PI / 2], 24);
const muzzle = cylinder(turret, 0.16, 0.16, 0.12, materials.redLine, [1.52, 0.28, 0], [0, 0, Math.PI / 2], 24);

const muzzleFlash = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 18), materials.flash);
muzzleFlash.position.set(1.62, 0.28, 0);
muzzleFlash.visible = false;
turret.add(muzzleFlash);

const muzzleFlashLight = new THREE.PointLight(0xffd166, 0, 4);
muzzleFlashLight.position.copy(muzzleFlash.position);
turret.add(muzzleFlashLight);

const legs = [];
const wheelGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.34, 64);
const rimGeo = new THREE.TorusGeometry(0.57, 0.026, 10, 64);
const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 36);
const rollerGeo = new THREE.BoxGeometry(0.12, 0.04, 0.44);

function createLeg(side) {
  const sideGroup = new THREE.Group();
  sideGroup.position.z = side * 1.02;
  robot.add(sideGroup);

  box(sideGroup, [1.72, 0.22, 0.32], materials.dark, [0, 1.18, 0]);
  const shoulder = cylinder(sideGroup, 0.26, 0.26, 0.38, materials.steel, [-0.58, 1.08, 0], [Math.PI / 2, 0, 0], 36);

  const hip = new THREE.Group();
  hip.position.set(-0.58, 1.08, 0);
  sideGroup.add(hip);

  const upperLen = 1.36;
  const lowerLen = 1.24;
  const targetX = 0.9;
  const targetY = -1.52;
  const baseHip = -1.9;
  const baseKnee = 1.66;
  hip.rotation.z = baseHip;

  link(hip, upperLen, materials.steel, 0.06, 0.08);
  link(hip, upperLen, materials.steel, -0.06, -0.08);
  glowBox(hip, [upperLen * 0.82, 0.035, 0.04], materials.redLine, [upperLen * 0.45, 0.16, 0]);

  const knee = new THREE.Group();
  knee.position.x = upperLen;
  knee.rotation.z = baseKnee;
  hip.add(knee);

  cylinder(knee, 0.22, 0.22, 0.42, materials.armor, [0, 0, 0], [Math.PI / 2, 0, 0], 36);
  link(knee, lowerLen, materials.steel, 0.06, 0.08);
  link(knee, lowerLen, materials.steel, -0.06, -0.08);
  glowBox(knee, [lowerLen * 0.78, 0.035, 0.04], materials.redLine, [lowerLen * 0.42, -0.16, 0]);

  const wheelGroup = new THREE.Group();
  wheelGroup.position.x = lowerLen;
  knee.add(wheelGroup);

  const wheel = new THREE.Mesh(wheelGeo, materials.rubber);
  wheel.rotation.x = Math.PI / 2;
  wheelGroup.add(wheel);

  const outerRim = new THREE.Mesh(rimGeo, materials.redLine);
  outerRim.position.z = 0.19;
  wheelGroup.add(outerRim);

  const innerRim = new THREE.Mesh(rimGeo, materials.redLine);
  innerRim.position.z = -0.19;
  wheelGroup.add(innerRim);

  const hub = cylinder(wheelGroup, 0.2, 0.2, 0.42, materials.armor, [0, 0, 0], [Math.PI / 2, 0, 0], 36);

  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI * 2 * i) / 10;
    const tread = new THREE.Mesh(rollerGeo, materials.steel);
    tread.position.set(Math.cos(angle) * 0.58, Math.sin(angle) * 0.58, 0);
    tread.rotation.z = angle;
    wheelGroup.add(tread);
  }

  const footLight = new THREE.PointLight(0xff3040, 1.8, 2.8);
  footLight.position.set(0, 0.04, 0);
  wheelGroup.add(footLight);

  legs.push({
    side,
    shoulder,
    hip,
    knee,
    wheel,
    hub,
    wheelGroup,
    footLight,
    upperLen,
    lowerLen,
    targetX,
    targetY,
    baseHip,
    baseKnee
  });
}

createLeg(1);
createLeg(-1);

function solveSerialLeg(leg, offsetY = 0, offsetX = 0) {
  const x = leg.targetX + offsetX;
  const y = leg.targetY + offsetY;
  const l1 = leg.upperLen;
  const l2 = leg.lowerLen;
  const distanceSq = x * x + y * y;
  const kneeCos = THREE.MathUtils.clamp((distanceSq - l1 * l1 - l2 * l2) / (2 * l1 * l2), -0.82, 0.78);
  const knee = Math.acos(kneeCos);
  const hip = Math.atan2(y, x) - Math.atan2(l2 * Math.sin(knee), l1 + l2 * Math.cos(knee));

  leg.hip.rotation.z = hip;
  leg.knee.rotation.z = knee;
  leg.wheelGroup.rotation.z = -(hip + knee);
}

legs.forEach((leg) => solveSerialLeg(leg));

const floor = new THREE.GridHelper(16, 32, 0xff5b6f, 0x423238);
floor.position.y = -0.42;
floor.material.transparent = true;
floor.material.opacity = 0.36;
scene.add(floor);

const balanceRing = new THREE.Mesh(
  new THREE.TorusGeometry(3.0, 0.012, 8, 128),
  new THREE.MeshBasicMaterial({ color: 0xff3040, transparent: true, opacity: 0.56 })
);
balanceRing.position.y = -0.18;
balanceRing.rotation.x = Math.PI / 2;
scene.add(balanceRing);

const scan = new THREE.Mesh(
  new THREE.TorusGeometry(1.76, 0.01, 8, 128),
  new THREE.MeshBasicMaterial({ color: 0xff5b6f, transparent: true, opacity: 0.72 })
);
scan.position.y = 1.95;
scan.rotation.x = Math.PI / 2;
scene.add(scan);

const dots = new THREE.Group();
const dotGeo = new THREE.SphereGeometry(0.025, 10, 10);
for (let i = 0; i < 86; i += 1) {
  const dot = new THREE.Mesh(dotGeo, i % 4 === 0 ? materials.whiteMark : materials.redLine);
  const radius = 5.8 + Math.random() * 4.6;
  const angle = Math.random() * Math.PI * 2;
  dot.position.set(Math.cos(angle) * radius, Math.random() * 3.8, Math.sin(angle) * radius);
  dots.add(dot);
}
scene.add(dots);

scene.add(new THREE.HemisphereLight(0x9eeaff, 0x081018, 1.45));

const key = new THREE.PointLight(0xff5b6f, 7.2, 18);
key.position.set(-4.8, 4.4, 5.2);
scene.add(key);

const rim = new THREE.PointLight(0xffffff, 3.6, 14);
rim.position.set(4.8, 2.4, -4.2);
scene.add(rim);

const redLight = new THREE.PointLight(0xff5b6f, 2.8, 12);
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
let bodyLift = 0;
let crouch = 0;
let crouchTarget = 0;

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

  const shotMesh = new THREE.Mesh(projectileGeo, materials.projectile);
  shotMesh.position.copy(worldPosition).addScaledVector(worldDirection, 0.22);
  scene.add(shotMesh);

  const trailPositions = new Float32Array(6);
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  const trail = new THREE.Line(trailGeometry, materials.trail.clone());
  scene.add(trail);

  projectiles.push({
    mesh: shotMesh,
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

function onKeyDown(event) {
  if (event.key === 'Control') {
    crouchTarget = 1;
  }
}

function onKeyUp(event) {
  if (event.key === 'Control' || !event.ctrlKey) {
    crouchTarget = 0;
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
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
window.addEventListener('blur', () => {
  crouchTarget = 0;
});

function animate() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const elapsed = clock.elapsedTime;
  pointerX += (targetX - pointerX) * 0.04;
  pointerY += (targetY - pointerY) * 0.04;
  recoil = Math.max(0, recoil - delta * 4.8);
  flashPower = Math.max(0, flashPower - delta * 5.5);
  crouch += (crouchTarget - crouch) * Math.min(1, delta * 8.5);

  turretHead.position.x = 0.22 - 0.08 * recoil;
  barrel.position.x = 1.12 - 0.11 * recoil;
  muzzle.position.x = 1.52 - 0.14 * recoil;
  muzzleFlash.position.x = 1.62 - 0.14 * recoil;
  muzzleFlash.visible = flashPower > 0.02;
  muzzleFlash.scale.setScalar(0.55 + flashPower * 1.65);
  muzzleFlash.material.opacity = 0.9 * flashPower;
  muzzleFlashLight.intensity = 7.5 * flashPower;
  updateProjectiles(delta);

  const idleLift = reducedMotion ? 0 : Math.sin(elapsed * 1.15) * 0.022;
  bodyLift = idleLift - crouch * 0.42;
  body.position.y = 1.18 + bodyLift;
  turret.position.y = 2.04 + bodyLift;

  legs.forEach((leg) => {
    const idleBalance = reducedMotion ? 0 : Math.sin(elapsed * 1.15) * 0.075;
    const balance = idleBalance + pointerY * 0.035 + crouch * 0.46;
    const stanceShift = pointerX * 0.035;
    solveSerialLeg(leg, balance, stanceShift);
    leg.wheel.rotation.z = 0;
    leg.hub.rotation.z = 0;
    leg.footLight.intensity = 1.45 + crouch * 1.8 + Math.max(0, -balance) * 7.2;
    leg.shoulder.rotation.y = pointerX * 0.05;
  });

  if (!reducedMotion) {
    robot.rotation.y = Math.sin(elapsed * 0.34) * 0.17 + pointerX * 0.12;
    robot.rotation.x = -0.03 + pointerY * 0.05;
    turret.rotation.y = Math.sin(elapsed * 0.86) * 0.38 + pointerX * 0.2;
    turret.rotation.z = Math.sin(elapsed * 0.74) * 0.035;

    floor.position.z = (elapsed * 0.44) % 1;
    balanceRing.rotation.z = elapsed * 0.26;
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
