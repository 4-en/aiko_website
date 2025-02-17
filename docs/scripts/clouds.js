function create_cloud_svg() {
    /*
     * Creates a stylized anime cloud svg
     * (wide rectangles with rounded corners stacked on top of each other)
     */

    const min_layers = 2;
    const max_layers = 4;
    const n_layers = Math.floor(Math.random() * (max_layers - min_layers + 1)) + min_layers;
    const layer_height = 1;
    const min_width = 3 + 1.5 * n_layers;
    const max_width = 15 + 1.5 * n_layers;
    const min_neg_width = 2;
    const max_neg_width = 5;
    const buffer = 0.7 * layer_height;

    
    
    // create layers by defining left and right points
    let layers = [];

    let is_positive = true;
    let last_left = 0;
    let last_right = 0;

    for (let i = 0; i < n_layers * 2 - 1; i++) {
        let width = 0;
        let left = 0;
        let right = 0;
        if(!is_positive) {
            let true_max_neg_width = Math.min(max_neg_width, last_right - last_left);
            width = Math.random() * (true_max_neg_width - min_neg_width + 1) + min_neg_width;
            let min_left = last_left + buffer;
            let max_left = last_right - width - buffer;
            left = Math.random() * (max_left - min_left + 1) + min_left;
            right = left + width;
        } else {
            let true_min = Math.max(min_width, last_right - last_left);
            width = Math.random() * (max_width - true_min + 1) + true_min;
            let max_left = last_left - buffer;
            let min_left = last_right - width + buffer;
            left = Math.random() * (max_left - min_left + 1) + min_left;
            right = left + width;
        }


        layers.push([left, right]);
        last_left = left;
        last_right = right;
        is_positive = !is_positive;
    }

    let min_left = Math.min(...layers.map(layer => layer[0]));
    let max_right = Math.max(...layers.map(layer => layer[1]));
    max_right -= min_left;
    for (let i = 0; i < layers.length; i++) {
        layers[i][0] -= min_left - 1;
        layers[i][1] -= min_left - 1;
    }

    max_right += 2;

    // create svg
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '512px');
    svg.setAttribute('height', '512px');
    svg.setAttribute('viewBox', '0 0 ' + max_right + ' ' + n_layers * layer_height);

    // create layers
    is_positive = false;

    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let path_str = ''
    // bezier offset for half circle
    const bezier_offset = 0.8;
    path_str += 'M ' + layers[0][1] + ' 0 ';
    path_str += 'C ' + (layers[0][1] + bezier_offset) + ' 0 ' + (layers[0][1] + bezier_offset) + ' ' + layer_height + ' ' + layers[0][1] + ' ' + layer_height + ' ';
    //path_str += 'L ' + layers[0][1] + ' ' + layer_height + ' ';
    // draw right side of cloud
    for (let i = 1; i < layers.length; i++) {

        let cloud_top = layer_height * i;
        let cloud_bottom = layer_height * (i + 1);
        
        if (is_positive) {
            // draw half circle from top right to bottom right
            path_str += 'L ' + layers[i][1] + ' ' + cloud_top + ' ';
            path_str += 'C ' + (layers[i][1] + bezier_offset) + ' ' + cloud_top + ' ' + (layers[i][1] + bezier_offset) + ' ' + cloud_bottom + ' ' + layers[i][1] + ' ' + cloud_bottom + ' ';
            //path_str += 'L ' + layers[i][1] + ' ' + cloud_bottom + ' ';
        } else {
            // draw half circle from top left to bottom left
            path_str += 'L ' + layers[i][1] + ' ' + cloud_top + ' ';
            path_str += 'C ' + (layers[i][1] - bezier_offset) + ' ' + cloud_top + ' ' + (layers[i][1] - bezier_offset) + ' ' + cloud_bottom + ' ' + layers[i][1] + ' ' + cloud_bottom + ' ';
            //path_str += 'L ' + layers[i][1] + ' ' + cloud_bottom + ' ';
        }
        is_positive = !is_positive;
    }

    // draw left side of cloud
    for (let i = layers.length - 1; i >= 0; i--) {

        let cloud_top = layer_height * i;
        let cloud_bottom = layer_height * (i + 1);
        
        if (is_positive) {
            // draw half circle from top right to bottom right
            path_str += 'L ' + layers[i][0] + ' ' + cloud_bottom + ' ';
            path_str += 'C ' + (layers[i][0] + bezier_offset) + ' ' + cloud_bottom + ' ' + (layers[i][0] + bezier_offset) + ' ' + cloud_top + ' ' + layers[i][0] + ' ' + cloud_top + ' ';
            //path_str += 'L ' + layers[i][0] + ' ' + cloud_top + ' ';
        } else {
            // draw half circle from top left to bottom left
            path_str += 'L ' + layers[i][0] + ' ' + cloud_bottom + ' ';
            path_str += 'C ' + (layers[i][0] - bezier_offset) + ' ' + cloud_bottom + ' ' + (layers[i][0] - bezier_offset) + ' ' + cloud_top + ' ' + layers[i][0] + ' ' + cloud_top + ' ';
            // path_str += 'L ' + layers[i][0] + ' ' + cloud_top + ' ';
        }
        is_positive = !is_positive;
    }


    // fill the path
    path_str += 'Z';
    path.setAttribute('d', path_str);
    path.setAttribute('fill', 'white');
    svg.appendChild(path);

    return svg;

}

