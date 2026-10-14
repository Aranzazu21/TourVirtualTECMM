import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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
            console.log("¡Logueado con éxito!", userCredential.user.email);
            window.location.href = "dashboard.html"; 
        })
        .catch((error) => {
            msjError.innerText = "Error: Credenciales incorrectas o usuario no registrado.";
            msjError.style.display = "block";
            console.error(error.code, error.message);
        });
});