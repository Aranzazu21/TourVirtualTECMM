import { db, auth } from "./js/services/FirebaseService.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, doc, setDoc, updateDoc, arrayUnion, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// aqui importamos la funcion de nuestro nuevo archivo para el chat
import { inicializarChatAdmin } from "./js/modules/chatAdmin.js";

let lugaresRegistrados = []; 
let modoEdicion = false; 

// 1. checar sesion
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "admin.html";
    else cargarNodosEnTabla();
});

// cerrar sesion
document.getElementById("btnLogout").addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "admin.html");
});

// 2. cargar tabla y llenar opciones
function cargarNodosEnTabla() {
    const tablaBody = document.getElementById("tablaNodosBody");
    const selectOrigen = document.getElementById("selectOrigen");
    const selectDestino = document.getElementById("selectDestino");
    
    // onSnapshot escucha los cambios en tiempo real desde firebase
    onSnapshot(collection(db, "lugares"), (snapshot) => {
        tablaBody.innerHTML = "";
        lugaresRegistrados = []; 
        
        if(selectOrigen && selectDestino) {
            selectOrigen.innerHTML = '<option value="">-- Selecciona Origen --</option>';
            selectDestino.innerHTML = '<option value="">-- Selecciona Destino --</option>';
        }
        
        if (snapshot.empty) {
            tablaBody.innerHTML = `<tr><td colspan="6">no hay areas registradas.</td></tr>`;
            return;
        }

        // recorremos los lugares que bajamos de internet
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

        // ESTO ES LO NUEVO: le pasamos la lista de lugares a la ventana del chat
        inicializarChatAdmin(lugaresRegistrados);
    });
}

// 3. administrar lugares (crear/editar/borrar)
window.editarNodo = (id) => {
    const lugar = lugaresRegistrados.find(l => l.id === id);
    if (!lugar) return;

    document.getElementById("idNodo").value = lugar.id;
    document.getElementById("idNodo").disabled = true; 
    document.getElementById("nombreNodo").value = lugar.nombre;
    document.getElementById("categoriaNodo").value = lugar.categoria || "Accesos";
    document.getElementById("descripcionNodo").value = lugar.descripcion;
    document.getElementById("imagenNodo").value = lugar.imagen;

    document.getElementById("tituloFormularioNodo").innerText = `editando area: ${lugar.nombre}`;
    document.getElementById("btnSubmitNodo").innerText = "actualizar area";
    document.getElementById("btnCancelarEdicion").style.display = "inline-block";
    document.getElementById("msjEstado").innerText = "";
    modoEdicion = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.cancelarEdicion = () => {
    document.getElementById("formNodo").reset();
    document.getElementById("idNodo").disabled = false;
    document.getElementById("tituloFormularioNodo").innerText = "1. registrar nueva area / nodo 360°";
    document.getElementById("btnSubmitNodo").innerText = "guardar area en firestore";
    document.getElementById("btnCancelarEdicion").style.display = "none";
    document.getElementById("msjEstado").innerText = "";
    modoEdicion = false;
};

// guardar o actualizar un lugar
document.getElementById("formNodo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msj = document.getElementById("msjEstado");
    const id = document.getElementById("idNodo").value.trim().toLowerCase();
    
    try {
        msj.style.color = "blue"; msj.innerText = modoEdicion ? "actualizando..." : "guardando...";

        if (modoEdicion) {
            await updateDoc(doc(db, "lugares", id), {
                nombre: document.getElementById("nombreNodo").value.trim(),
                categoria: document.getElementById("categoriaNodo").value,
                descripcion: document.getElementById("descripcionNodo").value.trim(),
                imagen: document.getElementById("imagenNodo").value.trim()
            });
            msj.style.color = "green"; msj.innerText = "area actualizada con exito!";
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
            msj.style.color = "green"; msj.innerText = "area registrada!";
            document.getElementById("formNodo").reset();
        }
    } catch (error) { msj.style.color = "red"; msj.innerText = "error: " + error.message; }
});

// borrar un lugar
window.eliminarNodo = async (id) => {
    if (confirm(`seguro que quieres eliminar el area "${id}"? se borrara el registro y sus flechas.`)) {
        await deleteDoc(doc(db, "lugares", id));
    }
};

// 4. crear flechas (hotspots)
const formHotspot = document.getElementById("formHotspot");
if (formHotspot) {
    formHotspot.addEventListener("submit", async (e) => {
        e.preventDefault();
        const msj = document.getElementById("msjHotspotEstado");
        const origenId = document.getElementById("selectOrigen").value;
        const destinoId = document.getElementById("selectDestino").value;
        const pitch = parseFloat(document.getElementById("pitchHotspot").value);
        const yaw = parseFloat(document.getElementById("yawHotspot").value);

        if (origenId === destinoId) return alert("origen y destino no pueden ser iguales.");

        try {
            msj.style.color = "blue"; msj.innerText = "vinculando...";
            await updateDoc(doc(db, "lugares", origenId), {
                hotSpots: arrayUnion({ 
                    destinoId, 
                    pitch, 
                    yaw, 
                    texto: document.getElementById("textoHotspot").value.trim() 
                })
            });
            msj.style.color = "green"; msj.innerText = "flecha creada!";
            formHotspot.reset();
        } catch (error) { msj.style.color = "red"; msj.innerText = "error: " + error.message; }
    });
}

// 5. ver y borrar flechas (la ventana modal de hotspots)
window.abrirModalHotspots = (id) => {
    const lugar = lugaresRegistrados.find(l => l.id === id);
    if (!lugar) return;
    
    document.getElementById("modalTitulo").innerText = `flechas en: ${lugar.nombre}`;
    const lista = document.getElementById("listaHotspots");
    lista.innerHTML = "";

    if (!lugar.hotSpots || lugar.hotSpots.length === 0) {
        lista.innerHTML = "<p style='color: #64748b; text-align: center; padding: 20px;'>no hay flechas registradas en esta area.</p>";
    } else {
        lugar.hotSpots.forEach((hs, index) => {
            const item = document.createElement("div");
            item.className = "hotspot-item";
            item.innerHTML = `
                <div class="hotspot-info">
                    <strong>Hacia: ${hs.destinoId}</strong>
                    <span>Texto: "${hs.texto || hs.text || 'sin texto'}" | Pitch: ${hs.pitch}, Yaw: ${hs.yaw}</span>
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
    if (!confirm("seguro que quieres borrar esta flecha?")) return;
    
    const lugar = lugaresRegistrados.find(l => l.id === nodoId);
    if (!lugar) return;

    // copiamos las flechas y borramos la que seleccionamos
    const nuevosHotspots = [...lugar.hotSpots];
    nuevosHotspots.splice(hotspotIndex, 1);

    try {
        // subimos la lista ya limpia a firebase
        await updateDoc(doc(db, "lugares", nodoId), {
            hotSpots: nuevosHotspots
        });
        
        // actualizamos la ventana al instante
        lugar.hotSpots = nuevosHotspots;
        window.abrirModalHotspots(nodoId);
        
    } catch (error) {
        alert("error al borrar la flecha: " + error.message);
    }
};