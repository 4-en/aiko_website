import random

stats = {
    "agility": 1,
        "strength": 1,
        "woodcutting": 1,
        "luck": 12,
        "tick_manipulation": 5,
        "range": 1,
        "learning_rate": 30,
        "farming": 25,
        "trading": 21
}

MAX_STAT = 99
UBER_TOTAL = len(stats) * 70
PSEUDO_TOTAL = len(stats) * 60
VERY_GOOD_TOTAL = len(stats) * 50
GOOD_TOTAL = len(stats) * 40
OKAY_TOTAL = len(stats) * 30
BAD_TOTAL = len(stats) * 20
TRASH_TOTAL = len(stats) * 10

MAX_WEIGHT = 1000
MIN_WEIGHT = 1

def weight_to_total(weight):
    weight = max(MIN_WEIGHT, weight)
    weight = min(MAX_WEIGHT, weight)

    total = 0
    if weight < 20:
        total = UBER_TOTAL
    elif weight < 50:
        total = PSEUDO_TOTAL
    elif weight < 100:
        total = VERY_GOOD_TOTAL
    elif weight < 200:
        total = GOOD_TOTAL
    elif weight < 400:
        total = OKAY_TOTAL
    elif weight < 800:
        total = BAD_TOTAL
    else:
        total = TRASH_TOTAL

    total = total + total // 5 * (random.random() - 0.5)
    return int(total)

def smooth_weight_to_total(weight):
    weight = max(MIN_WEIGHT, weight)
    weight = min(MAX_WEIGHT, weight)

    total = 0
    threshholds = [
        (0, UBER_TOTAL),
        (50, PSEUDO_TOTAL),
        (100, VERY_GOOD_TOTAL),
        (200, GOOD_TOTAL),
        (400, OKAY_TOTAL),
        (600, BAD_TOTAL)
    ]
    threshholds = reversed(threshholds)
    lower = UBER_TOTAL
    lower_weight = 0
    upper = TRASH_TOTAL
    upper_weight = 700
    for thresh, total in threshholds:
        if weight <= thresh:
            upper = total
            upper_weight = thresh
        if weight > thresh:
            lower = total
            lower_weight = thresh
            break

    diff = lower - upper
    weight_diff = lower_weight - upper_weight
    this_weight_diff = weight - upper_weight
    if this_weight_diff == 0:
        return upper
    total = upper + diff * (this_weight_diff / weight_diff)
    

    return total

def generate_stats(weight):
    total = smooth_weight_to_total(weight)
    stats = {
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

    spend_points = 0
    while total - spend_points > 1:
        stat = random.choice(list(stats.keys()))
        points_to_spend = random.randint(1, int((total - spend_points)/20 + 5))
        points_to_spend = min(points_to_spend, total - spend_points)
        points_to_spend = min(points_to_spend, MAX_STAT - stats[stat])
        stats[stat] += points_to_spend
        spend_points += points_to_spend


    return stats

def print_stats(stats):
    for stat, value in stats.items():
        print(f"\"{stat}\": {value},")

if __name__ == "__main__":
    weight = 160
    while True:
        weight = int(input("Enter weight: "))
        stats = generate_stats(weight)
        print_stats(stats)
        # print(smooth_weight_to_total(weight))