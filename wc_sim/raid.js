

function fight(character1, character2, character1StartHealth=1000, character2StartHealth=1000) {

    let character1Health = character1StartHealth;
    let character2Health = character2StartHealth;

    let character1speed = character1.agility;
    let character2speed = character2.agility;

    let character1turn = character1speed;
    let character2turn = character2speed;

    let fight = () => {
        if (character1turn > character2turn) {
            character2Health -= character1.strength;
            character2turn += character2speed;
        } else {
            character1Health -= character2.strength;
            character1turn += character1speed;
        }
    }
    
    return {
        flee: function() {
            return "You have fled the battle!";
        },
        fight: fight,
        getCharacter1Health: function() {
            return character1Health;
        },
        getCharacter2Health: function() {
            return character2Health;
        },
        hasEnded: function() {
            return character1Health <= 0 || character2Health <= 0;
        },
        getWinner: function() {
            if (character1Health <= 0) {
                return character2;
            } else {
                return character1;
            }
        },
        getLoser: function() {
            if (character1Health <= 0) {
                return character1;
            } else {
                return character2;
            }
        },
        getCharacter1: function() {
            return character1;
        },
        getCharacter2: function() {
            return character2;
        }

    }
}