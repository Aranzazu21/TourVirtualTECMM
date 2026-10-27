import { VoiceAssistant } from './VoiceAssistant.js';

export class Chatbot {
    constructor(tourViewer, uiController, lugares) {
        this.tourViewer = tourViewer;
        this.uiController = uiController;
        this.lugares = lugares; 
        this.mensajesContenedor = document.getElementById("chatMessages");
        this.inputMensaje = document.getElementById("chatInput");
        this.btnEnviar = document.getElementById("btnSendChat");

        this.asistenteVoz = new VoiceAssistant();

        this.arbolOpciones = {
            inicio: [
                { texto: " Conocer Instalaciones 360°", accion: "menu_instalaciones" },
                { texto: " Oferta Académica (Carreras)", accion: "menu_carreras" },
                { texto: " Admisión y Trámites", accion: "menu_admision" },
                { texto: " Servicios del Campus", accion: "menu_servicios" }
            ],
            menu_instalaciones: [
                { texto: " Entrada Principal", targetId: "entrada" },
                { texto: " Entrada (Por dentro)", targetId: "entrada2" },
                { texto: " Andador 2 (Centro)", targetId: "caminoe2" },
                { texto: " Camino Electromecánica", targetId: "caminoe1" },
                { texto: " Edificio Electromecánica", targetId: "electromecanica" },
                { texto: "↩ Volver al Menú Principal", accion: "inicio" }
            ],
            menu_carreras: [
                { texto: "Ing. Electromecánica", info: "Mantenimiento industrial, automatización y sistemas eléctricos.", targetId: "electromecanica" },
                { texto: "↩ Volver al Menú Principal", accion: "inicio" }
            ],
            menu_admision: [
                { texto: " Requisitos de Ingreso", info: "Para ingresar necesitas: certificado de bachillerato, curp, acta de nacimiento y realizar el examen de admision." },
                { texto: " Horarios de Atención", info: "Control escolar atiende de lunes a viernes de 9:00 am a 6:00 pm." },
                { texto: " Costos y Fichas", info: "La ficha de admision y las cuotas de semestres se consultan directamente en el portal oficial tecmm.edu.mx." },
                { texto: "↩ Volver al Menú Principal", accion: "inicio" }
            ],
            menu_servicios: [
                { texto: " Rutas de Transporte", info: "Al campus zapopan llegan rutas de transporte publico como t16-b (633), 275-b y transporte de apoyo en tesistan." },
                { texto: "↩ Volver al Menú Principal", accion: "inicio" }
            ]
        };

        this.respuestasFAQ = [
            {
                claves: ["horario", "hora", "abierto", "cerrado", "atencion"],
                respuesta: "El campus esta abierto para clases de 7:00 am a 9:00 pm. las oficinas administrativas atienden de 8:00 am a 6:00 pm."
            },
            {
                claves: ["inscripcion", "ficha", "admision", "nuevo ingreso", "requisitos", "costo", "pagos"],
                respuesta: "Para tramites de nuevo ingreso debes solicitar tu ficha en tecmm.edu.mx. se requiere certificado de bachillerato, curp y acta de nacimiento."
            },
            {
                claves: ["transporte", "camion", "bus", "ruta", "llegar", "ubicacion", "como llego"],
                respuesta: "El tecmm zapopan se ubica en tesistan. puedes llegar en las rutas de autobus t16-b (633), 275-b o conectando desde el tren ligero."
            },
            {
                claves: ["hola", "buenos dias", "buenas tardes", "que tal", "saludos", "inicio"],
                respuesta: "Hola! bienvenidos al recorrido virtual del tecmm zapopan. en que te puedo ayudar hoy?"
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

        const chatWidget = document.getElementById("chatWidget");
        const btnMinimizar = document.getElementById("btnMinimizarChat");
        const btnAbrir = document.getElementById("btnAbrirChat");
        const btnLeer = document.getElementById("btnLeerOpciones");

        if (btnMinimizar && btnAbrir && chatWidget) {
            btnMinimizar.addEventListener("click", () => {
                chatWidget.classList.add("minimizado");
                btnAbrir.style.display = "flex";
                this.asistenteVoz.detener(); 
            });

            btnAbrir.addEventListener("click", () => {
                chatWidget.classList.remove("minimizado");
                btnAbrir.style.display = "none";
            });
        }

        // Conectar el botón de lectura de opciones visual
        if (btnLeer) {
            btnLeer.addEventListener("click", () => this.leerOpcionesEnVoz());
        }

        // Iniciar configuración del micrófono
        this.configurarReconocimientoVoz();

        setTimeout(() => {
            this.mostrarOpciones("inicio");
        }, 600);
    }

    // --- FUNCIONES DE ACCESIBILIDAD ---
    leerOpcionesEnVoz() {
        const opcionesTexto = "Bienvenido al Asistente Virtual. Las opciones disponibles son: Conocer Instalaciones 360, Oferta Académica, Admisión y Trámites, y Servicios del Campus. Puedes presionar la barra espaciadora en cualquier momento para hablarme.";
        const locucion = new SpeechSynthesisUtterance(opcionesTexto);
        locucion.lang = 'es-MX'; 
        locucion.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(locucion);
    }

    configurarReconocimientoVoz() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const reconocimiento = new SpeechRecognition();
            reconocimiento.lang = 'es-MX';
            reconocimiento.continuous = false;
            reconocimiento.interimResults = false;

            const activarMic = () => {
                const aviso = new SpeechSynthesisUtterance("Te escucho, ¿a dónde quieres ir?");
                aviso.lang = 'es-MX';
                aviso.onend = () => reconocimiento.start();
                
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(aviso);
            };

            reconocimiento.onresult = (evento) => {
                const comandoVoz = evento.results[0][0].transcript;
                if (this.inputMensaje && this.btnEnviar) {
                    this.inputMensaje.value = comandoVoz;
                    this.btnEnviar.click();
                }
            };

            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && document.activeElement.id !== 'chatInput') {
                    e.preventDefault();
                    activarMic();
                }
            });
        } else {
            console.warn("Tu navegador no soporta reconocimiento de voz.");
        }
    }
    // ----------------------------------

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

        if (!textoPersonalizado) {
            this.agregarMensaje(this.inputMensaje.value, "user");
            this.inputMensaje.value = "";
        }

        setTimeout(() => {
            const resultado = this.buscarRespuesta(textoLimpio);
            this.agregarMensaje(resultado.respuesta, "bot");
            
            this.asistenteVoz.hablar(resultado.respuesta);

            if (resultado.targetId && this.tourViewer) {
                this.tourViewer.cargarEscenaPorId(resultado.targetId);
            }

            if (resultado.esFallback) {
                this.mostrarOpciones("inicio");
            }
        }, 400);
    }

    buscarRespuesta(textoLimpio) {
        if (this.lugares && this.lugares.length > 0) {
            for (const lugar of this.lugares) {
                if (lugar.keywords && Array.isArray(lugar.keywords)) {
                    const coincidencia = lugar.keywords.some(clave => 
                        textoLimpio.includes(this.normalizarTexto(clave))
                    );

                    if (coincidencia) {
                        return {
                            respuesta: lugar.mensajeVoz || `te llevo a: ${lugar.nombre}...`,
                            targetId: lugar.id,
                            esFallback: false
                        };
                    }
                }
            }
        }

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
            respuesta: "no encontre una respuesta para eso. elige una opcion de aqui abajo o llama a control escolar.",
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
                        this.asistenteVoz.hablar(op.info); 
                    } else if (op.targetId) {
                        this.asistenteVoz.hablar("te dirijo al area que seleccionaste.");
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