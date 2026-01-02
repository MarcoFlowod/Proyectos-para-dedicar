// assets/loading.js - CON 5 SEGUNDOS MÁXIMO

document.addEventListener('DOMContentLoaded', function() {
  const creeperHead = document.getElementById('creeperHead');
  const creeperFace = document.querySelector('.creeper-face');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const loadingMessage = document.getElementById('loadingMessage');
  const loadingScreen = document.getElementById('loadingScreen');
  
  // Mensajes creativos
  const messages = [
    "Preparando sorpresas...",
    "Cargando momentos especiales...",
    "Tejiendo recuerdos...",
    "Generando magia...",
    "Compilando emociones...",
    "Casi listo...",
    "Cargando proyectos...",
    "¡DEDICA AMOR!"
  ];
  
  // Matriz 8x8 para la cara del creeper
  const faceMatrix = [
    [0,0,0,0,0,0,0,0],
    [0,1,1,0,0,1,1,0],
    [0,1,1,0,0,1,1,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,0,0,1,0,0],
    [0,0,0,0,0,0,0,0]
  ];
  
  // Crear píxeles de la cara
  createCreeperFace();
  
  // Variables de progreso
  let progress = 0;
  let currentMessage = 0;
  let imagesLoaded = 0;
  
  // Lista de imágenes a pre-cargar
  const imagesToPreload = [
    './assets/img/imagen-1.png',
    './assets/img/imagen-2.png',
    './assets/img/imagen-3.png',
    './assets/img/imagen-4.png',
    './assets/img/imagen-5.png',
    './assets/img/imagen-6.png',
    './assets/img/imagen-7.png',
    './assets/img/imagen-8.png',
    './assets/img/imagen-9.png',
    './assets/img/imagen-10.png',
    './assets/img/imagen-11.png',
    './assets/img/imagen-12.png'
  ];
  
  // Función para crear la cara del creeper con matriz 8x8
  function createCreeperFace() {
    creeperFace.innerHTML = '';
    creeperFace.style.gridTemplateColumns = 'repeat(8, 1fr)';
    creeperFace.style.gridTemplateRows = 'repeat(8, 1fr)';
    creeperFace.style.gap = '1px';
    creeperFace.style.padding = '6px';
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixel';
        
        if (faceMatrix[row][col] === 1) {
          pixel.style.backgroundColor = '#000000';
          pixel.style.boxShadow = 'inset 0 0 2px rgba(255, 255, 255, 0.2)';
          pixel.style.borderRadius = '1px';
        } else {
          const greenValue = 90 + Math.random() * 40;
          const blueValue = 30 + Math.random() * 20;
          pixel.style.backgroundColor = `rgb(30, ${greenValue}, ${blueValue})`;
          pixel.style.boxShadow = 'inset 0 0 1px rgba(0, 0, 0, 0.5)';
          pixel.style.borderRadius = '1px';
          
          if (Math.random() > 0.5) {
            pixel.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
            pixel.style.borderLeft = '1px solid rgba(255, 255, 255, 0.1)';
            pixel.style.borderRight = '1px solid rgba(0, 0, 0, 0.2)';
            pixel.style.borderBottom = '1px solid rgba(0, 0, 0, 0.2)';
          }
        }
        
        pixel.addEventListener('mouseenter', () => {
          if (faceMatrix[row][col] === 0) {
            pixel.classList.add('active');
            setTimeout(() => pixel.classList.remove('active'), 300);
          }
        });
        
        creeperFace.appendChild(pixel);
      }
    }
    
    // Ojos parpadeantes
    setTimeout(() => {
      const pixels = creeperFace.querySelectorAll('.pixel');
      pixels.forEach((pixel, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        
        if (faceMatrix[row][col] === 1) {
          setInterval(() => {
            if (Math.random() > 0.7) {
              pixel.style.backgroundColor = Math.random() > 0.5 ? '#333' : '#000';
              setTimeout(() => {
                pixel.style.backgroundColor = '#000';
              }, 100);
            }
          }, 1000 + Math.random() * 2000);
        }
      });
    }, 1000);
  }
  
  // Pre-cargar imágenes
  function preloadImages() {
    imagesToPreload.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        imagesLoaded++;
        updateProgress();
        
        if (index % 2 === 0) {
          animateDiagonalPixels();
        }
      };
      
      img.onerror = () => {
        imagesLoaded++;
        updateProgress();
      };
    });
  }
  
  // Actualizar progreso
  function updateProgress() {
    const imageProgress = (imagesLoaded / imagesToPreload.length) * 80;
    const totalProgress = Math.min(imageProgress + (progress * 0.2), 100);
    
    progressFill.style.width = `${totalProgress}%`;
    progressText.textContent = `${Math.round(totalProgress)}%`;
    
    // Cambiar mensaje según progreso
    if (totalProgress > 15 && currentMessage < 1) {
      currentMessage = 1;
      loadingMessage.textContent = messages[1];
      animateEyes();
    } else if (totalProgress > 30 && currentMessage < 2) {
      currentMessage = 2;
      loadingMessage.textContent = messages[2];
      animateMouth();
    } else if (totalProgress > 45 && currentMessage < 3) {
      currentMessage = 3;
      loadingMessage.textContent = messages[3];
      animateBorderPixels();
    } else if (totalProgress > 60 && currentMessage < 4) {
      currentMessage = 4;
      loadingMessage.textContent = messages[4];
      animateCheckerboard();
    } else if (totalProgress > 75 && currentMessage < 5) {
      currentMessage = 5;
      loadingMessage.textContent = messages[5];
      animateSpiral();
    } else if (totalProgress > 90 && currentMessage < 6) {
      currentMessage = 6;
      loadingMessage.textContent = messages[6];
      animateAllGreenPixels();
    }
    
    if (totalProgress % 8 < 1) {
      animateRandomPixels();
    }
  }
  
  // Animaciones específicas
  function animateEyes() {
    const pixels = creeperFace.querySelectorAll('.pixel');
    for (let i = 0; i < pixels.length; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      
      if ((row === 1 && (col === 1 || col === 2)) || 
          (row === 2 && (col === 1 || col === 2))) {
        pixels[i].classList.add('active');
        setTimeout(() => pixels[i].classList.remove('active'), 300);
      }
    }
  }
  
  function animateMouth() {
    const pixels = creeperFace.querySelectorAll('.pixel');
    for (let i = 0; i < pixels.length; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      
      if ((row === 4 && col >= 2 && col <= 5) ||
          (row === 5 && col >= 2 && col <= 5) ||
          (row === 6 && (col === 2 || col === 5))) {
        pixels[i].classList.add('active');
        setTimeout(() => pixels[i].classList.remove('active'), 400);
      }
    }
  }
  
  function animateDiagonalPixels() {
    const pixels = creeperFace.querySelectorAll('.pixel');
    for (let i = 0; i < pixels.length; i += 9) {
      if (i < pixels.length) {
        const row = Math.floor(i / 8);
        const col = i % 8;
        if (faceMatrix[row][col] === 0) {
          pixels[i].classList.add('active');
          setTimeout(() => pixels[i].classList.remove('active'), 200);
        }
      }
    }
  }
  
  function animateBorderPixels() {
    const pixels = creeperFace.querySelectorAll('.pixel');
    for (let i = 0; i < pixels.length; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      
      if (row === 0 || row === 7 || col === 0 || col === 7) {
        if (faceMatrix[row][col] === 0) {
          pixels[i].classList.add('active');
          setTimeout(() => pixels[i].classList.remove('active'), 100);
        }
      }
    }
  }
  
  function animateCheckerboard() {
    const pixels = creeperFace.querySelectorAll('.pixel');
    for (let i = 0; i < pixels.length; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      
      if ((row + col) % 2 === 0 && faceMatrix[row][col] === 0) {
        pixels[i].classList.add('active');
        setTimeout(() => pixels[i].classList.remove('active'), 150);
      }
    }
  }
  
  function animateSpiral() {
    const pixels = creeperFace.querySelectorAll('.pixel');
    const spiralOrder = [
      0,1,2,3,4,5,6,7,
      15,23,31,39,47,55,63,
      62,61,60,59,58,57,56,
      48,40,32,24,16,8,
      9,10,11,12,13,14,
      22,30,38,46,54,
      53,52,51,50,49,
      41,33,25,17,
      18,19,20,21,
      29,37,45,
      44,43,42,
      34,26,
      27,28,
      36,
      35
    ];
    
    spiralOrder.forEach((index, i) => {
      if (pixels[index] && faceMatrix[Math.floor(index/8)][index%8] === 0) {
        setTimeout(() => {
          pixels[index].classList.add('active');
          setTimeout(() => pixels[index].classList.remove('active'), 100);
        }, i * 20); // Más rápido para 5 segundos
      }
    });
  }
  
  function animateAllGreenPixels() {
    const pixels = creeperFace.querySelectorAll('.pixel');
    pixels.forEach((pixel, i) => {
      const row = Math.floor(i / 8);
      const col = i % 8;
      
      if (faceMatrix[row][col] === 0) {
        setTimeout(() => {
          pixel.classList.add('active');
          setTimeout(() => pixel.classList.remove('active'), 200);
        }, i * 5); // Mucho más rápido
      }
    });
  }
  
  function animateRandomPixels() {
    const pixels = document.querySelectorAll('.pixel');
    const greenPixels = Array.from(pixels).filter((pixel, i) => {
      const row = Math.floor(i / 8);
      const col = i % 8;
      return faceMatrix[row][col] === 0;
    });
    
    const randomPixels = greenPixels
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    randomPixels.forEach((pixel, i) => {
      setTimeout(() => {
        pixel.classList.add('active');
        setTimeout(() => pixel.classList.remove('active'), 300);
      }, i * 80);
    });
  }
  
  // Crear partículas
  function createParticles() {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animation = `particleFloat ${1 + Math.random() * 2}s infinite`;
      particle.style.animationDelay = `${Math.random() * 1}s`;
      loadingScreen.appendChild(particle);
    }
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes particleFloat {
        0% { transform: translate(0, 0) scale(0); opacity: 0; }
        50% { opacity: 0.5; transform: translate(${Math.random() * 80 - 40}px, ${Math.random() * 80 - 40}px) scale(1); }
        100% { transform: translate(0, 0) scale(0); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Iniciar carga - VELOCIDAD AJUSTADA PARA 5 SEGUNDOS
  function startLoading() {
    const interval = setInterval(() => {
      // INCREMENTO MÁS RÁPIDO para completar en ~5 segundos
      let increment;
      if (progress < 40) {
        increment = 1.5 + Math.random() * 3; // 1.5-4.5%
      } else if (progress < 70) {
        increment = 1 + Math.random() * 2; // 1-3%
      } else if (progress < 90) {
        increment = 0.5 + Math.random() * 1.5; // 0.5-2%
      } else {
        increment = 0.2 + Math.random() * 0.8; // 0.2-1%
      }
      
      // ACELERAR si las imágenes ya están cargadas
      if (imagesLoaded >= imagesToPreload.length * 0.6) {
        increment *= 1.5;
      }
      
      progress += increment;
      
      // Verificar si terminar
      const allImagesLoaded = imagesLoaded >= imagesToPreload.length;
      const progressComplete = progress >= 95;
      
      if ((allImagesLoaded && progressComplete) || progress >= 100) {
        progress = 100;
        clearInterval(interval);
        finishLoading();
      }
      
      updateProgress();
      
    }, 120); // Intervalo más rápido (120ms vs 150ms original)
  }
  
  // Finalizar carga
  function finishLoading() {
    loadingMessage.textContent = messages[7];
    progressFill.style.width = '100%';
    progressText.textContent = '100%';
    
    // Animación final rápida
    animateAllGreenPixels();
    
    const pixels = creeperFace.querySelectorAll('.pixel');
    const blinkInterval = setInterval(() => {
      pixels.forEach((pixel, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        if (faceMatrix[row][col] === 1) {
          pixel.style.backgroundColor = Math.random() > 0.5 ? '#ff4444' : '#000';
        }
      });
    }, 80); // Parpadeo más rápido
    
    setTimeout(() => {
      clearInterval(blinkInterval);
      
      pixels.forEach((pixel, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        if (faceMatrix[row][col] === 1) {
          pixel.style.backgroundColor = '#000';
        }
      });
      
      // Animación de explosión
      creeperHead.style.animation = 'headExplode 0.8s ease forwards';
      createParticles();
      
      // Fade out rápido
      setTimeout(() => {
        loadingScreen.style.animation = 'screenFadeOut 0.6s ease forwards';
        
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          document.body.style.overflow = 'auto';
          
          document.querySelectorAll('img').forEach(img => {
            if (img.complete) {
              img.style.opacity = '1';
              img.style.transition = 'opacity 0.3s ease';
            }
          });
        }, 600);
      }, 800);
    }, 800); // Animación final más corta
  }
  
  // Iniciar proceso
  preloadImages();
  createParticles();
  setTimeout(startLoading, 200); // Delay inicial más corto
  
  // ==============================================
  // ¡BACKUP AJUSTADO A 5 SEGUNDOS! (5000ms)
  // ==============================================
  setTimeout(() => {
    if (progress < 100) {
      console.log("Backup a 5 segundos: Forzando finalización");
      progress = 100;
      imagesLoaded = imagesToPreload.length;
      finishLoading();
    }
  }, 500); // ← CAMBIADO DE 8000 A 5000
});