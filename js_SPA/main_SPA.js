/**
 * MWM: Global UI & Identity Engine
 */

window.applyTranslations = function(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        if (window.translations && window.translations[lang] && window.translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = window.translations[lang][key];
            } else {
                element.innerHTML = window.translations[lang][key];
            }
        } else {
            console.warn(`MWM Translation: Key "${key}" not found for language "${lang}".`);
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Language Logic
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

    // 2. Swapping views logic (Internal navigation)
    window.switchView = (viewId) => {
        const sections = document.querySelectorAll('.view-section');
        
        // Ensure ID mapping handles suffixes correctly
        const targetId = viewId.endsWith('-view') ? viewId : `${viewId}-view`;

        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = ''; 

            if (section.id === targetId) {
                section.classList.add('active');
            }
        });

        console.log("SwitchView logic executed for:", targetId);

        if (typeof showSection === 'function') {
            const cleanId = viewId.replace('-view', '');
            showSection(cleanId);
        }
    };

    // 3. Drawer Logic
    window.toggleDrawer = (drawerId, event) => {
        if (event) event.stopPropagation();
        const drawer = document.getElementById(drawerId);
        if (!drawer) return;
        drawer.classList.toggle('expanded');
    };
});
