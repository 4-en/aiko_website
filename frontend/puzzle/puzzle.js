let image_path = "image.jpg";
const puzzle_root = document.getElementById("puzzle");
const puzzle_size = 5;
let start_time = -1;
let end_time = -1;
let moves = 0;
let best = 0;
let tile_order = [];
let elements = [];

let tiles = new Array(puzzle_size * puzzle_size);
let image = new Image();
let empty_tile = puzzle_size * puzzle_size - 1;

let saved = JSON.parse(localStorage.getItem("puzzle_data"));
if(saved !== null) {
    best = saved.best;
}

const image_paths = [
    "image.jpg",
    "qrcode.png",
    "ayaya.png",
    "forsenE.png",
    "仙狐.jpg",
    "og_featured-flamewreathedfaceless.jpg",
    "vol9.jpg"
];

function reset() {

    puzzle_root.innerHTML = "";

    image_path = image_paths[Math.floor(Math.random() * image_paths.length)];
    start_time = -1;
    moves = 0;
    tiles = new Array(puzzle_size * puzzle_size);
    image = new Image();
    image.src = image_path;
    empty_tile = puzzle_size * puzzle_size - 1;
    elements = [];
    tile_order = [];

    for (let i = 0; i < puzzle_size; i++) {
        tile_order.push([]);
        for (let j = 0; j < puzzle_size; j++) {
            tile_order[i].push(i * puzzle_size + j);
        }
    }

    image.onload = () => {
        const tile_width = image.width / puzzle_size;
        const tile_height = image.height / puzzle_size;
        const canvas = document.createElement("canvas");
        canvas.width = tile_width;
        canvas.height = tile_height;
        const ctx = canvas.getContext("2d");
        for (let i = 0; i < puzzle_size; i++) {
            for (let j = 0; j < puzzle_size; j++) {
                // crop new image
                ctx.drawImage(image, j * tile_width, i * tile_height, tile_width, tile_height, 0, 0, tile_width, tile_height);
                const tile = canvas.toDataURL();
                tiles[i * puzzle_size + j] = tile;
            }
        }
    
        main();
    };
}

function on_completed() {

    
    set_completed_image();

    for(let element of elements) {
        element.onclick = null;
        element.classList.remove("clickable");
    }

    end_time = Date.now();

    if(end_time-start_time < best || best === 0) {
        best = end_time-start_time;
    }

    localStorage.setItem('puzzle_data', JSON.stringify({
        best: best
    }));

}

function shuffle(array, shuffles = 100) {
    if (shuffles <= 0) {
        return array;
    }
    const row_col = position_to_row_col(empty_tile);
    let possible_moves = [[row_col[0] - 1, row_col[1]], [row_col[0] + 1, row_col[1]], [row_col[0], row_col[1] - 1], [row_col[0], row_col[1] + 1]];
    // remove invalid moves
    possible_moves = possible_moves.filter(move => move[0] >= 0 && move[0] < puzzle_size && move[1] >= 0 && move[1] < puzzle_size);

    const move = possible_moves[Math.floor(Math.random() * possible_moves.length)];
    const new_empty_tile = move[0] * puzzle_size + move[1];
    const row_col1 = position_to_row_col(empty_tile);
    const row_col2 = move;
    const temp = array[row_col1[0]][row_col1[1]];
    array[row_col1[0]][row_col1[1]] = array[row_col2[0]][row_col2[1]];
    array[row_col2[0]][row_col2[1]] = temp;
    empty_tile = new_empty_tile;
    return shuffle(array, shuffles - 1);
}

function set_tile_position(tile, position) {
    tile.dataset.position = position;
    tile.style.left = `${(position % puzzle_size) * (100 / puzzle_size)}%`;
    tile.style.top = `${Math.floor(position / puzzle_size) * (100 / puzzle_size)}%`;
}

