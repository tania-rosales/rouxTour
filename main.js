import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// =================================================
// ===== CONFIGURACIÓN BÁSICA =====
// =================================================
const scene = new THREE.Scene();
const collidableObjects = [];
const pointsOfInterest = []; // Lista para los puntos de interés de los botones

scene.background = new THREE.Color(0x101010);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.7, 5);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// =================================================
// ===== DATOS DE LAS JOYAS (Sin cambios) =====
// =================================================
const jewelryData = {
    anillo1: { title: 'Anillo de Compromiso "Eternidad"', description: 'Un clásico solitario de oro con un diamante de corte brillante, perfecto para sellar una promesa de amor eterno.', image: 'anillo1_foto.jpg' },
    anillo2: { title: 'Anillo de Oro "Trenzado"', description: 'Elegante y moderno, este anillo de oro presenta un diseño trenzado que simboliza la unión de dos vidas.', image: 'anillo2_foto.jpg' },
    anillo3: { title: 'Sortija "Princesa"', description: 'Deslumbrante sortija con un diamante central de corte princesa, rodeado de incrustaciones que realzan su brillo.', image: 'anillo3_foto.jpg' },
    arete1: { title: 'Aretes "Perla del Mar"', description: 'Finos aretes de plata con perlas naturales cultivadas, un toque de elegancia y sofisticación para cualquier ocasión.', image: 'arete1_foto.jpg' },
    arete2: { title: 'Pendientes "Gota de Luz"', description: 'Delicados pendientes en forma de gota, con un pavé de diamantes que captura y refleja la luz maravillosamente.', image: 'arete2_foto.jpg' },
    arete5: { title: 'Aretes "Botón de Oro"', description: 'Sencillos y elegantes, estos aretes de botón en oro son el accesorio perfecto para el día a día.', image: 'arete5_foto.jpg' },
    collar1: { title: 'Collar "Corazón Real"', description: 'Un majestuoso collar con un dije en forma de corazón, adornado con un rubí central y una orla de diamantes.', image: 'collar1_foto.jpg' },
    collar2: { title: 'Gargantilla "Río de Plata"', description: 'Moderna y minimalista, esta gargantilla de plata sólida se ajusta elegantemente al cuello, destacando por su brillo y simplicidad.', image: 'collar2_foto.jpg' },
    collar3: { title: 'Collar de Perlas "Clásico"', description: 'Un indispensable en cualquier joyero. Collar de perlas perfectamente esféricas con un broche de seguridad en oro.', image: 'collar3_foto.jpg' },
};

// =================================================
// ===== CONTROLES Y MOVIMIENTO =====
// =================================================
const controls = new PointerLockControls(camera, renderer.domElement);
const infoPanel = document.getElementById('info');
const buttonsContainer = document.getElementById('info-buttons-container');

infoPanel.addEventListener('click', () => { controls.lock(); });
controls.addEventListener('lock', () => {
    infoPanel.style.display = 'none';
    buttonsContainer.style.display = 'none';
});
controls.addEventListener('unlock', () => {
    infoPanel.style.display = 'block';
    buttonsContainer.style.display = 'block';
});
scene.add(controls.getObject());

const keys = {};
// --- MODIFICADO: Añadida la funcionalidad de la tecla "F" ---
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    keys[key] = true;

    if (key === 'f' && !controls.isLocked) {
        controls.lock();
    }
});
document.addEventListener('keyup', (event) => { keys[event.key.toLowerCase()] = false; });

const moveSpeed = 5.0;
const clock = new THREE.Clock();
function updateMovement(delta) {
    if (!controls.isLocked) return; const speed = moveSpeed * delta; const direction = new THREE.Vector3(); const raycaster = new THREE.Raycaster(); const collisionDistance = 0.5; let canMoveForward = true; let canMoveBackward = true; let canMoveLeft = true; let canMoveRight = true; direction.set(0, 0, -1).applyQuaternion(camera.quaternion); raycaster.set(camera.position, direction); let intersections = raycaster.intersectObjects(collidableObjects, true); if (intersections.length > 0 && intersections[0].distance < collisionDistance) { canMoveForward = false; } direction.set(0, 0, 1).applyQuaternion(camera.quaternion); raycaster.set(camera.position, direction); intersections = raycaster.intersectObjects(collidableObjects, true); if (intersections.length > 0 && intersections[0].distance < collisionDistance) { canMoveBackward = false; } direction.set(-1, 0, 0).applyQuaternion(camera.quaternion); raycaster.set(camera.position, direction); intersections = raycaster.intersectObjects(collidableObjects, true); if (intersections.length > 0 && intersections[0].distance < collisionDistance) { canMoveLeft = false; } direction.set(1, 0, 0).applyQuaternion(camera.quaternion); raycaster.set(camera.position, direction); intersections = raycaster.intersectObjects(collidableObjects, true); if (intersections.length > 0 && intersections[0].distance < collisionDistance) { canMoveRight = false; } if (keys['w'] && canMoveForward) controls.moveForward(speed); if (keys['s'] && canMoveBackward) controls.moveForward(-speed); if (keys['a'] && canMoveLeft) controls.moveRight(-speed); if (keys['d'] && canMoveRight) controls.moveRight(speed);
}
// =================================================
// ===== CONSTRUYENDO EL MUNDO 3D (Sin cambios) =====
// =================================================
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('floor_texture.jpg');
floorTexture.wrapS = THREE.RepeatWrapping; floorTexture.wrapT = THREE.RepeatWrapping; floorTexture.repeat.set(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.5 });
const floorGeometry = new THREE.PlaneGeometry(30, 30);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
floor.position.y = 0.01;
scene.add(floor);
const wallTexture = textureLoader.load('wall_texture.jpg');
const roomMaterial = new THREE.MeshStandardMaterial({ map: wallTexture, side: THREE.BackSide });
const roomGeometry = new THREE.BoxGeometry(30, 10, 30);
const room = new THREE.Mesh(roomGeometry, roomMaterial);
room.position.y = 4.99;
scene.add(room);
collidableObjects.push(room);
function createDisplayCase(position) {
    const group = new THREE.Group(); const baseWidth = 3; const baseHeight = 1.2; const baseDepth = 2.5; const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2, }); const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth); const base = new THREE.Mesh(baseGeometry, baseMaterial); base.position.y = baseHeight / 2; base.castShadow = true; base.receiveShadow = true; group.add(base); const glassMaterial = new THREE.MeshPhysicalMaterial({ transmission: 1.0, roughness: 0.05, metalness: 0, ior: 1.5 }); const glassGeometry = new THREE.BoxGeometry(baseWidth - 0.1, 1, baseDepth - 0.1); const glass = new THREE.Mesh(glassGeometry, glassMaterial); glass.position.y = baseHeight + 0.5; group.add(glass); group.position.copy(position); scene.add(group); return group;
}
const case1 = createDisplayCase(new THREE.Vector3(0, 0, 0));
const case2 = createDisplayCase(new THREE.Vector3(-6, 0, -2));
const case3 = createDisplayCase(new THREE.Vector3(6, 0, -2));
collidableObjects.push(case1, case2, case3);

