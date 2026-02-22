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




// todo lo relacionado con la carta 

function abrirCarta() {
    const sup = document.querySelector(".superior");
    if (sup) sup.classList.add("abrir-superior");

  const heart = document.querySelector(".bx");
  if (heart) heart.classList.add("bx-rotada");

  setTimeout(() => {
    if (sup) sup.style.zIndex = -1;
    const msg = document.querySelector(".mensaje");
    if (msg) msg.classList.add("abrir-mensaje");
  }, 700);
}

function cerrarCarta() {
  const sup = document.querySelector(".superior");
  const msg = document.querySelector(".mensaje");
  const heart = document.querySelector(".bx");
  const h1 = document.querySelector("h1");

  if (msg) {
    // 1. Iniciamos la animación de bajada del mensaje
    msg.classList.remove("abrir-mensaje");
    msg.classList.add("cerrar-mensaje");

    // ESCUCHAMOS: Cuando el mensaje termina de entrar a la carta
    msg.addEventListener("animationend", () => {
      msg.classList.remove("cerrar-mensaje");
      msg.style.zIndex = "-1";

      if (sup) {
        // 2. Devolvemos el z-index para que la solapa tape el mensaje
        sup.style.zIndex = "5";
        // 3. Cerramos la solapa (esto activa la transition de .75s del CSS)
        sup.classList.remove("abrir-superior");

        // ESCUCHAMOS: Cuando la solapa termina su transición de cierre
        sup.addEventListener("transitionend", function alTerminarCierre(e) {
          if (e.propertyName === 'transform') {
            
            // 4. RECIÉN AQUÍ: El corazón vuelve a su estado original
            if (heart) {
                heart.classList.remove("bx-rotada");
            }

            // Limpiamos el evento para que no se acumule
            sup.removeEventListener("transitionend", alTerminarCierre);
          }
        }, { once: true });
      }
    }, { once: true });
  }
}

// set up container toggle behavior
const contenedor = document.querySelector("#AbrirContenedor");
if (contenedor) {
  contenedor.addEventListener("click", () => {
    const msg = document.querySelector(".mensaje");
    if (msg && msg.classList.contains("abrir-mensaje")) {
      cerrarCarta();
    } else {
      abrirCarta();
    }
  });
}
