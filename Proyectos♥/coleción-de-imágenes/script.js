// ========== VARIABLES GLOBALES ==========
let hearts = [];
let hearts2 = [];
let canvas1, ctx1, canvas2, ctx2;
let animationId;
let currentImageIndex = 0;
let imagesData = [];
let heartRainInterval;

// Símbolos y mensajes para la primera pantalla
const symbols = [
    "❤️", "💕", "🌷", "✨", "🥰", "💖", "💘", "💝","💚","💚","💚","🌷","🌷","🌷","🌷", "💙","💙","💙","💙",
    "♥", "♡", "★", "☆", "✧", "❀", "✿", "❁",
    "PRECIOSA", "LINDA", "<3", "PERFECTA", "GUAPA", "HERMOSA", "BELLA", "DIVINA", "BONITA", "MARAVILLOSA"
];

// Colores vibrantes estilo Minecraft
const colors = [
    "#ff5555", "#ffaa00", "#55ff55", "#5555ff",
    "#aa00aa", "#00aaaa", "#ffff55", "#ff55ff",
    "#55ffff", "#aaaaaa"
];

// ========== INICIALIZACIÓN AL CARGAR LA PÁGINA ==========
document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos del DOM
    const startScreen = document.getElementById('startScreen');
    const memoriesScreen = document.getElementById('memoriesScreen');
    const teQuieroLink = document.getElementById('teQuieroLink');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const closeButton = document.querySelector('.close-button');
    const flipCard = document.getElementById('flip-card');
    const collageContainer = document.getElementById('collage-container');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const rainContainer = document.getElementById('rain');

    // Inicializar pantalla inicial
    startScreen.classList.add('active-screen');
    
    // Inicializar canvas
    initCanvas1();
    collectImagesData();
    attachCollageHandlers();
    
    // ========== EVENT LISTENERS ==========
    
    // Navegación: De "Te Quiero" a "Recuerdos"
    teQuieroLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        startScreen.style.opacity = '0';
        startScreen.style.visibility = 'hidden';
        
        setTimeout(() => {
            startScreen.classList.remove('active-screen');
            memoriesScreen.classList.add('active-screen');
            
            // Inicializar efectos en segunda pantalla
            initCanvas2();
            startHeartRain(rainContainer);
            
            // Reproducir música
            backgroundMusic.volume = 0.5;
            backgroundMusic.play().catch(e => {
                console.log("Autoplay bloqueado");
            });
            
            // Pausar primera animación
            cancelAnimationFrame(animationId);
        }, 300);
    });
    //falta
    backButton.addEventListener('click', function() {
        memoriesScreen.style.opacity = '0';
        memoriesScreen.style.visibility = 'hidden';
        

    });
    
    // Modal y collage (código original de coleccion.js)
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.style.display = 'none';
        if (modalTitle) modalTitle.textContent = '';
        if (flipCard) flipCard.classList.remove('is-flipped');
        document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('paused'));
    });

    closeButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            e.stopPropagation();
            modal.style.display = 'none';
            if (modalTitle) modalTitle.textContent = '';
            if (flipCard) flipCard.classList.remove('is-flipped');
            document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('paused'));
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (modalTitle) modalTitle.textContent = '';
            if (flipCard) flipCard.classList.remove('is-flipped');
            document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('paused'));
        }
    });

    if (flipCard) {
        flipCard.addEventListener('click', (e) => {
            flipCard.classList.toggle('is-flipped');
            e.stopPropagation();
        });
        
        flipCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                flipCard.classList.toggle('is-flipped');
            }
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('paused'));
                flipCard.classList.remove('is-flipped');
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            if (modalTitle) modalTitle.textContent = '';
            if (flipCard) flipCard.classList.remove('is-flipped');
            document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('paused'));
        }
    });

    if (modalImage) {
        modalImage.addEventListener('load', adjustFlipCardSize);
    }
    
    window.addEventListener('resize', () => {
        if (modal.style.display === 'block') adjustFlipCardSize();
        handleResize();
    });

    // Iniciar animación inicial
    initHeartsRain();
    
    // ========== FUNCIONES ==========
    
    function initCanvas1() {
        canvas1 = document.getElementById('loveRain');
        canvas1.width = window.innerWidth;
        canvas1.height = window.innerHeight;
        ctx1 = canvas1.getContext('2d');
    }
    
    function initCanvas2() {
        canvas2 = document.getElementById('loveRain2');
        if (canvas2) {
            canvas2.width = window.innerWidth;
            canvas2.height = window.innerHeight;
            ctx2 = canvas2.getContext('2d');
        }
    }
    
    function collectImagesData() {
        imagesData = [];
        document.querySelectorAll('.collage-item[data-index]').forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                imagesData.push({
                    src: img.src,
                    title: img.getAttribute('data-title'),
                    text: img.getAttribute('data-text'),
                    alt: img.alt
                });
            }
        });
    }
    
    function attachCollageHandlers() {
        const collageItems = document.querySelectorAll('.collage-item[data-index]');
        collageItems.forEach(item => {
            const img = item.querySelector('img');
            if (!img) return;
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.collage-item').forEach(el => el.classList.add('paused'));
                modal.style.display = 'block';
                modalImage.src = img.src;
                modalText.textContent = img.dataset.text || img.alt || '';
                modalTitle.textContent = img.dataset.title || img.dataset.text || img.alt || '';
                if (flipCard) flipCard.classList.remove('is-flipped');
                if (flipCard) flipCard.focus();
            });
            
            item.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                    event.preventDefault();
                    document.querySelectorAll('.collage-item').forEach(el => el.classList.add('paused'));
                    modal.style.display = 'block';
                    modalImage.src = img.src;
                    modalText.textContent = img.dataset.text || img.alt || '';
                    modalTitle.textContent = img.dataset.title || img.dataset.text || img.alt || '';
                    if (flipCard) flipCard.classList.remove('is-flipped');
                    if (flipCard) flipCard.focus();
                }
            });
        });
    }
    
    function adjustFlipCardSize() {
        if (!modalImage || !flipCard) return;
        const rect = modalImage.getBoundingClientRect();
        flipCard.style.width = rect.width + 'px';
        flipCard.style.height = rect.height + 'px';
    }
    
    function initHeartsRain() {
        hearts = [];
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            hearts.push({
                x: Math.random() * canvas1.width,
                y: Math.random() * -canvas1.height,
                speed: 1 + Math.random() * 3,
                size: 12 + Math.random() * 20,
                symbol: symbols[Math.floor(Math.random() * symbols.length)],
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: 0,
                opacity: 0.9,
                sway: Math.random() * 2 - 1,
                swaySpeed: 0.01 + Math.random() * 0.03,
                isPixel: Math.random() > 0.7
            });
        }
        
        animateHearts();
    }
    
    /* Función para dibujar un bloque pixelado */
    function drawPixel(x, y, size, color, context) {
        context.fillStyle = color;
        context.fillRect(x, y, size, size);
        context.fillStyle = "#000";
        context.fillRect(x + size*0.2, y + size*0.2, size*0.6, size*0.6);
        context.fillStyle = color;
        context.fillRect(x + size*0.3, y + size*0.3, size*0.4, size*0.4);
    }
    
    /* Función de animación */
    function animateHearts() {
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        
        // Efecto de estrellas pixeladas
        ctx1.fillStyle = "rgba(255, 255, 255, 0.8)";
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvas1.width;
            const y = Math.random() * canvas1.height;
            const size = Math.random() > 0.8 ? 2 : 1;
            ctx1.fillRect(x, y, size, size);
        }
        
        hearts.forEach(particle => {
            ctx1.save();
            ctx1.translate(particle.x, particle.y);
            
            if (particle.isPixel) {
                // Dibujar partículas como bloques pixelados
                drawPixel(-particle.size/2, -particle.size/2, particle.size, particle.color, ctx1);
            } else {
                // Texto normal
                ctx1.globalAlpha = particle.opacity;
                ctx1.fillStyle = particle.color;
                ctx1.font = `${particle.size}px 'Press Start 2P', cursive`;
                ctx1.textAlign = 'center';
                ctx1.textBaseline = 'middle';
                ctx1.fillText(particle.symbol, 0, 0);
            }
            
            ctx1.restore();
            particle.y += particle.speed;
            particle.x += particle.sway * Math.sin(particle.y * particle.swaySpeed);
            particle.rotation += 0.02;
            
            if (particle.y > canvas1.height + 50) {
                particle.y = -20;
                particle.x = Math.random() * canvas1.width;
                particle.symbol = symbols[Math.floor(Math.random() * symbols.length)];
                particle.color = colors[Math.floor(Math.random() * colors.length)];
                particle.size = 12 + Math.random() * 20;
                particle.isPixel = Math.random() > 0.7;
            }
        });
        
        animationId = requestAnimationFrame(animateHearts);
    }
    
    function startHeartRain(container) {
        const hearts = ["♡", "♥", "♡", "★", "☆", "✧", "❀", "✿", "❁", "♡","ღ","❣","❤","<3","ထ","ౚ","ద"];
        
        function createHeart() {
            if (!container) return;
            
            const heart = document.createElement("span");
            let heart_emoji = hearts[Math.floor(Math.random() * hearts.length)];
            let size = Math.random() * 20 + 10;
            let posX = Math.random() * window.innerWidth;
            let duration = Math.random() * 5 + 5;
            let delay = Math.random() * 5;
            let swayDistance = Math.random() * 100 - 50;

            heart.textContent = heart_emoji;
            heart.style.left = posX + "px";
            heart.style.animationDuration = duration + "s";
            heart.style.animationDelay = delay + "s";
            heart.style.fontSize = size + "px";

            container.appendChild(heart);
            
            setTimeout(() => {
                heart.remove();
            }, (duration + delay) * 1000);
        }
        
        heartRainInterval = setInterval(createHeart, 20);
        
        // También iniciar animación del canvas2 si existe
        if (canvas2) {
            // Simple animación de estrellas para canvas2
            function animateCanvas2() {
                ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
                
                // Dibujar estrellas simples
                ctx2.fillStyle = "rgba(255, 255, 255, 0.8)";
                for (let i = 0; i < 30; i++) {
                    const x = Math.random() * canvas2.width;
                    const y = Math.random() * canvas2.height;
                    const size = Math.random() > 0.8 ? 2 : 1;
                    ctx2.fillRect(x, y, size, size);
                }
                
                requestAnimationFrame(animateCanvas2);
            }
            
            animateCanvas2();
        }
    }
    
    function handleResize() {
        if (canvas1) {
            canvas1.width = window.innerWidth;
            canvas1.height = window.innerHeight;
        }
        if (canvas2 && memoriesScreen.classList.contains('active-screen')) {
            canvas2.width = window.innerWidth;
            canvas2.height = window.innerHeight;
        }
        
        // Si estamos en la pantalla inicial, reiniciar la animación
        if (startScreen.classList.contains('active-screen')) {
            cancelAnimationFrame(animationId);
            initHeartsRain();
        }
    }
    
    // Manejar redimensionamiento de ventana
    window.addEventListener('resize', handleResize);
});

// ========== simulación de estrellas en le backcard ==========
const COLORS = ["#fff2", "#fff4", "#fff7", "#fffc"];

const generateSpaceLayer = (size, selector, totalStars, duration) => {
    const layer = [];
    for (let i = 0; i < totalStars; i++) {
    const color = COLORS[~~(Math.random() * COLORS.length)];
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);
    layer.push(`${x}vw ${y}vh 0 ${color}, ${x}vw ${y + 100}vh 0 ${color}`);
    }
    const container = document.querySelector(selector);
    container.style.setProperty("--size", size);
    container.style.setProperty("--duration", duration);
    container.style.setProperty("--space-layer", layer.join(","));
}

generateSpaceLayer("2px", ".space-1", 250, "25s");
generateSpaceLayer("3px", ".space-2", 100, "20s");
generateSpaceLayer("6px", ".space-3", 25, "15s");