from dataclasses import dataclass

@dataclass
class CharacterEntry:
    player_id: int
    name: str
    score: int
    character: dict

@dataclass
class XPEntry:
    player_id: int
    name: str
    xp: int

def calculate_character_score(character: dict):
    stats = character.get('stats', {})
    total: int = 0
    for stat in stats.values():
        try:
            total += int(stat)
        except ValueError:
            pass
    return total

class WCHighscores:
    def __init__(self):
        self.xp_highscores = []
        self.character_highscores = []
        self.MAX_HIGHSCORES = 10

    def update_player(self, id, name, player_save:dict):
        xp = player_save.get('xp', 0)
        characters = player_save.get('workers', [])
        worker_storage = player_save.get('worker_storage', [])
        characters.extend(worker_storage)


        # clear old entries
        self.xp_highscores = [x for x in self.xp_highscores if x.player_id != id]
        self.character_highscores = [x for x in self.character_highscores if x.player_id != id]

        # insert new entries
        self.insert_xp(id, name, xp)
        for character in characters:
            if character == None:
                continue
            score = calculate_character_score(character)
            c_name = character.get('full_name', 'Unnamed')
            c_name = f"{name}'s {c_name}"
            self.insert_character(id, c_name, score, character)

    def insert_xp(self, id, name, xp):
        xp_entry = XPEntry(id, name, xp)

        # check if not full or last entry is lower
        if len(self.xp_highscores) < self.MAX_HIGHSCORES or self.xp_highscores[-1].xp < xp:
            self.xp_highscores.append(xp_entry)
            self.xp_highscores.sort(key=lambda x: x.xp, reverse=True)
            self.xp_highscores = self.xp_highscores[:self.MAX_HIGHSCORES]

    def insert_character(self, id, name, score, character):
        character_entry = CharacterEntry(id, name, score, character)

        # check if not full or last entry is lower
        if len(self.character_highscores) < self.MAX_HIGHSCORES or self.character_highscores[-1].score < score:
            self.character_highscores.append(character_entry)
            self.character_highscores.sort(key=lambda x: x.score, reverse=True)
            self.character_highscores = self.character_highscores[:self.MAX_HIGHSCORES]

    def get_xp_highscores(self):
        # return in format [{'name': 'playername', 'score': 1234}, ...]
        return [{'name': x.name, 'score': x.xp} for x in self.xp_highscores]
    
    def get_character_highscores(self):
        # return in format [{'name': 'playername', 'score': 1234, 'character': {...}}, ...]
        return [{'name': x.name, 'score': x.score, 'character': x.character} for x in self.character_highscores]



