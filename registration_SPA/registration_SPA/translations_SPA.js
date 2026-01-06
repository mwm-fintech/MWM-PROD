// translations_SPA.js
const translations = {
    en: {
        page_title_reg: "MWM - Register",
        nav_login: "Login",
        reg_welcome: "Join the Beta",
        reg_instruction: "Enter your invitation token to create your account.",
        label_token: "Invitation Token",
        placeholder_token: "XXXX-XXXX-XXXX",
        label_email: "Email Address",
        placeholder_email: "email@example.com",
        label_password: "Password",
        placeholder_password: "Min. 12 characters",
        label_confirm: "Confirm Password",
        btn_register: "Activate Account",
        already_member: "Already a member?",
        link_login: "Login here",
        err_match: "Passwords do not match.",
        err_length: "Password must be at least 12 characters.",
        err_server: "Server unreachable. Please try again later.",
        err_general: "Registration failed.",
        status_checking: "Checking invitation token...",
        status_success: "Account activated! Redirecting..."
    },
    es: {
        page_title_reg: "MWM - Registro",
        nav_login: "Iniciar Sesión",
        reg_welcome: "Únete a la Beta",
        reg_instruction: "Introduce tu código de invitación para crear tu cuenta.",
        label_token: "Código de Invitación",
        placeholder_token: "XXXX-XXXX-XXXX",
        label_email: "Correo Electrónico",
        placeholder_email: "correo@ejemplo.es",
        label_password: "Contraseña",
        placeholder_password: "Mín. 12 caracteres",
        label_confirm: "Confirmar Contraseña",
        btn_register: "Activar Cuenta",
        already_member: "¿Ya eres miembro?",
        link_login: "Inicia sesión aquí",
        err_match: "Las contraseñas no coinciden.",
        err_length: "La contraseña debe tener al menos 12 caracteres.",
        err_server: "Servidor no disponible.",
        err_general: "Error en el registro.",
        status_checking: "Verificando código...",
        status_success: "¡Cuenta activada! Redirigiendo..."
    },
    fr: {
        page_title_reg: "MWM - Inscription",
        nav_login: "Connexion",
        reg_welcome: "Rejoignez la Beta",
        reg_instruction: "Entrez votre jeton d'invitation pour créer votre compte.",
        label_token: "Jeton d'invitation",
        placeholder_token: "XXXX-XXXX-XXXX",
        label_email: "Adresse Email",
        placeholder_email: "email@exemple.fr",
        label_password: "Mot de passe",
        placeholder_password: "Min. 12 caractères",
        label_confirm: "Confirmer le mot de passe",
        btn_register: "Activer le compte",
        already_member: "Déjà membre ?",
        link_login: "Connectez-vous ici",
        err_match: "Les mots de passe ne correspondent pas.",
        err_length: "Le mot de passe doit comporter au moins 12 caractères.",
        err_server: "Serveur inaccessible.",
        err_general: "Échec de l'inscription.",
        status_checking: "Vérification du jeton...",
        status_success: "Compte activé ! Redirection..."
    },
    de: {
        page_title_reg: "MWM - Registrieren",
        nav_login: "Anmelden",
        reg_welcome: "Beta beitreten",
        reg_instruction: "Geben Sie Ihren Einladungstoken ein, um Ihr Konto zu erstellen.",
        label_token: "Einladungstoken",
        placeholder_token: "XXXX-XXXX-XXXX",
        label_email: "E-Mail-Adresse",
        placeholder_email: "email@beispiel.de",
        label_password: "Passwort",
        placeholder_password: "Mind. 12 Zeichen",
        label_confirm: "Passwort bestätigen",
        btn_register: "Konto aktivieren",
        already_member: "Bereits Mitglied?",
        link_login: "Hier anmelden",
        err_match: "Passwörter stimmen nicht überein.",
        err_length: "Passwort muss mindestens 12 Zeichen lang sein.",
        err_server: "Server nicht erreichbar.",
        err_general: "Registrierung fehlgeschlagen.",
        status_checking: "Token wird geprüft...",
        status_success: "Konto aktiviert! Weiterleitung..."
    }
};

/**
 * Global translation helper 't'
 * Used by registration_SPA.js to fetch strings programmatically
 */
window.t = function(key) {
    const lang = localStorage.getItem('selectedLanguage') || 'en';
    return (translations[lang] && translations[lang][key]) 
            || (translations['en'][key]) 
            || key;
};

/**
 * Scans the DOM and applies translations to data-i18n elements
 */
window.applyLoginTranslations = function() {
    const lang = localStorage.getItem('selectedLanguage') || 'en';
    const dict = translations[lang] || translations['en'];

    // Update inner text for labels, buttons, headers
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerText = dict[key];
    });

    // Update placeholders for input fields
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) el.placeholder = dict[key];
    });
};