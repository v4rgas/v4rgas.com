import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Physics world
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.8, 0) });

// Ground physics plane
const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
groundBody.position.set(0, -26, 0);
world.addBody(groundBody);

// CRT body collider (static box behind the screen)
const crtCollider = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Box(new CANNON.Vec3(27, 21, 33)),
});
crtCollider.position.set(-8.7, -5, -62);
world.addBody(crtCollider);

// Scene
const scene = new THREE.Scene();
scene.background = null;

// Camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
// 25 degree side view so the depth of the voxels is visible
const isMobile = window.innerWidth < 768;
const viewDist = isMobile ? 150 : 110;
const angle = 25 * (Math.PI / 180);
camera.position.set(Math.sin(angle) * viewDist, 5, Math.cos(angle) * viewDist);
camera.lookAt(0, -2, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, -2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.08);
scene.add(ambient);

// --- Throwable system ---
const throwables = [];
const meshToThrowable = new Map();
let activeThrowCount = 0;

function registerThrowable(group, body, mass, onActivate) {
  body.type = CANNON.Body.KINEMATIC;
  body.mass = 0;
  body.updateMassProperties();
  world.addBody(body);
  const t = { group, body, mass, active: false, onActivate: onActivate || null };
  throwables.push(t);
  group.traverse((child) => {
    if (child.isMesh) meshToThrowable.set(child, t);
  });
  return t;
}

function activateThrowable(t, hitPoint) {
  if (t.active) return;
  t.active = true;
  activeThrowCount++;
  t.body.type = CANNON.Body.DYNAMIC;
  t.body.mass = t.mass;
  t.body.updateMassProperties();

  // Impulse away from click point with upward kick
  const pos = t.body.position;
  const dx = pos.x - hitPoint.x;
  const dy = pos.y - hitPoint.y;
  const dz = pos.z - hitPoint.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
  const force = 40 / dist;
  t.body.applyImpulse(new CANNON.Vec3(
    dx * force + (Math.random() - 0.5) * 8,
    Math.abs(dy) * force + 15 + Math.random() * 10,
    dz * force + (Math.random() - 0.5) * 8,
  ));
  t.body.angularVelocity.set(
    (Math.random() - 0.5) * 8,
    (Math.random() - 0.5) * 8,
    (Math.random() - 0.5) * 8,
  );

  if (t.onActivate) t.onActivate(t);
}

// --- Desk lamp (grouped for physics) ---
const lampGroup = new THREE.Group();
const lampOriginX = 27, lampOriginY = -15, lampOriginZ = 5;
lampGroup.position.set(lampOriginX, lampOriginY, lampOriginZ);
scene.add(lampGroup);

const lampMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 });

const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.5, 1, 8), lampMat);
lampBase.position.set(3, -10.5, 0);
lampGroup.add(lampBase);

const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 18, 6), lampMat);
lampPole.position.set(3, -1, 0);
lampGroup.add(lampPole);

const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 12, 6), lampMat);
lampArm.position.set(-1, 9, 0);
lampArm.rotation.z = 0.6;
lampGroup.add(lampArm);

const shadeMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, side: THREE.DoubleSide });
const lampShade = new THREE.Mesh(new THREE.ConeGeometry(4, 5, 8, 1, true), shadeMat);
lampShade.position.set(-5, 11, 0);
lampShade.rotation.z = 0.02;
lampGroup.add(lampShade);

const lampLight = new THREE.PointLight(0xffe4c4, 80, 120, 1.5);
lampLight.position.set(-5, 9, 0);
lampGroup.add(lampLight);

const lampLightBase = 80;
let lampFlicker = -1;

const lampBody = new CANNON.Body({
  position: new CANNON.Vec3(lampOriginX, lampOriginY, lampOriginZ),
  linearDamping: 0.3,
  angularDamping: 0.4,
});
lampBody.addShape(new CANNON.Box(new CANNON.Vec3(5, 11, 3)));

registerThrowable(lampGroup, lampBody, 5, () => {
  lampFlicker = 0.5;
});

// Screen dimensions (for overlay + backing)
const screenW = 45, screenH = 34;

