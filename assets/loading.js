// assets/loading.js
document.addEventListener('DOMContentLoaded', function() {
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingBar = document.getElementById('loadingBar');
  const loadingPercentage = document.getElementById('loadingPercentage');
  const loadingQuote = document.getElementById('loadingQuote');
  const projectsContainer = document.querySelector('.proyectos-container');
  const projectsCount = document.querySelector('.count-number');
  
  // Frases aleatorias para mostrar durante la carga
  const quotes = [
    '"El amor no se mira, se siente; y aún más fuerte, se lleva en el corazón."',
    '"Los pequeños detalles son los que hacen grandes las relaciones."',
    '"Cada proyecto está hecho con una pizca de magia y mucho cariño."',
    '"La creatividad es contagiosa, pásala."',
    '"Las mejores cosas de la vida no son cosas, son momentos."',
    '"El amor es la única fuerza capaz de transformar un enemigo en amigo."',
    '"La belleza comienza en el momento en que decides ser tú mismo."'
  ];
  
  // Contar proyectos reales
  const totalProjects = document.querySelectorAll('.grid-item').length;
  projectsCount.textContent = totalProjects;
  
  // Simular progreso de carga con actualización real
  let progress = 0;
  const totalImages = document.querySelectorAll('img').length;
  let loadedImages = 0;
  
  // Función para actualizar el porcentaje
  function updateProgress(percentage) {
    progress = Math.min(percentage, 100);
    loadingBar.style.width = `${progress}%`;
    loadingPercentage.textContent = `${Math.round(progress)}%`;
    
    // Cambiar frase aleatoria cada 25%
    if (progress % 25 === 0) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      loadingQuote.textContent = randomQuote;
    }
    
    // Cuando llegue al 100%, ocultar loading
    if (progress >= 100) {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        projectsContainer.classList.add('loaded');
        
        // Eliminar el loading screen del DOM después de la animación
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 800);
      }, 500); // Pequeña pausa para mostrar el 100%
    }
  }
  
  // Monitorear carga real de imágenes
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    if (img.complete) {
      imageLoaded();
    } else {
      img.addEventListener('load', imageLoaded);
      img.addEventListener('error', imageLoaded); // Incluso si hay error, contar como cargada
    }
  });
  
  function imageLoaded() {
    loadedImages++;
    const imageProgress = (loadedImages / totalImages) * 80; // Imágenes son el 80% de la carga
    const baseProgress = 20; // 20% base por el HTML/CSS
    updateProgress(baseProgress + imageProgress);
  }
  
  // Asegurarse de que si todas las imágenes ya están cargadas, completar al 100%
  if (images.length === 0 || loadedImages === images.length) {
    setTimeout(() => {
      updateProgress(100);
    }, 1000);
  }
  
  // Timeout de seguridad (por si algo falla)
  setTimeout(() => {
    if (progress < 100) {
      updateProgress(100);
    }
  }, 5000);
});