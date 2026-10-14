export class Hotspots {
    
    // 1. Herramienta para obtener coordenadas al hacer clic
    // (Te las imprimirá bonitas en la consola para copiarlas al CMS)
    static activarRastreador(visorPannellum) {
        if (!visorPannellum) return;
        
        visorPannellum.on('mousedown', (e) => {
            const coords = visorPannellum.mouseEventToCoords(e);
            const pitch = coords[0].toFixed(2);
            const yaw = coords[1].toFixed(2);
            
            // Lo imprimimos con estilo en la consola (F12)
            console.log(
                `%c📍 NUEVO HOTSPOT -> Pitch: ${pitch} | Yaw: ${yaw}`, 
                'background: #260b7b; color: white; font-size: 13px; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
            );
        });
    }

    // 2. Transforma los datos de Firebase al formato que entiende el Motor 360°
    static mapearDesdeFirebase(hotSpotsGuardados) {
        if (!hotSpotsGuardados) return [];
        
        return hotSpotsGuardados.map(hs => ({
            pitch: hs.pitch,
            yaw: hs.yaw,
            type: "scene",
            text: hs.texto || `Ir a ${hs.destinoId}`,
            sceneId: hs.destinoId
        }));
    }
}