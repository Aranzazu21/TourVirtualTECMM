// Almacena la información de cada escena (nodo) del recorrido virtual.
const lugaresCampus = [
    {
        id: "entrada", // Identificador único para referenciar esta escena desde los hotspots.
        nombre: "Acceso Exterior", // Nombre visible en la interfaz de usuario.
        categoria: "Accesos", // Categoría para agrupar en la interfaz.
        descripcion: "Vista exterior del acceso principal al TECMM Zapopan.", // Texto explicativo.
        imagen: "assets/imagenes/entrada.jpg", // Ruta relativa del archivo de imagen 360°.
        hotSpots: [ // Lista de puntos interactivos dentro de la esfera 360°.
            {
                pitch: -5, // Inclinación vertical en grados -90 abajo, 90 arriba.
                yaw: 180,  // Rotación horizontal en grados -180 a 180.
                type: "scene", // Tipo de hotspot: "scene" indica cambio de panorama.
                text: "Entrar al Campus (Torniquetes)", // Mensaje al pasar el cursor o tocar.
                sceneId: "entrada2" // ID del destino al hacer clic en este hotspot.
            }
        ]
    },
    {
        id: "entrada2",
        nombre: "Entrada Principal",
        categoria: "Accesos",
        descripcion: "Torniquetes de acceso peatonal e ingreso al campus.",
        imagen: "assets/imagenes/entrada2.jpg",
        hotSpots: [
            {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Salir hacia Acceso Exterior",
                sceneId: "entrada"
            },
            {
                pitch: -5,
                yaw: 180,
                type: "scene",
                text: "Avanzar por el pasillo principal",
                sceneId: "camino3"
            }
        ]
    },
    {
        id: "camino3",
        nombre: "Andador Principal I",
        categoria: "Andadores",
        descripcion: "Camino de ingreso rodeado de áreas verdes.",
        imagen: "assets/imagenes/camino3.jpg",
        hotSpots: [
            {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Volver a Entrada Principal",
                sceneId: "entrada2"
            },
            {
                pitch: -5,
                yaw: 180,
                type: "scene",
                text: "Avanzar hacia la plaza central",
                sceneId: "camino4"
            }
        ]
    },
    {
        id: "camino4",
        nombre: "Andador Principal II",
        categoria: "Andadores",
        descripcion: "Plaza central de distribución del campus.",
        imagen: "assets/imagenes/camino4.jpg",
        hotSpots: [
            {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Volver por Andador I",
                sceneId: "camino3"
            },
            {
                pitch: -5,
                yaw: 180,
                type: "scene",
                text: "Avanzar a Edificio B (Ciencias Básicas)",
                sceneId: "basicas5"
            }
        ]
    },
    {
        id: "basicas5",
        nombre: "Edificio B - Ciencias Básicas",
        categoria: "Aulas",
        descripcion: "Edificio de Ciencias Básicas y laboratorios generales.",
        imagen: "assets/imagenes/basicas5.jpg",
        hotSpots: [
            {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Regresar a Plaza Central",
                sceneId: "camino4"
            },
            {
                pitch: -5,
                yaw: 180,
                type: "scene",
                text: "Continuar por el andador lateral",
                sceneId: "camino6"
            }
        ]
    },
    {
        id: "camino6",
        nombre: "Andador Ciencias Básicas",
        categoria: "Andadores",
        descripcion: "Andador junto al Edificio B y áreas de descanso.",
        imagen: "assets/imagenes/camino6.jpg",
        hotSpots: [
            {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Volver a Ciencias Básicas",
                sceneId: "basicas5"
            },
            {
                pitch: -5,
                yaw: 180,
                type: "scene",
                text: "Avanzar hacia la techumbre / cafetería",
                sceneId: "camino7"
            }
        ]
    },
    {
        id: "camino7",
        nombre: "Área de convivencia (Techumbre)",
        categoria: "Servicios",
        descripcion: "Área techada de convivencia para estudiantes.",
        imagen: "assets/imagenes/camino7.jpg",
        hotSpots: [
            {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Volver por Andador Ciencias Básicas",
                sceneId: "camino6"
            },
            {
                pitch: -5,
                yaw: 180,
                type: "scene",
                text: "Avanzar a Edificio I (Ing. Industrial)",
                sceneId: "industrial8"
            }
        ]
    },
    {
        id: "industrial8",
        nombre: "Edificio I - Ing. Industrial",
        categoria: "Aulas",
        descripcion: "Edificio de Ingeniería Industrial y plazoleta de descanso.",
        imagen: "assets/imagenes/industrial8.jpg",
        hotSpots: [
            {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Volver a Techumbre",
                sceneId: "camino7"
            },
            {
                pitch: -5,
                yaw: 180,
                type: "scene",
                text: "Avanzar hacia la zona de cafeterías",
                sceneId: "camino9"
            }
        ]
    },
    {
        id: "camino9",
        nombre: "Zona de Cafeterías",
        categoria: "Servicios",
        descripcion: "Kioscos de comida y área arbolada.",
        imagen: "assets/imagenes/camino9.jpg",
        hotSpots: [
            {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Volver a Edificio de Ind. Industrial",
                sceneId: "industrial8"
            },
            {
                pitch: -5,
                yaw: 180,
                type: "scene",
                text: "Avanzar a Gazebos / Andador Final",
                sceneId: "camino10"
            }
        ]
    },
    {
        id: "camino10",
        nombre: "Andador Gazebos",
        categoria: "Andadores",
        descripcion: "Andador con sombrillas y bancas de estudio.",
        imagen: "assets/imagenes/camino10.jpg",
        hotSpots: [
            {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Volver a Zona de Cafeterías",
                sceneId: "camino9"
            },
            {
                pitch: -5,
                yaw: 180,
                type: "scene",
                text: "Avanzar a Lab. Sistemas Computacionales",
                sceneId: "sistemas"
            }
        ]
    },
    {
        id: "sistemas",
        nombre: "Edificio de Sistemas Computacionales",
        categoria: "Laboratorios",
        descripcion: "Laboratorios y aulas de Ingeniería en Sistemas Computacionales.",
        imagen: "assets/imagenes/sistemas.jpg",
        hotSpots: [
            {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Volver a Andador Gazebos",
                sceneId: "camino10"
            }
        ]
    }
];


