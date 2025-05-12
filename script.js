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
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let gameMode = 'pvp'; // 'pvp' or 'pvc'
    let difficulty = 'medium'; // 'easy', 'medium', 'hard'

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Initialize the game board
    function initializeGame() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('touchend', handleCellClick, {passive: true});
            gameBoard.appendChild(cell);
        }
    }

    // Handle cell click
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // If cell already filled or game not active, ignore click
        if (gameState[clickedCellIndex] !== '' || !gameActive) return;

        // Update game state and UI
        makeMove(clickedCellIndex, currentPlayer);

        // Check for win or draw
        checkResult();
    }

    // Make a move
    function makeMove(index, player) {
        gameState[index] = player;
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }

    // Draw winning line
    function drawWinningLine(winningCombination) {
        const cells = document.querySelectorAll('.cell');
        const firstCell = cells[winningCombination[0]];
        const lastCell = cells[winningCombination[winningCombination.length - 1]];
        const boardRect = gameBoard.getBoundingClientRect();
        
        const firstRect = firstCell.getBoundingClientRect();
        const lastRect = lastCell.getBoundingClientRect();
        
        const firstX = firstRect.left + firstRect.width / 2 - boardRect.left;
        const firstY = firstRect.top + firstRect.height / 2 - boardRect.top;
        const lastX = lastRect.left + lastRect.width / 2 - boardRect.left;
        const lastY = lastRect.top + lastRect.height / 2 - boardRect.top;
        
        const line = document.createElement('div');
        line.classList.add('winning-line');
        
        if (firstRect.top === lastRect.top) {
            // Horizontal line
            line.classList.add('row');
            line.style.left = `${firstRect.left - boardRect.left}px`;
            line.style.top = `${firstY}px`;
            line.style.width = `${lastX - firstX}px`;
        } else if (firstRect.left === lastRect.left) {
            // Vertical line
            line.classList.add('column');
            line.style.left = `${firstX}px`;
            line.style.top = `${firstRect.top - boardRect.top}px`;
            line.style.height = `${lastY - firstY}px`;
        } else if (winningCombination.includes(0) && winningCombination.includes(8)) {
            // Diagonal top-left to bottom-right
            line.classList.add('diagonal-1');
            line.style.left = `${firstRect.left - boardRect.left}px`;
            line.style.top = `${firstRect.top - boardRect.top}px`;
        } else {
            // Diagonal top-right to bottom-left
            line.classList.add('diagonal-2');
            line.style.left = `${lastRect.left - boardRect.left}px`;
            line.style.top = `${lastRect.top - boardRect.top}px`;
        }
        
        line.style.opacity = '0';
        setTimeout(() => {
            line.style.opacity = '1';
        }, 10);
        
        document.querySelector('.game-board-container').appendChild(line);
    }

    // Check for win or draw
    function checkResult() {
        let roundWon = false;
        let winningCombination = null;

        // Check all winning conditions
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') continue;

            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                winningCombination = winningConditions[i];
                highlightWinningCells(winningCombination);
                drawWinningLine(winningCombination);
                break;
            }
        }

        // If won
        if (roundWon) {
            const winner = currentPlayer;
            gameStatus.textContent = `Player ${winner} wins!`;
            showModal(`Player ${winner} Wins!`, `Congratulations! Player ${winner} has won the game.`);
            gameActive = false;
            return;
        }

        // If draw
        if (!gameState.includes('')) {
            gameStatus.textContent = 'Game ended in a draw!';
            showModal('Game Draw!', 'The game has ended in a draw.');
            gameActive = false;
            return;
        }

        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        gameStatus.textContent = `Player ${currentPlayer}'s turn`;

        // If playing with computer and it's computer's turn
        if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
            setTimeout(() => {
                const computerMove = getComputerMove();
                makeMove(computerMove, 'O');
                checkResult();
            }, 500);
        }
    }

    // Highlight winning cells
    function highlightWinningCells(cells) {
        cells.forEach(index => {
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            cell.classList.add('win');
        });
    }

    // Computer move logic
    function getComputerMove() {
        if (difficulty === 'easy') {
            return getRandomMove();
        } else if (difficulty === 'medium') {
            // 50% chance to make a smart move, 50% random
            return Math.random() < 0.5 ? getSmartMove() : getRandomMove();
        } else {
            // Hard - always make the best possible move
            return getSmartMove();
        }
    }

    // Get a random available move
    function getRandomMove() {
        const availableMoves = gameState
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Get a smart move (tries to win or block player)
    function getSmartMove() {
        // 1. First check if computer can win in the next move
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const cells = [gameState[a], gameState[b], gameState[c]];
            
            // If two O's and one empty, win the game
            if (cells.filter(cell => cell === 'O').length === 2 && cells.includes('')) {
                const emptyIndex = cells.indexOf('');
                return [a, b, c][emptyIndex];
            }
        }

        // 2. Check if player can win in the next move and block
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const cells = [gameState[a], gameState[b], gameState[c]];
            
            // If two X's and one empty, block the player
            if (cells.filter(cell => cell === 'X').length === 2 && cells.includes('')) {
                const emptyIndex = cells.indexOf('');
                return [a, b, c][emptyIndex];
            }
        }

        // 3. Try to take the center if available
        if (gameState[4] === '') return 4;

        // 4. Try to take a corner if available
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => gameState[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // 5. Take any available edge
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(index => gameState[index] === '');
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }

        // Fallback to random move (shouldn't happen as we check for draw earlier)
        return getRandomMove();
    }

    // Show modal with result
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalOverlay.classList.add('active');
    }

    // Reset game
    function resetGame() {
        // Remove any existing winning lines
        document.querySelectorAll('.winning-line').forEach(line => line.remove());
        
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        gameStatus.textContent = `Player ${currentPlayer}'s turn`;
        initializeGame();
        modalOverlay.classList.remove('active');

        // If playing with computer and computer goes first
        if (gameMode === 'pvc' && currentPlayer === 'O') {
            setTimeout(() => {
                const computerMove = getComputerMove();
                makeMove(computerMove, 'O');
                currentPlayer = 'X';
                gameStatus.textContent = `Player ${currentPlayer}'s turn`;
            }, 500);
        }
    }

    // Set game mode
    function setGameMode(mode) {
        gameMode = mode;
        pvpBtn.classList.toggle('active', mode === 'pvp');
        pvcBtn.classList.toggle('active', mode === 'pvc');
        difficultySelector.classList.toggle('hidden', mode === 'pvp');
        resetGame();
    }

    // Set difficulty level
    function setDifficulty(level) {
        difficulty = level;
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === level);
        });
        resetGame();
    }

    // Event listeners
    resetBtn.addEventListener('click', resetGame);
    modalBtn.addEventListener('click', resetGame);
    
    pvpBtn.addEventListener('click', () => setGameMode('pvp'));
    pvcBtn.addEventListener('click', () => setGameMode('pvc'));
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
    });

    // Start the game
    initializeGame();
});