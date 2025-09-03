document.addEventListener('DOMContentLoaded', () => {
    const uiContainer = document.getElementById('ui-container');
    const mainNav = document.getElementById('main-nav');
    const navItems = Array.from(mainNav.querySelectorAll('.nav-item a'));
    const indicator = document.getElementById('active-indicator');
    const navSensor = document.getElementById('nav-sensor');

    const ITEM_WIDTH = 72; // Must match --item-width in CSS

    // --- Part 1: Click Animation & Alignment ---
    const setActive = (item) => {
        if (!item || item.classList.contains('active')) return;
        
        const itemIndex = navItems.indexOf(item);
        const newPosition = itemIndex * ITEM_WIDTH; // Correct, index-based positioning

        indicator.classList.add('indicator-moving');
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        indicator.style.transform = `translateX(${newPosition}px)`;
        indicator.addEventListener('transitionend', () => indicator.classList.remove('indicator-moving'), { once: true });
    };

    const initialActiveItem = mainNav.querySelector('.nav-item a.active');
    if (initialActiveItem) {
        const initialIndex = navItems.indexOf(initialActiveItem);
        indicator.style.transform = `translateX(${initialIndex * ITEM_WIDTH}px)`;
    }

    navItems.forEach(item => item.addEventListener('click', (e) => {
        e.preventDefault();
        setActive(item);
    }));

    // --- Part 2: Intelligent Theming via Pixel Analysis ---
    let isProcessing = false;
    const checkBackgroundColor = () => {
        if (isProcessing) return;
        isProcessing = true;

        const rect = navSensor.getBoundingClientRect();

        html2canvas(document.body, {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            scale: 0.1 // Capture a low-res image for performance
        }).then(canvas => {
            const ctx = canvas.getContext('2d');
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            
            let totalLuminance = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                // Standard formula for perceived brightness
                totalLuminance += (0.299 * r + 0.587 * g + 0.114 * b);
            }
            
            const avgLuminance = totalLuminance / (data.length / 4);
            
            // Threshold for light/dark (128 is the midpoint of 255)
            if (avgLuminance > 128) {
                uiContainer.classList.add('theme-light');
            } else {
                uiContainer.classList.remove('theme-light');
            }
            
            isProcessing = false;
        }).catch(() => {
            isProcessing = false; // Ensure we can try again even if it fails
        });
    };

    // Throttle the check to run at most every 250ms
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkBackgroundColor, 250);
    });
    
    // Initial check on load
    setTimeout(checkBackgroundColor, 500);
});