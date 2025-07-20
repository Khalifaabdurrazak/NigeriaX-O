        const startScreen = document.getElementById('startScreen');
        const gameContainer = document.getElementById('gameContainer');
        const playerXNameInput = document.getElementById('playerXName');
        const playerONameInput = document.getElementById('playerOName');
        const modeInputs = document.getElementsByName('mode');
        const difficultySelect = document.getElementById('difficulty');
        const startGameBtn = document.getElementById('startGame');
        const cells = document.querySelectorAll('.cell');
        const status = document.getElementById('status');
        const scoreDisplay = document.getElementById('score');
        const restartBtn = document.getElementById('restart');
        const resetScoreBtn = document.getElementById('resetScore');
        const homeBtn = document.getElementById('home');
        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameActive = true;
        let scores = { X: 0, O: 0 };
        let playerNames = { X: 'Player X', O: 'Player O' };
        let gameMode = 'multiplayer';
        let botDifficulty = 'easy';

        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        modeInputs.forEach(input => {
            input.addEventListener('change', () => {
                difficultySelect.disabled = input.value === 'multiplayer';
                gameMode = input.value;
                playerONameInput.disabled = input.value === 'bot';
            });
        });

        function updateScoreDisplay() {
            scoreDisplay.textContent = `Score - ${playerNames.X}: ${scores.X}, ${playerNames.O}: ${scores.O}`;
        }

        function handleCellClick(event) {
            const index = event.target.dataset.index;
            if (board[index] !== '' || !gameActive || (gameMode === 'bot' && currentPlayer === 'O')) return;

            board[index] = currentPlayer;
            event.target.textContent = currentPlayer;
            event.target.classList.add(currentPlayer.toLowerCase());

            if (checkWin()) {
                status.textContent = `${playerNames[currentPlayer]} wins!`;
                scores[currentPlayer]++;
                updateScoreDisplay();
                gameActive = false;
                return;
            }

            if (board.every(cell => cell !== '')) {
                status.textContent = "It's a draw!";
                gameActive = false;
                return;
            }

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            status.textContent = gameMode === 'bot' && currentPlayer === 'O' ? "Computer's turn" : `${playerNames[currentPlayer]}'s turn`;

            if (gameMode === 'bot' && gameActive && currentPlayer === 'O') {
                setTimeout(makeBotMove, 500);
            }
        }

        function checkWin() {
            return winningCombinations.some(combination => {
                return combination.every(index => board[index] === currentPlayer);
            });
        }

        function restartGame() {
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            gameActive = true;
            status.textContent = gameMode === 'bot' ? `${playerNames.X}'s turn` : `${playerNames[currentPlayer]}'s turn`;
            cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('x', 'o');
            });
            if (gameMode === 'bot' && currentPlayer === 'O') {
                setTimeout(makeBotMove, 500);
            }
        }

        function resetScore() {
            scores = { X: 0, O: 0 };
            updateScoreDisplay();
        }

        function goHome() {
            gameContainer.classList.add('hidden');
            startScreen.classList.remove('hidden');
            restartGame();
            playerONameInput.disabled = gameMode === 'bot';
        }

        function startGame() {
            const xName = playerXNameInput.value.trim() || 'Player X';
            const oName = gameMode === 'bot' ? 'Computer' : playerONameInput.value.trim() || 'Player O';
            playerNames = { X: xName, O: oName };
            botDifficulty = difficultySelect.value;
            startScreen.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            status.textContent = gameMode === 'bot' ? `${playerNames.X}'s turn` : `${playerNames[currentPlayer]}'s turn`;
            updateScoreDisplay();
        }

        function makeBotMove() {
            let move;
            if (botDifficulty === 'easy') {
                move = getRandomMove();
            } else {
                move = getBestMove();
            }
            if (move !== null) {
                board[move] = 'O';
                cells[move].textContent = 'O';
                cells[move].classList.add('o');

                if (checkWin()) {
                    status.textContent = `${playerNames.O} wins!`;
                    scores.O++;
                    updateScoreDisplay();
                    gameActive = false;
                    return;
                }

                if (board.every(cell => cell !== '')) {
                    status.textContent = "It's a draw!";
                    gameActive = false;
                    return;
                }

                currentPlayer = 'X';
                status.textContent = `${playerNames.X}'s turn`;
            }
        }

        function getRandomMove() {
            const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
            return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
        }

        function getBestMove() {
            let bestScore = -Infinity;
            let move = null;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    const score = minimax(board, 0, false);
                    board[i] = '';
                    if (score > bestScore) {
                        bestScore = score;
                        move = i;
                    }
                }
            }
            return move;
        }

        function minimax(board, depth, isMaximizing) {
            const result = checkResult();
            if (result !== null) {
                return result === 'O' ? 10 - depth : result === 'X' ? depth - 10 : 0;
            }

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < 9; i++) {
                    if (board[i] === '') {
                        board[i] = 'O';
                        const score = minimax(board, depth + 1, false);
                        board[i] = '';
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < 9; i++) {
                    if (board[i] === '') {
                        board[i] = 'X';
                        const score = minimax(board, depth + 1, true);
                        board[i] = '';
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        }

        function checkResult() {
            for (const combination of winningCombinations) {
                if (combination.every(index => board[index] === 'O')) return 'O';
                if (combination.every(index => board[index] === 'X')) return 'X';
            }
            return board.every(cell => cell !== '') ? 'draw' : null;
        }

        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        restartBtn.addEventListener('click', restartGame);
        resetScoreBtn.addEventListener('click', resetScore);
        startGameBtn.addEventListener('click', startGame);
        homeBtn.addEventListener('click', goHome);