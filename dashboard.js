import { db, auth } from "./js/services/FirebaseService.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, doc, setDoc, updateDoc, arrayUnion, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { BuzonManager } from "./js/modules/BuzonManager.js";
import { inicializarChatAdmin } from "./js/modules/chatAdmin.js";

let lugaresRegistrados = []; 
let modoEdicion = false; 
const buzonAdmin = new BuzonManager();

// ==========================================
// 1. VERIFICAR SESIÓN Y ARRANCAR MÓDULOS
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "admin.html";
    } else {
        cargarNodosEnTabla();
        buzonAdmin.inicializarVistaAdmin();
    }
});

document.getElementById("btnLogout").addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "admin.html");
});

// ==========================================
// 2. CARGAR TABLA, SELECTORES Y BUSCADOR
// ==========================================
function cargarNodosEnTabla() {
    const filtroCategoriaTabla = document.getElementById("filtroCategoria");
    const buscadorNodos = document.getElementById("buscadorNodos"); 
    
    onSnapshot(collection(db, "lugares"), (snapshot) => {
        lugaresRegistrados = []; 
        
        snapshot.forEach((docSnapshot) => {
            lugaresRegistrados.push(docSnapshot.data()); 
        });

        inicializarChatAdmin(lugaresRegistrados);
        dibujarTablaAreas();
        actualizarMetricas(lugaresRegistrados);

        const catOrigen = document.getElementById("filtroCategoriaOrigen") ? document.getElementById("filtroCategoriaOrigen").value : "Todas";
        const catDestino = document.getElementById("filtroCategoriaDestino") ? document.getElementById("filtroCategoriaDestino").value : "Todas";
        actualizarSelectoresHotspots(catOrigen, catDestino);
    });

    if(filtroCategoriaTabla) {
        filtroCategoriaTabla.addEventListener("change", dibujarTablaAreas);
    }

    if(buscadorNodos) {
        buscadorNodos.addEventListener("input", dibujarTablaAreas);
    }

    const filtroCategoriaOrigen = document.getElementById("filtroCategoriaOrigen");
    const filtroCategoriaDestino = document.getElementById("filtroCategoriaDestino");

    if(filtroCategoriaOrigen && filtroCategoriaDestino) {
        filtroCategoriaOrigen.addEventListener("change", () => {
            actualizarSelectoresHotspots(filtroCategoriaOrigen.value, filtroCategoriaDestino.value);
        });

        filtroCategoriaDestino.addEventListener("change", () => {
            actualizarSelectoresHotspots(filtroCategoriaOrigen.value, filtroCategoriaDestino.value);
        });
    }
}

function actualizarSelectoresHotspots(categoriaOrigen, categoriaDestino) {
    const selectOrigen = document.getElementById("selectOrigen");
    const selectDestino = document.getElementById("selectDestino");

    if (!selectOrigen || !selectDestino) return;

    const origenActual = selectOrigen.value;
    const destinoActual = selectDestino.value;

    selectOrigen.innerHTML = '<option value="">-- Selecciona Origen --</option>';
    selectDestino.innerHTML = '<option value="">-- Selecciona Destino --</option>';

    const catOrigenLimpia = String(categoriaOrigen).trim().toLowerCase();
    const catDestinoLimpia = String(categoriaDestino).trim().toLowerCase();

    let lugaresOrigen = lugaresRegistrados;
    if (catOrigenLimpia !== "todas") {
        lugaresOrigen = lugaresRegistrados.filter(lugar => String(lugar.categoria).trim().toLowerCase() === catOrigenLimpia);
    }

    let lugaresDestino = lugaresRegistrados;
    if (catDestinoLimpia !== "todas") {
        lugaresDestino = lugaresRegistrados.filter(lugar => String(lugar.categoria).trim().toLowerCase() === catDestinoLimpia);
    }

    lugaresOrigen.forEach(lugar => {
        const op = document.createElement("option");
        op.value = lugar.id; 
        op.innerText = lugar.nombre + " (" + lugar.id + ")"; 
        selectOrigen.appendChild(op);
    });

    lugaresDestino.forEach(lugar => {
        const op = document.createElement("option");
        op.value = lugar.id; 
        op.innerText = lugar.nombre + " (" + lugar.id + ")"; 
        selectDestino.appendChild(op);
    });

    if(origenActual) {
        const existe = Array.from(selectOrigen.options).some(opt => opt.value === origenActual);
        if(existe) selectOrigen.value = origenActual;
    }
    if(destinoActual) {
        const existe = Array.from(selectDestino.options).some(opt => opt.value === destinoActual);
        if(existe) selectDestino.value = destinoActual;
    }
}

