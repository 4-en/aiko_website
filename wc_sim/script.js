// Initial game state
let level = 1;
let xp = 0;
let _achsh = Math.floor(xp * Math.PI / 180);
let xpForNextLevel = 83;
let coins = 500;
let axeLevel = 1;
let upgradeCost = 10;
let tickCooldown = 0;
let time = 0;
let tickCount = 0;
let version = "0.1.0";
let startTime = Date.now();
let playerId = Math.floor(Math.random() * 1000000);
let playerName = "Player";
let worker = [null, null, null, null, null];
let worker_storage = [];
let activeTree = null;
let treeField = [];
let characterDex = {};
let rarityDex = {};
let showRollAnimation = true;

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


function resetEverything() {
    level = 1;
    xp = 0;
    xpForNextLevel = 83;
    coins = 500;
    axeLevel = 1;
    upgradeCost = 10;
    tickCooldown = 0;
    time = 0;
    tickCount = 0;
    startTime = Date.now();
    playerId = Math.floor(Math.random() * 1000000);
    playerName = "Player";
    treeField = [];
    worker = [null, null, null, null, null];
    worker_storage = [];
    characterDex = {};
    rarityDex = {};
    activeTree = null;
    initTrees();
    save();
    location.reload();
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
        time: time,
        showRollAnimation: showRollAnimation,
        playerId: playerId,
        playerName: playerName,
        characterDex: characterDex,
        rarityDex: rarityDex,
        trees: treeField.map(tree => {
            let treeKey = Object.keys(trees).find(key => trees[key].name === tree.tree.name);
            return {
                x: tree.x,
                y: tree.y,
                tree: treeKey,
                respawnTime: tree.respawnTime
            };
        }),
        workers: worker.map(worker1 => {

            if (worker1 === null) {
                return null;
            }

            return {
                character: worker1.character,
                rarity: worker1.rarity,
                level: worker1.level,
                xp: worker1.xp,
                ivs: worker1.ivs,
                evs: worker1.evs,
                x: worker1.x,
                y: worker1.y,
            };
        }),
        worker_storage: worker_storage.map(worker1 => {
            return {
                character: worker1.character,
                rarity: worker1.rarity,
                level: worker1.level,
                xp: worker1.xp,
                ivs: worker1.ivs,
                evs: worker1.evs,
                x: worker1.x,
                y: worker1.y,
            };
        })
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
        if (saveData.characterDex) {
            characterDex = saveData.characterDex;
        }
        if (saveData.rarityDex) {
            rarityDex = saveData.rarityDex;
        }
        if (saveData.upgradeCost) {
            upgradeCost = saveData.upgradeCost;
        }
        if (saveData.version) {
            version = saveData.version;
        }
        if (saveData.showRollAnimation) {
            showRollAnimation = saveData.showRollAnimation;
        }
        if (saveData.startTime) {
            startTime = saveData.startTime;
        }
        if (saveData.time) {
            time = saveData.time;
        }
        if (saveData.playerId) {
            playerId = saveData.playerId;
        }
        if (saveData.playerName) {
            playerName = saveData.playerName;
        }
        if (saveData.trees) {
            treeField = saveData.trees.map(tree => {
                return {
                    x: tree.x,
                    y: tree.y,
                    tree: trees[tree.tree],
                    respawnTime: tree.respawnTime,
                    element: null
                };
            });
        }
        if (saveData.workers) {
            worker = saveData.workers.map(worker1 => {

                if (worker1 === null) {
                    return null;
                }

                let newWorker = new Worker(worker1.character, worker1.rarity);
                newWorker.level = worker1.level;
                newWorker.xp = worker1.xp;
                newWorker.ivs = worker1.ivs;
                newWorker.evs = worker1.evs;
                newWorker.x = worker1.x;
                newWorker.y = worker1.y;
                newWorker.stats = newWorker.calculateStats();
                return newWorker;
            });
        }
        if (saveData.worker_storage) {
            worker_storage = saveData.worker_storage.map(worker1 => {
                let newWorker = new Worker(worker1.character, worker1.rarity);
                newWorker.level = worker1.level;
                newWorker.xp = worker1.xp;
                newWorker.ivs = worker1.ivs;
                newWorker.evs = worker1.evs;
                newWorker.x = worker1.x;
                newWorker.y = worker1.y;
                newWorker.stats = newWorker.calculateStats();
                return newWorker;
            });
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
const recruitButton = document.getElementById('recruitWorkerButton');
const plantTreeButton = document.getElementById('plantTreeButton');
const plantTreeCostElement = document.getElementById('plantTreeCost');
const workersElement = document.getElementById('workers');
const treeDiv = document.getElementById("trees");
const craftWorkerButton = document.getElementById("craftWorkerButton");
const buyXpButton = document.getElementById("buyXPButton");
const buyXpCostElement = document.getElementById("buyXPCost");
const buyXpCostElement1 = document.getElementById("buyXPCost1");
const buyXpCostElement10 = document.getElementById("buyXPCost10");
const buyXpCostElement100 = document.getElementById("buyXPCost100");
const buyXpCostElement1000 = document.getElementById("buyXPCost1000");
const workerStorageElement = document.getElementById("worker-storage-content");

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

    return messageBox;
}

// tree data
const trees = {
    "normal": {
        "xp": 25,
        "coins": 20,
        "level": 1,
        "difficulty": 1,
        "resist": 10,
        "depletionChance": 1.0,
        "name": "Tree",
        "tickCooldown": 4,
        "respawnTime": 4,
        "image": "Tree_pa.png"
    },
    "oak": {
        "xp": 37.5,
        "coins": 10,
        "level": 15,
        "difficulty": 2,
        "resist": 8,
        "depletionChance": 1 / 8,
        "name": "Oak Tree",
        "tickCooldown": 4,
        "respawnTime": 8.4,
        "image": "Oak_tree_pa.png",
        "luck": 1
    },
    "willow": {
        "xp": 67.5,
        "coins": 40,
        "level": 30,
        "difficulty": 5,
        "resist": 25,
        "depletionChance": 1 / 10,
        "name": "Willow Tree",
        "tickCooldown": 4,
        "respawnTime": 8.4,
        "image": "Willow_tree_pa.png",
        "luck": 5
    },
    "maple": {
        "xp": 100,
        "coins": 100,
        "level": 45,
        "difficulty": 10,
        "restist": 40,
        "depletionChance": 1 / 12,
        "name": "Maple Tree",
        "tickCooldown": 4,
        "respawnTime": 35.4,
        "image": "Maple_tree_pa.png",
        "luck": 10
    },
    "yew": {
        "xp": 175,
        "coins": 200,
        "level": 60,
        "difficulty": 20,
        "resist": 60,
        "depletionChance": 1 / 15,
        "name": "Yew Tree",
        "tickCooldown": 4,
        "respawnTime": 59.4,
        "image": "Yew_tree_pa.png",
        "luck": 20
    },
    "magic": {
        "xp": 250,
        "coins": 500,
        "level": 75,
        "difficulty": 30,
        "resist": 120,
        "depletionChance": 1 / 20,
        "name": "Magic Tree",
        "tickCooldown": 4,
        "respawnTime": 119.4,
        "image": "Magic_tree_pa.png",
        "luck": 30
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
        "power": 15,
        "cost": 20,
        "name": "Iron Axe"
    },
    "steel": {
        "level": 5,
        "power": 30,
        "cost": 40,
        "name": "Steel Axe"
    },
    "black": {
        "level": 10,
        "power": 35,
        "cost": 80,
        "name": "Black Axe"
    },
    "mithril": {
        "level": 20,
        "power": 45,
        "cost": 160,
        "name": "Mithril Axe"
    },
    "adamant": {
        "level": 30,
        "power": 55,
        "cost": 320,
        "name": "Adamant Axe"
    },
    "rune": {
        "level": 40,
        "power": 60,
        "cost": 640,
        "name": "Rune Axe"
    },
    "dragon": {
        "level": 60,
        "power": 75,
        "cost": 1280,
        "name": "Dragon Axe"
    },
    "infernal": {
        "level": 61,
        "power": 80,
        "cost": 2560,
        "name": "Infernal Axe"
    },
    "crystal": {
        "level": 71,
        "power": 85,
        "cost": 5120,
        "name": "Crystal Axe"
    },
    "3a": {
        "level": 80,
        "power": 100,
        "cost": 102400,
        "name": "3rd Age Axe"
    },
};

const characters = {
    "bot": {
        "weight": 2000, // "weight" is the chance of getting this character, higher weight = higher chance
        "name": "Bot", // name of the character
        "image": "bot.webp", // image of the character
        "agility": 2,
        "strength": 16,
        "woodcutting": 22,
        "luck": 1,
        "tick_manipulation": 1,
        "range": 10,
        "learning_rate": 1,
        "farming": 7,
        "trading": 10 // trading stat (more coins)
    },
    "gnome_child": {
        "weight": 500,
        "name": "Gnome Child",
        "image": "gnome-child.png",
        "agility": 29,
        "strength": 20,
        "woodcutting": 25,
        "luck": 8,
        "tick_manipulation": 15,
        "range": 11,
        "learning_rate": 17,
        "farming": 25,
        "trading": 25
    },
    "thurgo": {
        "weight": 188,
        "name": "Thurgo",
        "image": "thurgo.png",
        "agility": 1,
        "strength": 36,
        "woodcutting": 21,
        "luck": 59,
        "tick_manipulation": 32,
        "range": 84,
        "learning_rate": 18,
        "farming": 69,
        "trading": 34
    },
    "graador": {
        "weight": 41,
        "name": "General Graador",
        "image": "graador.webp",
        "agility": 29,
        "strength": 99,
        "woodcutting": 70,
        "luck": 70,
        "tick_manipulation": 53,
        "range": 37,
        "learning_rate": 69,
        "farming": 31,
        "trading": 57
    },
    "wise_old_man": {
        "weight": 121,
        "name": "Wise Old Man",
        "image": "Wise_Old_Man.png",
        "agility": 10,
        "strength": 5,
        "woodcutting": 59,
        "luck": 80,
        "tick_manipulation": 90,
        "range": 23,
        "learning_rate": 44,
        "farming": 23,
        "trading": 54
    },
    "oziach": {
        "weight": 201,
        "name": "Oziach",
        "image": "Oziach.webp",
        "agility": 38,
        "strength": 64,
        "woodcutting": 16,
        "luck": 76,
        "tick_manipulation": 30,
        "range": 30,
        "learning_rate": 32,
        "farming": 23,
        "trading": 31
    },
    "bob": {
        "weight": 173,
        "name": "Bob",
        "image": "bob.webp",
        "agility": 41,
        "strength": 46,
        "woodcutting": 44,
        "luck": 23,
        "tick_manipulation": 28,
        "range": 43,
        "learning_rate": 49,
        "farming": 47,
        "trading": 34
    },
    "evil_bob": {
        "weight": 173,
        "name": "Evil Bob",
        "image": "evil_bob.webp",
        "agility": 40,
        "strength": 19,
        "woodcutting": 76,
        "luck": 43,
        "tick_manipulation": 64,
        "range": 23,
        "learning_rate": 27,
        "farming": 39,
        "trading": 59
    },
    "hans": {
        "weight": 320,
        "name": "Hans",
        "image": "Hans.webp",
        "agility": 75,
        "strength": 18,
        "woodcutting": 16,
        "luck": 2,
        "tick_manipulation": 4,
        "range": 53,
        "learning_rate": 36,
        "farming": 37,
        "trading": 27
    },
    "uri": {
        "weight": 177,
        "name": "Uri Molotov",
        "image": "Uri.webp",
        "agility": 19,
        "strength": 37,
        "woodcutting": 55,
        "luck": 90,
        "tick_manipulation": 62,
        "range": 12,
        "learning_rate": 35,
        "farming": 46,
        "trading": 10
    },
    "sandwich_lady": {
        "weight": 250,
        "name": "Sandwich Lady",
        "image": "Sandwich_lady.png",
        "agility": 34,
        "strength": 12,
        "woodcutting": 17,
        "luck": 32,
        "tick_manipulation": 56,
        "range": 40,
        "learning_rate": 16,
        "farming": 22,
        "trading": 40
    },
    "ali_morrisane": {
        "weight": 135,
        "name": "Ali Morrisane",
        "image": "Ali_Morrisane.png",
        "agility": 31,
        "strength": 36,
        "woodcutting": 55,
        "luck": 56,
        "tick_manipulation": 25,
        "range": 37,
        "learning_rate": 21,
        "farming": 40,
        "trading": 99
    },
    "goblin": {
        "weight": 750,
        "name": "Goblin",
        "image": "goblin.webp",
        "agility": 13,
        "strength": 7,
        "woodcutting": 19,
        "luck": 26,
        "tick_manipulation": 19,
        "range": 27,
        "learning_rate": 38,
        "farming": 13,
        "trading": 34
    },
    "evil_chicken": {
        "weight": 169,
        "name": "Evil Chicken",
        "image": "evil_chicken.webp",
        "agility": 63,
        "strength": 33,
        "woodcutting": 51,
        "luck": 76,
        "tick_manipulation": 39,
        "range": 16,
        "learning_rate": 35,
        "farming": 49,
        "trading": 39
    },
    "hill_giant": {
        "weight": 700,
        "name": "Hill Giant",
        "image": "hill_giant.webp",
        "agility": 22,
        "strength": 40,
        "woodcutting": 30,
        "luck": 7,
        "tick_manipulation": 11,
        "range": 19,
        "learning_rate": 17,
        "farming": 24,
        "trading": 12
    },
    "durial321": {
        "weight": 70,
        "name": "Durial321",
        "image": "durial321.png",
        "agility": 10,
        "strength": 80,
        "woodcutting": 72,
        "luck": 59,
        "tick_manipulation": 81,
        "range": 30,
        "learning_rate": 35,
        "farming": 24,
        "trading": 31
    },
    "dharok": {
        "weight": 79,
        "name": "Dharok",
        "image": "dharok.webp",
        "agility": 24,
        "strength": 90,
        "woodcutting": 95,
        "luck": 42,
        "tick_manipulation": 30,
        "range": 48,
        "learning_rate": 50,
        "farming": 34,
        "trading": 22
    },
    "mimic": {
        "weight": 10,
        "name": "Mimic",
        "image": "mimic.webp",
        "agility": 38,
        "strength": 67,
        "woodcutting": 47,
        "luck": 99,
        "tick_manipulation": 99,
        "range": 64,
        "learning_rate": 88,
        "farming": 71,
        "trading": 75
    },
    "tekton": {
        "weight": 25,
        "name": "Tekton",
        "image": "tekton.webp",
        "agility": 40,
        "strength": 99,
        "woodcutting": 99,
        "luck": 27,
        "tick_manipulation": 51,
        "range": 54,
        "learning_rate": 54,
        "farming": 63,
        "trading": 38
    },
    "mrhankey": {
        "weight": 1,
        "name": "Mr. Hankey",
        "image": "mrhankey.webp",
        "agility": 90,
        "strength": 90,
        "woodcutting": 95,
        "luck": 90,
        "tick_manipulation": 90,
        "range": 50,
        "learning_rate": 83,
        "farming": 83,
        "trading": 80
    },
    "pot_of_greed": {
        "weight": 30,
        "name": "Pot of Greed",
        "image": "potofgreed.png",
        "agility": 1,
        "strength": 20,
        "woodcutting": 45,
        "luck": 99,
        "tick_manipulation": 99,
        "range": 77,
        "learning_rate": 74,
        "farming": 98,
        "trading": 92
    },
    "jesus": {
        "weight": 5,
        "name": "Jesus",
        "image": "Jesus.webp",
        "agility": 99,
        "strength": 85,
        "woodcutting": 89,
        "luck": 80,
        "tick_manipulation": 66,
        "range": 75,
        "learning_rate": 99,
        "farming": 70,
        "trading": 49
    },
    "krug": {
        "weight": 125,
        "name": "Krug",
        "image": "krug.webp",
        "agility": 85,
        "strength": 69,
        "woodcutting": 63,
        "luck": 39,
        "tick_manipulation": 45,
        "range": 44,
        "learning_rate": 30,
        "farming": 41,
        "trading": 36
    },
    "demonic": {
        "weight": 80,
        "name": "Demonic Gorilla",
        "image": "demonic_gorilla.webp",
        "agility": 33,
        "strength": 86,
        "woodcutting": 26,
        "luck": 58.0,
        "tick_manipulation": 59,
        "range": 85,
        "learning_rate": 66,
        "farming": 46,
        "trading": 66
    },
    "forsen": {
        "weight": 13,
        "name": "Forsen",
        "image": "forsen.png",
        "agility": 90,
        "strength": 90,
        "woodcutting": 90,
        "luck": -99,
        "tick_manipulation": 90,
        "range": 90,
        "learning_rate": 1,
        "farming": 90,
        "trading": 90
    },
    "senko": {
        "weight": 0.1,
        "name": "Senko-san",
        "image": "senko-hoodie.webp",
        "agility": 90,
        "strength": 55,
        "woodcutting": 65,
        "luck": 90,
        "tick_manipulation": 93,
        "range": 72,
        "learning_rate": 99,
        "farming": 99,
        "trading": 84
    },
    "aiko": {
        "weight": 0.01,
        "name": "Aiko",
        "image": "aiko_pa.png",
        "agility": 120,
        "strength": 120,
        "woodcutting": 120,
        "luck": 120,
        "tick_manipulation": 120,
        "range": 120,
        "learning_rate": 120,
        "farming": 120,
        "trading": 120
    }
};

const rarities = {
    "common": {
        "color": "darkslategray",
        "agility": 6,
        "strength": 19,
        "woodcutting": 4,
        "luck": 17,
        "tick_manipulation": 5,
        "range": 17,
        "learning_rate": 5,
        "farming": 14,
        "trading": 12,
        "name": "Common",
        "weight": 2000
    },
    "bronze": {
        "color": "peru",
        "agility": 30,
        "strength": 6,
        "woodcutting": 34,
        "luck": 46,
        "tick_manipulation": 39,
        "range": 19,
        "learning_rate": 1,
        "farming": 21,
        "trading": 37,
        "name": "Bronze",
        "strength": 3,
        "weight": 550
    },
    "iron": {
        "color": "gray",
        "name": "Iron",
        "agility": 20,
        "strength": 40,
        "woodcutting": 58,
        "luck": 22,
        "tick_manipulation": 6,
        "range": 28,
        "learning_rate": 10,
        "farming": 36,
        "trading": 59,
        "weight": 450
    },
    "steel": {
        "color": "lightgray",
        "name": "Steel",
        "agility": 39,
        "strength": 42,
        "woodcutting": 67,
        "luck": 19.5,
        "tick_manipulation": 18,
        "range": 20,
        "learning_rate": 31,
        "farming": 30,
        "trading": 35,
        "weight": 400
    },
    "black": {
        "color": "black",
        "name": "Black",
        "agility": 13,
        "strength": 33,
        "woodcutting": 53,
        "luck": 36,
        "tick_manipulation": 53,
        "range": 23,
        "learning_rate": 17,
        "farming": 51,
        "trading": 45.0,
        "weight": 350
    },
    "mithril": {
        "color": "lightblue",
        "name": "Mithril",
        "agility": 68,
        "strength": 30,
        "woodcutting": 59,
        "luck": 41,
        "tick_manipulation": 21,
        "range": 11,
        "learning_rate": 43,
        "farming": 6,
        "trading": 67,
        "weight": 300
    },
    "adamant": {
        "color": "green",
        "name": "Adamant",
        "agility": 27,
        "strength": 77,
        "woodcutting": 28,
        "luck": 73,
        "tick_manipulation": 46,
        "range": 48,
        "learning_rate": 20,
        "farming": 5,
        "trading": 44,
        "weight": 250
    },
    "rune": {
        "color": "blue",
        "name": "Rune",
        "agility": 19,
        "strength": 32,
        "woodcutting": 28,
        "luck": 49,
        "tick_manipulation": 82,
        "range": 58,
        "learning_rate": 17.0,
        "farming": 89,
        "trading": 40,
        "weight": 200
    },
    "dragon": {
        "color": "red",
        "name": "Dragon",
        "agility": 63,
        "strength": 77,
        "woodcutting": 55,
        "luck": 29,
        "tick_manipulation": 28,
        "range": 91,
        "learning_rate": 16,
        "farming": 61,
        "trading": 38,
        "weight": 150
    },
    "crystal": {
        "color": "cyan",
        "name": "Crystal",
        "agility": 89,
        "strength": 32,
        "woodcutting": 67,
        "luck": 69,
        "tick_manipulation": 64,
        "range": 37,
        "learning_rate": 59,
        "farming": 46,
        "trading": 31,
        "weight": 60
    },
    "graceful": {
        "color": "lightgreen",
        "name": "Graceful",
        "agility": 99,
        "strength": 1,
        "woodcutting": 90,
        "luck": 54,
        "tick_manipulation": 40,
        "range": 30,
        "learning_rate": 79,
        "farming": 81,
        "trading": 20,
        "weight": 60
    },
    "3a": {
        "color": "white",
        "name": "3rd Age",
        "agility": 54,
        "strength": 46,
        "woodcutting": 68,
        "luck": 99,
        "tick_manipulation": 59,
        "range": 63,
        "learning_rate": 99,
        "farming": 35,
        "trading": 99,
        "weight": 10
    },
    "infernal": {
        "color": "orange",
        "name": "Infernal",
        "agility": 57,
        "strength": 98,
        "woodcutting": 79,
        "luck": 63,
        "tick_manipulation": 26,
        "range": 60,
        "learning_rate": 68,
        "farming": 59,
        "trading": 73,
        "weight": 20
    },
    "ancestral": {
        "color": "purple",
        "name": "Ancestral",
        "agility": 44,
        "strength": 49,
        "woodcutting": 88,
        "luck": 46,
        "tick_manipulation": 50,
        "range": 54,
        "learning_rate": 99,
        "farming": 91,
        "trading": 53,
        "weight": 20
    },
    "twisted": {
        "color": "darkgreen",
        "name": "Twisted",
        "agility": 99,
        "strength": 64,
        "woodcutting": 65,
        "luck": 59,
        "tick_manipulation": 76,
        "range": 61,
        "learning_rate": 63,
        "farming": 53,
        "trading": 57,
        "weight": 20
    },
    "legendary": {
        "color": "#f5b038",
        "name": "Legendary",
        "agility": 77,
        "strength": 86,
        "woodcutting": 43,
        "luck": 58,
        "tick_manipulation": 58,
        "range": 80,
        "learning_rate": 70,
        "farming": 59,
        "trading": 99,
        "weight": 5
    },
    "golden_legendary": {
        "color": "gold",
        "name": "Golden Legendary",
        "agility": 38,
        "strength": 62,
        "woodcutting": 52,
        "luck": 99,
        "tick_manipulation": 99,
        "range": 62,
        "learning_rate": 84,
        "farming": 99,
        "trading": 42,
        "weight": 1
    },
    "starlight": {
        "color": "skyblue",
        "name": "Starlight",
        "agility": 86,
        "strength": 99,
        "woodcutting": 99,
        "luck": 99,
        "tick_manipulation": 99,
        "range": 54,
        "learning_rate": 1,
        "farming": 42,
        "trading": 99,
        "weight": 0.1
    },
    "divine": {
        "color": "lightyellow",
        "name": "Divine Legendary",
        "agility": 120,
        "strength": 120,
        "woodcutting": 120,
        "luck": 120,
        "tick_manipulation": 120,
        "range": 120,
        "learning_rate": 120,
        "farming": 120,
        "trading": 120,
        "weight": 0.01
    },
    "parallel": {
        "color": "darkblue",
        "name": "Parallel Universe Stardust Enigmatic",
        "agility": 200,
        "strength": 200,
        "woodcutting": 200,
        "luck": 200,
        "tick_manipulation": 200,
        "range": 200,
        "learning_rate": 200,
        "farming": 200,
        "trading": 200,
        "weight": 0.001
    }

};

function addToDex(character, rarity) {
    if (!characterDex[character]) {
        characterDex[character] = 1;
    } else {
        characterDex[character]++;
    }

    if (!rarityDex[rarity]) {
        rarityDex[rarity] = 1;
    }
    else {
        rarityDex[rarity]++;
    }
    
}

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

    addToDex(char, rarity);

    let worker = new Worker(char, rarity);
    if (showRollAnimation) {
        createCharacterRollAnimation(worker);
    }
    return worker;
}

