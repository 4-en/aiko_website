// Initial game state
let level = 1;
let xp = 0;
let xpForNextLevel = 83;
let coins = 0;
let axeLevel = 1;
let upgradeCost = 10;
let tickCooldown = 0;
let time = 0;

function sfc32(a, b, c, d) {
    return function () {
        a |= 0; b |= 0; c |= 0; d |= 0;
        let t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

const seedgen = () => (Math.random() * 2 ** 32) >>> 0;
const getRand = sfc32(seedgen(), seedgen(), seedgen(), seedgen());
const createRand = (seed = 0) => {
    if (seed === 0) {
        return sfc32(seedgen(), seedgen(), seedgen(), seedgen());
    }

    return sfc32(seed * 0x6c078965 + 1, seed * 0x6c078965 + 2, seed * 0x6c078965 + 3, seed * 0x6c078965 + 4);
};

// Elements
const levelElement = document.getElementById('level');
const xpElement = document.getElementById('xp');
const xpForNextLevelElement = document.getElementById('xpForNextLevel');
const logsElement = document.getElementById('logs');
const axeLevelElement = document.getElementById('axeLevel');
const upgradeCostElement = document.getElementById('upgradeCost');
const upgradeAxeButton = document.getElementById('upgradeAxeButton');

// game constants
const tickRate = 0.6; // 1 tick every 0.6 seconds
// xp values
const baseXp = 83;

function xpForLevel(level) {
    if (level === 1) {
        return 0;
    }
    if (level === 2) {
        return baseXp;
    }

    let previousLevelXp = xpForLevel(level - 1);
    let additionalXp = 1 / 4 * Math.floor(level - 1 + 300 * Math.pow(2, (level - 1) / 7));

    return previousLevelXp + additionalXp;
}

function showMessageBoxAtPos(message, x, y) {
    let messageBox = document.createElement("div");
    messageBox.classList.add("message-box");
    messageBox.innerText = message;
    document.body.appendChild(messageBox);

    messageBox.style.left = x + "px";
    messageBox.style.top = y + "px";

    setTimeout(() => {
        document.body.removeChild(messageBox);
    }, 2000);
}

// tree data
const trees = {
    "normal": {
        "xp": 25,
        "coins": 10,
        "level": 1,
        "difficulty": 1,
        "resist": 10,
        "depletionChance": 1.0,
        "name": "Tree",
        "tickCooldown": 4,
        "respawnTime": 4,
        "image": "Tree.png"
    },
    "oak": {
        "xp": 37.5,
        "coins": 1,
        "level": 15,
        "difficulty": 2,
        "resist": 10,
        "depletionChance": 1 / 8,
        "name": "Oak Tree",
        "tickCooldown": 4,
        "respawnTime": 8.4,
        "image": "Oak_tree.png"
    },
    "willow": {
        "xp": 67.5,
        "coins": 15,
        "level": 30,
        "difficulty": 3,
        "resist": 10,
        "depletionChance": 1 / 16,
        "name": "Willow Tree",
        "tickCooldown": 4,
        "respawnTime": 8.4,
        "image": "Willow_tree.png"
    },
    "maple": {
        "xp": 100,
        "coins": 100,
        "level": 45,
        "difficulty": 4,
        "restist": 10,
        "depletionChance": 1 / 32,
        "name": "Maple Tree",
        "tickCooldown": 4,
        "respawnTime": 35.4,
        "image": "Maple_tree.webp"
    },
    "yew": {
        "xp": 175,
        "coins": 500,
        "level": 60,
        "difficulty": 5,
        "resist": 10,
        "depletionChance": 1 / 64,
        "name": "Yew Tree",
        "tickCooldown": 4,
        "respawnTime": 59.4,
        "image": "Yew_tree.png"
    },
    "magic": {
        "xp": 250,
        "coins": 1000,
        "level": 75,
        "difficulty": 6,
        "resist": 10,
        "depletionChance": 1 / 128,
        "name": "Magic Tree",
        "tickCooldown": 4,
        "respawnTime": 119.4,
        "image": "Magic_tree.png"
    }
};

// axe data
const axes = {
    "bronze": {
        "level": 1,
        "power": 1,
        "cost": 10,
        "name": "Bronze Axe"
    },
    "iron": {
        "level": 1,
        "power": 2,
        "cost": 20,
        "name": "Iron Axe"
    },
    "steel": {
        "level": 5,
        "power": 3,
        "cost": 40,
        "name": "Steel Axe"
    },
    "black": {
        "level": 10,
        "power": 4,
        "cost": 80,
        "name": "Black Axe"
    },
    "mithril": {
        "level": 20,
        "power": 5,
        "cost": 160,
        "name": "Mithril Axe"
    },
    "adamant": {
        "level": 30,
        "power": 6,
        "cost": 320,
        "name": "Adamant Axe"
    },
    "rune": {
        "level": 40,
        "power": 7,
        "cost": 640,
        "name": "Rune Axe"
    },
    "dragon": {
        "level": 60,
        "power": 8,
        "cost": 1280,
        "name": "Dragon Axe"
    },
    "infernal": {
        "level": 61,
        "power": 9,
        "cost": 2560,
        "name": "Infernal Axe"
    },
    "crystal": {
        "level": 71,
        "power": 10,
        "cost": 5120,
        "name": "Crystal Axe"
    },
    "3a": {
        "level": 80,
        "power": 11,
        "cost": 102400,
        "name": "3rd Age Axe"
    },
};

let activeTree = null;
let treeField = [];

function treeClick(event, index) {
    let tree = treeField[index].tree;
    if (tree === null) {
        return;
    }
    let mouseX = event.clientX + 20;
    let mouseY = event.clientY - 100;
    if(treeField[index].respawnTime > 0) {
        showMessageBoxAtPos("Tree is respawning", mouseX, mouseY);
        return;
    }

    let treeLevelRequirement = tree.level;
    if (level < treeLevelRequirement) {
        showMessageBoxAtPos("You need level " + treeLevelRequirement + " to chop this tree", mouseX, mouseY);
        return;
    }

    let element = treeField[index].element;
    // add class chopping
    element.classList.add("chopping");

    // remove chopping from other trees
    for (let i = 0; i < treeField.length; i++) {
        if (i !== index) {
            treeField[i].element.classList.remove("chopping");
        }
    }

    activeTree = index;
}

function rollTreeCut(level, axeBonus, treeDiff, treeResist) {
    let chance = Math.random();
    let p = (level + axeBonus - treeDiff) / (treeResist);
    return chance < p;
}

function init() {
    let seed = 421;
    let rand = createRand(seed);
    let treeTypes = Object.keys(trees);
    let fieldSize = 18;
    let treeDiv = document.getElementById("trees");
    for (let i = 0; i < fieldSize; i++) {
        let tree = trees[treeTypes[Math.floor(rand() * treeTypes.length)]];

        let treeElement = document.createElement("div");
        treeElement.classList.add("tree");
        let image = document.createElement("img");
        image.src = "assets/" + tree.image;
        image.alt = tree.name;
        image.classList.add("tree-image");
        image.width = 64;
        treeElement.appendChild(image);
        treeElement.addEventListener("click", (event) => treeClick(event, i));
        treeDiv.appendChild(treeElement);

        let tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.innerText = "Chop " + tree.name;
        treeElement.appendChild(tooltip);
        // set random position
        let x = Math.floor(rand() * 100);
        let y = Math.floor(rand() * 100);
        treeElement.style.left = x + "%";
        treeElement.style.top = y + "%";

        let treeData = {
            tree: tree,
            respawnTime: 0,
            element: treeElement,
        };

        treeField.push(treeData);
    }
}

init();

// Functions
function updateUI() {
    levelElement.innerText = level;
    xpElement.innerText = xp - Math.floor(xpForLevel(level));
    xpForNextLevelElement.innerText = Math.floor(xpForNextLevel) - Math.floor(xpForLevel(level));
    logsElement.innerText = coins;
    axeLevelElement.innerText = axeLevel;
    upgradeCostElement.innerText = upgradeCost;
    upgradeAxeButton.disabled = coins < upgradeCost;
}

function gainXP(amount) {
    xp += amount;
    while (xp >= xpForLevel(level + 1)) {
        levelUp();
    }
    updateUI();
}

function levelUp() {
    level++;
    xpForNextLevel = xpForLevel(level + 1);
}

function cutTree() {
    if (activeTree === null) {
        return;
    }
    let tree = treeField[activeTree].tree;
    let treeData = treeField[activeTree];

    let cutSuccess = rollTreeCut(level, 1, 1, 10);

    if (cutSuccess) {
        let xpGain = tree.xp;
        let logGain = tree.coins;
        gainXP(xpGain);
        coins += logGain;
        treeData.respawnTime = tree.respawnTime;

        if(getRand() < tree.depletionChance) {
            let element = treeData.element;
            element.classList.add("chopped");
            element.classList.remove("chopping");
            activeTree = null;
            treeData.respawnTime = tree.respawnTime + time;
        }
    }

    tickCooldown = tree.tickCooldown;

    updateUI();
}

function upgradeAxe() {
    if (coins >= upgradeCost) {
        coins -= upgradeCost;
        axeLevel++;
        upgradeCost = Math.floor(upgradeCost * 1.5); // Increase cost for next upgrade
        updateUI();
    }
}


upgradeAxeButton.addEventListener('click', upgradeAxe);

// Initial UI update
updateUI();

function tick() {
    time += tickRate;

    for (let i = 0; i < treeField.length; i++) {
        let treeData = treeField[i];
        if (treeData.tree === null) {
            continue;
        }

        if (treeData.respawnTime > 0 && time > treeData.respawnTime) {
            treeData.respawnTime = 0;
            let element = treeData.element;
            element.classList.remove("chopped");
        }
    }

    if (tickCooldown > 0) {
        tickCooldown -= tickRate;
        return;
    }

    cutTree();
}

function main() {
    setInterval(tick, tickRate * 1000);
}

main();
