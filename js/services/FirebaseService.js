import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Configuración centralizada de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBOnHVSB_Mg_YcCopEDnm-Qg4IjRNNmXys",
  authDomain: "tour-virtual-tecmm.firebaseapp.com",
  projectId: "tour-virtual-tecmm",
  storageBucket: "tour-virtual-tecmm.firebasestorage.app",
  messagingSenderId: "890959572345",
  appId: "1:890959572345:web:d7f64047d74c6298aa13a8",
  measurementId: "G-LHWT7845Z4"
};

// Inicializar servicios
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exportamos 'db' y 'auth' para que los otros archivos puedan usarlos
export { db, auth };