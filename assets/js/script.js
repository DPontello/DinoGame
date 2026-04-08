const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');

let gameState = 'START';
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let player = { x: 50, y: 200, w: 40, h: 40, dy: 0, jumpForce: 14, grounded: false };
let obstacles = [];
const gravity = 0.6;

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        if (gameState === 'PLAYING' && player.grounded) {
            player.dy = -player.jumpForce;
            player.grounded = false;
        }
    }
})

function startGame() {
    gameState = 'PLAYING';
    menu.style.display = 'none';
    score = 0;
    obstacles = [];
    player.y = 200;

    document.getElementById('high-score').innerText = 'High: ' + Math.floor(highScore);

    animate();
}

function checkCollision(player, obstacle) {
    return player.x < obstacle.x + obstacle.w &&
        player.x + player.w > obstacle.x &&
        player.y < obstacle.y + obstacle.h &&
        player.y + player.h > obstacle.y;
}

function animate() {
    if (gameState !== 'PLAYING') return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Jogador
    player.dy += gravity;
    player.y += player.dy;

    if (player.y + player.h > canvas.height) {
        player.y = canvas.height - player.h;
        player.dy = 0;
        player.grounded = true;
    }
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.w, player.h);

    //Obstáculos
    let podeSpawnar = true;
    if (obstacles.length > 0) {
        let ultimoObstaculo = obstacles[obstacles.length - 1];
        // Garante uma distância mínima (ex: 250px) para dar tempo de o boneco cair e pular novamente
        if (canvas.width - ultimoObstaculo.x < 250) {
            podeSpawnar = false;
        }
    }

    // Se o random passar e tivar a distância mínima, cria a torre
    if (Math.random() < 0.04 && podeSpawnar) {
        let altura = Math.floor(Math.random() * 40) + 30; // Altura aleatória entre 30 e 70
        obstacles.push({ x: canvas.width, y: canvas.height - altura, w: 20, h: altura });
    }

    obstacles.forEach((obs, i) => {
        obs.x -= 3;
        ctx.fillStyle = 'red';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        //Colisão
        if (checkCollision(player, obs)) {
            gameState = 'GAME_OVER';

            // Verifica se bateu o recorde e salva no navegador
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('dinoHighScore', highScore);
            }

            menu.style.display = 'block';
            menu.innerHTML = '<h1>Game Over</h1><p>Score: ' + Math.floor(score) + '</p><p style="color: #FF6B6B; font-weight: bold; margin-bottom: 20px; font-size: 1.3rem;">High Score: ' + Math.floor(highScore) + '</p><button onclick="startGame()">Restart</button>';
        }

        if (obs.x + obs.w < 0) obstacles.splice(i, 1);
    });

    score += 0.1;
    document.getElementById('score').innerText = 'Score: ' + Math.floor(score);

    requestAnimationFrame(animate);
}