var cloud_color = [ 255, 255, 255 ];
var sky_color = [ 135, 206, 235 ];

function interpolate_color(color1, color2, t) {
    let color = [];
    for (let i = 0; i < 3; i++) {
        color.push(Math.floor(color1[i] * (1 - t) + color2[i] * t));
    }
    return 'rgb(' + color.join(',') + ')';
}

function create_moving_cloud(offscreen=false) {
    let cloud = create_cloud_svg();
    let cloud_container = document.createElement('div');
    cloud_container.style.position = 'absolute';
    cloud_container.style.top = Math.random() * 100 + '%';
    cloud_container.style.left = offscreen ? '-30%' : "" + (Math.random() * 100) + '%';
    let cloud_distance = 10 + Math.random() * 50;
    let cloud_size = 0.5 + Math.random() * 1.5;
    let perspective_size = cloud_size * 10 / cloud_distance;
    let color_interpolation = Math.min(1, (cloud_distance - 10) / 70);
    let color = interpolate_color(cloud_color, sky_color, color_interpolation);
    // change svg color
    cloud.querySelector('path').setAttribute('fill', color);
    cloud.style.width = (perspective_size + 2 ) * 20 + '%';
    cloud_container.style.width = (perspective_size + 2 ) * 20 + '%';
    cloud_container.dataset.distance = cloud_distance;
    cloud_container.dataset.size = cloud_size;
    // z index
    cloud_container.style.zIndex = Math.floor(1 / cloud_distance * 1000 - 1000);

    cloud_container.appendChild(cloud);

    cloud_container.onclick = function() {
        cloud.remove();
        clouds.splice(clouds.indexOf(cloud_container), 1);
    }

    return cloud_container;
}

var sky = null;
var clouds = [];
var wind_speed = 50;
var wind_direction = 1;
var n_clouds = 10;


// cloud loop
var last_t = 0;
function move_clouds() {
    let t = performance.now();
    let dt = (t - last_t) / 1000;
    last_t = t;

    if(dt>0.1) {
        dt = 0.1;
    }

    for (let i = 0; i < clouds.length; i++) {
        let cloud = clouds[i];
        let distance = parseFloat(cloud.dataset.distance);
        let size = parseFloat(cloud.dataset.size);
        let left = parseFloat(cloud.style.left);
        left += wind_speed * wind_direction / distance * dt;
        if (left > 100) {
            left = -20;
            cloud.remove();
            clouds[i] = create_moving_cloud(true);
            sky.appendChild(clouds[i]);
        }
        cloud.style.left = left + '%';
    }

    while (clouds.length < n_clouds) {
        let cloud = create_moving_cloud(true);
        clouds.push(cloud);
        sky.appendChild(cloud);
    }

    requestAnimationFrame(move_clouds);
}

function start_clouds(parent, near_color, far_color, n_clouds=10, wind_speedx=50) {
    sky = parent;

    // check if colors are string and convert to array
    if (typeof near_color === 'string') {
        if (near_color.startsWith('#')) {
            near_color = near_color.slice(1);
        }
        if (near_color.length === 3) {
            near_color = near_color.split('').map(c => parseInt(c + c, 16));
        } else if (near_color.length === 6) {
            near_color = near_color.match(/.{1,2}/g).map(c => parseInt(c, 16));
        } else if (near_color.length === 8) {
            near_color = near_color.match(/.{2}/g).map(c => parseInt(c, 16));
        }
    }

    if (typeof far_color === 'string') {
        if (far_color.startsWith('#')) {
            far_color = far_color.slice(1);
        }
        if (far_color.length === 3) {
            far_color = far_color.split('').map(c => parseInt(c + c, 16));
        } else if (far_color.length === 6) {
            far_color = far_color.match(/.{1,2}/g).map(c => parseInt(c, 16));
        } else if (far_color.length === 8) {
            far_color = far_color.match(/.{2}/g).map(c => parseInt(c, 16));
        }
    }

    cloud_color = near_color;
    sky_color = far_color;
    wind_speed = wind_speedx;
    n_clouds = n_clouds;

    // create initial clouds
    for (let i = 0; i < n_clouds; i++) {
        let cloud = create_moving_cloud();
        clouds.push(cloud);
        sky.appendChild(cloud);
    }

    move_clouds();
}