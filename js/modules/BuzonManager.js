import { db } from '../services/FirebaseService.js';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export class BuzonManager {
    constructor() {
        this.coleccionRef = collection(db, "buzon");
    }

    /**
     * Inicializa el modal y el formulario en la vista pública (index.html)
     */
    inicializarVistaUsuario() {
        const modal = document.getElementById("modalBuzon");
        const btnAbrir = document.getElementById("btnAbrirBuzon");
        const btnCerrar = document.getElementById("btnCerrarBuzon");
        const form = document.getElementById("formBuzon");
        const btnSubmit = document.getElementById("btnEnviarBuzon");

        if (!modal || !btnAbrir || !form) return;

        btnAbrir.addEventListener("click", () => {
            modal.style.display = "flex";
        });

        if (btnCerrar) {
            btnCerrar.addEventListener("click", () => {
                modal.style.display = "none";
            });
        }

        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            await this.enviarReporte(form, modal, btnSubmit);
        });
    }

    async enviarReporte(form, modal, btnSubmit) {
        const tipo = document.getElementById("buzonTipo").value;
        const remitente = document.getElementById("buzonRemitente").value.trim() || "Anónimo";
        const mensaje = document.getElementById("buzonMensaje").value.trim();

        if (!mensaje) return;

        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerText = "Enviando...";
        }

        try {
            await addDoc(this.coleccionRef, {
                tipo,
                remitente,
                mensaje,
                leido: false,
                fecha: serverTimestamp()
            });

            alert("✅ ¡Gracias! Tu comentario ha sido enviado al administrador.");
            form.reset();
            modal.style.display = "none";
        } catch (error) {
            console.error("Error al guardar en el buzón:", error);
            alert("❌ No se pudo enviar el mensaje. Inténtalo de nuevo.");
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.innerText = "Enviar al Administrador";
            }
        }
    }

    /**
     * Inicializa el panel de lectura en tiempo real en la vista de administrador (admin.html)
     */
    inicializarVistaAdmin() {
        const contenedor = document.getElementById("listaMensajesBuzon");
        const contador = document.getElementById("contadorBuzon");
        
        if (!contenedor) return;

        const q = query(this.coleccionRef, orderBy("fecha", "desc"));

        onSnapshot(q, (snapshot) => {
            contenedor.innerHTML = "";
            if (contador) contador.innerText = `${snapshot.size} mensaje(s)`;

            if (snapshot.empty) {
                contenedor.innerHTML = `<p style="color: #777; text-align: center; padding: 20px;">No hay quejas ni sugerencias registradas aún.</p>`;
                return;
            }

            snapshot.forEach((documento) => {
                const tarjeta = this.crearTarjetaMensaje(documento.id, documento.data());
                contenedor.appendChild(tarjeta);
            });

            this.asignarEventosAdmin();
        });
    }

    crearTarjetaMensaje(id, data) {
        const fechaTexto = data.fecha ? data.fecha.toDate().toLocaleString('es-MX') : 'Recién enviado';
        const estiloFondo = data.leido ? '#f9f9f9' : '#eef4ff';
        const bordeIzquierdo = data.leido ? '4px solid #ccc' : '4px solid #1B396A';

        const tarjeta = document.createElement("div");
        tarjeta.style.cssText = `background: ${estiloFondo}; border-left: ${bordeIzquierdo}; padding: 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;`;

        tarjeta.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span style="background: #1B396A; color: #fff; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${data.tipo}</span>
                    <strong style="color: #222; font-size: 0.95rem;">${data.remitente}</strong>
                    <span style="color: #777; font-size: 0.8rem;">• ${fechaTexto}</span>
                </div>
                <p style="margin: 0; color: #333; font-size: 0.95rem; line-height: 1.4;">${data.mensaje}</p>
            </div>
            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                ${!data.leido ? `<button data-id="${id}" class="btn-marcar-leido" style="background: #28a745; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">✓ Atendido</button>` : ''}
                <button data-id="${id}" class="btn-eliminar-buzon" style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">🗑️</button>
            </div>
        `;

        return tarjeta;
    }

    asignarEventosAdmin() {
        document.querySelectorAll(".btn-marcar-leido").forEach(btn => {
            btn.onclick = async () => {
                await updateDoc(doc(db, "buzon", btn.dataset.id), { leido: true });
            };
        });

        document.querySelectorAll(".btn-eliminar-buzon").forEach(btn => {
            btn.onclick = async () => {
                if (confirm("¿Eliminar este reporte permanentemente?")) {
                    await deleteDoc(doc(db, "buzon", btn.dataset.id));
                }
            };
        });
    }
}