import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
    import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
    import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
    const isMobile = window.innerWidth < 768;

    // activa el modal, amplia el la imagen cliqueada y muestra el texto
    const imageData = (() => {
        const nodes = Array.from(document.querySelectorAll('#image-data img'));
        if (nodes && nodes.length) {
            return nodes.map(img => ({ url: img.getAttribute('src'), message: img.dataset.message || '' }));
        }
    })();
    // Configuración principal del galaxy
    const CONFIG = {
        galaxy: { rotationSpeed: 0.06, centerExclusionRadius: 45 }, 
        elementExclusionRadius: 55,// radio mínimo para textos e imágenes
        blackHole: { 
            radius: 18, segments: isMobile ? 90 : 128, 
            color1: '#000000', color2: '#1a0033',
            pulseSpeed: 0.4, pulseIntensity: 0.2
        },
        accretionRing: {
            innerRadius: 25, outerRadius: 42, segments: isMobile ? 128 : 256,
            centerColor: '#00FFFF', midColor: '#0099FF', edgeColor: '#6600FF',
            emissiveIntensity: isMobile ? 2 : 2.5, rotationSpeed: 0.4
        },
        // Configuración de partículas (estrellas, textos, imágenes)
        particles: {
            coreStars: { 
                count: isMobile ? 15000 : 30000, radius: 150, maxHeight: 55, 
                size: 0.35, layers: isMobile ? 2 : 4
            },
            backgroundStars: { 
                count: isMobile ? 6000 : 10000, radius: 700, size: 0.3,
                twinkleSpeed: 0.002
            },
            texts: {
                count: isMobile ? 30 : 30, width: 100, height: 85,//el primero es para móvil y el segundo para desktop
                minRadius: null, maxRadius: 150,
                content: ["Fatásnica","Preciosa", "Linda", "Perfecta", "Guapa", "Hermosa", "Bella", "Divina", "Bonita", "Encantadora", "Maravillosa", "Adorable", "Dulce", "Cariñosa", "Amable", "Tierna", "Deslumbrante", "Inolvidable", "Única", "Especial", "Irresistible", "Magnífica", "Cautivadora" ],
                colors: [{"fill":"#00d4ff","shadow":"#00d4ff"},{"fill":"#7b2ff7","shadow":"#7b2ff7"},{"fill":"#f107a3","shadow":"#f107a3"},{"fill":"#1E90FF","shadow":"#1E90FF"},{"fill":"#87CEEB","shadow":"#87CEEB"},{"fill":"#FF6B9D","shadow":"#FF6B9D"},],
                floatAmplitude: 0.7, floatSpeed: 0.6
            },

            images: {
                count: isMobile ? 35: 35, size: 20, // el primero es para móvil y el segundo para desktop
                minRadius: null, maxRadius: 150,
                urls: imageData.map(img => img.url),
                messages: imageData.map(img => img.message),
                rotationSpeed: 0.15
            }
        },
        // Iluminación y controles de cámara
        lighting: {
            ambientLight: { color: '#ffffff', intensity: 0.3 },
            pointLight: { color: '#66B2FF', intensity: 4, distance: 450 },
            rimLight: { color: '#00FFFF', intensity: 2, distance: 350 }
        },
        bloomEffect: { threshold: 0.8, strength: isMobile ? 0.8 : 1.3, radius: 0.7 },
        cameraControls: { minDistance: 40, maxDistance: 350, autoRotate: true, autoRotateSpeed: 0.4 }
    };

    let scene, camera, renderer, controls, galaxyGroup, clock, sphereMaterial, composer;
    let loveTexts = [], loveImages = [], starParticles = [];
    let occupiedPositions = [];
    let accretionRing, bgStars;
    let raycaster, mouse;

    function init() {
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.0007);
        clock = new THREE.Clock();
        
        
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
        
        renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('galaxy-canvas'), 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.minDistance = CONFIG.cameraControls.minDistance;
        controls.maxDistance = CONFIG.cameraControls.maxDistance;
        controls.autoRotate = CONFIG.cameraControls.autoRotate;
        controls.autoRotateSpeed = CONFIG.cameraControls.autoRotateSpeed;
        controls.enablePan = false;
        if (isMobile) {
            controls.enableZoom = true;
            controls.zoomSpeed = 0.5;
        }

        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight), 
            CONFIG.bloomEffect.strength,
            CONFIG.bloomEffect.radius,
            CONFIG.bloomEffect.threshold
        );
        composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        // Raycaster para clicks
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        setupLighting();
        
        galaxyGroup = new THREE.Group();
        scene.add(galaxyGroup);

        createBlackHole();
        createCoreStars();
        createBackgroundStars();
        
        loadAssetsAndCreateElements();

        // Event listener para clicks en imágenes (funciona con touch en móviles)
        renderer.domElement.addEventListener('click', onClick, false);
        renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });

        window.addEventListener('resize', onWindowResize);
        onWindowResize();
        animate();
    }

    // Manejo de touch para móviles
    function onTouchStart(event) {
        if (!event.touches || event.touches.length === 0) return;
        
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(loveImages, true);
        
        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            if (clickedMesh.userData.url && clickedMesh.userData.message) {
                // Evitar que el touch genere el click sintético y que el evento
                // se propague al backdrop del modal (que podría cerrarlo).
                if (typeof event.preventDefault === 'function') event.preventDefault();
                if (typeof event.stopPropagation === 'function') event.stopPropagation();
                showModal(clickedMesh.userData.url, clickedMesh.userData.message);
            }
        }
    }

    // Función para manejar clicks
    function onClick(event) {
        // Si es táctil (evento de touch convertido a click), ignora para evitar doble trigger
        if (event.pointerType === 'touch') return;
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(loveImages, true);

        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            if (clickedMesh.userData.url && clickedMesh.userData.message) {
                showModal(clickedMesh.userData.url, clickedMesh.userData.message);
            }
        }
    }

    // Mostrar modal
    function showModal(imageUrl, message) {
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const modalMessage = document.getElementById('modal-message');

        if (!modal) {
            console.error("Modal no encontrado");
            return;
        }

        // Mostrar imagen y texto en el modal
        if (modalImage) {
            modalImage.src = imageUrl || '';
            modalImage.style.display = 'block';
        }
        if (modalMessage) {
            modalMessage.textContent = message || '';
            modalMessage.style.display = 'block';
        }

        modal.style.display = 'flex';
        modal.style.opacity = '0';
        setTimeout(() => { 
            if (modal) modal.style.opacity = '1'; 
        }, 10);
    }

    // Cerrar modal
    document.getElementById('close-modal').addEventListener('click', () => {
        const modal = document.getElementById('image-modal');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });

    // Cerrar al click fuera
    document.getElementById('image-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            const modal = e.currentTarget;
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });
    // Fin modal
    function setupLighting() {
        const { ambientLight, pointLight, rimLight } = CONFIG.lighting;
        
        scene.add(new THREE.AmbientLight(ambientLight.color, ambientLight.intensity));
        
        const mainLight = new THREE.PointLight(pointLight.color, pointLight.intensity, pointLight.distance);
        mainLight.position.set(0, 0, 0);
        scene.add(mainLight);

        const rim1 = new THREE.PointLight(rimLight.color, rimLight.intensity, rimLight.distance);
        rim1.position.set(120, 60, 120);
        scene.add(rim1);

        const rim2 = new THREE.PointLight(rimLight.color, rimLight.intensity * 0.8, rimLight.distance);
        rim2.position.set(-120, -60, -120);
        scene.add(rim2);

        const accentLight = new THREE.PointLight('#FF1493', rimLight.intensity * 0.5, rimLight.distance * 0.7);
        accentLight.position.set(0, 100, 0);
        scene.add(accentLight);
    }
    // todo lo relacionado con la parte cetral de la galaxia
    function createBlackHole() {
        const bhConfig = CONFIG.blackHole;
        const ringConfig = CONFIG.accretionRing;
        
        sphereMaterial = new THREE.ShaderMaterial({
            uniforms: { 
                uTime: { value: 0.0 }, 
                uColor1: { value: new THREE.Color(bhConfig.color1) }, 
                uColor2: { value: new THREE.Color(bhConfig.color2) },
                uPulseSpeed: { value: bhConfig.pulseSpeed },
                uPulseIntensity: { value: bhConfig.pulseIntensity }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform float uPulseSpeed;
                uniform float uPulseIntensity;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                float noise(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                }
                
                float heart(vec2 p) {
                    p.x *= 0.7;
                    p.y -= 0.15;
                    float a = atan(p.x, p.y) / 3.14159;
                    float r = length(p);
                    float h = abs(a);
                    float d = (13.0 * h - 22.0 * h * h + 10.0 * h * h * h) / (6.0 - 5.0 * h);
                    return smoothstep(0.06, 0.0, r - d * 0.35);
                }
                
                void main() {
                    vec2 sphereUV = vUv * 5.0 + vec2(uTime * 0.15, uTime * 0.1);
                    vec2 heartPos = fract(sphereUV) - 0.5;
                    float heartShape = heart(heartPos);
                    
                    float n = noise(vUv * 8.0 + uTime * 0.2);
                    float pulse = sin(uTime * uPulseSpeed) * uPulseIntensity + 1.0;
                    
                    vec3 heartColor = vec3(1.0, 1.0, 1.0);
                    vec3 baseColor = mix(uColor1, uColor2, n * pulse);
                    vec3 mixedColor = mix(baseColor, heartColor, heartShape * 0.5);
                    
                    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
                    vec3 rimColor = vec3(0.0, 0.4, 0.7) * fresnel * 0.7;
                    
                    vec3 heartGlow = heartColor * heartShape * 0.2;
                    
                    gl_FragColor = vec4(mixedColor + rimColor + heartGlow, 1.0);
                }
            `
        });
        
        const blackHole = new THREE.Mesh(
            new THREE.SphereGeometry(bhConfig.radius, bhConfig.segments, bhConfig.segments), 
            sphereMaterial
        );
        scene.add(blackHole);
        
        const ringGeometry = new THREE.RingGeometry(
            ringConfig.innerRadius, 
            ringConfig.outerRadius, 
            ringConfig.segments
        );
        
        const ringMaterial = new THREE.ShaderMaterial({
            uniforms: { 
                uTime: { value: 0.0 },
                innerRadius: { value: ringConfig.innerRadius }, 
                outerRadius: { value: ringConfig.outerRadius }, 
                centerColor: { value: new THREE.Color(ringConfig.centerColor) }, 
                midColor: { value: new THREE.Color(ringConfig.midColor) }, 
                edgeColor: { value: new THREE.Color(ringConfig.edgeColor) }, 
                emissiveIntensity: { value: ringConfig.emissiveIntensity }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec2 vUv;
                void main() {
                    vPosition = position;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform float innerRadius;
                uniform float outerRadius;
                uniform vec3 centerColor;
                uniform vec3 midColor;
                uniform vec3 edgeColor;
                uniform float emissiveIntensity;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    float distance = length(vPosition.xy);
                    float normalizedDistance = clamp((distance - innerRadius) / (outerRadius - innerRadius), 0.0, 1.0);
                    
                    vec3 finalColor;
                    if (normalizedDistance < 0.5) {
                        finalColor = mix(centerColor, midColor, normalizedDistance * 2.0);
                    } else {
                        finalColor = mix(midColor, edgeColor, (normalizedDistance - 0.5) * 2.0);
                    }
                    
                    float wave = sin(normalizedDistance * 25.0 - uTime * 2.5) * 0.15 + 1.0;
                    float spiral = sin(atan(vPosition.y, vPosition.x) * 8.0 + normalizedDistance * 15.0 - uTime * 3.0) * 0.1 + 1.0;
                    float glowFactor = (1.0 - smoothstep(0.0, 1.0, normalizedDistance)) * wave * spiral;
                    vec3 emissiveColor = finalColor * emissiveIntensity * glowFactor;
                    
                    gl_FragColor = vec4(finalColor + emissiveColor, 1.0);
                }
            `,
            side: THREE.DoubleSide,
            transparent: true
        });
        
        accretionRing = new THREE.Mesh(ringGeometry, ringMaterial);
        accretionRing.rotation.x = Math.PI / 2;
        scene.add(accretionRing);
    }
    // 
    function createCoreStars() {
        const coreConfig = CONFIG.particles.coreStars;
        
        for (let layer = 0; layer < coreConfig.layers; layer++) {
            const geometry = new THREE.BufferGeometry();
            const starCount = Math.floor(coreConfig.count / coreConfig.layers);
            const positions = new Float32Array(starCount * 3);
            const colors = new Float32Array(starCount * 3);
            const sizes = new Float32Array(starCount);
            const color = new THREE.Color();
            
            for (let i = 0; i < starCount; i++) {
                const distance = CONFIG.accretionRing.outerRadius + 
                    Math.random() * (coreConfig.radius - CONFIG.accretionRing.outerRadius);
                const angle = Math.random() * Math.PI * 2;
                const heightFactor = Math.pow(1 - (distance / coreConfig.radius), 2);
                const y = (Math.random() - 0.5) * coreConfig.maxHeight * heightFactor * (1 + layer * 0.4);
                
                positions.set([
                    Math.cos(angle) * distance, 
                    y, 
                    Math.sin(angle) * distance
                ], i * 3);
                
                const hue = 0.5 + Math.random() * 0.15;
                const saturation = 0.75 + Math.random() * 0.25;
                const lightness = 0.5 + Math.random() * 0.45;
                color.setHSL(hue, saturation, lightness);
                colors.set([color.r, color.g, color.b], i * 3);
                
                sizes[i] = coreConfig.size * (0.6 + Math.random() * 0.8);
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
                },
                vertexShader: `
                    uniform float uTime;
                    uniform float uPixelRatio;
                    attribute float size;
                    attribute vec3 color;
                    varying vec3 vColor;
                    varying float vAlpha;
                    
                    void main() {
                        vColor = color;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        
                        float twinkle = sin(uTime * 2.5 + position.x * 120.0) * 0.35 + 0.65;
                        vAlpha = twinkle;
                        
                        gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z) * twinkle;
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;
                    varying float vAlpha;
                    
                    void main() {
                        float distanceToCenter = length(gl_PointCoord - vec2(0.5));
                        float alpha = 1.0 - smoothstep(0.25, 0.5, distanceToCenter);
                        gl_FragColor = vec4(vColor, alpha * vAlpha);
                    }
                `,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false
            });
            
            const points = new THREE.Points(geometry, material);
            galaxyGroup.add(points);
            starParticles.push({ points, material });
        }
    }
    // Crear estrellas de fondo
    function createBackgroundStars() {
        const bgConfig = CONFIG.particles.backgroundStars;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(bgConfig.count * 3);
        const colors = new Float32Array(bgConfig.count * 3);
        const sizes = new Float32Array(bgConfig.count);
        const color = new THREE.Color();
        
        for (let i = 0; i < bgConfig.count; i++) {
            const r = bgConfig.radius;
            positions.set([
                (Math.random() - 0.5) * 2 * r, 
                (Math.random() - 0.5) * 2 * r, 
                (Math.random() - 0.5) * 2 * r
            ], i * 3);
            
            const hue = Math.random() * 0.2 + 0.48;
            color.setHSL(hue, 0.85, 0.75);
            colors.set([color.r, color.g, color.b], i * 3);
            
            sizes[i] = bgConfig.size * (0.4 + Math.random() * 1.8);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uPixelRatio;
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vTwinkle;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    float twinkle = sin(uTime * 3.5 + position.x * 60.0 + position.y * 40.0) * 0.45 + 0.55;
                    vTwinkle = twinkle;
                    
                    gl_PointSize = size * uPixelRatio * (550.0 / -mvPosition.z) * twinkle;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vTwinkle;
                
                void main() {
                    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.15, 0.5, distanceToCenter);
                    gl_FragColor = vec4(vColor, alpha * vTwinkle * 0.8);
                }
            `,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        
        bgStars = new THREE.Points(geometry, material);
        scene.add(bgStars);
    }
    // Crear pétalos flotantes
    function createFloatingPetals() {
        const petalCount = isMobile ? 40 : 120;
        const petals = [];
        
        for (let i = 0; i < petalCount; i++) {
            const petalGeometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                0, 0, 0,
                0.8, 1.5, 0,
                0, 3, 0,
                -0.8, 1.5, 0
            ]);
            petalGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            petalGeometry.setIndex([0, 1, 2, 0, 2, 3]);
            
            const colors = [
                new THREE.Color('#FFB6C1'),
                new THREE.Color('#FFC0CB'),
                new THREE.Color('#FFE4E1'),
                new THREE.Color('#FF69B4'),
                new THREE.Color('#FFF0F5')
            ];
            const petalColor = colors[Math.floor(Math.random() * colors.length)];
            
            const petalMaterial = new THREE.MeshBasicMaterial({
                color: petalColor,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            
            const radius = 80 + Math.random() * 180;
            const theta = Math.random() * Math.PI * 2;
            
            petal.position.set(
                Math.cos(theta) * radius,
                150 + Math.random() * 100,
                Math.sin(theta) * radius
            );
            
            petal.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            petal.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.03,
                y: (Math.random() - 0.5) * 0.03,
                z: (Math.random() - 0.5) * 0.03
            };
            petal.userData.fallSpeed = 0.15 + Math.random() * 0.25;
            petal.userData.horizontalDrift = (Math.random() - 0.5) * 0.02;
            petal.userData.initialHeight = petal.position.y;
            
            galaxyGroup.add(petal);
            petals.push(petal);
        }
        
        window.petals = petals;
    }
    // Cargar assets y crear elementos
    function loadAssetsAndCreateElements() {
        const textConfig = CONFIG.particles.texts;
        const imageConfig = CONFIG.particles.images;
        const textureLoader = new THREE.TextureLoader();
        
        let loadedCount = 0;
        const totalAssets = textConfig.count + imageConfig.count;

        for (let i = 0; i < textConfig.count; i++) {
            const colorData = textConfig.colors[i % textConfig.colors.length];
            const texture = createTextTexture(
                textConfig.content[i % textConfig.content.length], 
                colorData
            );
            
            const material = new THREE.MeshPhongMaterial({
                map: texture, 
                transparent: true, 
                alphaTest: 0.1,
                color: '#ffffff', 
                emissive: colorData.fill, 
                emissiveIntensity: 1.2,
                side: THREE.DoubleSide,
                shininess: 20
            });
            
            const textMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(textConfig.width, textConfig.height), 
                material
            );
            
            setElementOrbitPosition(textMesh, textConfig.minRadius, textConfig.maxRadius);
            textMesh.userData.initialY = textMesh.position.y;
            textMesh.userData.floatOffset = Math.random() * Math.PI * 2;
            textMesh.userData.scaleOffset = Math.random() * Math.PI * 2;
            
            galaxyGroup.add(textMesh);
            loveTexts.push(textMesh);
            
            loadedCount++;
            updateLoadingBar(loadedCount / totalAssets);
        }
        // Función para crear textura de imagen con bordes redondeados
        for (let i = 0; i < imageConfig.count; i++) {
            const imgIndex = i % imageData.length;
            const img = imageData[imgIndex];
            const url = img.url;
            const message = img.message;
            
            textureLoader.load(
                url,
                (texture) => {
                    // Forzar proporción 4:3 en la malla
                    const targetRatio = 3 / 4;
                    const imgElement = document.querySelector(`#image-data img[src="${url}"]`);
                    const customSize = imgElement ? parseFloat(imgElement.dataset.size) : null;
                    const size = customSize || imageConfig.size || 30;
                    
                    const w = size;
                    const h = w / targetRatio;
                    
                    const roundedTexture = createRoundedImageTexture(texture);

                    const material = new THREE.MeshBasicMaterial({
                        map: roundedTexture, 
                        transparent: true, 
                        alphaTest: 0.1,
                        color: new THREE.Color(0.55, 0.55, 0.55),
                        fog: false
                    });
                    
                    material.needsUpdate = true;
                    const imageMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
                    
                    // Guardar datos para el modal
                    imageMesh.userData.url = url;
                    imageMesh.userData.message = message;
                    
                    setElementOrbitPosition(imageMesh, imageConfig.minRadius, imageConfig.maxRadius);
                    imageMesh.userData.initialY = imageMesh.position.y;
                    imageMesh.userData.floatOffset = Math.random() * Math.PI * 2;
                    imageMesh.userData.rotationOffset = Math.random() * Math.PI * 2;
                    imageMesh.userData.scaleOffset = Math.random() * Math.PI * 2;
                    
                    galaxyGroup.add(imageMesh);
                    loveImages.push(imageMesh);
                    
                    loadedCount++;
                    updateLoadingBar(loadedCount / totalAssets);
                },
                undefined,
                (error) => {
                    console.error('Error cargando imagen:', url, error);
                    loadedCount++;
                    updateLoadingBar(loadedCount / totalAssets);
                }
            );
        }

        // Crear pétalos después de cargar assets para optimizar
        setTimeout(createFloatingPetals, 1000);
    }

    function updateLoadingBar(progress) {
        const loadingBar = document.getElementById('loading-bar');
        if (loadingBar) {
            loadingBar.style.width = (progress * 100) + '%';
        }
    }
