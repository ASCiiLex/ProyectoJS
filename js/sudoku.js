// ======================================
//   SUDOKU SOLVER – COMPLETO Y MEJORADO
// ======================================

const Sudoku = {
  board: [],

  init() {
    this.generateBoard();
    this.renderBoard();
    this.attachEvents();
  },

  // Crear matriz 9x9 vacía
  generateBoard() {
    this.board = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => "")
    );
  },

  // Renderizar inputs en el DOM
  renderBoard() {
    const container = document.getElementById("sudoku-board");
    container.innerHTML = "";

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.classList.add("sdk-cell");
        input.dataset.row = row;
        input.dataset.col = col;

        // Líneas gruesas de bloques 3x3
        if ((col + 1) % 3 === 0 && col !== 8) {
          input.classList.add("sdk-block-border");
        }
        if ((row + 1) % 3 === 0 && row !== 8) {
          input.classList.add("sdk-row-border");
        }

        container.appendChild(input);
      }
    }
  },

  attachEvents() {
    document.getElementById("sdk-solve").addEventListener("click", () => {
      this.readBoard();

      if (!this.validateInput()) return;
      if (!this.validateSudokuRules()) return;

      if (this.solve()) {
        this.writeBoard();
        this.showMessage("Sudoku resuelto correctamente.");
      } else {
        this.showMessage("No tiene solución.");
      }
    });

    document.getElementById("sdk-clear").addEventListener("click", () => {
      this.generateBoard();
      this.renderBoard();
      this.showMessage("");
    });
  },

  // Leer valores del DOM a la matriz
  readBoard() {
    const cells = document.querySelectorAll(".sdk-cell");

    cells.forEach(cell => {
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      const val = cell.value.trim();

      // Reset de clases
      cell.classList.remove("sdk-user", "sdk-error");

      if (val === "") {
        this.board[r][c] = "";
      } else if (/^[1-9]$/.test(val)) {
        this.board[r][c] = parseInt(val);
        cell.classList.add("sdk-user"); // negrita permanente
      } else {
        this.board[r][c] = "";
        cell.classList.add("sdk-error");
      }
    });
  },

  // Validación de caracteres (solo 1–9)
  validateInput() {
    const cells = document.querySelectorAll(".sdk-cell");
    let valid = true;

    cells.forEach(cell => {
      const val = cell.value.trim();
      if (val !== "" && !/^[1-9]$/.test(val)) {
        cell.classList.add("sdk-error");
        valid = false;
      }
    });

    if (!valid) {
      this.showMessage("Solo se permiten números del 1 al 9.");
    }

    return valid;
  },

  // Validación de reglas del Sudoku
  validateSudokuRules() {
    let valid = true;

    // Reset de errores previos
    document.querySelectorAll(".sdk-cell").forEach(c => c.classList.remove("sdk-error"));

    // Revisar filas
    for (let r = 0; r < 9; r++) {
      const seen = {};
      for (let c = 0; c < 9; c++) {
        const val = this.board[r][c];
        if (val !== "") {
          if (seen[val]) {
            valid = false;
            this.markError(r, c);
            this.markError(r, seen[val] - 1);
          } else {
            seen[val] = c + 1;
          }
        }
      }
    }

    // Revisar columnas
    for (let c = 0; c < 9; c++) {
      const seen = {};
      for (let r = 0; r < 9; r++) {
        const val = this.board[r][c];
        if (val !== "") {
          if (seen[val]) {
            valid = false;
            this.markError(r, c);
            this.markError(seen[val] - 1, c);
          } else {
            seen[val] = r + 1;
          }
        }
      }
    }

    // Revisar bloques 3x3
    for (let br = 0; br < 9; br += 3) {
      for (let bc = 0; bc < 9; bc += 3) {
        const seen = {};
        for (let r = br; r < br + 3; r++) {
          for (let c = bc; c < bc + 3; c++) {
            const val = this.board[r][c];
            if (val !== "") {
              if (seen[val]) {
                valid = false;
                this.markError(r, c);
                const [rr, cc] = seen[val];
                this.markError(rr, cc);
              } else {
                seen[val] = [r, c];
              }
            }
          }
        }
      }
    }

    if (!valid) {
      this.showMessage("Hay errores en el Sudoku. Revisa las celdas marcadas.");
    }

    return valid;
  },

  markError(r, c) {
    const cell = document.querySelector(`.sdk-cell[data-row="${r}"][data-col="${c}"]`);
    cell.classList.add("sdk-error");
  },

  // Escribir valores de la matriz al DOM
  writeBoard() {
    const cells = document.querySelectorAll(".sdk-cell");
    cells.forEach(cell => {
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      cell.value = this.board[r][c] || "";
    });
  },

  // Mostrar mensajes
  showMessage(msg) {
    document.getElementById("sudoku-message").textContent = msg;
  },

  // ===============================
  //   ALGORITMO DE RESOLUCIÓN
  // ===============================

  solve() {
    const empty = this.findEmpty();
    if (!empty) return true;

    const [row, col] = empty;

    for (let num = 1; num <= 9; num++) {
      if (this.isValid(num, row, col)) {
        this.board[row][col] = num;

        if (this.solve()) return true;

        this.board[row][col] = "";
      }
    }

    return false;
  },

  findEmpty() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.board[r][c] === "") return [r, c];
      }
    }
    return null;
  },

  isValid(num, row, col) {
    // Fila
    for (let c = 0; c < 9; c++) {
      if (this.board[row][c] === num) return false;
    }

    // Columna
    for (let r = 0; r < 9; r++) {
      if (this.board[r][col] === num) return false;
    }

    // Bloque 3x3
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;

    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if (this.board[r][c] === num) return false;
      }
    }

    return true;
  }
};

// Inicializar Sudoku al cargar la sección
document.addEventListener("DOMContentLoaded", () => {
  Sudoku.init();
});