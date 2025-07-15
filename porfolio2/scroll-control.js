document.addEventListener('DOMContentLoaded', () => {
    // Store references to all sections and important elements
    const sections = {
        hero: document.querySelector('#hero'),
        about: document.querySelector('#about'),
        projects: document.querySelector('#projects'),
        contact: document.querySelector('#contact')
    };
    
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 0;
    
    // Tab system for about section
    const tabButtons = {
        about: document.querySelector('[data-section="about"]'),
        hobbies: document.querySelector('[data-section="hobbies"]'),
        skills: document.querySelector('[data-section="skills"]')
    };
    
    const tabContents = {
        about: document.querySelector('[data-content="about"]'),
        hobbies: document.querySelector('[data-content="hobbies"]'),
        skills: document.querySelector('[data-content="skills"]')
    };
    
    // State management
    let activeSection = 'hero';
    let activeTab = 'about';
    let isScrolling = false;
    let lastScrollTime = 0;
    let scrollTimeout;
    
    // Debug mode - set to true for console logging
    const DEBUG = false;
    
    // Utility function for logging if debug is enabled
    function log(...args) {
        if (DEBUG) console.log(...args);
    }
    
    // Get the exact position to scroll to (accounting for header)
    function getScrollPosition(element) {
        if (!element) return 0;
        return element.offsetTop - headerHeight;
    }
    
    // Smooth scroll with better handling
    function smoothScrollTo(position, callback) {
        clearTimeout(scrollTimeout);
        isScrolling = true;
        
        // For Safari and iOS, use simple scroll
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isSafari || isIOS) {
            window.scrollTo(0, position);
            
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                if (callback) callback();
            }, 500); // Increased timeout for Safari and iOS
            return;
        }
        
        // For other browsers use custom smooth scrolling for more consistency
        const startPosition = window.pageYOffset;
        const distance = position - startPosition;
        const duration = 800; // Consistent duration for all scrolls
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            window.scrollTo(0, startPosition + distance * easeInOutQuad(progress));
            
            if (progress < 1) {
                window.requestAnimationFrame(animation);
            } else {
                isScrolling = false;
                if (callback) callback();
            }
        }
        
        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }
        
        window.requestAnimationFrame(animation);
    }
    
    // Activate a specific tab
    function activateTab(tabName) {
        if (!tabButtons[tabName] || !tabContents[tabName]) {
            log(`Tab not found: ${tabName}`);
            return;
        }
        
        // Update active state for buttons
        Object.keys(tabButtons).forEach(key => {
            if (tabButtons[key]) {
                tabButtons[key].classList.toggle('active', key === tabName);
            }
        });
        
        // Update active state for content
        Object.keys(tabContents).forEach(key => {
            if (tabContents[key]) {
                tabContents[key].classList.toggle('active', key === tabName);
            }
        });
        
        activeTab = tabName;
        log(`Tab activated: ${tabName}`);
    }
    
    // Get current tab index (0 = about, 1 = hobbies, 2 = skills)
    function getTabIndex(tabName) {
        const tabNames = Object.keys(tabButtons);
        return tabNames.indexOf(tabName);
    }
    
    // Get tab name by index
    function getTabName(index) {
        const tabNames = Object.keys(tabButtons);
        return tabNames[index] || 'about';
    }
    
    // Precisely determine which section is currently active
    function determineActiveSection() {
        // Get viewport height for calculations
        const viewportHeight = window.innerHeight;
        
        // Check if hero section is active (near top of page)
        if (window.scrollY < viewportHeight / 3) {
            return 'hero';
        }
        
        // Special handling for About section to ensure exact positioning
        const aboutRect = sections.about ? sections.about.getBoundingClientRect() : null;
        if (aboutRect && aboutRect.top <= headerHeight + 10 && aboutRect.top >= -viewportHeight/3) {
            return 'about';
        }
        
        // Check projects section
        const projectsRect = sections.projects ? sections.projects.getBoundingClientRect() : null;
        if (projectsRect && projectsRect.top <= viewportHeight/2) {
            return 'projects';
        }
        
        // Check contact section
        const contactRect = sections.contact ? sections.contact.getBoundingClientRect() : null;
        if (contactRect && contactRect.top <= viewportHeight/2) {
            return 'contact';
        }
        
        // Default to closest section by scroll position
        return findClosestSection();
    }
    
    // Find the closest section based on scroll position
    function findClosestSection() {
        let closest = 'hero';
        let closestDistance = Infinity;
        
        Object.entries(sections).forEach(([name, element]) => {
            if (!element) return;
            
            const distance = Math.abs(window.scrollY - getScrollPosition(element));
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = name;
            }
        });
        
        return closest;
    }
    
    // Update UI based on current section
    function updateUI() {
        const newActiveSection = determineActiveSection();
        
        // Only update if section changed
        if (newActiveSection !== activeSection) {
            log(`Section changed: ${activeSection} -> ${newActiveSection}`);
            
            // Remove old section class
            document.body.classList.remove(`section-${activeSection}`);
            
            // Add new section class
            document.body.classList.add(`section-${newActiveSection}`);
            
            // Special handling for about section
            document.body.classList.toggle('about-active', newActiveSection === 'about');
            
            // Update active section
            activeSection = newActiveSection;
            
            // If entering about section, ensure first tab is active
            if (newActiveSection === 'about' && activeTab !== 'about') {
                activateTab('about');
            }
        }
        
        // Update header appearance
        header.classList.toggle('scrolled', window.scrollY > 50);
    }
    
    // Throttle function to limit execution rate
    function throttle(callback, delay = 800) {
        const now = Date.now();
        if (now - lastScrollTime < delay) return false;
        
        lastScrollTime = now;
        return true;
    }
    
    // Handle mouse wheel events
    function handleWheel(event) {
        // Skip if already scrolling
        if (isScrolling) {
            event.preventDefault();
            return;
        }
        
        // Determine scroll direction
        const direction = event.deltaY > 0 ? 'down' : 'up';
        
        // Update active section
        updateUI();
        
        // Handle based on active section
        switch (activeSection) {
            case 'hero':
                if (direction === 'down' && throttle()) {
                    event.preventDefault();
                    smoothScrollTo(getScrollPosition(sections.about), () => {
                        activateTab('about');
                        updateUI();
                    });
                }
                break;
                
            case 'about':
                event.preventDefault();
                
                if (throttle()) {
                    const currentTabIndex = getTabIndex(activeTab);
                    
                    if (direction === 'down') {
                        // Go to next tab or projects section
                        if (currentTabIndex === 2) {
                            // Last tab - go to projects
                            smoothScrollTo(getScrollPosition(sections.projects), updateUI);
                        } else {
                            // Activate next tab
                            const nextTab = getTabName(currentTabIndex + 1);
                            activateTab(nextTab);
                        }
                    } else if (direction === 'up') {
                        // Go to previous tab or hero section
                        if (currentTabIndex === 0) {
                            // First tab - go to hero
                            smoothScrollTo(0, updateUI);
                        } else {
                            // Activate previous tab
                            const prevTab = getTabName(currentTabIndex - 1);
                            activateTab(prevTab);
                        }
                    }
                }
                break;
                
            case 'projects':
                if (direction === 'up') {
                    const projectsRect = sections.projects.getBoundingClientRect();
                    
                    // Only if near top of projects section
                    if (projectsRect.top > -100 && throttle()) {
                        event.preventDefault();
                        smoothScrollTo(getScrollPosition(sections.about), () => {
                            activateTab('skills');
                            updateUI();
                        });
                    }
                } else if (direction === 'down' && throttle()) {
                    event.preventDefault();
                    smoothScrollTo(getScrollPosition(sections.contact), updateUI);
                }
                break;
                
            case 'contact':
                if (direction === 'up' && throttle()) {
                    event.preventDefault();
                    smoothScrollTo(getScrollPosition(sections.projects), updateUI);
                }
                break;
        }
    }
    
    // Handle touch events for mobile
    let touchStartY = 0;
    
    function handleTouchStart(event) {
        touchStartY = event.touches[0].clientY;
    }
    
    function handleTouchEnd(event) {
        if (isScrolling) return;
        
        const touchEndY = event.changedTouches[0].clientY;
        const touchDiff = touchStartY - touchEndY;
        
        // Only handle significant swipes
        if (Math.abs(touchDiff) < 80) return;
        
        // Determine direction
        const direction = touchDiff > 0 ? 'down' : 'up';
        
        // Update active section
        updateUI();
        
        // Handle based on active section (similar to wheel handling)
        switch (activeSection) {
            case 'hero':
                if (direction === 'down') {
                    smoothScrollTo(getScrollPosition(sections.about), () => {
                        activateTab('about');
                        updateUI();
                    });
                }
                break;
                
            case 'about':
                const currentTabIndex = getTabIndex(activeTab);
                
                if (direction === 'down') {
                    if (currentTabIndex === 2) {
                        smoothScrollTo(getScrollPosition(sections.projects), updateUI);
                    } else {
                        const nextTab = getTabName(currentTabIndex + 1);
                        activateTab(nextTab);
                    }
                } else if (direction === 'up') {
                    if (currentTabIndex === 0) {
                        smoothScrollTo(0, updateUI);
                    } else {
                        const prevTab = getTabName(currentTabIndex - 1);
                        activateTab(prevTab);
                    }
                }
                break;
                
            case 'projects':
                if (direction === 'up') {
                    const projectsRect = sections.projects.getBoundingClientRect();
                    if (projectsRect.top > -100) {
                        smoothScrollTo(getScrollPosition(sections.about), () => {
                            activateTab('skills');
                            updateUI();
                        });
                    }
                } else if (direction === 'down') {
                    smoothScrollTo(getScrollPosition(sections.contact), updateUI);
                }
                break;
                
            case 'contact':
                if (direction === 'up') {
                    smoothScrollTo(getScrollPosition(sections.projects), updateUI);
                }
                break;
        }
    }
    
    // Handle navigation link clicks
    function handleNavLinkClick(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            event.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                isScrolling = true;
                smoothScrollTo(getScrollPosition(targetElement), () => {
                    if (targetId === 'about') {
                        activateTab('about');
                    }
                    
                    updateUI();
                });
            }
        }
    }
    
    // Handle tab button clicks
    function handleTabButtonClick(event) {
        const button = event.currentTarget;
        const tabName = button.getAttribute('data-section');
        
        if (tabName) {
            activateTab(tabName);
        }
    }
    
    // Handle keyboard navigation
    function handleKeyDown(event) {
        if (isScrolling) return;
        
        const key = event.key;
        
        // Update active section
        updateUI();
        
        // Handle based on key pressed
        if (key === 'ArrowDown' || key === 'PageDown') {
            event.preventDefault();
            
            switch (activeSection) {
                case 'hero':
                    smoothScrollTo(getScrollPosition(sections.about), () => {
                        activateTab('about');
                        updateUI();
                    });
                    break;
                    
                case 'about':
                    const currentTabIndex = getTabIndex(activeTab);
                    
                    if (currentTabIndex === 2) {
                        smoothScrollTo(getScrollPosition(sections.projects), updateUI);
                    } else {
                        const nextTab = getTabName(currentTabIndex + 1);
                        activateTab(nextTab);
                    }
                    break;
                    
                case 'projects':
                    smoothScrollTo(getScrollPosition(sections.contact), updateUI);
                    break;
            }
        } else if (key === 'ArrowUp' || key === 'PageUp') {
            event.preventDefault();
            
            switch (activeSection) {
                case 'about':
                    const currentTabIndex = getTabIndex(activeTab);
                    
                    if (currentTabIndex === 0) {
                        smoothScrollTo(0, updateUI);
                    } else {
                        const prevTab = getTabName(currentTabIndex - 1);
                        activateTab(prevTab);
                    }
                    break;
                    
                case 'projects':
                    const projectsRect = sections.projects.getBoundingClientRect();
                    if (projectsRect.top > -100) {
                        smoothScrollTo(getScrollPosition(sections.about), () => {
                            activateTab('skills');
                            updateUI();
                        });
                    }
                    break;
                    
                case 'contact':
                    smoothScrollTo(getScrollPosition(sections.projects), updateUI);
                    break;
            }
        }
    }
    
    // Ensures the page is correctly positioned at a section boundary
    function snapToNearestSection() {
        const closestSection = findClosestSection();
        const aboutPosition = getScrollPosition(sections.about);
        
        // If about section is close but not perfectly positioned
        if (closestSection === 'about' && Math.abs(window.scrollY - aboutPosition) > 10) {
            window.scrollTo({
                top: aboutPosition,
                behavior: 'auto'
            });
            
            // Activate first tab
            activateTab('about');
        }
        
        updateUI();
    }
    
    // Set up event listeners
    function initializeEvents() {
        // Mouse wheel event
        window.addEventListener('wheel', handleWheel, { passive: false });
        
        // Scroll event
        window.addEventListener('scroll', updateUI, { passive: true });
        
        // Touch events
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyDown);
        
        // Navigation links
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });
        
        // Tab buttons
        Object.values(tabButtons).forEach(button => {
            if (button) {
                button.addEventListener('click', handleTabButtonClick);
            }
        });
        
        // Window resize
        window.addEventListener('resize', updateUI, { passive: true });
        
        // Load event
        window.addEventListener('load', () => {
            // Short delay to ensure DOM is fully loaded
            setTimeout(snapToNearestSection, 300);
        });
        
        // Force check after a longer delay (for slow-loading resources)
        setTimeout(snapToNearestSection, 1000);
    }
    
    // Initialize
    function initialize() {
        updateUI();
        initializeEvents();
        log('Scroll control initialized');
    }
    
    // Start the scroll control system
    initialize();

    // Project gallery scroll control
    const projectsGallery = document.querySelector('.projects-gallery');
    const scrollBar = document.querySelector('.scroll-bar');

    function updateProjectsScrollBar() {
        if (!projectsGallery || !scrollBar) return;
        
        const scrollPercentage = (projectsGallery.scrollLeft / (projectsGallery.scrollWidth - projectsGallery.clientWidth)) * 100;
        const thumbWidth = (projectsGallery.clientWidth / projectsGallery.scrollWidth) * 100;
        
        scrollBar.style.width = `${thumbWidth}%`;
        scrollBar.style.transform = `translateX(${scrollPercentage}%)`;
    }

    if (projectsGallery) {
        projectsGallery.addEventListener('scroll', updateProjectsScrollBar);
        window.addEventListener('resize', updateProjectsScrollBar);
        // Initial update
        updateProjectsScrollBar();
    }
}); 