//todo lo relacionado con la posición orbital de los elementos
    function setElementOrbitPosition(element, minRadius, maxRadius) {
        const safeMinRadius = minRadius || CONFIG.elementExclusionRadius;
        const safeMaxRadius = maxRadius || CONFIG.particles.coreStars.radius;
        
        const minSeparation = 22;// distancia mínima entre elementos
        const maxAttempts = 100;// evitar bucle infinito
        
        let validPosition = false;
        let attempts = 0;
        let finalPosition = { x: 0, y: 0, z: 0 };
        
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            
            const radius = safeMinRadius + Math.random() * (safeMaxRadius - safeMinRadius);
            const theta = Math.random() * Math.PI * 2;
            const maxVerticalOffset = 20;
            const y = (Math.random() - 0.5) * maxVerticalOffset;
            
            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            
            validPosition = true;
            for (let pos of occupiedPositions) {
                const dx = x - pos.x;
                const dy = y - pos.y;
                const dz = z - pos.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance < minSeparation) {
                    validPosition = false;
                    break;
                }
            }
            
            if (validPosition) {
                finalPosition = { x, y, z };
            }
        }
        
        element.position.set(finalPosition.x, finalPosition.y, finalPosition.z);
        occupiedPositions.push(finalPosition);
    }
    // todo lo relacionado con la creación de texturas de texto
    function createTextTexture(text, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;// Relacionado con height para buena resolución del texto en canvas
        canvas.height = 600;// Ajustar según tamaño del texto
        const context = canvas.getContext('2d'); //
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        context.font = 'bold 110px "Caveat", cursive';
        context.fillStyle = color.fill;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];
        const maxWidth = canvas.width - 140;
        const lineHeight = 145;

        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            if (context.measureText(testLine).width > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;
        lines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            
            context.shadowColor = color.shadow;
            context.shadowBlur = 12;
            context.fillText(line, canvas.width / 2, y);
            
            context.shadowBlur = 8;
            context.fillText(line, canvas.width / 2, y);
        });
        
        return new THREE.CanvasTexture(canvas);
    }
