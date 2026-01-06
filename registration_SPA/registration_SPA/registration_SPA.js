// registration_SPA.js
console.log("DEBUG: JS LOADED - VERSION 1.2 (Absolute URL Fix)");

const form = document.getElementById('registrationForm');
const statusMsg = document.getElementById('statusMessage');

// WE MUST USE PORT 8000 FOR THE API
const API_BASE_URL = "https://mwm-iam.onrender.com"; 

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const getMsg = (key) => (typeof t === 'function' ? t(key) : key);
    
    const formData = {
        token: document.getElementById('token').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirm: document.getElementById('confirmPassword').value
    };

    if (formData.password !== formData.confirm) {
        statusMsg.innerText = getMsg("err_match");
        statusMsg.className = "status-display error";
        return;
    }

    if (formData.password.length < 8) {
        statusMsg.innerText = getMsg("err_length");
        statusMsg.className = "status-display error";
        return;
    }

    statusMsg.innerText = getMsg("status_checking");
    statusMsg.className = "status-display";

    try {
        // NOTICE: This MUST start with http://127.0.0.1:8000
        const targetUrl = `${API_BASE_URL}/auth/register`;
        console.log("DEBUG: Sending POST to:", targetUrl);

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activation_token: formData.token,
                email: formData.email,
                password: formData.password
            })
        });

        if (response.ok) {
            statusMsg.innerText = getMsg("status_success");
            statusMsg.className = "status-display success";
            setTimeout(() => window.location.href = '../login_SPA/index_SPA.html', 2000);
        } else {
            const err = await response.json();
            statusMsg.innerText = err.detail || getMsg("err_general");
            statusMsg.className = "status-display error";
        }
    } catch (error) {
        console.error("DEBUG: FETCH FAILED!", error);
        statusMsg.innerText = getMsg("err_server");
        statusMsg.className = "status-display error";
    }
});

// Language Select Sync
const langSelector = document.getElementById('language-selector');
if (langSelector) {
    langSelector.addEventListener('change', (e) => {
        localStorage.setItem('selectedLanguage', e.target.value);
        location.reload(); 
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    const selector = document.getElementById('language-selector');
    if (selector) selector.value = savedLang;
    if (window.applyLoginTranslations) window.applyLoginTranslations();
});