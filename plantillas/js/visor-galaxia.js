import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { verificarYLimpiarExpiracion } from "./cleanup-expired.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cargarGalaxia() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert("No se encontró ninguna galaxia en este link.");
        return;
    }

    try {
        // ✅ VERIFICAR SI EL DOCUMENTO HA EXPIRADO
        const limpiezaResult = await verificarYLimpiarExpiracion(app, "galaxias", id);
        
        if (limpiezaResult.deleted) {
            // El documento fue eliminado porque expiró
            document.title = "Galaxia Expirada";
            document.getElementById('main-title').innerText = "Esta galaxia ha expirado ⏳";
            
            const container = document.getElementById('image-data');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #fff;">
                        <h2>Los datos se mantienen durante 48 horas</h2>
                        <p>El enlace ya no es válido.</p>
                    </div>
                `;
            }
            return;
        }
        
        if (limpiezaResult.notFound) {
            document.title = "Galaxia no encontrada";
            document.getElementById('main-title').innerText = "La galaxia no existe";
            return;
        }

        const docRef = doc(db, "galaxias", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // 1. Aplicar Títulos
            document.title = data.tituloPestana;
            document.getElementById('main-title').innerText = data.tituloH1;

            // 2. Configurar Música
            if (data.musicaUrl) {
                const audio = document.getElementById('background-music');
                if (audio) audio.src = data.musicaUrl;
            }

            // 3. Inyectar fotos y mensajes al DOM para que Three.js los use
            const container = document.getElementById('image-data');
            data.fotos.forEach(foto => {
                const img = document.createElement('img');
                img.src = foto.url;
                img.dataset.message = foto.message; // El mensaje dedicado
                container.appendChild(img);
            });

            // 4. Disparar los adjetivos (puedes guardarlos en window para usarlos luego)
            window.misAdjetivos = data.adjetivos;

            // 5. NOTA: no iniciamos la escena aquí para respetar el
            // comportamiento de iniciar solo tras interacción del usuario
            // (por ejemplo, al hacer click en #start-img).

        } else {
            alert("La galaxia personalizada ya no existe.");
        }
    } catch (error) {
        console.error("Error al cargar:", error);
    }
}

window.onload = cargarGalaxia;