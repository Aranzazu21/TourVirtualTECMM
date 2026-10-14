import { db } from "./services/FirebaseService.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

let visorPannellum = null;
let listaLugares = [];
let lugarActualId = null;

const tvLugarActual = document.getElementById("tvLugarActual");
const tvTituloLugar = document.getElementById("tvTituloLugar");
const tvDescripcion = document.getElementById("tvDescripcion");
const menuNavegacion = document.getElementById("menuNavegacion");
const selectFiltro = document.getElementById("selectCarreras");

// 1. Escuchar áreas en tiempo real desde Firestore
onSnapshot(collection(db, "lugares"), (snapshot) => {
    listaLugares = [];
    
    if (snapshot.empty) {
        tvTituloLugar.innerText = "Sin áreas registradas";
        tvDescripcion.innerText = "Utiliza el panel CMS para registrar áreas.";
        return;
    }

    snapshot.forEach((doc) => {
        listaLugares.push(doc.data());
    });

    // Renderizar botones la primera vez
    renderizarBotonesMenu("todas");

    // Cargar primer lugar automáticamente si no hay uno activo
    if (listaLugares.length > 0 && !visorPannellum) {
        mostrarLugar(listaLugares[0]);
    }
});

// 2. Función para pintar los botones de navegación (con soporte de filtro)
function renderizarBotonesMenu(categoriaFiltro) {
    menuNavegacion.innerHTML = ""; // Limpiar menú
    
    let lugaresFiltrados = listaLugares;
    if(categoriaFiltro !== "todas") {
        lugaresFiltrados = listaLugares.filter(l => l.categoria === categoriaFiltro);
    }

    if(lugaresFiltrados.length === 0) {
        menuNavegacion.innerHTML = '<span style="color:white; font-size:0.85rem;">No hay áreas en esta categoría</span>';
        return;
    }

    lugaresFiltrados.forEach((lugar) => {
        const btn = document.createElement("button");
        btn.className = "btn-nav";
        // Si el botón que estamos creando es el del área actual, lo marcamos como activo
        if(lugar.id === lugarActualId) {
            btn.classList.add("active");
        }
        btn.innerText = lugar.nombre;
        btn.addEventListener("click", () => mostrarLugar(lugar));
        menuNavegacion.appendChild(btn);
    });
}

// 3. Escuchar cambios en el selector de categorías (Filtro)
selectFiltro.addEventListener("change", (e) => {
    renderizarBotonesMenu(e.target.value);
});


// 4. Renderizar área en Pannellum
function mostrarLugar(lugar) {
    lugarActualId = lugar.id; // Guardar ID actual para iluminar el botón
    renderizarBotonesMenu(selectFiltro.value); // Refrescar los botones para actualizar la clase "active"

    tvLugarActual.innerText = lugar.nombre;
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
}

// 5. Transición entre áreas mediante Hotspots
function cambiarAEscenaPorId(destinoId) {
    const lugarDestino = listaLugares.find(l => l.id === destinoId);
    if (lugarDestino) {
        mostrarLugar(lugarDestino);
    } else {
        alert("El área de destino no se encuentra disponible.");
    }
}