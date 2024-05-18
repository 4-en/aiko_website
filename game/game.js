const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let player, stars, lastStarDrop, score, lives, gameOver, keys;

function initializeGame() {
    player = {
        x: canvas.width / 2,
        y: canvas.height - 100,
        width: 90,
        height: 110,
        dx: 7,
        image: new Image(),
        normal_image: new Image(),
        flipped_image: new Image(),
        isFlipped: false

    };
    player.image.src = 'gnome-child.png'; // Replace with the actual path to your fox-girl image
    player.flipped_image.src = 'gnome-child-flipped.png';
    player.normal_image.src = 'gnome-child.png';

    stars = [];
    lastStarDrop = Date.now();
    score = 0;
    lives = 3;
    gameOver = false;
    keys = {};

    player.image.onload = () => {
        draw();
        update();
    };
}

const starVariants = [];
const starSources = [
    "Blue_partyhat.webp",
    "Green_partyhat.webp",
    "Purple_partyhat.webp",
    "Red_partyhat.webp",
    "Yellow_partyhat.webp",
    "White_partyhat.webp",
    "Rainbow_partyhat.webp"

];

starSources.forEach(source => {
    const image = new Image();
    image.src = source;
    starVariants.push(image);
});

const starImage = new Image();
starImage.src = 'phat.webp'; // Replace with the actual path to your star image

const starFrequency = 1000; // Time in ms between star drops

function drawFoxGirl() {
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
}

function drawStar(star) {
    ctx.drawImage(star.image, star.x, star.y, star.width, star.height);
}

function createStar() {
    const star = {
        x: Math.random() * (canvas.width - 20),
        y: 0,
        width: 50,
        height: 50,
        dy: 3,
        image: starVariants[Math.floor(Math.random() * starVariants.length)]
    };
    stars.push(star);
}

function updateStars() {
    stars.forEach((star, index) => {
        star.y += star.dy;
        if (star.y + star.height > canvas.height) {
            stars.splice(index, 1);
            lives--;
            if (lives <= 0) {
                gameOver = true;
            }
        }
        if (star.x < player.x + player.width &&
            star.x + star.width > player.x &&
            star.y < player.y + player.height &&
            star.y + star.height > player.y) {
            stars.splice(index, 1);
            score++;
        }
    });
}

function movePlayer() {
    if ((keys['ArrowLeft'] || keys['a']) && player.x > 0) {
        player.x -= player.dx;
        // flip the player image
        if(!player.isFlipped){
            player.image = player.flipped_image;
            player.isFlipped = true;
        }

    }
    if ((keys['ArrowRight'] || keys['d']) && player.x + player.width < canvas.width) {
        player.x += player.dx;
        // flip the player image
        if(player.isFlipped){
            player.image = player.normal_image;
            player.isFlipped = false;
        }
    }
}

function saveScore() {
    const highScore = localStorage.getItem('highScore');
    if (highScore === null || score > highScore) {
        localStorage.setItem('highScore', score);
    }
}

function getHighScore() {
    return localStorage.getItem('highScore') || 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFoxGirl();
    stars.forEach(drawStar);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, 20, 50);
    let hearts = '';
    for (let i = 0; i < lives; i++) {
        hearts += '❤️';
    }
    ctx.fillText(hearts, canvas.width - 150, 50);

    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '60px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 160, canvas.height / 2 - 20);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Press "R" to Restart', canvas.width / 2 - 185, canvas.height / 2 + 50);

        // score and high score
        ctx.font = '30px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2 - 60, canvas.height / 2 + 100);
        ctx.fillText(`High Score: ${getHighScore()}`, canvas.width / 2 - 100, canvas.height / 2 + 150);

        saveScore();
        return;
    }

    requestAnimationFrame(draw);
}

function update() {
    if (Date.now() - lastStarDrop > starFrequency) {
        createStar();
        lastStarDrop = Date.now();
    }
    updateStars();
    movePlayer();
    if (!gameOver) {
        requestAnimationFrame(update);
    }
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (gameOver && e.key === 'r') {
        initializeGame();
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

initializeGame();