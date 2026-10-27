export class VoiceAssistant {
    constructor() {
        // Inicializamos la API nativa del navegador
        this.synth = window.speechSynthesis;
        this.activo = true; // Variable para saber si el usuario silenció el recorrido
        this.voces = [];
        
        // Los navegadores cargan las voces de forma asíncrona, esperamos a que estén listas
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.voces = this.synth.getVoices();
            };
        }
    }

    // Botón de encendido/apagado por si el usuario ya no quiere escuchar la voz
    toggleVoz() {
        this.activo = !this.activo;
        if (!this.activo) this.detener();
        return this.activo; // Retorna el estado para cambiar el icono del botón si tienes uno
    }

    // Función principal que lee el texto
    hablar(texto) {
        // Si está apagado, si el navegador no lo soporta, o si no hay texto, no hace nada
        if (!this.activo || !this.synth || !texto || texto.trim() === "") return;

        this.detener(); // Detiene cualquier mensaje anterior para que no se empalmen

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-MX'; // Configuramos el acento a Español de México
        utterance.rate = 1.0;     // Velocidad (1 es normal, 1.5 es rápido)
        utterance.pitch = 1.0;    // Tono de voz

        // Intenta asignar una voz de México si el dispositivo la tiene instalada
        if (this.voces.length > 0) {
            const vozMexico = this.voces.find(v => v.lang === 'es-MX' || v.lang === 'es-419');
            if (vozMexico) utterance.voice = vozMexico;
        }

        this.synth.speak(utterance);
    }

    // Función para callar al asistente de inmediato
    detener() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
    }
}