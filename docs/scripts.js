// a collection of shared functions

const API_URL = 'https://api.aiko.lol';

function get_session_token() {
    // get session_token from cookies
    let token = '';
    document.cookie.split(';').forEach((item) => {
        if(item.trim().startsWith('session_token=')) {
            token = item.trim().split('=')[1];
        }
    });
    return token;
}

function is_logged_in() {
    // check if session_token is set in cookies
    return document.cookie.split(';').some((item) => item.trim().startsWith('session_token='));
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