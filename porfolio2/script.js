// Custom Cursor
document.addEventListener('DOMContentLoaded', function() {
    // Create cursor elements
    const cursor = document.createElement('div');
    const cursorDot = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    // Update cursor position
    document.addEventListener('mousemove', function(e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
    });

    // Add hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('button, input, textarea, select, .orbit-nav, .nav-button, .download-cv-btn, .footer-links a, .footer-socials a, .nav__link');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            cursorDot.classList.add('cursor-hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            cursorDot.classList.remove('cursor-hover');
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.display = 'none';
        cursorDot.style.display = 'none';
    });

    // Show cursor when entering window
    document.addEventListener('mouseenter', () => {
        cursor.style.display = 'block';
        cursorDot.style.display = 'block';
    });
});

// Utility functions to safely select elements (prevents null errors)
const safeSelect = (selector, parent = document) => parent.querySelector(selector);
const safeSelectAll = (selector, parent = document) => parent.querySelectorAll(selector);

document.addEventListener('DOMContentLoaded', () => {
    // ----- HEADER & NAVIGATION -----
    const header = safeSelect('.header');
    const navLinks = safeSelectAll('.nav__link');
    const mobileMenuToggle = safeSelect('.mobile-menu-toggle');
    const mobileMenuClose = safeSelect('.mobile-menu-close');
    const navRight = safeSelect('.nav__right');
    const body = document.body;

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    if (navLinks.length) {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = safeSelect(`#${targetId}`);
                    
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // ----- ABOUT SECTION -----
    const aboutSection = safeSelect('#about');
    const navButtons = safeSelectAll('.nav-button');
    const contentSections = safeSelectAll('.content-section');
    
    if (aboutSection && navButtons.length) {
        // Intersection Observer for about section
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && navButtons.length) {
                    // Animate nav buttons when about section is visible
                    navButtons.forEach((button, index) => {
                        if (typeof gsap !== 'undefined') {
                            gsap.fromTo(button, 
                                {
                                    opacity: 0,
                                    x: -20
                                },
                                {
                                    opacity: 1,
                                    x: 0,
                                    duration: 0.5,
                                    delay: index * 0.2,
                                    ease: "power2.out"
                                }
                            );
                        } else {
                            // Fallback if GSAP isn't loaded
                            button.style.opacity = 1;
                            button.style.transform = 'translateX(0)';
                        }
                    });
                }
            });
        }, { threshold: 0.3 });

        aboutObserver.observe(aboutSection);

        // Tab switching functionality
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSection = button.getAttribute('data-section');
                
                // Update active button
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Switch content sections
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.getAttribute('data-content') === targetSection) {
                        section.classList.add('active');
                    }
                });
            });
        });
    }

    // ----- PROJECTS SECTION -----
    const projectSection = safeSelect('#projects');
    const projectsGrid = safeSelect('.projects-grid');
    const scrollLeft = safeSelect('.scroll-left');
    const scrollRight = safeSelect('.scroll-right');
    const projectFolders = safeSelectAll('.project-folder');
    const projectItems = safeSelectAll('.project-item');
    const projectsContainer = document.querySelector('.projects-container');

    if (projectSection && projectsGrid && projectsContainer) {
        // Scroll functionality
        const scrollAmount = 400; // Scroll distance in pixels

        if (scrollLeft && scrollRight) {
            scrollLeft.addEventListener('click', () => {
                projectsGrid.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });

            scrollRight.addEventListener('click', () => {
                projectsGrid.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });

            // Show/hide scroll buttons based on scroll position
            projectsGrid.addEventListener('scroll', () => {
                const isAtStart = projectsGrid.scrollLeft === 0;
                const isAtEnd = projectsGrid.scrollLeft + projectsGrid.clientWidth >= projectsGrid.scrollWidth - 1;

                scrollLeft.style.opacity = isAtStart ? '0' : '1';
                scrollRight.style.opacity = isAtEnd ? '0' : '1';
                
                scrollLeft.style.pointerEvents = isAtStart ? 'none' : 'auto';
                scrollRight.style.pointerEvents = isAtEnd ? 'none' : 'auto';
            });

            // Trigger scroll event to set initial button states
            projectsGrid.dispatchEvent(new Event('scroll'));
        }

        // Optional: Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (projectSection.getBoundingClientRect().top < window.innerHeight && 
                projectSection.getBoundingClientRect().bottom > 0) {
                if (e.key === 'ArrowLeft') {
                    projectsGrid.scrollBy({
                        left: -scrollAmount,
                        behavior: 'smooth'
                    });
                } else if (e.key === 'ArrowRight') {
                    projectsGrid.scrollBy({
                        left: scrollAmount,
                        behavior: 'smooth'
                    });
                }
            }
        });

        // Add this to ensure smooth horizontal scrolling for projects
        const existingListeners = projectsGrid.getEventListeners?.('wheel') || [];
        existingListeners.forEach(listener => {
            projectsGrid.removeEventListener('wheel', listener);
        });

        // Add smooth horizontal scrolling
        projectsGrid.addEventListener('wheel', function(e) {
            if (e.deltaY !== 0) {
                e.preventDefault();
                this.scrollLeft += e.deltaY;
            }
        });

        // Enhanced scroll indicator with click functionality
        const scrollIndicator = document.querySelector('.projects-scroll-indicator');
        const scrollThumb = document.querySelector('.projects-scroll-thumb');
        
        function updateScrollIndicator() {
            if (scrollIndicator && scrollThumb) {
                const scrollPercentage = projectsGrid.scrollLeft / (projectsGrid.scrollWidth - projectsGrid.clientWidth);
                const thumbWidth = (projectsGrid.clientWidth / projectsGrid.scrollWidth) * 100;
                const thumbPosition = scrollPercentage * (100 - thumbWidth);
                
                // Update the custom scroll indicator
                scrollThumb.style.width = `${thumbWidth}%`;
                scrollThumb.style.left = `${thumbPosition}%`;
            }
            
            // Update CSS variables for any other uses
            const scrollPercentage = projectsGrid.scrollLeft / (projectsGrid.scrollWidth - projectsGrid.clientWidth);
            projectsContainer.style.setProperty('--scroll-percentage', scrollPercentage);
        }
        
        projectsGrid.addEventListener('scroll', updateScrollIndicator);
        
        // Make scroll indicator clickable
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', (e) => {
                const rect = scrollIndicator.getBoundingClientRect();
                const clickPosition = (e.clientX - rect.left) / rect.width;
                const maxScrollLeft = projectsGrid.scrollWidth - projectsGrid.clientWidth;
                const targetScrollLeft = clickPosition * maxScrollLeft;
                
                projectsGrid.scrollTo({
                    left: targetScrollLeft,
                    behavior: 'smooth'
                });
            });
            
            // Add hover effect
            scrollIndicator.style.cursor = 'pointer';
        }
        
        // Initial update
        updateScrollIndicator();
    }

    if (projectSection && projectFolders.length) {
        // VERBETERDE ANIMATIE OP SCROLL - Geen donkere projecten meer
        const folderObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && typeof gsap !== 'undefined') {
                    // Verwijder opacity animatie - alleen positie animatie
                    gsap.from(entry.target, {
                        y: 30,                    // Minder beweging
                        duration: 0.6,            // Snellere animatie
                        delay: index * 0.08,      // Minder vertraging
                        ease: 'power2.out',
                        clearProps: 'opacity'     // Belangrijk: zorgt dat opacity niet verandert
                    });
                    
                    // Zorg ervoor dat alle projecten standaard volledig zichtbaar zijn
                    gsap.set(entry.target, {
                        opacity: 1,
                        clearProps: 'filter,brightness'
                    });
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "-10px"
        });

        // Setup folder interactions
        projectFolders.forEach(folder => {
            // Zet folder meteen op zichtbaar
            folder.style.opacity = 1;
            
            // Add to observer
            folderObserver.observe(folder);
            
            // Get folder elements
            const folderTab = safeSelect('.folder-tab', folder);
            const viewIcon = safeSelect('.folder-icon--view', folder);
            const closeIcon = safeSelect('.folder-icon--close', folder);
            const folderPreview = safeSelect('.folder-preview', folder);
            const folderContent = safeSelect('.folder-content', folder);
            
            if (folderTab) {
                folderTab.addEventListener('click', () => {
                    // Close all other folders
                    projectFolders.forEach(otherFolder => {
                        if (otherFolder !== folder && otherFolder.classList.contains('active')) {
                            otherFolder.classList.remove('active');
                            // Reset other folder content positions
                            const otherContent = safeSelect('.folder-content', otherFolder);
                            if (otherContent && typeof gsap !== 'undefined') {
                                gsap.set(otherContent, { y: '100%' });
                            } else if (otherContent) {
                                otherContent.style.transform = 'translateY(100%)';
                            }
                        }
                    });
                    
                    // Toggle current folder
                    folder.classList.toggle('active');
                    
                    if (folder.classList.contains('active') && typeof gsap !== 'undefined') {
                        // Animate folder content
                        const folderDetails = safeSelectAll('.folder-details > *', folder);
                        
                        if (folderContent && folderDetails.length > 0) {
                            gsap.fromTo(folderContent,
                                { y: '100%' },
                                { y: '0%', duration: 0.4, ease: 'power2.out' }
                            );
                            
                            gsap.fromTo(folderDetails, 
                                { y: 20, opacity: 0 },
                                { 
                                    y: 0, 
                                    opacity: 1, 
                                    duration: 0.4, 
                                    stagger: 0.07,
                                    delay: 0.1,
                                    ease: 'power2.out'
                                }
                            );
                            
                            // Optioneel: Vervaag de preview een beetje
                            if (folderPreview) {
                                gsap.to(folderPreview, {
                                    opacity: 0.7,
                                    duration: 0.3
                                });
                            }
                        }
                    } else {
                        // Sluit de folder en reset de preview
                        closeFolder(folder);
                    }
                });
            }
            
            if (viewIcon) {
                viewIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (folderTab && !folder.classList.contains('active')) {
                        folderTab.click();
                    }
                });
            }
            
            if (closeIcon) {
                closeIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (folder.classList.contains('active')) {
                        closeFolder(folder);
                        folder.classList.remove('active');
                    }
                });
            }
            
            // Functie om folder te sluiten en afbeelding weer zichtbaar te maken
            function closeFolder(folderElement) {
                const preview = safeSelect('.folder-preview', folderElement);
                const content = safeSelect('.folder-content', folderElement);
                
                // Verwijder active class
                folderElement.classList.remove('active');
                
                // Reset content positie
                if (content && typeof gsap !== 'undefined') {
                    gsap.to(content, {
                        y: '100%',
                        duration: 0.3,
                        ease: 'power2.in'
                    });
                    
                    // Maak preview weer volledig zichtbaar
                    if (preview) {
                        gsap.to(preview, {
                            opacity: 1,
                            duration: 0.3
                        });
                    }
                } else if (content) {
                    // Fallback zonder GSAP
                    content.style.transform = 'translateY(100%)';
                    if (preview) preview.style.opacity = 1;
                }
            }
        });
    }

    if (projectSection && projectItems.length) {
        console.log("Project animations initializing for", projectItems.length, "items");
        
        // Track scroll position to determine direction
        let lastScrollY = window.scrollY;
        let scrollDirection = 'down'; // Default direction
        
        // Function to reset and prepare projects for animation
        function resetProjectAnimations() {
            // Reset the project arrays
            const topRowProjects = [];
            const bottomRowProjects = [];
            
            // Determine current scroll direction
            scrollDirection = window.scrollY < lastScrollY ? 'up' : 'down';
            lastScrollY = window.scrollY;
            
            console.log("Preparing projects with scroll direction:", scrollDirection);
            
            projectItems.forEach((item, index) => {
                // Reset styles and remove classes
                item.style.opacity = "0";
                item.classList.remove('animate-from-right', 'animate-from-left', 'animate-from-top', 'animate-from-bottom', 'visible');
                
                // Sort into top and bottom rows (first 3 in top, rest in bottom)
                if (index < 3) {
                    topRowProjects.push(item);
                    // Apply different animation classes based on scroll direction
                    if (scrollDirection === 'down') {
                        item.classList.add('animate-from-top');
                    } else {
                        item.classList.add('animate-from-bottom');
                    }
                } else {
                    bottomRowProjects.push(item);
                    // Apply different animation classes based on scroll direction
                    if (scrollDirection === 'down') {
                        item.classList.add('animate-from-bottom');
                    } else {
                        item.classList.add('animate-from-top');
                    }
                }
            });
            
            return { topRowProjects, bottomRowProjects };
        }
        
        // Function to run the animations
        function animateProjects() {
            // Reset animations before starting
            const { topRowProjects, bottomRowProjects } = resetProjectAnimations();
            
            // Animation delay
            const staggerDelay = 200;
            const sequenceDelay = 800;
            
            // Always animate top row first, then bottom row, regardless of scroll direction
            console.log("Animating top row first");
            
            // Start animations for top row
            topRowProjects.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('visible');
                    console.log("Animating top row item", index);
                }, 300 + (staggerDelay * index));
            });
            
            // Calculate when to start bottom row animations
            const topRowDuration = 300 + (topRowProjects.length * staggerDelay) + sequenceDelay;
            
            // Start bottom row after top row is complete
            setTimeout(() => {
                console.log("Animating bottom row");
                bottomRowProjects.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                        console.log("Animating bottom row item", index);
                    }, staggerDelay * index);
                });
            }, topRowDuration);
        }
        
        // Flag to track if we're currently in the projects section
        let isInProjectsSection = false;
        
        // Create an observer for the projects section that runs each time it's visible
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // Check if we're entering or leaving the section
                if (entry.isIntersecting && !isInProjectsSection) {
                    // We just entered the section
                    isInProjectsSection = true;
                    console.log("Projects section is now visible, starting animations");
                    // Start the animation sequence
                    animateProjects();
                } else if (!entry.isIntersecting && isInProjectsSection) {
                    // We just left the section
                    isInProjectsSection = false;
                    console.log("Left projects section, resetting animation state");
                }
            });
        }, {
            threshold: 0.01,
            rootMargin: "0px"
        });
        
        // Update last scroll position on scroll
        window.addEventListener('scroll', () => {
            // Store the last scroll position before entering projects section
            if (!isInProjectsSection) {
                lastScrollY = window.scrollY;
            }
        });
        
        // Start observing the projects section
        sectionObserver.observe(projectSection);
        
        // Initial animation setup
        resetProjectAnimations();
    }

    // ----- HOBBY SLIDER -----
    initHobbySlider();

    // ----- SCROLL ANIMATIONS -----
    initializeScrollAnimations();

    // Project details toggle - Eenvoudige en lichte implementatie
    const infoButtons = document.querySelectorAll('.info-toggle');
    
    if (infoButtons.length) {
        infoButtons.forEach(button => {
            button.addEventListener('click', () => {
                const projectItem = button.closest('.project-item');
                
                // Toggle show-details class
                projectItem.classList.toggle('show-details');
                
                // Change button icon
                const icon = button.querySelector('i');
                if (projectItem.classList.contains('show-details')) {
                    icon.classList.remove('fa-info-circle');
                    icon.classList.add('fa-times-circle');
                } else {
                    icon.classList.remove('fa-times-circle');
                    icon.classList.add('fa-info-circle');
                }
            });
        });
    }

    // CV Download Button Animation
    const downloadBtn = document.querySelector('.download-cv-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // Add downloading class to start animation
            this.classList.add('downloading');
            
            // Simulate download progress
            setTimeout(() => {
                // Add completed class to show checkmark
                this.classList.add('completed');
                
                // Trigger actual download after animation
                setTimeout(() => {
                    // Update this path to your actual CV PDF file
                    const cvPath = 'assets/cv/cv.pdf';
                    
                    // Create a temporary link element
                    const link = document.createElement('a');
                    link.href = cvPath;
                    link.download = 'Thierry_Oudshoorn_CV.pdf';
                    
                    // Append to body, click, and remove
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Reset button state after download
                    setTimeout(() => {
                        this.classList.remove('downloading', 'completed');
                    }, 2000);
                }, 500);
            }, 2000);
        });
    }

    // Mobile Menu Functionality
    if (mobileMenuToggle && mobileMenuClose && navRight) {
        mobileMenuToggle.addEventListener('click', () => {
            if (navRight) navRight.classList.add('active');
            if (body) body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        });

        mobileMenuClose.addEventListener('click', () => {
            if (navRight) navRight.classList.remove('active');
            if (body) body.style.overflow = ''; // Restore scrolling
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navRight) navRight.classList.remove('active');
                if (body) body.style.overflow = ''; // Restore scrolling
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navRight && navRight.classList.contains('active') && 
                !navRight.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                navRight.classList.remove('active');
                if (body) body.style.overflow = ''; // Restore scrolling
            }
        });
    }

    // Handle scroll events for header
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (header) {
            if (currentScroll <= 0) {
                header.classList.remove('scroll-up');
                return;
            }

            if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
                // Scroll Down
                header.classList.remove('scroll-up');
                header.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
                // Scroll Up
                header.classList.remove('scroll-down');
                header.classList.add('scroll-up');
            }
        }
        lastScroll = currentScroll;
    });

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            // Only try to scroll if href is more than just "#"
            if (href.length > 1) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for fade-in
    document.querySelectorAll('.project-item, .skill-card, .content-section').forEach(el => {
        el.classList.add('fade-in-ready');
        observer.observe(el);
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Reset mobile menu on larger screens
            if (window.innerWidth > 768) {
                if (navRight) navRight.classList.remove('active');
                if (body) body.style.overflow = '';
            }
        }, 250);
    });

    // Handle project info toggles
    const infoToggles = document.querySelectorAll('.info-toggle');
    infoToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const projectItem = toggle.closest('.project-item');
            const details = projectItem.querySelector('.project-details');
            details.classList.toggle('active');
        });
    });

    // Close project details when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.project-item')) {
            document.querySelectorAll('.project-details').forEach(details => {
                details.classList.remove('active');
            });
        }
    });

    // Enhanced Projects horizontal scroll with touch support
    if (projectsGrid && !projectsGrid.hasScrollHandlers) {
        // Mark as having handlers to prevent duplicates
        projectsGrid.hasScrollHandlers = true;
        
        // Enable smooth horizontal scrolling with mouse wheel
        projectsGrid.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                projectsGrid.scrollLeft += e.deltaY;
            }
        });

        // Add touch scrolling for mobile
        let touchStart = 0;
        let touchX = 0;
        let isDragging = false;

        projectsGrid.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientX;
            touchX = projectsGrid.scrollLeft;
        });

        projectsGrid.addEventListener('touchmove', (e) => {
            if (!touchStart) return;
            e.preventDefault();
            const touch = e.touches[0];
            const diff = touchStart - touch.clientX;
            projectsGrid.scrollLeft = touchX + diff;
        });

        projectsGrid.addEventListener('touchend', () => {
            touchStart = 0;
        });

        // Add mouse drag scrolling
        projectsGrid.addEventListener('mousedown', (e) => {
            isDragging = true;
            touchStart = e.clientX;
            touchX = projectsGrid.scrollLeft;
            projectsGrid.style.cursor = 'grabbing';
            projectsGrid.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const diff = touchStart - e.clientX;
            projectsGrid.scrollLeft = touchX + diff;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (projectsGrid) {
                projectsGrid.style.cursor = 'grab';
                projectsGrid.style.userSelect = '';
            }
        });

        // Prevent click events while dragging
        projectsGrid.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // Add grab cursor
        projectsGrid.style.cursor = 'grab';
    }

    // Helper function to check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }

    // Project item animations
    if (projectItems.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }
            });
        }, {
            threshold: 0.01
        });

        projectItems.forEach(item => {
            observer.observe(item);
        });
    }

    // Project Cards Scroll Animation
    const projectCards = document.querySelectorAll('.project-card');
    const projectsHeader = document.querySelector('.projects-header');
    
    // Intersection Observer voor scroll-triggered animaties
    const projectObserverOptions = {
        threshold: 0.01,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const projectObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, projectObserverOptions);
    
    // Observeer alle project cards
    projectCards.forEach(card => {
        projectObserver.observe(card);
    });
    
    // Observeer de header
    if (projectsHeader) {
        projectObserver.observe(projectsHeader);
    }
    
    // Parallax effect voor project images
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const projectsSection = document.querySelector('.projects-section');
        
        if (projectsSection) {
            const rect = projectsSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                projectCards.forEach((card, index) => {
                    const img = card.querySelector('img');
                    if (img) {
                        const speed = 0.5 + (index * 0.1);
                        const yPos = -(scrolled * speed * 0.01);
                        img.style.transform = `translateY(${yPos}px) scale(${card.matches(':hover') ? '1.1' : '1'})`;
                    }
                });
            }
        }
    }, { passive: true });
    
    // Hover sound effect (optioneel)
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.setProperty('--hover-intensity', '1');
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--hover-intensity', '0');
        });
    });
});

