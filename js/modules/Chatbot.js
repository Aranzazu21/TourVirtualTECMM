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
        this.modoManosLibres = false;

        this.arbolOpciones = {
            inicio: [
                { texto: "🏢 Edificios Académicos", accion: "menu_edificios" },
                { texto: "⚽ Canchas y Laboratorios", accion: "menu_deportes_labs" },
                { texto: "🚪 Accesos y Entradas", accion: "menu_accesos" },
                { texto: "🚶 Andadores del Campus", accion: "menu_andadores" },
                { texto: "🎓 Oferta Académica (Carreras)", accion: "menu_carreras" },
                { texto: "📝 Admisión y Servicios", accion: "menu_admision" }
            ],
            menu_carreras: [
                { texto: "💻 Ing. en Sistemas", info: "Desarrollo de software, redes y tecnologías de la información.", buscar: "sistemas" },
                { texto: "⚙️ Ing. Electromecánica", info: "Mantenimiento industrial, automatización y sistemas eléctricos.", buscar: "electromecanica" },
                { texto: "🏭 Ing. Industrial", info: "Manufactura, control de calidad y optimización de procesos.", buscar: "industrial" },
                { texto: "🏛️ Arquitectura", info: "Diseño arquitectónico, urbanismo y talleres de proyección.", buscar: "arquitectura" },
                { texto: "🍳 Lic. en Gastronomía", info: "Artes culinarias, panadería y cocinas industriales de práctica.", buscar: "gastronomia" },
                { texto: "🎓 Posgrados", info: "Maestrías e investigación aplicada en el campus.", buscar: "posgrados" },
                { texto: "↩ Volver al Menú Principal", accion: "inicio" }
            ],
            menu_admision: [
                { texto: "📋 Requisitos de Ingreso", info: "Para ingresar necesitas: certificado de bachillerato, curp, acta de nacimiento y realizar el examen de admision." },
                { texto: "🕒 Horarios de Atención", info: "Control escolar atiende de lunes a viernes de 9:00 am a 6:00 pm." },
                { texto: "🚌 Rutas de Transporte", info: "Al campus zapopan llegan rutas de transporte publico como t16-b (633), 275-b y transporte de apoyo en tesistan." },
                { texto: "↩ Volver al Menú Principal", accion: "inicio" }
            ]
        };

        this.respuestasFAQ = [
            {
                claves: ["horario", "horarios", "hora de apertura", "abierto", "cerrado", "atencion"],
                respuesta: "El campus esta abierto para clases de 7:00 am a 9:00 pm. las oficinas administrativas atienden de 8:00 am a 6:00 pm."
            },
            {
                claves: ["inscripcion", "ficha", "admision", "nuevo ingreso", "requisitos", "costo", "pagos"],
                respuesta: "Para tramites de nuevo ingreso debes solicitar tu ficha en tecmm.edu.mx. se requiere certificado de bachillerato, curp y acta de nacimiento."
            },
            {
                claves: ["transporte", "camion", "bus", "ruta", "como llego", "ubicacion"],
                respuesta: "El tecmm zapopan se ubica en tesistan. puedes llegar en las rutas de autobus t16-b (633), 275-b o conectando desde el tren ligero."
            },
            {
                claves: ["hola", "buenos dias", "buenas tardes", "saludos"],
                respuesta: "Hola! bienvenidos al recorrido virtual del tecmm zapopan. dime a que edificio o area quieres ir."
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
                this.detenerModoManosLibres();
                this.asistenteVoz.detener(); 
            });

            btnAbrir.addEventListener("click", () => {
                chatWidget.classList.remove("minimizado");
                btnAbrir.style.display = "none";
            });
        }

        if (btnLeer) {
            btnLeer.addEventListener("click", () => this.hablarYReanudar(
                "Bienvenido al Asistente Virtual del TECMM Zapopan. Puedes pedirme ir a Edificios Académicos, Canchas y Laboratorios, Accesos, Andadores, Oferta Académica o Admisión."
            ));
        }

        this.setupVoz();

        setTimeout(() => {
            this.mostrarOpciones("inicio");
        }, 600);
    }

    detenerModoManosLibres() {
        this.modoManosLibres = false;
        const etiquetaBtn = document.getElementById('t-btnMic');
        if (etiquetaBtn) etiquetaBtn.innerText = "🎙️ Hablar";
        if (this.inputMensaje) this.inputMensaje.placeholder = "Ej. Llévame a Sistemas...";
        if (this.reconocimientoVoz) {
            try { this.reconocimientoVoz.stop(); } catch (e) {}
        }
    }

    hablarYReanudar(texto) {
        if (!texto) return;

        if (this.modoManosLibres && this.reconocimientoVoz) {
            try { this.reconocimientoVoz.stop(); } catch (e) {}
        }

        this.asistenteVoz.hablar(texto);

        if (this.modoManosLibres && 'speechSynthesis' in window) {
            const revisarFinHabla = setInterval(() => {
                if (!window.speechSynthesis.speaking) {
                    clearInterval(revisarFinHabla);
                    if (this.modoManosLibres) {
                        try { this.reconocimientoVoz.start(); } catch (e) {}
                    }
                }
            }, 300);
        }
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
        this.reconocimientoVoz.continuous = true;
        this.reconocimientoVoz.interimResults = true;
        this.reconocimientoVoz.lang = 'es-MX';

        const btnMic = document.getElementById('btn-mic');
        const etiquetaBtn = document.getElementById('t-btnMic');

        this.reconocimientoVoz.onstart = () => {
            if (etiquetaBtn) etiquetaBtn.innerText = "🔴 Escuchando...";
            if (this.inputMensaje) this.inputMensaje.placeholder = "Modo continuo activo (di 'detener' para apagar)...";
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
                const limpio = this.normalizarTexto(textoDefinitivo);

                if (limpio === "detener" || limpio === "apagar" || limpio === "apagar microfono" || limpio === "silencio" || limpio === "callate") {
                    this.detenerModoManosLibres();
                    this.agregarMensaje(textoDefinitivo.trim(), "user");
                    this.agregarMensaje("Micrófono apagado.", "bot");
                    if (this.inputMensaje) this.inputMensaje.value = "";
                    return;
                }

                this.procesarMensaje(textoDefinitivo.trim());
            }
        };

        this.reconocimientoVoz.onerror = (e) => {
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                this.detenerModoManosLibres();
                alert("Permiso de micrófono bloqueado en el navegador.");
            }
        };

        this.reconocimientoVoz.onend = () => {
            if (this.modoManosLibres && (!window.speechSynthesis || !window.speechSynthesis.speaking)) {
                setTimeout(() => {
                    if (this.modoManosLibres) {
                        try { this.reconocimientoVoz.start(); } catch (e) {}
                    }
                }, 250);
            } else if (!this.modoManosLibres) {
                if (etiquetaBtn) etiquetaBtn.innerText = "🎙️ Hablar";
                if (this.inputMensaje && !this.inputMensaje.value) {
                    this.inputMensaje.placeholder = "Ej. Llévame a Sistemas...";
                }
            }
        };

        const alternarMicrofono = () => {
            if (this.modoManosLibres) {
                this.detenerModoManosLibres();
                this.asistenteVoz.detener();
            } else {
                this.modoManosLibres = true;
                this.asistenteVoz.detener();
                try {
                    this.reconocimientoVoz.start();
                } catch (err) {
                    try {
                        this.reconocimientoVoz.stop();
                        setTimeout(() => this.reconocimientoVoz.start(), 150);
                    } catch(e) {}
                }
            }
        };

        if (btnMic) {
            btnMic.onclick = (e) => {
                e.preventDefault();
                alternarMicrofono();
            };
        }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && document.activeElement.id !== 'chatInput' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                alternarMicrofono();
            }
        });
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
            
            this.hablarYReanudar(resultado.respuesta);

            if (resultado.targetId && this.tourViewer) {
                this.tourViewer.cargarEscenaPorId(resultado.targetId);
            }

            if (resultado.abrirMenu) {
                this.mostrarOpciones(resultado.abrirMenu);
            } else if (resultado.esFallback) {
                this.mostrarOpciones("inicio");
            }
        }, 300);
    }

    buscarRespuesta(textoLimpio) {
        // 1. detectar si pidio abrir alguna categoria del menu por voz o texto
        if (textoLimpio.includes("oferta academica") || textoLimpio.includes("carreras")) {
            return { respuesta: "Aquí tienes nuestra oferta académica. Selecciona una carrera para ir a su edificio:", abrirMenu: "menu_carreras" };
        }
        if (textoLimpio.includes("edificios academicos") || textoLimpio === "edificios") {
            return { respuesta: "Estos son los edificios disponibles en el campus:", abrirMenu: "menu_edificios" };
        }
        if (textoLimpio.includes("canchas") || textoLimpio.includes("deportes") || textoLimpio.includes("laboratorios")) {
            return { respuesta: "Estas son las canchas y laboratorios registrados:", abrirMenu: "menu_deportes_labs" };
        }
        if (textoLimpio.includes("accesos") || textoLimpio.includes("entradas")) {
            return { respuesta: "Aquí tienes los accesos y entradas del campus:", abrirMenu: "menu_accesos" };
        }
        if (textoLimpio.includes("andadores")) {
            return { respuesta: "Estos son los andadores del recorrido:", abrirMenu: "menu_andadores" };
        }

        // limpiar palabras conectoras para aislar el destino
        const textoSinConectores = textoLimpio
            .replace(/\b(llevame|ir|ve|vamos|llévame|a|al|a la|a los|a las|el|la|los|las|por favor|quiero|ver|conocer|donde esta|ubicacion de)\b/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const consulta = textoSinConectores || textoLimpio;

        // 2. buscar en los lugares cargados desde firebase (o en tourViewer.lugares si estuviera disponible)
        const listaLugares = (this.lugares && this.lugares.length > 0) 
            ? this.lugares 
            : (this.tourViewer && this.tourViewer.lugares ? this.tourViewer.lugares : []);

        if (listaLugares.length > 0) {
            let mejorCoincidencia = null;
            let puntajeMaximo = 0;

            for (const lugar of listaLugares) {
                let listaClaves = [];

                if (Array.isArray(lugar.keywords)) {
                    listaClaves = [...lugar.keywords];
                } else if (typeof lugar.keywords === 'string') {
                    listaClaves = lugar.keywords.split(',').map(k => k.trim());
                }

                if (lugar.nombre) listaClaves.push(lugar.nombre);
                if (lugar.id) listaClaves.push(lugar.id);

                // agregar palabras individuales relevantes del nombre del lugar (ej. "sistemas", "electromecanica", "gastronomia")
                const palabrasNombre = this.normalizarTexto(lugar.nombre || "").split(" ");
                for (const p of palabrasNombre) {
                    if (p.length >= 4 && !["edificio", "andador", "acceso", "cancha", "canchas", "entrada", "aula", "ciencias"].includes(p)) {
                        listaClaves.push(p);
                    }
                }

                for (const clave of listaClaves) {
                    const claveLimpia = this.normalizarTexto(clave);
                    if (!claveLimpia) continue;

                    let puntaje = 0;
                    const nomNorm = this.normalizarTexto(lugar.nombre || "");

                    if (textoLimpio.includes(claveLimpia)) {
                        puntaje = claveLimpia.length + 10;
                        if (nomNorm.startsWith("edificio") || nomNorm.startsWith("cancha") || nomNorm.startsWith("entrada")) {
                            puntaje += 8;
                        }
                    } else if (consulta.length >= 4 && claveLimpia.includes(consulta)) {
                        puntaje = consulta.length;
                        if (nomNorm.startsWith("edificio") || nomNorm.startsWith("cancha") || nomNorm.startsWith("entrada")) {
                            puntaje += 8;
                        }
                    }

                    if (puntaje > puntajeMaximo) {
                        puntajeMaximo = puntaje;
                        mejorCoincidencia = lugar;
                    }
                }
            }

            if (mejorCoincidencia) {
                return {
                    respuesta: mejorCoincidencia.mensajeVoz || `Te llevo a: ${mejorCoincidencia.nombre}.`,
                    targetId: mejorCoincidencia.id,
                    esFallback: false
                };
            }
        }

        // 3. verificacion de preguntas frecuentes (coincidencia de palabra completa)
        const palabrasUsuario = textoLimpio.split(" ");
        for (const faq of this.respuestasFAQ) {
            const coincide = faq.claves.some(clave => {
                const cNorm = this.normalizarTexto(clave);
                return cNorm.includes(" ") ? textoLimpio.includes(cNorm) : palabrasUsuario.includes(cNorm);
            });
            if (coincide) {
                return {
                    respuesta: faq.respuesta,
                    targetId: faq.targetId || null,
                    esFallback: false
                };
            }
        }

        // 4. respaldo si no hubo coincidencia
        return {
            respuesta: "No encontré una respuesta para eso. Elige una categoría de aquí abajo o dime el nombre del edificio o cancha.",
            targetId: null,
            esFallback: true
        };
    }

    obtenerOpcionesPorCategoria(categoria) {
        if (this.arbolOpciones[categoria]) {
            return this.arbolOpciones[categoria];
        }

        const listaLugares = (this.lugares && this.lugares.length > 0) 
            ? this.lugares 
            : (this.tourViewer && this.tourViewer.lugares ? this.tourViewer.lugares : []);

        const listaOrdenada = [...listaLugares].sort((a, b) => a.nombre.localeCompare(b.nombre));
        let filtrados = [];

        if (categoria === "menu_edificios") {
            filtrados = listaOrdenada.filter(l => 
                this.normalizarTexto(l.nombre).startsWith("edificio")
            );
        } else if (categoria === "menu_deportes_labs") {
            filtrados = listaOrdenada.filter(l => {
                const nom = this.normalizarTexto(l.nombre);
                return nom.startsWith("cancha") || nom.startsWith("aula");
            });
        } else if (categoria === "menu_accesos") {
            filtrados = listaOrdenada.filter(l => {
                const nom = this.normalizarTexto(l.nombre);
                return nom.startsWith("acceso") || nom.startsWith("entrada");
            });
        } else if (categoria === "menu_andadores") {
            filtrados = listaOrdenada.filter(l => 
                this.normalizarTexto(l.nombre).startsWith("andador")
            );
        }

        const botones = filtrados.map(lugar => ({
            texto: `📍 ${lugar.nombre}`,
            targetId: lugar.id,
            mensajeVoz: lugar.mensajeVoz || `Te llevo a ${lugar.nombre}`
        }));

        botones.push({ texto: "↩ Volver al Menú Principal", accion: "inicio" });
        return botones;
    }

    mostrarOpciones(categoria) {
        const opciones = this.obtenerOpcionesPorCategoria(categoria);
        if (!opciones || opciones.length === 0) return;

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
                        this.hablarYReanudar(op.info); 
                    }

                    if (op.buscar) {
                        const res = this.buscarRespuesta(this.normalizarTexto(op.buscar));
                        if (res.targetId && this.tourViewer) {
                            this.tourViewer.cargarEscenaPorId(res.targetId);
                        }
                    }

                    if (op.targetId && this.tourViewer) {
                        const voz = op.mensajeVoz || "Te dirijo al área seleccionada.";
                        this.agregarMensaje(voz, "bot");
                        this.hablarYReanudar(voz);
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