// todo lo relacionado con la creación de texturas de imagen con bordes redondeados
    function createRoundedImageTexture(texture) {
        const img = texture.image;
        const maxSize = 200;
        
        // Forzar proporción 3:4
        const targetRatio = 3 / 4;
        let w, h;
        
        const srcRatio = img.width / img.height;
        if (srcRatio > targetRatio) {
            // Imagen más ancha que 4:3, usar altura como referencia
            h = maxSize;
            w = h * targetRatio;
        } else {
            // Imagen más alta que 4:3, usar ancho como referencia
            w = maxSize;
            h = w / targetRatio;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Calcular escala e offset para recortar centrado la imagen original
        const scale = Math.max(w / img.width, h / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (w - scaledWidth) / 2;
        const offsetY = (h - scaledHeight) / 2;
        
        const r = Math.min(w, h) * 0.15;// radio de los bordes redondeados
        
        ctx.clearRect(0, 0, w, h);
        
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r);
        ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h);
        ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        
        ctx.globalCompositeOperation = 'destination-over';// para agregar efecto de brillo detrás
        ctx.shadowColor = 'rgba(0, 191, 255, 0.6)';
        ctx.shadowBlur = 25;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0, w, h);
        
        const newTexture = new THREE.CanvasTexture(canvas);
        newTexture.colorSpace = THREE.SRGBColorSpace;
        newTexture.generateMipmaps = true;
        newTexture.minFilter = THREE.LinearMipmapLinearFilter;
        newTexture.magFilter = THREE.LinearFilter;
        
        return newTexture;
    }