function swap_tiles(tile1, tile2) {
    let row_col1 = position_to_row_col(tile1.dataset.position);
    let row_col2 = position_to_row_col(tile2.dataset.position);

    tile_order[row_col1[0]][row_col1[1]] = parseInt(tile2.dataset.tile);
    tile_order[row_col2[0]][row_col2[1]] = parseInt(tile1.dataset.tile);

    const temp_position = tile1.dataset.position;
    set_tile_position(tile1, tile2.dataset.position);
    set_tile_position(tile2, temp_position);

    if (tile1.classList.contains("empty")) {
        empty_tile = parseInt(tile1.dataset.position);
    }
    if (tile2.classList.contains("empty")) {
        empty_tile = parseInt(tile2.dataset.position);
    }
}

function check_win() {
    for (let i = 0; i < puzzle_size * puzzle_size; i++) {
        if (tile_order[Math.floor(i / puzzle_size)][i % puzzle_size] !== i) {
            return false;
        }
    }
    return true;
}

function set_completed_image() {
    let img = document.createElement("img");
    img.src = image_path;
    img.classList.add("solved-img");
    puzzle_root.innerHTML = "";
    puzzle_root.appendChild(img);
}

function add_click_to_tiles() {

    const row_col = position_to_row_col(empty_tile);
    let possible_moves = [[row_col[0] - 1, row_col[1]], [row_col[0] + 1, row_col[1]], [row_col[0], row_col[1] - 1], [row_col[0], row_col[1] + 1]];
    // remove invalid moves
    possible_moves = possible_moves.filter(move => move[0] >= 0 && move[0] < puzzle_size && move[1] >= 0 && move[1] < puzzle_size);

    let empty_element = null;
    for (let element of elements) {
        if (parseInt(element.dataset.position) === empty_tile) {
            empty_element = element;
            break;
        }
    }

    for (let element of elements) {

        let i = Math.floor(element.dataset.position / puzzle_size);
        let j = element.dataset.position % puzzle_size;

        element.onclick = null;

        if (!possible_moves.some(move => move[0] === i && move[1] === j)) {
            element.classList.remove("clickable");
            continue;
        }

        element.classList.add("clickable");

        element.onclick = () => {
            if(start_time === -1) {
                start_time = Date.now();
            }
            moves++;
            swap_tiles(element, empty_element);
            if (check_win()) {
                setTimeout(() => on_completed(), 500);
                // puzzle_root.classList.add("won");
            } else {
                add_click_to_tiles();
            }
        };


    }

}

function position_to_row_col(position) {
    return [Math.floor(position / puzzle_size), position % puzzle_size];
}


function main() {
    // create div elements for each tile
    tile_order = shuffle(tile_order, 128);

    for (let i = 0; i < puzzle_size; i++) {
        for (let j = 0; j < puzzle_size; j++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.style.width = `${100 / puzzle_size}%`;
            tile.style.height = `${100 / puzzle_size}%`;

            if (tile_order[i][j] === puzzle_size * puzzle_size - 1) {
                tile.classList.add("empty");
                empty_tile = i * puzzle_size + j;
            }

            const img = document.createElement("img");
            img.src = tiles[tile_order[i][j]];
            tile.appendChild(img);
            puzzle_root.appendChild(tile);

            // add metadata to each tile
            tile.dataset.position =  i * puzzle_size + j;
            tile.dataset.tile = tile_order[i][j];

            // set tile position
            set_tile_position(tile, i * puzzle_size + j);

            elements.push(tile);
        }
    }

    elements = elements.sort((a, b) => parseInt(a.dataset.position) - parseInt(b.dataset.position));

    add_click_to_tiles();

}

const time_ui = document.getElementById("time");
const move_ui = document.getElementById("moves");
const reset_ui = document.getElementById("reset");
const best_ui = document.getElementById("best");
reset_ui.addEventListener("click", ()=> reset());
function update_ui() {
    let timePassed = 0;
    if(start_time >=0) {
        timePassed = Date.now() - start_time;
    }
    
    if(end_time === -1)
        time_ui.innerText = Math.floor(timePassed / 1000) + "s";
    best_ui.innerText = Math.floor(best / 1000) + "s";
    move_ui.innerText = moves;

    requestAnimationFrame(update_ui)
}

update_ui();

reset();