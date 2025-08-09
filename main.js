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
// ===== FUNCIÓN PARA CREAR PLACEHOLDER DE IMAGEN =====
// =================================================
function createPlaceholderImage(width = 400, height = 300, text = 'Imagen no disponible') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fondo
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // Borde
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
    
    // Texto
    ctx.fillStyle = '#999';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    return canvas.toDataURL();
}

// =================================================
// ===== DATOS DE LAS JOYAS (Sin cambios) =====
// =================================================
const jewelryData = {
    anillo1: { 
        title: 'Anillo de Compromiso "Amor Puro"', 
        description: 'Anillo de compromiso de 0.97 quilates de oro con un diamante incrustado al centro', 
        image: './webp/anillo1.webp'
    },
    anillo2: { 
        title: 'Anillo de Oro "Infinity Gold"', 
        description: 'Anillo de oro con detalles minimalistas y relieves en la parte inferior y superior', 
        image: './webp/anillo2.webp'
    },
    anillo3: { 
        title: 'Anillo de oro "Fénix"', 
        description: 'Anillo de oro presenta un diseño de alas que se extiende de ambos lados y al centro del anillo un diamante incrustado, generando un estilo elegante y simbólico.  Representa libertad y protección.', 
        image: './webp/anillo3.webp'
    },
    arete1: { 
        title: 'Aretes "Aura"', 
        description: 'Par de argollas de oro con detalles en forma de diamante, adaptables a todo tipo de oreja.', 
        image: './webp/arete1.webp'
    },
    arete2: { 
        title: 'Pendientes "Cupido"', 
        description: 'Aretes de oro, con esclavas, perfectos para regalos de boda o de graduación.', 
        image: './webp/arete2.webp'
    },
    arete5: { 
        title: 'Aretes "Corazón dorado"', 
        description: 'Argollas de oro, con detalles de perlas doradas alrededor.', 
        image: './webp/arete5.webp'
    },
    collar1: { 
        title: 'Collar "Vértice de Luz"', 
        description: 'Precioso collar de oro amarillo con un rombo plateado.', 
        image: './webp/collar1.webp'
    },
    collar2: { 
        title: 'Gargantilla "Río de Plata"', 
        description: 'Moderna y minimalista, esta gargantilla de plata sólida se ajusta elegantemente al cuello, destacando por su brillo y simplicidad.', 
        image: './webp/collar2.webp'
    },
    collar3: { 
        title: 'Collar de oro "Persia Infinita"', 
        description: 'Lleva la riqueza persa en ti, gargantilla estilo persa, con acabados minimalistas.', 
        image: './webp/collar3.webp'
    },
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
// ===== LÓGICA DE INTERACCIÓN CON BOTONES 2D (ACTUALIZADA) =====
// =================================================
function openJewelModal(data) {
    const modal = document.getElementById('jewel-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Configurar contenido
    document.getElementById('modal-title').innerText = data.title;
    document.getElementById('modal-description').innerText = data.description;
    document.getElementById('modal-img').src = data.image;
    
    // Remover clases de cierre si existen
    modal.classList.remove('closing');
    modalContent.classList.remove('closing');
    
    // Mostrar modal
    modal.style.display = 'flex';
}

function closeJewelModal() {
    const modal = document.getElementById('jewel-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Añadir clases de animación de cierre
    modal.classList.add('closing');
    modalContent.classList.add('closing');
    
    // Después de la animación, ocultar la modal
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        modalContent.classList.remove('closing');
    }, 300); // 300ms coincide con la duración de la animación CSS
}

// Crear botones (sin cambios)
for (const key in jewelryData) {
    const data = jewelryData[key];
    const button = document.createElement('div');
    button.className = 'info-button';
    button.innerHTML = '+';
    button.id = key + '-button';
    buttonsContainer.appendChild(button);
    button.addEventListener('click', () => { openJewelModal(data); });
}

// Event listeners actualizados para usar la nueva función de cierre
const modal = document.getElementById('jewel-modal');
const closeButton = document.querySelector('.modal-close-button');

closeButton.addEventListener('click', closeJewelModal);

modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeJewelModal();
    }
});

