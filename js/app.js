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
                
                // <-- USAMOS TU NUEVO MÓDULO PARA FORMATEAR LOS DATOS -->
                hotSpots: Hotspots.mapearDesdeFirebase(data.hotSpots)
            });
        });

        // 2. Si es la primera vez que carga, inicializamos todo el sistema de tu compañero
        if (!tourViewer && lugaresCampusNube.length > 0) {
            inicializarSistema(lugaresCampusNube);
        } else if (tourViewer) {
            // Si ya estaba cargado, podrías implementar una lógica para refrescar las escenas,
            // pero Pannellum requiere destruir y recrear el visor para inyectar nuevas escenas.
            // Para fines prácticos, obligamos a recargar la página para ver cambios fuertes estructurales.
            console.log("Se detectaron cambios en la BD. Recarga la página para aplicar los nuevos nodos.");
        }
    });

});

function inicializarSistema(lugares) {
    // 1. En lugar de quemar los IDs, obtenemos TODOS los IDs de las áreas que tienes en Firebase
    const todosLosIds = lugares.map(lugar => lugar.id);

    // Instanciar Controlador de Interfaz HTML pasándole todos los IDs
    uiController = new UIController(lugares, todosLosIds);

    // Instanciar Motor 360° con callback de actualización
    tourViewer = new TourViewer('panorama', lugares, (idEscenaActual) => {
        uiController.actualizarDetalles(idEscenaActual);
    });

    // Inicializar visor en la primera escena disponible
    const escenaInicial = lugares[0] ? lugares[0].id : "entrada";
    tourViewer.inicializar(escenaInicial);

    // Instanciar e inicializar Chatbot
    chatbot = new Chatbot(tourViewer, uiController, lugares);
    chatbot.inicializar();

    // Configurar eventos dinámicos de los botones del menú superior
    const navContenedor = document.getElementById("menuNavegacion");
    if(navContenedor) {
        navContenedor.innerHTML = ""; // Limpiar hardcoded
        
        // 2. Crear un botón de navegación para CADA LUGAR registrado en la base de datos
        lugares.forEach((lugarEncontrado) => {
            const btn = document.createElement("button");
            btn.className = "btn-nav";
            btn.innerText = lugarEncontrado.nombre; // El nombre visible que le diste en el CMS
            
            // Evento para cambiar de escena al hacer clic
            btn.addEventListener("click", () => {
                tourViewer.cargarEscenaPorId(lugarEncontrado.id);
            });
            
            navContenedor.appendChild(btn);
        });
    }

    // Listener para filtros por carrera
    const selectCarreras = document.getElementById("selectCarreras");
    if (selectCarreras) {
        selectCarreras.addEventListener("change", (e) => {
            uiController.filtrarPorCarrera(e.target.value, tourViewer);
        });
    }
}

    // Listener para filtros por carrera
    const selectCarreras = document.getElementById("selectCarreras");
    if (selectCarreras) {
        selectCarreras.addEventListener("change", (e) => {
            uiController.filtrarPorCarrera(e.target.value, tourViewer);
        });
    }
