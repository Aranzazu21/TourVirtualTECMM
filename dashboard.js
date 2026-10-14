// Importamos la conexión desde el servicio central
import { db, auth } from "./services/FirebaseService.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, doc, setDoc, updateDoc, arrayUnion, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Verificar sesión
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "admin.html";
    else cargarNodosEnTabla();
});

// Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "admin.html");
});

function cargarNodosEnTabla() {
    const tablaBody = document.getElementById("tablaNodosBody");
    const selectOrigen = document.getElementById("selectOrigen");
    const selectDestino = document.getElementById("selectDestino");
    
    onSnapshot(collection(db, "lugares"), (snapshot) => {
        tablaBody.innerHTML = "";
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
                <td><span style="background:#28a745; color:white; padding:3px 8px; border-radius:10px;">${numHotspots}</span></td>
                <td><button class="btn-eliminar" onclick="eliminarNodo('${lugar.id}')">Eliminar</button></td>
            `;
            tablaBody.appendChild(fila);
        });
    });
}

document.getElementById("formNodo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msj = document.getElementById("msjEstado");
    const id = document.getElementById("idNodo").value.trim().toLowerCase();
    
    try {
        msj.style.color = "blue"; msj.innerText = "Guardando...";
        await setDoc(doc(db, "lugares", id), {
            id: id,
            nombre: document.getElementById("nombreNodo").value.trim(),
            categoria: document.getElementById("categoriaNodo").value,
            descripcion: document.getElementById("descripcionNodo").value.trim(),
            imagen: document.getElementById("imagenNodo").value.trim(),
            hotSpots: []
        });
        msj.style.color = "green"; msj.innerText = "¡Registrado!";
        document.getElementById("formNodo").reset();
    } catch (error) { msj.style.color = "red"; msj.innerText = "Error: " + error.message; }
});

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
                hotSpots: arrayUnion({ destinoId, pitch, yaw, texto: document.getElementById("textoHotspot").value.trim() })
            });
            msj.style.color = "green"; msj.innerText = "¡Hotspot creado!";
            formHotspot.reset();
        } catch (error) { msj.style.color = "red"; msj.innerText = "Error: " + error.message; }
    });
}

window.eliminarNodo = async (id) => {
    if (confirm(`¿Eliminar área "${id}"?`)) await deleteDoc(doc(db, "lugares", id));
};