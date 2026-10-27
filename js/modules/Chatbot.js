import { VoiceAssistant } from './VoiceAssistant.js'; // conectamos el archivo de voz que hicimos

export class Chatbot {
    constructor(tourViewer, uiController, lugares) {
        // guardamos las variables del visor y la base de datos para usarlas en toda la clase
        this.tourViewer = tourViewer;
        this.uiController = uiController;
        this.lugares = lugares; 
        this.mensajesContenedor = document.getElementById("chatMessages");
        this.inputMensaje = document.getElementById("chatInput");
        this.btnEnviar = document.getElementById("btnSendChat");

        // creamos el asistente de voz para que hable
        this.asistenteVoz = new VoiceAssistant();

        // opciones del menu inicial ya con los ids reales de nuestra base de datos
        this.arbolOpciones = {
            inicio: [
                { texto: " Conocer Instalaciones 360°", accion: "menu_instalaciones" },
                { texto: " Oferta Académica (Carreras)", accion: "menu_carreras" },
                { texto: " Admisión y Trámites", accion: "menu_admision" },
                { texto: " Servicios del Campus", accion: "menu_servicios" }
            ],
            menu_instalaciones: [
                // aqui pusimos exactamente los ids de la primera columna de firebase
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

        // respuestas predefinidas para preguntas sueltas que no ocupan mover la camara
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

    // funcion que arranca los eventos de los botones cuando carga la pagina
    inicializar() {
        if (this.btnEnviar && this.inputMensaje) {
            // para enviar el mensaje con el clic
            this.btnEnviar.addEventListener("click", () => this.procesarMensaje());
            // para enviar el mensaje dando enter en el teclado
            this.inputMensaje.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.procesarMensaje();
            });
        }

        const chatWidget = document.getElementById("chatWidget");
        const btnMinimizar = document.getElementById("btnMinimizarChat");
        const btnAbrir = document.getElementById("btnAbrirChat");

        // para poder esconder y sacar la ventana del chat
        if (btnMinimizar && btnAbrir && chatWidget) {
            btnMinimizar.addEventListener("click", () => {
                chatWidget.classList.add("minimizado");
                btnAbrir.style.display = "flex";
                // callamos al bot si el usuario minimiza la ventana
                this.asistenteVoz.detener(); 
            });

            btnAbrir.addEventListener("click", () => {
                chatWidget.classList.remove("minimizado");
                btnAbrir.style.display = "none";
            });
        }

        // carga el menu inicial medio segundito despues para que se vea bien
        setTimeout(() => {
            this.mostrarOpciones("inicio");
        }, 600);
    }

    // quita mayusculas y acentos para que el buscador no se confunda
    normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^a-z0-9\s]/g, "");    
    }

    // checa lo que el usuario escribio y busca que contestar
    procesarMensaje(textoPersonalizado = null) {
        const textoEntrada = textoPersonalizado || this.inputMensaje.value;
        const textoLimpio = this.normalizarTexto(textoEntrada);

        // si no escribieron nada, no hace nada
        if (textoLimpio.trim() === "") return;

        // dibuja el mensaje que escribimos en la pantalla
        if (!textoPersonalizado) {
            this.agregarMensaje(this.inputMensaje.value, "user");
            this.inputMensaje.value = "";
        }

        // damos un tiempo pequeñito para que parezca que esta pensando
        setTimeout(() => {
            const resultado = this.buscarRespuesta(textoLimpio);
            this.agregarMensaje(resultado.respuesta, "bot");
            
            // aqui le decimos a la compu que lea en voz alta la respuesta
            this.asistenteVoz.hablar(resultado.respuesta);

            // si la respuesta incluye un lugar, movemos la camara
            if (resultado.targetId && this.tourViewer) {
                this.tourViewer.cargarEscenaPorId(resultado.targetId);
            }

            // si no supo que decir, vuelve a mostrar el menu
            if (resultado.esFallback) {
                this.mostrarOpciones("inicio");
            }
        }, 400);
    }

    // el cerebro del bot para decidir que responder
    buscarRespuesta(textoLimpio) {
        // paso 1: busca a ver si lo que escribimos coincide con los lugares de firebase
        if (this.lugares && this.lugares.length > 0) {
            for (const lugar of this.lugares) {
                if (lugar.keywords && Array.isArray(lugar.keywords)) {
                    // checa si alguna palabra clave esta en lo que escribio el usuario
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

        // paso 2: si no era un lugar, checa en las preguntas normales (horarios, admision)
        for (const faq of this.respuestasFAQ) {
            if (faq.claves.some(clave => textoLimpio.includes(this.normalizarTexto(clave)))) {
                return {
                    respuesta: faq.respuesta,
                    targetId: faq.targetId || null,
                    esFallback: false
                };
            }
        }

        // paso 3: si no encontro ni lugar ni pregunta, da mensaje de error
        return {
            respuesta: "no encontre una respuesta para eso. elige una opcion de aqui abajo o llama a control escolar.",
            targetId: null,
            esFallback: true
        };
    }

    // dibuja los botoncitos redondos de las opciones en el chat
    mostrarOpciones(categoria) {
        const opciones = this.arbolOpciones[categoria];
        if (!opciones) return;

        const contenedorBotones = document.createElement("div");
        contenedorBotones.className = "chat-chips-container";

        opciones.forEach(op => {
            const btn = document.createElement("button");
            btn.className = "chat-chip";
            btn.innerText = op.texto;

            // cuando le damos clic a un boton del menu
            btn.addEventListener("click", () => {
                this.agregarMensaje(op.texto, "user");

                setTimeout(() => {
                    // si el boton tenia informacion de texto, el bot la manda y la habla
                    if (op.info) {
                        this.agregarMensaje(op.info, "bot");
                        this.asistenteVoz.hablar(op.info); 
                    } else if (op.targetId) {
                        // si el boton era para moverse, avisa por voz
                        this.asistenteVoz.hablar("te dirijo al area que seleccionaste.");
                    }

                    // mueve la vista 360 si hay un lugar asociado
                    if (op.targetId && this.tourViewer) {
                        this.tourViewer.cargarEscenaPorId(op.targetId);
                    }

                    // si es un submenu, carga los botones que siguen
                    if (op.accion) {
                        this.mostrarOpciones(op.accion);
                    }
                }, 300);
            });

            contenedorBotones.appendChild(btn);
        });

        // baja el scroll de la ventana para que siempre se vea el ultimo mensaje
        if (this.mensajesContenedor) {
            this.mensajesContenedor.appendChild(contenedorBotones);
            this.mensajesContenedor.scrollTop = this.mensajesContenedor.scrollHeight;
        }
    }

    // funcion simple que agarra un texto y lo pone como globito en el chat
    agregarMensaje(texto, emisor) {
        if (!this.mensajesContenedor) return;
        const msgDiv = document.createElement("div");
        // le pone clase user o bot para los colores
        msgDiv.className = `chat-message ${emisor}`;
        msgDiv.innerText = texto;
        this.mensajesContenedor.appendChild(msgDiv);
        this.mensajesContenedor.scrollTop = this.mensajesContenedor.scrollHeight;
    }
}