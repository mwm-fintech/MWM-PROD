/**
 * MWM: Global UI & Identity Engine
 */

window.applyTranslations = (lang) => {
    if (typeof translations === 'undefined') return;
    const selectedTranslations = translations[lang] || translations['en'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (selectedTranslations[key]) { el.innerText = selectedTranslations[key]; }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Language Logic
    const langSelector = document.getElementById('language-selector');
    if (langSelector) {
        const savedLang = localStorage.getItem('mwm_lang') || 'en';
        langSelector.value = savedLang;
        window.applyTranslations(savedLang);

        langSelector.addEventListener('change', (e) => {
            const newLang = e.target.value;
            window.applyTranslations(newLang);
            localStorage.setItem('mwm_lang', newLang);
        });
    }

    // 2. Swapping views logic (Internal navigation)
    window.switchView = (viewId) => {
        const sections = document.querySelectorAll('.view-section');
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${viewId}-view`) {
                section.classList.add('active');
            }
        });

	// It tells 7_Navigation.js to initialize the sliders
    	if (typeof showSection === 'function') {
        showSection(viewId);
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