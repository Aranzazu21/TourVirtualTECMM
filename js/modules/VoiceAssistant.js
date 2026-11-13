export class VoiceAssistant {
    constructor() {
        this.synth = window.speechSynthesis;
        this.activo = true;
        this.voces = [];

        if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.voces = this.synth.getVoices();
            };
        }
    }

    toggleVoz() {
        this.activo = !this.activo;
        if (!this.activo) this.detener();
        return this.activo;
    }

    hablar(texto, callbackAlTerminar = null) {
        if (!this.activo || !this.synth || !texto || texto.trim() === "") return;

        this.detener();

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-MX';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        if (this.voces.length > 0) {
            const vozMexico = this.voces.find(v => v.lang === 'es-MX' || v.lang === 'es-419');
            if (vozMexico) utterance.voice = vozMexico;
        }

        utterance.onend = () => {
            if (callbackAlTerminar) {
                setTimeout(() => callbackAlTerminar(), 200);
            }
        };

        utterance.onerror = () => {
            if (callbackAlTerminar) callbackAlTerminar();
        };

        this.synth.speak(utterance);
    }

    detener() {
        if (this.synth && (this.synth.speaking || this.synth.pending)) {
            this.synth.cancel();
        }
    }
}