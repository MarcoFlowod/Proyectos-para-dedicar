// --- POLIFILL PARA ROUNDRECT ---
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}

// --- VARIABLES GLOBALES ---
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let w, h;
let animacionIniciada = false;
let animacionIntroID;

// --- INICIO DE LA APLICACIÓN ---
document.getElementById('btn-iniciar').onclick = iniciarAnimacionYMusica;

function iniciarAnimacionYMusica() {
    if (animacionIniciada) return;
    animacionIniciada = true;

    // Detener la animación de fondo del modal
    if (animacionIntroID) cancelAnimationFrame(animacionIntroID);
    document.getElementById('modal-inicio').style.display = 'none';
    
    const music = document.getElementById('bg-music');
    if(music) {
        music.currentTime = 0;
        music.play().catch(e => console.log("Audio bloqueado por el navegador"));
    }

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    // --- CONFIGURACIÓN DE ELEMENTOS ---
    const PHRASES = ["Te amo", "Te quiero", "Eres mi vida", "Eres mi todo", "Mi princesa", "Mi amor", "Eres especial", "Me encantas", "Te adoro ❤", "Preciosa", "Eres Perfecta", "Guapa", "Hermosa", "Bella"];
    const imgStyles = [
        { borderColor: '#ff6b9d' },
        { borderColor: '#69a3ff' },
        { borderColor: '#d369ff' }
    ];
    const heartColors = ['#ff4d88', '#ff0000', '#ff85a2', '#ff007f', '#ffb3ba', '#00fbff', '#70ff8e'];
    
    const imgUrls = [
        "../imagenes/img1.webp", "../imagenes/img2.webp", "../imagenes/img3.webp",
        "../imagenes/img4.webp", "../imagenes/img5.webp", "../imagenes/img6.webp"
    ];

    const imgObjs = imgUrls.map(url => {
        const img = new Image();
        img.src = url;
        img.onerror = () => crearImagenFallback(img);
        return img;
    });

    let stars = [], hearts = [], texts = [], imgDrops = [], explosions = [];
    let phraseIndex = 0;

    // --- LÓGICA DE DISPERSIÓN (CORREGIDA PARA MÓVIL) ---
    function getPosFueraDelCentro(maxSize) {
        const esMovil = window.innerWidth < 768;
        const multiplicador = esMovil ? 1.5 : 1.5;
        let pos = (Math.random() - 0.5) * maxSize * multiplicador;
        const margenSeguridad = maxSize * 0.03; 
        if (Math.abs(pos) < margenSeguridad) {
            pos = pos >= 0 ? margenSeguridad : -margenSeguridad;
        }
        return pos;
    }

    // --- CREADORES ---
    function createStar() {
        return { 
            x: (Math.random() - 0.5) * w * 4, 
            y: (Math.random() - 0.5) * h * 4, 
            z: Math.random() * 2000, speed: 5 + Math.random() * 10 
        };
    }

    function createHeart(zValue = 2000) {
        return { 
            x: getPosFueraDelCentro(w), 
            y: getPosFueraDelCentro(h), 
            z: zValue, 
            speed: 5 + Math.random() * 5,
            color: heartColors[Math.floor(Math.random() * heartColors.length)]
        };
    }

    function createImgDrop(zValue = 2000) {
        return {
            img: imgObjs[Math.floor(Math.random() * imgObjs.length)],
            x: getPosFueraDelCentro(w), 
            y: getPosFueraDelCentro(h), 
            z: zValue,
            speed: 3 + Math.random() * 6, 
            estilo: imgStyles[Math.floor(Math.random() * imgStyles.length)],
            rotation: (Math.random() - 0.5) * 0.2,
            opacity: 0
        };
    }

    function spawnText() {
        if (texts.length >= 20) return;
        texts.push({
            text: PHRASES[phraseIndex++ % PHRASES.length],
            x: getPosFueraDelCentro(w), 
            y: getPosFueraDelCentro(h), 
            z: 3000, 
            speed: 7 + Math.random() * 5, 
            baseFont: (w < 600 ? 35 : 55)
        });
    }

    // Inicialización
    for (let i = 0; i < 400; i++) stars.push(createStar());
    for (let i = 0; i < 6; i++) {
        hearts.push(createHeart(Math.random() * 3000));
        imgDrops.push(createImgDrop(Math.random() * 3000));
    }

    // --- LOOP PRINCIPAL (SOLUCIÓN AL RASTRO) ---
    function animate() {
        // Limpiar el canvas totalmente
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; // Reset sombra para la limpieza
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // Dibujar Nebulosa
        ctx.save();
        const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.6);
        grad.addColorStop(0, 'rgba(40, 20, 100, 0.3)'); 
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        let allElements = [];
        stars.forEach(s => { s.z -= s.speed; if (s.z <= 0) s.z = 5000; allElements.push({ type: 'star', obj: s }); });
        hearts.forEach((hObj, i) => {
            hObj.z -= hObj.speed;
            if (hObj.z <= 10) {
                const scale = 400 / 10;
                crearExplosionFisica(hObj.x * scale + w/2, hObj.y * scale + h/2, hObj.color);
                hearts[i] = createHeart(5000);
            }
            allElements.push({ type: 'heart', obj: hObj });
        });
        texts.forEach((t, i) => { t.z -= t.speed; if (t.z <= 10) texts.splice(i, 1); else allElements.push({ type: 'text', obj: t }); });
        imgDrops.forEach(img => {
            img.z -= img.speed;
            if (img.opacity < 1) img.opacity += 0.02;
            if (img.z <= 10) Object.assign(img, createImgDrop(4000));
            allElements.push({ type: 'image', obj: img });
        });

        allElements.sort((a, b) => b.obj.z - a.obj.z);

        allElements.forEach(el => {
            const o = el.obj;
            const scale = 400 / Math.max(o.z, 1);
            const x = o.x * scale + w/2;
            const y = o.y * scale + h/2;

            ctx.save();
            if (el.type === 'star') {
                ctx.fillStyle = "white";
                ctx.globalAlpha = Math.max(0, Math.min(1, (5000 - o.z) / 5000));
                ctx.fillRect(x, y, scale * 1.5, scale * 1.5);
            } 
            else if (el.type === 'heart') {
                ctx.font = `${Math.floor(150 * scale)}px Arial`;
                ctx.textAlign = "center";
                ctx.fillStyle = o.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = o.color;
                ctx.fillText("❤", x, y);
            } 
            else if (el.type === 'text') {
                ctx.font = `bold ${Math.floor(o.baseFont * scale)}px Arial`;
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.shadowBlur = 10;
                ctx.shadowColor = `hsl(${Date.now() * 0.05 % 360}, 70%, 70%)`;
                ctx.fillText(o.text, x, y);
            } 
            else if (el.type === 'image') {
                ctx.globalAlpha = o.opacity;
                const iw = (w < 600 ? 140 : 220) * scale;
                const ih = (w < 600 ? 180 : 280) * scale;
                dibujarImagenCustom(ctx, o.img, x, y, iw, ih, o);
            }
            ctx.shadowBlur = 0;
            ctx.restore();
        });

        dibujarExplosiones();
        requestAnimationFrame(animate);
    }

    function dibujarImagenCustom(ctx, img, x, y, width, height, data) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(data.rotation);
        ctx.beginPath();
        ctx.roundRect(-width/2, -height/2, width, height, 15 * (width/200));
        ctx.clip();
        ctx.drawImage(img, -width/2, -height/2, width, height);
        ctx.strokeStyle = data.estilo.borderColor;
        ctx.lineWidth = 5 * (width/200);
        ctx.stroke();
        ctx.restore();
    }

    function crearExplosionFisica(x, y, color) {
        for (let i = 0; i < 15; i++) {
            explosions.push({ x, y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 1, size: Math.random() * 5 + 2, color });
        }
    }

    function dibujarExplosiones() {
        for (let i = explosions.length - 1; i >= 0; i--) {
            let p = explosions[i];
            p.x += p.vx; p.y += p.vy; p.life -= 0.02;
            if (p.life <= 0) explosions.splice(i, 1);
            else {
                ctx.save();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath(); 
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); 
                ctx.fill();
                ctx.restore();
            }
        }
    }

    function crearImagenFallback(img) {
        const c = document.createElement('canvas');
        c.width = 200; c.height = 260;
        const tt = c.getContext('2d');
        tt.fillStyle = '#222'; tt.fillRect(0,0,200,260);
        img.src = c.toDataURL();
    }

    animate();
    setInterval(spawnText, 800);
}

