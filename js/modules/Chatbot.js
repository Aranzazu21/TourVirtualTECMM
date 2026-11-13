import { VoiceAssistant } from './VoiceAssistant.js';

export class Chatbot {
    constructor(tourViewer, uiController, lugares) {
        this.tourViewer = tourViewer;
        this.uiController = uiController;
        this.lugares = lugares || []; 
        this.mensajesContenedor = document.getElementById("chatMessages");
        this.inputMensaje = document.getElementById("chatInput");
        this.btnEnviar = document.getElementById("btnSendChat");

        this.asistenteVoz = new VoiceAssistant();
        this.reconocimientoVoz = null;

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

        if (btnLeer) {
            btnLeer.addEventListener("click", () => this.leerOpcionesEnVoz());
        }

        this.setupVoz();

        setTimeout(() => {
            this.mostrarOpciones("inicio");
        }, 600);
    }

    setupVoz() {
        const SpeechRec = window.webkitSpeechRecognition || window.SpeechRecognition;

        if (!SpeechRec) {
            console.warn("Reconocimiento de voz no disponible en este navegador.");
            const micBtn = document.getElementById('btn-mic');
            if (micBtn) micBtn.style.display = 'none';
            return;
        }

        this.reconocimientoVoz = new SpeechRec();
        this.reconocimientoVoz.continuous = false;
        this.reconocimientoVoz.interimResults = true;
        this.reconocimientoVoz.lang = 'es-MX';

        const btnMic = document.getElementById('btn-mic');
        const etiquetaBtn = document.getElementById('t-btnMic');

        this.reconocimientoVoz.onstart = () => {
            if (etiquetaBtn) etiquetaBtn.innerText = "🔴 Escuchando...";
            if (this.inputMensaje) this.inputMensaje.placeholder = "Escuchando... habla ahora";
        };

        this.reconocimientoVoz.onresult = (event) => {
            let textoTemporal = '';
            let textoDefinitivo = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    textoDefinitivo += event.results[i][0].transcript;
                } else {
                    textoTemporal += event.results[i][0].transcript;
                }
            }

            const textoEnPantalla = textoDefinitivo || textoTemporal;

            if (this.inputMensaje) {
                this.inputMensaje.value = textoEnPantalla;
            }

