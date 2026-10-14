import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBOnHVSB_Mg_YcCopEDnm-Qg4IjRNNmXys",
  authDomain: "tour-virtual-tecmm.firebaseapp.com",
  projectId: "tour-virtual-tecmm",
  storageBucket: "tour-virtual-tecmm.firebasestorage.app",
  messagingSenderId: "890959572345",
  appId: "1:890959572345:web:d7f64047d74c6298aa13a8",
  measurementId: "G-LHWT7845Z4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 1. Protección de rutas (RF-11)
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "admin.html";
    } else {
        console.log("Sesión activa de administrador:", user.email);
        cargarNodosEnTabla();
    }
});

// 2. Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "admin.html";
    });
});

// 3. Consultar áreas en tiempo real (RF-12)
function cargarNodosEnTabla() {
    const tablaBody = document.getElementById("tablaNodosBody");
    
    onSnapshot(collection(db, "lugares"), (snapshot) => {
        tablaBody.innerHTML = "";
        
        if (snapshot.empty) {
            tablaBody.innerHTML = `<tr><td colspan="5">No hay áreas registradas en Firestore. ¡Registra la primera arriba!</td></tr>`;
            return;
        }

        snapshot.forEach((docSnapshot) => {
            const lugar = docSnapshot.data();
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td><b>${lugar.id}</b></td>
                <td>${lugar.nombre}</td>
                <td>${lugar.categoria}</td>
                <td><code>${lugar.imagen}</code></td>
                <td>
                    <button class="btn-eliminar" onclick="eliminarNodo('${lugar.id}')">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });
    });
}

// 4. Guardar nuevo nodo (RF-13)
document.getElementById("formNodo").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const msjEstado = document.getElementById("msjEstado");
    const id = document.getElementById("idNodo").value.trim().toLowerCase();
    const nombre = document.getElementById("nombreNodo").value.trim();
    const categoria = document.getElementById("categoriaNodo").value;
    const rutaImagen = document.getElementById("imagenNodo").value.trim();
    const descripcion = document.getElementById("descripcionNodo").value.trim();

    try {
        msjEstado.style.color = "blue";
        msjEstado.innerText = "Guardando en Firestore...";

        await setDoc(doc(db, "lugares", id), {
            id: id,
            nombre: nombre,
            categoria: categoria,
            descripcion: descripcion,
            imagen: rutaImagen,
            hotSpots: []
        });

        msjEstado.style.color = "green";
        msjEstado.innerText = "¡Área registrada con éxito en Firestore!";
        document.getElementById("formNodo").reset();

    } catch (error) {
        console.error("Error al guardar:", error);
        msjEstado.style.color = "red";
        msjEstado.innerText = "Error: " + error.message;
    }
});

// 5. Eliminar nodo (RF-16)
window.eliminarNodo = async (id) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el área "${id}"?`)) {
        try {
            await deleteDoc(doc(db, "lugares", id));
            alert("Área eliminada correctamente.");
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar el área.");
        }
    }
};