/**
 * MWM: Global UI & Identity Engine
 */

// 1. Define switchView immediately on the window object
window.switchView = function(viewId) {
    // 1. Remove 'active' class from ALL sections
    document.querySelectorAll('.view-section').forEach(s => {
        s.classList.remove('active');
        s.style.setProperty('display', 'none', 'important');
    });

    // 2. Resolve the target ID
    let targetId = viewId.includes('-view') ? viewId : viewId + '-view';
    let target = document.getElementById(targetId) || document.getElementById(viewId);

    if (target) {
        // 3. Add 'active' to the target + visibility to actually show the content
        target.classList.add('active');
        target.style.setProperty('display', 'block', 'important');
        console.log("Switched to " + target.id);

        // 4. Handle Scroll Logic
        if (viewId.includes('selection') || target.id.includes('selection-view')) {
            document.body.classList.remove('view-scrollable');
            document.body.classList.add('fixed-view');
            window.scrollTo(0, 0);
        } else {
            document.body.classList.remove('fixed-view');
            document.body.classList.add('view-scrollable');
            // Ensure we start at the top of the new tool
            window.scrollTo(0, 0);
        }

        /// 5. MWA SPECIAL HANDSHAKE
        // Check local scope OR window scope for showSection
        const triggerNav = window.showSection || (typeof showSection === 'function' ? showSection : null);
        
        if (viewId === 'awareness' && triggerNav) {
            triggerNav('awareness');
        }
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



