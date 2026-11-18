// importamos la base de datos de firebase desde la carpeta de servicios
import { db } from "../services/FirebaseService.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// aqui guardamos temporalmente los lugares que bajamos de la base de datos
let memoriaLugares = [];
let eventosConfigurados = false;

// funcion para que dashboard.js nos pase los lugares ya cargados
export function inicializarChatAdmin(lugaresRegistrados) {
    memoriaLugares = lugaresRegistrados || [];
    configurarEventosModal();
}

function configurarEventosModal() {
    if (eventosConfigurados) return;

    const btnAbrir = document.getElementById("btnAbrirPanelBot");
    const btnCerrar = document.getElementById("btnCerrarChatAdmin");
    const modal = document.getElementById("modalChatAdmin");
    const buscadorBot = document.getElementById("buscadorChatAdmin");

    if (!btnAbrir || !modal) return;
    eventosConfigurados = true;

    // si le dan al boton de abrir, pintamos la lista y mostramos la ventana
    btnAbrir.addEventListener("click", () => {
        if (buscadorBot) buscadorBot.value = "";
        const lista = document.getElementById("listaChatbotNodos");
        renderizarLista(memoriaLugares, lista);
        modal.style.display = "flex";
    });

    // para cerrar la ventana modal con la X
    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    // cerrar si hacen clic fuera del cuadro blanco
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // filtro en vivo dentro del modal
    if (buscadorBot) {
        buscadorBot.addEventListener("input", () => {
            const texto = buscadorBot.value.trim().toLowerCase();
            const lista = document.getElementById("listaChatbotNodos");
            const filtrados = memoriaLugares.filter(l =>
                String(l.nombre).toLowerCase().includes(texto) ||
                String(l.id).toLowerCase().includes(texto)
            );
            renderizarLista(filtrados, lista);
        });
    }
}

// funcion para guardar las palabras clave y el texto de voz
window.guardarConfigChatbot = async function(id) {
    const msj = document.getElementById(`msj_${id}`);
    const keywordsTexto = document.getElementById(`kw_${id}`).value;
    const mensajeVoz = document.getElementById(`voz_${id}`).value.trim();

    // agarra el texto, lo separa por comas, le quita espacios y lo hace minusculas
    const keywordsArray = keywordsTexto.split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k !== "");

    try {
        msj.style.color = "#2563eb";
        msj.innerText = "Guardando...";
        
        // mandamos la actualizacion a firebase usando el id del lugar
        await updateDoc(doc(db, "lugares", id), {
            keywords: keywordsArray,
            mensajeVoz: mensajeVoz
        });
        
        msj.style.color = "#10b981";
        msj.innerText = "¡Entrenamiento actualizado!";
        
        setTimeout(() => { msj.innerText = ""; }, 2500);
    } catch (error) {
        msj.style.color = "#ef4444";
        msj.innerText = "Error: " + error.message;
    }
};

// dibuja el formulario por cada lugar que haya en la base de datos
function renderizarLista(lugares, contenedor) {
    if (!contenedor) return;
    contenedor.innerHTML = "";
    
    if (!lugares || lugares.length === 0) {
        contenedor.innerHTML = "<p style='color:#ef4444; font-weight:bold; text-align:center; padding:15px;'>No se encontraron áreas cargadas.</p>";
        return;
    }

    lugares.forEach(lugar => {
        const div = document.createElement("div");
        div.className = "hotspot-item";
        div.style.flexDirection = "column";
        div.style.alignItems = "stretch";
        
        const keywordsActuales = Array.isArray(lugar.keywords) ? lugar.keywords.join(", ") : "";
        const vozActual = lugar.mensajeVoz || "";

        div.innerHTML = `
            <h4 style="color: #260b7b; margin-bottom: 10px;">📍 ${lugar.nombre} <small style="color:#64748b; font-weight:normal;">(${lugar.id})</small></h4>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Palabras Clave de Búsqueda (separadas por coma):</label>
                <input type="text" id="kw_${lugar.id}" value="${keywordsActuales}" placeholder="ej. sistemas, laboratorio, computacion" style="background: white; border: 1px solid #cbd5e1;">
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Guion de Voz (Lo que dirá el asistente al llegar):</label>
                <textarea id="voz_${lugar.id}" rows="2" placeholder="ej. Bienvenidos al edificio de sistemas..." style="background: white; border: 1px solid #cbd5e1;">${vozActual}</textarea>
            </div>
            <button type="button" class="btn-submit" style="margin-top: 5px; background-color: #10b981;" onclick="guardarConfigChatbot('${lugar.id}')">Guardar Configuración</button>
            <p id="msj_${lugar.id}" style="font-size: 0.85rem; margin-top: 5px; font-weight: bold;"></p>
        `;
        contenedor.appendChild(div);
    });
}