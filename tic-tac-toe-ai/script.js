const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const boardElement = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const statusMessage = document.getElementById("status-message");
const symbolPicker = document.getElementById("symbol-picker");
const symbolChips = Array.from(document.querySelectorAll(".option-chip[data-symbol]"));
const turnPicker = document.getElementById("turn-picker");
const turnChips = Array.from(document.querySelectorAll(".option-chip[data-turn]"));
const difficultyPicker = document.getElementById("difficulty-picker");
const difficultyChips = Array.from(document.querySelectorAll(".difficulty-chip"));
const newGameButton = document.getElementById("new-game");
const resetScoreButton = document.getElementById("reset-score");
const humanScoreElement = document.getElementById("human-score");
const drawScoreElement = document.getElementById("draw-score");
const aiScoreElement = document.getElementById("ai-score");

const scores = {
  human: 0,
  draw: 0,
  ai: 0,
};

const state = {
  board: Array(9).fill(""),
  human: "X",
  ai: "O",
  difficulty: "hard",
  startingTurn: "human",
  currentTurn: "human",
  active: false,
};

function getWinner(board) {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line: [a, b, c] };
    }
  }
  return null;
}

function isDraw(board) {
  return board.every(Boolean) && !getWinner(board);
}

function availableMoves(board) {
  return board
    .map((value, index) => (value ? null : index))
    .filter((value) => value !== null);
}