// Lowres texture generator
function makePixelTexture(width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

// Beige plastic body texture (subtle noise)
const bodyTex = makePixelTexture(32, 32, (ctx, w, h) => {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const noise = Math.random() * 12 - 6;
      const r = 195 + noise, g = 185 + noise, b = 170 + noise;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Darker back/side texture
const sideTex = makePixelTexture(32, 32, (ctx, w, h) => {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const noise = Math.random() * 10 - 5;
      const r = 160 + noise, g = 152 + noise, b = 140 + noise;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // Vent lines
  ctx.fillStyle = 'rgba(80,75,65,0.6)';
  for (let i = 8; i < 24; i += 3) {
    ctx.fillRect(6, i, 20, 1);
  }
});

// Load CRT monitor model
const crtGroup = new THREE.Group();
crtGroup.position.set(-8.7, 0, -29);
scene.add(crtGroup);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.183.1/examples/jsm/libs/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const crtReady = new Promise((resolve) => {
  gltfLoader.load('Untitled-draco.glb', (gltf) => {
    const object = gltf.scene;
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const targetHeight = 42;
    const scale = targetHeight / size.y;
    object.scale.setScalar(scale);

    object.position.set(
      -center.x * scale,
      -box.min.y * scale + deskY,
      -center.z * scale - 5,
    );

    object.rotation.y = -Math.PI / 2;

    // Apply lowres textures to all meshes in the model
    object.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: bodyTex,
          roughness: 0.75,
          color: 0xd4c8b8,
        });
      }
    });

    crtGroup.add(object);
    resolve();
  });
});

// Group for penguin + screen stuff
const penguinGroup = new THREE.Group();
penguinGroup.position.set(-6.5, -2.0, -26.5);
penguinGroup.rotation.x = -0.14;
scene.add(penguinGroup);

// CRT curvature helper - pushes vertices forward based on distance from center
function applyCRTCurve(geometry, bulge) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const halfW = screenW / 2, halfH = screenH / 2;
    const nx = x / halfW, ny = y / halfH;
    const dist = nx * nx + ny * ny;
    pos.setZ(i, pos.getZ(i) + dist * bulge);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

// Screen backing (dark with slight glow)
const screenGeo = new THREE.PlaneGeometry(screenW, screenH, 32, 32);
applyCRTCurve(screenGeo, -0.5);
const screenMesh = new THREE.Mesh(
  screenGeo,
  new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 }),
);
screenMesh.position.set(0, 0, -0.10);
screenMesh.scale.set(0.78, 0.82, 1);
penguinGroup.add(screenMesh);

// Hidden text revealed after explosion
const hiddenCanvas = document.createElement('canvas');
hiddenCanvas.width = 512;
hiddenCanvas.height = 256;
const hctx = hiddenCanvas.getContext('2d');
hctx.clearRect(0, 0, 512, 256);
hctx.fillStyle = '#000000';
hctx.font = 'bold 32px monospace';
hctx.textAlign = 'center';
hctx.textBaseline = 'middle';
hctx.fillText('break things', 256, 105);
hctx.fillText('to make them better', 256, 155);
const hiddenTex = new THREE.CanvasTexture(hiddenCanvas);
hiddenTex.magFilter = THREE.NearestFilter;
hiddenTex.minFilter = THREE.LinearFilter;
const hiddenTextMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 10),
  new THREE.MeshBasicMaterial({ map: hiddenTex, transparent: true }),
);
hiddenTextMesh.position.set(0, 0, -0.05);
hiddenTextMesh.scale.set(0.78, 0.82, 1);
penguinGroup.add(hiddenTextMesh);

const deskY = -26;

// Room environment
const floorY = deskY;
const roomSize = 600;
const roomMat = new THREE.MeshStandardMaterial({ color: 0x8a7e6e, roughness: 0.95, side: THREE.BackSide });
const room = new THREE.Mesh(new THREE.BoxGeometry(roomSize, roomSize, roomSize), roomMat);
room.position.set(0, floorY + roomSize / 2, -50);
scene.add(room);

// Screen glow light (cool white from the monitor)
const screenLight = new THREE.PointLight(0xddeeff, 40, 80, 1.5);
screenLight.position.set(-4, -2, -20);
scene.add(screenLight);

