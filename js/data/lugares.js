// Exportación del arreglo completo con los 17 nodos del campus
export const lugaresCampus = [
    {
        id: "entrada",
        nombre: "Acceso Exterior",
        categoria: "Accesos",
        carrera: "general",
        descripcion: "Vista exterior del acceso principal al TECMM Zapopan.",
        imagen: "assets/imagenes/entrada.jpg",
        hotSpots: [
            { pitch: -5, yaw: 180, type: "scene", text: "Entrar al Campus (Torniquetes)", sceneId: "entrada2" }
        ]
    },
    {
        id: "entrada2",
        nombre: "Entrada Principal",
        categoria: "Accesos",
        carrera: "general",
        descripcion: "Torniquetes de acceso peatonal e ingreso al campus.",
        imagen: "assets/imagenes/entrada2.jpg",
        hotSpots: [
            { pitch: -5, yaw: 180, type: "scene", text: "Salir hacia Acceso Exterior", sceneId: "entrada" },
            { pitch: -5, yaw: 270, type: "scene", text: "Avanzar por el pasillo principal", sceneId: "camino3" }
        ]
    },
    {
        id: "camino3",
        nombre: "Andador Principal I",
        categoria: "Andadores",
        carrera: "general",
        descripcion: "Camino de ingreso rodeado de áreas verdes.",
        imagen: "assets/imagenes/camino3.jpg",
        hotSpots: [
            { pitch: -5, yaw: 140, type: "scene", text: "Volver a Entrada Principal", sceneId: "entrada2" },
            { pitch: -5, yaw: 230, type: "scene", text: "Avanzar hacia la plaza central", sceneId: "camino4" },
            { pitch: -5, yaw: -30, type: "scene", text: "Avanzar edificio Electromecánica", sceneId: "caminoE1" }
        ]
    },
    {
        id: "camino4",
        nombre: "Andador Principal II",
        categoria: "Andadores",
        carrera: "general",
        descripcion: "Plaza central de distribución del campus.",
        imagen: "assets/imagenes/camino4.jpg",
        hotSpots: [
            { pitch: -5, yaw: 40, type: "scene", text: "Volver por Andador I", sceneId: "camino3" },
            { pitch: -5, yaw: 280, type: "scene", text: "Avanzar a Edificio B (Ciencias Básicas)", sceneId: "basicas5" }
        ]
    },
    {
        id: "basicas5",
        nombre: "Edificio B - Ciencias Básicas",
        categoria: "Aulas",
        carrera: "basicas",
        descripcion: "Edificio de Ciencias Básicas y laboratorios generales.",
        imagen: "assets/imagenes/basicas5.jpg",
        hotSpots: [
            { pitch: -5, yaw: 80, type: "scene", text: "Regresar a Plaza Central", sceneId: "camino4" },
            { pitch: -5, yaw: -80, type: "scene", text: "Continuar por el andador lateral", sceneId: "camino6" }
        ]
    },
    {
        id: "camino6",
        nombre: "Andador Ciencias Básicas",
        categoria: "Andadores",
        carrera: "basicas",
        descripcion: "Andador junto al Edificio B y áreas de descanso.",
        imagen: "assets/imagenes/camino6.jpg",
        hotSpots: [
            { pitch: -5, yaw: 0, type: "scene", text: "Volver a Ciencias Básicas", sceneId: "basicas5" },
            { pitch: -5, yaw: 210, type: "scene", text: "Avanzar hacia la techumbre / cafetería", sceneId: "camino7" }
        ]
    },
    {
        id: "camino7",
        nombre: "Área de convivencia (Techumbre)",
        categoria: "Servicios",
        carrera: "general",
        descripcion: "Área techada de convivencia para estudiantes.",
        imagen: "assets/imagenes/camino7.jpg",
        hotSpots: [
            { pitch: -5, yaw: 0, type: "scene", text: "Volver por Andador Ciencias Básicas", sceneId: "camino6" },
            { pitch: -5, yaw: 240, type: "scene", text: "Avanzar a Edificio I (Ing. Industrial)", sceneId: "industrial8" }
        ]
    },
    {
        id: "industrial8",
        nombre: "Edificio I - Ing. Industrial",
        categoria: "Aulas",
        carrera: "industrial",
        descripcion: "Edificio de Ingeniería Industrial y plazoleta de descanso.",
        imagen: "assets/imagenes/industrial8.jpg",
        hotSpots: [
            { pitch: -5, yaw: 60, type: "scene", text: "Volver a Techumbre", sceneId: "camino7" },
            { pitch: -5, yaw: 180, type: "scene", text: "Avanzar hacia la zona de cafeterías", sceneId: "camino9" }
        ]
    },
    {
        id: "camino9",
        nombre: "Zona de Cafeterías",
        categoria: "Servicios",
        carrera: "general",
        descripcion: "Kioscos de comida y área arbolada.",
        imagen: "assets/imagenes/camino9.jpg",
        hotSpots: [
            { pitch: -5, yaw: 0, type: "scene", text: "Volver a Edificio de Ind. Industrial", sceneId: "industrial8" },
            { pitch: -5, yaw: -80, type: "scene", text: "Avanzar a sistemas", sceneId: "camino10" }
        ]
    },
    {
        id: "camino10",
        nombre: "Andador palapas",
        categoria: "Andadores",
        carrera: "general",
        descripcion: "Andador con sombrillas y bancas de estudio.",
        imagen: "assets/imagenes/camino10.jpg",
        hotSpots: [
            { pitch: -5, yaw: 80, type: "scene", text: "Volver a Zona de Cafeterías", sceneId: "camino9" },
            { pitch: -5, yaw: -80, type: "scene", text: "Avanzar a Lab. Sistemas Computacionales", sceneId: "sistemas" }
        ]
    },
    {
        id: "sistemas",
        nombre: "Edificio de Sistemas Computacionales",
        categoria: "Laboratorios",
        carrera: "sistemas",
        descripcion: "Laboratorios y aulas de Ingeniería en Sistemas Computacionales.",
        imagen: "assets/imagenes/sistemas.jpg",
        hotSpots: [
            { pitch: -5, yaw: 180, type: "scene", text: "Volver a zona cafetería", sceneId: "camino10" },
            { pitch: -5, yaw: 80, type: "scene", text: "Ir a arquitectura", sceneId: "caminoA4" }
        ]
    },
    {
        id: "caminoA4",
        nombre: "Unión sistemas a arquitectura",
        categoria: "Andador",
        carrera: "general",
        descripcion: "Andador zona cafetería y papelería.",
        imagen: "assets/imagenes/caminoA4.jpg",
        hotSpots: [
            { pitch: -5, yaw: 200, type: "scene", text: "Ir a palapas", sceneId: "camino10" },
            { pitch: -5, yaw: 30, type: "scene", text: "Edificio de Sistemas Computacionales", sceneId: "sistemas" }
        ]
    },
    {
        id: "arquitectura2.1",
        nombre: "Edificio de Arquitectura",
        categoria: "Edificio",
        carrera: "arquitectura",
        descripcion: "Zona principal de talleres y estudios de arquitectura.",
        imagen: "assets/imagenes/arquitectura2.1.jpg",
        hotSpots: [
            { pitch: -5, yaw: 173, type: "scene", text: "Ir a conexión entre edificios", sceneId: "caminoE3" },
            { pitch: -5, yaw: -70, type: "scene", text: "Edificio de Sistemas Computacionales", sceneId: "sistemas" }
        ]
    },
    {
        id: "caminoE3",
        nombre: "Unión sistemas a arquitectura",
        categoria: "Andador",
        carrera: "general",
        descripcion: "Andador de enlace entre los edificios académicos.",
        imagen: "assets/imagenes/caminoE3.jpg",
        hotSpots: [
            { pitch: -5, yaw: 190, type: "scene", text: "Avanzar a crucero principal", sceneId: "caminoE2" },
            { pitch: -5, yaw: 10, type: "scene", text: "Edificio de Arquitectura", sceneId: "arquitectura2.1" }
        ]
    },
    {
        id: "caminoE2",
        nombre: "Crucero Principal de Edificios",
        categoria: "Andador",
        carrera: "general",
        descripcion: "Crucero principal entre Electromecánica, Industrial y Ciencias Básicas.",
        imagen: "assets/imagenes/caminoE2.jpg",
        hotSpots: [
            { pitch: -5, yaw: 230, type: "scene", text: "Ir a Electromecánica", sceneId: "electromecanica1.1" },
            { pitch: -5, yaw: 25, type: "scene", text: "Edificio Industrial", sceneId: "industrial8" },
            { pitch: -5, yaw: -30, type: "scene", text: "Ir a Ciencias Básicas", sceneId: "camino6" },
            { pitch: -5, yaw: 125, type: "scene", text: "Ir a Arquitectura", sceneId: "caminoE3" }
        ]
    },
    {
        id: "electromecanica1.1",
        nombre: "Edificio de Electromecánica",
        categoria: "Edificio",
        carrera: "electromecanica",
        descripcion: "Recinto principal de talleres y laboratorios de Electromecánica.",
        imagen: "assets/imagenes/electromecanica1.1.jpg",
        hotSpots: [
            { pitch: -5, yaw: 195, type: "scene", text: "Ir a andador de salida", sceneId: "caminoE1" },
            { pitch: -5, yaw: -50, type: "scene", text: "Ir a crucero principal", sceneId: "caminoE2" }
        ]
    },
    {
        id: "caminoE1",
        nombre: "Andador Electromecánica",
        categoria: "Andadores",
        carrera: "electromecanica",
        descripcion: "Andador arbolado adyacente a Electromecánica.",
        imagen: "assets/imagenes/caminoE1.jpg",
        hotSpots: [
            { pitch: -5, yaw: 135, type: "scene", text: "Ir a andador de enlace", sceneId: "caminoE3" },
            { pitch: -5, yaw: 35, type: "scene", text: "Edificio de Electromecánica", sceneId: "electromecanica1.1" }
        ]
    }
];