// ======================================
//   CATGALLERY - ESTRUCTURA BASE
// ======================================

const CatGallery = {
  // URL base de la API
  baseURL: "https://api.thecatapi.com/v1/images/search",

  // Número de imágenes por carga
  limit: 12,

  // Categoría seleccionada por el usuario
  currentCategory: "",

  // Array donde guardamos todas las imágenes cargadas
  cats: [],


  
  //   INICIALIZACIÓN
  init() {
    this.attachEvents();
  },
  
  //   EVENTOS DE LA INTERFAZ
  attachEvents() {
    // Botón principal: carga inicial
    document.getElementById("cat-load").addEventListener("click", () => {
      this.cats = [];        // Reinicia la galería
      this.loadCats(true);   // true = reemplazar contenido
    });

    // Botón "Cargar más": añade más imágenes debajo
    document.getElementById("cat-more").addEventListener("click", () => {
      this.loadCats(false);  // false = añadir al final
    });

    // Cambio de categoría
    document.getElementById("cat-category").addEventListener("change", (e) => {
      this.currentCategory = e.target.value;
      this.cats = [];
      this.loadCats(true);
    });

    // Eventos del modal
    const modal = document.getElementById("cat-modal");
    const closeBtn = document.getElementById("cat-modal-close");

    closeBtn.addEventListener("click", () => {
      this.hideModal();
    });

    // Cerrar modal haciendo clic fuera de la imagen
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.hideModal();
    });
  },

  //   CONSTRUCCIÓN DE LA URL DE LA API
  buildURL() {
    const params = new URLSearchParams();
    params.set("limit", this.limit);

    // Si hay categoría seleccionada, se añade a la URL
    if (this.currentCategory) {
      params.set("category_ids", this.currentCategory);
    }

    return `${this.baseURL}?${params.toString()}`;
  },

  //   PETICIÓN A LA API
  async loadCats(reset) {
    this.showMessage("Cargando imágenes...");

    try {
      const response = await fetch(this.buildURL());
      if (!response.ok) throw new Error("Error al cargar imágenes");

      const data = await response.json();

      // Si reset = true → reemplaza la galería
      // Si reset = false → añade al final
      this.cats = reset ? data : [...this.cats, ...data];

      this.renderCats();
      this.showMessage("");

    } catch (error) {
      this.showMessage("No se pudieron cargar las imágenes.");
    }
  },

  //   RENDERIZADO DE TARJETAS
  renderCats() {
    const grid = document.getElementById("cat-grid");
    grid.innerHTML = "";

    this.cats.forEach(cat => {
      const card = document.createElement("div");
      card.classList.add("cat-card");

      const img = document.createElement("img");
      img.src = cat.url;
      img.alt = "Gato";

      card.appendChild(img);
      grid.appendChild(card);

      // Abrir modal al hacer clic
      card.addEventListener("click", () => {
        this.showModal(cat.url);
      });
    });
  },

  // ======================================
  //   MODAL (IMAGEN EN GRANDE)
  // ======================================
  showModal(url) {
    const modal = document.getElementById("cat-modal");
    const img = document.getElementById("cat-modal-img");

    img.src = url;
    modal.classList.remove("hidden");
  },

  hideModal() {
    const modal = document.getElementById("cat-modal");
    modal.classList.add("hidden");
  },


  // ======================================
  //   MENSAJES DE ESTADO
  // ======================================
  showMessage(msg) {
    document.getElementById("cat-message").textContent = msg;
  }
};


// ======================================
//   INICIALIZAR MÓDULO
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  CatGallery.init();
});