let swiper = new Swiper(".mySwiper", {
    effect: "coverflow",
    grabCursor: true,
    centeredslides: true,
    slidesPerView: "auto",
    coverflowEffect: {
        rotate: 15,
        strech: 0,
        depth: 300,
        modifier: 1,
        slideShadows: true,
    },
    loop: true,
})
/* particulas que simulas estrellas del espacio */
        const canvas = document.getElementById('particulas');
        const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
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
