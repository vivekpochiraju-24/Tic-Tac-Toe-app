// script.js
const X_CLASS = 'x';
const CIRCLE_CLASS = 'circle';
const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const restartButton = document.getElementById('restartButton');
const messageElement = document.getElementById('message');
const modeSelection = document.getElementById('modeSelection');
const playerSelection = document.getElementById('playerSelection');
const player1Symbol = document.getElementById('player1Symbol');
const player2Symbol = document.getElementById('player2Symbol');

let circleTurn;
let isSinglePlayer;
let player1Class;
let player2Class;

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

startGame();

restartButton.addEventListener('click', startGame);
document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', handleModeChange);
});

player1Symbol.addEventListener('change', handleSymbolChange);

function startGame() {
    isSinglePlayer = document.querySelector('input[name="mode"]:checked').value === 'singleplayer';
    
    if (isSinglePlayer) {
        playerSelection.style.display = 'none';
        player1Class = player1Symbol.value;
        player2Class = (player1Class === X_CLASS) ? CIRCLE_CLASS : X_CLASS;
    } else {
        playerSelection.style.display = 'block';
        player1Class = player1Symbol.value;
        player2Class = player2Symbol.value;
    }

    circleTurn = false;
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(CIRCLE_CLASS);
        cell.textContent = '';
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    setBoardHoverClass();
    messageElement.innerText = '';
}

function handleClick(e) {
    const cell = e.target;
    const currentClass = circleTurn ? player2Class : player1Class;
    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
        if (isSinglePlayer && circleTurn) {
            setTimeout(() => {
                computerMove();
                if (checkWin(player2Class)) {
                    endGame(false);
                } else if (isDraw()) {
                    endGame(true);
                } else {
                    swapTurns();
                    setBoardHoverClass();
                }
            }, 500); // Delay computer move for better UX
        }
    }
}

function endGame(draw) {
    if (draw) {
        messageElement.innerText = "Draw!";
    } else {
        messageElement.innerText = `${circleTurn ? player2Class === CIRCLE_CLASS ? "O's" : "X's" : player1Class === X_CLASS ? "X's" : "O's"} Wins!`;
    }
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS);
    });
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
    cell.textContent = currentClass === CIRCLE_CLASS ? 'O' : 'X';
}

function swapTurns() {
    circleTurn = !circleTurn;
}

function setBoardHoverClass() {
    board.classList.remove(X_CLASS);
    board.classList.remove(CIRCLE_CLASS);
    board.classList.add(circleTurn ? CIRCLE_CLASS : X_CLASS);
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        });
    });
}

function computerMove() {
    const bestMove = getBestMove();
    if (bestMove !== null) {
        placeMark(cellElements[bestMove], CIRCLE_CLASS);
    }
}

function getBestMove() {
    const availableCells = [...cellElements].map((cell, index) => !cell.classList.contains(X_CLASS) && !cell.classList.contains(CIRCLE_CLASS) ? index : null).filter(index => index !== null);

    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < availableCells.length; i++) {
        const cellIndex = availableCells[i];
        cellElements[cellIndex].classList.add(CIRCLE_CLASS);
        const score = minimax(cellElements, 0, false);
        cellElements[cellIndex].classList.remove(CIRCLE_CLASS);

        if (score > bestScore) {
            bestScore = score;
            move = cellIndex;
        }
    }

    return move;
}

function minimax(board, depth, isMaximizing) {
    if (checkWin(CIRCLE_CLASS)) return 10;
    if (checkWin(X_CLASS)) return -10;
    if (isDraw()) return 0;

    const availableCells = [...cellElements].map((cell, index) => !cell.classList.contains(X_CLASS) && !cell.classList.contains(CIRCLE_CLASS) ? index : null).filter(index => index !== null);

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < availableCells.length; i++) {
            const cellIndex = availableCells[i];
            cellElements[cellIndex].classList.add(CIRCLE_CLASS);
            const score = minimax(cellElements, depth + 1, false);
            cellElements[cellIndex].classList.remove(CIRCLE_CLASS);
            bestScore = Math.max(score, bestScore);
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < availableCells.length; i++) {
            const cellIndex = availableCells[i];
            cellElements[cellIndex].classList.add(X_CLASS);
            const score = minimax(cellElements, depth + 1, true);
            cellElements[cellIndex].classList.remove(X_CLASS);
            bestScore = Math.min(score, bestScore);
        }
        return bestScore;
    }
}

function handleModeChange() {
    startGame();
}

function handleSymbolChange() {
    if (isSinglePlayer) {
        player1Class = player1Symbol.value;
        player2Class = (player1Class === X_CLASS) ? CIRCLE_CLASS : X_CLASS;
        startGame(); // Restart game with updated symbol assignments
    }
}
