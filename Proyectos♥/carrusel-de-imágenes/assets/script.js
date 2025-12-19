let swiper = new Swiper(".mySwiper", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: {
        rotate: 15,
        stretch: 0,
        depth: 500,
        modifier: 1,
        slideShadows: true,
    },
    loop: true,
});

// Giro de las imágenes
window.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.querySelectorAll('.swiper-slide'));
    const flipTimers = new WeakMap();

    cards.forEach((card) => {
        // Función para manejar el flip
        const handleFlip = () => {
            const isFlipped = card.classList.toggle('flipped');
            
            // Actualizar estado accesible
            card.setAttribute('aria-pressed', isFlipped);
            
            // Quitar estado de otras tarjetas
            cards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('flipped');
                    otherCard.classList.remove('active');
                    otherCard.setAttribute('aria-pressed', false);
                    
                    // Limpiar timer de otras tarjetas
                    if (flipTimers.has(otherCard)) {
                        clearTimeout(flipTimers.get(otherCard));
                        flipTimers.delete(otherCard);
                    }
                }
            });
            
            // Marcar esta tarjeta como activa
            card.classList.add('active');
            
            // Limpiar timer anterior si existe
            if (flipTimers.has(card)) {
                clearTimeout(flipTimers.get(card));
                flipTimers.delete(card);
            }
            
            // Si se volteó, programar para que vuelva en 5 segundos
            if (isFlipped) {
                const timer = setTimeout(() => {
                    card.classList.remove('flipped');
                    card.classList.remove('active');
                    card.setAttribute('aria-pressed', false);
                    flipTimers.delete(card);
                }, 5000);
                
                flipTimers.set(card, timer);
            }
        };

        // Click para voltear
        card.addEventListener('click', (e) => {
            // Prevenir que Swiper maneje el clic
            e.stopPropagation();
            handleFlip();
        });

        // Teclado para voltear (accesibilidad)
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleFlip();
            }
        });
    });

    // Desactivar flip cuando se haga clic fuera o se interactúe con Swiper
    document.addEventListener('click', (e) => {
        // Si el clic no fue en una card
        if (!e.target.closest('.swiper-slide')) {
            cards.forEach(card => {
                card.classList.remove('flipped');
                card.classList.remove('active');
                card.setAttribute('aria-pressed', false);
                
                if (flipTimers.has(card)) {
                    clearTimeout(flipTimers.get(card));
                    flipTimers.delete(card);
                }
            });
        }
    });
    
    // También desactivar flip cuando se deslice el carrusel
    swiper.on('slideChange', () => {
        cards.forEach(card => {
            card.classList.remove('flipped');
            card.classList.remove('active');
            card.setAttribute('aria-pressed', false);
            
            if (flipTimers.has(card)) {
                clearTimeout(flipTimers.get(card));
                flipTimers.delete(card);
            }
        });
    });
});


