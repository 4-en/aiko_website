const BACKEND_URL = "http://localhost:8000";

// Redirect user to login with Discord and remember the original page
function login() {
    const currentPage = window.location.pathname;
    window.location.href = `${BACKEND_URL}/login?redirect=${encodeURIComponent(currentPage)}`;
}

// Check if the user is logged in
async function checkLogin() {
    try {
        const response = await fetch(`${BACKEND_URL}/user`, { credentials: "include" });

        if (response.ok) {
            document.getElementById("status").innerText = "You are logged in!";
            loadUserData();
        } else {
            window.location.href = "/";  // Redirect to home if not logged in
        }
    } catch (error) {
        console.error("Error checking login:", error);
        window.location.href = "/";
    }
}

// Save data for the logged-in user
async function storeData() {
    const data = document.getElementById("data-input").value;
    
    try {
        const response = await fetch(`${BACKEND_URL}/store`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ data })
        });

        if (response.ok) {
            document.getElementById("save-status").innerText = "✅ Data saved!";
            loadUserData();
        } else {
            document.getElementById("save-status").innerText = "❌ Failed to save data.";
        }
    } catch (error) {
        console.error("Error saving data:", error);
        document.getElementById("save-status").innerText = "❌ Error saving data.";
    }
}

// Load saved data for the user
async function loadUserData() {
    try {
        const response = await fetch(`${BACKEND_URL}/user`, { credentials: "include" });
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById("stored-data").innerText = JSON.stringify(data.data, null, 2);
        } else {
            document.getElementById("stored-data").innerText = "No data found.";
        }
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById("stored-data").innerText = "Error loading data.";
    }
}

// Logout user and clear session
async function logout() {
    await fetch(`${BACKEND_URL}/logout`, { credentials: "include" });
    window.location.href = "/";
}

// Auto-check login on the dashboard page
if (window.location.pathname === "/dashboard.html") {
    checkLogin();
}
