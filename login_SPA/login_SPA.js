/**
 * MWM: Login Controller (SPA Version)
 * Updated with enhanced redirect reliability.
 */
const form = document.getElementById('loginForm');
const statusMsg = document.getElementById('statusMessage');

// --- API CONFIGURATION ---
const API_BASE_URL = "https://mwm-iam.onrender.com"; 

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Helper for translations if t() exists
    const getMsg = (key) => (typeof t === 'function' ? t(key) : key);
    
    statusMsg.innerText = getMsg('status_logging_in');
    statusMsg.className = "status-display";

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            
            console.log("MWM: Login successful. Saving data to session storage...");

            // 1. Store the JWT in sessionStorage
            sessionStorage.setItem('mwm_auth_token', data.access_token);
            
            // 2. Store the UI Package for the Hydrator
            // Stringify and save - we use a slightly longer delay to ensure large strings (2KB+) commit
            sessionStorage.setItem('mwm_ui_package', JSON.stringify(data.ui_package));

            statusMsg.innerText = getMsg('status_success');
            statusMsg.className = "status-display success";
            
            // 3. Redirect to the SPA main index with a 2-second buffer
            // Using .replace instead of .href ensures the login page is replaced in history
            setTimeout(() => {
                console.log("MWM: Redirecting to Dashboard...");
                window.location.replace('../index.html');
            }, 2000);

        } else {
            statusMsg.innerText = getMsg('err_invalid_creds');
            statusMsg.className = "status-display error";
        }
    } catch (error) {
        console.error("MWM Login Error:", error);
        statusMsg.innerText = getMsg('err_server');
        statusMsg.className = "status-display error";
    }
});

// Language Selector Logic for the login page
const langSelector = document.getElementById('language-selector');
if (langSelector) {
    langSelector.addEventListener('change', (e) => {
        const lang = e.target.value;
        // Use mwm_lang for consistency with main_SPA.js
        localStorage.setItem('selectedLanguage', lang);
        location.reload(); 
    });
}

// Initialize language on load
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    const langSelector = document.getElementById('language-selector');
    if (langSelector) {
        langSelector.value = savedLang;
    }
});