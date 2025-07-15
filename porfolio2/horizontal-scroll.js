document.addEventListener('DOMContentLoaded', () => {
    // This file is deprecated and disabled
    // The functionality has been moved to scroll-control.js
    // Keeping this file to prevent any errors from scripts that might depend on it
    
    console.log('Horizontal scroll script disabled - functionality moved to scroll-control.js');
    
    // No functionality implemented - preventing potential conflicts with scroll-control.js

    const gallery = document.querySelector('.projects-gallery');
    const scrollBar = document.querySelector('.scroll-bar');

    function updateScrollBar() {
        if (!gallery || !scrollBar) return;
        
        const scrollPercentage = (gallery.scrollLeft / (gallery.scrollWidth - gallery.clientWidth)) * 100;
        const thumbWidth = (gallery.clientWidth / gallery.scrollWidth) * 100;
        
        scrollBar.style.width = `${thumbWidth}%`;
        scrollBar.style.transform = `translateX(${scrollPercentage}%)`;
    }

    // Update scroll bar on scroll
    gallery.addEventListener('scroll', updateScrollBar);
    
    // Update scroll bar on window resize
    window.addEventListener('resize', updateScrollBar);
    
    // Initial update
    updateScrollBar();
}); 