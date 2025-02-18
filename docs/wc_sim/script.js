// Initial game state
let level = 1;
let f45g9e7hge = 1;
let xp = 0;
let grset54tas = 0;
let xpForNextLevel = 83;
let coins = 500;
let fnu43funfe = 500;
let axeLevel = 1;
let upgradeCost = 10;
let tickCooldown = 0;
let time = 0;
let tickCount = 0;
let version = "0.2.0";
let startTime = Date.now();
let playerId = Math.floor(Math.random() * 1000000);
let saveId = crypto.randomUUID();
let playerName = "Player";
let worker = [null, null, null, null, null];
let worker_storage = [];
let activeTree = null;
let treeField = [];
let characterDex = {};
let rarityDex = {};
let showRollAnimation = true;
let completedAchievements = [];

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

function verify_state() {
    if (level !== f45g9e7hge) {
        console.error("Level mismatch, resetting save data");
        resetEverything();
        return;
    }
    if (xp !== grset54tas) {
        console.error("XP mismatch, resetting save data");
        resetEverything();
        return;
    }
    if (coins !== fnu43funfe) {
        console.error("Coins mismatch, resetting save data");
        resetEverything();
        return;
    }
}



function resetEverything() {
    level = 1;
    f45g9e7hge = 1;
    xp = 0;
    grset54tas = 0;
    xpForNextLevel = 83;
    coins = 500;
    fnu43funfe = 500;
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
    completedAchievements = [];
    saveId = crypto.randomUUID();
    initTrees();
    save();
    location.reload();
}


function save() {

    verify_state();

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
        saveId: saveId,
        completedAchievements: completedAchievements,
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

            return worker1;
        }),
        worker_storage: worker_storage.map(worker1 => {
            return worker1;
        })
    };

    let saveDataString = JSON.stringify(saveData);
    saveDataString = saveDataString + "saltyChocolateBalls";
    let saveDataHash = cyrb53(saveDataString, 42);
    saveData.hash = saveDataHash;

    localStorage.setItem('saveData', JSON.stringify(saveData));

    // check if logged in, if so, save to server as well

    if(LOGGED_IN) {
        saveToServer(saveData);
    }
}

async function saveToServer(saveData) {


    let response = await fetch(`${API_URL}/save_wc_sim`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(saveData)
    });

    let data = await response.json();
}

