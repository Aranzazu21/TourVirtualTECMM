import { Hotspots } from './modules/Hotspots.js';
import { db } from "./services/FirebaseService.js";
// Agregamos doc, updateDoc e increment a las importaciones
import { collection, onSnapshot, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

import { TourViewer } from './modules/TourViewer.js';
import { UIController } from './modules/UIController.js';
import { Chatbot } from './modules/Chatbot.js';

let lugaresCampusNube = [];
let tourViewer = null;
let uiController = null;
let chatbot = null;

window.addEventListener("DOMContentLoaded", () => {
    onSnapshot(collection(db, "lugares"), (snapshot) => {
        lugaresCampusNube = []; 

        if (snapshot.empty) {
            console.warn("No hay áreas registradas en Firebase aún.");
            return;
        }

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            lugaresCampusNube.push({
                id: data.id,
                nombre: data.nombre,
                categoria: data.categoria || "General",
                carrera: data.categoria || "general",
                descripcion: data.descripcion,
                imagen: data.imagen,
                hotSpots: Hotspots.mapearDesdeFirebase(data.hotSpots)
            });
        });

        if (!tourViewer && lugaresCampusNube.length > 0) {
            inicializarSistema(lugaresCampusNube);
        } else if (tourViewer) {
            console.log("Se detectaron cambios en la BD. Recarga la página para aplicar los nuevos nodos.");
        }
    });
});

function inicializarSistema(lugares) {
    const todosLosIds = lugares.map(lugar => lugar.id);
    uiController = new UIController(lugares, todosLosIds);

    // AQUÍ CONVERTIMOS LA FUNCIÓN A ASYNC PARA REGISTRAR LA VISITA
    tourViewer = new TourViewer('panorama', lugares, async (idEscenaActual) => {
        uiController.actualizarDetalles(idEscenaActual);
        
        const lugarActual = lugares.find(l => l.id === idEscenaActual);
        const tvLugarActual = document.getElementById("tvLugarActual");
        if (tvLugarActual && lugarActual) {
            tvLugarActual.innerText = lugarActual.nombre;
        }

        // NUEVO: Registrar visita en Firestore silenciosamente
        try {
            await updateDoc(doc(db, "lugares", idEscenaActual), {
                visitas: increment(1)
            });
        } catch (error) {
            console.error("Error al registrar la visita:", error);
        }
    });

    const escenaInicial = lugares.some(lugar => lugar.id === "entrada") ? "entrada" : (lugares[0] ? lugares[0].id : "entrada");
    tourViewer.inicializar(escenaInicial);
    
    chatbot = new Chatbot(tourViewer, uiController, lugares);
    chatbot.inicializar();

    // MENÚ DESPLEGABLE RÁPIDO
    const navContenedor = document.getElementById("menuNavegacion");
    const btnToggleMenu = document.getElementById("btnToggleMenu");
    const filtroCampus = document.getElementById("filtroCampus");

    function dibujarBotonesMenu() {
        if (!navContenedor) return;
        navContenedor.innerHTML = ""; 
        
        const categoriaSeleccionada = filtroCampus ? filtroCampus.value : "Todas";
        let lugaresParaMostrar = lugares; 
        
        if (categoriaSeleccionada !== "Todas") {
            lugaresParaMostrar = lugares.filter(lugar => lugar.categoria === categoriaSeleccionada);
        }

        if (lugaresParaMostrar.length === 0) {
            const msj = document.createElement("div");
            msj.style.padding = "10px";
            msj.style.color = "white";
            msj.style.textAlign = "center";
            msj.innerText = "No hay áreas en esta categoría.";
            navContenedor.appendChild(msj);
            return;
        }

        lugaresParaMostrar.forEach((lugar) => {
            const btn = document.createElement("button");
            btn.className = "btn-nav";
            btn.innerText = `📍 ${lugar.nombre}`;
            
            btn.addEventListener("click", () => {
                tourViewer.cargarEscenaPorId(lugar.id);
                navContenedor.classList.remove("show"); 
            });
            
            navContenedor.appendChild(btn);
        });
    }

    if (btnToggleMenu && navContenedor) {
        btnToggleMenu.addEventListener("click", (e) => {
            e.stopPropagation(); 
            navContenedor.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".nav-dropdown-container")) {
                navContenedor.classList.remove("show");
            }
        });

        dibujarBotonesMenu();

        if (filtroCampus) {
            filtroCampus.addEventListener("change", () => {
                dibujarBotonesMenu();
            });
        }
    }

    const selectCarreras = document.getElementById("selectCarreras");
    if (selectCarreras) {
        selectCarreras.addEventListener("change", (e) => {
            uiController.filtrarPorCarrera(e.target.value, tourViewer);
        });
    }
}