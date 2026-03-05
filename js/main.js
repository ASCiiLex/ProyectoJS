// Navegación entre apps

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("#menu button");
  const sections = document.querySelectorAll(".app-section");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;

      // Ocultar todas las secciones
      sections.forEach(sec => sec.classList.remove("active"));

      // Mostrar la sección seleccionada
      document.getElementById(target).classList.add("active");
    });
  });
});