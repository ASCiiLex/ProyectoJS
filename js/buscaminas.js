// ===============================
//   BUSCAMINAS – ESTRUCTURA BASE
// ===============================

const Buscaminas = {
  size: 8,
  mines: 10,
  board: [],
  revealedCount: 0,
  timer: null,
  timeElapsed: 0,
  gameOver: false,

  init() {
    this.size = parseInt(document.getElementById("bm-size").value);
    this.mines = parseInt(document.getElementById("bm-mines").value);

    this.board = [];
    this.revealedCount = 0;
    this.timeElapsed = 0;
    this.gameOver = false;

    document.getElementById("buscaminas-message").textContent = "";
    document.getElementById("bm-mines-left").textContent = `Minas: ${this.mines}`;
    document.getElementById("bm-timer").textContent = "Tiempo: 0s";

    this.stopTimer();
    this.startTimer();

    this.generateBoard();
    this.placeMines();
    this.calculateNumbers();
    this.renderBoard();
  },

  // ===============================
  //   GENERACIÓN DEL TABLERO
  // ===============================

  generateBoard() {
    this.board = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => ({
        mine: false,
        number: 0,
        revealed: false,
        flagged: false
      }))
    );
  },

  placeMines() {
    let placed = 0;

    while (placed < this.mines) {
      const x = Math.floor(Math.random() * this.size);
      const y = Math.floor(Math.random() * this.size);

      if (!this.board[x][y].mine) {
        this.board[x][y].mine = true;
        placed++;
      }
    }
  },

  calculateNumbers() {
    const dirs = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (this.board[x][y].mine) continue;

        let count = 0;

        dirs.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
            if (this.board[nx][ny].mine) count++;
          }
        });

        this.board[x][y].number = count;
      }
    }
  },

  // ===============================
  //   RENDER DEL TABLERO
  // ===============================

  renderBoard() {
    const container = document.getElementById("buscaminas-board");
    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${this.size}, 32px)`;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const cell = document.createElement("div");
        cell.classList.add("bm-cell");
        cell.dataset.x = x;
        cell.dataset.y = y;

        cell.addEventListener("click", () => this.handleLeftClick(x, y));
        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.handleRightClick(x, y);
        });

        container.appendChild(cell);
      }
    }
  },

  // ===============================
  //   EVENTOS
  // ===============================

  handleLeftClick(x, y) {
    if (this.gameOver) return;

    const cell = this.board[x][y];

    if (cell.revealed || cell.flagged) return;

    if (cell.mine) {
      this.revealAllMines();
      this.endGame(false);
      return;
    }

    this.revealCell(x, y);
    this.checkWin();
  },

  handleRightClick(x, y) {
    if (this.gameOver) return;

    const cell = this.board[x][y];
    if (cell.revealed) return;

    cell.flagged = !cell.flagged;

    const domCell = this.getDomCell(x, y);

    if (cell.flagged) {
      domCell.classList.add("flag");
      domCell.textContent = "🚩";
    } else {
      domCell.classList.remove("flag");
      domCell.textContent = "";
    }

    const flags = this.countFlags();
    document.getElementById("bm-mines-left").textContent = `Minas: ${this.mines - flags}`;
  },

  // ===============================
  //   REVELAR CELDAS
  // ===============================

  revealCell(x, y) {
    const cell = this.board[x][y];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    this.revealedCount++;

    const domCell = this.getDomCell(x, y);
    domCell.classList.add("revealed");

    if (cell.number > 0) {
      domCell.textContent = cell.number;
      domCell.dataset.number = cell.number; // para colorear
      return;
    }

    this.expandEmpty(x, y);
  },

  expandEmpty(x, y) {
    const dirs = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    dirs.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;

      if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size) return;

      const neighbor = this.board[nx][ny];

      if (neighbor.revealed || neighbor.flagged) return;

      this.revealCell(nx, ny);

      if (neighbor.number === 0) {
        this.expandEmpty(nx, ny);
      }
    });
  },

  // ===============================
  //   UTILIDADES
  // ===============================

  getDomCell(x, y) {
    return document.querySelector(`.bm-cell[data-x="${x}"][data-y="${y}"]`);
  },

  countFlags() {
    let count = 0;
    this.board.forEach(row =>
      row.forEach(cell => {
        if (cell.flagged) count++;
      })
    );
    return count;
  },

  revealAllMines() {
    this.board.forEach((row, x) =>
      row.forEach((cell, y) => {
        if (cell.mine) {
          const domCell = this.getDomCell(x, y);
          domCell.classList.add("mine");
          domCell.textContent = "💣";
        }
      })
    );
  },

  // ===============================
  //   VICTORIA / DERROTA
  // ===============================

  checkWin() {
    const totalCells = this.size * this.size;
    const safeCells = totalCells - this.mines;

    if (this.revealedCount === safeCells) {
      this.endGame(true);
    }
  },

  endGame(win) {
    this.gameOver = true;
    this.stopTimer();

    const msg = document.getElementById("buscaminas-message");
    msg.textContent = win ? "¡Has ganado!" : "Game Over";
  },

  // ===============================
  //   TEMPORIZADOR
  // ===============================

  startTimer() {
    this.timer = setInterval(() => {
      this.timeElapsed++;
      document.getElementById("bm-timer").textContent = `Tiempo: ${this.timeElapsed}s`;
    }, 1000);
  },

  stopTimer() {
    clearInterval(this.timer);
  }
};

// ===============================
//   EVENTO INICIAL
// ===============================

document.getElementById("bm-start").addEventListener("click", () => {
  Buscaminas.init();
});