// Manejo de resize
    function onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        renderer.setSize(width, height);
        composer.setSize(width, height);
        camera.aspect = width / height;
        
        const currentIsMobile = width < 768;
        if (currentIsMobile !== isMobile) {
            location.reload(); // Recargar para ajustar configs si cambia orientación
        }
        
        camera.position.set(0, 45, currentIsMobile ? 200 : 150);
        camera.updateProjectionMatrix();
        
        starParticles.forEach(({ material }) => {
            material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
        });
        
        if (bgStars) {
            bgStars.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
        }
    }
// Animación principal
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        // Rotación lenta de la galaxia
        galaxyGroup.rotation.y = elapsedTime * CONFIG.galaxy.rotationSpeed;
        // Actualizar shaders con tiempo
        if (accretionRing) {
            accretionRing.rotation.z = elapsedTime * CONFIG.accretionRing.rotationSpeed;
            accretionRing.material.uniforms.uTime.value = elapsedTime;
        }
        
        if (sphereMaterial) {
            sphereMaterial.uniforms.uTime.value = elapsedTime;
        }
        
        starParticles.forEach(({ material }) => {
            material.uniforms.uTime.value = elapsedTime;
        });
        
        if (bgStars) {
            bgStars.material.uniforms.uTime.value = elapsedTime;
            bgStars.rotation.y = elapsedTime * 0.015;
        }
        // Animaciones de textos e imágenes
        const textConfig = CONFIG.particles.texts;
        // Todo lo relacionado con las animaciones de los textos en la órbita de la galaxia
        loveTexts.forEach((text) => {
            text.lookAt(camera.position);
            // Flotación vertical
            const floatY = Math.sin(elapsedTime * textConfig.floatSpeed + text.userData.floatOffset) * textConfig.floatAmplitude;
            text.position.y = text.userData.initialY + floatY;
            // Escalado pulsante basado en distancia
            const distance = text.position.distanceTo(camera.position);
            const minDist = 50;
            const maxDist = 220;
            const baseScale = THREE.MathUtils.clamp(1 - (distance - minDist) / (maxDist - minDist), 0.6, 1);
            const breathe = Math.sin(elapsedTime * 0.8 + text.userData.scaleOffset) * 0.08 + 1;
            text.scale.setScalar(baseScale * breathe);
        });
        // Todo lo relacionado con las animaciones de las imágenes en la órbita de la galaxia
        loveImages.forEach((img) => {
            img.lookAt(camera.position);
            
            const floatY = Math.sin(elapsedTime * 0.65 + img.userData.floatOffset) * 0.7;//hace que las imágenes floten (reboten), el 0.65 es la velocidad y el 0.7 la amplitud
            img.position.y = img.userData.initialY + floatY;
            
            const subtleRotation = Math.sin(elapsedTime * 0.35 + img.userData.rotationOffset) * 0.06; // hace que las imágenes roten sutilmente, 
            img.rotation.xz = subtleRotation;
            
            const distance = img.position.distanceTo(camera.position);
            const minDist = 50;
            const maxDist = 220;
            const baseScale = THREE.MathUtils.clamp(1 - (distance - minDist) / (maxDist - minDist), 0.7, 1);
            const pulse = Math.sin(elapsedTime * 1.2 + img.userData.scaleOffset) * 0.06 + 1;
            img.scale.setScalar(baseScale * pulse);
        });
        
        if (window.petals) {
            window.petals.forEach((petal) => {
                petal.rotation.x += petal.userData.rotationSpeed.x;
                petal.rotation.y += petal.userData.rotationSpeed.y;
                petal.rotation.z += petal.userData.rotationSpeed.z;
                
                petal.position.y -= petal.userData.fallSpeed;
                petal.position.x += Math.sin(elapsedTime + petal.userData.initialHeight) * petal.userData.horizontalDrift;
                petal.position.z += Math.cos(elapsedTime + petal.userData.initialHeight) * petal.userData.horizontalDrift;
                
                if (petal.position.y < -80) {
                    petal.position.y = 150 + Math.random() * 100;
                    const radius = 80 + Math.random() * 180;
                    const theta = Math.random() * Math.PI * 2;
                    petal.position.x = Math.cos(theta) * radius;
                    petal.position.z = Math.sin(theta) * radius;
                }
            });
        }
        
        controls.update();
        composer.render();
    }
    
    init();
