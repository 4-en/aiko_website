// Initial game state
let level = 1;
let xp = 0;
let xpForNextLevel = 83;
let coins = 0;
let axeLevel = 1;
let upgradeCost = 10;
let tickCooldown = 0;
let time = 0;
let tickCount = 0;
let version = "0.1.0";
let startTime = Date.now();
let playerId = Math.floor(Math.random() * 1000000);
let playerName = "Player";

let soundPlayer = null;
let musicPlayer = null;

function playSound(sound) {
    if (soundPlayer) {
        soundPlayer.pause();
    }
    soundPlayer = new Audio("assets/" + sound);
    soundPlayer.play();
}

function playMusic(music) {
    if (musicPlayer) {
        musicPlayer.pause();
    }
    musicPlayer = new Audio("assets/" + music);
    musicPlayer.loop = true;
    musicPlayer.play();
}


function save() {
    let saveData = {
        level: level,
        xp: xp,
        xpForNextLevel: xpForNextLevel,
        coins: coins,
        axeLevel: axeLevel,
        upgradeCost: upgradeCost,
        version: version,
        startTime: startTime,
        playerId: playerId,
        playerName: playerName
    };

    localStorage.setItem('saveData', JSON.stringify(saveData));
}

function load() {
    let saveData = JSON.parse(localStorage.getItem('saveData'));
    if (saveData) {
        // try to load the save data
        // always check if saveData has the property defined
        if (saveData.level) {
            level = saveData.level;
        }
        if (saveData.xp) {
            xp = saveData.xp;
        }
        if (saveData.xpForNextLevel) {
            xpForNextLevel = saveData.xpForNextLevel;
        }
        if (saveData.coins) {
            coins = saveData.coins;
        }
        if (saveData.axeLevel) {
            axeLevel = saveData.axeLevel;
        }
        if (saveData.upgradeCost) {
            upgradeCost = saveData.upgradeCost;
        }
        if (saveData.version) {
            version = saveData.version;
        }
        if (saveData.startTime) {
            startTime = saveData.startTime;
        }
        if (saveData.playerId) {
            playerId = saveData.playerId;
        }
        if (saveData.playerName) {
            playerName = saveData.playerName;
        }
    }
}



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
const recruitButton = document.getElementById('recruitWorkerButton');
const plantTreeButton = document.getElementById('plantTreeButton');
const plantTreeCostElement = document.getElementById('plantTreeCost');
const workersElement = document.getElementById('workers');

// game constants
const autoSaveInterval = 60; // 60 seconds
const tickRate = 0.6; // 1 tick every 0.6 seconds
// xp values
const baseXp = 83;
let _xpForLevelCache = {};
function xpForLevel(level) {
    if (level === 1) {
        return 0;
    }
    if (level === 2) {
        return baseXp;
    }

    if (_xpForLevelCache[level]) {
        return _xpForLevelCache[level];
    }

    let previousLevelXp = xpForLevel(level - 1);
    let additionalXp = 1 / 4 * Math.floor(level - 1 + 300 * Math.pow(2, (level - 1) / 7));

    _xpForLevelCache[level] = previousLevelXp + additionalXp;
    return _xpForLevelCache[level];
}