function minimax(board, maximizing, alpha = -Infinity, beta = Infinity) {
  const winner = getWinner(board);
  if (winner?.player === state.ai) {
    return 1;
  }
  if (winner?.player === state.human) {
    return -1;
  }
  if (isDraw(board)) {
    return 0;
  }

  if (maximizing) {
    let bestScore = -Infinity;
    for (const move of availableMoves(board)) {
      board[move] = state.ai;
      const score = minimax(board, false, alpha, beta);
      board[move] = "";
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        break;
      }
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (const move of availableMoves(board)) {
    board[move] = state.human;
    const score = minimax(board, true, alpha, beta);
    board[move] = "";
    bestScore = Math.min(bestScore, score);
    beta = Math.min(beta, score);
    if (beta <= alpha) {
      break;
    }
  }
  return bestScore;
}

function getBestMove() {
  let bestScore = -Infinity;
  let chosenMove = availableMoves(state.board)[0];

  for (const move of availableMoves(state.board)) {
    state.board[move] = state.ai;
    const score = minimax(state.board, false);
    state.board[move] = "";
    if (score > bestScore) {
      bestScore = score;
      chosenMove = move;
    }
  }

  return chosenMove;
}

function getRandomMove() {
  const moves = availableMoves(state.board);
  return moves[Math.floor(Math.random() * moves.length)];
}

function getMediumMove() {
  const moves = availableMoves(state.board);

  for (const move of moves) {
    state.board[move] = state.ai;
    if (getWinner(state.board)?.player === state.ai) {
      state.board[move] = "";
      return move;
    }
    state.board[move] = "";
  }

  for (const move of moves) {
    state.board[move] = state.human;
    if (getWinner(state.board)?.player === state.human) {
      state.board[move] = "";
      return move;
    }
    state.board[move] = "";
  }

  if (Math.random() < 0.55) {
    return getBestMove();
  }

  return getRandomMove();
}

function getAiMove() {
  if (state.difficulty === "easy") {
    return getRandomMove();
  }
  if (state.difficulty === "medium") {
    return getMediumMove();
  }
  return getBestMove();
}

function updateScoreboard() {
  humanScoreElement.textContent = String(scores.human);
  drawScoreElement.textContent = String(scores.draw);
  aiScoreElement.textContent = String(scores.ai);
}

function renderDifficulty() {
  difficultyChips.forEach((chip) => {
    const isActive = chip.dataset.difficulty === state.difficulty;
    chip.classList.toggle("active", isActive);
    chip.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function renderSymbol() {
  symbolChips.forEach((chip) => {
    const isActive = chip.dataset.symbol === state.human;
    chip.classList.toggle("active", isActive);
    chip.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function renderTurn() {
  turnChips.forEach((chip) => {
    const isActive = chip.dataset.turn === state.startingTurn;
    chip.classList.toggle("active", isActive);
    chip.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function renderBoard(winningLine = []) {
  cells.forEach((cell, index) => {
    const value = state.board[index];
    cell.textContent = value;
    cell.dataset.value = value;
    cell.disabled = !state.active || state.currentTurn !== "human" || Boolean(value);
    cell.classList.toggle("win-cell", winningLine.includes(index));
  });
}

function finishRound(result) {
  state.active = false;
  renderBoard(result.line || []);

  if (result.type === "human") {
    scores.human += 1;
    statusMessage.textContent = "You found a winning line.";
  } else if (result.type === "ai") {
    scores.ai += 1;
    statusMessage.textContent = "The AI takes the round.";
  } else {
    scores.draw += 1;
    statusMessage.textContent = "Perfect defense from both sides. It's a draw.";
  }

  updateScoreboard();
}

function evaluateBoard() {
  const winner = getWinner(state.board);
  if (winner?.player === state.human) {
    finishRound({ type: "human", line: winner.line });
    return true;
  }
  if (winner?.player === state.ai) {
    finishRound({ type: "ai", line: winner.line });
    return true;
  }
  if (isDraw(state.board)) {
    finishRound({ type: "draw", line: [] });
    return true;
  }
  return false;
}

function setStatusForTurn() {
  if (!state.active) {
    return;
  }
  statusMessage.textContent =
    state.currentTurn === "human"
      ? "Your move. Pick a square."
      : "AI is calculating the strongest move.";
}

function handleAiTurn() {
  if (!state.active) {
    return;
  }

  state.currentTurn = "ai";
  renderBoard();
  setStatusForTurn();

  window.setTimeout(() => {
    const move = getAiMove();
    state.board[move] = state.ai;
    if (evaluateBoard()) {
      return;
    }
    state.currentTurn = "human";
    renderBoard();
    setStatusForTurn();
  }, 300);
}

function startGame() {
  state.ai = state.human === "X" ? "O" : "X";
  state.currentTurn = state.startingTurn;
  state.board = Array(9).fill("");
  state.active = true;

  renderSymbol();
  renderTurn();
  renderDifficulty();
  renderBoard();
  statusMessage.textContent =
    state.currentTurn === "human"
      ? `You are ${state.human}. ${state.difficulty[0].toUpperCase()}${state.difficulty.slice(1)} mode is ready.`
      : `You are ${state.human}. The AI opens as ${state.ai} in ${state.difficulty} mode.`;

  if (state.currentTurn === "ai") {
    handleAiTurn();
  } else {
    setStatusForTurn();
  }
}

function resetScores() {
  scores.human = 0;
  scores.draw = 0;
  scores.ai = 0;
  updateScoreboard();
  statusMessage.textContent = "Score reset. Start a fresh match anytime.";
}

boardElement.addEventListener("click", (event) => {
  const cell = event.target.closest(".cell");
  if (!cell || !state.active || state.currentTurn !== "human") {
    return;
  }

  const index = Number(cell.dataset.index);
  if (state.board[index]) {
    return;
  }

  state.board[index] = state.human;
  if (evaluateBoard()) {
    return;
  }

  handleAiTurn();
});

difficultyPicker.addEventListener("click", (event) => {
  const chip = event.target.closest(".difficulty-chip");
  if (!chip) {
    return;
  }

  state.difficulty = chip.dataset.difficulty;
  renderDifficulty();
});

symbolPicker.addEventListener("click", (event) => {
  const chip = event.target.closest(".option-chip");
  if (!chip) {
    return;
  }

  state.human = chip.dataset.symbol;
  state.ai = state.human === "X" ? "O" : "X";
  renderSymbol();
});

turnPicker.addEventListener("click", (event) => {
  const chip = event.target.closest(".option-chip");
  if (!chip) {
    return;
  }

  state.startingTurn = chip.dataset.turn;
  renderTurn();
});

newGameButton.addEventListener("click", startGame);
resetScoreButton.addEventListener("click", resetScores);

updateScoreboard();
renderSymbol();
renderTurn();
renderDifficulty();
renderBoard();
