// ======================================
//   RICK & MORTY EXPLORER
// ======================================

const RickMorty = {
  apiURL: "https://rickandmortyapi.com/api/character",
  currentPage: 1,
  totalPages: 1,
  currentSearch: "",

  init() {
    this.attachEvents();
    this.loadCharacters();
  },

  // ======================================
  //   EVENTOS
  // ======================================
  attachEvents() {
    const searchInput = document.getElementById("rm-search");

    // Botón Buscar
    document.getElementById("rm-search-btn").addEventListener("click", () => {
      this.currentSearch = searchInput.value.trim();
      this.currentPage = 1;
      this.loadCharacters();
    });

    // Enter para buscar
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.currentSearch = searchInput.value.trim();
        this.currentPage = 1;
        this.loadCharacters();
      }
    });

    // Esc para limpiar búsqueda
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        this.currentSearch = "";
        this.currentPage = 1;
        this.loadCharacters();
      }
    });

    // Búsqueda en tiempo real (debounce)
    let typingTimer;
    searchInput.addEventListener("input", () => {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        this.currentSearch = searchInput.value.trim();
        this.currentPage = 1;
        this.loadCharacters();
      }, 300);
    });

    // Botón Anterior
    document.getElementById("rm-prev").addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadCharacters();
      }
    });

    // Botón Siguiente
    document.getElementById("rm-next").addEventListener("click", () => {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.loadCharacters();
      }
    });

    // Modal
    const modal = document.getElementById("rm-modal");
    const closeBtn = document.getElementById("rm-modal-close");

    closeBtn.addEventListener("click", () => this.hideModal());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.hideModal();
    });
  },

  // ======================================
  //   CONSTRUIR URL
  // ======================================
  buildURL() {
    const params = new URLSearchParams();
    params.set("page", this.currentPage);

    if (this.currentSearch) {
      params.set("name", this.currentSearch);
    }

    return `${this.apiURL}?${params.toString()}`;
  },

  // ======================================
  //   CARGAR PERSONAJES
  // ======================================
  async loadCharacters() {
    this.showMessage("Cargando personajes...");

    try {
      const response = await fetch(this.buildURL());
      if (!response.ok) throw new Error("No encontrado");

      const data = await response.json();

      this.totalPages = data.info.pages;
      this.renderCharacters(data.results);
      this.updatePagination();
      this.showMessage("");

    } catch (error) {
      this.renderCharacters([]);
      this.showMessage("No se encontraron personajes.");
    }
  },

  // ======================================
  //   RENDERIZAR TARJETAS
  // ======================================
  renderCharacters(characters) {
    const grid = document.getElementById("rm-grid");
    grid.innerHTML = "";

    characters.forEach(char => {
      const card = document.createElement("div");
      card.classList.add("rm-card");

      card.innerHTML = `
        <img src="${char.image}" alt="${char.name}">
        <div class="rm-card-info">
          <h3>${char.name}</h3>
          <p><strong>Estado:</strong> ${char.status}</p>
          <p><strong>Especie:</strong> ${char.species}</p>
          <p><strong>Origen:</strong> ${char.origin.name}</p>
        </div>
      `;

      // Abrir modal al hacer clic
      card.addEventListener("click", () => {
        this.showModal(char);
      });

      grid.appendChild(card);
    });
  },

  // ======================================
  //   MODAL (imagen + info)
  // ======================================
  showModal(char) {
    const modal = document.getElementById("rm-modal");
    const img = document.getElementById("rm-modal-img");
    const info = document.getElementById("rm-modal-info");

    img.src = char.image;

    info.innerHTML = `
      <h2>${char.name}</h2>
      <p><strong>Estado:</strong> ${char.status}</p>
      <p><strong>Especie:</strong> ${char.species}</p>
      <p><strong>Origen:</strong> ${char.origin.name}</p>
      <p><strong>Ubicación actual:</strong> ${char.location.name}</p>
    `;

    modal.classList.remove("hidden");
  },

  hideModal() {
    document.getElementById("rm-modal").classList.add("hidden");
  },

  // ======================================
  //   PAGINACIÓN
  // ======================================
  updatePagination() {
    document.getElementById("rm-page").textContent =
      `Página ${this.currentPage} de ${this.totalPages}`;
  },

  // ======================================
  //   MENSAJES
  // ======================================
  showMessage(msg) {
    document.getElementById("rm-message").textContent = msg;
  }
};

// Inicializar módulo
document.addEventListener("DOMContentLoaded", () => {
  RickMorty.init();
});