// combines 3 characters into a new character
function craftCharacter(char1, char2, char3) {

    /*
     * Idea:
     * 1. Get the 3 characters
     * 2. For each character, do the following:
     *    - Get all characters with lower or equal weight (ie. better or equal characters)
     *    - Pick one of the better or equal characters based on their weight
     *    - add the picked character to the pool
     *    - do the same for the rarity
     * 3. Pick one of the 3 characters (this is not based on weight)
     *    (this gives the possibility offering one worker with a good character and a bad rarity,
     *    and another worker with a bad character and a good rarity, while giving the player a
     *    relatively good chance to combine their properties)
     * 4. Pick one of the 3 rarities (same as step 3)
     * 5. Create a new character with the picked character and rarity
     * 6. For each iv stat, choose one of the following options:
     *    - Pick the stat from char1
     *    - Pick the stat from char2
     *    - Pick the stat from char3
     *    - keep the random new stat
     *    (this gives the possibility of combining the stats of the 3 characters, maybe a bit too random)
     * 7. Give the new character xp based on the average xp of the 3 characters
     * 8. Return the new character
     */

    let chars = [char1.character, char2.character, char3.character];
    let rarities_l = [char1.rarity, char2.rarity, char3.rarity];

    let betterChars = [];
    let betterRarities = [];
    let totalXp = char1.xp + char2.xp + char3.xp;
    for (let i = 0; i < chars.length; i++) {
        let char = characters[chars[i]];
        let rarity = rarities_l[i];

        // get all chars with lower or equal weight
        let lower_or_equal_char_weights = [];
        for (let key in characters) {
            if (characters[key].weight <= char.weight) {
                lower_or_equal_char_weights.push(key);
            }
        }
        if (lower_or_equal_char_weights.length === 0) {
            // if no lower or equal weight, add the current char
            lower_or_equal_char_weights.push(chars[i]);
        }

        // pick one of the better chars and add to the pool
        let loe = {};
        for (let j = 0; j < lower_or_equal_char_weights.length; j++) {
            let char = characters[lower_or_equal_char_weights[j]];
            loe[lower_or_equal_char_weights[j]] = char.weight;
        }
        betterChars.push(rollWeightedRandom(loe));

        // get all rarities with lower or equal weight
        let lower_or_equal_rarity_weights = [];
        for (let key in rarities) {
            if (rarities[key].weight <= rarities[rarity].weight) {
                lower_or_equal_rarity_weights.push(key);
            }
        }
        if (lower_or_equal_rarity_weights.length === 0) {
            lower_or_equal_rarity_weights.push(rarity);
        }

        // pick one of the better rarities and add to the pool
        loe = {};
        for (let j = 0; j < lower_or_equal_rarity_weights.length; j++) {
            let rarity = rarities[lower_or_equal_rarity_weights[j]];
            loe[lower_or_equal_rarity_weights[j]] = rarity.weight;
        }
        betterRarities.push(rollWeightedRandom(loe));
    }

    // pick one of the 3 chars
    let char = betterChars[Math.floor(getRand() * 3)];
    // pick one of the 3 rarities
    let rarity = betterRarities[Math.floor(getRand() * 3)];

    addToDex(char, rarity);

    let newChar = new Worker(char, rarity);
    for (let key in newChar.ivs) {
        rand = Math.random() * 4;
        rand = Math.floor(rand);
        if (rand === 0) {
            newChar.ivs[key] = char1.ivs[key];
        } else if (rand === 1) {
            newChar.ivs[key] = char2.ivs[key];
        }
        else if (rand === 2) {
            newChar.ivs[key] = char3.ivs[key];
        }
    }

    // give xp based on the total xp of the 3 characters
    let givenXp = Math.floor(totalXp / 3);
    console.log("Given XP: " + givenXp);
    newChar.addXp(givenXp);

    return newChar;
}