// CORAZONES CAYENDO - VERSIÓN FUNCIONAL VERIFICADA
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de corazones cargado'); // Para depuración
    
    const canvas = document.getElementById('particulas');
    if (!canvas) {
        console.error('No se encontró el canvas con id "particulas"');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Configuración inicial del canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log('Canvas redimensionado:', canvas.width, 'x', canvas.height);
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Array para almacenar los corazones
    const hearts = [];
    
    // Colores románticos
    const colors = [
        '#FF6B9D', // Rosa
        '#FF416C', // Rosa intenso
        '#FF4B2B', // Naranja-rojo
        '#7B2FF7', // Púrpura
        '#00D4FF', // Azul claro
        '#FFEB3B'  // Amarillo
    ];
    
    // Función para crear un corazón
    function createHeart(x = null, y = null) {
        const heart = {
            x: x || Math.random() * canvas.width,
            y: y || -20, // Comienza arriba de la pantalla
            size: Math.random() * 15 + 10, // Tamaño entre 10 y 25
            speed: Math.random() * 2 + 1, // Velocidad entre 1 y 3
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            opacity: Math.random() * 0.7 + 0.3, // Opacidad entre 0.3 y 1
            swing: Math.random() * Math.PI * 2, // Para movimiento de lado a lado
            swingSpeed: Math.random() * 0.05 + 0.01,
            swingAmount: Math.random() * 2 + 0.5
        };
        hearts.push(heart);
    }
    
    // Función para dibujar un corazón
    function drawHeart(heart) {
        ctx.save();
        ctx.translate(heart.x, heart.y);
        ctx.rotate(heart.rotation);
        ctx.globalAlpha = heart.opacity;
        
        // Crear la forma del corazón
        ctx.beginPath();
        const topCurveHeight = heart.size * 0.3;
        
        // Punto de inicio
        ctx.moveTo(0, heart.size / 4);
        
        // Lado izquierdo del corazón
        ctx.bezierCurveTo(
            -heart.size / 2, -heart.size / 4,
            -heart.size / 2, heart.size - topCurveHeight,
            0, heart.size
        );
        
        // Lado derecho del corazón
        ctx.bezierCurveTo(
            heart.size / 2, heart.size - topCurveHeight,
            heart.size / 2, -heart.size / 4,
            0, heart.size / 4
        );
        
        ctx.closePath();
        
        // Relleno con gradiente
        const gradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, heart.size
        );
        gradient.addColorStop(0, heart.color);
        gradient.addColorStop(1, darkenColor(heart.color, 40));
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Borde brillante
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.stroke();
        
        // Destello interno
        ctx.beginPath();
        ctx.arc(-heart.size * 0.2, -heart.size * 0.1, heart.size * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        ctx.restore();
    }
    
    // Función para oscurecer un color
    function darkenColor(color, amount) {
        let usePound = false;
        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }
        
        const num = parseInt(color, 16);
        let r = (num >> 16) - amount;
        let g = ((num >> 8) & 0x00FF) - amount;
        let b = (num & 0x0000FF) - amount;
        
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        
        return (usePound ? "#" : "") + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
    }
    
    // Función para actualizar la posición de los corazones
    function updateHearts() {
        for (let i = hearts.length - 1; i >= 0; i--) {
            const heart = hearts[i];
            
            // Movimiento vertical
            heart.y += heart.speed;
            
            // Movimiento de lado a lado (swing)
            heart.swing += heart.swingSpeed;
            heart.x += Math.sin(heart.swing) * heart.swingAmount;
            
            // Rotación
            heart.rotation += heart.rotationSpeed;
            
            // Parpadeo suave en la opacidad
            heart.opacity = 0.3 + Math.abs(Math.sin(Date.now() * 0.001 + i)) * 0.4;
            
            // Eliminar corazones que salen de la pantalla
            if (heart.y > canvas.height + 50) {
                hearts.splice(i, 1);
            }
        }
    }
    
    // Función para limpiar el canvas con un fade sutil
    function clearCanvas() {
        ctx.fillStyle = 'rgba(10, 10, 42, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Función de animación principal
    function animate() {
        clearCanvas();
        updateHearts();
        
        // Dibujar todos los corazones
        hearts.forEach(heart => {
            drawHeart(heart);
        });
        
        // Crear nuevos corazones ocasionalmente
        if (Math.random() < 0.03) { // 3% de probabilidad cada frame
            createHeart();
        }
        
        requestAnimationFrame(animate);
    }
    
    // Crear corazones iniciales
    function createInitialHearts() {
        for (let i = 0; i < 25; i++) {
            // Crear corazones escalonados en el tiempo
            setTimeout(() => {
                createHeart();
            }, i * 200); // Un corazón cada 200ms
        }
    }
    
    // Interactividad: crear corazones al hacer clic
    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Crear un grupo de corazones en el punto del clic
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                createHeart(x, y);
            }, i * 100);
        }
    });
    
    // Interactividad: seguir el mouse
    let mouseX = 0;
    let mouseY = 0;
    
    canvas.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
        
        // Ocasionalmente crear corazones al mover el mouse
        if (Math.random() < 0.02) {
            createHeart(mouseX, mouseY);
        }
    });
    
    // Iniciar todo
    createInitialHearts();
    animate();
    
    console.log('Animación de corazones iniciada');
    
    // Depuración: mostrar número de corazones en consola
    setInterval(() => {
        console.log('Corazones activos:', hearts.length);
    }, 5000);
});
