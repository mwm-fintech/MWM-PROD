/**
 * MWM Hydrator: Universal Key-Matching Orchestrator v2.2
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

        const saved = sessionStorage.getItem('mwm_ui_package');
        if (!saved) { window.location.href = './login_SPA/index_SPA.html'; return; }
        this.package = JSON.parse(saved);

        const p = prefix.toLowerCase();
        console.log(`!!! HYDRATOR 2.2 IN ACTION - Target: ${p} !!!`);
        
        const authHtml = this.package[`${p}_${p}_html`] || this.package[`${p}_index_html`] || this.package[`${p}_html`];
        const blockHtml = this.package['blockade_blocked_content_html'];
        const activeHtml = authHtml || blockHtml;

        if (!activeHtml) {
            stage.innerHTML = `<div style="padding:50px; text-align:center;"><h2>Access Restricted</h2></div>`;
            return;
        }

        let combinedJs = "";
        let combinedCss = "";
        const includedKeys = [];
        // Extract the parent prefix (e.g., if p is 'diy_quantitative', parent is 'diy')
        const parentPrefix = p.includes('_') ? p.split('_')[0] + '_' : p + '_';
        const allowedPrefixes = ['common_', 'blockade_', parentPrefix, p + '_']; 
        
        Object.keys(this.package).sort().forEach(key => {
            const k = key.toLowerCase().trim();
            const isAllowed = allowedPrefixes.some(pref => k.startsWith(pref));
        
            if (isAllowed) {
                includedKeys.push(key);
                if (k.endsWith('_js')) {
                    combinedJs += `\n/* --- START: ${key} --- */\n;${this.package[key]};\n`;
                }
                if (k.endsWith('_css') || k.includes('_style')) {
                    combinedCss += `\n${this.package[key]}\n`;
                }
            }
        });

        console.table(includedKeys.map(k => ({ Asset: k, Type: k.endsWith('_js') ? 'JS' : 'CSS/HTML' })));
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
    
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        sessionStorage.setItem('mwm_lang', currentLang); 
    
        if (js) {
            const oldScript = document.getElementById('mwm-dynamic-script');
            if (oldScript) oldScript.remove();
            
            const script = document.createElement('script');
            script.id = 'mwm-dynamic-script';
            script.type = 'module'; 
            script.textContent = js;
            document.body.appendChild(script);
        }
    
        // 5. Activation Handshake
        console.group("Hydrator Activation");
                
        const activeView = stage.querySelector('.view-section');
        
        if (activeView) {
            activeView.classList.add('active');
            // Timeout to allow SPA switchView to take over
            setTimeout(() => {
                if (window.switchView) {
                    window.switchView(activeView.id);
                }
            }, 50); 
        }
        console.groupEnd();
        
        // 6. Global Translation (Delayed for Module parsing)
        setTimeout(() => {
            if (window.applyTranslations) {
                window.applyTranslations(currentLang);
            }
        }, 150);
        
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