function craftWithSelected() {
    if (selectedCharacters.length < 3) {
        console.log("Not enough characters selected");
        return;
    }
    if (selectedCharacters.length > 3) {
        console.log("Too many characters selected");
        return;
    }

    let char1idx = selectedCharacters[0];
    let char2idx = selectedCharacters[1];
    let char3idx = selectedCharacters[2];

    selectedCharacters = [];
    let char1 = worker[char1idx];
    let char2 = worker[char2idx];
    let char3 = worker[char3idx];

    worker[char1idx] = null;
    worker[char2idx] = null;
    worker[char3idx] = null;

    let newChar = craftCharacter(char1, char2, char3);
    char1.delete();
    char2.delete();
    char3.delete();

    for (let i = 0; i < worker.length; i++) {
        if (worker[i] === null) {
            worker[i] = newChar;
            break;
        }
    }

    console.log("Crafted new character");
    console.log(newChar);
    updateUI();

    if (showRollAnimation) {
        createCharacterRollAnimation(newChar);
    }

    return newChar;
}

function createCharacterWindow(character) {
    let characterName = characters[character.character].name;
    let card = createCharacterCard(character);
    let window = createWindow(card, characterName);

    window.style.boxShadow = card.style.boxShadow;
    card.style.boxShadow = "none";
    card.style.border = "none";
    card.style.margin = "0px";

    return window;
}

