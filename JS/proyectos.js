const proyectos = [
    {
        id: 1,
        titulo: "GALAXIA DE IMÁGENES",
        url: "./Proyectos♥/galaxia-de-fotos/galaxia-de-fotos.html",
        urlDedicar: "./dedicar/personalizar-galaxia.html",
        imagen: "./assets/img/imagen-1.webp",
        alt: "Galaxia de fotos interactiva con efectos",
        layout: "wide"
    },
    {
        id: 2,
        titulo: "RAMO DE FLORES",
        url: "./Proyectos♥/ramo-de-flores/index.html",
        urlDedicar: "en-proceso",
        imagen: "./assets/img/imagen-2.webp",
        alt: "Ramo de flores",
        layout: ""
    },
    {
        id: 3,
        titulo: "ZOOM DE GALAXIA",
        url: "./Proyectos♥/zoom-galaxia/index.html",
        urlDedicar: "en-proceso",
        imagen: "./assets/img/imagen-3.webp",
        alt: "Zoom galaxia interactiva",
        layout: "tall wide"
    },    
    {
        id: 4,
        titulo: "FELIZ CUMPLEAÑOS",
        url: "./Proyectos♥/happy-birthday/index.html",
        urlDedicar: "en-proceso",
        imagen: "./assets/img/imagen-4.webp",
        alt: "Feliz cumpleaños interactivo",
        layout: ""
    },
    {
        id: 5,
        titulo: "GALAXIA DE FRASES",
        url: "./Proyectos♥/galaxia-de-frases/index.html",
        urlDedicar: "en-proceso",
        imagen: "./assets/img/imagen-5.webp",
        alt: "Galaxia de frases con animaciones",
        layout: ""
    },
    {
        id: 6,
        titulo: "NUESTRO TIEMPO JUNTOS",
        url: "./Proyectos♥/nuestro-tiempo-juntos/index.html",
        urlDedicar: "en-proceso",
        imagen: "./assets/img/imagen-6.webp",
        alt: "Nuestro tiempo juntos interactivo",
        layout: ""
    }
];

// Función para mostrar el aviso de "En Proceso"
window.mostrarAvisoProceso = () => {
    Swal.fire({
        title: '¡Próximamente! 🚧',
        text: 'Estamos preparando esta experiencia mágica para ti. ¡Vuelve pronto! ✨',
        icon: 'info',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#ff4d6d',
        confirmButtonText: 'Entendido'
    });
};

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

    const html = proyectos.map(p => {
        // Lógica para determinar si el link es funcional o un aviso
        const linkVer = p.url === "en-proceso" ? "javascript:mostrarAvisoProceso()" : p.url;
        const targetVer = p.url === "en-proceso" ? "_self" : "_blank";
        
        const accionDedicar = p.urlDedicar === "en-proceso" 
            ? "mostrarAvisoProceso()" 
            : `window.location.href='${p.urlDedicar}'`;

        return `
            <div class="grid-item ${p.layout || ''}" role="article">
                <a href="${linkVer}" target="${targetVer}" rel="noopener noreferrer" class="proyecto-link-wrapper">
                    <div class="image-container">
                        <img src="${p.imagen}" alt="${p.alt}" class="proyecto-img" width="400" height="300">
                    </div>
                    <div class="text-content">
                        <h1 id="proyecto${p.id}-title">${p.titulo}</h1>
                    </div>
                </a>

                <div class="btn-icons">
                    <button class="btn-ver" type="button" 
                        onclick="${p.url === 'en-proceso' ? 'mostrarAvisoProceso()' : `window.open('${p.url}', '_blank')`}">
                        <i class="fas fa-eye"></i>
                        <span class="btn-text">Ver</span>
                    </button>

                    <button class="btn-dedicar" type="button" 
                        onclick="${accionDedicar}">
                        <i class="fas fa-heart"></i>
                        <span class="btn-text">Dedicar</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = html;

    // Verificación de carga de imágenes
    const imagenes = contenedor.querySelectorAll('.proyecto-img');
    let imagenesCargadas = 0;
    const totalImagenes = imagenes.length;

    const verificarCarga = () => {
        imagenesCargadas++;
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
        setTimeout(() => skeletonScreen.remove(), 500);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    skeletonLoading(); 
    cargarProyectos();  
});

// Respaldo de seguridad para el skeleton
window.addEventListener('load', () => {
    const skeletonScreen = document.getElementById('skeletonLoading');
    if (skeletonScreen && !skeletonScreen.classList.contains('hidden')) {
        ocultarSkeleton();
    }
});