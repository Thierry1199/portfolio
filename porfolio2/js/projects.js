document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.projects-gallery');
    const scrollLine = document.querySelector('.scroll-line');

    // Update scroll line width based on scroll position
    function updateScrollLine() {
        if (!gallery || !scrollLine) return;
        
        const scrollWidth = gallery.scrollWidth - gallery.clientWidth;
        const scrolled = gallery.scrollLeft;
        const percentage = (scrolled / scrollWidth) * 100;
        
        scrollLine.style.setProperty('--scroll-width', `${percentage}%`);
    }

    // Add scroll event listener
    if (gallery) {
        gallery.addEventListener('scroll', updateScrollLine);
        // Initial update
        updateScrollLine();
    }
}); 