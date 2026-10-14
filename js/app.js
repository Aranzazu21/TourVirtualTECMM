import { lugaresCampus } from './data/lugares.js';
import { TourViewer } from './modules/TourViewer.js';
import { UIController } from './modules/UIController.js';
import { Chatbot } from './modules/Chatbot.js';

// Mapeo de accesos directos del menú: 1=Entrada, 4=Básicas, 7=Industrial, 10=Sistemas
const indicesMenu = [1, 4, 7, 10];

window.addEventListener("DOMContentLoaded", () => {
    //Instanciar Controlador de Interfaz HTML
    const uiController = new UIController(lugaresCampus, indicesMenu);

    //Instanciar Motor 360° con callback de actualización
    const tourViewer = new TourViewer('panorama', lugaresCampus, (idEscenaActual) => {
        uiController.actualizarDetalles(idEscenaActual);
    });

    //Inicializar visor en la escena por defecto "entrada2"
    tourViewer.inicializar("entrada2");

    //Instanciar e inicializar Chatbot
    const chatbot = new Chatbot(tourViewer, uiController, lugaresCampus);
    chatbot.inicializar();

    //Configurar eventos de los botones del menú superior
    const botonesNav = document.querySelectorAll(".btn-nav");
    botonesNav.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
            const indexDestino = indicesMenu[idx];
            if (lugaresCampus[indexDestino]) {
                tourViewer.cargarEscenaPorId(lugaresCampus[indexDestino].id);
            }
        });
    });

    //Listener opcional para filtros por carrera
    const selectCarreras = document.getElementById("selectCarreras");
    if (selectCarreras) {
        selectCarreras.addEventListener("change", (e) => {
            uiController.filtrarPorCarrera(e.target.value, tourViewer);
        });
    }
});