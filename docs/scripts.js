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
    let response = await fetch(`${API_URL}/user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });
    let data = await response.json();

    // update local storage
    localStorage.setItem('user', JSON.stringify(data));
    return data;
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