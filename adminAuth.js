// Importamos auth desde el servicio central
import { auth } from "./js/services/FirebaseService.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.getElementById("btnLogin").addEventListener("click", () => {
    const email = document.getElementById("txtEmail").value.trim();
    const password = document.getElementById("txtPassword").value.trim();
    const msjError = document.getElementById("msjError");

    if(!email || !password) {
        msjError.innerText = "Por favor, ingresa correo y contraseña.";
        msjError.style.display = "block";
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = "dashboard.html"; 
        })
        .catch((error) => {
            msjError.innerText = "Error: Credenciales incorrectas.";
            msjError.style.display = "block";
        });
});