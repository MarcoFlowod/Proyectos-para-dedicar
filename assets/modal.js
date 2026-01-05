document.addEventListener('DOMContentLoaded', function() {
  // ========== ELEMENTOS DEL DOM ==========
  const skeletonLoading = document.getElementById('skeletonLoading');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modal = document.getElementById('downloadModal');
  
  // Elementos del preview
  const prevPreviewBtn = document.getElementById('prevPreview');
  const nextPreviewBtn = document.getElementById('nextPreview');
  const previewImage = document.getElementById('previewImage');
  const previewTitle = document.getElementById('previewTitle');
  const previewCounter = document.querySelector('.preview-counter');
  
  // ========== DATOS DE PROYECTOS ==========
  const projects = [
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
  
  let currentPreviewIndex = 0;
  let isModalOpen = false;
  let imagesLoaded = 0;
  const totalImages = projects.length;
  
  // ========== FUNCIONES DE CARGA ==========
  
  // Pre-cargar todas las imágenes
  function preloadImages() {
    console.log('Pre-cargando imágenes...');
    
    projects.forEach((project, index) => {
      const img = new Image();
      img.src = project.img;
      img.onload = imageLoaded;
      img.onerror = imageLoaded; // También contar errores como cargadas
    });
  }
  
  // Cuando una imagen se carga
  function imageLoaded() {
    imagesLoaded++;
    const progress = Math.round((imagesLoaded / totalImages) * 100);
    console.log(`Imágenes cargadas: ${imagesLoaded}/${totalImages} (${progress}%)`);
    
    // Cuando todas las imágenes estén cargadas
    if (imagesLoaded >= totalImages) {
      setTimeout(hideSkeleton, 500); // Pequeño delay para mejor UX
    }
  }
  
  // Ocultar skeleton loading
  function hideSkeleton() {
    if (skeletonLoading) {
      skeletonLoading.classList.add('hidden');
      console.log('Skeleton loading ocultado');
      
      // Eliminar del DOM después de la animación
      setTimeout(() => {
        if (skeletonLoading.parentNode) {
          skeletonLoading.parentNode.removeChild(skeletonLoading);
        }
      }, 500);
    }
  }
  
  // Forzar ocultar skeleton después de tiempo máximo
  function forceHideSkeleton() {
    setTimeout(() => {
      if (skeletonLoading && !skeletonLoading.classList.contains('hidden')) {
        console.log('Forzando ocultar skeleton (timeout)');
        hideSkeleton();
      }
    }, 5000); // 5 segundos máximo
  }
  
  // ========== FUNCIONES PRINCIPALES ==========
  
  // Actualiza el contenido del preview
  function updatePreview() {
    if (currentPreviewIndex < 0 || currentPreviewIndex >= projects.length) return;
    
    const project = projects[currentPreviewIndex];
    
    previewImage.src = project.img;
    previewImage.alt = project.title;
    previewTitle.textContent = project.title;
    previewCounter.textContent = `${currentPreviewIndex + 1}/${projects.length}`;
    
    // Actualizar tags
    const tagsContainer = document.querySelector('.preview-tags');
    if (tagsContainer) {
      tagsContainer.innerHTML = project.tags.map(tag => 
        `<span class="tag">${tag}</span>`
      ).join('');
    }
    
    // Actualizar botón según el estado del proyecto
    const downloadLink = document.querySelector('.preview-link');
    if (downloadLink) {
      if (project.status === 'en-proceso') {
        // Proyectos en proceso
        downloadLink.href = '#';
        downloadLink.removeAttribute('download');
        downloadLink.innerHTML = '<i class="fas fa-clock"></i> En Proceso';
        downloadLink.classList.add('en-proceso');
        downloadLink.classList.remove('descargable');
        downloadLink.onclick = function(e) {
          e.preventDefault();
          alert('Este proyecto aún está en desarrollo. Próximamente estará disponible para descargar.');
        };
      } else {
        // Proyectos completados
        downloadLink.href = project.githubDownload;
        downloadLink.setAttribute('download', 'proyectos-especiales.zip');
        downloadLink.innerHTML = '<i class="fas fa-download"></i> Descargar ZIP';
        downloadLink.classList.add('descargable');
        downloadLink.classList.remove('en-proceso');
        downloadLink.onclick = null; // Quitar cualquier evento previo
      }
    }
    
    // Actualizar estado de botones de navegación
    prevPreviewBtn.disabled = currentPreviewIndex === 0;
    nextPreviewBtn.disabled = currentPreviewIndex === projects.length - 1;
    
    prevPreviewBtn.style.opacity = currentPreviewIndex === 0 ? '0.5' : '1';
    nextPreviewBtn.style.opacity = currentPreviewIndex === projects.length - 1 ? '0.5' : '1';
  }
  
  // Abre el modal
  function openModal() {
    if (isModalOpen) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    isModalOpen = true;
    
    currentPreviewIndex = 0;
    updatePreview();
    
    setTimeout(() => {
      closeModalBtn.focus();
    }, 100);
  }
  
  // Cierra el modal
  function closeModal() {
    if (!isModalOpen) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    isModalOpen = false;
    
    setTimeout(() => {
      openModalBtn.focus();
    }, 100);
  }
  
  // Navega al proyecto anterior
  function goToPrevProject() {
    if (currentPreviewIndex > 0) {
      currentPreviewIndex--;
      updatePreview();
      
      previewImage.style.opacity = '0.5';
      setTimeout(() => {
        previewImage.style.opacity = '1';
      }, 150);
    }
  }
  
  // Navega al proyecto siguiente
  function goToNextProject() {
    if (currentPreviewIndex < projects.length - 1) {
      currentPreviewIndex++;
      updatePreview();
      
      previewImage.style.opacity = '0.5';
      setTimeout(() => {
        previewImage.style.opacity = '1';
      }, 150);
    }
  }
  
  // ========== EVENT LISTENERS ==========
  
  // Abrir modal
  openModalBtn.addEventListener('click', function(e) {
    e.preventDefault();
    openModal();
  });
  
  // Cerrar modal
  closeModalBtn.addEventListener('click', closeModal);
  
  // Navegación del preview
  prevPreviewBtn.addEventListener('click', goToPrevProject);
  nextPreviewBtn.addEventListener('click', goToNextProject);
  
  // Cerrar modal al hacer clic fuera
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Navegación con teclado
  document.addEventListener('keydown', function(e) {
    if (!isModalOpen) return;
    
    switch(e.key) {
      case 'Escape':
        e.preventDefault();
        closeModal();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevProject();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNextProject();
        break;
    }
  });
  
  // Swipe para móviles
  let touchStartX = 0;
  let touchEndX = 0;
  
  modal.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  modal.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        goToNextProject();
      } else {
        goToPrevProject();
      }
    }
  }
  
  // Click en imagen del preview para abrir proyecto
  previewImage.addEventListener('click', function() {
    if (currentPreviewIndex >= 0 && currentPreviewIndex < projects.length) {
      const project = projects[currentPreviewIndex];
      window.open(project.link, '_blank');
    }
  });
  
  // ========== INICIALIZACIÓN ==========
  
  // Iniciar pre-carga de imágenes
  preloadImages();
  
  // Forzar ocultar skeleton si algo falla
  forceHideSkeleton();
  
  // Inicializar preview
  updatePreview();
  
  // Mostrar en consola cuando todo esté listo
  window.addEventListener('load', function() {
    console.log('Página completamente cargada');
  });
});