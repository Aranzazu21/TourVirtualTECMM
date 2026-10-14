export class Chatbot {
    constructor(tourViewer, uiController, lugares) {
        this.tourViewer = tourViewer;
        this.uiController = uiController;
        this.lugares = lugares;
        this.mensajesContenedor = document.getElementById("chatMessages");
        this.inputMensaje = document.getElementById("chatInput");
        this.btnEnviar = document.getElementById("btnSendChat");

        //Árbol de navegación interactivo 
        this.arbolOpciones = {
            inicio: [
                { texto: " Conocer Instalaciones 360°", accion: "menu_instalaciones" },
                { texto: " Oferta Académica (Carreras)", accion: "menu_carreras" },
                { texto: " Admisión y Trámites", accion: "menu_admision" },
                { texto: " Servicios del Campus", accion: "menu_servicios" }
            ],
            menu_instalaciones: [
                { texto: " Edificio de Sistemas", targetId: "sistemas" },
                { texto: " Ciencias Básicas (Edificio B)", targetId: "basicas5" },
                { texto: " Ing. Industrial (Edificio I)", targetId: "industrial8" },
                { texto: " Arquitectura", targetId: "arquitectura2.1" },
                { texto: " Electromecánica", targetId: "electromecanica1.1" },
                { texto: " Zona de Cafeterías", targetId: "camino9" },
                { texto: "↩ Volver al Menú Principal", accion: "inicio" }
            ],
            menu_carreras: [
                { texto: "Ing. en Sistemas Computacionales", info: "Formación en desarrollo de software, redes e inteligencia artificial.", targetId: "sistemas" },
                { texto: "Ing. Industrial", info: "Enfoque en optimización de procesos, logística y calidad.", targetId: "industrial8" },
                { texto: "Arquitectura", info: "Diseño urbano, construcción sustentable y talleres tridimensionales.", targetId: "arquitectura2.1" },
                { texto: "Ing. Electromecánica", info: "Mantenimiento industrial, automatización y sistemas eléctricos.", targetId: "electromecanica1.1" },
                { texto: "↩ Volver al Menú Principal", accion: "inicio" }
            ],
            menu_admision: [
                { texto: " Requisitos de Ingreso", info: "Para ingresar necesitas: Certificado de Bachillerato, CURP, Acta de Nacimiento y realizar el examen de admisión." },
                { texto: " Horarios de Atención", info: "Control Escolar atiende de Lunes a Viernes de 9:00 AM a 6:00 PM." },
                { texto: " Costos y Fichas", info: "La ficha de admisión y las cuotas de semestres se consultan directamente en el portal oficial tecmm.edu.mx." },
                { texto: "↩ Volver al Menú Principal", accion: "inicio" }
            ],
            menu_servicios: [
                { texto: " Cafeterías y Comida", targetId: "camino9" },
                { texto: " Biblioteca Central", info: "Ubicada a un costado del edificio principal, cuenta con salas de estudio y préstamo de libros." },
                { texto: " Rutas de Transporte", info: "Al campus Zapopan llegan rutas de transporte público como T16-B (633), 275-B y transporte de apoyo en Tesistán." },
                { texto: "↩ Volver al Menú Principal", accion: "inicio" }
            ]
        };

        
        this.respuestasFAQ = [
            {
                claves: ["sistemas", "computacion", "programacion", "computadoras", "software", "codigo", "sistemas computacionales","edificio L","jefa de carrera sistemas "],
                respuesta: "En el Edificio de Sistemas Computacionales se imparten las materias de programación, redes e IA. Te llevo al visor 360°...",
                targetId: "sistemas"
            },
            {
                claves: ["basicas", "edificio b", "laboratorios generales", "quimica", "fisica", "matematicas","control escolar"],
                respuesta: "El Edificio B es el núcleo de Ciencias Básicas donde tomarás tus primeros semestres de matemáticas y física. Vamos allá...",
                targetId: "basicas5"
            },
            {
                claves: ["industrial", "edificio i", "produccion", "logistica", "calidad"],
                respuesta: "El Edificio I alberga la carrera de Ingeniería Industrial. Te dirijo a su plazoleta principal...",
                targetId: "industrial8"
            },
            {
                claves: ["arquitectura", "talleres", "diseno", "dibujo", "planos","edificio a"],
                respuesta: "El Edificio de Arquitectura cuenta con talleres equipados con restiradores y espacio para maquetas. Te ubico en la zona...",
                targetId: "arquitectura2.1"
            },
            {
                claves: ["electromecanica", "maquinas", "mecanica", "electricidad", "motores", "automatizacion","edificio e"],
                respuesta: "El recinto de Electromecánica cuenta con talleres de control, robótica y maquinaria pesada. Te llevo allí...",
                targetId: "electromecanica1.1"
            },
            {
                claves: ["comida", "cafeteria", "comer", "kiosco", "palapas", "hambre", "almuerzo", "papas", "refresco"],
                respuesta: "La zona de cafeterías y palapas cuenta con locales de comida y sombrillas para descansar o comer. Vamos para allá...",
                targetId: "camino9"
            },
            {
                claves: ["entrada", "ingreso", "torniquetes", "acceso", "puerta", "salida"],
                respuesta: "Te regreso al acceso peatonal principal con los torniquetes de seguridad...",
                targetId: "entrada2"
            },
            {
                claves: ["horario", "hora", "abierto", "cerrado", "atencion"],
                respuesta: "El campus está abierto para clases de 7:00 AM a 9:00 PM. Las oficinas administrativas atienden de 8:00 AM a 6:00 PM."
            },
            {
                claves: ["inscripcion", "ficha", "admision", "nuevo ingreso", "requisitos", "costo", "pagos"],
                respuesta: "Para trámites de nuevo ingreso debes solicitar tu ficha en tecmm.edu.mx. Se requiere certificado de bachillerato, CURP y acta de nacimiento."
            },
            {
                claves: ["transporte", "camion", "bus", "ruta", "llegar", "ubicacion", "como llego"],
                respuesta: "El TECMM Zapopan se ubica en Tesistán. Puedes llegar en las rutas de autobús T16-B (633), 275-B o conectando desde el Tren Ligero (Línea 3 Estación Arcos de Zapopan)."
            },
            {
                claves: ["wifi", "internet", "red"],
                respuesta: "El campus cuenta con cobertura de red WiFi institucional para alumnos activos. Solicita tus accesos en la coordinación de Sistemas."
            },
            {
                claves: ["hola", "buenos dias", "buenas tardes", "que tal", "saludos", "inicio"],
                respuesta: "¡Hola! Bienvenidos al Recorrido Virtual del TECMM Zapopan. ¿En qué te puedo ayudar hoy?"
            }
        ];
    }

    inicializar() {
        if (this.btnEnviar && this.inputMensaje) {
            this.btnEnviar.addEventListener("click", () => this.procesarMensaje());
            this.inputMensaje.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.procesarMensaje();
            });
        }

        // Control para minimizar y reabrir el asistente
        const chatWidget = document.getElementById("chatWidget");
        const btnMinimizar = document.getElementById("btnMinimizarChat");
        const btnAbrir = document.getElementById("btnAbrirChat");

        if (btnMinimizar && btnAbrir && chatWidget) {
            btnMinimizar.addEventListener("click", () => {
                chatWidget.classList.add("minimizado");
                btnAbrir.style.display = "flex";
            });

            btnAbrir.addEventListener("click", () => {
                chatWidget.classList.remove("minimizado");
                btnAbrir.style.display = "none";
            });
        }

        // Carga los botones de opciones iniciales al cargar la página
        setTimeout(() => {
            this.mostrarOpciones("inicio");
        }, 600);
    }

    
    normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^a-z0-9\s]/g, "");    
    }

    procesarMensaje(textoPersonalizado = null) {
        const textoEntrada = textoPersonalizado || this.inputMensaje.value;
        const textoLimpio = this.normalizarTexto(textoEntrada);

        if (textoLimpio.trim() === "") return;

        // Si fue escrito por el usuario en el input, muestra su mensaje
        if (!textoPersonalizado) {
            this.agregarMensaje(this.inputMensaje.value, "user");
            this.inputMensaje.value = "";
        }

        setTimeout(() => {
            const resultado = this.buscarRespuesta(textoLimpio);
            this.agregarMensaje(resultado.respuesta, "bot");

            // Si la respuesta incluye mover la cámara 360°
            if (resultado.targetId && this.tourViewer) {
                this.tourViewer.cargarEscenaPorId(resultado.targetId);
            }

            // Si no se encontró una coincidencia clara (Fallback), muestra los botones de ayuda
            if (resultado.esFallback) {
                this.mostrarOpciones("inicio");
            }
        }, 400);
    }

    buscarRespuesta(textoLimpio) {
        for (const faq of this.respuestasFAQ) {
            if (faq.claves.some(clave => textoLimpio.includes(this.normalizarTexto(clave)))) {
                return {
                    respuesta: faq.respuesta,
                    targetId: faq.targetId || null,
                    esFallback: false
                };
            }
        }

        
        return {
            respuesta: "No encontré una respuesta exacta para tu consulta. Puedes seleccionar una de las siguientes opciones o comunicarte a la extensión de Control Escolar del campus:",
            targetId: null,
            esFallback: true
        };
    }

    mostrarOpciones(categoria) {
        const opciones = this.arbolOpciones[categoria];
        if (!opciones) return;

        const contenedorBotones = document.createElement("div");
        contenedorBotones.className = "chat-chips-container";

        opciones.forEach(op => {
            const btn = document.createElement("button");
            btn.className = "chat-chip";
            btn.innerText = op.texto;

            btn.addEventListener("click", () => {
                this.agregarMensaje(op.texto, "user");

                setTimeout(() => {
                    if (op.info) {
                        this.agregarMensaje(op.info, "bot");
                    }

                    if (op.targetId && this.tourViewer) {
                        this.tourViewer.cargarEscenaPorId(op.targetId);
                    }

                    if (op.accion) {
                        this.mostrarOpciones(op.accion);
                    }
                }, 300);
            });

            contenedorBotones.appendChild(btn);
        });

        if (this.mensajesContenedor) {
            this.mensajesContenedor.appendChild(contenedorBotones);
            this.mensajesContenedor.scrollTop = this.mensajesContenedor.scrollHeight;
        }
    }

    agregarMensaje(texto, emisor) {
        if (!this.mensajesContenedor) return;
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-message ${emisor}`;
        msgDiv.innerText = texto;
        this.mensajesContenedor.appendChild(msgDiv);
        this.mensajesContenedor.scrollTop = this.mensajesContenedor.scrollHeight;
    }
}