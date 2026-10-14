// Importamos la conexión a BD desde nuestro nuevo servicio
import { db } from "./js/services/FirebaseService.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

let visorPannellum = null;
let listaLugares = [];

const tvLugarActual = document.getElementById("tvLugarActual");
const tvTituloLugar = document.getElementById("tvTituloLugar");
const tvDescripcion = document.getElementById("tvDescripcion");
const menuNavegacion = document.getElementById("menuNavegacion");

// 1. Escuchar áreas en tiempo real desde Firestore
onSnapshot(collection(db, "lugares"), (snapshot) => {
    listaLugares = [];
    menuNavegacion.innerHTML = "";

    if (snapshot.empty) {
        tvTituloLugar.innerText = "Sin áreas registradas";
        tvDescripcion.innerText = "Utiliza el panel CMS para registrar áreas.";
        return;
    }

    snapshot.forEach((doc) => {
        listaLugares.push(doc.data());
    });

    // Crear botones en el menú
    listaLugares.forEach((lugar) => {
        const btn = document.createElement("button");
        btn.className = "btn-nav";
        btn.innerText = lugar.nombre;
        btn.addEventListener("click", () => mostrarLugar(lugar));
        menuNavegacion.appendChild(btn);
    });

    // Cargar primer lugar automáticamente
    if (listaLugares.length > 0 && !visorPannellum) {
        mostrarLugar(listaLugares[0]);
    }
});

// 2. Renderizar área en Pannellum
function mostrarLugar(lugar) {
    tvLugarActual.innerText = `Ubicación: ${lugar.nombre}`;
    tvTituloLugar.innerText = lugar.nombre;
    tvDescripcion.innerText = lugar.descripcion;

    if (visorPannellum) {
        visorPannellum.destroy();
    }

    // Formatear los hotspots guardados
    const hotSpotsFormateados = (lugar.hotSpots || []).map((hs) => ({
        pitch: hs.pitch,
        yaw: hs.yaw,
        type: "info",
        text: hs.texto || `Ir a ${hs.destinoId}`,
        clickHandlerFunc: () => cambiarAEscenaPorId(hs.destinoId)
    }));

    visorPannellum = pannellum.viewer('panorama', {
        type: 'equirectangular',
        panorama: lugar.imagen,
        autoLoad: true,
        autoRotate: -1,
        showZoomCtrl: true,
        showFullscreenCtrl: true,
        hotSpots: hotSpotsFormateados
    });

    // Herramienta para obtener coordenadas haciendo clic en la foto (Míralas en consola con F12)
    visorPannellum.on('mousedown', (e) => {
        const coords = visorPannellum.mouseEventToCoords(e);
        console.log(`📍 Coordenadas -> Pitch: ${coords[0].toFixed(2)}, Yaw: ${coords[1].toFixed(2)}`);
    });
}

// 3. Transición entre áreas
function cambiarAEscenaPorId(destinoId) {
    const lugarDestino = listaLugares.find(l => l.id === destinoId);
    if (lugarDestino) {
        mostrarLugar(lugarDestino);
    } else {
        alert("El área de destino no se encuentra disponible.");
    }
}