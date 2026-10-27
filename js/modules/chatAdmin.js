// importamos la base de datos de firebase desde la carpeta de servicios
import { db } from "../services/FirebaseService.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// aqui guardamos temporalmente los lugares que bajamos de la base de datos
let memoriaLugares = []; 

// funcion para que dashboard.js nos pase los lugares ya cargados
export function inicializarChatAdmin(lugaresRegistrados) {
    memoriaLugares = lugaresRegistrados;
}

// preparamos los botones del panel en cuanto carga la pagina
document.addEventListener("DOMContentLoaded", () => {
    const btnAbrir = document.getElementById("btnAbrirPanelBot");
    const btnCerrar = document.getElementById("btnCerrarChatAdmin");
    const modal = document.getElementById("modalChatAdmin");

    // si le dan al boton de abrir, pintamos la lista y mostramos la ventana
    if (btnAbrir) {
        btnAbrir.addEventListener("click", () => {
            const lista = document.getElementById("listaChatbotNodos");
            renderizarLista(memoriaLugares, lista);
            modal.style.display = "flex";
        });
    }

    // para cerrar la ventana modal
    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }
});

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
        msj.style.color = "blue";
        msj.innerText = "guardando...";
        
        // mandamos la actualizacion a firebase usando el id del lugar
        await updateDoc(doc(db, "lugares", id), {
            keywords: keywordsArray,
            mensajeVoz: mensajeVoz
        });
        
        msj.style.color = "green";
        msj.innerText = "entrenamiento actualizado!";
        
        // borramos el mensajito verde despues de un ratito
        setTimeout(() => { msj.innerText = ""; }, 2500);
    } catch (error) {
        // si firebase bloquea o falla, sale el error en rojo
        msj.style.color = "red";
        msj.innerText = "error: " + error.message;
    }
};

// dibuja el formulario por cada lugar que haya en la base de datos
function renderizarLista(lugares, contenedor) {
    contenedor.innerHTML = "";
    
    // si no hay lugares, avisa que falta iniciar sesion o checar base de datos
    if (!lugares || lugares.length === 0) {
        contenedor.innerHTML = "<p style='color:#ef4444; font-weight:bold;'>no hay datos cargados. inicia sesion o pide a tu compañero que abra las reglas de firebase.</p>";
        return;
    }

    // recorre cada lugar y le crea sus cajas de texto y su boton de guardar
    lugares.forEach(lugar => {
        const div = document.createElement("div");
        div.className = "hotspot-item";
        div.style.flexDirection = "column";
        div.style.alignItems = "stretch";
        
        const keywordsActuales = lugar.keywords ? lugar.keywords.join(", ") : "";
        const vozActual = lugar.mensajeVoz || "";

        div.innerHTML = `
            <h4 style="color: #260b7b; margin-bottom: 10px;">📍 ${lugar.nombre}</h4>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Palabras Clave de Búsqueda (separadas por coma):</label>
                <input type="text" id="kw_${lugar.id}" value="${keywordsActuales}" placeholder="ej. sistemas, laboratorio, computacion">
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Guion de Voz (Lo que dirá el asistente al llegar):</label>
                <textarea id="voz_${lugar.id}" rows="2" placeholder="ej. bienvenidos al edificio de sistemas...">${vozActual}</textarea>
            </div>
            <button class="btn-submit" style="margin-top: 5px;" onclick="guardarConfigChatbot('${lugar.id}')">Guardar Configuración</button>
            <p id="msj_${lugar.id}" style="font-size: 0.8rem; margin-top: 5px; font-weight: bold;"></p>
        `;
        contenedor.appendChild(div);
    });
}