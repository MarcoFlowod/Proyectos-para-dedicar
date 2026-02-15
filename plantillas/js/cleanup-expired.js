/**
 * Módulo para limpiar datos expirados de Firestore
 * Verifica si un documento ha alcanzado su fecha de expiración y lo elimina
 */

import { getFirestore, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function verificarYLimpiarExpiracion(app, collectionName, documentId) {
    try {
        const db = getFirestore(app);
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.warn(`El documento ${documentId} no existe`);
            return { expired: true, notFound: true };
        }

        const data = docSnap.data();
        
        // Verificar si tiene fecha de expiración
        if (!data.expiresAt) {
            console.log("Documento sin fecha de expiración");
            return { expired: false };
        }

        // Convertir expiresAt a Date si es timestamp de Firebase
        let expiresAt;
        if (data.expiresAt.toDate && typeof data.expiresAt.toDate === 'function') {
            expiresAt = data.expiresAt.toDate();
        } else {
            expiresAt = new Date(data.expiresAt);
        }

        const ahora = new Date();
        const hasExpired = ahora > expiresAt;

        if (hasExpired) {
            console.log(`Documento expirado. Eliminando...`);
            
            // Eliminar el documento
            await deleteDoc(docRef);
            
            console.log(`✅ Documento ${documentId} eliminado correctamente`);
            return { expired: true, deleted: true };
        }

        console.log(`✅ Documento válido. Expira en: ${expiresAt}`);
        return { expired: false };

    } catch (error) {
        console.error("Error al verificar expiración:", error);
        return { expired: false, error: error.message };
    }
}

/**
 * Calcula cuánto tiempo le queda a un documento antes de expirar
 */
export function calcularTiempoRestante(expiresAt) {
    try {
        let expiresDate;
        if (expiresAt.toDate && typeof expiresAt.toDate === 'function') {
            expiresDate = expiresAt.toDate();
        } else {
            expiresDate = new Date(expiresAt);
        }

        const ahora = new Date();
        const diferencia = expiresDate - ahora;

        if (diferencia <= 0) {
            return { expirado: true };
        }

        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        return {
            expirado: false,
            horas,
            minutos,
            segundos,
            total_ms: diferencia,
            mensaje: `Expira en ${horas}h ${minutos}m ${segundos}s`
        };
    } catch (error) {
        console.error("Error al calcular tiempo restante:", error);
        return { expirado: false, error: error.message };
    }
}
