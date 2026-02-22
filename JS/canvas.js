const canvas = document.getElementById('loveCanvas');
const ctx = canvas.getContext('2d');

let particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class HeartParticle {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        
        // --- CAMBIO PARA TAMAÑO EN MÓVIL ---
        const esMovil = window.innerWidth < 768;
        const baseSize = esMovil ? 25 : 15; // Más grande si es móvil
        const extraSize = esMovil ? 10 : 5;
        this.size = Math.random() * baseSize + extraSize;
        // -----------------------------------

        this.speedY = Math.random() * 1 + 0.5; 
        this.opacity = Math.random() * 0.5 + 0.5;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
        
        const tones = ['#b38bff', '#8a2be2', '#d8b4fe', '#ffffff'];
        this.color = tones[Math.floor(Math.random() * tones.length)];
        this.isSparkle = Math.random() > 0.7;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = window.innerWidth < 480 ? 2 : 1.5; // Línea más gruesa en móvil

        if (this.isSparkle) {
            ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();
        } else {
            const x = this.x;
            const y = this.y;
            const s = this.size;
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(x, y - s/2, x - s, y - s/2, x - s, y);
            ctx.bezierCurveTo(x - s, y + s/2, x, y + s, x, y + s * 1.3);
            ctx.bezierCurveTo(x, y + s, x + s, y + s/2, x + s, y);
            ctx.bezierCurveTo(x + s, y - s/2, x, y - s/2, x, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    update() {
        this.y -= this.speedY;
        this.opacity -= this.fadeSpeed;

        if (this.opacity <= 0 || this.y < -50) {
            this.init();
        }
    }
}

function createParticles() {
    particles = []; // Limpiar la lista actual
    
    // Si el ancho es menor a 768px (teléfono), crea 25. Si no, crea 60.
    const cantidad = window.innerWidth < 480 ? 15 : 50;
    
    for (let i = 0; i < cantidad; i++) {
        particles.push(new HeartParticle());
    }
}

function animate() {
    // Esto limpia el canvas pero lo deja transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    animacionID = requestAnimationFrame(animate);
}


createParticles();
animate();
