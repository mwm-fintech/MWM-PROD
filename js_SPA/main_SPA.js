/**
 * MWM: Global UI & Identity Engine
 */

// 1. GLOBAL SWITCH VIEW
window.switchView = (viewId) => {
        const sections = document.querySelectorAll('.view-section');
        
        // Ensure ID mapping handles suffixes correctly
        const targetId = viewId.endsWith('-view') ? viewId : `${viewId}-view`;

        sections.forEach(section => {
            section.classList.remove('active');
            section.style.setProperty('display', 'none'); // Reset manual overrides

            if (section.id === targetId) {
                section.classList.add('active');
                section.style.setProperty('display', 'block');
            }
        });

        console.log("SwitchView logic executed for:", targetId);

        // Notify 7_Navigation.js / Sliders
        if (typeof showSection === 'function') {
            const cleanId = viewId.replace('-view', '');
            showSection(cleanId);
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