// También cerrar con la tecla ESC (opcional)
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const modal = document.getElementById('jewel-modal');
        if (modal.style.display === 'flex') {
            closeJewelModal();
        }
    }
});

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
    adjustVolumeByDistance();
}
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// =================================================
// ===== CONFIGURACIÓN DE AUDIO AMBIENTE =====
// =================================================
let ambientAudio = null;

function initAmbientAudio() {
    ambientAudio = new Audio('./audio/ambient.mp3'); // Cambia por tu archivo de audio
    ambientAudio.loop = true; // Reproducir en bucle
    ambientAudio.volume = 0.3; // Volumen suave (30%)
    
    // Configurar para que no ralentice la carga
    ambientAudio.preload = 'metadata'; // Solo carga metadatos inicialmente
    
    // Intentar reproducir cuando el usuario interactúe por primera vez
    const startAudio = () => {
        if (ambientAudio && ambientAudio.paused) {
            ambientAudio.play().catch(e => {
                console.log('Audio bloqueado por el navegador, se reproducirá al interactuar');
            });
        }
    };

    // Eventos para iniciar audio (compatibilidad con políticas del navegador)
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('keydown', startAudio, { once: true });
    
    // También intentar cuando se active el pointer lock
    controls.addEventListener('lock', startAudio);
}

// Función para controlar el audio
function toggleAudio() {
    if (ambientAudio) {
        if (ambientAudio.paused) {
            ambientAudio.play();
        } else {
            ambientAudio.pause();
        }
    }
}

// =================================================
// ===== CREACIÓN DE LOGOS EN LAS PAREDES =====
// =================================================
function createWallLogos() {
    const logoTexture = textureLoader.load('./logo.jpg'); // Cambia por la ruta de tu logo
    
    // Configurar textura del logo
    logoTexture.minFilter = THREE.LinearFilter;
    logoTexture.magFilter = THREE.LinearFilter;
    
    const logoMaterial = new THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true,
        alphaTest: 0.5, // Elimina píxeles transparentes
    });

    const logoGeometry = new THREE.PlaneGeometry(3, 3); // Tamaño del logo (3x3 metros)

    // Posiciones y rotaciones para cada pared
    const wallPositions = [
        // Pared Norte (atrás)
        { position: new THREE.Vector3(0, 3, -14.9), rotation: [0, 0, 0] },
        
        // Pared Sur (frente) 
        { position: new THREE.Vector3(0, 3, 14.9), rotation: [0, Math.PI, 0] },
        
        // Pared Este (derecha)
        { position: new THREE.Vector3(14.9, 3, 0), rotation: [0, -Math.PI/2, 0] },
        
        // Pared Oeste (izquierda)
        { position: new THREE.Vector3(-14.9, 3, 0), rotation: [0, Math.PI/2, 0] }
    ];

    wallPositions.forEach((wall, index) => {
        const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
        logoMesh.position.copy(wall.position);
        logoMesh.rotation.set(...wall.rotation);
        logoMesh.name = `wallLogo${index}`;
        scene.add(logoMesh);
    });
}

// =================================================
// ===== INICIALIZACIÓN (AGREGAR AL FINAL DEL CÓDIGO EXISTENTE) =====
// =================================================

// Llamar estas funciones después de crear la escena
initAmbientAudio();
createWallLogos();

// Opcional: Agregar control de audio con tecla M
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    
    // ... tu código existente de teclas ...
    
    // Agregar control de audio
    if (key === 'm') {
        toggleAudio();
        console.log('Audio', ambientAudio?.paused ? 'pausado' : 'reproduciéndose');
    }
});

// =================================================
// ===== CONTROL DE VOLUMEN DINÁMICO (OPCIONAL) =====
// =================================================
function adjustVolumeByDistance() {
    if (!ambientAudio || !controls.isLocked) return;
    
    // Calcular distancia desde el centro
    const centerDistance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    const maxDistance = 15; // Distancia máxima de la habitación
    
    // Ajustar volumen según distancia (más cerca del centro = más volumen)
    const normalizedDistance = Math.min(centerDistance / maxDistance, 1);
    const targetVolume = 0.3 * (1 - normalizedDistance * 0.5); // De 30% a 15%
    
    ambientAudio.volume = Math.max(0.1, targetVolume); // Mínimo 10%
}

animate();