// --- SECCIÓN INTRO (loveCanvas) ---
const introCanvas = document.getElementById('loveCanvas');
const iCtx = introCanvas.getContext('2d');
let introParticles = [];

function resizeIntro() {
    introCanvas.width = window.innerWidth;
    introCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeIntro);
resizeIntro();

class HeartParticle {
    constructor() { this.init(); }
    init() {
        this.x = Math.random() * introCanvas.width;
        this.y = introCanvas.height + Math.random() * 100;
        const esMovil = window.innerWidth < 480;
        this.size = Math.random() * (esMovil ? 25 : 15) + (esMovil ? 10 : 5);
        this.speedY = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
        const tones = ['#b38bff', '#8a2be2', '#d8b4fe', '#ffffff'];
        this.color = tones[Math.floor(Math.random() * tones.length)];
        this.isSparkle = Math.random() > 0.7;
    }
    draw() {
        iCtx.save();
        iCtx.globalAlpha = this.opacity;
        iCtx.shadowBlur = 15;
        iCtx.shadowColor = this.color;
        iCtx.strokeStyle = this.color;
        iCtx.lineWidth = 1.5;
        iCtx.beginPath();
        if (this.isSparkle) {
            iCtx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
            iCtx.fillStyle = "white"; iCtx.fill();
        } else {
            const x = this.x, y = this.y, s = this.size;
            iCtx.moveTo(x, y);
            iCtx.bezierCurveTo(x, y - s/2, x - s, y - s/2, x - s, y);
            iCtx.bezierCurveTo(x - s, y + s/2, x, y + s, x, y + s * 1.3);
            iCtx.bezierCurveTo(x, y + s, x + s, y + s/2, x + s, y);
            iCtx.bezierCurveTo(x + s, y - s/2, x, y - s/2, x, y);
            iCtx.stroke();
        }
        iCtx.restore();
    }
    update() {
        this.y -= this.speedY;
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0 || this.y < -50) this.init();
    }
}

function animateIntro() {
    iCtx.clearRect(0, 0, introCanvas.width, introCanvas.height);
    introParticles.forEach(p => { p.update(); p.draw(); });
    animacionIntroID = requestAnimationFrame(animateIntro);
}

for (let i = 0; i < (window.innerWidth < 480 ? 15 : 50); i++) introParticles.push(new HeartParticle());
animateIntro();