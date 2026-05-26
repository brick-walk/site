// ===================================
// Portfolio Template JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Mobile Menu Toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('active');
    });
  }

  // Mobile Dropdown Toggle
  const dropdownItems = document.querySelectorAll('.has-dropdown');
  
  dropdownItems.forEach(function(item) {
    const link = item.querySelector('.nav-link');
    
    link.addEventListener('click', function(e) {
      // Only toggle on mobile
      if (window.innerWidth <= 768) {
        e.preventDefault();
        item.classList.toggle('active');
        
        // Rotate arrow
        const arrow = this.querySelector('::after');
        if (item.classList.contains('active')) {
          this.style.setProperty('--arrow-rotation', '180deg');
        } else {
          this.style.setProperty('--arrow-rotation', '0deg');
        }
      }
    });
  });

  // Header scroll effect
  const header = document.querySelector('.site-header');
  
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Lightbox functionality for portfolio items
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  let lightbox = null;

  function createLightbox() {
    if (lightbox) return;
    
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
      <img class="lightbox-content" src="" alt="">
    `;
    document.body.appendChild(lightbox);

    // Close lightbox on click
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        closeLightbox();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  function openLightbox(imgSrc, imgAlt) {
    if (!lightbox) createLightbox();
    
    const lightboxImg = lightbox.querySelector('.lightbox-content');
    lightboxImg.src = imgSrc;
    lightboxImg.alt = imgAlt;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Add lightbox to portfolio items on homepage only
  if (document.querySelector('.portfolio-grid')) {
    portfolioItems.forEach(function(item) {
      // If it's a direct link to project page, don't override
      // This allows the template to work both ways
      const img = item.querySelector('img');
      
      // Add keyboard accessibility
      item.setAttribute('tabindex', '0');
      
      item.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          // Navigate to href if it exists, otherwise open lightbox
          if (this.href && this.href !== '#') {
            window.location.href = this.href;
          } else if (img) {
            openLightbox(img.src, img.alt);
          }
        }
      });
    });
  }

  // Lazy loading images with Intersection Observer
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  // Form validation (for contact page)
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      
      // Basic validation
      let isValid = true;
      const requiredFields = this.querySelectorAll('[required]');
      
      requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = '#e74c3c';
        } else {
          field.style.borderColor = '';
        }
      });
      
      // Email validation
      const emailField = this.querySelector('[type="email"]');
      if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          isValid = false;
          emailField.style.borderColor = '#e74c3c';
        }
      }
      
      if (isValid) {
        // For GitHub Pages, you'll need to integrate with a form service
        // like Formspree, Netlify Forms, or similar
        alert('Thank you for your message! This is a template - please connect a form service for actual submissions.');
        this.reset();
      }
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (mainNav && mainNav.classList.contains('active')) {
      if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mainNav.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Reset mobile menu state on resize to desktop
      if (window.innerWidth > 768) {
        if (mainNav) {
          mainNav.classList.remove('active');
        }
        if (mobileMenuToggle) {
          mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
        // Reset dropdown states
        dropdownItems.forEach(function(item) {
          item.classList.remove('active');
        });
      }
    }, 250);
  });
});