function dibujarTablaAreas() {
    const tablaBody = document.getElementById("tablaNodosBody");
    const filtro = document.getElementById("filtroCategoria") ? document.getElementById("filtroCategoria").value : "Todas";
    const busqueda = document.getElementById("buscadorNodos") ? document.getElementById("buscadorNodos").value.trim().toLowerCase() : "";
    
    tablaBody.innerHTML = "";

    if (lugaresRegistrados.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No hay áreas registradas.</td></tr>`;
        return;
    }

    let areasFiltradas = lugaresRegistrados;

    if (filtro !== "Todas") {
        const filtroLimpio = String(filtro).trim().toLowerCase();
        areasFiltradas = areasFiltradas.filter(l => String(l.categoria).trim().toLowerCase() === filtroLimpio);
    }

    if (busqueda !== "") {
        areasFiltradas = areasFiltradas.filter(l => 
            String(l.nombre).toLowerCase().includes(busqueda) || 
            String(l.id).toLowerCase().includes(busqueda)
        );
    }

    if (areasFiltradas.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b;">No se encontraron áreas.</td></tr>`;
        return;
    }

    areasFiltradas.forEach(lugar => {
        const numHotspots = lugar.hotSpots ? lugar.hotSpots.length : 0;
        const totalVisitas = lugar.visitas || 0; 
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><b>${lugar.id}</b></td>
            <td>${lugar.nombre}</td>
            <td>${lugar.categoria}</td>
            <td><code>${lugar.imagen}</code></td>
            <td style="color: #10b981; font-weight: bold;">${totalVisitas}</td>
            <td><span class="badge-hotspots">${numHotspots}</span></td>
            <td>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button class="btn-editar" onclick="editarNodo('${lugar.id}')">Editar</button>
                    <button class="btn-gestionar" onclick="abrirModalHotspots('${lugar.id}')">Flechas</button>
                    <button class="btn-eliminar" onclick="eliminarNodo('${lugar.id}')">Eliminar</button>
                </div>
            </td>
        `;
        tablaBody.appendChild(fila);
    });
}

// ==========================================
// 3. GESTIÓN DE ÁREAS (CREAR / EDITAR / ELIMINAR)
// ==========================================
let idOriginalEdicion = ""; 

window.editarNodo = (id) => {
    const lugar = lugaresRegistrados.find(l => l.id === id);
    if (!lugar) return;

    idOriginalEdicion = id; 

    document.getElementById("idNodo").value = lugar.id;
    document.getElementById("idNodo").disabled = false; 
    document.getElementById("nombreNodo").value = lugar.nombre;
    document.getElementById("categoriaNodo").value = lugar.categoria || "Accesos";
    document.getElementById("descripcionNodo").value = lugar.descripcion;
    document.getElementById("imagenNodo").value = lugar.imagen;

    document.getElementById("tituloFormularioNodo").innerText = `Editando Área: ${lugar.nombre}`;
    document.getElementById("btnSubmitNodo").innerText = "Actualizar Área";
    document.getElementById("btnCancelarEdicion").style.display = "inline-block";
    document.getElementById("msjEstado").innerText = "";
    modoEdicion = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.cancelarEdicion = () => {
    document.getElementById("formNodo").reset();
    document.getElementById("idNodo").disabled = false;
    document.getElementById("tituloFormularioNodo").innerText = "1. Registrar Nueva Área / Nodo 360°";
    document.getElementById("btnSubmitNodo").innerText = "Guardar Área en Firestore";
    document.getElementById("btnCancelarEdicion").style.display = "none";
    document.getElementById("msjEstado").innerText = "";
    modoEdicion = false;
    idOriginalEdicion = "";
};

document.getElementById("formNodo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msj = document.getElementById("msjEstado");
    const nuevoId = document.getElementById("idNodo").value.trim().toLowerCase();
    
    try {
        msj.style.color = "blue"; msj.innerText = modoEdicion ? "Actualizando..." : "Guardando...";

        if (modoEdicion) {
            if (nuevoId !== idOriginalEdicion) {
                const lugarOriginal = lugaresRegistrados.find(l => l.id === idOriginalEdicion);
                
                await setDoc(doc(db, "lugares", nuevoId), {
                    id: nuevoId,
                    nombre: document.getElementById("nombreNodo").value.trim(),
                    categoria: document.getElementById("categoriaNodo").value,
                    descripcion: document.getElementById("descripcionNodo").value.trim(),
                    imagen: document.getElementById("imagenNodo").value.trim(),
                    hotSpots: lugarOriginal.hotSpots || [],
                    keywords: lugarOriginal.keywords || [],
                    mensajeVoz: lugarOriginal.mensajeVoz || "",
                    visitas: lugarOriginal.visitas || 0
                });
                
                await deleteDoc(doc(db, "lugares", idOriginalEdicion)); 
            } else {
                await updateDoc(doc(db, "lugares", nuevoId), {
                    nombre: document.getElementById("nombreNodo").value.trim(),
                    categoria: document.getElementById("categoriaNodo").value,
                    descripcion: document.getElementById("descripcionNodo").value.trim(),
                    imagen: document.getElementById("imagenNodo").value.trim()
                });
            }

            msj.style.color = "green"; msj.innerText = "¡Área actualizada con éxito!";
            setTimeout(cancelarEdicion, 1500);
        } else {
            await setDoc(doc(db, "lugares", nuevoId), {
                id: nuevoId,
                nombre: document.getElementById("nombreNodo").value.trim(),
                categoria: document.getElementById("categoriaNodo").value,
                descripcion: document.getElementById("descripcionNodo").value.trim(),
                imagen: document.getElementById("imagenNodo").value.trim(),
                hotSpots: [],
                keywords: [],
                mensajeVoz: "",
                visitas: 0
            });
            msj.style.color = "green"; msj.innerText = "¡Área registrada!";
            document.getElementById("formNodo").reset();
        }
    } catch (error) { msj.style.color = "red"; msj.innerText = "Error: " + error.message; }
});

window.eliminarNodo = async (id) => {
    if (confirm(`¿Estás seguro de eliminar el área "${id}"? Se borrará el registro y sus hotspots.`)) {
        await deleteDoc(doc(db, "lugares", id));
    }
};

// ==========================================
// 4. CREAR HOTSPOTS
// ==========================================
const formHotspot = document.getElementById("formHotspot");
if (formHotspot) {
    formHotspot.addEventListener("submit", async (e) => {
        e.preventDefault();
        const msj = document.getElementById("msjHotspotEstado");
        const origenId = document.getElementById("selectOrigen").value;
        const destinoId = document.getElementById("selectDestino").value;
        const pitch = parseFloat(document.getElementById("pitchHotspot").value);
        const yaw = parseFloat(document.getElementById("yawHotspot").value);

        if (origenId === destinoId) return alert("Origen y destino no pueden ser iguales.");

        try {
            msj.style.color = "blue"; msj.innerText = "Vinculando...";
            await updateDoc(doc(db, "lugares", origenId), {
                hotSpots: arrayUnion({ 
                    destinoId, 
                    pitch, 
                    yaw, 
                    texto: document.getElementById("textoHotspot").value.trim() 
                })
            });
            msj.style.color = "green"; msj.innerText = "¡Flecha creada!";
            formHotspot.reset();
        } catch (error) { msj.style.color = "red"; msj.innerText = "Error: " + error.message; }
    });
}

// ==========================================
// 5. MODAL GESTIÓN HOTSPOTS
// ==========================================
window.abrirModalHotspots = (id) => {
    const lugar = lugaresRegistrados.find(l => l.id === id);
    if (!lugar) return;
    
    document.getElementById("modalTitulo").innerText = `Flechas en: ${lugar.nombre}`;
    const lista = document.getElementById("listaHotspots");
    lista.innerHTML = "";

    if (!lugar.hotSpots || lugar.hotSpots.length === 0) {
        lista.innerHTML = "<p style='color: #64748b; text-align: center; padding: 20px;'>No hay flechas registradas en esta área.</p>";
    } else {
        lugar.hotSpots.forEach((hs, index) => {
            const textoActual = hs.texto || hs.text || '';
            const item = document.createElement("div");
            item.className = "hotspot-item";
            item.id = `hotspot-item-${index}`; 
            
            item.innerHTML = `
                <div class="hotspot-info">
                    <strong>Hacia: ${hs.destinoId}</strong>
                    <span>Texto: "${textoActual || 'Sin texto'}" | Pitch: ${hs.pitch}, Yaw: ${hs.yaw}</span>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="btn-editar" onclick="editarTextoHotspot('${lugar.id}', ${index})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarHotspotDirecto('${lugar.id}', ${index})">Borrar</button>
                </div>
            `;
            lista.appendChild(item);
        });
    }
    
    document.getElementById("modalHotspots").style.display = "flex";
};

window.cerrarModalHotspots = () => {
    document.getElementById("modalHotspots").style.display = "none";
};

window.eliminarHotspotDirecto = async (nodoId, hotspotIndex) => {
    if (!confirm("¿Seguro que quieres borrar esta flecha?")) return;
    
    const lugar = lugaresRegistrados.find(l => l.id === nodoId);
    if (!lugar) return;

    const nuevosHotspots = [...lugar.hotSpots];
    nuevosHotspots.splice(hotspotIndex, 1);

    try {
        await updateDoc(doc(db, "lugares", nodoId), { hotSpots: nuevosHotspots });
        lugar.hotSpots = nuevosHotspots;
        window.abrirModalHotspots(nodoId);
    } catch (error) {
        alert("Error al borrar la flecha: " + error.message);
    }
};

window.editarTextoHotspot = (nodoId, hotspotIndex) => {
    const lugar = lugaresRegistrados.find(l => l.id === nodoId);
    if (!lugar || !lugar.hotSpots || !lugar.hotSpots[hotspotIndex]) return;

    const flechaActual = lugar.hotSpots[hotspotIndex];
    const textoOriginal = flechaActual.texto || flechaActual.text || '';
    const destinoOriginal = flechaActual.destinoId;

    const cajitaItem = document.getElementById(`hotspot-item-${hotspotIndex}`);
    if (!cajitaItem) return;

    const opcionesDestino = lugaresRegistrados.map(l => 
        `<option value="${l.id}" ${l.id === destinoOriginal ? 'selected' : ''}>${l.nombre} (${l.id})</option>`
    ).join('');

    cajitaItem.innerHTML = `
        <div style="width: 100%; display: flex; flex-direction: column; gap: 8px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
            <strong style="color:#2563eb; margin-bottom: 5px;">Editando flecha</strong>
            
            <label style="font-size: 0.85em; color: #475569; margin-bottom: -5px;">Destino de la flecha:</label>
            <select id="selectEditDestino_${hotspotIndex}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; width: 100%; background: white;">
                ${opcionesDestino}
            </select>

            <label style="font-size: 0.85em; color: #475569; margin-bottom: -5px;">Texto a mostrar:</label>
            <input type="text" id="inputEditTexto_${hotspotIndex}" value="${textoOriginal}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; width: 100%;">
            
            <div style="display: flex; gap: 5px; margin-top: 5px;">
                <button class="btn-editar" style="background-color: #10b981; color: white;" onclick="guardarEdicionHotspot('${nodoId}', ${hotspotIndex})">Guardar Cambios</button>
                <button class="btn-eliminar" onclick="abrirModalHotspots('${nodoId}')">Cancelar</button>
            </div>
        </div>
    `;
};

window.guardarEdicionHotspot = async (nodoId, hotspotIndex) => {
    const inputTexto = document.getElementById(`inputEditTexto_${hotspotIndex}`);
    const selectDestino = document.getElementById(`selectEditDestino_${hotspotIndex}`);
    
    if (!inputTexto || !selectDestino) return;
    
    const nuevoTexto = inputTexto.value.trim();
    const nuevoDestino = selectDestino.value;
    
    const lugar = lugaresRegistrados.find(l => l.id === nodoId);
    if (!lugar) return;

    const nuevosHotspots = [...lugar.hotSpots];
    nuevosHotspots[hotspotIndex].texto = nuevoTexto;
    nuevosHotspots[hotspotIndex].destinoId = nuevoDestino;
    
    if (nuevosHotspots[hotspotIndex].text) {
        delete nuevosHotspots[hotspotIndex].text;
    }

    try {
        await updateDoc(doc(db, "lugares", nodoId), { hotSpots: nuevosHotspots });
        
        lugar.hotSpots = nuevosHotspots;
        window.abrirModalHotspots(nodoId); 
    } catch (error) {
        alert("Error al guardar: " + error.message);
    }
};

// ==========================================
// 6. ANALÍTICAS Y MÉTRICAS
// ==========================================
function actualizarMetricas(lugares) {
    const elTotalVisitas = document.getElementById("metricaTotalVisitas");
    const elTopLugar = document.getElementById("metricaTopLugar");
    const elTopVisitas = document.getElementById("metricaTopVisitas");
    const elTotalNodos = document.getElementById("metricaTotalNodos");

    if (!elTotalVisitas || !elTopLugar) return;

    let totalVisitas = 0;
    let lugarTop = null;
    let maxVisitas = -1;

    lugares.forEach(lugar => {
        const visitasLugar = lugar.visitas || 0;
        totalVisitas += visitasLugar;

        if (visitasLugar > maxVisitas) {
            maxVisitas = visitasLugar;
            lugarTop = lugar;
        }
    });

    elTotalNodos.innerText = lugares.length;
    elTotalVisitas.innerText = totalVisitas.toLocaleString();

    if (lugarTop && maxVisitas > 0) {
        elTopLugar.innerText = lugarTop.nombre;
        elTopLugar.title = lugarTop.nombre; 
        elTopVisitas.innerText = `${maxVisitas.toLocaleString()} visitas`;
    } else {
        elTopLugar.innerText = "Aún sin datos";
        elTopVisitas.innerText = "0 visitas";
    }
}

// ==========================================
// 7. CIERRE DE SESIÓN AUTOMÁTICO POR INACTIVIDAD
// ==========================================
let temporizadorInactividad;
const TIEMPO_MAXIMO_INACTIVIDAD = 20 * 60 * 1000; // 20 minutos

function reiniciarTemporizadorSesion() {
    clearTimeout(temporizadorInactividad);
    temporizadorInactividad = setTimeout(() => {
        alert("Tu sesión se cerró automáticamente por inactividad.");
        signOut(auth).then(() => {
            window.location.href = "admin.html";
        });
    }, TIEMPO_MAXIMO_INACTIVIDAD);
}

["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evento => {
    window.addEventListener(evento, reiniciarTemporizadorSesion);
});

reiniciarTemporizadorSesion();