import { db, auth } from "./js/services/FirebaseService.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, doc, setDoc, updateDoc, arrayUnion, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

let lugaresRegistrados = []; 
let modoEdicion = false; 

// 1. Verificar sesión
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "admin.html";
    else cargarNodosEnTabla();
});

// Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "admin.html");
});

// 2. Cargar tabla y llenar selects
function cargarNodosEnTabla() {
    const tablaBody = document.getElementById("tablaNodosBody");
    const selectOrigen = document.getElementById("selectOrigen");
    const selectDestino = document.getElementById("selectDestino");
    
    onSnapshot(collection(db, "lugares"), (snapshot) => {
        tablaBody.innerHTML = "";
        lugaresRegistrados = []; 
        
        if(selectOrigen && selectDestino) {
            selectOrigen.innerHTML = '<option value="">-- Selecciona Origen --</option>';
            selectDestino.innerHTML = '<option value="">-- Selecciona Destino --</option>';
        }
        
        if (snapshot.empty) {
            tablaBody.innerHTML = `<tr><td colspan="6">No hay áreas registradas.</td></tr>`;
            return;
        }

        snapshot.forEach((docSnapshot) => {
            const lugar = docSnapshot.data();
            lugaresRegistrados.push(lugar); 
            
            if(selectOrigen && selectDestino) {
                const op1 = document.createElement("option");
                op1.value = lugar.id; op1.innerText = lugar.nombre; selectOrigen.appendChild(op1);
                const op2 = document.createElement("option");
                op2.value = lugar.id; op2.innerText = lugar.nombre; selectDestino.appendChild(op2);
            }

            const numHotspots = lugar.hotSpots ? lugar.hotSpots.length : 0;
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td><b>${lugar.id}</b></td>
                <td>${lugar.nombre}</td>
                <td>${lugar.categoria}</td>
                <td><code>${lugar.imagen}</code></td>
                <td><span class="badge-hotspots">${numHotspots}</span></td>
                <td>
                    <button class="btn-editar" onclick="editarNodo('${lugar.id}')">Editar</button>
                    <button class="btn-gestionar" onclick="abrirModalHotspots('${lugar.id}')">Flechas</button>
                    <button class="btn-eliminar" onclick="eliminarNodo('${lugar.id}')">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });
    });
}

// 3. Gestión de Nodos (Crear/Editar/Eliminar)
window.editarNodo = (id) => {
    const lugar = lugaresRegistrados.find(l => l.id === id);
    if (!lugar) return;

    document.getElementById("idNodo").value = lugar.id;
    document.getElementById("idNodo").disabled = true; 
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
};

document.getElementById("formNodo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msj = document.getElementById("msjEstado");
    const id = document.getElementById("idNodo").value.trim().toLowerCase();
    
    try {
        msj.style.color = "blue"; msj.innerText = modoEdicion ? "Actualizando..." : "Guardando...";

        if (modoEdicion) {
            await updateDoc(doc(db, "lugares", id), {
                nombre: document.getElementById("nombreNodo").value.trim(),
                categoria: document.getElementById("categoriaNodo").value,
                descripcion: document.getElementById("descripcionNodo").value.trim(),
                imagen: document.getElementById("imagenNodo").value.trim()
            });
            msj.style.color = "green"; msj.innerText = "¡Área actualizada con éxito!";
            setTimeout(cancelarEdicion, 1500);
        } else {
            await setDoc(doc(db, "lugares", id), {
                id: id,
                nombre: document.getElementById("nombreNodo").value.trim(),
                categoria: document.getElementById("categoriaNodo").value,
                descripcion: document.getElementById("descripcionNodo").value.trim(),
                imagen: document.getElementById("imagenNodo").value.trim(),
                hotSpots: [] 
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

// 4. Crear Hotspots
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
            msj.style.color = "green"; msj.innerText = "¡Hotspot creado!";
            formHotspot.reset();
        } catch (error) { msj.style.color = "red"; msj.innerText = "Error: " + error.message; }
    });
}

// 5. GESTIÓN INDIVIDUAL DE HOTSPOTS (LA VENTANA MODAL)
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
            const item = document.createElement("div");
            item.className = "hotspot-item";
            item.innerHTML = `
                <div class="hotspot-info">
                    <strong>Hacia: ${hs.destinoId}</strong>
                    <span>Texto: "${hs.texto || hs.text || 'Sin texto'}" | Pitch: ${hs.pitch}, Yaw: ${hs.yaw}</span>
                </div>
                <button class="btn-eliminar" onclick="eliminarHotspotDirecto('${lugar.id}', ${index})">Borrar</button>
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

    // Clonamos el arreglo de flechas y borramos la que seleccionaste
    const nuevosHotspots = [...lugar.hotSpots];
    nuevosHotspots.splice(hotspotIndex, 1);

    try {
        // Actualizamos la base de datos con el arreglo limpio
        await updateDoc(doc(db, "lugares", nodoId), {
            hotSpots: nuevosHotspots
        });
        
        // Actualizamos la memoria local y recargamos la ventana modal al instante
        lugar.hotSpots = nuevosHotspots;
        window.abrirModalHotspots(nodoId);
        
    } catch (error) {
        alert("Error al borrar la flecha: " + error.message);
    }
};