// a collection of shared functions

const API_URL = 'https://api.aiko.lol';


async function is_logged_in(full_check=false) {

    let user = null;
    if(full_check) {
        user = await get_user();
        if (user === null) {
            return false;
        }
        if (user.logged_in === false) {
            return false;
        }
        return true;
    }

    // check if user is logged in
    // get user data from local storage
    user = JSON.parse(localStorage.getItem('user'));
    if(user === null) {
        // if no user data, get user data from api
        user = await get_user();
    }

    // check if user is logged in
    if(user === null) {
        return false;
    } else {
        return user.logged_in;
    }
    
}

function is_logged_in_sync() {
    // check if user is logged in
    // get user data from local storage
    let user = JSON.parse(localStorage.getItem('user'));
    if(user === null) {
        return false;
    }

    // check if user is logged in
    if(user.logged_in === false) {
        return false;
    } else {
        return true;
    }
}

function get_username() {
    let user = JSON.parse(localStorage.getItem('user'));
    if(user === null) {
        return null;
    }

    return user.username;
}

async function get_user() {
    // get user data from api
    let response = null;
    try {
        response = await fetch(`${API_URL}/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        let code = response.status;
        if(code === 401) {
            // if not logged in, return null
            localStorage.setItem('user', JSON.stringify({logged_in: false}));
            return null;
        }

        let data = await response.json();

        // update local storage
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function login(redirect=null) {
    // login function
    // go to api login endpoint for login via discord OAuth2
    if(redirect === null) {
        window.location.href = `${API_URL}/login`;
    } else {
        window.location.href = `${API_URL}/login?redirect=${redirect}`;
    }
}

function login_button_setup() {
    // setup login button
    let login_button = document.getElementById('login-button');
    if (login_button === null) {
        return;
    }
    let current_page = window.location.href;
    let redirect = current_page.split('/').pop();
    let logged_in_fast = is_logged_in_sync();

    if(logged_in_fast) {
        // if user is already logged in, set text to username
        let current_user = get_username();
        login_button.innerText = current_user;
    } else {
        login_button.innerText = 'Login';
        login_button.onclick = () => login(redirect);
    }

    // do better check when fully loaded
    async function check_login() {
        let logged_in = await is_logged_in(true);
        if(logged_in) {
            login_button.innerText = get_username();
            button.onclick = () => window.location.href = '/profile';
        } else {
            login_button.innerText = 'Login';
            login_button.onclick = () => login(redirect);
        }
    }

    window.onload = check_login;
}

login_button_setup();