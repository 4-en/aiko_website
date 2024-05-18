const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function RandomGenerator(seed) {
    this.seed = seed;
    this.state = seed;
    this.a = 1664525;
    this.c = 1013904223;
    this.m = Math.pow(2, 32);

    this.next = function () {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }
}

let player, stars, lastStarDrop, score, lives, gameOver, keys, hatStack, dynamite_img, dynamites, generator;

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

    dynamite_img = new Image();
    dynamite_img.src = 'Dynamite.webp';
    dynamites = [];


    stars = [];
    lastStarDrop = Date.now();
    score = 0;
    lives = 3;
    gameOver = false;
    keys = {};

    hatStack = [];

    // set random seed
    generator = new RandomGenerator(123);

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
    "Yellow_partyhat.webp"
];

starSources.forEach(source => {
    const image = new Image();
    image.src = source;
    starVariants.push(image);
});

const starImage = new Image();
starImage.src = 'phat.webp'; // Replace with the actual path to your star image

const starFrequency = 1000; // Time in ms between star drops

function drawPlayer() {
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);

    // draw the hat stack on top of the player
    let x = player.x + 20;
    let y = player.y - 10;
    for (let i = 0; i < hatStack.length; i++) {
        const image = hatStack[i].image;
        ctx.drawImage(image, x, y, 50, 50);
        y -= 20;
    }
}

function drawStar(star) {
    ctx.drawImage(star.image, star.x, star.y, star.width, star.height);
}

function drawDynamite(dynamite) {
    ctx.drawImage(dynamite.image, dynamite.x, dynamite.y, dynamite.width, dynamite.height);
}

function createStar() {
    let idx = Math.floor(generator.next() / generator.m * starVariants.length);
    const star = {
        x: generator.next() / generator.m * (canvas.width - 20),
        y: 0,
        width: 50,
        height: 50,
        dy: 3,
        idx: idx,
        image: starVariants[idx],
        points: 1
    };
    stars.push(star);
}

function createDynamite() {
    const dynamite = {
        x: generator.next() / generator.m * (canvas.width - 20),
        y: 0,
        width: 50,
        height: 50,
        dy: 3,
        image: dynamite_img,
        points: 1
    };
    dynamites.push(dynamite);
}

function updateDynamites() {
    dynamites.forEach((dynamite, index) => {
        dynamite.y += dynamite.dy;
        if (dynamite.y + dynamite.height > canvas.height) {
            dynamite.y = canvas.height - dynamite.height;

        }
        if (dynamite.x < player.x + player.width &&
            dynamite.x + dynamite.width > player.x &&
            dynamite.y < player.y + player.height &&
            dynamite.y + dynamite.height > player.y - hatStack.length * 20) {
            dynamites.splice(index, 1);

            // damage the player
            lives--;
            if (lives <= 0) {
                gameOver = true;
            }
            // clear the hat stack
            hatStack = [];

            // clear dynamites
            dynamites = [];

            // clear stars
            stars = [];
        }
    });
}

function checkPhatSet() {
    // check if hats contain a full set of stars
    // use star.idx
    let idxs = hatStack.map(hat => hat.idx);
    let set = new Set(idxs);
    if (set.size === starSources.length) {
        // clear the hat stack
        hatStack = [];

        // clear dynamites
        dynamites = [];

        lifes++;
    }

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
            star.y + star.height > player.y - hatStack.length * 20) {
            stars.splice(index, 1);
            score++;

            // add the hat to the stack
            hatStack.push(star);
            // check if the player has collected a full set of stars
            checkPhatSet();
        }
    });
}

function movePlayer() {
    if ((keys['ArrowLeft'] || keys['a']) && player.x > 0) {
        player.x -= player.dx;
        // flip the player image
        if (!player.isFlipped) {
            player.image = player.flipped_image;
            player.isFlipped = true;
        }

    }
    if ((keys['ArrowRight'] || keys['d']) && player.x + player.width < canvas.width) {
        player.x += player.dx;
        // flip the player image
        if (player.isFlipped) {
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
    drawPlayer();
    stars.forEach(drawStar);
    dynamites.forEach(drawDynamite);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, 20, 50);
    let hearts = '';
    for (let i = 0; i < lives; i++) {
        hearts += '❤️';
    }
    ctx.fillText(hearts, canvas.width - lives * 41 - 30, 50);

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
    if (Date.now() - lastStarDrop > starFrequency - Math.min(score * 2, 500)) {
        let chance = generator.next() / generator.m;
        if (chance < 0.2) {
            createDynamite();
        } else {
            createStar();
        }
        lastStarDrop = Date.now();
    }
    updateStars();
    updateDynamites();
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