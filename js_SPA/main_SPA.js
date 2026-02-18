/**
 * MWM: Global UI & Identity Engine
 */

// 1. Define switchView immediately on the window object
window.switchView = function(viewId) {
    console.log("Global Switch Triggered:", viewId);
    
    if (!viewId) return;

    const sections = document.querySelectorAll('.view-section');
    const targetId = viewId.endsWith('-view') ? viewId : viewId + '-view';

    sections.forEach(function(section) {
        section.classList.remove('active');
        // Clear manual overrides to let CSS handle it
        section.style.display = ''; 

        if (section.id === targetId) {
            section.classList.add('active');
        }
    });

    // Notify external scripts
    if (typeof showSection === 'function') {
        const cleanId = viewId.replace('-view', '');
        showSection(cleanId);
    }
};

// 2. Define toggleDrawer
window.toggleDrawer = function(drawerId, event) {
    if (event) event.stopPropagation();
    const drawer = document.getElementById(drawerId);
    if (drawer) drawer.classList.toggle('expanded');
};

// 3. Define Translation Engine
window.applyTranslations = function(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(function(el) {
        const key = el.getAttribute('data-i18n');
        if (window.translations && window.translations[lang] && window.translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = window.translations[lang][key];
            } else {
                el.innerHTML = window.translations[lang][key];
            }
        }
    });
};

// 4. Initialize on Load
document.addEventListener('DOMContentLoaded', function() {
    const langSelector = document.getElementById('language-selector');
    if (langSelector) {
        const savedLang = localStorage.getItem('selectedLanguage') || 'en';
        langSelector.value = savedLang;
        window.applyTranslations(savedLang);

        langSelector.addEventListener('change', function(e) {
            const newLang = e.target.value;
            window.applyTranslations(newLang);
            localStorage.setItem('selectedLanguage', newLang);
        });
    }
});

