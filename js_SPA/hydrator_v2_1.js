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
    const includedKeys = [];
    
    // Define the "Must-Have" prefixes for this render
    const allowedPrefixes = ['common_', 'blockade_']; 
    allowedPrefixes.push(`${p}_`); // Add the actual tool prefix (e.g., 'follow_')
    
    Object.keys(this.package).sort().forEach(key => {
        const k = key.toLowerCase().trim();
        
        // Check if the key starts with ANY of our allowed prefixes
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

    // DEBUG TABLE: This will show us exactly what got injected
    console.table(includedKeys.map(k => ({ Asset: k, Type: k.endsWith('_js') ? 'JS' : 'CSS/HTML' })));

    // 4. INJECT
    this.injectContent(stage, activeHtml, combinedJs, combinedCss);
},
    
    injectContent: function(stage, html, js, css) {
        // 1. Manage Styles
        const oldStyle = document.getElementById('mwm-dynamic-style');
        if (oldStyle) oldStyle.remove();
    
        if (css) {
            const style = document.createElement('style');
            style.id = 'mwm-dynamic-style';
            style.textContent = css;
            document.head.appendChild(style);
        }
    
        // 2. Inject HTML Structure
        stage.innerHTML = html;
    
        // 3. Resolve Language and Sync storage
        // Your blockade_js looks for 'mwm_lang' in sessionStorage, 
        // but your app uses 'selectedLanguage' in localStorage. We sync them here.
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        sessionStorage.setItem('mwm_lang', currentLang); 
    
        // 4. Inject and Execute JS
        if (js) {
            try {
                const oldScript = document.getElementById('mwm-dynamic-script');
                if (oldScript) oldScript.remove();
                
                const script = document.createElement('script');
                script.id = 'mwm-dynamic-script';
                script.type = 'module'; 
                script.textContent = js;
                document.body.appendChild(script);
            } catch (e) {
                console.error("MWM: Script injection failed:", e);
            }
        }
    
        // 5. Activation Handshake
        console.group("Hydrator Debug: Activation Phase");
        
        // A. THE HIDE: Immediate nuke of all views
        const allBefore = document.querySelectorAll('.view-section.active');
        console.log("Sections active BEFORE reset:", Array.from(allBefore).map(el => el.id));
        
        document.querySelectorAll('.view-section').forEach(view => {
            view.classList.remove('active');
            view.style.setProperty('display', 'none', 'important'); 
        });
        
        // B. Identify
        const activeView = stage.querySelector('.view-section');
        console.log("New view found in stage:", activeView ? activeView.id : "NONE");
        
        if (activeView) {
            console.log("Hydrator: Forcing visibility for", activeView.id);
        
            // C. Activate: Immediate Force
            activeView.style.setProperty('display', 'block', 'important');
            activeView.style.setProperty('opacity', '1', 'important');
            activeView.classList.add('active');
        
            // D. The Safety Catch: 
            // We wrap the handshake in a tiny timeout. 
            // This forces the "Switch to quantitative" (from the other script) to happen 
            // FIRST, so that OUR switch back to the cards happens LAST.
            setTimeout(() => {
                if (window.switchView && activeView.id) {
                    console.log("Action: Final Logic Sync for:", activeView.id);
                    window.switchView(activeView.id);
                    
                    // Re-confirm display after the switchView call
                    activeView.style.setProperty('display', 'block', 'important');
                }
            }, 50); // 50ms is enough to win the race condition
        
        } else {
            console.error("Hydrator: No .view-section found to activate!");
        }
        
        console.groupEnd();
        
        // 6. Global Translation (if applicable)
        if (window.applyTranslations) {
            window.applyTranslations(currentLang);
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