let started = false;
// Función para iniciar la experiencia (idempotente)
    function startExperience() {
    if (started) {
        console.log("startExperience: ya iniciado, ignorando.");
        return;
    }
    started = true;
    console.log("startExperience: iniciado");

    const startScreen = document.getElementById('start-screen');
    if (!startScreen) console.warn("startExperience: no se encontró #start-screen");

    // Mostrar logs útiles
    console.log("camera:", !!camera, "controls:", !!controls);

    // reproducir música si es posible
    const music = document.getElementById('background-music');
    if (music) {
        music.volume = 0.6;
        music.play().then(() => {
            console.log("startExperience: música iniciada");
        }).catch(e => {
            console.warn("startExperience: no se pudo reproducir música (requiere interacción)", e);
        });
    }

    // ocultar pantalla de inicio con transición
    if (startScreen) {
        startScreen.style.transition = 'opacity 1s ease-out';
        startScreen.style.opacity = '0';
        // para evitar que el usuario vuelva a pulsar mientras se oculta
        startScreen.style.pointerEvents = 'none';
    }

    // iniciamos la animación de cámara inmediatamente (o después de fade si prefieres)
    // Aquí la lanzamos con pequeño retardo para que la transición sea suave
    setTimeout(() => {
        try {
            startCameraAnimation();
        } catch (err) {
            console.error("Error al ejecutar startCameraAnimation():", err);
        }
        // ocultar totalmente la pantalla start after animation start
        if (startScreen) {
            setTimeout(() => {
                startScreen.style.display = 'none';
            }, 600);
        }
    }, 200);

    // Animation info removal (igual que antes)
    setTimeout(() => {
        const controlsInfo = document.getElementById('controls-info');
        if (controlsInfo) {
            setTimeout(() => {
                controlsInfo.style.opacity = '0';
                controlsInfo.style.transition = 'opacity 1.5s ease-out';
                setTimeout(() => controlsInfo.remove(), 1500);
            }, 10000);
        }
    }, 100);
}
// Botón para iniciar la experiencia
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-button');

    // Al hacer click: arrancar la experiencia
    startBtn.addEventListener('click', (e) => {
        try {
            // startExperience está definida en este módulo y es idempotente (usa la variable `started`)
            startExperience();
        } catch (err) {
            console.warn('startExperience error (from start btn):', err);
        }
    });
});


   // startCameraAnimation() — MUCHO MÁS LENTA (~12s total)
