
document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const pauseScreen = document.getElementById('pause-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const scoreDisplay = document.getElementById('score-display');
    const finalScoreDisplay = document.getElementById('final-score');
    
    // Game settings
    const gridSize = 20;
    const tileSize = 20;
    const initialSpeed = 200;
    
    // Game state
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameSpeed = initialSpeed;
    let gameLoop;
    let lastUpdateTime = 0;
    let isPaused = false;
    
    // Initialize canvas
    canvas.width = gridSize * tileSize;
    canvas.height = gridSize * tileSize;
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    resumeBtn.addEventListener('click', resumeGame);
    restartBtn.addEventListener('click', startGame);
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case ' ':
                if (gameScreen.classList.contains('hidden')) return;
                if (isPaused) resumeGame();
                else pauseGame();
                break;
        }
    });
    
    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);
    
    canvas.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && direction !== 'left') nextDirection = 'right';
            else if (dx < 0 && direction !== 'right') nextDirection = 'left';
        } else {
            if (dy > 0 && direction !== 'up') nextDirection = 'down';
            else if (dy < 0 && direction !== 'down') nextDirection = 'up';
        }
        
        touchStartX = 0;
        touchStartY = 0;
        e.preventDefault();
    }, false);
    
    // Game functions
    function startGame() {
        // Reset game state
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        gameSpeed = initialSpeed;
        isPaused = false;
        
        // Update UI
        scoreDisplay.textContent = `Score: ${score}`;
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        pauseScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Generate first food
        generateFood();
        
        // Start game loop
        lastUpdateTime = 0;
        if (gameLoop) cancelAnimationFrame(gameLoop);
        gameLoop = requestAnimationFrame(update);
    }
    
    function pauseGame() {
        isPaused = true;
        pauseScreen.classList.remove('hidden');
    }
    
    function resumeGame() {
        isPaused = false;
        pauseScreen.classList.add('hidden');
        lastUpdateTime = performance.now();
        gameLoop = requestAnimationFrame(update);
    }
    
    function gameOver() {
        cancelAnimationFrame(gameLoop);
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Show game over screen
        finalScoreDisplay.textContent = `Score: ${score} (High: ${highScore})`;
        gameOverScreen.classList.remove('hidden');
    }
    
    function update(currentTime) {
        if (isPaused) return;
        
        if (!lastUpdateTime) lastUpdateTime = currentTime;
        const deltaTime = currentTime - lastUpdateTime;
        
        if (deltaTime >= gameSpeed) {
            lastUpdateTime = currentTime;
            
            // Update direction
            direction = nextDirection;
            
            // Move snake
            const head = {...snake[0]};
            
            switch(direction) {
                case 'up':
                    head.y -= 1;
                    break;
                case 'down':
                    head.y += 1;
                    break;
                case 'left':
                    head.x -= 1;
                    break;
                case 'right':
                    head.x += 1;
                    break;
            }
            
            // Check collisions
            if (
                head.x < 0 || head.x >= gridSize ||
                head.y < 0 || head.y >= gridSize ||
                snake.some(segment => segment.x === head.x && segment.y === head.y)
            ) {
                return gameOver();
            }
            
            // Add new head
            snake.unshift(head);
            
            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                
                // Increase speed slightly
                gameSpeed = Math.max(initialSpeed - (score / 2), 50);
                
                generateFood();
            } else {
                // Remove tail if no food eaten
                snake.pop();
            }
            
            // Draw game
            draw();
        }
        
        gameLoop = requestAnimationFrame(update);
    }
    
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#4CAF50' : '#45a049';
            ctx.fillRect(
                segment.x * tileSize, 
                segment.y * tileSize, 
                tileSize, 
                tileSize
            );
            
            ctx.strokeStyle = '#333';
            ctx.strokeRect(
                segment.x * tileSize, 
                segment.y * tileSize, 
                tileSize, 
                tileSize
            );
        });
        
        // Draw food
        ctx.fillStyle = '#f44336';
        ctx.beginPath();
        ctx.arc(
            food.x * tileSize + tileSize / 2,
            food.y * tileSize + tileSize / 2,
            tileSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = '#f44336';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    function generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            };
        } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        food = newFood;
    }
});