// Se inicializa en null porque aún no hemos renderizado ningún panorama.
let visorPannellum = null;


// funciones de renderizado y navegacion 

/**
 * Función que busca el índice de un lugar usando su ID textual (ej: "entrada2")
 * y dispara la carga de dicho lugar.
 * @param {string} idLugar - El ID único definido en el arreglo lugaresCampus.
 */

function cargarLugarPorId(idLugar) {
    // Array.prototype.findIndex() recorre el arreglo 'lugaresCampus' y devuelve
    // el índice (posición 0, 1, 2...) del primer elemento que cumpla la condición.
    const lugarIndex = lugaresCampus.findIndex(l => l.id === idLugar);
    
    // Si encuentra el lugar (es decir, el índice no es -1), invoca a cargarLugar().
    if (lugarIndex !== -1) {
        cargarLugar(lugarIndex);
    }
}

/**
 * Función principal encargada de actualizar la interfaz Web y renderizar la imagen 360°.
 * @param {number} index - La posición numérica dentro del arreglo lugaresCampus.
 */
function cargarLugar(index) {
    // Extrae el objeto correspondiente a esa posición del arreglo.
    const lugar = lugaresCampus[index];

    // Document.getElementById() selecciona los elementos HTML por su ID
    // e innerText actualiza el texto mostrado en pantalla con los datos del lugar actual.
    document.getElementById("tvLugarActual").innerText = `${lugar.categoria} - ${lugar.nombre}`;
    document.getElementById("tvTituloLugar").innerText = lugar.nombre;
    document.getElementById("tvDescripcion").innerText = lugar.descripcion;

    // Control de memoria / limpieza de WebGL:
    // Si 'visorPannellum' contiene un visor previo, llamamos a destroy()
    // para liberar los recursos de tarjeta gráfica (GPU) y memoria RAM.
    if (visorPannellum) {
        try {
            visorPannellum.destroy();
        } catch (e) {
            console.warn("Visor previo destruido correctamente.");
        }
    }

    // pannellum.viewer() instancia el motor WebGL dentro del contenedor HTML con id 'panorama'.
    visorPannellum = pannellum.viewer('panorama', {
        "type": "equirectangular",  // Define el tipo de proyección fotográfica panorámica (2:1).
        "panorama": lugar.imagen,   // Ruta de la imagen que va a cargar.
        "autoLoad": true,          // Carga y procesa la imagen automáticamente sin pedir clic manual.
        "showControls": true,      // Muestra los botones de zoom (+, -) y pantalla completa en el visor.
        "mouseZoom": true,         // Permite hacer zoom in/out con la rueda del ratón.
        "draggable": true,         // Permite arrastrar la imagen con el mouse o con el dedo en pantallas táctiles.
        "disableKeyboardCtrl": false, // Habilita el control mediante flechas del teclado.
        
        // Parámetros de vista Campo de visión 
        "hfov": 80,                // Campo de visión horizontal inicial (Horizontal Field of View) en grados.
        "minHfov": 50,             // Zoom máximo permitido (evita acercarse demasiado y pixelar la foto).
        "maxHfov": 90,            // Zoom mínimo permitido (evita alejar tanto y deformar los bordes).
        "haov": 360,               // Ángulo de visión horizontal total disponible de la toma.
        "vaov": 120,               // Ángulo de visión vertical total disponible de la toma.
        "ignoreGPanoXMP": true,    // Ignora metadatos XMP incrustados que puedan desalinear la imagen.
        
        // Mapeo dinámico de hotspots:
        // Array.prototype.map() transforma cada hotspot del lugar en un objeto compatible con Pannellum.
        "hotSpots": lugar.hotSpots.map(hs => ({
            "pitch": hs.pitch, // Coordenada Y dentro de la esfera 360.
            "yaw": hs.yaw,     // Coordenada X dentro de la esfera 360.
            "type": hs.type,   // Tipo de punto.
            "text": hs.text,   // Etiqueta flotante.
            
            // clickHandlerFunc define la función que se ejecuta al presionar el hotspot.
            // Usamos una función flecha () => para delegar la navegación a cargarLugarPorId.
            "clickHandlerFunc": () => cargarLugarPorId(hs.sceneId)
        }))
    });

    // Actualización de estado en botones de la barra de navegación:
    // document.querySelectorAll selecciona todos los elementos HTML con la clase CSS '.btn-nav'.
    const botones = document.querySelectorAll(".btn-nav");
    
    // Mapeo manual de qué escena corresponde a cada botón de la barra superior.
    const indicesMenu = [1, 4, 7, 9]; // Posiciones en el arreglo entrada2, basicas5, industrial8, camino10

    // Element.classList.toggle('clase', condición) añade o remueve la clase CSS 'active'
    // dependiendo de si la escena actual coincide con el botón del menú.
    botones.forEach((btn, idx) => {
        btn.classList.toggle("active", indicesMenu[idx] === index);
    });
}


// window.addEventListener escucha eventos globales del navegador.
// "DOMContentLoaded" se dispara cuando todo el código HTML del documento ha sido cargado y procesado.
window.addEventListener("DOMContentLoaded", () => {
    // Inicia el recorrido directamente cargando la escena en el índice 1 ("entrada2").
    cargarLugar(1);
});
