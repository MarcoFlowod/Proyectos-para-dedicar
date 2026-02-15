// 1. IMPORTACIONES (Asegúrate de que la ruta a firebase-config sea correcta)
import { firebaseConfig } from "../../plantillas/js/firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// 2. INICIALIZACIÓN
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

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
        if (file.size > 10 * 1024 * 1024) { // Límite opcional de 10MB
            alert("El archivo de audio es muy pesado. Intenta con uno menor a 10MB.");
            musicInput.value = "";
            return;
        }
        selectedMusic = file;
        musicStatus.innerText = `🎵 Seleccionado: ${file.name}`;
        musicStatus.style.color = "var(--accent)";
    }
});

// --- GESTIÓN DE IMÁGENES ---

dropZone.addEventListener('click', () => imageInput.click());

// Soporte para arrastrar y soltar (Drag & Drop)
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
    imageInput.value = ""; // Reset para permitir re-selección
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

// --- SUBIDA DE DATOS ---

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
        alert("Por favor, sube al menos una foto para tu galaxia.");
        return;
    }

    // Bloquear interfaz
    btnCrear.disabled = true;
    const originalBtnText = btnCrear.innerHTML;
    btnCrear.innerHTML = '<span>Creando Magia...</span> <i class="fas fa-spinner fa-spin"></i>';

    try {
        // 1. Subir Música (si existe)
        let finalMusicUrl = null;
        if (selectedMusic) {
            const musicRef = ref(storage, `musica/${Date.now()}_${selectedMusic.name}`);
            const musicSnapshot = await uploadBytes(musicRef, selectedMusic);
            finalMusicUrl = await getDownloadURL(musicSnapshot.ref);
        }

        // 2. Subir Fotos y recopilar mensajes
        const previewCards = document.querySelectorAll('.preview-card');
        const photosData = await Promise.all(
            Array.from(previewCards).map(async (card) => {
                const fileId = parseFloat(card.dataset.id);
                const fileObj = selectedFiles.find(f => f.id === fileId);
                const message = card.querySelector('.photo-message').value.trim() || "✨";

                const photoRef = ref(storage, `galaxias/fotos/${Date.now()}_${fileObj.file.name}`);
                const snapshot = await uploadBytes(photoRef, fileObj.file);
                const url = await getDownloadURL(snapshot.ref);

                return { url, message };
            })
        );

        // 3. Procesar Adjetivos
        const adjetivosRaw = document.getElementById('adjetivos').value;
        const adjetivosList = adjetivosRaw.split(',')
            .map(s => s.trim())
            .filter(s => s !== "");

        // 4. Objeto Final
        const galaxiaData = {
            tituloPestana: document.getElementById('pageTitle').value.trim(),
            tituloH1: document.getElementById('mainTitle').value.trim(),
            musicaUrl: finalMusicUrl,
            fotos: photosData,
            adjetivos: adjetivosList.length > 0 ? adjetivosList : ["Eres Magia", "Increíble", "Especial"],
            fechaCreacion: new Date()
        };

        // 5. Firestore
        const docRef = await addDoc(collection(db, "galaxias"), galaxiaData);

        // 6. Éxito
        mostrarResultado(docRef.id);

    } catch (error) {
        console.error("Error crítico:", error);
        alert("Algo salió mal. Verifica tu conexión e intenta de nuevo.");
    } finally {
        btnCrear.disabled = false;
        btnCrear.innerHTML = originalBtnText;
    }
});

// --- FUNCIONES DE INTERFAZ ---

function mostrarResultado(id) {
    const modal = document.getElementById('resultModal');
    const finalUrlInput = document.getElementById('finalUrl');
    
    // Ajuste de ruta: apunta a la carpeta plantillas desde el formulario
    const urlFinal = `${window.location.origin}/plantillas/galaxia-de-fotos.html?id=${id}`;
    
    finalUrlInput.value = urlFinal;
    modal.style.display = 'flex';
}

window.copiarUrl = () => {
    const input = document.getElementById('finalUrl');
    input.select();
    navigator.clipboard.writeText(input.value); // Método moderno de copiado
    
    const btnIcon = document.querySelector('.copy-box button i');
    btnIcon.className = 'fas fa-check';
    setTimeout(() => btnIcon.className = 'fas fa-copy', 2000);
};

window.cerrarModal = () => {
    document.getElementById('resultModal').style.display = 'none';
    window.location.reload(); 
};