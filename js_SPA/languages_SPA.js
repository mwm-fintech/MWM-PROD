// languages_SPA.js - The Dynamic Translation Engine & Dictionary

// 1. Initialize global object if it doesn't exist
window.translations = window.translations || { en: {}, es: {}, fr: {}, de: {} };

// 2. Initial Public Translations (Homepage & Navbar)
const publicBundle = {
    en: {
        nav_mwm: "MWM",
        nav_home: "Home",
        nav_diy: "DIY",
        nav_mwa: "Academy",
        nav_login: "Login",
        nav_admin: "Admin Console",
        hero_title: "Manolito Wealth Management",
        hero_subtitle_1: "Get Inspired! Act! Protect yourself!",
        hero_subtitle_2: "The sooner the better.",
        hero_subtitle_3: "If you don't want your money, someone else will.",
        card1_title: "DIY",
        card1_desc: "Discover our state-of-the-art toolset",
        card2_title: "Academy",
        card2_desc: "Get in the driver seat of your financial independence",
        card3_title: "Follow my lead",
        card3_desc: "Worst case, trust my portfolio...you lazy bastard"
    },
    es: {
        nav_mwm: "MWM",
        nav_home: "Inicio",
        nav_diy: "DIY",
        nav_mwa: "Academia",
        nav_login: "Acceder",
        nav_admin: "Consola Admin",
        hero_title: "Manolito Wealth Management",
        hero_subtitle_1: "¡Inspírate! ¡Actúa! ¡Protégete!",
        hero_subtitle_2: "Cuanto antes, mejor.",
        hero_subtitle_3: "Si no quieres tu dinero, alguien más lo querrá.",
        card1_title: "DIY",
        card1_desc: "Descubre nuestro conjunto de herramientas de vanguardia",
        card2_title: "Academia",
        card2_desc: "Toma las riendas de tus finanzas",
        card3_title: "Sigue mis pasos",
        card3_desc: "En el peor de los casos, confía en mi cartera... pedazo de vago"
    },
    fr: {
        nav_mwm: "MWM",
        nav_home: "Accueil",
        nav_diy: "DIY",
        nav_mwa: "Académie",
        nav_login: "Connexion",
        nav_admin: "Console Admin",
        hero_title: "Manolito Wealth Management",
        hero_subtitle_1: "Inspirez-vous ! Agissez ! Protégez-vous !",
        hero_subtitle_2: "Le plus tôt sera le mieux.",
        hero_subtitle_3: "Si vous ne voulez pas de votre argent, quelqu'un d'autre le prendra.",
        card1_title: "DIY",
        card1_desc: "Découvrez nos outils de pointe",
        card2_title: "Académie",
        card2_desc: "Prenez les commandes de votre indépendance financière",
        card3_title: "Suivez mon exemple",
        card3_desc: "Au pire, faites confiance à mon portefeuille... espèce de paresseux"
    },
    de: {
        nav_mwm: "MWM",
        nav_home: "Startseite",
        nav_diy: "DIY",
        nav_mwa: "Akademie",
        nav_login: "Anmelden",
        nav_admin: "Admin Konsole",
        hero_title: "Manolito Wealth Management",
        hero_subtitle_1: "Lass dich inspirieren! Handle! Schütze dich selbst!",
        hero_subtitle_2: "Je früher, desto besser.",
        hero_subtitle_3: "Wenn du dein Geld nicht willst, wird es jemand anderes nehmen.",
        card1_title: "DIY",
        card1_desc: "Entdecken Sie unser modernes Toolset",
        card2_title: "Akademie",
        card2_desc: "Übernehmen Sie das Steuer Ihrer finanziellen Unabhängigkeit",
        card3_title: "Folgen Sie meinem Beispiel",
        card3_desc: "Im schlimmsten Fall vertrauen Sie meinem Portfolio... Sie fauler Bastard"
    }
};

// 3. Merge public bundle into the global translations object
Object.keys(publicBundle).forEach(lang => {
    Object.assign(window.translations[lang], publicBundle[lang]);
});

/**
 * THE ENGINE: Physically swaps text in the DOM based on data-i18n attributes.
 */
window.applyTranslations = function(lang) {
    const bundle = window.translations[lang];
    if (!bundle) {
        console.warn(`MWM: Translation bundle for [${lang}] not found.`);
        return;
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (bundle[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = bundle[key];
            } else {
                el.textContent = bundle[key];
            }
        }
    });

    // Persist choice and sync UI selector
    localStorage.setItem('selectedLanguage', lang);
    const selector = document.getElementById('language-selector');
    if (selector) selector.value = lang;
    
    console.log(`MWM: UI translated to [${lang}]`);
};

/**
 * Merges new translation strings (from private assets) into the existing engine.
 */
window.injectNewTranslations = (newJson) => {
    Object.keys(newJson).forEach(lang => {
        if (window.translations[lang]) {
            Object.assign(window.translations[lang], newJson[lang]);
        }
    });
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';
    window.applyTranslations(currentLang);
};

// 4. INITIALIZATION: Run when the script loads
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    
    // Initial run to translate the static HTML (Navbar/Hero)
    window.applyTranslations(savedLang);

    // Setup the dropdown listener
    const selector = document.getElementById('language-selector');
    if (selector) {
        selector.addEventListener('change', (e) => {
            window.applyTranslations(e.target.value);
        });
    }
});