const canvas = document.getElementById('loveRain');
const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

// Detectar dispositivo celular para optimizar
const isMobile = window.innerWidth <= 768;
const isSmallMobile = window.innerWidth <= 360;

// Símbolos y mensajes
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

// Reducir partículas en móviles para mejor rendimiento
const particleCount = isSmallMobile ? 40 : (isMobile ? 60 : 100);
const particles = [];

for (let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
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
/* Función para dibujar un bloque pixelado */
function drawPixel(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + size*0.2, y + size*0.2, size*0.6, size*0.6);
    ctx.fillStyle = color;
    ctx.fillRect(x + size*0.3, y + size*0.3, size*0.4, size*0.4);
}
/* Función de animación */
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Efecto de estrellas pixeladas - menos en móviles
    const starCount = isSmallMobile ? 15 : 30;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() > 0.8 ? 2 : 1;
        ctx.fillRect(x, y, size, size);
    }
    
    particles.forEach(particle => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        
        if (particle.isPixel) {
            // Dibujar partículas como bloques pixelados
            drawPixel(-particle.size/2, -particle.size/2, particle.size, particle.color);
        } else {
            // Texto normal
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.font = `${particle.size}px 'Press Start 2P', cursive`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(particle.symbol, 0, 0);
        }
        
        ctx.restore()
        particle.y += particle.speed;
        particle.x += particle.sway * Math.sin(particle.y * particle.swaySpeed);
        particle.rotation += 0.02
        if (particle.y > canvas.height + 50) {
            particle.y = -20;
            particle.x = Math.random() * canvas.width;
            particle.symbol = symbols[Math.floor(Math.random() * symbols.length)];
            particle.color = colors[Math.floor(Math.random() * colors.length)];
            particle.size = 12 + Math.random() * 20;
            particle.isPixel = Math.random() > 0.7;
        }
    })
    requestAnimationFrame(animate);
}
animate()
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Interactividad del sobre
const envelopeContainer = document.getElementById('envelope-container');
const card = document.getElementById('card');
const instruction = document.getElementById('instruction');
let isOpen = false;

// Función para abrir/cerrar
function toggleEnvelope() {
    if (!isOpen) {
        envelopeContainer.style.animation = 'none';
        envelopeContainer.offsetHeight; // Trigger reflow
        
        card.classList.add('show');
        envelopeContainer.classList.add('hidden');
        instruction.classList.add('hidden');
        isOpen = true;
        
        // Crear confeti al abrir
        createConfetti();
    } else {
        card.classList.remove('show');
        envelopeContainer.classList.remove('hidden');
        instruction.classList.remove('hidden');
        isOpen = false;
    }
}

// Click event
envelopeContainer.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleEnvelope();
});

// Touch events para mejor soporte en móviles
envelopeContainer.addEventListener('touchstart', function(e) {
    e.stopPropagation();
    toggleEnvelope();
});

// Cerrar tarjeta al hacer clic fuera
document.addEventListener('click', function(e) {
    if (isOpen && !card.contains(e.target) && !envelopeContainer.contains(e.target)) {
        card.classList.remove('show');
        envelopeContainer.classList.remove('hidden');
        instruction.classList.remove('hidden');
        isOpen = false;
    }
});

// Cerrar tarjeta con touch fuera
document.addEventListener('touchstart', function(e) {
    if (isOpen && !card.contains(e.target) && !envelopeContainer.contains(e.target)) {
        card.classList.remove('show');
        envelopeContainer.classList.remove('hidden');
        instruction.classList.remove('hidden');
        isOpen = false;
    }
});

// Crear confeti decorativo
function createConfetti() {
    const confettiAmount = isSmallMobile ? 15 : 30;
    const confettiSymbols = ['❤️', '💕', '🌷', '✨', '💖', '💘', '❀'];
    
    for (let i = 0; i < confettiAmount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-20px';
        confetti.textContent = confettiSymbols[Math.floor(Math.random() * confettiSymbols.length)];
        confetti.style.fontSize = isSmallMobile ? '1.5em' : '2em';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '20';
        document.body.appendChild(confetti);
        
        const duration = 3 + Math.random() * 2;
        
        confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        setTimeout(() => confetti.remove(), duration * 1000);
    }
}


