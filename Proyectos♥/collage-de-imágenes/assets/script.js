// todo lo relacionado con el giro de las imagenes 
window.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.card'));
  // Map para guardar timeouts por tarjeta y limpiar si se vuelve a interactuar
  const flipTimers = new WeakMap();

  // Make every card independently flippable and "bring to front" when clicked/focused
  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // flip the clicked card
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', flipped);

      // bring this card to the front visually and remove the state from others
      cards.forEach((c) => c.classList.remove('in-front'));
      card.classList.add('in-front');

      // limpiar timeout previo (si existía)
      if (flipTimers.has(card)) {
        clearTimeout(flipTimers.get(card));
        flipTimers.delete(card);
      }

      // si la tarjeta quedó volteada (mostrando back), programar que vuelva en 5s
      if (flipped) {
        const t = setTimeout(() => {
          card.classList.remove('flipped');
          card.setAttribute('aria-pressed', false);
          flipTimers.delete(card);
        }, 5000);
        flipTimers.set(card, t);
      }
    });

    // keyboard support: Enter/Space toggles flip
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const flipped = card.classList.toggle('flipped');
        card.setAttribute('aria-pressed', flipped);
        cards.forEach((c) => c.classList.remove('in-front'));
        card.classList.add('in-front');

        // limpiar timeout previo (si existía)
        if (flipTimers.has(card)) {
          clearTimeout(flipTimers.get(card));
          flipTimers.delete(card);
        }

        // si la tarjeta quedó volteada (mostrando back), programar que vuelva en 5s
        if (flipped) {
          const t = setTimeout(() => {
            card.classList.remove('flipped');
            card.setAttribute('aria-pressed', false);
            flipTimers.delete(card);
          }, 5000);
          flipTimers.set(card, t);
        }
      }
    });
  });

  // Option: mark the first card as in-front initially
  if (cards.length) cards[0].classList.add('in-front');

});

/* particulas que simulas estrellas del espacio */
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        // Símbolos y mensajes

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
            
            // Efecto de estrellas pixeladas
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = Math.random() > 0.8 ? 2 : 1;
                ctx.fillRect(x, y, size, size);
            }
            requestAnimationFrame(animate);
        }
        animate()


// Generar corazones cayendo 
const snowContainer = document.getElementById("loveRain");
const hearts = ["♡", "♥", "♡", "★", "☆", "✧", "❀", "✿", "❁", "♡","ღ","❣","❤","<3","ထ","ౚ","ద"];
function createHeart() {
    const heart = document.createElement("span");
    let heart_emoji = hearts[Math.floor(Math.random() * hearts.length)];
    let size = Math.random() * 20 + 10; // tamaño de los corazones
    let posX = Math.random() * window.innerWidth;
    let duration = Math.random() * 5 + 5; 
    let delay = Math.random() * 5;
    let swayDistance = Math.random() * 100 - 50; // movimiento horizontal aleatorio

    heart.textContent = heart_emoji;
    heart.style.left = posX + "px";
    heart.style.animationDuration = duration + "s";
    heart.style.animationDelay = delay + "s";
    heart.style.fontSize = size + "px";

    snowContainer.appendChild(heart); 

    setTimeout(() => {
        heart.remove();
    }, (duration + delay) * 1000);
}
setInterval(createHeart, 20);
