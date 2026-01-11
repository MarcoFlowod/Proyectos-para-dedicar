(function() {
'use strict';

// ========== CONFIGURACIÓN ==========
const CONFIG = {
    debug: false,                    // Cambiar a false en producción
    skeletonTimeout: 5000,           // Timeout máximo para skeleton
    swipeThreshold: 50,              // Sensibilidad de swipe
    animationDuration: 200,          // Duración de animaciones
    maxImageRetries: 2,              // Reintentos de carga de imágenes
    projectDataAttribute: 'data-projects', // Atributo para datos (opcional)
    imagePlaceholder: './assets/img/placeholder.jpg'
};

// ========== ESTADO DE LA APLICACIÓN ==========
const state = {
    currentPreviewIndex: 0,
    isModalOpen: false,
    imagesLoaded: 0,
    totalImages: 0,
    projects: [],
    touchStartX: 0,
    touchEndX: 0,
    swipeStartTime: 0,
    isLoading: false,
    imageCache: new Map()
};

// ========== REFERENCIAS A ELEMENTOS DOM ==========
const elements = {};

// ========== FUNCIONES DE UTILIDAD ==========

/**
 * Log condicional para desarrollo
 */
function debugLog(...args) {
    if (CONFIG.debug) {
        console.log('[Portafolio]', ...args);
    }
}

/**
 * Muestra un mensaje en la región ARIA live
 */
function announceToScreenReader(message, priority = 'polite') {
    const liveRegion = document.getElementById('aria-live-updates');
    if (liveRegion) {
        liveRegion.setAttribute('aria-live', priority);
        liveRegion.textContent = message;
        
        // Limpiar después de un tiempo para anuncios nuevos
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 2000);
    }
}

/**
 * Crea una región ARIA live si no existe
 */
function ensureAriaLiveRegion() {
    if (!document.getElementById('aria-live-updates')) {
        const region = document.createElement('div');
        region.id = 'aria-live-updates';
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only';
        document.body.appendChild(region);
    }
}

/**
 * Debounce para optimizar eventos
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Carga una imagen con caché y reintentos
 */
async function loadImageWithCache(url) {
    // Si ya está en caché, devolverla
    if (state.imageCache.has(url)) {
        debugLog(`Imagen desde caché: ${url}`);
        return state.imageCache.get(url);
    }
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        let retries = 0;
        
        const loadImage = () => {
            img.src = url;
            
            img.onload = () => {
                state.imageCache.set(url, img);
                resolve(img);
            };
            
            img.onerror = () => {
                retries++;
                if (retries <= CONFIG.maxImageRetries) {
                    debugLog(`Reintento ${retries} para: ${url}`);
                    setTimeout(loadImage, 1000 * retries);
                } else {
                    debugLog(`Error cargando imagen: ${url}`);
                    // Usar placeholder si hay error
                    img.src = CONFIG.imagePlaceholder;
                    state.imageCache.set(url, img);
                    resolve(img);
                }
            };
        };
        
        loadImage();
    });
}

// ========== FUNCIONES PRINCIPALES ==========

/**
 * Cachea elementos DOM importantes
 */
function cacheDOMElements() {
    const elementIds = [
        'skeletonLoading',
        'downloadModal',
        'openModalBtn',
        'closeModalBtn',
        'prevPreview',
        'nextPreview',
        'previewImage',
        'previewTitle',
        'previewDownloadBtn'
    ];
    
    elementIds.forEach(id => {
        elements[id] = document.getElementById(id);
    });
    
    elements.previewCounter = document.querySelector('.preview-counter');
    elements.previewTags = document.querySelector('.preview-tags');
    elements.mainContent = document.querySelector('main');
    
    debugLog('Elementos DOM cacheados');
}

/**
 * Carga los datos de los proyectos
 */
