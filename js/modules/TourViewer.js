import { Hotspots } from './Hotspots.js';

export class TourViewer {
    constructor(containerId, lugares, onSceneChangeCallback) {
        this.containerId = containerId;
        this.lugares = lugares;
        this.onSceneChange = onSceneChangeCallback;
        this.visor = null;
        this.enTransicion = false;
    }

    precargarImagenes() {
        this.lugares.forEach(lugar => {
            const img = new Image();
            img.src = lugar.imagen;
        });
    }

    construirEscenas() {
        const scenesObj = {};

        this.lugares.forEach(lugar => {
            scenesObj[lugar.id] = {
                type: "equirectangular",
                panorama: lugar.imagen,
                minPitch: -30,
                maxPitch: 60,
                hfov: 80,
                minHfov: 25,
                maxHfov: 90,
                haov: 360,
                ignoreGPanoXMP: true,
                hotSpots: (lugar.hotSpots || []).map(hs => {
                    const destinoFinal = hs.sceneId || hs.destinoId;
                    return {
                        pitch: hs.pitch,
                        yaw: hs.yaw,
                        type: "info",
                        cssClass: "hotspot-streetview",
                        text: hs.text || hs.texto || `Avanzar hacia ${destinoFinal}`,
                        clickHandlerFunc: () => {
                            this.desplazarEstiloStreetView(destinoFinal, hs.pitch, hs.yaw);
                        }
                    };
                })
            };
        });

        return scenesObj;
    }

    inicializar(escenaInicialId) {
        this.precargarImagenes();
        const escenasConfig = this.construirEscenas();

        this.visor = pannellum.viewer(this.containerId, {
            "default": {
                "firstScene": escenaInicialId,
                // Reducido a 100ms para eliminar el parpadeo negro intermedio
                "sceneFadeDuration": 100,
                "autoLoad": true,
                "showControls": true,
                "mouseZoom": true,
                "draggable": true,
                "disableKeyboardCtrl": false
            },
            "scenes": escenasConfig
        });

        Hotspots.activarRastreador(this.visor);

        if (typeof this.onSceneChange === "function") {
            this.onSceneChange(escenaInicialId);
        }
    }

    // Cinemática sincronizada sin tiempos ciegos
    desplazarEstiloStreetView(destinoId, targetPitch, targetYaw) {
        if (!this.visor || !destinoId || this.enTransicion) return;
        this.enTransicion = true;

        const duracionAceleracion = 220; // Impulso frontal rápido

        // 1. Zoom agresivo hacia el punto de destino
        this.visor.setPitch(targetPitch, duracionAceleracion);
        this.visor.setYaw(targetYaw, duracionAceleracion);
        this.visor.setHfov(30, duracionAceleracion);

        setTimeout(() => {
            // 2. Escuchar el momento exacto en que la GPU pinta la nueva foto
            const alPintarNuevaEscena = () => {
                this.visor.off('load', alPintarNuevaEscena);

                // 3. Apertura inmediata (amortiguación de llegada)
                requestAnimationFrame(() => {
                    this.visor.setHfov(80, 360);
                    this.enTransicion = false;
                });
            };

            this.visor.on('load', alPintarNuevaEscena);

            // Carga la nueva escena manteniendo el campo visual cerrado a 30°
            this.visor.loadScene(destinoId, undefined, undefined, 30);

            if (typeof this.onSceneChange === "function") {
                this.onSceneChange(destinoId);
            }

            // Candado de seguridad por si falla la carga del archivo
            setTimeout(() => {
                this.visor.off('load', alPintarNuevaEscena);
                this.enTransicion = false;
            }, 1000);

        }, duracionAceleracion);
    }

    cargarEscenaPorId(idLugar) {
        if (this.visor && idLugar) {
            this.visor.loadScene(idLugar);
            if (typeof this.onSceneChange === "function") {
                this.onSceneChange(idLugar);
            }
        }
    }
}