function showRarities() {
    let allRarities = rarities;
    // sort rarities by weight
    let sortable = [];
    for (let rarity in allRarities) {
        sortable.push([rarity, allRarities[rarity].weight]);
    }
    sortable.sort(function (a, b) {
        return b[1] - a[1];
    });

    for(let i = 0; i < sortable.length; i++) {
        let rarity = sortable[i][0];
        if (rarityDex[rarity]) {
            sortable[i].push(allRarities[rarity].name);
        } else {
            sortable[i].push("???");
        }
    }

    let rarityList = document.createElement("div");
    rarityList.classList.add("rarity-list");

    for (let i = 0; i < sortable.length; i++) {
        let rarity = allRarities[sortable[i][0]].rarity;
        rarity = numToOsrs(Math.round(1/rarity));
        let rarityStr = "1 / " + rarity;
        let rarityName = sortable[i][2];
        rarityStr = rarityName === "???" ? "???" : rarityStr;
        let color = allRarities[sortable[i][0]].color;
        let rarityElement = document.createElement("div");
        rarityElement.classList.add("rarity-element");
        rarityElement.style.color = color;
        let rarityNameElement = document.createElement("div");
        rarityNameElement.innerText = rarityName;
        let rarityTooltip = document.createElement("div");
        rarityTooltip.innerText = rarityStr;
        
        rarityElement.appendChild(rarityNameElement);
        rarityElement.appendChild(rarityTooltip);
        rarityList.appendChild(rarityElement);
    }

    let dialog = createWindow(rarityList, "Rarities");
    return dialog;
}