function loadProjectsData() {
    // Mantenemos tu array original pero lo mejoramos
    state.projects = [
      {
        img: './assets/img/imagen-1.png',
        title: 'RAMO DE TULIPANES ROSADOS',
        tags: ['Romántico', 'HTML/CSS', 'Responsive'],
        link: './Proyectos♥/ramo-de-tulipanes-rosados/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-2.png',
        title: 'CARRUSEL DE IMÁGENES',
        tags: ['Interactivo', 'JavaScript', 'Responsive'],
        link: './Proyectos♥/carrusel-de-imágenes/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-3.png',
        title: 'COLECCIÓN DE IMÁGENES',
        tags: ['Interactivo', 'Animaciones', 'Flip Effect'],
        link: './Proyectos♥/coleción-de-imágenes/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-4.png',
        title: 'COLLAGE INTERACTIVO',
        tags: ['En Proceso'],
        link: './Proyectos♥/collage-de-imágenes/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'en-proceso'
      },
      {
        img: './assets/img/imagen-5.png',
        title: 'ZOOM DE GALAXIA',
        tags: ['En Proceso'],
        link: './Proyectos♥/zoom-galaxia/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'en-proceso'
      },
      {
        img: './assets/img/imagen-6.png',
        title: 'GALAXIA DE FOTOS',
        tags: ['En Proceso'],
        link: './Proyectos♥/galaxia-de-fotos/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'en-proceso'
      },
      {
        img: './assets/img/imagen-7.png',
        title: 'FELIZ CUMPLEAÑOS',
        tags: ['Celebración', 'HTML/CSS', 'Animado'],
        link: './Proyectos♥/feliz-cumpleaños/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-8.png',
        title: 'CARTA DE AMOR',
        tags: ['Romántico', 'Carta', 'Elegante'],
        link: './Proyectos♥/carta-para-dedicar/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-9.png',
        title: 'GALAXIA DE FRASES',
        tags: ['Frases', 'Galaxia', 'Inspirador'],
        link: './Proyectos♥/galxia-de-frases/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-10.png',
        title: 'NUESTRO TIEMPO JUNTOS',
        tags: ['Romántico', 'Tiempo', 'Memorias'],
        link: './Proyectos♥/nuestro-tiempo-juntos/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-11.png',
        title: 'PROPUESTA ♡',
        tags: ['Romántico', 'Propuesta', 'Especial'],
        link: './Proyectos♥/Popuesta◑﹏◐/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'completado'
      },
      {
        img: './assets/img/imagen-12.png',
        title: 'CORAZÓN NEGRO',
        tags: ['En Proceso'],
        link: './Proyectos♥/corazón-negro/index.html',
        githubDownload: 'https://github.com/MarcoFlowod/Proyectos-para-dedicar/archive/refs/heads/main.zip',
        status: 'en-proceso'
      }
    ];
    
    state.totalImages = state.projects.length;
    debugLog(`Datos de proyectos cargados: ${state.totalImages} proyectos`);
}

/**
 * Pre-carga todas las imágenes de forma optimizada
 */
async function preloadImages() {
    if (state.totalImages === 0) {
        debugLog('No hay imágenes para pre-cargar');
        return;
    }
    
    debugLog(`Iniciando pre-carga de ${state.totalImages} imágenes...`);
    
    try {
        const loadPromises = state.projects.map(async (project, index) => {
            try {
                await loadImageWithCache(project.img);
                state.imagesLoaded++;
                
                // Reportar progreso cada 25%
                if (state.imagesLoaded % Math.ceil(state.totalImages / 4) === 0 || 
                    state.imagesLoaded === state.totalImages) {
                    const progress = Math.round((state.imagesLoaded / state.totalImages) * 100);
                    debugLog(`Progreso de carga: ${progress}%`);
                }
            } catch (error) {
                debugLog(`Error cargando imagen ${index}:`, error);
                state.imagesLoaded++; // Contar como cargada aunque falle
            }
        });
        
        await Promise.allSettled(loadPromises);
        debugLog('Pre-carga de imágenes completada');
        
    } catch (error) {
        debugLog('Error en pre-carga:', error);
    }
}

/**
 * Oculta el skeleton loading
 */
function hideSkeleton() {
    if (elements.skeletonLoading && !elements.skeletonLoading.classList.contains('hidden')) {
        elements.skeletonLoading.classList.add('hidden');
        
        announceToScreenReader('Contenido cargado correctamente');
        
        // Eliminar del DOM después de la animación
        setTimeout(() => {
            if (elements.skeletonLoading && elements.skeletonLoading.parentNode) {
                elements.skeletonLoading.parentNode.removeChild(elements.skeletonLoading);
                debugLog('Skeleton eliminado del DOM');
            }
        }, 500);
    }
}

/**
 * Fuerza la ocultación del skeleton después de timeout
 */
function setupSkeletonTimeout() {
    setTimeout(() => {
        if (elements.skeletonLoading && !elements.skeletonLoading.classList.contains('hidden')) {
            debugLog('Timeout: Forzando ocultación del skeleton');
            hideSkeleton();
        }
    }, CONFIG.skeletonTimeout);
}

/**
 * Actualiza la vista previa del modal
 */
