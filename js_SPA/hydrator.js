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

        const p = prefix.toLowerCase();

        // --- SAFETY SYNC ---
        // Ensure the package is loaded into the object even if a page refresh happened
        if (!this.package) {
            const saved = sessionStorage.getItem('mwm_ui_package');
            if (saved) {
                this.package = JSON.parse(saved);
            } else {
                console.error("MWM: No UI Package found in SessionStorage.");
                window.location.href = './login_SPA/index_SPA.html';
                return;
            }
        }
        
        // 1. Find HTML (Checks for mwa_mwa_html, mwa_index_html, or mwa_html)
        const htmlKey = this.package[`${p}_${p}_html`] || 
                        this.package[`${p}_index_html`] || 
                        this.package[`${p}_html`];

        // 2. UNIVERSAL JS COLLECTOR (For the requested feature)
        let combinedJs = "";
        let foundJsKeys = [];
        const sortedKeys = Object.keys(this.package).sort();

        sortedKeys.forEach(key => {
            const k = key.toLowerCase();
            if (k.startsWith(`${p}_`) && k.endsWith('_js')) {
                foundJsKeys.push(key);
                combinedJs += `\n;/* Source: ${key} */\n${this.package[key]};\n`;
            }
        });
                                    
        // 3. UNIVERSAL CSS COLLECTOR (For the requested feature)
        let combinedCss = "";
        sortedKeys.forEach(key => {
            const k = key.toLowerCase();
            if (k.startsWith(`${p}_`) && (k.endsWith('_css') || k.includes('_style'))) {
                combinedCss += `\n/* Source: ${key} */\n${this.package[key]}\n`;
            }
        });

        // 4. NAVIGATION LOGIC
        if (htmlKey) {
            console.log(`MWM: Rendering ${p}. Injected JS Keys:`, foundJsKeys);
            this.injectContent(stage, htmlKey, combinedJs, combinedCss);
        } 
        else {
            // UNIVERSAL SUBSIDIARY: Show the Shared Block Page
            console.warn(`MWM: ${p} not in package. Showing subsidiary block page.`);
            
            const gatePrefix = 'common';
            const blockHtml = this.package[`${gatePrefix}_blocked_content_html`];
            
            // Collect all JS and CSS from the shared_assets folder
            let blockJs = "";
            let blockCss = "";
            
            sortedKeys.forEach(key => {
                const k = key.toLowerCase();
                if (k.startsWith(`${gatePrefix}_`)) {
                    if (k.endsWith('_js')) blockJs += `\n;${this.package[key]};\n`;
                    if (k.endsWith('_css') || k.includes('_style')) blockCss += `\n${this.package[key]}\n`;
                }
            });

            if (blockHtml) {
                this.injectContent(stage, blockHtml, blockJs, blockCss);
            } else {
                console.error("MWM: Critical Error - Fallback block page missing from package.");
            }
        }
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




