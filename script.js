// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const allNavElements = document.querySelectorAll('.nav-link, [data-page]');
    const pageSection = document.querySelectorAll('.page-section');

    // Hamburger menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Navigation link handling (including footer legal links)
    allNavElements.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            pageSection.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked link (only if it's a nav-link)
            if (this.classList.contains('nav-link')) {
                this.classList.add('active');
            }
            
            // Show corresponding page section
            const targetPage = this.getAttribute('data-page');
            const targetSection = document.getElementById(targetPage);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    // Handle hash navigation
    function handleHashNavigation() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const targetLink = document.querySelector(`[data-page="${hash}"]`);
            const targetSection = document.getElementById(hash);
            
            if (targetLink && targetSection) {
                // Remove active from all
                navLinks.forEach(l => l.classList.remove('active'));
                pageSection.forEach(section => section.classList.remove('active'));
                
                // Activate target
                targetLink.classList.add('active');
                targetSection.classList.add('active');
            }
        }
    }

    // Handle initial page load with hash
    handleHashNavigation();
    
    // Handle back/forward browser navigation
    window.addEventListener('hashchange', handleHashNavigation);

    // Smooth animations for feature cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards for animation
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add floating animation to navigation
    let lastScrollTop = 0;
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Add parallax effect to hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroImage = document.querySelector('.treasure-chest');
        
        if (heroImage) {
            const rate = scrolled * -0.5;
            heroImage.style.transform = `translateY(${rate}px)`;
        }
    });
});