/**
 * MWM: Global UI & Identity Engine
 */

// 1. GLOBAL SWITCH VIEW
window.switchView = function(viewId) {
    console.log("Switched to:", viewId);
    const sections = document.querySelectorAll('.view-section');
    const targetId = viewId.endsWith('-view') ? viewId : `${viewId}-view`;

    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = ''; 
        if (section.id === targetId) {
            section.classList.add('active');
        }
    });

    if (typeof showSection === 'function') {
        showSection(viewId.replace('-view', ''));
    }
};

// 2. GLOBAL TRANSLATIONS
window.applyTranslations = function(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (window.translations && window.translations[lang] && window.translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = window.translations[lang][key];
            } else {
                el.innerHTML = window.translations[lang][key];
            }
        } else {
            console.warn(`MWM Translation: Key "${key}" not found for language "${lang}".`);
        }
    });
};

// 3. DRAWER LOGIC
window.toggleDrawer = function(drawerId, event) {
    if (event) event.stopPropagation();
    const drawer = document.getElementById(drawerId);
    if (drawer) {
        drawer.classList.toggle('expanded');
    }
};

// 4. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    const langSelector = document.getElementById('language-selector');
    if (langSelector) {
        const savedLang = localStorage.getItem('selectedLanguage') || 'en';
        langSelector.value = savedLang;
        window.applyTranslations(savedLang);

        langSelector.addEventListener('change', (e) => {
            const newLang = e.target.value;
            window.applyTranslations(newLang);
            localStorage.setItem('selectedLanguage', newLang);
        });
    }
});
