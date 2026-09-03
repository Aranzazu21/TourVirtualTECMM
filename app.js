// Datos de los puntos de interés del campus TECMM Zapopan
const lugaresCampus = [
    {
        id: 1,
        nombre: "Entrada Principal",
        categoria: "Accesos",
        descripcion: "Acceso principal al Instituto Tecnológico Superior de Zapopan (TECMM). Punto de registro y bienvenida.",
        // Enlace incrustado de Google Maps Street View 360
        url360: "https://www.google.com/maps/embed?pb=!1m0!4m2!3m1!1s0x8428a93e3612f00f:0x6b876939b4b0e513!3m1!1e3"
    },
    {
        id: 2,
        nombre: "Edificio posgrados ",
        categoria: "Aulas",
        descripcion: "Aulas principales de clases, coordinación académica y áreas directivas del campus.",
        url360: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3731.839811804245!2d-103.45868!3d20.7328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDQzJzfdOC4xIk4gMTAzwrAyNyczMS4yIlc!5e0!3m2!1ses!2smx!4v1600000000000"
    },
    {
        id: 3,
        nombre: "Laboratorios de Ingeniería en Sistemas",
        categoria: "Laboratorios",
        descripcion: "Laboratorios de desarrollo de software, redes, inteligencia artificial e infraestructura técnica.",
        url360: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3731.839811804245!2d-103.45868!3d20.7328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDQzJzfdOC4xIk4gMTAzwrAyNyczMS4yIlc!5e0!3m2!1ses!2smx!4v1600000000000"
    },
    {
        id: 4,
        nombre: "Edificios Bassicas",
        categoria: "Servicios",
        descripcion: "Área de consulta bibliográfica, acervo digital y salas de estudio colaborativo.",
        url360: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3731.839811804245!2d-103.45868!3d20.7328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDQzJzfdOC4xIk4gMTAzwrAyNyczMS4yIlc!5e0!3m2!1ses!2smx!4v1600000000000"
    }
];

// Función para cambiar la ubicación activa
function cargarLugar(index) {
    const lugar = lugaresCampus[index];

    // Actualizar Textos
    // Buscamos el elemento HTML por su 'id' y modificamos su propiedad
    document.getElementById("tvLugarActual").innerText = `${lugar.categoria} - ${lugar.nombre}`;
    document.getElementById("tvTituloLugar").innerText = lugar.nombre;
    document.getElementById("tvDescripcion").innerText = lugar.descripcion;

    // Actualizar el visor 360 iframe
    document.getElementById("visor360").src = lugar.url360;

    // Actualizar la clase del botón activo
    const botones = document.querySelectorAll(".btn-nav");
    botones.forEach((btn, idx) => {
        if (idx === index) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// Cargar primer lugar automáticamente al iniciar
window.addEventListener("DOMContentLoaded", () => {
    cargarLugar(0);
});