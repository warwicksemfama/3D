import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.164.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js';

// Cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Câmera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

// Controles da câmera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;
controls.target.set(0, 1, 0);

// Luz ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// Luz direcional principal
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 8, 5);
scene.add(directionalLight);

// Luz de preenchimento
const fillLight = new THREE.PointLight(0xffffff, 1.2);
fillLight.position.set(-4, 3, 4);
scene.add(fillLight);

// Chão simples
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x222222,
  roughness: 0.8
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
scene.add(floor);

// Carregamento do modelo GLB
const loader = new GLTFLoader();

loader.load(
  './pot_boy_elden_ring.glb',
  (gltf) => {
    const model = gltf.scene;

    // Centraliza e ajusta o modelo automaticamente
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;

    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = 2.5 / maxDimension;
    model.scale.setScalar(scale);

    scene.add(model);

    // Recalcula o centro após escala
    const newBox = new THREE.Box3().setFromObject(model);
    const newCenter = newBox.getCenter(new THREE.Vector3());

    controls.target.copy(newCenter);
    controls.update();

    camera.position.set(0, 1.5, 4);
  },
  (progress) => {
    const percent = (progress.loaded / progress.total) * 100;
    console.log(`Carregando modelo: ${percent.toFixed(2)}%`);
  },
  (error) => {
    console.error('Erro ao carregar o modelo GLB:', error);
  }
);

// Resize responsivo
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Loop de animação
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

animate();