function startCameraAnimation() {
    if (startCameraAnimation.running) return;
    if (typeof camera === 'undefined' || typeof controls === 'undefined') {
        console.error("startCameraAnimation: falta camera o controls");
        return;
    }

    startCameraAnimation.running = true;
    controls.enabled = false;
    console.log("startCameraAnimation: iniciada (muy lenta)");

    // Centro/target (usa planet si existe)
    const targetVec = (typeof planet !== 'undefined' && planet.position) ? planet.position.clone() : new THREE.Vector3(0,0,0);

    // POSICIONES (relativas al target)
    const startPos = { x: targetVec.x, y: targetVec.y + 120, z: targetVec.z + 70 }; // muy alto/lejos
    const downPos  = { x: targetVec.x, y: targetVec.y + 20,   z: targetVec.z + 70 }; // acercamiento pausado
    const backPos  = { x: targetVec.x + 120, y: targetVec.y + 10, z: targetVec.z + 120 }; // retroceso amplio
    const endPos   = { x: targetVec.x - 40,  y: targetVec.y + 65, z: targetVec.z + 170 }; // posición final cómoda

    // DURACIONES de los acercamiento de la cámara en (ms) — mucho más lentas
    const d1 = 3500;   // start -> down (3.5s)
    const d2 = 10000;   // down -> back (4.0s)
    const d3 = 500;   // back -> end  (4.5s)
    const t0 = performance.now();

    // Easing y utilitarios
    const easeInOutCubic = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
    const lerp = (a,b,t) => a + (b-a)*t;
    const lerpV = (A,B,t) => ({ x: lerp(A.x,B.x,t), y: lerp(A.y,B.y,t), z: lerp(A.z,B.z,t) });

    // Forzar posición inicial
    camera.position.set(startPos.x, startPos.y, startPos.z);
    camera.lookAt(targetVec);
    controls.target.copy(targetVec);
    controls.update();

    function step(now) {
        const elapsed = now - t0;
        let newPos;

        if (elapsed < d1) {
            // 1) bajar lentamente
            const tn = Math.max(0, Math.min(1, elapsed / d1));
            const e = easeInOutCubic(tn);
            newPos = lerpV(startPos, downPos, e);
        } else if (elapsed < d1 + d2) {
            // 2) retroceder despacio con oscilación muy sutil
            const tn = Math.max(0, Math.min(1, (elapsed - d1) / d2));
            const e = easeInOutCubic(tn);
            const base = lerpV(downPos, backPos, e);
            const swing = Math.sin(tn * Math.PI * 2) * (1 - tn) * 6; // oscilación pequeña
            const bob = Math.sin(tn * Math.PI) * 2.5;
            newPos = { x: base.x + swing, y: base.y + bob, z: base.z };
        } else if (elapsed < d1 + d2 + d3) {
            // 3) subir/acomodarse suavemente
            const tn = Math.max(0, Math.min(1, (elapsed - d1 - d2) / d3));
            const e = easeInOutCubic(tn);
            newPos = lerpV(backPos, endPos, e);
        } else {
            // Final — asegurar posición exacta y reactivar controles
            camera.position.set(endPos.x, endPos.y, endPos.z);
            camera.lookAt(targetVec);
            controls.target.copy(targetVec);
            controls.update();
            controls.enabled = true;
            startCameraAnimation.running = false;
            console.log("startCameraAnimation: terminada (muy lenta)");
            return;
        }

        camera.position.set(newPos.x, newPos.y, newPos.z);
        camera.lookAt(targetVec);
        controls.target.copy(targetVec);
        controls.update();

        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

    