const load = async () => {

    let serverData = {};
    // first, try to load from server
    try {
        let logged_in = await is_logged_in(true);
        
        if (logged_in) {
            console.log("Logged in, loading from server");
            serverData = await fetch(`${API_URL}/load_wc_sim`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            serverData = await serverData.json();
        }
    }
    catch (error) {
        console.error("Error loading from server, loading from local storage");
    }


    let saveData = JSON.parse(localStorage.getItem('saveData'));

    // if server data is newer, use that
    // if different saveIds, use server data
    // if same saveIds, use newer data
    
    let server_data_id = serverData.saveId;
    if (server_data_id !== undefined && server_data_id !== null) {
        if (saveData === null) {
            saveData = serverData;
        } else if (saveData.saveId !== server_data_id) {
            console.log("Server data is newer, using that");
            saveData = serverData;
        } else {
            if (serverData.time > saveData.time) {
                console.log("Server data is newer, using that");
                saveData = serverData;
            }
        }
    }

    if (saveData === null) {
        // if no save data, reset everything
        console.log("No save data found, resetting everything");
        resetEverything();
        return;
    }

    // verify the save data
    let saveDataNoHash = { ...saveData };
    delete saveDataNoHash.hash;
    let saveDataString = JSON.stringify(saveDataNoHash);
    saveDataString = saveDataString + "saltyChocolateBalls";
    let saveDataHash = cyrb53(saveDataString, 42);

    if (saveDataHash !== saveData.hash) {
        console.error("Save data hash mismatch, resetting save data");
        resetEverything();
        return;
    }

    if (saveData) {
        // try to load the save data
        // always check if saveData has the property defined
        if (saveData.level) {
            level = saveData.level;
            f45g9e7hge = saveData.level;
        }
        if (saveData.xp) {
            xp = saveData.xp;
            grset54tas = saveData.xp;

        }
        if (saveData.xpForNextLevel) {
            xpForNextLevel = saveData.xpForNextLevel;
        }
        if (saveData.coins) {
            coins = saveData.coins;
            fnu43funfe = saveData.coins;
        }
        if (saveData.completedAchievements) {
            completedAchievements = saveData.completedAchievements;
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
        if (saveData.saveId) {
            saveId = saveData.saveId;
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
                newWorker.id = worker1.id;
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
                newWorker.id = worker1.id;
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

const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

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

function showDivCentered(div) {
    let messageBox = document.createElement("div");
    messageBox.classList.add("message-box");
    messageBox.appendChild(div);
    document.body.appendChild(messageBox);

    messageBox.style.left = "50%";
    messageBox.style.top = "50%";
    messageBox.style.transform = "translate(-50%, -50%)";
    messageBox.style.zIndex = 1000;

    setTimeout(() => {
        document.body.removeChild(messageBox);
    }, 2000);

    return messageBox;
}

// stats data
const statsMeta = {
    "agility": {
        "name": "Agility",
        "description": "Increases movement speed",
        "short": "AGI"
    },
    "strength": {
        "name": "Strength",
        "description": "Increases damage dealt",
        "short": "STR"
    },
    "woodcutting": {
        "name": "Woodcutting",
        "description": "Increases woodcutting speed",
        "short": "WC"
    },
    "luck": {
        "name": "Luck",
        "description": "Increases chance of rare events",
        "short": "LUCK"
    },
    "tick_manipulation": {
        "name": "Tick Manipulation",
        "description": "Increases chance of skipping ticks",
        "short": "TK"
    },
    "range": {
        "name": "Vision",
        "description": "Increases vision range",
        "short": "VSN"
    },
    "learning_rate": {
        "name": "Intelligence",
        "description": "Increases xp gain",
        "short": "INT"
    },
    "farming": {
        "name": "Farming",
        "description": "Improves tree growth",
        "short": "FRM"
    },
    "trading": {
        "name": "Trading",
        "description": "Increases coins gained",
        "short": "TRD"
    }
};

// achievement data
const achievements = {
    "first_tree": {
        "name": "First Tree",
        "description": "Chop your first tree",
        "reward": 100,
        "hidden": false,
        "difficulty": 1,
        "type": "chop",
        "chop": "normal"
    },
    "first_1k": {
        "name": "First 1k",
        "description": "Reach 1k coins",
        "reward": 100,
        "hidden": false,
        "difficulty": 1,
        "type": "coins",
        "amount": 1000
    },
    "first_worker": {
        "name": "First Worker",
        "description": "Recruit your first worker",
        "reward": 100,
        "hidden": false,
        "difficulty": 1,
        "type": "recruit",
        "character": "any",
        "rarity": "any"
    },
    "first_level": {
        "name": "First Level",
        "description": "Reach level 2",
        "reward": 100,
        "hidden": false,
        "difficulty": 1,
        "type": "level",
        "level": 2
    },
    "first_craft": {
        "name": "First Craft",
        "description": "Craft your first worker",
        "reward": 500,
        "hidden": false,
        "difficulty": 1,
        "type": "craft",
        "character": "any",
        "rarity": "any"

    },
    "first_tree_planted": {
        "name": "First Tree Planted",
        "description": "Plant your first tree",
        "reward": 100,
        "hidden": false,
        "difficulty": 1,
        "type": "plant",
        "tree": "any"
    },
    "level_10": {
        "name": "Level 10",
        "description": "Reach level 10",
        "reward": 100,
        "hidden": false,
        "difficulty": 1,
        "type": "level",
        "level": 10
    },
    "chop_oak": {
        "name": "Oak Tree",
        "description": "Reach level 15 and chop an oak tree",
        "reward": 150,
        "hidden": false,
        "difficulty": 1,
        "type": "chop",
        "chop": "oak"
    },
    "level_20": {
        "name": "Level 20",
        "description": "Reach level 20",
        "reward": 200,
        "hidden": false,
        "difficulty": 1,
        "type": "level",
        "level": 20
    },
    "chop_willow": {
        "name": "Willow Tree",
        "description": "Reach level 30 and chop a willow tree",
        "reward": 300,
        "hidden": false,
        "difficulty": 2,
        "type": "chop",
        "chop": "willow"
    },
    "level_40": {
        "name": "Level 40",
        "description": "Reach level 40",
        "reward": 400,
        "hidden": false,
        "difficulty": 2,
        "type": "level",
        "level": 40
    },
    "chop_maple": {
        "name": "Maple Tree",
        "description": "Reach level 45 and chop a maple tree",
        "reward": 500,
        "hidden": false,
        "difficulty": 2,
        "type": "chop",
        "chop": "maple"
    },
    "level_50": {
        "name": "Level 50",
        "description": "Reach level 50",
        "reward": 500,
        "hidden": false,
        "difficulty": 2,
        "type": "level",
        "level": 50
    },
    "chop_yew": {
        "name": "Yew Tree",
        "description": "Reach level 60 and chop a yew tree",
        "reward": 650,
        "hidden": false,
        "difficulty": 3,
        "type": "chop",
        "chop": "yew"
    },
    "level_70": {
        "name": "Level 70",
        "description": "Reach level 70",
        "reward": 700,
        "hidden": false,
        "difficulty": 3,
        "type": "level",
        "level": 70
    },
    "chop_magic": {
        "name": "Magic Tree",
        "description": "Reach level 75 and chop a magic tree",
        "reward": 1000,
        "hidden": false,
        "difficulty": 3,
        "type": "chop",
        "chop": "magic"
    },
    "level_80": {
        "name": "Level 80",
        "description": "Reach level 80",
        "reward": 1000,
        "hidden": false,
        "difficulty": 3,
        "type": "level",
        "level": 80
    },
    "level_90": {
        "name": "Level 90",
        "description": "Reach level 90",
        "reward": 1000,
        "hidden": false,
        "difficulty": 4,
        "type": "level",
        "level": 90
    },
    "level_95": {
        "name": "Level 95",
        "description": "Reach level 95",
        "reward": 1000,
        "hidden": false,
        "difficulty": 5,
        "type": "level",
        "level": 95
    },
    "level_99": {
        "name": "Level 99",
        "description": "Reach level 99",
        "reward": 1000,
        "hidden": false,
        "difficulty": 5,
        "type": "level",
        "level": 99
    },
    "10k_coins": {
        "name": "10k Coins",
        "description": "Reach 10k coins",
        "reward": 1000,
        "hidden": false,
        "difficulty": 2,
        "type": "coins",
        "amount": 10000
    },
    "100k_coins": {
        "name": "100k Coins",
        "description": "Reach 100k coins",
        "reward": 10000,
        "hidden": false,
        "difficulty": 3,
        "type": "coins",
        "amount": 100000
    },
    "1m_coins": {
        "name": "1m Coins",
        "description": "Reach 1m coins",
        "reward": 100000,
        "hidden": false,
        "difficulty": 4,
        "type": "coins",
        "amount": 1000000
    },
    "max_cash": {
        "name": "Max Cash",
        "description": "Reach max coins",
        "reward": 10000000,
        "hidden": false,
        "difficulty": 5,
        "type": "coins",
        "amount": 2147483647
    },
    "first_tree_planted_oak": {
        "name": "First Oak Tree Planted",
        "description": "Plant your first oak tree",
        "reward": 100,
        "hidden": false,
        "difficulty": 1,
        "type": "plant",
        "tree": "oak"
    },
    "first_tree_planted_willow": {
        "name": "First Willow Tree Planted",
        "description": "Plant your first willow tree",
        "reward": 100,
        "hidden": false,
        "difficulty": 1,
        "type": "plant",
        "tree": "willow"
    },
    "first_tree_planted_maple": {
        "name": "First Maple Tree Planted",
        "description": "Plant your first maple tree",
        "reward": 200,
        "hidden": false,
        "difficulty": 2,
        "type": "plant",
        "tree": "maple"
    },
    "first_tree_planted_yew": {
        "name": "First Yew Tree Planted",
        "description": "Plant your first yew tree",
        "reward": 300,
        "hidden": false,
        "difficulty": 2,
        "type": "plant",
        "tree": "yew"
    },
    "first_tree_planted_magic": {
        "name": "First Magic Tree Planted",
        "description": "Plant your first magic tree",
        "reward": 500,
        "hidden": false,
        "difficulty": 3,
        "type": "plant",
        "tree": "magic"
    },
    "first_tree_planted_10": {
        "name": "First 10 Trees Planted",
        "description": "Plant your first 10 trees",
        "reward": 1000,
        "hidden": false,
        "difficulty": 2,
        "type": "plant",
        "amount": 10
    },
    "first_tree_planted_15": {
        "name": "First 15 Trees Planted",
        "description": "Plant your first 15 trees",
        "reward": 1500,
        "hidden": false,
        "difficulty": 3,
        "type": "plant",
        "amount": 15
    },
    "first_tree_planted_20": {
        "name": "First 20 Trees Planted",
        "description": "Plant your first 20 trees",
        "reward": 2000,
        "hidden": false,
        "difficulty": 4,
        "type": "plant",
        "amount": 20
    },
    // character achievements
    "first_bot": {
        "name": "First Bot",
        "description": "Recruit your first Bot",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "bot",
        "rarity": "any"
    },
    "first_gnome_child": {
        "name": "First Gnome Child",
        "description": "Recruit your first Gnome Child",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "gnome_child",
        "rarity": "any"
    },
    "first_thurgo": {
        "name": "First Thurgo",
        "description": "Recruit your first Thurgo",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "thurgo",
        "rarity": "any"
    },
    "first_graador": {
        "name": "First Graador",
        "description": "Recruit your first General Graador",
        "reward": 500,
        "hidden": true,
        "difficulty": 3,
        "type": "recruit",
        "character": "graador",
        "rarity": "any"
    },
    "first_wise_old_man": {
        "name": "First Wise Old Man",
        "description": "Recruit your first Wise Old Man",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "wise_old_man",
        "rarity": "any"
    },
    "first_oziach": {
        "name": "First Oziach",
        "description": "Recruit your first Oziach",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "oziach",
        "rarity": "any"
    },
    "first_bob": {
        "name": "First Bob",
        "description": "Recruit your first Bob",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "bob",
        "rarity": "any"
    },
    "first_evil_bob": {
        "name": "First Evil Bob",
        "description": "Recruit your first Evil Bob",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "evil_bob",
        "rarity": "any"
    },
    "first_hans": {
        "name": "First Hans",
        "description": "Recruit your first Hans",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "hans",
        "rarity": "any"
    },
    "first_uri": {
        "name": "First Uri",
        "description": "Recruit your first Uri",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "uri",
        "rarity": "any"
    },
    "first_sandwich_lady": {
        "name": "First Sandwich Lady",
        "description": "Recruit your first Sandwich Lady",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "sandwich_lady",
        "rarity": "any"
    },
    "first_ali_morrisane": {
        "name": "First Ali Morrisane",
        "description": "Recruit your first Ali Morrisane",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "ali_morrisane",
        "rarity": "any"
    },
    "first_goblin": {
        "name": "First Goblin",
        "description": "Recruit your first Goblin",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "goblin",
        "rarity": "any"
    },
    "first_evil_chicken": {
        "name": "First Evil Chicken",
        "description": "Recruit your first Evil Chicken",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "evil_chicken",
        "rarity": "any"
    },
    "first_hill_giant": {
        "name": "First Hill Giant",
        "description": "Recruit your first Hill Giant",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "hill_giant",
        "rarity": "any"
    },
    "first_durial321": {
        "name": "First Durial321",
        "description": "Recruit your first Durial321",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "durial321",
        "rarity": "any"
    },
    "first_dharok": {
        "name": "First Dharok",
        "description": "Recruit your first Dharok",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "dharok",
        "rarity": "any"
    },
    "first_mimic": {
        "name": "First Mimic",
        "description": "Recruit your first Mimic",
        "reward": 1000,
        "hidden": true,
        "difficulty": 4,
        "type": "recruit",
        "character": "mimic",
        "rarity": "any"
    },
    "first_tekton": {
        "name": "First Tekton",
        "description": "Recruit your first Tekton",
        "reward": 500,
        "hidden": true,
        "difficulty": 3,
        "type": "recruit",
        "character": "tekton",
        "rarity": "any"
    },
    "first_mrhankey": {
        "name": "First Mr. Hankey",
        "description": "Recruit Mr. Hankey",
        "reward": 2000,
        "hidden": true,
        "difficulty": 4,
        "type": "recruit",
        "character": "mrhankey",
        "rarity": "any"
    },
    "first_pot_of_greed": {
        "name": "First Pot of Greed",
        "description": "Recruit your first Pot of Greed",
        "reward": 500,
        "hidden": true,
        "difficulty": 3,
        "type": "recruit",
        "character": "pot_of_greed",
        "rarity": "any"
    },
    "first_jesus": {
        "name": "First Jesus",
        "description": "Recruit Jesus",
        "reward": 1000,
        "hidden": true,
        "difficulty": 4,
        "type": "recruit",
        "character": "jesus",
        "rarity": "any"
    },
    "first_krug": {
        "name": "First Krug",
        "description": "Recruit your first Krug",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "krug",
        "rarity": "any"
    },
    "first_demonic_gorilla": {
        "name": "First Demonic Gorilla",
        "description": "Recruit your first Demonic Gorilla",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "demonic",
        "rarity": "any"
    },
    "first_forsen": {
        "name": "First Forsen",
        "description": "Recruit Forsen",
        "reward": 1000,
        "hidden": true,
        "difficulty": 4,
        "type": "recruit",
        "character": "forsen",
        "rarity": "any"
    },
    "first_senko": {
        "name": "First Senko",
        "description": "Recruit Senko-san",
        "reward": 10000,
        "hidden": true,
        "difficulty": 5,
        "type": "recruit",
        "character": "senko",
        "rarity": "any"
    },
    "first_aiko": {
        "name": "First Aiko",
        "description": "Recruit Aiko",
        "reward": 10000,
        "hidden": true,
        "difficulty": 5,
        "type": "recruit",
        "character": "aiko",
        "rarity": "any"
    },

    // rarity achievements
    "first_bronze": {
        "name": "First Bronze",
        "description": "Recruit your first Bronze worker",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "any",
        "rarity": "bronze"
    },
    "first_iron": {
        "name": "First Iron",
        "description": "Recruit your first Iron worker",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "any",
        "rarity": "iron"
    },
    "first_steel": {
        "name": "First Steel",
        "description": "Recruit your first Steel worker",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "any",
        "rarity": "steel"
    },
    "first_black": {
        "name": "First Black",
        "description": "Recruit your first Black worker",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "any",
        "rarity": "black"
    },
    "first_mithril": {
        "name": "First Mithril",
        "description": "Recruit your first Mithril worker",
        "reward": 100,
        "hidden": true,
        "difficulty": 1,
        "type": "recruit",
        "character": "any",
        "rarity": "mithril"
    },
    "first_adamant": {
        "name": "First Adamant",
        "description": "Recruit your first Adamant worker",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "any",
        "rarity": "adamant"
    },
    "first_rune": {
        "name": "First Rune",
        "description": "Recruit your first Rune worker",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "any",
        "rarity": "rune"
    },
    "first_dragon": {
        "name": "First Dragon",
        "description": "Recruit your first Dragon worker",
        "reward": 200,
        "hidden": true,
        "difficulty": 2,
        "type": "recruit",
        "character": "any",
        "rarity": "dragon"
    },
    "first_crystal": {
        "name": "First Crystal",
        "description": "Recruit your first Crystal worker",
        "reward": 300,
        "hidden": true,
        "difficulty": 3,
        "type": "recruit",
        "character": "any",
        "rarity": "crystal"
    },
    "first_graceful": {
        "name": "First Graceful",
        "description": "Recruit your first Graceful worker",
        "reward": 300,
        "hidden": true,
        "difficulty": 3,
        "type": "recruit",
        "character": "any",
        "rarity": "graceful"
    },
    "first_3a": {
        "name": "First 3rd Age",
        "description": "Recruit your first 3rd Age worker",
        "reward": 500,
        "hidden": true,
        "difficulty": 4,
        "type": "recruit",
        "character": "any",
        "rarity": "3a"
    },
    "first_infernal": {
        "name": "First Infernal",
        "description": "Recruit your first Infernal worker",
        "reward": 300,
        "hidden": true,
        "difficulty": 3,
        "type": "recruit",
        "character": "any",
        "rarity": "infernal"
    },
    "first_ancestral": {
        "name": "First Ancestral",
        "description": "Recruit your first Ancestral worker",
        "reward": 300,
        "hidden": true,
        "difficulty": 3,
        "type": "recruit",
        "character": "any",
        "rarity": "ancestral"
    },
    "first_twisted": {
        "name": "First Twisted",
        "description": "Recruit your first Twisted worker",
        "reward": 300,
        "hidden": true,
        "difficulty": 3,
        "type": "recruit",
        "character": "any",
        "rarity": "twisted"
    },
    "first_legendary": {
        "name": "First Legendary",
        "description": "Recruit your first Legendary worker",
        "reward": 1000,
        "hidden": true,
        "difficulty": 4,
        "type": "recruit",
        "character": "any",
        "rarity": "legendary"
    },
    "first_golden_legendary": {
        "name": "First Golden Legendary",
        "description": "Recruit your first Golden Legendary worker",
        "reward": 2000,
        "hidden": true,
        "difficulty": 4,
        "type": "recruit",
        "character": "any",
        "rarity": "golden_legendary"
    },
    "first_starlight": {
        "name": "First Starlight",
        "description": "Recruit your first Starlight worker",
        "reward": 5000,
        "hidden": true,
        "difficulty": 5,
        "type": "recruit",
        "character": "any",
        "rarity": "starlight"
    },
    "first_divine": {
        "name": "First Divine",
        "description": "Recruit your first Divine Legendary worker",
        "reward": 10000,
        "hidden": true,
        "difficulty": 5,
        "type": "recruit",
        "character": "any",
        "rarity": "divine"
    },
    "first_parallel": {
        "name": "First Parallel",
        "description": "Recruit your first Parallel Universe Stardust Enigmatic worker",
        "reward": 50000,
        "hidden": true,
        "difficulty": 5,
        "type": "recruit",
        "character": "any",
        "rarity": "parallel"
    }
};

const achievement_difficulties = {
    1: {
        "name": "Beginner",
        "color": "#00ff00"
    },
    2: {
        "name": "Easy",
        "color": "#ffcc00"
    },
    3: {
        "name": "Medium",
        "color": "#ff6600"
    },
    4: {
        "name": "Hard",
        "color": "#ff0000"
    },
    5: {
        "name": "Master",
        "color": "#cc00cc"
    }
};

function showAchievementsList() {
    // shows the achievements list in a window
    let achievementsList = document.createElement("div");
    achievementsList.classList.add("achievements-list");

    // first show completed achievements
    let completed_achievements = [];
    let not_completed_achievements = [];

    // iterate through achievements
    for (let achievement_name in achievements) {
        let achievement = achievements[achievement_name];
        let completed = completedAchievements.includes(achievement_name);
        if (completed) {
            completed_achievements.push(achievement);
        } else {
            not_completed_achievements.push(achievement);
        }
    }

    // sort by hidden -> difficulty -> name
    completed_achievements.sort((a, b) => {
        if (a.hidden && !b.hidden) {
            return 1;
        } else if (!a.hidden && b.hidden) {
            return -1;
        } else if (a.difficulty !== b.difficulty) {
            return a.difficulty - b.difficulty;
        }
        return a.name.localeCompare(b.name);
    });

    not_completed_achievements.sort((a, b) => {
        if (a.hidden && !b.hidden) {
            return 1;
        } else if (!a.hidden && b.hidden) {
            return -1;
        } else if (a.difficulty !== b.difficulty) {
            return a.difficulty - b.difficulty;
        }
        return a.name.localeCompare(b.name);
    });

    // add completed achievements
    for (let achievement of completed_achievements) {
        let achievementDiv = document.createElement("div");
        achievementDiv.classList.add("achievement");
        achievementDiv.classList.add("completed");
        let a_name = achievement.name;
        let a_description = achievement.description;
        let a_difficulty = achievement_difficulties[achievement.difficulty].name;
        let a_reward = numToOsrs(achievement.reward);
        let achievement_name_div = document.createElement("div");
        achievement_name_div.innerText = a_name;
        achievement_name_div.style.color = achievement_difficulties[achievement.difficulty].color;
        achievementDiv.appendChild(achievement_name_div);
        let achievement_description_div = document.createElement("div");
        achievement_description_div.innerText = a_description + " (" + a_difficulty + ") - Reward: " + a_reward + " coins";
        achievementDiv.appendChild(achievement_description_div);
        achievementsList.appendChild(achievementDiv);
    }

    // add not completed achievements
    for (let achievement of not_completed_achievements) {
        let achievementDiv = document.createElement("div");
        achievementDiv.classList.add("achievement");
        let a_name = achievement.name;
        let a_description = achievement.description;
        let a_difficulty = achievement_difficulties[achievement.difficulty].name;
        let a_reward = numToOsrs(achievement.reward);

        if (achievement.hidden) {
            achievementDiv.classList.add("hidden");
            a_name = "???";
            a_description = "???";
            a_difficulty = "???";
            a_reward = "???";
        }

        let achievement_name_div = document.createElement("div");
        achievement_name_div.innerText = a_name;
        achievement_name_div.style.color = achievement_difficulties[achievement.difficulty].color;
        achievementDiv.appendChild(achievement_name_div);
        let achievement_description_div = document.createElement("div");
        achievement_description_div.innerText = a_description + " (" + a_difficulty + ") - Reward: " + a_reward + " coins";
        achievementDiv.appendChild(achievement_description_div);

        achievementsList.appendChild(achievementDiv);
    }

    createWindow(achievementsList, "Achievements");
}


function checkRecruitAchievements(new_worker) {
    // check for recruit achievements
    for (let achievement_name in achievements) {
        let achievement = achievements[achievement_name];
        if (achievement.type !== "recruit") {
            continue;
        }
        if (completedAchievements.includes(achievement_name)) {
            continue;
        }
        if (achievement.character === new_worker.character || achievement.character === "any") {
            if (achievement.rarity === new_worker.rarity || achievement.rarity === "any") {
                completeAchievement(achievement_name);
            }
        }

    }
}

function checkCoinAchievements(coins) {
    // check for coin achievements
    for (let achievement_name in achievements) {
        let achievement = achievements[achievement_name];
        if (achievement.type !== "coins") {
            continue;
        }
        if (completedAchievements.includes(achievement_name)) {
            continue;
        }
        if (coins >= achievement.amount) {
            completeAchievement(achievement_name);
        }
    }
}

function checkLevelAchievements(level) {
    // check for level achievements
    for (let achievement_name in achievements) {
        let achievement = achievements[achievement_name];
        if (achievement.type !== "level") {
            continue;
        }
        if (completedAchievements.includes(achievement_name)) {
            continue;
        }
        if (level >= achievement.level) {
            completeAchievement(achievement_name);
        }

    }
}

function checkChopAchievements(tree) {
    // check for chop achievements
    for (let achievement_name in achievements) {
        let achievement = achievements[achievement_name];
        if (achievement.type !== "chop") {
            continue;
        }
        if (completedAchievements.includes(achievement_name)) {
            continue;
        }
        let tree_name = trees[achievement.chop].name;
        if (tree_name  === tree) {
            completeAchievement(achievement_name);
        }
    }
}

function checkPlantAchievements(tree) {
    // check for plant achievements
    for (let achievement_name in achievements) {
        let achievement = achievements[achievement_name];
        if (achievement.type !== "plant") {
            continue;
        }
        if (completedAchievements.includes(achievement_name)) {
            continue;
        }
        if (achievement.tree !== undefined) {
            let tree_name = trees[achievement.tree]?.name ?? "idk";
            if (tree_name  === tree || achievement.tree === "any") {
                completeAchievement(achievement_name);
            }
        } else if (achievement.amount !== undefined) {
            let totalPlanted = treeField.length - 6;
            if (achievement.amount <= totalPlanted) {
                completeAchievement(achievement_name);
            }
        }
    }
}

function checkCraftAchievements(worker) {
    // check for craft achievements
    for (let achievement_name in achievements) {
        let achievement = achievements[achievement_name];
        if (achievement.type !== "craft") {
            continue;
        }
        if (completedAchievements.includes(achievement_name)) {
            continue;
        }
        if (achievement.character === worker.character || achievement.character === "any") {
            if (achievement.rarity === worker.rarity || achievement.rarity === "any") {
                completeAchievement(achievement_name);
            }
        }
    }
}


function completeAchievement(achievement_name) {
    // sets the achievement as completed
    if (completedAchievements.includes(achievement_name)) {
        return;
    }

    let achievement = achievements[achievement_name];

    // check if undefined
    if (achievement === undefined || achievement === null) {
        console.error("Achievement " + achievement_name + " does not exist");
        return;
    }

    completedAchievements.push(achievement_name);




    let reward = achievement.reward;
    let diff = achievement_difficulties[achievement.difficulty];
    let color = diff.color;
    let diff_name = diff.name;
    addCoins(reward);

    reward = numToOsrs(reward);

    // create a message box
    let messageBox = document.createElement("div");
    messageBox.classList.add("achievement-box");
    let title = diff_name + " Achievement Unlocked!";
    let description = achievement.name + ": " + achievement.description;
    let rewardText = "Reward: " + reward + " coins";

    let titleElement = document.createElement("div");
    titleElement.innerText = title;
    titleElement.style.color = color;
    titleElement.classList.add("achievement-title");
    messageBox.appendChild(titleElement);

    let descriptionElement = document.createElement("div");
    descriptionElement.innerText = description;
    descriptionElement.classList.add("achievement-description");
    messageBox.appendChild(descriptionElement);

    let rewardElement = document.createElement("div");
    rewardElement.innerText = rewardText;

    rewardElement.classList.add("achievement-reward");
    messageBox.appendChild(rewardElement);

    document.body.appendChild(messageBox);

    setTimeout(() => {
        document.body.removeChild(messageBox);
    }
        , 5000);
}

// highscores
function showHighscores(title, subtitle, scores) {
    // scores is a list of: {name: "name", score: 1234, character: object}
    // character can be null. If not, left click opens character card
    let highscoresDiv = document.createElement("div");
    highscoresDiv.classList.add("highscores");

    let titleDiv = document.createElement("div");
    titleDiv.innerText = title;
    titleDiv.classList.add("highscores-title");
    highscoresDiv.appendChild(titleDiv);

    if (subtitle !== null) {
        let subtitleDiv = document.createElement("div");
        subtitleDiv.innerText = subtitle;
        subtitleDiv.classList.add("highscores-subtitle");
        highscoresDiv.appendChild(subtitleDiv);
    }

    let scoresDiv = document.createElement("div");
    scoresDiv.classList.add("highscores-scores");

    // sort scores
    scores.sort((a, b) => {
        return b.score - a.score;
    });

    for (let i = 0; i < scores.length; i++) {
        let score = scores[i];
        let scoreDiv = document.createElement("div");
        scoreDiv.classList.add("highscores-score");

        let rankDiv = document.createElement("div");
        rankDiv.classList.add("highscores-rank");
        rankDiv.innerText = (i + 1) + ".";
        scoreDiv.appendChild(rankDiv);

        let nameDiv = document.createElement("div");
        nameDiv.classList.add("highscores-name");
        nameDiv.innerText = score.name;
        scoreDiv.appendChild(nameDiv);

        let scoreDiv2 = document.createElement("div");
        scoreDiv2.classList.add("highscores-score2");
        scoreDiv2.innerText = numToOsrs(score.score);
        scoreDiv.appendChild(scoreDiv2);

        if (score.character !== null) {
            scoreDiv.addEventListener("click", () => {
                createCharacterWindow(score.character);
            });
            scoreDiv.classList.add("clickable");
        }

        scoresDiv.appendChild(scoreDiv);
    }

    highscoresDiv.appendChild(scoresDiv);

    createWindow(highscoresDiv, "Highscores");
}

// test highscores with local characters
function testHighscores() {
    let scores = [];
    for (let i = 0; i < worker_storage.length; i++) {
        let character = worker_storage[i];
        console.log(character);
        let score = Math.floor(Math.random() * 1000000);
        let rarity_name = rarities[character.rarity].name;
        let character_name = characters[character.character].name;
        let full_name = rarity_name + " " + character_name;
        scores.push({name: full_name, score: score, character: character});
    }

    showHighscores("Test Highscores", "Test subtitle", scores);
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
        "weight": 69,
        "name": "Thurgo",
        "image": "thurgo.png",
        "agility": 1,
        "strength": 61,
        "woodcutting": 79,
        "luck": 59,
        "tick_manipulation": 66,
        "range": 55,
        "learning_rate": 47,
        "farming": 62,
        "trading": 79
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
        "weight": 139,
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
        "weight": 650
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
        "weight": 550
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
        "weight": 450
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
        "weight": 400
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
        "weight": 350
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
        "weight": 150
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
        "weight": 100
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

    // fill the active workers with workers from the storage
    for (let i = 0; i < worker.length; i++) {
        if (worker[i] === null) {
            if (worker_storage.length > 0) {
                worker[i] = worker_storage.pop();
            } else {
                break;
            }
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

function getStarCount(character, rarity) {
    let rarityValue = rarities[rarity].rarity * 10;
    let starCount = 1;
    while (rarityValue < 1) {
        rarityValue *= 5;
        // add star
        starCount++;
    }

    rarityValue = characters[character].rarity * 10;
    while (rarityValue < 1) {
        rarityValue *= 5;
        // add star
        starCount++;
    }

    starCount = Math.min(starCount, 10);

    return starCount;
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

    for (let i = 0; i < sortable.length; i++) {
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
        rarity = numToOsrs(Math.round(1 / rarity));
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

        if (rarityName !== "???") {
            let tooltip = createStatsDiv(allRarities[sortable[i][0]]);

            tooltip.classList.add("tooltip");

            rarityElement.appendChild(tooltip);
        }


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
        rarity = numToOsrs(Math.round(1 / rarity));
        let rarityStr = "1 / " + rarity;
        let charName = sortable[i][2];
        rarityStr = charName === "???" ? "???" : rarityStr;
        let charElement = document.createElement("div");
        charElement.classList.add("rarity-element");
        let charNameElement = document.createElement("div");
        charNameElement.innerText = charName;
        let charRarityElement = document.createElement("div");
        charRarityElement.innerText = rarityStr;

        charElement.appendChild(charNameElement);
        charElement.appendChild(charRarityElement);

        if (charName !== "???") {
            let tooltip = createStatsDiv(allChars[sortable[i][0]]);

            tooltip.classList.add("tooltip");

            charElement.appendChild(tooltip);
        }


        charList.appendChild(charElement);
    }

    let dialog = createWindow(charList, "Characters");
    return dialog;

}

function createStatsDiv(stats) {

    let statsDiv = document.createElement("div");
    statsDiv.classList.add("stats-div");

    for (let key in statsMeta) {
        let name = statsMeta[key].name;
        let shortName = statsMeta[key].short;
        let value = stats[key];
        let description = statsMeta[key].description;
        let statElement = document.createElement("div");
        statElement.classList.add("stat-element");
        statElement.innerText = shortName + ": " + value;

        let tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.innerText = name + ": " + value + "\n" + description;

        statElement.appendChild(tooltip);
        statsDiv.appendChild(statElement);

    }

    return statsDiv;
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
        if (onClose) {
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
    if (typeof content === "string") {
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
    let characterTrueRarity = 1 / characters[character.character].rarity;
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

function showCharacterDetails(character) {
    let characterCard = createCharacterCard(character);

    let dialog = createDialog(null, characterCard, () => {
        console.log("Dialog closed");
    });

    return dialog;
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
        this.id = crypto.randomUUID();
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
        this.full_name = rarities[this.rarity].name + " " + characters[this.character].name;
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
        logGain = Math.floor(logGain);
        addCoins(logGain);

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
            this.tooltip.onclick = () => {
                createCharacterWindow(this);
            };
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

    // base stats are basically the stats at level 100
    calculateBaseStats() {
        let charStats = characters[this.character];
        let rarityStats = rarities[this.rarity];
        let baseStats = {};
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

            baseStats[key] = this.calculateStat(100, charStatKey, rarityStatKey, ivStatKey);
        }
        return baseStats;
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

    return treeData;

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
            tooltip.onclick = () => {
                createCharacterWindow(worker[i]);
            };
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
        tooltip.onclick = () => {
            createCharacterWindow(workerData);
        };
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

function setCoins(num) {
    coins = num;
    fnu43funfe = coins;

    checkCoinAchievements(coins);

    updateUI();
}

function addCoins(num) {
    coins += num;
    fnu43funfe = coins;

    checkCoinAchievements(coins);

    updateUI();
}

function gainXP(amount) {
    xp += amount;
    grset54tas = xp;
    while (xp >= xpForLevel(level + 1)) {
        levelUp();
    }
    updateUI();
}

function levelUp() {
    level++;
    checkLevelAchievements(level);
    f45g9e7hge = level;
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

        checkChopAchievements(tree.name);

        let xpGain = tree.xp;
        let logGain = tree.coins;
        gainXP(xpGain);
        spawnXpDrop(treeData.x, treeData.y, xpGain);
        addCoins(logGain);
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

    addCoins(-cost);

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

    checkRecruitAchievements(new_worker);

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

        checkCraftAchievements(newWorker);
        checkRecruitAchievements(newWorker);

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

    addCoins(-getNextTreeCost());
    let treeData = addTree();
    checkPlantAchievements(treeData.tree.name);
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

    addCoins(-xpCost);
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

    verify_state();

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

async function main() {
    await load();
    initRarities();
    initTrees();
    // Initial UI update
    updateUI();
    setInterval(tick, tickRate * 1000);
}

main();
