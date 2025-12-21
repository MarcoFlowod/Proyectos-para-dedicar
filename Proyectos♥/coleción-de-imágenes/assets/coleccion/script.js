document.addEventListener('DOMContentLoaded', () => {
    const collageContainer = document.getElementById('collage-container');// Contenedor del collage
    const modal = document.getElementById('modal');// Modal para mostrar la imagen ampliada
    const modalImage = document.getElementById('modal-image');// Imagen dentro del modal
    const modalText = document.getElementById('modal-text');// Texto descriptivo dentro del modal
    const modalTitle = document.getElementById('modal-title');// Título dentro del modal (h2)
    const closeButton = document.querySelector('.close-button');// Botón para cerrar el modal
    const flipCard = document.getElementById('flip-card');
    const flipCardInner = document.getElementById('flip-card-inner');
//pausa la animacion moveCrazy cluando se abre una imagen (modal)
    let isPausedAll = false;
// Adjuntar controladores de eventos a los elementos del collage
    function attachCollageHandlers() {
        const collageItems = collageContainer.querySelectorAll('.collage-item');
        collageItems.forEach(item => {
            const img = item.querySelector('img');
            if (!img) return;
        
        // Haga clic en el controlador para abrir animaciones modales y pausar
            item.addEventListener('click', () => {
                document.querySelectorAll('.collage-item').forEach(el => el.classList.add('paused'));
                isPausedAll = true;
                modal.style.display = 'block';
                modalImage.src = img.src;
                modalText.textContent = img.dataset.text || img.alt || '';
                modalTitle.textContent = img.dataset.title || img.dataset.text || img.alt || '';
                // Reset flip state whenever user opens a new image
                if (flipCard) flipCard.classList.remove('is-flipped');
                if (flipCard) flipCard.focus();
            });
        // Controlador de teclado para accesibilidad
            item.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                    event.preventDefault();
                    document.querySelectorAll('.collage-item').forEach(el => el.classList.add('paused'));
                    isPausedAll = true;
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
// Cerrar el modal y reanudar las animaciones
    closeButton.addEventListener('click', (e) => {
        // prevent the click from bubbling to the flip card which toggles flip
        e.stopPropagation();
        modal.style.display = 'none';
        if (modalTitle) modalTitle.textContent = '';
        if (flipCard) flipCard.classList.remove('is-flipped');
        if (flipCardInner) flipCardInner.style.height = '';
        if (flipCard) { flipCard.style.width = ''; flipCard.style.height = ''; }
        if (isPausedAll) {
            document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('paused'));
            isPausedAll = false;
        }
    });
    // keyboard support to close with Enter/Space when focused on close button
    closeButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            e.stopPropagation();
            modal.style.display = 'none';
            if (modalTitle) modalTitle.textContent = '';
            if (flipCard) flipCard.classList.remove('is-flipped');
            if (flipCardInner) flipCardInner.style.height = '';
            if (isPausedAll) {
                document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('paused'));
                isPausedAll = false;
            }
        }
    });
// Cerrar el modal al hacer clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (modalTitle) modalTitle.textContent = '';
            if (flipCard) flipCard.classList.remove('is-flipped');
            if (flipCardInner) flipCardInner.style.height = '';
            if (flipCard) { flipCard.style.width = ''; flipCard.style.height = ''; }
            if (isPausedAll) {
                document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('paused'));
                isPausedAll = false;
            }
        }
    });

    // Toggle flip when clicking the flip-card itself
    if (flipCard) {
        flipCard.addEventListener('click', (e) => {
            // Toggle the flip class and prevent the click from bubbling (no closing modal)
            flipCard.classList.toggle('is-flipped');
            e.stopPropagation();
        });
        // Allow keyboard activation to flip
        flipCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                flipCard.classList.toggle('is-flipped');
            }
            // Close on Escape
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                if (isPausedAll) {
                    document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('paused'));
                    isPausedAll = false;
                }
                flipCard.classList.remove('is-flipped');
            }
        });
    }

    // Close modal on Escape key from anywhere
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            if (modalTitle) modalTitle.textContent = '';
            if (flipCard) flipCard.classList.remove('is-flipped');
            if (flipCardInner) flipCardInner.style.height = '';
            if (flipCard) { flipCard.style.width = ''; flipCard.style.height = ''; }
            if (isPausedAll) {
                document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('paused'));
                isPausedAll = false;
            }
        }
    });

    // Ensure flip-card-inner matches the visible image size so back side covers the same area
    function adjustFlipCardSize() {
        if (!modalImage || !flipCard || !flipCardInner) return;
        const rect = modalImage.getBoundingClientRect();
        // apply explicit width/height to the flip-card container and inner wrapper
        flipCard.style.width = rect.width + 'px';
        flipCard.style.height = rect.height + 'px';
        flipCardInner.style.width = rect.width + 'px';
        flipCardInner.style.height = rect.height + 'px';
    }
    if (modalImage) {
        modalImage.addEventListener('load', adjustFlipCardSize);
    }
    // Re-calc on resize while modal is open
    window.addEventListener('resize', () => {
        if (modal.style.display === 'block') adjustFlipCardSize();
    });
// Inicializar los controladores
    attachCollageHandlers();
});


/* particulas que simulas estrellas del espacio */
        const canvas = document.getElementById('loveRain');
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
const rainContainer = document.getElementById("rain");
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

    rainContainer.appendChild(heart); 
// Agregar el corazón al contenedor
    setTimeout(() => {
        heart.remove();
    }, (duration + delay) * 1000);
}
setInterval(createHeart, 20);// frecuencia en que se crean los corazones