// CRT screen overlay (scanlines + vignette)
const overlayGeo = new THREE.PlaneGeometry(screenW, screenH, 32, 32);
applyCRTCurve(overlayGeo, -0.5);
const crtOverlay = new THREE.Mesh(
  overlayGeo,
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        // Scanlines
        float scanline = sin(vUv.y * 600.0) * 0.06;

        // Vignette
        vec2 center = vUv - 0.5;
        float vignette = dot(center, center) * 1.8;

        // RGB split (chromatic aberration)
        float aberr = 0.002;
        float rShift = smoothstep(0.3, 0.7, vUv.x + aberr);
        float bShift = smoothstep(0.3, 0.7, vUv.x - aberr);

        // Static noise / grain
        float noise = rand(vUv * 500.0 + uTime) * 0.06;

        // Horizontal flicker band (slow scroll)
        float flicker = smoothstep(0.0, 0.02, abs(fract(vUv.y - uTime * 0.05) - 0.5) - 0.48) * 0.08;

        // Screen curvature darkening at edges
        vec2 curved = vUv * 2.0 - 1.0;
        float barrel = dot(curved * curved, curved * curved) * 0.15;

        float alpha = vignette * 0.3 + max(-scanline, 0.0) * 0.5 + noise + flicker + barrel;

        // Slight color tint (green/blue CRT phosphor)
        vec3 col = vec3(0.0, 0.02 * (1.0 - vUv.y), 0.03 * vUv.y);

        gl_FragColor = vec4(col, alpha);
      }
    `,
  }),
);
crtOverlay.position.set(0, 0, 0.90);
crtOverlay.scale.set(0.78, 0.82, 1);
crtOverlay.renderOrder = 999;
penguinGroup.add(crtOverlay);

// Voxel setup
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const voxels = [];
let activeCount = 0;
const voxelShape = new CANNON.Box(new CANNON.Vec3(0.45, 0.45, 0.45));

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

async function init() {
  const [img] = await Promise.all([loadImage('penguin.png'), crtReady]);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, img.width, img.height);

  const offsetX = -img.width / 2 + 0.5;
  const offsetY = img.height / 2 - 0.5;

  // Shared material cache — reuse by quantized color key
  const materialCache = new Map();
  const snap = (v) => v > 180 ? 255 : Math.round(v / 32) * 32;

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 128) continue;

      const qr = snap(r), qg = snap(g), qb = snap(b);
      const key = (qr << 16) | (qg << 8) | qb;
      let material = materialCache.get(key);
      if (!material) {
        const isWhite = qr === 255 && qg === 255 && qb === 255;
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(qr / 255, qg / 255, qb / 255),
          ...(isWhite && { emissive: new THREE.Color(0.3, 0.3, 0.3) }),
        });
        materialCache.set(key, material);
      }
      const mesh = new THREE.Mesh(boxGeo, material);
      const px = x + offsetX;
      const py = -y + offsetY;
      mesh.position.set(px, py, 0);
      penguinGroup.add(mesh);

      // Defer physics body creation until explosion — kinematic bodies don't need it
      voxels.push({ mesh, body: null, active: false, px, py });
    }
  }

  animate();
}

let firstFrame = true;
const SLEEP_SPEED = 0.5;

function animate() {
  requestAnimationFrame(animate);
  crtOverlay.material.uniforms.uTime.value = performance.now() * 0.001;

  // Only step physics when there are active bodies
  if (activeCount > 0 || activeThrowCount > 0) {
    world.step(1 / 60);
    for (const v of voxels) {
      if (!v.active) continue;
      v.mesh.position.copy(v.body.position);
      v.mesh.quaternion.copy(v.body.quaternion);

      // Sleep bodies that have nearly stopped
      const vel = v.body.velocity;
      const avel = v.body.angularVelocity;
      if (vel.lengthSquared() < SLEEP_SPEED && avel.lengthSquared() < SLEEP_SPEED) {
        v.body.type = CANNON.Body.KINEMATIC;
        v.body.velocity.setZero();
        v.body.angularVelocity.setZero();
        v.active = false;
        activeCount--;
      }
    }

    // Sync throwable groups from physics
    for (const t of throwables) {
      if (!t.active) continue;
      t.group.position.copy(t.body.position);
      t.group.quaternion.copy(t.body.quaternion);

      const vel = t.body.velocity;
      const avel = t.body.angularVelocity;
      if (vel.lengthSquared() < SLEEP_SPEED && avel.lengthSquared() < SLEEP_SPEED) {
        t.body.type = CANNON.Body.KINEMATIC;
        t.body.velocity.setZero();
        t.body.angularVelocity.setZero();
        t.active = false;
        activeThrowCount--;
      }
    }
  }

  // Lamp light flicker decay
  if (lampFlicker > 0) {
    lampFlicker -= 1 / 60;
    lampLight.intensity = lampLightBase * (Math.random() > 0.5 ? 0.6 : 0.1);
    if (lampFlicker <= 0) {
      lampFlicker = -1;
      lampLight.intensity = 0;
    }
  }

  controls.update();
  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    document.body.style.background = '#f0e6d3';
    const blackout = document.getElementById('blackout');
    if (blackout) blackout.classList.add('off');
  }
}

init();

// Autoplay explosion sequence (local space coords, screen-size independent)
const autoplayClicks = [
  {"t":705,"type":"voxel","x":1.14,"y":-0.93,"z":0.5},
  {"t":1385,"type":"throw","idx":0,"x":21.09,"y":-3.56,"z":6.26},
];
const AUTOPLAY_DELAY = 3000;
if (autoplayClicks.length > 0) {
  setTimeout(() => replayClicks(autoplayClicks), AUTOPLAY_DELAY);
}

// Click to explode
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Build mesh list once, filter out activated voxels lazily
let raycasterMeshes = null;
function getRaycasterMeshes() {
  if (!raycasterMeshes) raycasterMeshes = voxels.map((v) => v.mesh);
  return raycasterMeshes;
}

function getThrowableMeshes() {
  const meshes = [];
  for (const t of throwables) {
    if (t.active) continue;
    t.group.traverse((child) => { if (child.isMesh) meshes.push(child); });
  }
  return meshes;
}

function handleExplode(clientX, clientY) {
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // Check throwables first
  const throwHits = raycaster.intersectObjects(getThrowableMeshes());
  if (throwHits.length > 0) {
    const t = meshToThrowable.get(throwHits[0].object);
    if (t && !t.active) {
      activateThrowable(t, throwHits[0].point);
      return;
    }
  }

  // Then check voxels
  const hits = raycaster.intersectObjects(getRaycasterMeshes());
  if (hits.length === 0) return;

  // Convert hit point to penguinGroup local space
  const hitLocal = penguinGroup.worldToLocal(hits[0].point.clone());
  explodeAtLocal(hitLocal);
}

function explodeAtLocal(hitLocal) {
  let activated = false;
  for (const v of voxels) {
    if (v.active) continue;
    const dx = v.mesh.position.x - hitLocal.x;
    const dy = v.mesh.position.y - hitLocal.y;
    const dz = v.mesh.position.z - hitLocal.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > 10) continue;

    // Move mesh from group to scene in world space
    const worldPos = new THREE.Vector3();
    v.mesh.getWorldPosition(worldPos);
    penguinGroup.remove(v.mesh);
    scene.add(v.mesh);
    v.mesh.position.copy(worldPos);

    // Lazily create physics body on first activation
    if (!v.body) {
      const body = new CANNON.Body({
        mass: 1,
        type: CANNON.Body.DYNAMIC,
        position: new CANNON.Vec3(worldPos.x, worldPos.y, worldPos.z),
        linearDamping: 0.3,
        angularDamping: 0.4,
      });
      body.addShape(voxelShape);
      world.addBody(body);
      v.body = body;
    } else {
      v.body.position.copy(worldPos);
      v.body.type = CANNON.Body.DYNAMIC;
      v.body.mass = 1;
      v.body.updateMassProperties();
    }

    v.active = true;
    activeCount++;
    activated = true;

    const force = 20 / (dist + 1);
    const rx = (Math.random() - 0.5) * force * 0.8;
    const ry = (Math.random() - 0.5) * force * 0.8;
    const rz = (Math.random() - 0.5) * force * 0.8;
    v.body.applyImpulse(new CANNON.Vec3(dx * force + rx, dy * force + ry, dz * force + force + rz));
    v.body.angularVelocity.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
    );
  }

  // Rebuild raycaster mesh list after activating voxels (they left penguinGroup)
  if (activated) raycasterMeshes = null;
}

function replayClicks(clicks) {
  replaying = true;
  for (const click of clicks) {
    setTimeout(() => {
      if (click.type === 'throw') {
        const t = throwables[click.idx];
        if (t && !t.active) activateThrowable(t, new THREE.Vector3(click.x, click.y, click.z));
      } else {
        explodeAtLocal(new THREE.Vector3(click.x, click.y, click.z));
      }
    }, click.t);
  }
  const lastT = clicks[clicks.length - 1].t;
  setTimeout(() => { replaying = false; }, lastT + 100);
}

// Click recording & replay (debug mode)
let recording = false;
let recordedClicks = [];
let recordStartTime = 0;
let replaying = false;

window.addEventListener('click', (e) => {
  if (recording) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Check throwables first
    const throwHits = raycaster.intersectObjects(getThrowableMeshes());
    if (throwHits.length > 0) {
      const t = meshToThrowable.get(throwHits[0].object);
      if (t && !t.active) {
        const idx = throwables.indexOf(t);
        const p = throwHits[0].point;
        recordedClicks.push({
          t: performance.now() - recordStartTime,
          type: 'throw', idx,
          x: parseFloat(p.x.toFixed(2)),
          y: parseFloat(p.y.toFixed(2)),
          z: parseFloat(p.z.toFixed(2)),
        });
        if (debugEl) updateDebug();
      }
    } else {
      // Check voxels
      const hits = raycaster.intersectObjects(getRaycasterMeshes());
      if (hits.length > 0) {
        const hitLocal = penguinGroup.worldToLocal(hits[0].point.clone());
        recordedClicks.push({
          t: performance.now() - recordStartTime,
          type: 'voxel',
          x: parseFloat(hitLocal.x.toFixed(2)),
          y: parseFloat(hitLocal.y.toFixed(2)),
          z: parseFloat(hitLocal.z.toFixed(2)),
        });
        if (debugEl) updateDebug();
      }
    }
  }
  if (!replaying) handleExplode(e.clientX, e.clientY);
});

// Touch support — explode on tap (ignore drags/orbit)
let touchStart = null;
window.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
});
window.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  // Only count as tap if finger didn't move much (not an orbit drag)
  if (Math.sqrt(dx * dx + dy * dy) < 15) {
    handleExplode(t.clientX, t.clientY);
  }
  touchStart = null;
});

// Debug mode (Ctrl+Shift+D to toggle)
let debugMode = false;
let debugEl = null;

function toggleDebug() {
  debugMode = !debugMode;
  if (debugMode) {
    debugEl = document.createElement('div');
    debugEl.style.cssText = 'position:fixed;top:10px;left:10px;color:#0f0;font:12px monospace;background:rgba(0,0,0,0.7);padding:8px;z-index:9999;pointer-events:none;white-space:pre';
    document.body.appendChild(debugEl);
    updateDebug();
  } else if (debugEl) {
    debugEl.remove();
    debugEl = null;
  }
}

function updateDebug() {
  if (!debugEl) return;
  const p = penguinGroup.position;
  const s = screenMesh.position;
  const o = crtOverlay.position;
  const ss = screenMesh.scale;
  const os = crtOverlay.scale;
  debugEl.textContent =
    `[Ctrl+Shift+D] toggle debug\n` +
    `penguin: x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} z=${p.z.toFixed(1)}\n` +
    `screen:  z=${s.z.toFixed(2)}  scale=(${ss.x.toFixed(2)}, ${ss.y.toFixed(2)})\n` +
    `overlay: z=${o.z.toFixed(2)}  scale=(${os.x.toFixed(2)}, ${os.y.toFixed(2)})\n` +
    `A/D=x  W/S=y  Q/E=z  R/F=screen-z  T/G=overlay-z\n` +
    `I/K=scaleY  J/L=scaleX (screen+overlay)\n` +
    `P=record clicks (${recording ? 'RECORDING' : 'off'})  ${recordedClicks.length} clicks\n` +
    `O=replay  C=copy to console  X=clear`;
}

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    toggleDebug();
    return;
  }
  if (!debugMode) return;
  const step = 0.5;
  const zStep = 0.1;
  switch (e.key.toLowerCase()) {
    case 'a': penguinGroup.position.x -= step; break;
    case 'd': penguinGroup.position.x += step; break;
    case 'w': penguinGroup.position.y += step; break;
    case 's': penguinGroup.position.y -= step; break;
    case 'q': penguinGroup.position.z -= step; break;
    case 'e': penguinGroup.position.z += step; break;
    case 'r': screenMesh.position.z += zStep; break;
    case 'f': screenMesh.position.z -= zStep; break;
    case 't': crtOverlay.position.z += zStep; break;
    case 'g': crtOverlay.position.z -= zStep; break;
    case 'i': screenMesh.scale.y += 0.02; crtOverlay.scale.y += 0.02; break;
    case 'k': screenMesh.scale.y -= 0.02; crtOverlay.scale.y -= 0.02; break;
    case 'l': screenMesh.scale.x += 0.02; crtOverlay.scale.x += 0.02; break;
    case 'j': screenMesh.scale.x -= 0.02; crtOverlay.scale.x -= 0.02; break;
    case 'p':
      recording = !recording;
      if (recording) {
        recordedClicks = [];
        recordStartTime = performance.now();
      }
      break;
    case 'o':
      if (recordedClicks.length > 0 && !replaying) {
        replaying = true;
        replayClicks(recordedClicks);
      }
      break;
    case 'c':
      console.log(JSON.stringify(recordedClicks));
      break;
    case 'x':
      recordedClicks = [];
      break;
    default: return;
  }
  updateDebug();
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
