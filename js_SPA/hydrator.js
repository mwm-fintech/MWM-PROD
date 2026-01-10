/**
 * MWM Hydrator: Role-Aware SPA Orchestrator
 * Strictly separates Admin tools from Early Adopter gates.
 */
window.Hydrator = {
    package: null,

    unpack: function(uiPackage) {
        this.package = uiPackage;
        sessionStorage.setItem('mwm_ui_package', JSON.stringify(uiPackage));

        // 1. Precise Admin Check - RESTORED ORIGINAL LOGIC
        const adminLink = document.getElementById('admin-nav-item');
        const hasAdmin = this.package['admin_admin_html'] || 
                         this.package['admin_index_html'] || 
                         this.package['admin_html'];
        
        if (adminLink && hasAdmin) {
            adminLink.style.display = 'block';
        }

        this.updateNavStatus(true);
        this.initGlobalNavigation();
    },

    renderHome: function() {
        window.location.href = 'index.html'; 
    },

    initGlobalNavigation: function() {
        const handleClicks = (e) => {
            const anchor = e.target.closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            const dataView = anchor.getAttribute('data-view');

            if (dataView || href === '#') {
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
            alert("Session expired. Please login.");
            window.location.href = './login_SPA/index_SPA.html';
            return;
        }
        this.renderView(prefix);
    },

    renderView: function(prefix) {
        const stage = document.getElementById('main-content-area');
        if (!stage) return;

        // 1. Identify specific keys in the package - RESTORED ORIGINAL LOGIC
        const htmlKey = this.package[`${prefix}_${prefix}_html`] || 
                        this.package[`${prefix}_index_html`] || 
                        this.package[`${prefix}_html`];
                        
        const jsKey =   this.package[`${prefix}_${prefix}_js`] || 
                        this.package[`${prefix}_ui_js`] || 
                        this.package[`${prefix}_js`];
                        
        const cssKey =  this.package[`${prefix}_${prefix}_css`] || 
                        this.package[`${prefix}_index_css`] || 
                        this.package[`${prefix}_css`];

        // 2. Logic Separation: Tools vs Admin/Static
        const isToolCard = ['diy', 'mwa', 'follow'].includes(prefix);

        if (htmlKey) {
            // SUCCESS: Rendering Admin/Tool using your original key logic
            console.log(`MWM: Rendering ${prefix}`);
            this.injectContent(stage, htmlKey, jsKey, cssKey);
        } 
        else if (isToolCard) {
            // FALLBACK: Only for DIY/MWA/FOLLOW
            const p = 'early_adopter';
            const gateHtml = this.package[`${p}_index_html`] || 
                             this.package[`${p}_html`];
            const gateCss =  this.package[`${p}_early_adopter_css`] || 
                             this.package[`${p}_css`];

            const gateJs =   this.package[`${p}_gate_ui_js`] || 
                             this.package[`${p}_js`];

            const gateTransJs = this.package[`${p}_translations_js`];

            if (gateHtml) {
                /**
                 * FIX: Wrap combined scripts in an IIFE to isolate scope 
                 * and add leading semicolons to prevent "Unexpected token" errors.
                 */
                const safeTrans = gateTransJs ? `;(function(){ ${gateTransJs} })();` : '';
                const safeJs    = gateJs      ? `;(function(){ ${gateJs} })();`      : '';
                const combinedJs = `${safeTrans}\n${safeJs}`;
                
                console.log(`MWM: Tool missing, showing Early Adopter Gate with isolated logic.`);
                
                this.injectContent(stage, gateHtml, combinedJs, gateCss);
            } else {
                console.error(`MWM: No content or gate found for tool: ${prefix}`);
            }
        } 
        else {
            console.error(`MWM: Critical content missing for: ${prefix}`);
            if (prefix === 'admin') alert("Admin Content not found in your session.");
        }
    },

    injectContent: function(stage, html, js, css) {
        // Clean up previous view
        const oldStyle = document.getElementById('mwm-dynamic-style');
        if (oldStyle) oldStyle.remove();

        // Inject CSS
        if (css) {
            const style = document.createElement('style');
            style.id = 'mwm-dynamic-style';
            style.textContent = css;
            document.head.appendChild(style);
        }

        document.body.classList.remove('fixed-view');
        document.body.classList.add('view-scrollable');
        
        // Inject HTML
        stage.innerHTML = html;

        // Inject & Execute JS
        if (js) {
            try {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                // Using textContent instead of innerHTML for better script parsing
                script.textContent = js;
                document.body.appendChild(script);
                // Clean up DOM (script remains in memory)
                document.body.removeChild(script);
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
    const token = sessionStorage.getItem('mwm_auth_token'); 
    if (saved) window.Hydrator.unpack(JSON.parse(saved));
    if (token) window.Hydrator.updateNavStatus(true);
});