// Create and initialize the orbit navigation system
function createOrbitNavigation(slider, slides, currentIndex) {
    // Remove old navigation if exists
    const oldNav = slider.querySelector('.orbit-navigation');
    if (oldNav) oldNav.remove();
    
    // Create the orbit navigation container
    const orbitNav = document.createElement('div');
    orbitNav.className = 'orbit-navigation';    
    
    // Create galaxy backdrop with stars
    const galaxyBackdrop = document.createElement('div');
    galaxyBackdrop.className = 'galaxy-backdrop';
    
    // Add stars to galaxy backdrop
    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        galaxyBackdrop.appendChild(star);
    }
    
    orbitNav.appendChild(galaxyBackdrop);
    
    // Create track
    const track = document.createElement('div');
    track.className = 'orbit-track';
    
    // Create progress indicator
    const progress = document.createElement('div');
    progress.className = 'orbit-progress';
    track.appendChild(progress);
    
    // Create planets container
    const planetsContainer = document.createElement('div');
    planetsContainer.className = 'orbit-planets';
    
    // Create spacecraft
    const spacecraft = document.createElement('div');
    spacecraft.className = 'orbit-spacecraft';
    spacecraft.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12,0 C10.34,0 9,1.34 9,3 C9,4.66 10.34,6 12,6 C13.66,6 15,4.66 15,3 C15,1.34 13.66,0 12,0 Z M12,9 C7.03,9 3,13.03 3,18 L3,24 L21,24 L21,18 C21,13.03 16.97,9 12,9 Z"></path>
        </svg>
    `;
    
    // Add planets for each slide
    slides.forEach((slide, index) => {
        const planet = document.createElement('div');
        planet.className = 'orbit-planet';
        if (index === currentIndex) planet.classList.add('active');
        
        // Extract title from slide
        const slideTitle = slide.querySelector('h3')?.textContent || `Slide ${index + 1}`;
        
        // Add title to planet
        const title = document.createElement('span');
        title.className = 'orbit-title';
        title.textContent = slideTitle;
        planet.appendChild(title);
        
        // Add click event
        planet.addEventListener('click', () => {
            // Update active planet
            const planets = planetsContainer.querySelectorAll('.orbit-planet');
            planets.forEach(p => p.classList.remove('active'));
            planet.classList.add('active');
            
            // Calculate progress
            const progressPercent = (index / (slides.length - 1)) * 100;
            progress.style.width = `${progressPercent}%`;
            
            // Move spacecraft
            const planetPosition = index / (slides.length - 1);
            spacecraft.style.left = `${planetPosition * 100}%`;
            
            // Show the corresponding slide
            showSlide(index);
        });
        
        planetsContainer.appendChild(planet);
    });
    
    // Add elements to DOM
    track.appendChild(planetsContainer);
    track.appendChild(spacecraft);
    orbitNav.appendChild(track);
    
    // Add orbit navigation after the content
    const firstSlideContainer = slider.querySelector('.hobby-slide-container');
    if (firstSlideContainer) {
        firstSlideContainer.appendChild(orbitNav);
    } else {
        slider.appendChild(orbitNav);
    }
    
    // Set initial state
    progress.style.width = `${(currentIndex / (slides.length - 1)) * 100}%`;
    spacecraft.style.left = `${(currentIndex / (slides.length - 1)) * 100}%`;
    
    // Make spacecraft draggable
    let isDragging = false;
    let startX, startLeft;
    
    spacecraft.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.clientX;
        startLeft = parseFloat(spacecraft.style.left) || 0;
        spacecraft.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        
        const trackWidth = track.offsetWidth;
        const delta = e.clientX - startX;
        const percentDelta = (delta / trackWidth) * 100;
        let newLeft = startLeft + percentDelta;
        
        // Clamp to track bounds
        newLeft = Math.max(0, Math.min(100, newLeft));
        
        // Update spacecraft position
        spacecraft.style.left = `${newLeft}%`;
        
        // Update progress
        progress.style.width = `${newLeft}%`;
        
        // Calculate nearest planet
        const planetIndex = Math.round(newLeft / (100 / (slides.length - 1)));
        
        // Highlight active planet
        const planets = planetsContainer.querySelectorAll('.orbit-planet');
        planets.forEach((p, i) => {
            p.classList.toggle('active', i === planetIndex);
        });
        
        // Show the corresponding slide
        showSlide(planetIndex);
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            spacecraft.style.cursor = 'pointer';
            
            // Snap to nearest planet
            const currentLeft = parseFloat(spacecraft.style.left) || 0;
            const planetIndex = Math.round(currentLeft / (100 / (slides.length - 1)));
            const snapLeft = (planetIndex / (slides.length - 1)) * 100;
            
            // Animate to snap position
            spacecraft.style.transition = 'left 0.3s ease';
            spacecraft.style.left = `${snapLeft}%`;
            progress.style.width = `${snapLeft}%`;
            
            // Reset transition after animation
            setTimeout(() => {
                spacecraft.style.transition = '';
            }, 300);
        }
    });
    
    // Add touch events for mobile
    spacecraft.addEventListener('touchstart', e => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startLeft = parseFloat(spacecraft.style.left) || 0;
    });
    
    document.addEventListener('touchmove', e => {
        if (!isDragging) return;
        
        const trackWidth = track.offsetWidth;
        const delta = e.touches[0].clientX - startX;
        const percentDelta = (delta / trackWidth) * 100;
        let newLeft = startLeft + percentDelta;
        
        // Clamp to track bounds
        newLeft = Math.max(0, Math.min(100, newLeft));
        
        // Update spacecraft position
        spacecraft.style.left = `${newLeft}%`;
        
        // Update progress
        progress.style.width = `${newLeft}%`;
        
        // Calculate nearest planet
        const planetIndex = Math.round(newLeft / (100 / (slides.length - 1)));
        
        // Highlight active planet
        const planets = planetsContainer.querySelectorAll('.orbit-planet');
        planets.forEach((p, i) => {
            p.classList.toggle('active', i === planetIndex);
        });
        
        // Show the corresponding slide
        showSlide(planetIndex);
    });
    
    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            
            // Snap to nearest planet
            const currentLeft = parseFloat(spacecraft.style.left) || 0;
            const planetIndex = Math.round(currentLeft / (100 / (slides.length - 1)));
            const snapLeft = (planetIndex / (slides.length - 1)) * 100;
            
            // Animate to snap position
            spacecraft.style.transition = 'left 0.3s ease';
            spacecraft.style.left = `${snapLeft}%`;
            progress.style.width = `${snapLeft}%`;
            
            // Reset transition after animation
            setTimeout(() => {
                spacecraft.style.transition = '';
            }, 300);
        }
    });
    
    return orbitNav;
}

// ----- HOBBY SLIDER -----
function initHobbySlider() {
    // Define safeSelect functions locally to avoid reference errors
    const safeSelect = (selector, parent = document) => parent.querySelector(selector);
    const safeSelectAll = (selector, parent = document) => parent.querySelectorAll(selector);
    
    const orbitContainer = safeSelect('.orbit-container');
    const orbitNavs = safeSelectAll('.orbit-nav');
    const slides = safeSelectAll('.hobby-slide');
    
    if (!orbitContainer || !orbitNavs.length || !slides.length) {
        console.warn('Hobby slider elements not found');
        return;
    }
    
    // No rotation - set transform to none
    if (orbitContainer) orbitContainer.style.transform = 'none';
    orbitNavs.forEach(nav => { nav.style.transform = 'none'; });
    
    // Handle navigation clicks
    orbitNavs.forEach((nav, index) => {
        nav.addEventListener('click', () => {
            // Update active state
            orbitNavs.forEach(n => n.classList.remove('active'));
            nav.classList.add('active');
            
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Show selected slide
            if (slides[index]) {
                slides[index].classList.add('active');
            }
        });
    });
}

// Initialize scroll animations with GSAP if available
function initializeScrollAnimations() {
    // Check if GSAP and ScrollTrigger are loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    if (sectionHeaders.length) {
        sectionHeaders.forEach(header => {
            gsap.from(header.children, {
        y: 50,
        opacity: 0,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: header,
                    start: "top 80%",
                    toggleActions: "play none none none"
            }
        });
    });
}

    // Animate skills cards if they exist
    const skillCards = document.querySelectorAll('.skill-card');
    if (skillCards.length) {
        gsap.from(skillCards, {
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.skills-grid',
                start: "top 75%",
                toggleActions: "play none none none"
            }
        });
    }
}

// Hobby Slider functionality with Orbit Navigation
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.hobby-slide');
  const orbitNavs = document.querySelectorAll('.orbit-nav');
  
  orbitNavs.forEach(nav => {
    nav.addEventListener('click', function() {
      const slideIndex = parseInt(this.getAttribute('data-slide'));
      
      // Remove active class from all slides and navigation buttons
      slides.forEach(slide => slide.classList.remove('active'));
      orbitNavs.forEach(nav => nav.classList.remove('active'));
      
      // Add active class to selected slide and navigation button
      slides[slideIndex].classList.add('active');
      this.classList.add('active');
    });
  });

  // Remove the automatic rotation effect
  const orbitContainer = document.querySelector('.orbit-container');
  
  // Only for browsers that don't support the CSS rule
  if (orbitContainer) {
    orbitContainer.style.transform = 'none';
    
    const orbitNavs = document.querySelectorAll('.orbit-nav');
    orbitNavs.forEach(nav => {
      nav.style.transform = 'none';
    });
  }
});

// Check if we're in the about section on page load and set class accordingly
document.addEventListener('DOMContentLoaded', function () {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    // Helper function to determine if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const viewportCenter = window.innerHeight / 2;
        const adjustedTop = rect.top + (headerHeight / 2);

        return (
            adjustedTop <= viewportCenter &&
            rect.bottom >= viewportCenter
        );
    }

    // Check initially
    if (isInViewport(aboutSection)) {
        document.body.classList.add('about-active');
    } else {
        document.body.classList.remove('about-active');
    }

    // Update on scroll
    window.addEventListener('scroll', function () {
        if (isInViewport(aboutSection)) {
            document.body.classList.add('about-active');
        } else {
            document.body.classList.remove('about-active');
        }
    }, { passive: true });

    // Fix for Safari and iOS scroll issues
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isSafari || isIOS) {
        document.documentElement.style.scrollBehavior = 'auto';

        // Manually handle smooth scrolling
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.querySelector(`#${targetId}`);

                    if (targetElement) {
                        // Smooth scroll using animation
                        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                        const targetPosition = targetElement.offsetTop - headerHeight;
                        const startPosition = window.pageYOffset;
                        const distance = targetPosition - startPosition;
                        const duration = 800;
                        let start = null;

                        function step(timestamp) {
                            if (!start) start = timestamp;
                            const progress = timestamp - start;
                            const percent = Math.min(progress / duration, 1);

                            window.scrollTo(0, startPosition + distance * easeInOutCubic(percent));

                            if (progress < duration) {
                                window.requestAnimationFrame(step);
                            }
                        }

                        function easeInOutCubic(t) {
                            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                        }

                        window.requestAnimationFrame(step);
                    }
                }
            });
        });
    }

    // Perfect Grid
    function adjustGridItems() {
        // Projects grid
        const projectGrids = document.querySelectorAll('.projects-grid');
        projectGrids.forEach(grid => {
            const items = grid.querySelectorAll('.project-item');
            if (window.innerWidth >= 1200 && items.length % 3 !== 0) {
                // For 3-column layout
                const remainder = items.length % 3;
                if (remainder === 1) {
                    // One item in last row - center it
                    const lastItem = items[items.length - 1];
                    lastItem.style.gridColumn = '2';
                } else if (remainder === 2) {
                    // Two items in last row - position them
                    const secondLastItem = items[items.length - 2];
                    secondLastItem.style.gridColumn = '1';
                    const lastItem = items[items.length - 1];
                    lastItem.style.gridColumn = '3';
                }
            } else if (window.innerWidth >= 768 && window.innerWidth < 1200 && items.length % 2 !== 0) {
                // For 2-column layout
                const lastItem = items[items.length - 1];
                lastItem.style.gridColumn = '1 / span 2';
                lastItem.style.maxWidth = '600px';
                lastItem.style.margin = '0 auto';
            } else {
                // Reset styles
                items.forEach(item => {
                    item.style.gridColumn = '';
                    item.style.maxWidth = '';
                    item.style.margin = '';
                });
            }
        });
    }

    // Run on load and resize
    adjustGridItems();
    window.addEventListener('resize', adjustGridItems);
});