function updatePreview() {
    // Validaciones
    if (!state.projects || state.projects.length === 0) {
        debugLog('Error: No hay proyectos para mostrar');
        return;
    }
    
    // Asegurar que el índice esté en rango
    if (state.currentPreviewIndex < 0) state.currentPreviewIndex = 0;
    if (state.currentPreviewIndex >= state.projects.length) {
        state.currentPreviewIndex = state.projects.length - 1;
    }
    
    const project = state.projects[state.currentPreviewIndex];
    if (!project) return;
    
    try {
        // Animación de transición
        if (elements.previewImage) {
            elements.previewImage.style.transition = `opacity ${CONFIG.animationDuration}ms ease`;
            elements.previewImage.style.opacity = '0.5';
        }
        
        setTimeout(() => {
            // Actualizar imagen
            if (elements.previewImage) {
                elements.previewImage.src = project.img;
                elements.previewImage.alt = project.description || project.title;
                elements.previewImage.title = `Ver proyecto: ${project.title}`;
                
                // Manejar error de imagen
                elements.previewImage.onerror = function() {
                    this.src = CONFIG.imagePlaceholder;
                    this.alt = 'Imagen no disponible - ' + project.title;
                };
            }
            
            // Actualizar título
            if (elements.previewTitle) {
                elements.previewTitle.textContent = project.title;
                elements.previewTitle.setAttribute('aria-label', `Proyecto: ${project.title}`);
            }
            
            // Actualizar contador
            if (elements.previewCounter) {
                elements.previewCounter.textContent = `${state.currentPreviewIndex + 1}/${state.projects.length}`;
            }
            
            // Actualizar tags
            if (elements.previewTags) {
                elements.previewTags.innerHTML = createTagsHTML(project.tags);
            }
            
            // Actualizar botón de descarga
            if (elements.previewDownloadBtn) {
                updateDownloadButton(project);
            }
            
            // Actualizar estado de botones de navegación
            updateNavigationButtons();
            
            // Restaurar opacidad
            setTimeout(() => {
                if (elements.previewImage) {
                    elements.previewImage.style.opacity = '1';
                }
            }, 50);
            
            // Anunciar cambio para screen readers
            announceToScreenReader(
                `Proyecto ${state.currentPreviewIndex + 1} de ${state.projects.length}: ${project.title}. ` +
                `Estado: ${project.status === 'completado' ? 'completo y listo para descargar' : 'en proceso de desarrollo'}`
            );
            
        }, CONFIG.animationDuration);
        
    } catch (error) {
        debugLog('Error actualizando preview:', error);
    }
}

/**
 * Crea HTML para las etiquetas de proyecto
 */
function createTagsHTML(tags) {
    if (!Array.isArray(tags) || tags.length === 0) {
        return '<span class="tag">Sin etiquetas</span>';
    }
    
    return tags
        .filter(tag => typeof tag === 'string' && tag.trim() !== '')
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');
}

/**
 * Actualiza el botón de descarga según el estado del proyecto
 */
function updateDownloadButton(project) {
    if (!elements.previewDownloadBtn) return;
    
    if (project.status === 'en-proceso') {
        // Proyecto en proceso
        elements.previewDownloadBtn.href = '#';
        elements.previewDownloadBtn.removeAttribute('download');
        elements.previewDownloadBtn.innerHTML = '<i class="fas fa-clock" aria-hidden="true"></i> En Proceso';
        elements.previewDownloadBtn.className = 'preview-link en-proceso';
        elements.previewDownloadBtn.setAttribute('aria-disabled', 'true');
        elements.previewDownloadBtn.setAttribute('aria-label', 'Proyecto en desarrollo - No disponible para descargar');
        
        // Remover eventos previos
        elements.previewDownloadBtn.onclick = null;
        
    } else {
        // Proyecto completado
        elements.previewDownloadBtn.href = project.githubDownload;
        elements.previewDownloadBtn.setAttribute('download', `proyecto-${project.title.toLowerCase().replace(/\s+/g, '-')}.zip`);
        elements.previewDownloadBtn.innerHTML = '<i class="fas fa-download" aria-hidden="true"></i> Descargar ZIP';
        elements.previewDownloadBtn.className = 'preview-link descargable';
        elements.previewDownloadBtn.removeAttribute('aria-disabled');
        elements.previewDownloadBtn.setAttribute('aria-label', `Descargar proyecto: ${project.title}`);
        
        // Trackear descarga
        elements.previewDownloadBtn.onclick = function() {
            trackEvent('project_download', {
                project: project.title,
                index: state.currentPreviewIndex
            });
            
            announceToScreenReader(`Descargando proyecto: ${project.title}`, 'assertive');
        };
    }
}

