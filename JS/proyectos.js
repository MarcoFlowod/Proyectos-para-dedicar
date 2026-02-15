const proyectos = [
    {
        id: 1,
        titulo: "RAMO DE TULIPANES ROSADOS",
        url: "./Proyectos♥/ramo-de-tulipanes-rosados/index.html",
        urlDedicar: "./dedicar/personalizar-ramo.html",
        imagen: "./assets/img/imagen-1.webp",
        alt: "Ramo de tulipanes rosados interactivo con animaciones CSS",
        layout: ""
    },
    {
        id: 2,
        titulo: "CARTA PARA DEDICAR",
        url: "./Proyectos♥/carta/index.html",
        urlDedicar: "./dedicar/personalizar-coleccion.html",
        imagen: "./assets/img/imagen-2.webp",
        alt: "Dedica carta",
        layout: "wide"
    },
    {
        id: 3,
        titulo: "ZOOM DE GALAXIA",
        url: "./Proyectos♥/zoom-galaxia/index.html",
        urlDedicar: "./dedicar/personalizar-zoom.html",
        imagen: "./assets/img/imagen-3.webp",
        alt: "Zoom galaxia interactiva con efectos visuales",
        layout: "tall"
    },    
    {
        id: 4,
        titulo: "GALAXIA DE IMÁGENES",
        url: "./Proyectos♥/galaxia-de-fotos/galaxia-de-fotos.html",
        urlDedicar: "./dedicar/personalizar-galaxia.html",
        imagen: "./assets/img/imagen-4.webp",
        alt: "Galacia de fotos interactiva con efectos flip y zoom",
        layout: "wide tall"
    },    
    {
        id: 5,
        titulo: "FELIZ CUMPLEAÑOS",
        url: "./Proyectos♥/happy-birthday/index.html",
        urlDedicar: "./dedicar/personalizar-cumple.html",
        imagen: "./assets/img/imagen-5.webp",
        alt: "Feliz cumpleaños interactivo con efectos visuales y animaciones",
        layout: "wide"
    },
    {
        id: 6,
        titulo: "GALAXIA DE FRASES",
        url: "./Proyectos♥/galxia-de-frases/index.html",
        urlDedicar: "./dedicar/personalizar-galaxia-frases.html",
        imagen: "./assets/img/imagen-7.webp",
        alt: "Galaxia de frases con animaciones",
        layout: ""
    },
    {
        id: 7,
        titulo: "NUESTRO TIEMPO JUNTOS",
        url: "./Proyectos♥/nuestro-tiempo-juntos/index.html",
        urlDedicar: "./dedicar/personalizar-tiempo-juntos.html",
        imagen: "./assets/img/imagen-8.webp",
        alt: "Nuestro tiempo juntos con animaciones y efectos visuales",
        layout: ""
    },
];
// Función para mostrar el skeleton de carga
function skeletonLoading() {
    const skeletonGrid = document.querySelector('.skeleton-grid');
    if (!skeletonGrid || !proyectos) return;

    const html = proyectos.map(p => `
        <div class="skeleton-card ${p.layout || ''}"></div> 
    `).join('');
    
    skeletonGrid.innerHTML = html;
}
// Función para cargar los proyectos dinámicamente
function cargarProyectos() {
    const contenedor = document.querySelector('.proyectos-container');
    if (!contenedor) return;

    const html = proyectos.map(p => `
        <div class="grid-item ${p.layout || ''}" role="article">
            <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="proyecto-link-wrapper">
                <div class="image-container">
                    <img src="${p.imagen}" alt="${p.alt}" class="proyecto-img" width="400" height="300">
                </div>
                <div class="text-content">
                    <h1 id="proyecto${p.id}-title">${p.titulo}</h1>
                </div>
            </a>

            <div class="btn-icons">
                <button class="btn-ver" type="button" 
                    onclick="window.open('${p.url}', '_blank');">
                    <i class="fas fa-eye"></i>
                    <span class="btn-text">Ver</span>
                </button>

                <button class="btn-dedicar" type="button" 
                    onclick="window.location.href='${p.urlDedicar || '#'}';">
                    <i class="fas fa-heart"></i>
                    <span class="btn-text">Dedicar</span>
                </button>
            </div>
        </div>
    `).join('');

    contenedor.innerHTML = html;
// Después de insertar el HTML, verificamos la carga de las imágenes
    const imagenes = contenedor.querySelectorAll('.proyecto-img');
    let imagenesCargadas = 0;
    const totalImagenes = imagenes.length;

    const verificarCarga = () => {
        imagenesCargadas++;
        // Si ya cargaron todas, ocultamos el skeleton
        if (imagenesCargadas >= totalImagenes) {
            ocultarSkeleton();
        }
    };

    if (totalImagenes === 0) {
        ocultarSkeleton();
    } else {
        imagenes.forEach(img => {
            if (img.complete) {
                verificarCarga();
            } else {
                img.addEventListener('load', verificarCarga);
                img.addEventListener('error', verificarCarga); 
            }
        });
    }
}

function ocultarSkeleton() {
    const skeletonScreen = document.getElementById('skeletonLoading');
    if (skeletonScreen) {
        skeletonScreen.classList.add('hidden');
        // Opcional: eliminarlo del DOM tras la transición para mejorar rendimiento
        setTimeout(() => skeletonScreen.remove(), 500);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    skeletonLoading(); 
    cargarProyectos();  
});

// Respaldo de seguridad: Si por alguna razón las imágenes tardan demasiado (ej. internet muy lento)
// ocultamos el skeleton al terminar de cargar la ventana completa.
window.addEventListener('load', () => {
    const skeletonScreen = document.getElementById('skeletonLoading');
    if (skeletonScreen && !skeletonScreen.classList.contains('hidden')) {
        ocultarSkeleton();
    }
});