import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Configuración con tus claves de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBOnHVSB_Mg_YcCopEDnm-Qg4IjRNNmXys",
  authDomain: "tour-virtual-tecmm.firebaseapp.com",
  projectId: "tour-virtual-tecmm",
  storageBucket: "tour-virtual-tecmm.firebasestorage.app",
  messagingSenderId: "890959572345",
  appId: "1:890959572345:web:d7f64047d74c6298aa13a8",
  measurementId: "G-LHWT7845Z4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let visorPannellum = null;
let listaLugares = [];

// Elementos del DOM
const tvLugarActual = document.getElementById("tvLugarActual");
const tvTituloLugar = document.getElementById("tvTituloLugar");
const tvDescripcion = document.getElementById("tvDescripcion");
const menuNavegacion = document.getElementById("menuNavegacion");

// 1. Escuchar lugares en tiempo real desde Firestore
onSnapshot(collection(db, "lugares"), (snapshot) => {
    listaLugares = [];
    menuNavegacion.innerHTML = "";

    if (snapshot.empty) {
        tvTituloLugar.innerText = "Sin áreas registradas";
        tvDescripcion.innerText = "Utiliza el panel CMS (admin.html) para registrar las primeras áreas del campus.";
        return;
    }

    snapshot.forEach((doc) => {
        listaLugares.push(doc.data());
    });

    // Generar botones de navegación por cada lugar registrado en el CMS
    listaLugares.forEach((lugar, index) => {
        const btn = document.createElement("button");
        btn.className = "btn-nav";
        btn.innerText = lugar.nombre;
        btn.addEventListener("click", () => mostrarLugar(lugar));
        menuNavegacion.appendChild(btn);
    });

    // Cargar automáticamente el primer lugar registrado
    if (listaLugares.length > 0) {
        mostrarLugar(listaLugares[0]);
    }
});

// 2. Cargar la imagen 360° en el visor de Pannellum
function mostrarLugar(lugar) {
    // Actualizar texto de información
    tvLugarActual.innerText = `Ubicación: ${lugar.nombre}`;
    tvTituloLugar.innerText = lugar.nombre;
    tvDescripcion.innerText = lugar.descripcion;

    // Si ya hay un visor activo, lo destruimos para renderizar la nueva área
    if (visorPannellum) {
        visorPannellum.destroy();
    }

    // Inicializar visor Pannellum
    visorPannellum = pannellum.viewer('panorama', {
        type: 'equirectangular',
        panorama: lugar.imagen, // Ruta local guardada desde el CMS (ej. assets/imagenes/biblioteca.jpg)
        autoLoad: true,
        autoRotate: -2, // Rotación suave automática
        compass: false,
        showZoomCtrl: true,
        showFullscreenCtrl: true
    });
}