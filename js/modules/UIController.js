export class UIController {
    constructor(lugares, indicesMenu) {
        this.lugares = lugares;
        this.indicesMenu = indicesMenu;
    }

    actualizarDetalles(idEscena) {
        const index = this.lugares.findIndex(l => l.id === idEscena);
        if (index === -1) return;

        const lugar = this.lugares[index];

        const tvLugarActual = document.getElementById("tvLugarActual");
        const tvTituloLugar = document.getElementById("tvTituloLugar");
        const tvDescripcion = document.getElementById("tvDescripcion");

        if (tvLugarActual) tvLugarActual.innerText = `${lugar.categoria} - ${lugar.nombre}`;
        if (tvTituloLugar) tvTituloLugar.innerText = lugar.nombre;
        if (tvDescripcion) tvDescripcion.innerText = lugar.descripcion;

        this.marcarBotonActivo(index);
    }

    marcarBotonActivo(indexEscena) {
        const botones = document.querySelectorAll(".btn-nav");
        botones.forEach((btn, idx) => {
            btn.classList.toggle("active", this.indicesMenu[idx] === indexEscena);
        });
    }

    filtrarPorCarrera(carreraSeleccionada, tourViewer) {
        if (carreraSeleccionada === "todas") return;

        // Busca la primera escena asociada a esa carrera
        const lugarEncontrado = this.lugares.find(l => l.carrera === carreraSeleccionada);
        if (lugarEncontrado && tourViewer) {
            tourViewer.cargarEscenaPorId(lugarEncontrado.id);
        }
    }
}