/**
 * Actualiza el estado de los botones de navegación
 */
function updateNavigationButtons() {
    if (!elements.prevPreview || !elements.nextPreview) return;
    
    const isFirst = state.currentPreviewIndex === 0;
    const isLast = state.currentPreviewIndex === state.projects.length - 1;
    
    elements.prevPreview.disabled = isFirst;
    elements.nextPreview.disabled = isLast;
    
    elements.prevPreview.setAttribute('aria-label', 
        isFirst ? 'Primer proyecto' : 'Ver proyecto anterior');
    elements.nextPreview.setAttribute('aria-label',
        isLast ? 'Último proyecto' : 'Ver proyecto siguiente');
}

/**
 * Navega a un proyecto específico
 */
function navigateToProject(direction) {
    if (state.isLoading) return;
    
    const newIndex = state.currentPreviewIndex + direction;
    
    if (newIndex >= 0 && newIndex < state.projects.length) {
        state.currentPreviewIndex = newIndex;
        updatePreview();
        
        // Trackear navegación
        trackEvent('project_navigation', {
            direction: direction > 0 ? 'next' : 'previous',
            from: state.currentPreviewIndex - direction,
            to: state.currentPreviewIndex
        });
    }
}

/**
 * Abre el modal de descargas
 */
function openModal() {
    if (state.isModalOpen || state.isLoading) return;
    
    state.isModalOpen = true;
    
    // Mostrar modal
    if (elements.downloadModal) {
        elements.downloadModal.hidden = false;
        elements.downloadModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Enfocar el botón de cerrar para accesibilidad
        setTimeout(() => {
            if (elements.closeModalBtn) {
                elements.closeModalBtn.focus();
            }
        }, 100);
    }
    
    // Resetear índice si es necesario
    state.currentPreviewIndex = 0;
    updatePreview();
    
    // Anunciar apertura
    announceToScreenReader('Modal de descargas abierto. Usa las flechas para navegar entre proyectos.', 'assertive');
    
    // Trackear evento
    trackEvent('modal_open');
    
    debugLog('Modal abierto');
}

/**
 * Cierra el modal de descargas
 */
function closeModal() {
    if (!state.isModalOpen) return;
    
    state.isModalOpen = false;
    
    // Ocultar modal
    if (elements.downloadModal) {
        elements.downloadModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Restaurar foco al botón de abrir
        setTimeout(() => {
            if (elements.openModalBtn) {
                elements.openModalBtn.focus();
            }
        }, 100);
        
        // Ocultar después de la animación
        setTimeout(() => {
            elements.downloadModal.hidden = true;
        }, 300);
    }
    
    // Anunciar cierre
    announceToScreenReader('Modal de descargas cerrado');
    
    // Trackear evento
    trackEvent('modal_close');
    
    debugLog('Modal cerrado');
}

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
    // Delegación de eventos para mejor performance
    document.addEventListener('click', handleDocumentClick);
    
    // Navegación por teclado
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Swipe para móviles
    if (elements.downloadModal) {
        setupSwipeNavigation(elements.downloadModal);
    }
    
    // Click en imagen para abrir proyecto
    if (elements.previewImage) {
        elements.previewImage.addEventListener('click', () => {
            const project = state.projects[state.currentPreviewIndex];
            if (project && project.link) {
                window.open(project.link, '_blank', 'noopener,noreferrer');
                trackEvent('project_open', { project: project.title });
            }
        });
    }
    
    // Botones de navegación específicos (fallback)
    if (elements.prevPreview) {
        elements.prevPreview.addEventListener('click', () => navigateToProject(-1));
    }
    
    if (elements.nextPreview) {
        elements.nextPreview.addEventListener('click', () => navigateToProject(1));
    }

    // Handler específico para los botones "Dedicar": evitar que el click herede el enlace del padre y mostrar mensaje
    //MANTENER ASÍ POR AHORA HASTA TENER LA FUNCIONALIDAD LISTA
    document.querySelectorAll('.btn-dedicar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            alert('La personalización de los proyectos aún está en desarrollo. Pronto podrás personalizar y crear tu propia página para compartirla con tu persona favorita.');
            announceToScreenReader('Personalización de proyectos en desarrollo');
            trackEvent('dedicar_click', { projectId: btn.dataset.projectId || null });
        }, { passive: false });
    });
    
    debugLog('Event listeners configurados');
}

