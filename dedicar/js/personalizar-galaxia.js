// 1. IMPORTACIONES
import { firebaseConfig } from "../../plantillas/js/firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. INICIALIZACIÓN
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cloudinary Config (Basado en tus capturas)
const CLOUD_NAME = "dndob5mdu";
const UPLOAD_PRESET = "preset_galaxia";

// 3. REFERENCIAS DEL DOM
const form = document.getElementById('galaxiaForm');
const imageInput = document.getElementById('imageInput');
const dropZone = document.getElementById('dropZone');
const previewContainer = document.getElementById('previewContainer');
const musicInput = document.getElementById('musicInput');
const musicStatus = document.getElementById('musicStatus');
const musicDropZone = document.getElementById('musicDropZone');
const btnCrear = document.getElementById('btnCrear');

let selectedFiles = []; 
let selectedMusic = null;

// --- GESTIÓN DE MÚSICA ---
musicDropZone.addEventListener('click', () => musicInput.click());

musicInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedMusic = file;
        musicStatus.innerText = `🎵 Seleccionado: ${file.name}`;
        musicStatus.style.color = "#ff4d6d";
    }
});

// --- GESTIÓN DE IMÁGENES ---
dropZone.addEventListener('click', () => imageInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = "rgba(255, 77, 109, 0.2)";
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.background = "";
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = "";
    handleFiles(e.dataTransfer.files);
});

imageInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(files) {
    const filesArray = Array.from(files);
    if (selectedFiles.length + filesArray.length > 12) {
        alert("¡Máximo 12 fotos permitidas!");
        return;
    }
    filesArray.forEach(file => {
        if (file.type.startsWith('image/')) {
            const fileId = Date.now() + Math.random();
            selectedFiles.push({ file, id: fileId });
            renderPreview(file, fileId);
        }
    });
    imageInput.value = ""; 
}

function renderPreview(file, id) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const div = document.createElement('div');
        div.className = 'preview-card';
        div.dataset.id = id;
        div.innerHTML = `
            <div class="image-wrapper">
                <img src="${e.target.result}">
                <button type="button" class="remove-btn" title="Eliminar">&times;</button>
            </div>
            <textarea placeholder="Mensaje para esta foto..." class="photo-message"></textarea>
        `;
        div.querySelector('.remove-btn').onclick = () => {
            selectedFiles = selectedFiles.filter(f => f.id !== id);
            div.remove();
        };
        previewContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
}

// --- SUBIDA DE DATOS A CLOUDINARY + FIREBASE ---

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
        alert("Sube al menos una foto.");
        return;
    }

    btnCrear.disabled = true;
    const originalBtnText = btnCrear.innerHTML;
    btnCrear.innerHTML = '<span>Creando Magia...</span> <i class="fas fa-spinner fa-spin"></i>';

    try {
        // 1. Subir Música a Cloudinary (si existe)
        let finalMusicUrl = null;
        if (selectedMusic) {
            const formData = new FormData();
            formData.append('file', selectedMusic);
            formData.append('upload_preset', UPLOAD_PRESET);
            
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            finalMusicUrl = data.secure_url;
        }

        // 2. Subir Fotos a Cloudinary y capturar sus mensajes
        const previewCards = document.querySelectorAll('.preview-card');
        const photosData = await Promise.all(
            Array.from(previewCards).map(async (card) => {
                const fileId = parseFloat(card.dataset.id);
                const fileObj = selectedFiles.find(f => f.id === fileId);
                const message = card.querySelector('.photo-message').value.trim() || "✨";

                const formData = new FormData();
                formData.append('file', fileObj.file);
                formData.append('upload_preset', UPLOAD_PRESET);

                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                
                return { url: data.secure_url, message: message };
            })
        );

        // 3. Procesar Adjetivos
        const adjetivosRaw = document.getElementById('adjetivos').value;
        const adjetivosList = adjetivosRaw.split(',')
            .map(s => s.trim())
            .filter(s => s !== "");

        // 4. Objeto Final para Firestore
        const galaxiaData = {
            tituloPestana: document.getElementById('pageTitle').value.trim() || "Mi Galaxia",
            tituloH1: document.getElementById('mainTitle').value.trim() || "Para Ti",
            musicaUrl: finalMusicUrl,
            fotos: photosData,
            adjetivos: adjetivosList.length > 0 ? adjetivosList : ["Eres Magia", "Increíble", "Especial"],
            fechaCreacion: new Date()
        };

        // 5. Guardar en Firestore
        const docRef = await addDoc(collection(db, "galaxias"), galaxiaData);

        // 6. Éxito
        mostrarResultado(docRef.id);

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al subir los archivos. Revisa tu consola.");
    } finally {
        btnCrear.disabled = false;
        btnCrear.innerHTML = originalBtnText;
    }
});

// --- FUNCIONES DE INTERFAZ ---

function mostrarResultado(id) {
    const modal = document.getElementById('resultModal');
    const finalUrlInput = document.getElementById('finalUrl');
    // Ruta hacia tu archivo de Three.js
    const urlFinal = `${window.location.origin}/plantillas/galaxia-de-fotos.html?id=${id}`;
    finalUrlInput.value = urlFinal;
    modal.style.display = 'flex';
}

window.copiarUrl = () => {
    const input = document.getElementById('finalUrl');
    input.select();
    navigator.clipboard.writeText(input.value);
    const btnIcon = document.querySelector('.copy-box button i');
    btnIcon.className = 'fas fa-check';
    setTimeout(() => btnIcon.className = 'fas fa-copy', 2000);
};

window.cerrarModal = () => {
    document.getElementById('resultModal').style.display = 'none';
    window.location.reload(); 
};