function showCharacters() {
    let allChars = characters;
    // sort characters by weight
    let sortable = [];
    for (let char in allChars) {
        sortable.push([char, allChars[char].weight]);
    }
    sortable.sort(function (a, b) {
        return b[1] - a[1];
    });

    for (let i = 0; i < sortable.length; i++) {
        let char = sortable[i][0];
        if (characterDex[char]) {
            sortable[i].push(allChars[char].name);
        } else {
            sortable[i].push("???");
        }
    }

    let charList = document.createElement("div");
    charList.classList.add("rarity-list");

    for (let i = 0; i < sortable.length; i++) {
        let rarity = allChars[sortable[i][0]].rarity;
        rarity = numToOsrs(Math.round(1/rarity));
        let rarityStr = "1 / " + rarity;
        let charName = sortable[i][2];
        rarityStr = charName === "???" ? "???" : rarityStr;
        let charElement = document.createElement("div");
        charElement.classList.add("rarity-element");
        let charNameElement = document.createElement("div");
        charNameElement.innerText = charName;
        let charTooltip = document.createElement("div");
        charTooltip.innerText = rarityStr;
        
        charElement.appendChild(charNameElement);
        charElement.appendChild(charTooltip);
        charList.appendChild(charElement);
    }

    let dialog = createWindow(charList, "Characters");
    return dialog;

}


