import { auth } from "./js/services/FirebaseService.js";
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    setPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});

const btnLogin = document.getElementById("btnLogin");
const msjError = document.getElementById("msjError");
const txtPassword = document.getElementById("txtPassword");

async function ejecutarLogin() {
    const email = document.getElementById("txtEmail").value.trim();
    const password = txtPassword.value.trim();

    msjError.style.display = "none";

    if (!email || !password) {
        msjError.innerText = "Por favor ingresa correo y contraseña.";
        msjError.style.display = "block";
        return;
    }

    try {
        btnLogin.disabled = true;
        btnLogin.innerText = "Iniciando...";

        // La sesión se destruye automáticamente al cerrar la pestaña o el navegador
        await setPersistence(auth, browserSessionPersistence);

        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
    } catch (error) {
        btnLogin.disabled = false;
        btnLogin.innerText = "Iniciar Sesión";
        msjError.style.display = "block";
        msjError.innerText = "Correo o contraseña incorrectos.";
        console.error(error);
    }
}

if (btnLogin) {
    btnLogin.addEventListener("click", ejecutarLogin);
}

if (txtPassword) {
    txtPassword.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            ejecutarLogin();
        }
    });
}