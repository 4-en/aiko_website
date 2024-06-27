
const abilities = {
    "redberry_pie": {
        "name": "Redberry Pie",
        "type": "passive",
        "func": redberry_pie
    },
    "pick_pastry": {
        "name": "Pick Pastry",
        "type": "passive",
        "func": pick_pastry
    },
    "talk_to_oziach": {
        "name": "Talk to Oziach",
        "type": "passive",
        "func": talk_to_oziach
    },
    "sell_junk": {
        "name": "Sell Junk",
        "type": "passive",
        "func": sell_junk
    },
    "graador_punch": {
        "name": "Graador Punch",
        "type": "active",
        "func": graador_punch
    }
};




function redberry_pie(worker) {
    worker.stats.health += 10;
    worker.stats.energy += 10;
}

function pick_pastry(worker) {
    worker.stats.health += 5;
    worker.stats.energy += 5;
}

function talk_to_oziach(worker) {
    worker.stats.health += 5;
    worker.stats.energy += 5;
}

function sell_junk(worker) {
    worker.stats.health += 5;
    worker.stats.energy += 5;
}

function graador_punch(worker) {
    worker.stats.health -= 10;
    worker.stats.energy -= 10;
}