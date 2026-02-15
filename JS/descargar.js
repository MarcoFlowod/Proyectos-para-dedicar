(function() {
'use strict';

// ========== CONFIGURACIÓN ==========
const CONFIG = {
    debug: false,
    swipeThreshold: 50,
    animationDuration: 200,
    maxImageRetries: 2,
    imagePlaceholder: './assets/img/placeholder.jpg'
};

// ========== ESTADO DE LA APLICACIÓN ==========
const state = {
    currentPreviewIndex: 0,
    isModalOpen: false,
    projects: [],
    touchStartX: 0,
    imageCache: new Map()
};

// ========== REFERENCIAS DOM ==========
const elements = {};

// ========== UTILIDADES ==========

function debugLog(...args) {
    if (CONFIG.debug) console.log('[Portafolio]', ...args);
}

function announceToScreenReader(message) {
    const liveRegion = document.getElementById('aria-live-updates');
    if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => { liveRegion.textContent = ''; }, 2000);
    }
}

function ensureAriaLiveRegion() {
    if (!document.getElementById('aria-live-updates')) {
        const region = document.createElement('div');
        region.id = 'aria-live-updates';
        region.setAttribute('aria-live', 'polite');
        region.className = 'sr-only';
        document.body.appendChild(region);
    }
}

// ========== FUNCIONES PRINCIPALES ==========

function cacheDOMElements() {
    const ids = [
        'downloadModal', 'openModalBtn', 'closeModalBtn',
        'prevPreview', 'nextPreview', 'previewImage',
        'previewTitle', 'previewDownloadBtn'
    ];
    ids.forEach(id => elements[id] = document.getElementById(id));
    
    elements.previewCounter = document.querySelector('.preview-counter');
    elements.previewTags = document.querySelector('.preview-tags');
}

function loadProjectsData() {
    state.projects = [
      {
        img: './assets/img/imagen-1.webp',
        title: 'RAMO DE TULIPANES ROSADOS',
        tags: ['Romántico', 'HTML/CSS'],
        link: './Proyectos♥/ramo-de-tulipanes-rosados/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/tulipanes-rosados/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-2.webp',
        title: 'COLECCIÓN DE IMÁGENES',
        tags: ['En Proceso'],
        link: './Proyectos♥/coleción-de-imágenes/index.html',
        githubDownload: '',
        status: 'en-proceso'
      },
      {
        img: './assets/img/imagen-3.webp',
        title: 'ZOOM DE GALAXIA',
        tags: ['En Proceso'],
        link: './Proyectos♥/zoom-galaxia/index.html',
        githubDownload: '',
        status: 'en-proceso'
      },
      {
        img: './assets/img/imagen-4.webp',
        title: 'GALAXIA DE FOTOS',
        tags: ['Romántico', 'Interactivo'],
        link: './Proyectos♥/galaxia-de-fotos/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/galeria-de-fotos/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-5.webp',
        title: 'FELIZ CUMPLEAÑOS',
        tags: ['Celebración', 'Animado'],
        link: './Proyectos♥/feliz-cumpleaños/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/happy-birthday/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-6.webp',
        title: 'CARTA DE AMOR',
        tags: ['Romántico', 'Carta'],
        link: './Proyectos♥/carta-para-dedicar/index.html',
        githubDownload: '',
        status: 'en-proceso'
      },
      {
        img: './assets/img/imagen-7.webp',
        title: 'GALAXIA DE FRASES',
        tags: ['En Proceso',/* 'Frases', 'Inspirador' */],
        link: './Proyectos♥/galxia-de-frases/index.html',
        githubDownload: '',
        status: 'en-proceso'
      },
      {
        img: './assets/img/imagen-8.webp',
        title: 'NUESTRO TIEMPO JUNTOS',
        tags: ['En Proceso',/* 'Romántico', 'Memorias' */],
        link: './Proyectos♥/nuestro-tiempo-juntos/index.html',
        githubDownload: '',
        status: 'en-proceso'
      }
    ];
}

function updatePreview() {
    const project = state.projects[state.currentPreviewIndex];
    if (!project) return;

    if (elements.previewImage) {
        elements.previewImage.style.opacity = '0.5';
        setTimeout(() => {
            elements.previewImage.src = project.img;
            elements.previewImage.alt = project.title;
            elements.previewImage.style.opacity = '1';
        }, CONFIG.animationDuration);
    }

    if (elements.previewTitle) elements.previewTitle.textContent = project.title;
    if (elements.previewCounter) elements.previewCounter.textContent = `${state.currentPreviewIndex + 1}/${state.projects.length}`;
    if (elements.previewTags) elements.previewTags.innerHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
    
    updateDownloadButton(project);
    updateNavigationButtons();
    announceToScreenReader(`Proyecto: ${project.title}`);
}

function updateDownloadButton(project) {
    const btn = elements.previewDownloadBtn;
    if (!btn) return;

    // Limpiamos atributos de enlace previos para evitar que se vea la URL
    btn.removeAttribute('href');
    btn.removeAttribute('download');

    if (project.status === 'en-proceso') {
        btn.onclick = null;
        btn.style.cursor = 'default';
        btn.innerHTML = '<i class="fas fa-clock"></i> En Proceso';
        btn.className = 'preview-link en-proceso';
        btn.setAttribute('aria-disabled', 'true');
    } else {
        // Usamos onclick para disparar la descarga sin mostrar el enlace en la barra de estado
        btn.onclick = () => { window.location.href = project.githubDownload; };
        btn.style.cursor = 'pointer';
        btn.innerHTML = '<i class="fas fa-download"></i> Descargar ZIP';
        btn.className = 'preview-link descargable';
        btn.removeAttribute('aria-disabled');
    }
}

function updateNavigationButtons() {
    if (elements.prevPreview) elements.prevPreview.disabled = state.currentPreviewIndex === 0;
    if (elements.nextPreview) elements.nextPreview.disabled = state.currentPreviewIndex === state.projects.length - 1;
}

function navigateToProject(direction) {
    const newIndex = state.currentPreviewIndex + direction;
    if (newIndex >= 0 && newIndex < state.projects.length) {
        state.currentPreviewIndex = newIndex;
        updatePreview();
    }
}

function openModal() {
    state.isModalOpen = true;
    if (elements.downloadModal) {
        elements.downloadModal.hidden = false;
        elements.downloadModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    state.currentPreviewIndex = 0;
    updatePreview();
}

function closeModal() {
    state.isModalOpen = false;
    if (elements.downloadModal) {
        elements.downloadModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        setTimeout(() => { elements.downloadModal.hidden = true; }, 300);
    }
}

function setupEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('#openModalBtn')) {
            e.preventDefault();
            openModal();
        } else if (e.target.closest('#closeModalBtn') || (state.isModalOpen && e.target === elements.downloadModal)) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!state.isModalOpen) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') navigateToProject(-1);
        if (e.key === 'ArrowRight') navigateToProject(1);
    });

    if (elements.prevPreview) elements.prevPreview.onclick = () => navigateToProject(-1);
    if (elements.nextPreview) elements.nextPreview.onclick = () => navigateToProject(1);
}

// ========== INICIALIZACIÓN ==========

function init() {
    ensureAriaLiveRegion();
    cacheDOMElements();
    loadProjectsData();
    setupEventListeners();
    debugLog('Inicializado correctamente.');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();