function createWindow(element, title, onClose) {
    let window = document.createElement("div");
    window.classList.add("floating-window");

    let windowContent = document.createElement("div");
    windowContent.classList.add("floating-window-content");
    windowContent.appendChild(element);

    let cleanedUp = false;
    function cleanup() {
        if (cleanedUp) {
            return;
        }
        cleanedUp = true;
        document.onmouseup = null;
        document.onmousemove = null;
        document.onkeydown = null;
        document.body.removeChild(window);
        if(onClose) {
            onClose();
        }
    }

    let windowClose = document.createElement("button");
    windowClose.classList.add("floating-window-close");
    windowClose.innerText = "X";
    windowClose.onclick = () => {
        cleanup();
    };

    let titlebar = document.createElement("div");
    titlebar.classList.add("floating-window-titlebar");
    if (title !== null && title !== undefined) {
        let titleText = document.createElement("div");
        titleText.classList.add("floating-window-title");
        titleText.innerText = title;
        titlebar.appendChild(titleText);
    }

    titlebar.appendChild(windowClose);
    window.appendChild(titlebar);
    
    window.appendChild(windowContent);
    document.body.appendChild(window);

    // make draggable
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    titlebar.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        window.style.top = (window.offsetTop - pos2) + "px";
        window.style.left = (window.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    // close on escape
    document.onkeydown = (e) => {
        if (e.key === "Escape") {
            cleanup();
        }
    };

    return window;
}


function createDialog(title, content, onClose) {
    let dialog = document.createElement("dialog");
    dialog.classList.add("dialog");

    if (title !== null) {

        let dialogTitle = document.createElement("div");
        dialogTitle.classList.add("dialog-title");
        dialogTitle.innerText = title;
        dialog.appendChild(dialogTitle);
    }
    let dialogContent = document.createElement("div");
    dialogContent.classList.add("dialog-content");
    if(typeof content === "string") {
    dialogContent.innerText = content;
    } else {
        dialogContent.appendChild(content);
    }
    dialog.appendChild(dialogContent);
    let dialogClose = document.createElement("button");
    dialogClose.classList.add("dialog-close");
    dialogClose.innerText = "Close";
    dialogClose.onclick = () => {
        cleanup();
    };

    dialog.onclose = () => {
        cleanup();
    };

    dialog.appendChild(dialogClose);
    document.body.appendChild(dialog);
    dialog.showModal();

    return dialog;
}

function createCharacterCard(character) {
    let characterImage = document.createElement("img");
    characterImage.src = "assets/" + characters[character.character].image;
    characterImage.classList.add("character-roll-image");

    let characterCard = document.createElement("div");
    characterCard.classList.add("character-card");

    let rarity = rarities[character.rarity];
    let color = rarity.color;
    let shadowSize = character.getRarityBorderSize() * 3;
    characterCard.style.boxShadow = "0 0 40px " + shadowSize + "px " + color;

    let header = document.createElement("div");
    header.classList.add("character-roll-header");
    header.style.color = color;

    let body = document.createElement("div");
    body.classList.add("character-roll-body");

    let characterStars = document.createElement("div");
    characterStars.classList.add("character-roll-stars");

    let characterName = document.createElement("div");
    characterName.classList.add("character-roll-name");
    characterName.innerText = characters[character.character].name + " Lv. " + character.level;
    let characterTrueRarity = 1 /characters[character.character].rarity;
    characterTrueRarity = numToOsrs(Math.round(characterTrueRarity));
    let characterTrueRarityStr = "1 / " + characterTrueRarity;
    let nameTooltip = document.createElement("div");
    nameTooltip.classList.add("tooltip");
    nameTooltip.innerText = characterTrueRarityStr;
    characterName.appendChild(nameTooltip);

    let characterRarity = document.createElement("div");
    characterRarity.classList.add("character-roll-rarity");
    characterRarity.innerText = rarities[character.rarity].name;
    let rarityTooltipx = document.createElement("div");
    rarityTooltipx.classList.add("tooltip");
    rarityTooltipx.innerText = "1 / " + numToOsrs(Math.round(1 / rarities[character.rarity].rarity));
    characterRarity.appendChild(rarityTooltipx);

    let rarityValue = rarities[character.rarity].rarity * 10;
    let rarityStr = "★";
    while (rarityValue < 1) {
        rarityValue *= 5;
        // add star
        rarityStr += "★";
    }

    rarityValue = characters[character.character].rarity * 10;
    while (rarityValue < 1) {
        rarityValue *= 5;
        // add star
        rarityStr += "★";
    }

    if (rarityStr.length > 10) {
        rarityStr = "★★★★★★★★★★";
    }

    //characterRarity.innerText = rarityStr + " " + characterRarity.innerText + " " + rarityStr;
    characterStars.innerText = rarityStr;

    let trueRarity = rarities[character.rarity].rarity * characters[character.character].rarity;
    trueRarity = numToOsrs(Math.round(1 / trueRarity));
    let trueRarityStr = "1 / " + trueRarity;

    let rarityTooltip = document.createElement("div");
    rarityTooltip.classList.add("tooltip");
    rarityTooltip.innerText = trueRarityStr;
    characterStars.appendChild(rarityTooltip);

    let characterStats = document.createElement("div");
    characterStats.classList.add("character-roll-stats");

    let stats = character.stats;
    const getBaseStatDiv = (name, value, desc) => {
        let statDiv = document.createElement("div");
        statDiv.classList.add("character-roll-stat");
        statDiv.innerText = name + ": " + value;
        let tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.innerText = desc;
        tooltip.style.width = "150px";
        tooltip.style.textWrap = "wrap";
        tooltip.style.transform = "translateX(-50%)";
        statDiv.appendChild(tooltip);
        return statDiv;
    };

    characterStats.appendChild(getBaseStatDiv("AGI", stats.agility, "Agility: Increases movement speed"));
    characterStats.appendChild(getBaseStatDiv("STR", stats.strength, "Strength: Increases damage dealt"));
    characterStats.appendChild(getBaseStatDiv("WC", stats.woodcutting, "Woodcutting: Increases woodcutting chance"));
    characterStats.appendChild(getBaseStatDiv("LUCK", stats.luck, "Luck: Increases rare item chance"));
    characterStats.appendChild(getBaseStatDiv("TM", stats.tick_manipulation, "Tick Manipulation: Increases chance to skip ticks"));
    characterStats.appendChild(getBaseStatDiv("VSN", stats.range, "Vision: Increases vision range"));
    characterStats.appendChild(getBaseStatDiv("INT", stats.learning_rate, "Intelligence: Increases XP gain"));
    characterStats.appendChild(getBaseStatDiv("FARM", stats.farming, "Farming: wip"));
    characterStats.appendChild(getBaseStatDiv("TRD", stats.trading, "Trading: Increases coins gained"));


    characterCard.appendChild(header);
    header.appendChild(characterStars);
    header.appendChild(characterName);
    characterCard.appendChild(body);
    header.appendChild(characterRarity);
    body.appendChild(characterImage);
    body.appendChild(characterStats);

    return characterCard;
}

function createCharacterRollAnimation(character) {
    let characterCardInner = createCharacterCard(character);

    let characterCard = document.createElement("dialog");
    characterCard.classList.add("character-roll-card");
    characterCard.appendChild(characterCardInner);

    // add inner shadow to outer card
    characterCard.style.boxShadow = characterCardInner.style.boxShadow;


    document.body.appendChild(characterCard);

    let wasClosed = false;

    characterCard.onclose = () => {
        if (wasClosed) {
            return;
        }
        wasClosed = true;
        document.body.removeChild(characterCard);
    }

    characterCard.onclick = () => {
        if (wasClosed) {
            return;
        }
        wasClosed = true;
        document.body.removeChild(characterCard);
    }

    setTimeout(() => {
        if (wasClosed) {
            return;
        }
        wasClosed = true;
        characterCard.close();
        document.body.removeChild(characterCard);
    }, 10000);

    characterCard.showModal();

}

function createConfirmDialog(message, onConfirm, onCancel) {
    let dialog = document.createElement("dialog");
    dialog.classList.add("confirm-dialog");
    let dialogContent = document.createElement("div");
    dialogContent.classList.add("dialog-content");
    dialogContent.innerText = message;
    dialog.appendChild(dialogContent);
    let dialogConfirm = document.createElement("button");
    dialogConfirm.classList.add("dialog-confirm", "ui-button");
    dialogConfirm.innerText = "Confirm";
    dialogConfirm.onclick = () => {
        document.body.removeChild(dialog);
        if (onConfirm) {
            onConfirm();
        }
    };

    let dialogCancel = document.createElement("button");
    dialogCancel.classList.add("dialog-cancel", "ui-button");
    dialogCancel.innerText = "Cancel";
    dialogCancel.onclick = () => {
        document.body.removeChild(dialog);
        if (onCancel) {
            onCancel();
        }
    };

    dialog.onclose = () => {
        document.body.removeChild(dialog);
        if (onCancel) {
            onCancel();
        }
    };

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("dialog-button-container");
    buttonContainer.appendChild(dialogConfirm);
    buttonContainer.appendChild(dialogCancel);

    dialog.appendChild(buttonContainer);
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
        this.tooltip = null;
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
        statString += "LUCK: " + this.stats.luck + " TM: " + this.stats.tick_manipulation + " VSN: " + this.stats.range + "\n";
        statString += "INT: " + this.stats.learning_rate + " FARM: " + this.stats.farming + " TRD: " + this.stats.trading + "\n";

        return statString;
    }

    getRarityBorderSize() {
        let rar = rarities[this.rarity];
        let shadowSize = 10 * Math.log10(1 / (rar.weight + 40)) + 25;

        return shadowSize;
    }

    getRarityShadowString() {
        let rar = rarities[this.rarity];
        let color = rar.color;
        let shadowSize = this.getRarityBorderSize();
        let shadowString = "0 0 10px " + shadowSize + "px " + color;
        return shadowString;
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
            if (started) {
                return state;
            }

            delete states[state];
        }

        return "idle";

    }

    findTreeForChopping() {
        let closestTree = null;
        let closestDistance = 6660 + this.stats.range / 100 * 30;
        for (let i = 0; i < treeField.length; i++) {
            let tree = treeField[i];

            if (tree.respawnTime > 0) {
                continue;
            }

            if (tree.tree.level > this.level) {
                continue;
            }

            let distMultiplier = 1;
            if (tree.element.classList.contains("chopping")) {
                distMultiplier = 3;
            }

            let bestLevelMod = Math.max(0, this.level - tree.tree.level);
            distMultiplier *= (1 + bestLevelMod / 10);

            distMultiplier *= (1 + Math.random());

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
        if (this.cooldown > 0) {
            return;
        }

        if (this.chopping === null) {
            this.state = "idle";
            return;
        }

        let tree = this.chopping;
        let treeData = tree.tree;
        let axeBonus = this.stats.strength / 10 + 5;
        let treeDiff = treeData.difficulty;
        let level = this.stats.woodcutting / 1.5;

        let roll = rollTreeCut(level, axeBonus, treeDiff);
        this.setCooldown(treeData.tickCooldown);
        if (!roll) {
            return;
        }

        let xpGain = treeData.xp * (1 + this.stats.learning_rate / 50);
        xpGain = Math.floor(xpGain);
        let playerXpGain = Math.floor(xpGain / 4);
        gainXP(playerXpGain);
        this.addXp(xpGain);
        spawnXpDrop(this.x, this.y, xpGain + " (+" + playerXpGain + ")");
        let logGain = treeData.coins * (1 + this.stats.trading / 50);
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
        if (this.targetTree === null) {
            this.state = "idle";
            return;
        }

        let tree = this.targetTree;
        if (tree.respawnTime > 0) {
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
        if (Math.random() < 0.1) {
            let altTree = this.findTreeForChopping();
            if (altTree !== null) {
                this.targetTree = altTree;
            }
        }

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

        this.moveBy(xMov, yMov);

    }

    moveBy(x, y) {
        this.x += x;
        this.y += y;
        if (this.div !== null) {
            this.div.style.left = this.x + "%";
            this.div.style.top = this.y + "%";
        }
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        if (this.div !== null) {
            this.div.style.left = this.x + "%";
            this.div.style.top = this.y + "%";
        }
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

            img.onclick = () => {
                createCharacterWindow(this);
            };

            let shadowSize = this.getRarityBorderSize();
            img.style.filter = "drop-shadow(0px 0px " + shadowSize + "px " + rarities[this.rarity].color + ")";
            this.div.appendChild(img);
            this.tooltip = document.createElement("div");
            this.tooltip.classList.add("tooltip");
            this.tooltip.innerText = this.getDescriptionString();
            this.div.appendChild(this.tooltip);
            treeDiv.appendChild(this.div);

            this.div.style.left = this.x + "%";
            this.div.style.top = this.y + "%";
        }

        if (this.state === null || this.state === "idle") {
            this.state = this.getNewState();
        }

        this.doAction(this.state);

    }

    delete() {
        if (this.div !== null) {
            treeDiv.removeChild(this.div);
            this.div = null;
        }

        if (this.chopping !== null) {
            this.chopping.element.classList.remove("chopping");
        }

        this.chopping = null;
        this.targetTree = null;
    }

    addXp(xp) {
        this.xp += xp;

        let oldLevel = this.level;
        while (this.xp >= xpForLevel(this.level + 1)) {
            this.level += 1;
        }

        if (this.level !== oldLevel) {
            this.stats = this.calculateStats();
            if (this.tooltip !== null) {
                this.tooltip.innerText = this.getDescriptionString();
            }
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

    setCooldown(cooldown) {
        let tick_manip_chance = this.stats.tick_manipulation / 200;
        let saved_ticks = Math.random() * (1 + tick_manip_chance) / 2 * cooldown;
        saved_ticks = Math.ceil(saved_ticks);
        saved_ticks = Math.min(saved_ticks, cooldown - 1);
        if (Math.random() < tick_manip_chance) {
            cooldown -= saved_ticks;
        }
        this.cooldown = cooldown;
    }

    calculateStat(level, character, rarity, iv) {
        let charWeight = 20;
        let rarityWeight = 5;
        let ivWeight = 3;

        let statMultiplier = 2;

        let stat = character / 100 * charWeight + rarity / 100 * rarityWeight + iv / 100 * ivWeight;
        stat = stat / (charWeight + rarityWeight + ivWeight);
        stat = Math.floor(statMultiplier * stat * level + level / 10);
        return Math.max(0, stat);
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

            stats[key] = this.calculateStat(Math.min(99, this.level), charStatKey, rarityStatKey, ivStatKey) + this.calculateStat(3, charStatKey, rarityStatKey, ivStatKey) + 1;
        }
        return stats;
    }
}



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

function rollTreeCut(level, axeBonus, treeDiff) {
    let chance = Math.random();
    let p = (3 / (10 * treeDiff)) + (level * (1 + axeBonus / 30)) / (150 * treeDiff);
    return chance < p;
}

function onTreeCut(tree, character) {
    let treeData = tree.tree;
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

function initRarities() {
    // calulate the rarities of characters and rarity
    let totalCharWeight = 0;
    for (let key in characters) {
        totalCharWeight += characters[key].weight;
    }
    for (let key in characters) {
        characters[key].rarity = characters[key].weight / totalCharWeight;
    }

    let totalRarityWeight = 0;
    for (let key in rarities) {
        totalRarityWeight += rarities[key].weight;
    }
    for (let key in rarities) {
        rarities[key].rarity = rarities[key].weight / totalRarityWeight;
    }
}

function initTrees() {
    if (treeField.length > 0) {
        return;
    }
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

function spawnXpDrop(x, y, xp) {
    if (typeof xp === "number") {
        xp = numToOsrs(xp);
    }
    let xpDrop = document.createElement("div");
    xpDrop.classList.add("xp-drop");
    xpDrop.innerText = "+" + xp + " xp";
    xpDrop.style.left = x + "%";
    xpDrop.style.top = y + "%";
    treeDiv.appendChild(xpDrop);
    setTimeout(() => {
        treeDiv.removeChild(xpDrop);
    }, 2000);
}

function createTempDiv(x, y, element) {
    let div = document.createElement("div");
    div.classList.add("xp-drop");
    div.style.left = x + "%";
    div.style.top = y + "%";
    div.appendChild(element);
    treeDiv.appendChild(div);
    setTimeout(() => {
        treeDiv.removeChild(div);
    }, 2000);
    return div;
}

let selectedCharacters = [];

function clickCharacterUi(event, index) {
    let mouseX = event.clientX + 20;
    let mouseY = event.clientY - 100;
    if (worker[index] === null) {
        showMessageBoxAtPos("Empty worker slot", mouseX, mouseY);
        return;
    }
    let workerData = worker[index];

    // if selected, deselect
    if (selectedCharacters.includes(index)) {
        selectedCharacters = selectedCharacters.filter((value) => value !== index);
    } else {
        selectedCharacters.push(index);
    }

    updateUI();
}

// Functions
function updateUI() {
    levelElement.innerText = level;
    xpElement.innerText = numToOsrs(xp - xpForLevel(level));
    xpForNextLevelElement.innerText = numToOsrs(xpForNextLevel - xpForLevel(level));
    logsElement.innerText = numToOsrs(coins);
    plantTreeCostElement.innerText = numToOsrs(getNextTreeCost(), true);
    buyXpCostElement.innerText = 100 * selectedCharacters.length;
    buyXpCostElement1.innerText = 100 * selectedCharacters.length;
    buyXpCostElement10.innerText = numToOsrs(1000 * selectedCharacters.length);
    buyXpCostElement100.innerText = numToOsrs(10000 * selectedCharacters.length);
    buyXpCostElement1000.innerText = numToOsrs(100000 * selectedCharacters.length);

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
            workerElement.style.boxShadow = worker[i].getRarityShadowString();
            img.alt = character.name;
            img.height = 64;
            img.width = 64;
            workerElement.appendChild(img);

            workerElement.addEventListener("click", (event) => clickCharacterUi(event, i));

            if (selectedCharacters.includes(i)) {
                workerElement.classList.add("selectedChar");
            }

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

function swapStorageWorkerWithActive(storageIndex, activeIndex) {
    let temp = worker[activeIndex];
    temp.delete();
    worker[activeIndex] = worker_storage[storageIndex];
    worker_storage[storageIndex] = temp;
    updateUI();
}

function numToOsrs(num, roundUp = false) {
    let kMin = 100000;
    let mMin = 10000000;
    let bMin = 1000000000;

    if (num >= bMin) {
        let b = num / 1000000000;
        if (roundUp) {
            b = Math.ceil(b);
        } else {
            b = Math.floor(b);
        }
        // insert commas
        b = b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return b + "B";
    } else if (num >= mMin) {
        let m = num / 1000000;
        if (roundUp) {
            m = Math.ceil(m);
        } else {
            m = Math.floor(m);
        }
        // insert commas
        m = m.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return m + "M";
    } else if (num >= kMin) {
        let k = num / 1000;
        if (roundUp) {
            k = Math.ceil(k);
        } else {
            k = Math.floor(k);
        }
        k = k.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return k + "K";
    } else {
        num = Math.floor(num);
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}


function updateWorkerStorageUI() {
    workerStorageElement.innerText = "";
    for (let i = 0; i < worker_storage.length; i++) {
        let workerElement = document.createElement("div");
        workerElement.classList.add("worker");
        let workerData = worker_storage[i];
        let character = characters[workerData.character];
        let rarity = rarities[workerData.rarity];
        let tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.innerText = workerData.getDescriptionString();
        workerElement.appendChild(tooltip);
        let img = document.createElement("img");
        img.src = "assets/" + character.image;
        workerElement.style.boxShadow = workerData.getRarityShadowString();
        img.alt = character.name;
        img.height = 64;
        img.width = 64;
        workerElement.appendChild(img);

        workerElement.addEventListener("click", (event) => {

            // add to active workers
            if (selectedCharacters.length !== 1) {
                let x = event.clientX + 20;
                let y = event.clientY - 100;
                let mbx = showMessageBoxAtPos("Select 1 active worker to swap with", x, y);
                mbx.style.zIndex = 1000;
                closeWorkerStorage();
                return;
            }

            swapStorageWorkerWithActive(i, selectedCharacters[0]);
            selectedCharacters = [];

            // close dialog
            closeWorkerStorage();

            updateUI();



        }
        );

        workerStorageElement.appendChild(workerElement);
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

    if (treeData.respawnTime > 0) {
        activeTree = null;
        return;
    }

    let axePower = 1;

    let cutSuccess = rollTreeCut(level, axePower, tree.difficulty);

    if (cutSuccess) {
        let xpGain = tree.xp;
        let logGain = tree.coins;
        gainXP(xpGain);
        spawnXpDrop(treeData.x, treeData.y, xpGain);
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


function recruitHandler(event) {

    const cost = 1000;
    if (coins < cost) {
        let x = event.clientX + 20;
        let y = event.clientY - 100;
        showMessageBoxAtPos("Not enough coins", x, y);
        return;
    }

    // check if there is an empty worker slot
    let emptySlot = false;
    for (let i = 0; i < worker.length; i++) {
        if (worker[i] === null) {
            emptySlot = true;
            break;
        }
    }

    coins -= cost;

    let new_worker = pullCharacter();

    if (!emptySlot) {
        // add to worker_storage
        worker_storage.push(new_worker);
        let x = event.clientX + 20;
        let y = event.clientY - 100;
        showMessageBoxAtPos("Worker added to storage", x, y);
    } else {

        for (let i = 0; i < worker.length; i++) {
            if (worker[i] === null) {
                worker[i] = new_worker;
                updateUI();
                break;
            }
        }
    }

    console.log(new_worker);
    updateUI();
    save(); // save after recruiting to prevent save scumming
}

recruitButton.addEventListener('click', recruitHandler);

function craftHandler(event) {
    if (selectedCharacters.length !== 3) {
        let x = event.clientX + 20;
        let y = event.clientY - 100;
        showMessageBoxAtPos("Select 3 workers", x, y);
        return;
    }

    let newWorker = craftWithSelected();
    if (newWorker !== null) {
        /*
        let char = characters[newWorker.character];
        let rar = rarities[newWorker.rarity];
        let newWorkerString = "Crafted new worker:\n" + char.name + "\n(" + rar.name + ")";
        let x = event.clientX + 20;
        let y = event.clientY - 100;
        showMessageBoxAtPos(newWorkerString, x, y);
        */
        save(); // save after crafting to prevent save scumming
    }
}

craftWorkerButton.addEventListener('click', craftHandler);


function getNextTreeCost() {
    return Math.floor(500 + 1000 * treeField.length * treeField.length / 35);
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

let _lastXpClick = 0;
function buyXpHandler(event, multiplier = 1) {

    // this is to prevent double buying when using the right click context menu
    if (tickCount === _lastXpClick) {
        return;
    }
    _lastXpClick = tickCount;
    const cost = 100 * multiplier;
    const xpAmount = 1000 * multiplier;

    let selected = selectedCharacters;
    if (selected.length === 0) {
        let x = event.clientX + 20;
        let y = event.clientY - 100;
        showMessageBoxAtPos("Select a worker", x, y);
        return;
    }

    let xpCost = cost * selected.length;
    if (coins < xpCost) {
        let x = event.clientX + 20;
        let y = event.clientY - 100;
        showMessageBoxAtPos("Not enough coins", x, y);
        return;
    }

    coins -= xpCost;
    for (let i = 0; i < selected.length; i++) {
        let workerIndex = selected[i];
        let workerData = worker[workerIndex];
        workerData.addXp(xpAmount);

        let x = workerData.x;
        let y = workerData.y;
        spawnXpDrop(x, y, xpAmount);
    }

    updateUI();
}

buyXpButton.addEventListener('click', buyXpHandler);

function cancelRightClicks(event) {
    // only cancel default context menu if right click
    if (event.button === 2) {
        event.preventDefault();
    }
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

        if (treeData.element === null) {
            let tree = treeData.tree;
            // tree was probably loaded from save
            // create element and add to treeDiv
            let treeElement = document.createElement("div");
            treeDiv.appendChild(treeElement);
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
            treeData.element = treeElement;

            treeElement.style.left = treeData.x + "%";
            treeElement.style.top = treeData.y + "%";
        }


        if (treeData.respawnTime > 0 && time > treeData.respawnTime) {
            treeData.respawnTime = 0;
            let element = treeData.element;
            element.classList.remove("chopped");
        }
    }

    for (let i = 0; i < worker.length; i++) {
        if (worker[i] !== null) {
            worker[i].tick();
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
    initRarities();
    initTrees();
    // Initial UI update
    updateUI();
    setInterval(tick, tickRate * 1000);
}

main();