// =================================================
// ===== CARGA DE MODELOS 3D (.GLB) =====
// =================================================
const loader = new GLTFLoader();
const buttonHeight = 1.4; // <-- ALTURA FIJA PARA TODOS LOS BOTONES

// --- MODIFICADO: La lógica del botón ahora está separada ---
function loadModel(filePath, dataKey, modelPosition, scale) {
    loader.load(filePath, (gltf) => {
        const model = gltf.scene;
        model.position.copy(modelPosition);
        model.scale.set(scale, scale, scale);
        model.traverse((child) => {
            if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
        });
        scene.add(model);

        // La posición del botón se basa en la X y Z del modelo, pero con una altura Y FIJA.
        const buttonAnchorPosition = new THREE.Vector3(modelPosition.x, buttonHeight, modelPosition.z);
        pointsOfInterest.push({ position: buttonAnchorPosition, data: jewelryData[dataKey], dataKey: dataKey });
    });
}

// Carga de modelos (Tus tamaños y posiciones no han sido tocados)
loadModel('anillo1.glb', 'anillo1', new THREE.Vector3(5.1, 1.45, -2), 0.30);
loadModel('anillo2.glb', 'anillo2', new THREE.Vector3(6.9, 1.50, -2), 0.08);
loadModel('anillo3.glb', 'anillo3', new THREE.Vector3(6, 1.50, -1.5), 0.1);
loadModel('arete1.glb', 'arete1', new THREE.Vector3(-6.9, 1.35, -2), 0.008);
loadModel('arete2.glb', 'arete2', new THREE.Vector3(-5.1, 1.25, -2), 2);
loadModel('arete5.glb', 'arete5', new THREE.Vector3(-6, 1.25, -1.5), 0.009);
loadModel('collar1.glb', 'collar1', new THREE.Vector3(0, -2, 0), 2);
loadModel('collar2.glb', 'collar2', new THREE.Vector3(0.8, 1.25, 0), 0.05);
loadModel('collar3.glb', 'collar3', new THREE.Vector3(-0.8, 1.75, 0), 0.009);

// =================================================
// ===== LÓGICA DE INTERACCIÓN CON BOTONES 2D =====
// =================================================
function openJewelModal(data) {
    document.getElementById('modal-title').innerText = data.title;
    document.getElementById('modal-description').innerText = data.description;
    document.getElementById('modal-img').src = data.image;
    document.getElementById('jewel-modal').style.display = 'flex';
}

for (const key in jewelryData) {
    const data = jewelryData[key];
    const button = document.createElement('div');
    button.className = 'info-button';
    button.innerHTML = '+';
    button.id = key + '-button';
    buttonsContainer.appendChild(button);
    button.addEventListener('click', () => { openJewelModal(data); });
}

function updateInfoButtons() {
    if (controls.isLocked) return;
    for (const point of pointsOfInterest) {
        const screenPosition = point.position.clone().project(camera);
        const buttonElement = document.getElementById(point.dataKey + '-button');
        if (screenPosition.z > 1) {
            buttonElement.style.display = 'none';
            continue;
        }
        const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;
        buttonElement.style.display = 'flex';
        buttonElement.style.left = `${x - 12}px`; // Centrar el botón (12 es la mitad de su nuevo ancho de 24px)
        buttonElement.style.top = `${y - 12}px`;
    }
}

const modal = document.getElementById('jewel-modal');
const closeButton = document.querySelector('.modal-close-button');
closeButton.addEventListener('click', () => { modal.style.display = 'none'; });
modal.addEventListener('click', (event) => {
    if (event.target === modal) { modal.style.display = 'none'; }
});
// =================================================
// ===== ILUMINACIÓN Y BUCLE DE ANIMACIÓN (Sin cambios) =====
// =================================================
const hemisphereLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 2);
scene.add(hemisphereLight);
const mainLight = new THREE.SpotLight(0xffffff, 250, 30, Math.PI * 0.5, 0.6);
mainLight.position.set(0, 12, 5);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048; mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.bias = -0.001;
mainLight.target.position.set(0, 0, 0);
scene.add(mainLight);
scene.add(mainLight.target);

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateMovement(delta);
    updateInfoButtons();
    renderer.render(scene, camera);
}
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();