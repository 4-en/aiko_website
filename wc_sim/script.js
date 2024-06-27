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
const treeDiv = document.getElementById("trees");

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
        "name": "Bot", // name of the character
        "image": "bot.webp", // image of the character
        "agility": 1, // agility stat (movement speed)
        "strength": 1, // strength stat (damage dealt)
        "woodcutting": 1, // woodcutting stat (change of getting logs)
        "luck": 1, // luck stat (chance of getting rare items)
        "tick_manipulation": 1, // tick manipulation stat (chance of skipping ticks)
        "range": 1, // range stat (view distance)
        "learning_rate": 1, // learning rate stat (xp gain)
        "farming": 1, // farming stat (growing new trees)
        "trading": 1 // trading stat (more coins)
    },
    "gnome_child": {
        "weight": 500,
        "name": "Gnome Child",
        "image": "gnome-child.png",
        "agility": 1,
        "strength": 1,
        "woodcutting": 1,
        "luck": 12,
        "tick_manipulation": 5,
        "range": 1,
        "learning_rate": 30,
        "farming": 25,
        "trading": 21
    },
    "thurgo": {
        "weight": 200,
        "name": "Thurgo",
        "image": "thurgo.png",
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
        "image": "graador.webp",
        "agility": 10,
        "strength": 100,
        "woodcutting": 60,
        "luck": 33,
        "tick_manipulation": 5,
        "range": 30,
        "learning_rate": 5,
        "farming": 13,
        "trading": 20
    },
    "wise_old_man": {
        "weight": 50,
        "name": "Wise Old Man",
        "image": "Wise_Old_Man.png",
        "agility": 35,
        "strength": 40,
        "woodcutting": 30,
        "luck": 100,
        "tick_manipulation": 88,
        "range": 57,
        "learning_rate": 10,
        "farming": 53,
        "trading": 73
    },
    "oziach": {
        "weight": 200,
        "name": "Oziach",
        "image": "Oziach.webp",
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
        "image": "bob.webp",
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
        "image": "evil_bob.webp",
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
    "hans": {
        "weight": 200,
        "name": "Hans",
        "image": "Hans.webp",
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
    "uri": {
        "weight": 200,
        "name": "Uri Molotov",
        "image": "Uri.webp",
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
    "sandwich_lady": {
        "weight": 200,
        "name": "Sandwich Lady",
        "image": "Sandwich_lady.png",
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
    "ali_morrisane": {
        "weight": 200,
        "name": "Ali Morrisane",
        "image": "Ali_Morrisane.png",
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
        "general": 5,
        "name": "Bronze",
        "agility": 2,
        "strength": 3,
        "weight": 500
    },
    "iron": {
        "color": "gray",
        "general": 10,
        "name": "Iron",
        "agility": 3,
        "strength": 4,
        "weight": 400
    },
    "steel": {
        "color": "lightgray",
        "general": 15,
        "name": "Steel",
        "agility": 4,
        "strength": 5,
        "weight": 350
    },
    "black": {
        "color": "black",
        "general": 20,
        "name": "Black",
        "agility": 5,
        "strength": 6,
        "weight": 300
    },
    "mithril": {
        "color": "lightblue",
        "general": 25,
        "name": "Mithril",
        "agility": 6,
        "strength": 7,
        "weight": 250
    },
    "adamant": {
        "color": "green",
        "general": 30,
        "name": "Adamant",
        "agility": 7,
        "strength": 8,
        "weight": 200
    },
    "rune": {
        "color": "blue",
        "general": 35,
        "name": "Rune",
        "agility": 8,
        "strength": 9,
        "weight": 150
    },
    "dragon": {
        "color": "red",
        "general": 40,
        "name": "Dragon",
        "agility": 4,
        "strength": 5,
        "weight": 100
    },
    "crystal": {
        "color": "cyan",
        "general": 50,
        "name": "Crystal",
        "agility": 5,
        "strength": 6,
        "weight": 50
    },
    "3a": {
        "color": "white",
        "general": 60,
        "name": "3rd Age",
        "agility": 6,
        "strength": 7,
        "weight": 10
    },
    "infernal": {
        "color": "orange",
        "general": 70,
        "name": "Infernal",
        "agility": 7,
        "strength": 8,
        "weight": 10
    },
    "ancestral": {
        "color": "purple",
        "general": 70,
        "name": "Ancestral",
        "agility": 8,
        "strength": 9,
        "weight": 10
    },
    "twisted": {
        "color": "darkgreen",
        "general": 70,
        "name": "Twisted",
        "agility": 9,
        "strength": 10,
        "weight": 10
    },
    "legendary": {
        "color": "#f5b038",
        "general": 80,
        "name": "Legendary",
        "agility": 10,
        "strength": 11,
        "weight": 5
    },
    "golden_legendary": {
        "color": "gold",
        "general": 90,
        "name": "Golden Legendary",
        "agility": 11,
        "strength": 12,
        "weight": 1
    },
    "starlight": {
        "color": "skyblue",
        "general": 100,
        "name": "Starlight",
        "agility": 12,
        "strength": 13,
        "weight": 0.1
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

// combines 3 characters into a new character
function craftCharacter(char1, char2, char3) {
    let chars = [char1.character, char2.character, char3.character];
    let rarities = [char1.rarity, char2.rarity, char3.rarity];

    let betterChars = [];
    let betterRarities = [];
    for (let i = 0; i < chars.length; i++) {
        let char = characters[chars[i]];
        let rarity = rarities[i];
        
        // get random char with lower or equal weight
        let lower_or_equal_char_weights = [];
        for (let key in characters) {
            if (characters[key].weight <= characters[char].weight) {
                lower_or_equal_char_weights.push(key);
            }
        }
        let rand = Math.random() * lower_or_equal_char_weights.length;
        let newChar = lower_or_equal_char_weights[Math.floor(rand)];
        betterChars.push(newChar);

        // get random rarity with lower or equal weight
        let lower_or_equal_rarity_weights = [];
        for (let key in rarities) {
            if (rarities[key].weight <= rarities[rarity].weight) {
                lower_or_equal_rarity_weights.push(key);
            }
        }
        rand = Math.random() * lower_or_equal_rarity_weights.length;
        let newRarity = lower_or_equal_rarity_weights[Math.floor(rand)];
        betterRarities.push(newRarity);
    }

    // pick one of the better chars and rarities
    let rand = Math.random() * betterChars.length;
    let char = betterChars[Math.floor(rand)];
    rand = Math.random() * betterRarities.length;
    let rarity = betterRarities[Math.floor(rand)];

    chars.push(char);
    rarities.push(rarity);

    rand = Math.random() * chars.length;
    char = chars[Math.floor(rand)];
    rand = Math.random() * rarities.length;
    rarity = rarities[Math.floor(rand)];

    let newChar = new Worker(char, rarity);
    for (let key in newChar.ivs) {
        rand = Math.random() * 4;
        rand = Math.floor(rand);
        if(rand === 0) {
            newChar.ivs[key] = char1.ivs[key];
        } else if (rand === 1) {
            newChar.ivs[key] = char2.ivs[key];
        }
        else if (rand === 2) {
            newChar.ivs[key] = char3.ivs[key];
        }
    }

    newChar.stats = newChar.calculateStats();

    return newChar;
}

function createDialog(title, content, onClose) {
    let dialog = document.createElement("dialog");
    dialog.classList.add("dialog");
    let dialogTitle = document.createElement("div");
    dialogTitle.classList.add("dialog-title");
    dialogTitle.innerText = title;
    dialog.appendChild(dialogTitle);
    let dialogContent = document.createElement("div");
    dialogContent.classList.add("dialog-content");
    dialogContent.innerText = content;
    dialog.appendChild(dialogContent);
    let dialogClose = document.createElement("button");
    dialogClose.classList.add("dialog-close");
    dialogClose.innerText = "Close";
    dialogClose.onclick = () => {
        document.body.removeChild(dialog);
        if (onClose) {
            onClose();
        }
    };

    dialog.onclose = () => {
        document.body.removeChild(dialog);
        if (onClose) {
            onClose();
        }
    };

    dialog.appendChild(dialogClose);
    document.body.appendChild(dialog);
    dialog.showModal();
}
    

// create test dialog
/*
createDialog("Test Dialog", "This is a test dialog", () => {
    console.log("Dialog closed");
});
*/

function rollWeightedRandom(weights) {
    // weights is a dictionary with keys as the item and values as the weight
    let totalWeight = 0;
    for (let key in weights) {
        totalWeight += weights[key];
    }

    let rand = Math.random() * totalWeight;
    let currentWeight = 0;
    for (let key in weights) {
        currentWeight += weights[key];
        if (rand < currentWeight) {
            return key;
        }

    }

    return null;
}

class Worker {
    constructor(character, rarity) {
        this.character = character;
        this.rarity = rarity;
        this.level = 1;
        this.xp = 0;
        this.ivs = this.generateIVs();
        this.evs = this.generateEVs();
        this.stats = this.calculateStats();
        this.x = 50;
        this.y = 50;
        this.div = null;
        this.targetTree = null;
        this.chopping = null;
        this.state = "idle";
        this.cooldown = 0;
    }

    getDescriptionString() {
        let name = characters[this.character].name;
        let rarity = rarities[this.rarity].name;
        let level = this.level;

        /*
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
        */

        let statString = name + " (" + rarity + ")\nLevel " + level + "\n";
        statString += "AGI: " + this.stats.agility + " STR: " + this.stats.strength + " WC: " + this.stats.woodcutting + "\n";
        statString += "LUCK: " + this.stats.luck + " TM: " + this.stats.tick_manipulation + " RNG: " + this.stats.range + "\n";
        statString += "LR: " + this.stats.learning_rate + " FARM: " + this.stats.farming + " TRD: " + this.stats.trading + "\n";

        return statString;
    }

    getNewState() {
        let states = {
            "idle": 0.1,
            "chopping": 2,
            "farming": 1,
            "fighting": 0
        };

        states["chopping"] = this.stats.woodcutting / 100;
        states["farming"] = this.stats.farming / 100;
        states["fighting"] = this.stats.strength / 100;

        while (Object.keys(states).length > 0) {
            let state = rollWeightedRandom(states);
            
            let started = this.startAction(state);
            if(started) {
                return state;
            }
            
            delete states[state];
        }

        return "idle";
        
    }

    findTreeForChopping() {
        let closestTree = null;
        let closestDistance = 60 + this.stats.range / 100 * 30;
        for (let i = 0; i < treeField.length; i++) {
            let tree = treeField[i];

            if (tree.respawnTime > 0) {
                continue;
            }

            if(tree.tree.level > this.level) {
                continue;
            }

            let distMultiplier = 1;
            if (tree.element.classList.contains("chopping")) {
                distMultiplier = 2;
            }

            let x = tree.x;
            let y = tree.y;

            let dist = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2) * distMultiplier;
            if (dist < closestDistance) {
                closestTree = tree;
                closestDistance = dist;
            }

        }

        return closestTree;
    }

    startAction(state) {

        switch (state) {
            case "idle":
                return true;
            case "chopping":
                let tree = this.findTreeForChopping();
                if (tree !== null) {
                    this.targetTree = tree;
                    return true;
                }
                return false;
            case "farming":
                return false;
            case "fighting":
                return false;
        }

        return false;
    }

    doCharacterChopping() {
        if(this.cooldown>0) {
            return;
        }

        if(this.chopping === null) {
            this.state = "idle";
            return;
        }

        let tree = this.chopping;
        let treeData = tree.tree;
        let axeBonus = this.stats.strength / 10 + 5;
        let treeDiff = treeData.difficulty;
        let treeResist = treeData.resist;
        let level = this.stats.woodcutting / 1.5;

        let roll = rollTreeCut(level, axeBonus, treeDiff, treeResist);
        this.cooldown = treeData.tickCooldown;
        if(!roll) {
            return;
        }

        let xpGain = treeData.xp * (1 + this.stats.learning_rate / 200);
        gainXP(xpGain/4);
        this.addXp(xpGain);
        let logGain = treeData.coins * (1 + this.stats.trading / 100);
        coins += Math.floor(logGain);

        if (getRand() < treeData.depletionChance) {
            let element = tree.element;
            element.classList.add("chopped");
            element.classList.remove("chopping");
            tree.respawnTime = treeData.respawnTime + time;

            this.targetTree = null;
            this.chopping = null;
            this.state = "idle";
        }
    }

    doChopping() {
        if(this.targetTree === null) {
            this.state = "idle";
            return;
        }

        let tree = this.targetTree;
        if(tree.respawnTime > 0) {
            this.targetTree = null;
            this.chopping = null;
            this.state = "idle";
            return;
        }


        let dist = Math.sqrt((this.x - tree.x) ** 2 + (this.y - tree.y) ** 2);
        if (dist < 1) {
            tree.element.classList.add("chopping");
            this.chopping = tree;
            this.doCharacterChopping();
            return;
        }

        // walk to tree

        let dx = tree.x - this.x;
        let dy = tree.y - this.y;
        let angle = Math.atan2(dy, dx);
        let speed = 2 * (1 + this.stats.agility / 100);
        let xMov = Math.cos(angle) * speed;
        let yMov = Math.sin(angle) * speed;

        if (Math.abs(xMov) > Math.abs(dx)) {
            xMov = dx;
        }

        if (Math.abs(yMov) > Math.abs(dy)) {
            yMov = dy;
        }

        this.x += xMov;
        this.y += yMov;

        this.div.style.left = this.x + "%";
        this.div.style.top = this.y + "%";

    }

    doFarming() {
        this.state = "idle";
    }

    doFighting() {
        this.state = "idle";
    }

    doAction(state) {
        switch (state) {
            case "idle":
                return;
            case "chopping":
                this.doChopping();
                return;
            case "farming":
                this.doFarming();
                return;
            case "fighting":
                this.doFighting();
                return;
        }

        this.state = "idle";
    }

    tick() {
        this.cooldown -= 1;
        if (this.cooldown < 0) {
            this.cooldown = 0;
        }

        if (this.div === null) {
            this.div = document.createElement("div");
            this.div.classList.add("worker-in-game");
            let img = document.createElement("img");
            img.src = "assets/" + characters[this.character].image;
            img.alt = characters[this.character].name;
            img.width = 64;
            this.div.appendChild(img);
            let tooltip = document.createElement("div");
            tooltip.classList.add("tooltip");
            tooltip.innerText = this.getDescriptionString();
            this.div.appendChild(tooltip);
            treeDiv.appendChild(this.div);

            this.div.style.left = this.x + "%";
            this.div.style.top = this.y + "%";
        }

        if (this.state === null || this.state === "idle") {
            this.state = this.getNewState();
        }

        this.doAction(this.state);
        
    }

    addXp(xp) {
        this.xp += xp;

        let oldLevel = this.level;
        this.level = 1;
        while (this.xp >= xpForLevel(this.level + 1)) {
            this.level += 1;
        }

        if(this.level !== oldLevel) {
            this.stats = this.calculateStats();
        }
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

        let statMultiplier = 1.5;

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

            stats[key] = this.calculateStat(this.level, charStatKey, rarityStatKey, ivStatKey) + this.calculateStat(2, charStatKey, rarityStatKey, ivStatKey);
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
        x: x,
        y: y
    };

    treeField.push(treeData);

}

function addTreeOfType(treeType, x, y) {
    let tree = trees[treeType];

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
        x: x,
        y: y
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
            tooltip.innerText = worker[i].getDescriptionString();
            workerElement.appendChild(tooltip);
            let img = document.createElement("img");
            img.src = "assets/" + character.image;
            let color = rarity.color;
            let shadowSize = 1 +  Math.min(20, 100 / (rarity.weight + 4));
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

    if(treeData.respawnTime > 0) {
        activeTree = null;
        return;
    }

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

    for (let i = 0; i < worker.length; i++) {
        if (worker[i] !== null) {
            worker[i].tick();
        }
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
