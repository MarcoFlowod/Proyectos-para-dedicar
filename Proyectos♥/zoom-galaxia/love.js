const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let w, h;

// Polyfill para roundRect (para navegadores antiguos)
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

// Animación y música solo después de apretar el botón
let animacionIniciada = false;
document.getElementById('btn-iniciar').onclick = iniciarAnimacionYMusica;

function iniciarAnimacionYMusica() {
    if (animacionIniciada) return;
    animacionIniciada = true;
    document.getElementById('modal-inicio').style.display = 'none';
    document.getElementById('bg-music').currentTime = 0;
    document.getElementById('bg-music').play();

    // Variables y arrays
    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    // frases románticas
    const PHRASES = [
        "Te amo", "Te quiero", "Eres mi vida", "Eres mi todo", 
        "Mi princesa", "Mi amor", "Eres especial",
        "Me encantas", "Te adoro ❤", "Fatásnica",
        "Preciosa", "Eres Perfecta", "Guapa", 
        "Hermosa", "Bella", "Divina", "Bonita", "Encantadora",
    ];

    const texts = [];
    const stars = [];
    const hearts = [];
    const explosions = [];
    
    // Estilos para imágenes (colores románticos)
    const imgStyles = [
        { borderColor: '#ff6b9d', shadowColor: 'rgba(255, 107, 157, 0.6)', name: 'rosa' },
        { borderColor: '#ff69b4', shadowColor: 'rgba(255, 105, 180, 0.6)', name: 'rosa fuerte' },
        { borderColor: '#ff9ac8', shadowColor: 'rgba(255, 154, 200, 0.6)', name: 'rosa claro' },
        { borderColor: '#69a3ff', shadowColor: 'rgba(105, 163, 255, 0.5)', name: 'azul' },
        { borderColor: '#d369ff', shadowColor: 'rgba(211, 105, 255, 0.5)', name: 'púrpura' },
        { borderColor: '#ffd369', shadowColor: 'rgba(255, 211, 105, 0.5)', name: 'dorado' }
    ];
    
    // Imágenes flotantes
    const imgUrls = [
        "../collage-de-imágenes/assets/img/img1.jpeg",
        "../collage-de-imágenes/assets/img/img2.jpeg",
        "../collage-de-imágenes/assets/img/img3.jpeg",
        "../collage-de-imágenes/assets/img/img4.jpeg",
        "../collage-de-imágenes/assets/img/img5.jpeg",
        "../collage-de-imágenes/assets/img/img6.jpeg",
        "../collage-de-imágenes/assets/img/img7.jpeg",
        "../collage-de-imágenes/assets/img/img8.jpeg",
        "../collage-de-imágenes/assets/img/img9.jpeg",
    ];
    
    const imgObjs = imgUrls.map(url => {
        const img = new window.Image();
        img.src = url;
        // Manejo de error para imágenes que no cargan
        img.onerror = function() {
            console.warn(`No se pudo cargar la imagen: ${url}`);
            // Crear una imagen de fallback (corazón)
            crearImagenFallback(img);
        };
        return img;
    });
    
    const imgDrops = [];
    
    // parámetros ajustados para CELULAR
    const MAX_ACTIVE_TEXTS = 7;
    const SPAWN_INTERVAL = 1500; // más rápido que antes (1.5 seg)
    let phraseIndex = 0;
    let offsetX = 0, offsetY = 0, zoom = 1;
    
    // Función para crear imagen de fallback (corazón)
    function crearImagenFallback(imgElement) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 200;
        tempCanvas.height = 260;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Fondo degradado romántico
        const gradient = tempCtx.createLinearGradient(0, 0, 200, 260);
        gradient.addColorStop(0, '#ff9a9e');
        gradient.addColorStop(1, '#fad0c4');
        tempCtx.fillStyle = gradient;
        tempCtx.fillRect(0, 0, 200, 260);
        
        // Dibujar corazón
        tempCtx.fillStyle = '#ff6b6b';
        tempCtx.beginPath();
        const centerX = 100, centerY = 130;
        // Corazón usando curvas Bezier
        tempCtx.moveTo(centerX, centerY - 40);
        tempCtx.bezierCurveTo(centerX, centerY - 60, centerX - 40, centerY - 60, centerX - 40, centerY - 20);
        tempCtx.bezierCurveTo(centerX - 40, centerY + 10, centerX, centerY + 40, centerX, centerY + 60);
        tempCtx.bezierCurveTo(centerX, centerY + 40, centerX + 40, centerY + 10, centerX + 40, centerY - 20);
        tempCtx.bezierCurveTo(centerX + 40, centerY - 60, centerX, centerY - 60, centerX, centerY - 40);
        tempCtx.closePath();
        tempCtx.fill();
        
        // Texto "❤️"
        tempCtx.font = 'bold 60px Arial';
        tempCtx.fillStyle = 'white';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText('❤️', 100, 130);
        
        imgElement.src = tempCanvas.toDataURL();
    }
    
    // FUNCIÓN PARA DIBUJAR IMÁGENES CON ESTILOS CSS-LIKE (OBJECT-FIT: COVER)
    function dibujarImagenConEstilos(ctx, img, x, y, width, height, estilos) {
        ctx.save();
        
        // Aplicar rotación si existe
        if (estilos.rotation) {
            ctx.translate(x + width/2, y + height/2);
            ctx.rotate(estilos.rotation);
            ctx.translate(-x - width/2, -y - height/2);
        }
        
        // Sombra
        if (estilos.shadow) {
            ctx.shadowColor = estilos.shadow.color;
            ctx.shadowBlur = estilos.shadow.blur;
            ctx.shadowOffsetX = estilos.shadow.offsetX || 0;
            ctx.shadowOffsetY = estilos.shadow.offsetY || 0;
        }
        
        // Fondo decorativo (marco exterior)
        if (estilos.marcoExterior) {
            ctx.fillStyle = estilos.marcoExterior.color;
            ctx.beginPath();
            ctx.roundRect(
                x - estilos.marcoExterior.margin,
                y - estilos.marcoExterior.margin,
                width + estilos.marcoExterior.margin * 2,
                height + estilos.marcoExterior.margin * 2,
                (estilos.borderRadius || 0) + estilos.marcoExterior.margin
            );
            ctx.fill();
        }
        
        // Bordes redondeados (clip)
        if (estilos.borderRadius) {
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, estilos.borderRadius);
            ctx.clip();
        }
        
        // Opacidad
        if (estilos.opacity !== undefined) {
            ctx.globalAlpha = estilos.opacity;
        }
        
        // Filtros (brightness, contrast, saturate, etc.)
        if (estilos.filter) {
            ctx.filter = estilos.filter;
        }
        
        // object-fit: cover - ¡LA FUNCIONALIDAD PRINCIPAL!
        if (estilos.objectFit === 'cover') {
            // Verificar que la imagen tenga dimensiones
            const imgWidth = img.naturalWidth || img.width || width;
            const imgHeight = img.naturalHeight || img.height || height;
            const imgRatio = imgWidth / imgHeight;
            const frameRatio = width / height;
            
            let sx, sy, sWidth, sHeight;
            
            if (imgRatio > frameRatio) {
                // Imagen más ancha que el marco -> recortar lados
                sHeight = imgHeight;
                sWidth = sHeight * frameRatio;
                sx = (imgWidth - sWidth) / 2;
                sy = 0;
            } else {
                // Imagen más alta que el marco -> recortar arriba/abajo
                sWidth = imgWidth;
                sHeight = sWidth / frameRatio;
                sx = 0;
                sy = (imgHeight - sHeight) / 2;
            }
            
            ctx.drawImage(
                img,
                sx, sy,           // Coordenadas de recorte (source)
                sWidth, sHeight,  // Tamaño de recorte (source)
                x, y,             // Coordenadas destino
                width, height     // Tamaño destino
            );
        } 
        // object-fit: contain (opcional)
        else if (estilos.objectFit === 'contain') {
            const imgWidth = img.naturalWidth || img.width || width;
            const imgHeight = img.naturalHeight || img.height || height;
            const imgRatio = imgWidth / imgHeight;
            const frameRatio = width / height;
            
            let destWidth, destHeight, destX, destY;
            
            if (imgRatio > frameRatio) {
                // Imagen más ancha -> ajustar al ancho
                destWidth = width;
                destHeight = width / imgRatio;
                destX = x;
                destY = y + (height - destHeight) / 2;
            } else {
                // Imagen más alta -> ajustar al alto
                destHeight = height;
                destWidth = height * imgRatio;
                destX = x + (width - destWidth) / 2;
                destY = y;
            }
            
            ctx.drawImage(
                img,
                0, 0, imgWidth, imgHeight,
                destX, destY, destWidth, destHeight
            );
        }
        // object-fit: fill (por defecto)
        else {
            ctx.drawImage(img, x, y, width, height);
        }
        
        // Borde
        if (estilos.border) {
            const borderParts = estilos.border.split(' ');
            const borderWidth = parseFloat(borderParts[0]) || 2;
            const borderColor = borderParts[2] || '#ffffff';
            
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            
            ctx.beginPath();
            if (estilos.borderRadius) {
                ctx.roundRect(x, y, width, height, estilos.borderRadius);
            } else {
                ctx.rect(x, y, width, height);
            }
            ctx.stroke();
        }
        
        // Efecto de brillo interior (si está activado)
        if (estilos.brilloInterior) {
            const tiempo = Date.now() * 0.001;
            const brillo = Math.sin(tiempo * 2 + x * 0.01) * 0.15 + 0.85;
            
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = `rgba(255, 255, 255, ${estilos.brilloInterior.intensidad * brillo})`;
            ctx.fillRect(x, y, width, height);
            ctx.globalCompositeOperation = 'source-over';
        }
        
        // Puntos decorativos en las esquinas (si está activado)
        if (estilos.puntosEsquinas) {
            ctx.fillStyle = estilos.puntosEsquinas.color;
            
            // Posiciones de las esquinas (ligeramente hacia dentro)
            const esquinas = [
                [x + estilos.puntosEsquinas.margin, y + estilos.puntosEsquinas.margin], // superior izquierda
                [x + width - estilos.puntosEsquinas.margin, y + estilos.puntosEsquinas.margin], // superior derecha
                [x + estilos.puntosEsquinas.margin, y + height - estilos.puntosEsquinas.margin], // inferior izquierda
                [x + width - estilos.puntosEsquinas.margin, y + height - estilos.puntosEsquinas.margin]  // inferior derecha
            ];
            
            esquinas.forEach(([px, py]) => {
                ctx.beginPath();
                ctx.arc(px, py, estilos.puntosEsquinas.radio, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        ctx.restore();
    }
    
    // función crear estrellas
    function createStar() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            z: Math.random() * 2000,
            speed: 1 + Math.random()
        };
    }

    // corazones
    function createHeart() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            z: Math.random() * 1600 + 400,
            speed: 1.5 + Math.random()
        };
    }

    // textos en orden
    function spawnTextInOrder(){
        if (texts.length >= MAX_ACTIVE_TEXTS) return;
        const phrase = PHRASES[phraseIndex % PHRASES.length];
        phraseIndex++;
        texts.push({
            text: phrase,
            x: Math.random() * w,
            y: Math.random() * h,
            z: Math.random() * 1600 + 300,
            speed: 1.8 + Math.random() * 1.2, // más rápido
            baseFont: (w < 600 ? 40 : 60),   // fuente clara en móvil
            glow: 25
        });
    }

    // imágenes flotantes CON ESTILOS
    function createImgDrop() {
        const estilo = imgStyles[Math.floor(Math.random() * imgStyles.length)];
        
        return {
            img: imgObjs[Math.floor(Math.random() * imgObjs.length)],
            x: Math.random() * w,
            y: Math.random() * h,
            z: Math.random() * 1600 + 400,
            speed: 1.2 + Math.random() * 0.8,
            width: (w < 600 ? 130 : 200),
            height: (w < 600 ? 170 : 260),
            estilo: estilo, // Estilo asignado
            rotation: (Math.random() - 0.5) * 0.03, // Rotación leve aleatoria
            tiempoFlotacion: Math.random() * Math.PI * 2 // Para animación de flotación
        };
    }

    // explosiones azules
    function createExplosion() {
        const particles = [];
        const centerX = Math.random() * w;
        const centerY = Math.random() * h;
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                decay: 0.02 + Math.random() * 0.01,
                size: 2 + Math.random() * 4
            });
        }
        
        return {
            particles: particles,
            age: 0,
            maxAge: 50
        };
    }

    // inicializar
    for (let i = 0; i < 400; i++) stars.push(createStar());
    for (let i = 0; i < 30; i++) hearts.push(createHeart());
    for (let i = 0; i < 6; i++) imgDrops.push(createImgDrop());

    // animación
    function animate() {
        ctx.clearRect(0, 0, w, h);

        // Crear array de todos los elementos con su profundidad z
        const allElements = [];

        // Agregar estrellas
        stars.forEach(s => {
            s.z -= s.speed;
            if (s.z <= 0) {
                s.x = Math.random() * w;
                s.y = Math.random() * h;
                s.z = 2000;
            }
            allElements.push({type: 'star', obj: s});
        });

        // Agregar textos
        texts.forEach((t, i) => {
            t.z -= t.speed;
            if (t.z <= 0) {
                texts.splice(i,1);
                return;
            }
            allElements.push({type: 'text', obj: t});
        });

        // Agregar corazones
        hearts.forEach(c => {
            c.z -= c.speed;
            if (c.z <= 0) {
                c.x = Math.random() * w;
                c.y = Math.random() * h;
                c.z = 2000;
            }
            allElements.push({type: 'heart', obj: c});
        });

        // Agregar imágenes CON ESTILOS Y ANIMACIÓN DE FLOTACIÓN
        imgDrops.forEach(imgDrop => {
            imgDrop.z -= imgDrop.speed;
            
            // Animación de flotación suave
            const tiempo = Date.now() * 0.001;
            imgDrop.tiempoFlotacion += 0.01;
            
            // Movimiento leve de flotación (como si estuvieran en el agua)
            imgDrop.x += Math.sin(imgDrop.tiempoFlotacion) * 0.2;
            imgDrop.y += Math.cos(imgDrop.tiempoFlotacion * 0.8) * 0.15;
            
            if (imgDrop.z <= 0) {
                imgDrop.x = Math.random() * w;
                imgDrop.y = Math.random() * h;
                imgDrop.z = 2000;
                imgDrop.img = imgObjs[Math.floor(Math.random() * imgObjs.length)];
                // Asignar nuevo estilo aleatorio
                imgDrop.estilo = imgStyles[Math.floor(Math.random() * imgStyles.length)];
            }
            allElements.push({type: 'image', obj: imgDrop});
        });

        // Actualizar explosiones
        explosions.forEach((explosion, i) => {
            explosion.age++;
            if (explosion.age > explosion.maxAge) {
                explosions.splice(i, 1);
                return;
            }
            
            explosion.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= particle.decay;
                particle.vx *= 0.98;
                particle.vy *= 0.98;
            });
            
            allElements.push({type: 'explosion', obj: explosion});
        });

        // Ordenar por profundidad z (mayor z = más atrás, menor z = más adelante)
        allElements.sort((a, b) => b.obj.z - a.obj.z);

        // Renderizar todos los elementos en orden de profundidad
        allElements.forEach(element => {
            const obj = element.obj;
            
            if (element.type === 'star') {
                const scale = 300 / obj.z * zoom;
                const x = (obj.x - w/2 + offsetX) * scale + w/2;
                const y = (obj.y - h/2 + offsetY) * scale + h/2;
                ctx.fillStyle = "white";
                ctx.fillRect(x, y, scale*1.5, scale*1.5);
            }
            
            else if (element.type === 'text') {
                const scale = 250 / obj.z * zoom;
                const x = (obj.x - w/2 + offsetX) * scale + w/2;
                const y = (obj.y - h/2 + offsetY) * scale + h/2;
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(scale, scale);
                ctx.font = `bold ${obj.baseFont}px Arial`;
                ctx.fillStyle = "white";
                ctx.shadowColor = "white";
                ctx.shadowBlur = obj.glow;
                ctx.textAlign = "center";
                ctx.fillText(obj.text, 0, 0);
                ctx.restore();
            }
            
            else if (element.type === 'heart') {
                const scale = 220 / obj.z * zoom;
                const x = (obj.x - w/2 + offsetX) * scale + w/2;
                const y = (obj.y - h/2 + offsetY) * scale + h/2;
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(scale*2, scale*2);
                ctx.font = "bold 28px Arial";
                ctx.fillStyle = "blue";
                ctx.shadowColor = "blue";
                ctx.shadowBlur = 20;
                ctx.textAlign = "center";
                ctx.fillText("❤", 0, 0);
                ctx.restore();
            }
            
            else if (element.type === 'image') {
                // ESCALA Y POSICIÓN
                const scale = 120 / obj.z * zoom;
                const x = (obj.x - w/2 + offsetX) * scale + w/2;
                const y = (obj.y - h/2 + offsetY) * scale + h/2;
                const ancho = obj.width * scale;
                const alto = obj.height * scale;
                
                // Calcular márgenes y radio basados en escala
                const margin = 6 * scale;
                const borderRadius = 12 * scale;
                const puntosMargin = 4 * scale;
                const puntosRadio = 1.5 * scale;
                
                // Configurar estilos CSS-like para la imagen
                const estilos = {
                    objectFit: 'cover',  // ¡OBJECT-FIT: COVER ACTIVADO!
                    borderRadius: borderRadius,
                    border: `${2.5 * scale}px solid ${obj.estilo.borderColor}`,
                    filter: 'brightness(1.05) saturate(1.1)',
                    opacity: 0.95,
                    rotation: obj.rotation,
                    shadow: {
                        color: obj.estilo.shadowColor,
                        blur: 25 * scale,
                        offsetX: 0,
                        offsetY: 5 * scale
                    },
                    marcoExterior: {
                        color: 'rgba(255, 255, 255, 0.08)',
                        margin: margin
                    },
                    brilloInterior: {
                        activado: true,
                        intensidad: 0.08
                    },
                    puntosEsquinas: {
                        activado: true,
                        color: obj.estilo.borderColor,
                        margin: puntosMargin,
                        radio: puntosRadio
                    }
                };
                
                // Usar la función de dibujo con estilos CSS-like
                dibujarImagenConEstilos(
                    ctx,
                    obj.img,
                    x - ancho/2,  // x
                    y - alto/2,   // y
                    ancho,        // width
                    alto,         // height
                    estilos       // estilos CSS-like
                );
            }
            
            else if (element.type === 'explosion') {
                ctx.save();
                obj.particles.forEach(particle => {
                    if (particle.life > 0) {
                        ctx.globalAlpha = particle.life;
                        ctx.fillStyle = "blue";
                        ctx.shadowColor = "blue";
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
                ctx.restore();
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
    setInterval(spawnTextInOrder, SPAWN_INTERVAL);
    
    // Crear explosiones cada 5 segundos
    setInterval(() => {
        explosions.push(createExplosion());
    }, 5000);

    // controles táctiles para mover
    let startX=0,startY=0;
    canvas.addEventListener("touchstart", e=>{
        const t=e.touches[0];
        startX=t.clientX;
        startY=t.clientY;
    });
    
    canvas.addEventListener("touchmove", e=>{
        e.preventDefault();
        const t=e.touches[0];
        offsetX += (t.clientX-startX)/3;
        offsetY += (t.clientY-startY)/3;
        startX=t.clientX;
        startY=t.clientY;
    }, { passive: false });

    // zoom con dos dedos
    let lastDist=0;
    canvas.addEventListener("touchmove", e=>{
        if(e.touches.length===2){
            const dx=e.touches[0].clientX-e.touches[1].clientX;
            const dy=e.touches[0].clientY-e.touches[1].clientY;
            const dist=Math.sqrt(dx*dx+dy*dy);
            if(lastDist){
                zoom *= dist/lastDist;
                zoom=Math.min(Math.max(0.5,zoom),3);
            }
            lastDist=dist;
        }
    });
    
    canvas.addEventListener("touchend", ()=> lastDist=0);
}