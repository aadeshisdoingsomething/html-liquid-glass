document.addEventListener('DOMContentLoaded', () => {
    const uiContainer = document.getElementById('ui-container');
    const mainNav = document.getElementById('main-nav');
    const navItems = Array.from(mainNav.querySelectorAll('.nav-item a'));
    const indicator = document.getElementById('active-indicator');
    const navSensor = document.getElementById('nav-sensor');

    // --- Part 1: Click Animation & Alignment (Unchanged) ---
    const setActive = (item) => {
        if (!item || item.classList.contains('active')) return;
        const newPosition = item.parentElement.offsetLeft;
        indicator.classList.add('indicator-moving');
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        indicator.style.transform = `translateX(${newPosition}px)`;
        indicator.addEventListener('transitionend', () => indicator.classList.remove('indicator-moving'), { once: true });
    };

    const initialActiveItem = mainNav.querySelector('.nav-item a.active');
    if (initialActiveItem) {
        indicator.style.transform = `translateX(${initialActiveItem.parentElement.offsetLeft}px)`;
    }

    navItems.forEach(item => item.addEventListener('click', (e) => {
        e.preventDefault();
        setActive(item);
    }));

    // --- Part 2: Simplified & Reliable Theming via Element Detection ---
    const checkBackground = () => {
        const rect = navSensor.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Find the topmost element at the center of the sensor
        const elements = document.elementsFromPoint(centerX, centerY);
        const topElement = elements.find(el => el.classList.contains('card') || el.tagName === 'BODY');

        let backgroundColor = 'rgb(22, 22, 24)'; // Default to body color
        if (topElement && topElement.classList.contains('card')) {
            backgroundColor = window.getComputedStyle(topElement).backgroundColor;
        }

        // Parse the RGB color string
        const [r, g, b] = backgroundColor.match(/\d+/g).map(Number);
        
        // Define our conditions for a "problematic" background
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
        const isBright = luminance > 200;
        const isBlueDominant = b > r && b > g && (b - r > 50);

        // The ONLY decision: Should the active item be red for contrast?
        if (isBright || isBlueDominant) {
            uiContainer.classList.add('theme-contrast-active');
        } else {
            uiContainer.classList.remove('theme-contrast-active');
        }
    };

    // Use a more responsive IntersectionObserver to trigger the check
    const observer = new IntersectionObserver(() => {
        checkBackground();
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, body').forEach(el => observer.observe(el));

    // Also run the check on scroll for continuous accuracy
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkBackground, 50);
    });

    // Initial check on load
    setTimeout(checkBackground, 100);
});