            if (textoDefinitivo.trim() !== '') {
                if (etiquetaBtn) etiquetaBtn.innerText = "🎙️ Hablar";
                this.procesarMensaje(textoDefinitivo.trim());
            }
        };

        this.reconocimientoVoz.onerror = (e) => {
            console.warn("Error en captura de voz:", e.error);
            if (etiquetaBtn) etiquetaBtn.innerText = "🎙️ Hablar";
            if (this.inputMensaje) this.inputMensaje.placeholder = "Ej. Llévame a Sistemas...";
        };

        this.reconocimientoVoz.onend = () => {
            if (etiquetaBtn) etiquetaBtn.innerText = "🎙️ Hablar";
            if (this.inputMensaje && !this.inputMensaje.value) {
                this.inputMensaje.placeholder = "Ej. Llévame a Sistemas...";
            }
        };

        const encenderMicrofono = () => {
            this.asistenteVoz.detener();
            try {
                this.reconocimientoVoz.start();
            } catch (err) {
                try {
                    this.reconocimientoVoz.stop();
                    setTimeout(() => this.reconocimientoVoz.start(), 150);
                } catch(e) {}
            }
        };

        if (btnMic) {
            btnMic.onclick = (e) => {
                e.preventDefault();
                encenderMicrofono();
            };
        }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && document.activeElement.id !== 'chatInput') {
                e.preventDefault();
                encenderMicrofono();
            }
        });
    }

    leerOpcionesEnVoz() {
        const opcionesTexto = "Bienvenido al Asistente Virtual. Las opciones disponibles son: Conocer Instalaciones 360, Oferta Académica, Admisión y Trámites, y Servicios del Campus.";
        this.asistenteVoz.hablar(opcionesTexto);
    }

    normalizarTexto(texto) {
        if (!texto || typeof texto !== "string") return "";
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^a-z0-9\s]/g, "")
            .trim();    
    }

    procesarMensaje(textoPersonalizado = null) {
        const textoEntrada = textoPersonalizado || this.inputMensaje.value;
        const textoLimpio = this.normalizarTexto(textoEntrada);

        if (textoLimpio === "") return;

        this.agregarMensaje(textoEntrada, "user");
        this.inputMensaje.value = "";

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
        }, 300);
    }

    buscarRespuesta(textoLimpio) {
        // 1. Verificación contra lugares (Firestore / dinámicos)
        if (this.lugares && Array.isArray(this.lugares) && this.lugares.length > 0) {
            for (const lugar of this.lugares) {
                let listaClaves = [];

                if (Array.isArray(lugar.keywords)) {
                    listaClaves = [...lugar.keywords];
                } else if (typeof lugar.keywords === 'string') {
                    listaClaves = lugar.keywords.split(',').map(k => k.trim());
                }

                if (lugar.nombre) listaClaves.push(lugar.nombre);
                if (lugar.id) listaClaves.push(lugar.id);

                const coincidencia = listaClaves.some(clave => {
                    const claveLimpia = this.normalizarTexto(clave);
                    return claveLimpia !== "" && textoLimpio.includes(claveLimpia);
                });

                if (coincidencia) {
                    return {
                        respuesta: lugar.mensajeVoz || `Te llevo a: ${lugar.nombre}...`,
                        targetId: lugar.id,
                        esFallback: false
                    };
                }
            }
        }

        // 2. Respaldo local de emergencia con los nodos del campus
        const respaldoLugares = [
            {
                id: "electromecanica",
                nombre: "Edificio Electromecánica",
                claves: ["electromecanica", "electro", "mecanica", "edificio e"],
                mensajeVoz: "Te llevo al Edificio de Electromecánica."
            },
            {
                id: "caminoe1",
                nombre: "Camino Electromecánica",
                claves: ["camino electromecanica", "camino electro"],
                mensajeVoz: "Te llevo al camino hacia Electromecánica."
            },
            {
                id: "caminoe2",
                nombre: "Andador 2 (Centro)",
                claves: ["andador", "andador 2", "centro", "andador central"],
                mensajeVoz: "Te llevo al Andador Central."
            },
            {
                id: "entrada",
                nombre: "Entrada Principal",
                claves: ["entrada", "entrada principal", "afuera", "acceso"],
                mensajeVoz: "Te llevo a la Entrada Principal."
            },
            {
                id: "entrada2",
                nombre: "Entrada (Por dentro)",
                claves: ["entrada por dentro", "adentro", "torniquetes", "ingreso"],
                mensajeVoz: "Te llevo al ingreso interior del campus."
            }
        ];

        for (const nodo of respaldoLugares) {
            const coincide = nodo.claves.some(c => textoLimpio.includes(this.normalizarTexto(c)));
            if (coincide) {
                return {
                    respuesta: nodo.mensajeVoz,
                    targetId: nodo.id,
                    esFallback: false
                };
            }
        }

        // 3. Verificación de preguntas frecuentes (FAQs)
        for (const faq of this.respuestasFAQ) {
            if (faq.claves.some(clave => textoLimpio.includes(this.normalizarTexto(clave)))) {
                return {
                    respuesta: faq.respuesta,
                    targetId: faq.targetId || null,
                    esFallback: false
                };
            }
        }

        // 4. Fallback si no hubo coincidencia
        return {
            respuesta: "No encontré una respuesta para eso. Elige una opción de aquí abajo o consulta en control escolar.",
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
                        this.asistenteVoz.hablar("Te dirijo al área seleccionada.");
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