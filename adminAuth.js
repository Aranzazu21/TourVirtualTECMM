import { auth } from "./js/services/FirebaseService.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});

const btnLogin = document.getElementById("btnLogin");
const msjError = document.getElementById("msjError");

if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        const email = document.getElementById("txtEmail").value.trim();
        const password = document.getElementById("txtPassword").value.trim();

        if (!email || !password) {
            msjError.innerText = "por favor ingresa correo y contraseña.";
            msjError.style.display = "block";
            return;
        }

        try {
            btnLogin.innerText = "iniciando...";
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "dashboard.html";
        } catch (error) {
            btnLogin.innerText = "Iniciar Sesión";
            msjError.style.display = "block";
            msjError.innerText = "correo o contraseña incorrectos.";
            console.error(error);
        }
    });
}