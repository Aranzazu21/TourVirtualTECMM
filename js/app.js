import { Hotspots } from './modules/Hotspots.js';
// Importamos la conexión a Firebase
import { db } from "./services/FirebaseService.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Importamos las clases 
import { TourViewer } from './modules/TourViewer.js';
import { UIController } from './modules/UIController.js';
import { Chatbot } from './modules/Chatbot.js';

let lugaresCampusNube = [];
let tourViewer = null;
let uiController = null;
let chatbot = null;

window.addEventListener("DOMContentLoaded", () => {
    
    // 1. Escuchar la base de datos en tiempo real
    onSnapshot(collection(db, "lugares"), (snapshot) => {
        lugaresCampusNube = []; // Limpiamos el arreglo local

        if (snapshot.empty) {
            console.warn("No hay áreas registradas en Firebase aún.");
            return;
        }

        // Transformamos los datos de Firebase al formato que necesita TourViewer.js
        snapshot.forEach((doc) => {
            const data = doc.data();
            
            lugaresCampusNube.push({
                id: data.id,
                nombre: data.nombre,
                categoria: data.categoria || "General",
                carrera: data.categoria || "general",
                descripcion: data.descripcion,
                imagen: data.imagen,
                
                // <-- USAMOS EL NUEVO MÓDULO PARA FORMATEAR LOS DATOS -->
                hotSpots: Hotspots.mapearDesdeFirebase(data.hotSpots)
            });
        });

        // 2. Si es la primera vez que carga, inicializamos todo el sistema 
        if (!tourViewer && lugaresCampusNube.length > 0) {
            inicializarSistema(lugaresCampusNube);
        } else if (tourViewer) {
           
            console.log("Se detectaron cambios en la BD. Recarga la página para aplicar los nuevos nodos.");
        }
    });

});

function inicializarSistema(lugares) {
    const todosLosIds = lugares.map(lugar => lugar.id);

    // Instanciar Controlador de Interfaz HTML
    uiController = new UIController(lugares, todosLosIds);

    // Instanciar Motor 360° con callback para actualizar la UI al cambiar de escena
    tourViewer = new TourViewer('panorama', lugares, (idEscenaActual) => {
        uiController.actualizarDetalles(idEscenaActual);
        
        // Actualizar la etiqueta superior con el nombre del lugar actual
        const lugarActual = lugares.find(l => l.id === idEscenaActual);
        const tvLugarActual = document.getElementById("tvLugarActual");
        if (tvLugarActual && lugarActual) {
            tvLugarActual.innerText = lugarActual.nombre;
        }
    });

    // Forzar siempre el inicio en la Entrada Principal
    // (Verifica si el ID "entrada" existe, si no, toma el primero que encuentre)
    const escenaInicial = lugares.some(lugar => lugar.id === "entrada") ? "entrada" : (lugares[0] ? lugares[0].id : "entrada");
    
    tourViewer.inicializar(escenaInicial);
    // Instanciar Chatbot
    chatbot = new Chatbot(tourViewer, uiController, lugares);
    chatbot.inicializar();

    // ==========================================
    // LÓGICA DEL MENÚ DESPLEGABLE RÁPIDO
    // ==========================================
    const navContenedor = document.getElementById("menuNavegacion");
    const btnToggleMenu = document.getElementById("btnToggleMenu");

    if (btnToggleMenu && navContenedor) {
        // 1. Abrir/Cerrar el menú al presionar "Explorar Campus"
        btnToggleMenu.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita que se cierre instantáneamente
            navContenedor.classList.toggle("show");
        });

        // 2. Cerrar el menú si haces clic en cualquier otra parte de la pantalla
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".nav-dropdown-container")) {
                navContenedor.classList.remove("show");
            }
        });

        // 3. Llenar el menú desplegable con las áreas de Firebase
        navContenedor.innerHTML = ""; 
        
        lugares.forEach((lugar) => {
            const btn = document.createElement("button");
            btn.className = "btn-nav";
            btn.innerText = `📍 ${lugar.nombre}`;
            
            // 4. Al hacer clic, viajar a esa área y ocultar el menú
            btn.addEventListener("click", () => {
                tourViewer.cargarEscenaPorId(lugar.id);
                navContenedor.classList.remove("show"); 
            });
            
            navContenedor.appendChild(btn);
        });
    }

    // Filtros
    const selectCarreras = document.getElementById("selectCarreras");
    if (selectCarreras) {
        selectCarreras.addEventListener("change", (e) => {
            uiController.filtrarPorCarrera(e.target.value, tourViewer);
        });
    }
}
