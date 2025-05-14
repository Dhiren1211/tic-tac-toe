document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    const gameStatus = document.getElementById('gameStatus');
    const resetBtn = document.getElementById('resetBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalBtn = document.getElementById('modalBtn');
    const pvpBtn = document.getElementById('pvpBtn');
    const pvcBtn = document.getElementById('pvcBtn');
    const difficultySelector = document.getElementById('difficultySelector');

    let currentPlayer = 'X';
    let gameState = Array(9).fill('');
    let gameActive = true;
    let gameMode = 'pvp';
    let difficulty = 'medium';

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function initializeGame() {
        gameBoard.innerHTML = '';
        gameState = Array(9).fill('');
        gameActive = true;
        currentPlayer = 'X';
        gameStatus.textContent = `Player ${currentPlayer}'s turn`;
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
        document.querySelectorAll('.winning-line').forEach(el => el.remove());
    }

    function handleCellClick(e) {
        const index = +e.target.dataset.index;
        if (!gameActive || gameState[index]) return;

        makeMove(index, currentPlayer);
        checkResult();

        if (gameMode === 'pvc' && gameActive && currentPlayer === 'O') {
            setTimeout(() => {
                const move = getComputerMove();
                makeMove(move, 'O');
                checkResult();
            }, 500);
        }
    }

    function makeMove(index, player) {
        gameState[index] = player;
        const cell = gameBoard.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }

    function checkResult() {
        for (let combo of winningConditions) {
            const [a, b, c] = combo;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                endGame(gameState[a], combo);
                return;
            }
        }
        if (!gameState.includes('')) {
            endGame('draw');
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            gameStatus.textContent = `Player ${currentPlayer}'s turn`;
        }
    }

    function endGame(winner, combo = []) {
        gameActive = false;
        if (winner === 'draw') {
            gameStatus.textContent = 'Game ended in a draw!';
            showModal('Draw!', 'The game ended in a tie.');
        } else {
            gameStatus.textContent = `Player ${winner} wins!`;
            highlightWinningCells(combo);
            showModal(`Player ${winner} Wins!`, `Congratulations, Player ${winner} has won.`);
        }
    }

    function highlightWinningCells(combo) {
        combo.forEach(index => {
            gameBoard.querySelector(`[data-index="${index}"]`).classList.add('win');
        });
    }

    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalOverlay.classList.add('active');
    }

    function getComputerMove() {
        if (difficulty === 'easy') return getRandomMove();

        const move = minimax(gameState.slice(), 'O', 0).index;
        return difficulty === 'medium' ? (Math.random() < 0.7 ? move : getRandomMove()) : move;
    }

    function getRandomMove() {
        const available = gameState.map((val, i) => val === '' ? i : null).filter(v => v !== null);
        return available[Math.floor(Math.random() * available.length)];
    }

    function minimax(state, player, depth) {
        const available = state.map((val, i) => val === '' ? i : null).filter(v => v !== null);
        const winner = checkWinner(state);
        if (winner === 'X') return { score: -10 + depth };
        if (winner === 'O') return { score: 10 - depth };
        if (available.length === 0) return { score: 0 };

        const moves = [];
        for (let i of available) {
            const newState = state.slice();
            newState[i] = player;
            const next = player === 'O' ? 'X' : 'O';
            const result = minimax(newState, next, depth + 1);
            moves.push({ index: i, score: result.score });
        }

        return player === 'O'
            ? moves.reduce((best, move) => move.score > best.score ? move : best)
            : moves.reduce((best, move) => move.score < best.score ? move : best);
    }

    function checkWinner(state) {
        for (let [a, b, c] of winningConditions) {
            if (state[a] && state[a] === state[b] && state[a] === state[c]) return state[a];
        }
        return null;
    }

    function resetGame() {
        initializeGame();
        modalOverlay.classList.remove('active');
        if (gameMode === 'pvc' && currentPlayer === 'O') {
            setTimeout(() => {
                const move = getComputerMove();
                makeMove(move, 'O');
                checkResult();
            }, 500);
        }
    }

    function setGameMode(mode) {
        gameMode = mode;
        pvpBtn.classList.toggle('active', mode === 'pvp');
        pvcBtn.classList.toggle('active', mode === 'pvc');
        difficultySelector.classList.toggle('hidden', mode === 'pvp');
        resetGame();
    }

    function setDifficulty(level) {
        difficulty = level;
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === level);
        });
        resetGame();
    }

    resetBtn.addEventListener('click', resetGame);
    modalBtn.addEventListener('click', resetGame);
    pvpBtn.addEventListener('click', () => setGameMode('pvp'));
    pvcBtn.addEventListener('click', () => setGameMode('pvc'));
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
    });

    initializeGame();
});
