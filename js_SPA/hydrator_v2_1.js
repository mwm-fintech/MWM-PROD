/**
 * MWM Hydrator: Universal Key-Matching Orchestrator
 * Specifically handles root-level (diy-ui) and modular (mwa_1_...) naming conventions.
 */
window.Hydrator = {
    package: null,

    unpack: function(uiPackage) {
        this.package = uiPackage;
        sessionStorage.setItem('mwm_ui_package', JSON.stringify(uiPackage));

        const adminLink = document.getElementById('admin-nav-item');
        const hasAdmin = this.package['admin_admin_html'] || 
                         this.package['admin_index_html'] || 
                         this.package['admin_html'];
        
        if (adminLink && hasAdmin) adminLink.style.display = 'block';

        this.updateNavStatus(true);
        this.initGlobalNavigation();
    },

    renderHome: function() { window.location.href = 'index.html'; },

    initGlobalNavigation: function() {
        const handleClicks = (e) => {
            const anchor = e.target.closest('a');
            if (!anchor) return;
            const dataView = anchor.getAttribute('data-view');
            if (dataView || anchor.getAttribute('href') === '#') {
                if (dataView === 'home' || anchor.classList.contains('nav-home')) {
                    e.preventDefault();
                    this.renderHome();
                    return;
                }
                if (dataView) {
                    e.preventDefault();
                    this.handleProtectedNavigation(dataView);
                }
            }
        };
        document.removeEventListener('click', handleClicks);
        document.addEventListener('click', handleClicks);
    },

    handleProtectedNavigation: function(viewPrefix) {
        const prefix = viewPrefix.toLowerCase();
        if (!this.package) {
            const saved = sessionStorage.getItem('mwm_ui_package');
            if (saved) this.package = JSON.parse(saved);
        }
        if (!this.package) {
            window.location.href = './login_SPA/index_SPA.html';
            return;
        }
        this.renderView(prefix);
    },

renderView: function(prefix) {
    const stage = document.getElementById('main-content-area');
    if (!stage) return;

    // 1. RE-SYNC
    const saved = sessionStorage.getItem('mwm_ui_package');
    if (!saved) { window.location.href = './login_SPA/index_SPA.html'; return; }
    this.package = JSON.parse(saved);

    const p = prefix.toLowerCase();
    console.log(`!!! HYDRATOR 2.1 IN ACTION - Target: ${p} !!!`);
    
    // 2. HTML SELECTION
    const authHtml = this.package[`${p}_${p}_html`] || this.package[`${p}_index_html`] || this.package[`${p}_html`];
    const blockHtml = this.package['blockade_blocked_content_html'];
    const activeHtml = authHtml || blockHtml;

    if (!activeHtml) {
        stage.innerHTML = `<div style="padding:50px; text-align:center;"><h2>Access Restricted</h2></div>`;
        return;
    }

    // 3. ASSET COLLECTION
    let combinedJs = "";
    let combinedCss = "";
    const includedKeys = []; // For debugging

    // We use a case-insensitive check and trim to be safe
    Object.keys(this.package).sort().forEach(key => {
        const k = key.toLowerCase().trim();
        
        // Match if it starts with 'common_' OR the current prefix
        if (k.startsWith('common_') || k.startsWith(`${p}_`)) {
            includedKeys.push(key); // Track what we found
            
            if (k.endsWith('_js')) {
                combinedJs += `\n/* --- START: ${key} --- */\n;${this.package[key]};\n`;
            }
            if (k.endsWith('_css') || k.includes('_style')) {
                combinedCss += `\n${this.package[key]}\n`;
            }
        }
    });

    // DEBUG TABLE: This will show us exactly what got injected
    console.table(includedKeys.map(k => ({ Asset: k, Type: k.endsWith('_js') ? 'JS' : 'CSS/HTML' })));

    // 4. INJECT
    this.injectContent(stage, activeHtml, combinedJs, combinedCss);
},
    
    injectContent: function(stage, html, js, css) {
        const oldStyle = document.getElementById('mwm-dynamic-style');
        if (oldStyle) oldStyle.remove();

        if (css) {
            const style = document.createElement('style');
            style.id = 'mwm-dynamic-style';
            style.textContent = css;
            document.head.appendChild(style);
        }

        stage.innerHTML = html;

        if (js) {
            try {
                // Remove previous dynamic scripts to prevent memory leaks/conflicts
                const oldScript = document.getElementById('mwm-dynamic-script');
                if (oldScript) oldScript.remove();
                
                const script = document.createElement('script');
                script.id = 'mwm-dynamic-script';
                script.type = 'module';    // added to manage import function for files importing config.js
                script.textContent = js;
                document.body.appendChild(script);
                // document.body.removeChild(script);    // removed to avoid interrupting the execution in certain browsers
            } catch (e) {
                console.error("MWM: Script injection failed:", e);
            }
        }

        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        if (window.applyTranslations) window.applyTranslations(currentLang);

        // We try to switchView using the current prefix. 
        // We look for [prefix]-section (like follow-section) 
        // or [prefix]-view (like quantitative-view)
        if (window.switchView) {
            // This is smart: it tries to find the ID based on the content just injected
            const activeView = stage.querySelector('.view-section');
            if (activeView && activeView.id) {
                window.switchView(activeView.id);
            }
        }
        
        window.scrollTo(0, 0);
    },

    updateNavStatus: function(isLoggedIn) {
        const authLink = document.getElementById('auth-action-link');
        if (!authLink) return;
        if (isLoggedIn) {
            authLink.innerText = "Logout";
            authLink.onclick = (e) => {
                e.preventDefault();
                sessionStorage.clear();
                window.location.reload();
            };
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const saved = sessionStorage.getItem('mwm_ui_package');
    if (saved) window.Hydrator.unpack(JSON.parse(saved));

});












