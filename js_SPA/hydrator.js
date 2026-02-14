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
        if (!stage) {
            console.error("MWM: 'main-content-area' not found in DOM.");
            return;
        }

        // --- 1. SAFETY SYNC ---
        // Force-load the package from storage if the local object is empty
        if (!this.package) {
            const saved = sessionStorage.getItem('mwm_ui_package');
            if (saved) {
                this.package = JSON.parse(saved);
            } else {
                console.error("MWM: No UI Package found. Redirecting to login.");
                window.location.href = './login_SPA/index_SPA.html';
                return;
            }
        }

        const p = prefix.toLowerCase();
        const sortedKeys = Object.keys(this.package).sort();

        // --- 2. FIND REQUESTED FEATURE HTML ---
        // Looks for: diy_diy_html, diy_index_html, or diy_html
        const htmlKey = this.package[`${p}_${p}_html`] || 
                        this.package[`${p}_index_html`] || 
                        this.package[`${p}_html`];

        if (htmlKey) {
            // SUCCESS PATH: User is authorized for this specific tool
            let combinedJs = "";
            let foundJsKeys = [];
            let combinedCss = "";

            sortedKeys.forEach(key => {
                const k = key.toLowerCase();
                if (k.startsWith(`${p}_`)) {
                    // Collect JS
                    if (k.endsWith('_js')) {
                        foundJsKeys.push(key);
                        combinedJs += `\n;/* Source: ${key} */\n${this.package[key]};\n`;
                    }
                    // Collect CSS/Styles
                    if (k.endsWith('_css') || k.includes('_style')) {
                        combinedCss += `\n/* Source: ${key} */\n${this.package[key]}\n`;
                    }
                }
            });

            console.log(`MWM: Rendering authorized view [${p}]. JS Keys:`, foundJsKeys);
            this.injectContent(stage, htmlKey, combinedJs, combinedCss);
        } 
        // --- 3. FALLBACK PATH (THE GATE) ---
        else {
            // FAIL PATH: Tool missing from package, trigger the 'common' block page
            console.warn(`MWM: ${p} not in package. Showing subsidiary block page.`);
            
            const gatePrefix = 'common';
            // Explicit lookup for your specific filename: blocked_content.html
            const blockHtml = this.package[`${gatePrefix}_blocked_content_html`];
            
            let blockJs = "";
            let blockCss = "";
            
            sortedKeys.forEach(key => {
                const k = key.toLowerCase();
                if (k.startsWith(`${gatePrefix}_`)) {
                    // Collects translations_block_js
                    if (k.endsWith('_js')) {
                        blockJs += `\n;/* Fallback JS: ${key} */\n${this.package[key]};\n`;
                    }
                    // Collects blocked_page_css
                    if (k.endsWith('_css') || k.includes('_style')) {
                        blockCss += `\n/* Fallback CSS: ${key} */\n${this.package[key]}\n`;
                    }
                }
            });

            if (blockHtml) {
                this.injectContent(stage, blockHtml, blockJs, blockCss);
            } else {
                // --- 4. CRITICAL DIAGNOSTIC ---
                // If we reach here, 'common_blocked_content_html' is missing from the package object
                console.error(`MWM: CRITICAL FAILURE - Fallback key '${gatePrefix}_blocked_content_html' missing.`);
                console.log("MWM: Current Package Inventory:", Object.keys(this.package));
                
                stage.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px;">
                        <h3>Access Restricted</h3>
                        <p>The system could not load the authorization gate assets.</p>
                        <small>Check console for package inventory.</small>
                    </div>`;
            }
        }
    }

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





