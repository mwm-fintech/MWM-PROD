/**
 * MWM Hydrator: Role-Aware SPA Orchestrator
 * Optimized for Modular MWA subfolders and Root-level DIY legacy files.
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
            window.location.href = './login_SPA/index_SPA.html';
            return;
        }
        this.renderView(prefix);
    },

    renderView: function(prefix) {
        const stage = document.getElementById('main-content-area');
        if (!stage) return;

        // 1. Identify HTML (Checks both prefix_html and prefix_index_html)
        const htmlKey = this.package[`${prefix}_${prefix}_html`] || 
                        this.package[`${prefix}_index_html`] || 
                        this.package[`${prefix}_html`];

        // 2. HYBRID JS COLLECTOR (Fixes DIY + MWA)
        let combinedJs = "";
        let foundJsKeys = [];
        
        Object.keys(this.package).forEach(key => {
            // EXACT MATCH: For root files (e.g., "diy_js")
            const isExact = (key === `${prefix}_js` || key === `${prefix}_ui_js` || key === `${prefix}_${prefix}_js`);
            // PARTIAL MATCH: For subfolder files (e.g., "mwa_js_1_content_js")
            const isPartial = (key.startsWith(`${prefix}_js_`) || key.startsWith(`${prefix}_ui_js_`));

            if (isExact || isPartial) {
                foundJsKeys.push(key);
                combinedJs += `\n;/* Source: ${key} */\n${this.package[key]};\n`;
            }
        });
                                
        // 3. HYBRID CSS COLLECTOR
        let combinedCss = "";
        Object.keys(this.package).forEach(key => {
            const isExact = (key === `${prefix}_css` || key === `${prefix}_style_css` || key === `${prefix}_${prefix}_css`);
            const isPartial = (key.startsWith(`${prefix}_css_`));

            if (isExact || isPartial) {
                combinedCss += `\n/* Source: ${key} */\n${this.package[key]}\n`;
            }
        });

        const isToolCard = ['diy', 'mwa', 'follow'].includes(prefix);

        if (htmlKey) {
            console.log(`MWM: Rendering ${prefix}. Injected JS Keys:`, foundJsKeys);
            this.injectContent(stage, htmlKey, combinedJs, combinedCss);
        } 
        else if (isToolCard) {
            const p = 'early_adopter';
            const gateHtml = this.package[`${p}_index_html`] || this.package[`${p}_html`];
            const gateCss =  this.package[`${p}_css`];
            const gateJs =   this.package[`${p}_js`];
            const gateTransJs = this.package[`${p}_translations_js`];

            if (gateHtml) {
                const safeTrans = gateTransJs ? `;(function(){ ${gateTransJs} })();` : '';
                const safeJs    = gateJs      ? `;(function(){ ${gateJs} })();`      : '';
                this.injectContent(stage, gateHtml, `${safeTrans}\n${safeJs}`, gateCss);
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
                const script = document.createElement('script');
                script.textContent = js;
                document.body.appendChild(script);
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
    if (saved) window.Hydrator.unpack(JSON.parse(saved));
});