/**
 * Maneja clicks en el documento
 */
function handleDocumentClick(event) {
    // Abrir modal
    if (event.target.closest('#openModalBtn')) {
        event.preventDefault();
        openModal();
        return;
    }
    
    // Cerrar modal
    if (event.target.closest('#closeModalBtn') || 
        (state.isModalOpen && event.target === elements.downloadModal)) {
        closeModal();
        return;
    }
} 

/**
 * Maneja navegación por teclado
 */
function handleKeyboardNavigation(event) {
    if (!state.isModalOpen) return;
    
    // No interferir si el foco está en un elemento editable
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
    }
    
    switch(event.key) {
        case 'Escape':
            event.preventDefault();
            closeModal();
            break;
            
        case 'ArrowLeft':
            event.preventDefault();
            navigateToProject(-1);
            break;
            
        case 'ArrowRight':
            event.preventDefault();
            navigateToProject(1);
            break;
            
        case 'Home':
            event.preventDefault();
            state.currentPreviewIndex = 0;
            updatePreview();
            announceToScreenReader('Navegado al primer proyecto');
            break;
            
        case 'End':
            event.preventDefault();
            state.currentPreviewIndex = state.projects.length - 1;
            updatePreview();
            announceToScreenReader('Navegado al último proyecto');
            break;
    }
}

/**
 * Configura navegación por swipe
 */
function setupSwipeNavigation(element) {
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    
    const handleSwipe = debounce(() => {
        const diff = touchStartX - touchEndX;
        const timeDiff = Date.now() - state.swipeStartTime;
        const velocity = Math.abs(diff) / (timeDiff || 1);
        
        if (Math.abs(diff) > CONFIG.swipeThreshold || velocity > 0.5) {
            if (diff > 0) {
                navigateToProject(1);
            } else {
                navigateToProject(-1);
            }
        }
    }, 100);
    
    element.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        state.swipeStartTime = Date.now();
        isSwiping = true;
    });
    
    element.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        e.preventDefault(); // Prevenir scroll mientras se hace swipe
    }, { passive: false });
    
    element.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
        isSwiping = false;
    });
}

/**
 * Trackea eventos (para analytics)
 */
function trackEvent(eventName, eventData = {}) {
    if (!CONFIG.debug) return;
    
    const eventPayload = {
        event: eventName,
        timestamp: new Date().toISOString(),
        ...eventData
    };
    
    debugLog('Event tracked:', eventPayload);
    
    // Aquí podrías enviar a Google Analytics, etc.
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', eventName, eventData);
    // }
}

/**
 * Verifica preferencias del usuario
 */
function checkUserPreferences() {
    // Reducir movimiento
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-normal', '0.01ms');
        document.documentElement.style.setProperty('--transition-slow', '0.01ms');
    }
    
    // Alto contraste
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.documentElement.classList.add('high-contrast');
    }
    
    // Sin hover (dispositivos táctiles)
    if (window.matchMedia('(hover: none)').matches) {
        document.documentElement.classList.add('touch-device');
    }
}

/**
 * Inicializa la aplicación
 */
async function init() {
    debugLog('Inicializando aplicación...');
    
    // Configurar preferencias
    checkUserPreferences();
    
    // Crear región ARIA live
    ensureAriaLiveRegion();
    
    // Cachear elementos DOM
    cacheDOMElements();
    
    // Cargar datos
    loadProjectsData();
    
    // Configurar timeout del skeleton
    setupSkeletonTimeout();
    
    // Pre-cargar imágenes
    try {
        await preloadImages();
        hideSkeleton();
    } catch (error) {
        debugLog('Error en pre-carga:', error);
        hideSkeleton(); // Ocultar skeleton incluso si hay error
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Anunciar que la página está lista
    announceToScreenReader('Portafolio de proyectos románticos cargado correctamente');
    
    debugLog('Aplicación inicializada correctamente');
    
    // Trackear carga de página
    trackEvent('page_load', {
        projectsCount: state.projects.length,
        screenWidth: window.innerWidth,
        userAgent: navigator.userAgent.substring(0, 100)
    });
}

// ========== INICIALIZACIÓN ==========

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM ya listo
    setTimeout(init, 0);
}

// ========== EXPOSICIÓN PÚBLICA (OPCIONAL) ==========

// Exponer funciones útiles globalmente si es necesario
window.Portfolio = {
    openModal,
    closeModal,
    getCurrentProject: () => state.projects[state.currentPreviewIndex],
    getProjectCount: () => state.projects.length,
    navigateToProject
};

})();