// animations_SPA.js

window.triggerFadeIn = (selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
        el.style.opacity = "0";
        el.style.transition = "opacity 0.5s ease " + (index * 0.1) + "s";
        setTimeout(() => el.style.opacity = "1", 50);
    });
};

// Initial load animation
document.addEventListener("DOMContentLoaded", () => {
    // Only trigger if cards exist on screen
    if (document.querySelector('.branch-card')) {
        window.triggerFadeIn('.branch-card');
    }
});

/**
 * Individual Card Interaction (to prevent the "double card" effect)
 * This targets only the specific element clicked.
 */
document.querySelectorAll('.branch-card').forEach(card => {
    card.addEventListener('mousedown', function() {
        this.style.transform = "scale(0.98)";
        this.style.transition = "transform 0.1s";
    });
    card.addEventListener('mouseup', function() {
        this.style.transform = "scale(1)";
    });
});