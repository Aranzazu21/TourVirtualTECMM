export class TourViewer {
    constructor(containerId, lugares, onSceneChangeCallback) {
        this.containerId = containerId;
        this.lugares = lugares;
        this.onSceneChange = onSceneChangeCallback;
        this.visor = null;
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
                minHfov: 30,
                maxHfov: 90,
                haov: 360,
                ignoreGPanoXMP: true,
                hotSpots: lugar.hotSpots.map(hs => ({
                    pitch: hs.pitch,
                    yaw: hs.yaw,
                    type: hs.type || "scene",
                    text: hs.text,
                    sceneId: hs.sceneId,
                    clickHandlerFunc: () => {
                        if (this.visor) {
                            // Animación de zoom "efecto caminar"
                            this.visor.setHfov(30, 350);
                        }
                        setTimeout(() => {
                            this.cargarEscenaPorId(hs.sceneId);
                        }, 300);
                    }
                }))
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
                "sceneFadeDuration": 400,
                "autoLoad": true,
                "showControls": true,
                "mouseZoom": true,
                "draggable": true,
                "disableKeyboardCtrl": false
            },
            "scenes": escenasConfig
        });

        if (typeof this.onSceneChange === "function") {
            this.onSceneChange(escenaInicialId);
        }
    }

    cargarEscenaPorId(idLugar) {
        if (this.visor) {
            this.visor.loadScene(idLugar);
            if (typeof this.onSceneChange === "function") {
                this.onSceneChange(idLugar);
            }
        }
    }
}