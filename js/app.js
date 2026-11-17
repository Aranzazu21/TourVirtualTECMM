import { Hotspots } from './modules/Hotspots.js';
import { db } from "./services/FirebaseService.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { BuzonManager } from './modules/BuzonManager.js';
import { TourViewer } from './modules/TourViewer.js';
import { UIController } from './modules/UIController.js';
import { Chatbot } from './modules/Chatbot.js';

let lugaresCampusNube = [];
let tourViewer = null;
let uiController = null;
let chatbot = null;

window.addEventListener("DOMContentLoaded", () => {
    const buzon = new BuzonManager();
    buzon.inicializarVistaUsuario();
    
    // escuchar la base de datos en tiempo real
    onSnapshot(collection(db, "lugares"), (snapshot) => {
        lugaresCampusNube = [];

        if (snapshot.empty) {
            console.warn("No hay áreas registradas en Firebase aún.");
            return;
        }

        // transformar los datos de firebase al formato del tour y chatbot
        snapshot.forEach((doc) => {
            const data = doc.data();
            
            lugaresCampusNube.push({
                id: data.id || doc.id,
                nombre: data.nombre || "",
                categoria: data.categoria || "General",
                carrera: data.categoria || "general",
                descripcion: data.descripcion || "",
                imagen: data.imagen || "",
                keywords: data.keywords || [],
                mensajeVoz: data.mensajeVoz || "",
                hotSpots: Hotspots.mapearDesdeFirebase(data.hotSpots)
            });
        });

        // si es la primera vez que carga inicializamos todo el sistema
        if (!tourViewer && lugaresCampusNube.length > 0) {
            inicializarSistema(lugaresCampusNube);
        } else if (tourViewer) {
            // actualizar los datos del chatbot en tiempo real si se edita algo en el admin
            if (chatbot) {
                chatbot.lugares = lugaresCampusNube;
            }
            console.log("Se detectaron cambios en la BD. Recarga la página para aplicar los nuevos nodos.");
        }
    });
});

function inicializarSistema(lugares) {
    const todosLosIds = lugares.map(lugar => lugar.id);

    // instanciar controlador de interfaz html
    uiController = new UIController(lugares, todosLosIds);

    // instanciar motor 360 con callback para actualizar la ui al cambiar de escena
    tourViewer = new TourViewer('panorama', lugares, (idEscenaActual) => {
        uiController.actualizarDetalles(idEscenaActual);
        
        // actualizar la etiqueta superior con el nombre del lugar actual
        const lugarActual = lugares.find(l => l.id === idEscenaActual);
        const tvLugarActual = document.getElementById("tvLugarActual");
        if (tvLugarActual && lugarActual) {
            tvLugarActual.innerText = lugarActual.nombre;
        }
    });

    // forzar siempre el inicio en la entrada principal
    const escenaInicial = lugares.some(lugar => lugar.id === "entrada") ? "entrada" : (lugares[0] ? lugares[0].id : "entrada");
    
    tourViewer.inicializar(escenaInicial);

    // instanciar chatbot
    chatbot = new Chatbot(tourViewer, uiController, lugares);
    chatbot.inicializar();

    // logica del menu desplegable rapido con filtro
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

    // filtros
    const selectCarreras = document.getElementById("selectCarreras");
    if (selectCarreras) {
        selectCarreras.addEventListener("change", (e) => {
            uiController.filtrarPorCarrera(e.target.value, tourViewer);
        });
    }
}