function showMessageBoxAtPos(message, x, y) {
    let messageBox = document.createElement("div");
    messageBox.classList.add("message-box");
    messageBox.innerText = message;
    document.body.appendChild(messageBox);

    messageBox.style.left = x + "px";
    messageBox.style.top = y + "px";
    messageBox.style.zIndex = 1000;

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
        "difficulty": 10,
        "resist": 8,
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
        "difficulty": 20,
        "resist": 25,
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
        "difficulty": 30,
        "restist": 40,
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
        "difficulty": 50,
        "resist": 60,
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
        "difficulty": 60,
        "resist": 120,
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

const characters = {
    "bot": {
        "weight": 1000, // "weight" is the chance of getting this character, higher weight = higher chance
        "name": "Bot",
        "image": "gnome-child.png",
        "agility": 1,
        "strength": 1,
        "woodcutting": 1,
        "luck": 1,
        "tick_manipulation": 1,
        "range": 1,
        "learning_rate": 1,
        "farming": 1,
        "trading": 1
    },
    "gnome_child": {
        "weight": 500,
        "name": "Gnome Child",
        "image": "gnome-child.png",
        "agility": 1,
        "strength": 1,
        "woodcutting": 1,
        "luck": 1,
        "tick_manipulation": 1,
        "range": 1,
        "learning_rate": 1,
        "farming": 1,
        "trading": 1
    },
    "thurgo": {
        "weight": 100,
        "name": "Thurgo",
        "image": "gnome-child.png",
        "agility": 1,
        "strength": 1,
        "woodcutting": 1,
        "luck:": 1,
        "tick_manipulation": 1,
        "range": 1,
        "learning_rate": 1,
        "farming": 1,
        "trading": 1
    },
    "graador": {
        "weight": 100,
        "name": "General Graador",
        "image": "gnome-child.png",
        "agility": 1,
        "strength": 1,
        "woodcutting": 1,
        "luck": 1,
        "tick_manipulation": 1,
        "range": 1,
        "learning_rate": 1,
        "farming": 1,
        "trading": 1
    },
    "wise_old_man": {
        "weight": 50,
        "name": "Wise Old Man",
        "image": "gnome-child.png",
        "agility": 1,
        "strength": 1,
        "woodcutting": 1,
        "luck": 1,
        "tick_manipulation": 1,
        "range": 1,
        "learning_rate": 1,
        "farming": 1,
        "trading": 1
    },
    "oziach": {
        "weight": 100,
        "name": "Oziach",
        "image": "gnome-child.png",
        "agility": 1,
        "strength": 1,
        "woodcutting": 1,
        "luck": 1,
        "tick_manipulation": 1,
        "range": 1,
        "learning_rate": 1,
        "farming": 1,
        "trading": 1
    },
    "bob": {
        "weight": 100,
        "name": "Bob",
        "image": "gnome-child.png",
        "agility": 1,
        "strength": 1,
        "woodcutting": 1,
        "luck": 1,
        "tick_manipulation": 1,
        "range": 1,
        "learning_rate": 1,
        "farming": 1,
        "trading": 1
    },
    "evil_bob": {
        "weight": 100,
        "name": "Evil Bob",
        "image": "gnome-child.png",
        "agility": 1,
        "strength": 1,
        "woodcutting": 1,
        "luck": 1,
        "tick_manipulation": 1,
        "range": 1,
        "learning_rate": 1,
        "farming": 1,
        "trading": 1
    }
};

const rarities = {
    "common": {
        "color": "darkslategray",
        "general": 1,
        "name": "Common",
        "weight": 1000
    },
    "bronze": {
        "color": "peru",
        "general": 2,
        "name": "Bronze",
        "agility": 2,
        "strength": 3,
        "weight": 500
    },
    "iron": {
        "color": "gray",
        "general": 3,
        "name": "Iron",
        "agility": 3,
        "strength": 4,
        "weight": 400
    },
    "steel": {
        "color": "lightgray",
        "general": 4,
        "name": "Steel",
        "agility": 4,
        "strength": 5,
        "weight": 350
    },
    "black": {
        "color": "black",
        "general": 5,
        "name": "Black",
        "agility": 5,
        "strength": 6,
        "weight": 300
    },
    "mithril": {
        "color": "lightblue",
        "general": 6,
        "name": "Mithril",
        "agility": 6,
        "strength": 7,
        "weight": 250
    },
    "adamant": {
        "color": "green",
        "general": 7,
        "name": "Adamant",
        "agility": 7,
        "strength": 8,
        "weight": 200
    },
    "rune": {
        "color": "blue",
        "general": 8,
        "name": "Rune",
        "agility": 8,
        "strength": 9,
        "weight": 150
    },
    "dragon": {
        "color": "red",
        "general": 4,
        "name": "Dragon",
        "agility": 4,
        "strength": 5,
        "weight": 100
    },
    "crystal": {
        "color": "cyan",
        "general": 5,
        "name": "Crystal",
        "agility": 5,
        "strength": 6,
        "weight": 50
    },
    "3a": {
        "color": "white",
        "general": 6,
        "name": "3rd Age",
        "agility": 6,
        "strength": 7,
        "weight": 10
    },
    "infernal": {
        "color": "orange",
        "general": 7,
        "name": "Infernal",
        "agility": 7,
        "strength": 8,
        "weight": 10
    },
    "ancestral": {
        "color": "purple",
        "general": 8,
        "name": "Ancestral",
        "agility": 8,
        "strength": 9,
        "weight": 10
    }
};

function pullCharacter() {
    let charKeys = Object.keys(characters);
    let charWeight = 0;
    for (let i = 0; i < charKeys.length; i++) {
        let char = characters[charKeys[i]];
        charWeight += char.weight;
    }

    let rand = getRand() * charWeight;
    let currentWeight = 0;
    let char = null;
    for (let i = 0; i < charKeys.length; i++) {
        char = charKeys[i];
        currentWeight += characters[char].weight;
        if (rand < currentWeight) {
            break;
        }
    }

    let rarityKeys = Object.keys(rarities);
    let rarityWeight = 0;
    for (let i = 0; i < rarityKeys.length; i++) {
        let rarity = rarities[rarityKeys[i]];
        rarityWeight += rarity.weight;
    }

    rand = getRand() * rarityWeight;
    currentWeight = 0;
    let rarity = null;
    for (let i = 0; i < rarityKeys.length; i++) {
        rarity = rarityKeys[i];
        currentWeight += rarities[rarity].weight;
        if (rand < currentWeight) {
            break;
        }
    }

    return new Worker(char, rarity);
}



class Worker {
    constructor(character, rarity) {
        this.character = character;
        this.rarity = rarity;
        this.level = 1;
        this.xp = 0;
        this.ivs = this.generateIVs();
        this.evs = this.generateEVs();
    }

    generateEVs() {
        return {
            "spend": 0,
            "agility": 0,
            "strength": 0,
            "woodcutting": 0,
            "luck": 0,
            "tick_manipulation": 0,
            "range": 0,
            "learning_rate": 0,
            "farming": 0,
            "trading": 0
        };
    }

    generateIVs() {
        let max = 100;
        let min = 1;
        let general = Math.floor(Math.random() * (max - min + 1) + min);
        let agility = Math.floor(Math.random() * (max - min + 1) + min);
        let strength = Math.floor(Math.random() * (max - min + 1) + min);
        let woodcutting = Math.floor(Math.random() * (max - min + 1) + min);
        let luck = Math.floor(Math.random() * (max - min + 1) + min);
        let tick_manipulation = Math.floor(Math.random() * (max - min + 1) + min);
        let range = Math.floor(Math.random() * (max - min + 1) + min);
        let learning_rate = Math.floor(Math.random() * (max - min + 1) + min);
        let farming = Math.floor(Math.random() * (max - min + 1) + min);
        let trading = Math.floor(Math.random() * (max - min + 1) + min);
        return {
            "general": general,
            "agility": agility,
            "strength": strength,
            "woodcutting": woodcutting,
            "luck": luck,
            "tick_manipulation": tick_manipulation,
            "range": range,
            "learning_rate": learning_rate,
            "farming": farming,
            "trading": trading
        };
    }

    calculateStat(level, character, rarity, iv) {
        let charWeight = 20;
        let rarityWeight = 3;
        let ivWeight = 1;

        let statMultiplier = 1;

        let stat = character / 100 * charWeight + rarity / 100 * rarityWeight + iv / 100 * ivWeight;
        stat = stat / (charWeight + rarityWeight + ivWeight);
        return Math.floor(statMultiplier * stat * level + level);
    }

    calculateStats() {
        let charStats = characters[this.character];
        let rarityStats = rarities[this.rarity];
        let stats = {};
        for (let key in this.ivs) {
            if (key === "general") {
                continue;
            }
            let charStatKey = 0;
            if (charStats.hasOwnProperty(key)) {
                charStatKey += charStats[key];
            }
            if (charStats.hasOwnProperty("general")) {
                charStatKey += rarityStats["general"];
            }
            let rarityStatKey = 0;
            if (rarityStats.hasOwnProperty(key)) {
                rarityStatKey += rarityStats[key];
            }
            if (rarityStats.hasOwnProperty("general")) {
                rarityStatKey += rarityStats["general"];
            }
            let ivStatKey = 0;
            if (this.ivs.hasOwnProperty(key)) {
                ivStatKey += this.ivs[key];
            }
            if (this.ivs.hasOwnProperty("general")) {
                ivStatKey += this.ivs["general"];
            }

            stats[key] = this.calculateStat(this.level, charStatKey, rarityStatKey, ivStatKey);
        }
        return stats;
    }
}


let worker = [null, null, null, null];
let activeTree = null;
let treeField = [];

function treeClick(event, index) {
    let tree = treeField[index].tree;
    if (tree === null) {
        return;
    }
    let mouseX = event.clientX + 20;
    let mouseY = event.clientY - 100;
    if (treeField[index].respawnTime > 0) {
        showMessageBoxAtPos("Tree is respawning", mouseX, mouseY);
        return;
    }

    let treeLevelRequirement = tree.level;
    if (level < treeLevelRequirement) {
        showMessageBoxAtPos("You need level " + treeLevelRequirement + " to chop this tree", mouseX, mouseY);
        return;
    }

    if (activeTree === index) {
        return;
    }

    if (activeTree !== null) {
        treeField[activeTree].element.classList.remove("chopping");
    }

    let element = treeField[index].element;
    // add class chopping
    element.classList.add("chopping");


    activeTree = index;
}

function rollTreeCut(level, axeBonus, treeDiff, treeResist) {
    let chance = Math.random();
    let p = (level + axeBonus - treeDiff) / (treeResist);
    return chance < p;
}

function addTree() {
    let treeTypes = Object.keys(trees);
    let tree = trees[treeTypes[Math.floor(Math.random() * treeTypes.length)]];


    let treeDiv = document.getElementById("trees");

    let treeElement = document.createElement("div");
    treeDiv.appendChild(treeElement);
    treeElement.classList.add("tree");
    let image = document.createElement("img");
    image.src = "assets/" + tree.image;
    image.alt = tree.name;
    image.classList.add("tree-image");
    image.width = 64;
    treeElement.appendChild(image);
    let i = treeField.length;
    treeElement.addEventListener("click", (event) => treeClick(event, i));
    treeDiv.appendChild(treeElement);

    let tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    tooltip.innerText = "Chop " + tree.name;
    treeElement.appendChild(tooltip);
    // set random position
    let x = Math.floor(Math.random() * 90);
    let y = Math.floor(Math.random() * 90);
    treeElement.style.left = x + "%";
    treeElement.style.top = y + "%";

    let treeData = {
        tree: tree,
        respawnTime: 0,
        element: treeElement,
    };

    treeField.push(treeData);

}

function addTreeOfType(treeType, x, y) {
    let tree = trees[treeType];
    let treeDiv = document.getElementById("trees");

    let treeElement = document.createElement("div");
    treeDiv.appendChild(treeElement);
    treeElement.classList.add("tree");
    let image = document.createElement("img");
    image.src = "assets/" + tree.image;
    image.alt = tree.name;
    image.classList.add("tree-image");
    image.width = 64;
    treeElement.appendChild(image);
    let i = treeField.length;
    treeElement.addEventListener("click", (event) => treeClick(event, i));
    treeDiv.appendChild(treeElement);

    let tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    tooltip.innerText = "Chop " + tree.name;
    treeElement.appendChild(tooltip);
    // set random position
    treeElement.style.left = x + "%";
    treeElement.style.top = y + "%";

    let treeData = {
        tree: tree,
        respawnTime: 0,
        element: treeElement,
    };

    treeField.push(treeData);
}

function init() {
    let seed = 421;
    let rand = createRand(seed);
    
    let normalTrees = 3;
    let oakTrees = 2;
    let willowTrees = 1;

    for (let i = 0; i < normalTrees; i++) {
        addTreeOfType("normal", Math.floor(rand() * 90), Math.floor(rand() * 90));
    }

    for (let i = 0; i < oakTrees; i++) {
        addTreeOfType("oak", Math.floor(rand() * 90), Math.floor(rand() * 90));
    }

    for (let i = 0; i < willowTrees; i++) {
        addTreeOfType("willow", Math.floor(rand() * 90), Math.floor(rand() * 90));
    }
}

init();

// Functions
function updateUI() {
    levelElement.innerText = level;
    xpElement.innerText = Math.floor(xp - xpForLevel(level));
    xpForNextLevelElement.innerText = Math.floor(xpForNextLevel - xpForLevel(level));
    logsElement.innerText = coins;
    axeLevelElement.innerText = axeLevel;
    upgradeCostElement.innerText = upgradeCost;
    upgradeAxeButton.disabled = coins < upgradeCost;
    plantTreeCostElement.innerText = getNextTreeCost();

    workersElement.innerText = "";
    for (let i = 0; i < worker.length; i++) {
        let workerElement = document.createElement("div");
        workerElement.classList.add("worker");
        if (worker[i] !== null) {
            let character = characters[worker[i].character];
            let rarity = rarities[worker[i].rarity];
            let tooltip = document.createElement("div");
            tooltip.classList.add("tooltip");
            tooltip.innerText = character.name + " (" + rarity.name + ")";
            workerElement.appendChild(tooltip);
            let img = document.createElement("img");
            img.src = "assets/" + character.image;
            let color = rarity.color;
            let shadowSize = 1 +  Math.min(10,100 / rarity.weight);
            workerElement.style.boxShadow = "0 0 10px " + shadowSize + "px " + color;
            img.alt = character.name;
            img.height = 64;
            img.width = 64;
            workerElement.appendChild(img);

        } else {
            let tooltip = document.createElement("div");
            tooltip.classList.add("tooltip");
            tooltip.innerText = "Empty";
            workerElement.innerText = "" + (i + 1);
            workerElement.appendChild(tooltip);
        }
        workersElement.appendChild(workerElement);

    }
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
    playSound("Woodcutting_level_up.oga");
}
let chopSound = new Audio("assets/chop.oga");
function cutTree() {
    if (activeTree === null) {
        return;
    }
    let tree = treeField[activeTree].tree;
    let treeData = treeField[activeTree];

    let axePower = 1;

    let cutSuccess = rollTreeCut(level, axePower, tree.difficulty, tree.resist);

    if (cutSuccess) {
        let xpGain = tree.xp;
        let logGain = tree.coins;
        gainXP(xpGain);
        coins += logGain;
        treeData.respawnTime = tree.respawnTime;

        if (getRand() < tree.depletionChance) {
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

function recruitHandler(event) {
    let new_worker = pullCharacter();
    for (let i = 0; i < worker.length; i++) {
        if (worker[i] === null) {
            worker[i] = new_worker;
            updateUI();
            break;
        }
    }

    console.log(new_worker);
    updateUI();
}

recruitButton.addEventListener('click', recruitHandler);

function getNextTreeCost() {
    return Math.floor(1000 + 1000 * treeField.length * treeField.length / 25);
}

function plantTreeHandler(event) {

    if (coins < getNextTreeCost()) {
        let x = event.clientX + 20;
        let y = event.clientY - 100;
        showMessageBoxAtPos("Not enough coins", x, y);
        return;
    }

    coins -= getNextTreeCost();
    addTree();
    updateUI();
}

plantTreeButton.addEventListener('click', plantTreeHandler);

function cancelRightClicks(event) {
    event.preventDefault();
}

document.addEventListener('contextmenu', cancelRightClicks);

let saveTimer = 0;
function tick() {
    time += tickRate;
    tickCount++;
    saveTimer += tickRate;
    if (saveTimer >= autoSaveInterval) {
        save();
        saveTimer = 0;
    }

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

    if (activeTree !== null) {
        chopSound.play();
    }
    if (tickCooldown > 0) {
        tickCooldown -= tickRate;
        return;
    }

    cutTree();
}

function main() {
    load();
    // Initial UI update
    updateUI();
    setInterval(tick, tickRate * 1000);
}

main();
