/**
 * Main JavaScript functionality for Sara Freidoony portfolio website
 */

document.addEventListener('DOMContentLoaded', function() {
  // Page navigation
  const navLinks = document.querySelectorAll('nav a, .logo-container a');
  const pages = document.querySelectorAll('.page');
  
  // Set initial active state for navigation based on which page is currently active
  const setInitialActiveNav = () => {
    const activePage = document.querySelector('.page.active');
    if (activePage) {
      const activePageId = activePage.id;
      navLinks.forEach(link => {
        if (link.getAttribute('data-page') === activePageId) {
          link.classList.add('active');
        }
      });
    }
  };
  
  // Call immediately to set initial state
  setInitialActiveNav();
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetPage = this.getAttribute('data-page');
      
      // Hide all pages
      pages.forEach(page => {
        page.classList.remove('active');
      });
      
      // Show target page
      document.getElementById(targetPage).classList.add('active');
      
      // Update active class on navigation links
      navLinks.forEach(navLink => {
        navLink.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
  
  // Lightbox functionality for both galleries
  const setupGallery = (galleryId) => {
    const gallery = document.getElementById(galleryId);
    if (!gallery) return;
    
    const galleryItems = gallery.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentIndex = 0;
    let currentGalleryItems = [];
          
    // Open lightbox
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        currentIndex = index;
        currentGalleryItems = galleryItems;
        
        // Use the full-size image path from data attribute
        const imgSrc = item.getAttribute('data-full-image');
        const imgAlt = item.querySelector('img').getAttribute('alt');
        const imgTitle = item.getAttribute('data-title'); // Retrieve the title from the data attribute
        
        // Update lightbox image source and caption
        lightboxImage.setAttribute('src', imgSrc);
        lightboxImage.setAttribute('alt', imgAlt);
        
        // Make sure the title is displayed in the caption
        if (imgTitle) {
          lightboxCaption.textContent = imgTitle;
          lightboxCaption.style.display = 'block';
        } else {
          lightboxCaption.style.display = 'none';
        }
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
      });
    });
  };
  
  // Setup lightbox for both galleries
  setupGallery('illustration');
  setupGallery('sketchbook');
  
  // Close lightbox
  const lightbox = document.querySelector('.lightbox');
  const closeLightbox = document.querySelector('.close-lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const lightboxCaption = document.querySelector('.lightbox-caption');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  closeLightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
  });
  
  // Close on click outside image
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  // Next image
  nextBtn.addEventListener('click', () => {
    const activePage = document.querySelector('.page.active');
    const galleryItems = activePage.querySelectorAll('.gallery-item');
    
    // Find the current image index by comparing full image paths
    let currentIndex = Array.from(galleryItems).findIndex(item => 
      item.getAttribute('data-full-image') === lightboxImage.getAttribute('src')
    );
    
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateLightboxContent(galleryItems[currentIndex]);
  });
  
  // Previous image
  prevBtn.addEventListener('click', () => {
    const activePage = document.querySelector('.page.active');
    const galleryItems = activePage.querySelectorAll('.gallery-item');
    
    // Find the current image index by comparing full image paths
    let currentIndex = Array.from(galleryItems).findIndex(item => 
      item.getAttribute('data-full-image') === lightboxImage.getAttribute('src')
    );
    
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent(galleryItems[currentIndex]);
  });
  
  // Update lightbox content
  function updateLightboxContent(item) {
    // Use the full-size image path from data attribute
    const imgSrc = item.getAttribute('data-full-image');
    const imgAlt = item.querySelector('img').getAttribute('alt');
    const imgTitle = item.getAttribute('data-title');
    
    // Fade out effect
    lightboxImage.style.opacity = '0';
    
    // Change the image after a short delay (for smooth transition)
    setTimeout(() => {
      // Create a new image element to preload the image
      const tempImg = new Image();
      
      // Set up event handlers before setting the src
      tempImg.onload = function() {
        // Once the image is loaded, update the lightbox image
        lightboxImage.setAttribute('src', imgSrc);
        lightboxImage.setAttribute('alt', imgAlt);
        
        // Make sure the title is displayed in the caption
        if (imgTitle) {
          lightboxCaption.textContent = imgTitle;
          lightboxCaption.style.display = 'block';
        } else {
          lightboxCaption.style.display = 'none';
        }
        
        // Fade in effect
        lightboxImage.style.opacity = '1';
      };
      
      tempImg.onerror = function() {
        console.error('Failed to load image:', imgSrc);
        // Still attempt to show the image in case the error is transient
        lightboxImage.setAttribute('src', imgSrc);
        lightboxImage.setAttribute('alt', imgAlt);
        lightboxImage.style.opacity = '1';
      };
      
      // Start loading the image
      tempImg.src = imgSrc;
    }, 300);
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    } else if (e.key === 'ArrowRight') {
      nextBtn.click();
    } else if (e.key === 'ArrowLeft') {
      prevBtn.click();
    }
  });
  
  // Prevent right-click on images
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });
  
  // Contact form functionality
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // In a real implementation, you would send the form data to a server
      alert('Thank you for your message! I will get back to you soon.');
      contactForm.reset();
    });
  }
});

// Zoom and pan functionality for lightbox images
document.addEventListener("DOMContentLoaded", function () {
  const lightboxImage = document.querySelector(".lightbox-image");
  const leftOverlay = document.querySelector(".left-overlay");
  const rightOverlay = document.querySelector(".right-overlay");
  let scale = 1;
  let isDragging = false;
  let startX, startY, moveX = 0, moveY = 0;
  
  // Add click handlers for side navigation overlays
  if (leftOverlay) {
    leftOverlay.addEventListener("click", function(e) {
      // Only navigate if not zoomed in
      if (scale === 1) {
        document.querySelector(".prev-btn").click();
        e.stopPropagation();
      }
    });
  }
  
  if (rightOverlay) {
    rightOverlay.addEventListener("click", function(e) {
      // Only navigate if not zoomed in
      if (scale === 1) {
        document.querySelector(".next-btn").click();
        e.stopPropagation();
      }
    });
  }

  // Set initial opacity for fade transitions
  if (lightboxImage) {
    lightboxImage.style.opacity = '1';
  }
  
  // Zoom functionality using mouse wheel
  lightboxImage.addEventListener("wheel", function (e) {
    e.preventDefault();
    const scaleFactor = 0.1;
    if (e.deltaY < 0) {
      scale += scaleFactor; // Zoom in
    } else {
      scale = Math.max(1, scale - scaleFactor); // Zoom out, minimum scale = 1
    }
    lightboxImage.style.transform = `scale(${scale}) translate(${moveX}px, ${moveY}px)`;
  });

  // Enable drag when zoomed in
  lightboxImage.addEventListener("mousedown", function (e) {
    if (scale > 1) {
      isDragging = true;
      startX = e.clientX - moveX;
      startY = e.clientY - moveY;
      lightboxImage.style.cursor = "grabbing";
    }
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      moveX = e.clientX - startX;
      moveY = e.clientY - startY;
      lightboxImage.style.transform = `scale(${scale}) translate(${moveX}px, ${moveY}px)`;
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
    lightboxImage.style.cursor = "grab";
  });

  // Reset zoom when closing the lightbox
  document.querySelector(".close-lightbox").addEventListener("click", function () {
    scale = 1;
    moveX = 0;
    moveY = 0;
    lightboxImage.style.transform = `scale(1) translate(0, 0)`;
  });
});
