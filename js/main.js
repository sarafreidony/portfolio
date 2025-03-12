/**
 * Main JavaScript functionality for Sara Freidoony portfolio website
 */

document.addEventListener('DOMContentLoaded', function() {
  // Lightbox functionality for both galleries
  const setupGallery = () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (galleryItems.length === 0) return; // No gallery on this page
    
    let currentIndex = 0;
    
    // Open lightbox
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        currentIndex = index;
        
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
    
    // Close lightbox
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
      currentIndex = (currentIndex + 1) % galleryItems.length;
      updateLightboxContent(galleryItems[currentIndex]);
    });
    
    // Previous image
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      updateLightboxContent(galleryItems[currentIndex]);
    });
  };
  
  // Update lightbox content
  function updateLightboxContent(item) {
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    
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
  
  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    const lightbox = document.querySelector('.lightbox');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
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
  
  // Initialize the gallery functionality
  setupGallery();
  
  // Add active class to current nav item based on URL
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else if (currentPage === '' && href === 'index.html') {
      // Handle the case when URL doesn't have a file name (root of site)
      link.classList.add('active');
    }
  });
  
  // Improved zoom and pan functionality for lightbox images
  const lightboxImage = document.querySelector(".lightbox-image");
  const leftOverlay = document.querySelector(".left-overlay");
  const rightOverlay = document.querySelector(".right-overlay");
  let scale = 1;
  let isDragging = false;
  let startX, startY;
  let moveX = 0, moveY = 0;
  let lastX, lastY;
  let momentumX = 0, momentumY = 0;
  let prevTime = 0;
  let animationId = null;
  
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
    lightboxImage.style.transition = 'opacity 0.3s ease-in-out';
    lightboxImage.style.transformOrigin = '0 0';
  }
  
  // Calculate cursor position relative to the image
  function getCursorPosition(e) {
    const rect = lightboxImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  }
  
  // Zoom functionality using mouse wheel with improved zoom-to-cursor
  lightboxImage.addEventListener("wheel", function(e) {
    e.preventDefault();
    
    // Get cursor position relative to image
    const cursorPos = getCursorPosition(e);
    
    // Get image dimensions
    const rect = lightboxImage.getBoundingClientRect();
    
    // Calculate cursor position as a percentage of the image dimensions
    const cursorXRatio = cursorPos.x / rect.width;
    const cursorYRatio = cursorPos.y / rect.height;
    
    // Calculate the point on the original image that should remain under the cursor
    const imagePointX = cursorPos.x / scale - moveX;
    const imagePointY = cursorPos.y / scale - moveY;
    
    // Calculate the new scale
    const oldScale = scale;
    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
    scale = Math.min(5, Math.max(1, scale * scaleFactor));
    
    // If at min scale, reset position
    if (scale === 1) {
      moveX = 0;
      moveY = 0;
    } else {
      // Calculate new position to keep the same point under the cursor
      moveX = cursorPos.x / scale - imagePointX;
      moveY = cursorPos.y / scale - imagePointY;
      
      // Apply boundary limits
      const maxX = (rect.width * (scale - 1)) / (2 * scale);
      const maxY = (rect.height * (scale - 1)) / (2 * scale);
      
      moveX = Math.max(-maxX, Math.min(maxX, moveX));
      moveY = Math.max(-maxY, Math.min(maxY, moveY));
    }
    
    // Apply transform
    lightboxImage.style.transform = `scale(${scale}) translate(${moveX}px, ${moveY}px)`;
  });

  // Enable drag when zoomed in with natural momentum
  lightboxImage.addEventListener("mousedown", function(e) {
    if (scale > 1) {
      isDragging = true;
      startX = e.clientX - moveX * scale;
      startY = e.clientY - moveY * scale;
      lastX = e.clientX;
      lastY = e.clientY;
      prevTime = Date.now();
      momentumX = momentumY = 0;
      
      // Cancel any ongoing animation
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      
      lightboxImage.style.cursor = "grabbing";
      e.preventDefault();
    }
  });

  document.addEventListener("mousemove", function(e) {
    if (isDragging) {
      const currentTime = Date.now();
      const timeElapsed = currentTime - prevTime;
      
      // Calculate new position
      const newMoveX = (e.clientX - startX) / scale;
      const newMoveY = (e.clientY - startY) / scale;
      
      // Calculate momentum
      if (timeElapsed > 0) {
        momentumX = (e.clientX - lastX) / timeElapsed * 15;
        momentumY = (e.clientY - lastY) / timeElapsed * 15;
      }
      
      // Apply boundary limits
      const rect = lightboxImage.getBoundingClientRect();
      const maxX = (rect.width * (scale - 1)) / (2 * scale);
      const maxY = (rect.height * (scale - 1)) / (2 * scale);
      
      moveX = Math.max(-maxX, Math.min(maxX, newMoveX));
      moveY = Math.max(-maxY, Math.min(maxY, newMoveY));
      
      // Apply transform
      lightboxImage.style.transform = `scale(${scale}) translate(${moveX}px, ${moveY}px)`;
      
      // Update last position and time
      lastX = e.clientX;
      lastY = e.clientY;
      prevTime = currentTime;
    }
  });

  document.addEventListener("mouseup", function() {
    if (isDragging) {
      isDragging = false;
      lightboxImage.style.cursor = "grab";
      
      // Apply momentum effect
      if (Math.abs(momentumX) > 0.1 || Math.abs(momentumY) > 0.1) {
        const animateMomentum = () => {
          // Gradually reduce momentum
          momentumX *= 0.95;
          momentumY *= 0.95;
          
          // Apply momentum to position
          moveX += momentumX / scale;
          moveY += momentumY / scale;
          
          // Apply boundary limits
          const rect = lightboxImage.getBoundingClientRect();
          const maxX = (rect.width * (scale - 1)) / (2 * scale);
          const maxY = (rect.height * (scale - 1)) / (2 * scale);
          
          moveX = Math.max(-maxX, Math.min(maxX, moveX));
          moveY = Math.max(-maxY, Math.min(maxY, moveY));
          
          // Apply transform
          lightboxImage.style.transform = `scale(${scale}) translate(${moveX}px, ${moveY}px)`;
          
          // Continue animation if momentum is still significant
          if (Math.abs(momentumX) > 0.1 || Math.abs(momentumY) > 0.1) {
            animationId = requestAnimationFrame(animateMomentum);
          } else {
            animationId = null;
          }
        };
        
        animationId = requestAnimationFrame(animateMomentum);
      }
    }
  });

  // Double-click to reset zoom
  lightboxImage.addEventListener("dblclick", function() {
    scale = 1;
    moveX = 0;
    moveY = 0;
    momentumX = 0;
    momentumY = 0;
    lightboxImage.style.transform = `scale(1) translate(0, 0)`;
    
    // Cancel any ongoing animation
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  });

  // Reset zoom when closing the lightbox
  document.querySelector(".close-lightbox").addEventListener("click", function() {
    scale = 1;
    moveX = 0;
    moveY = 0;
    momentumX = 0;
    momentumY = 0;
    lightboxImage.style.transform = `scale(1) translate(0, 0)`;
    
    // Cancel any ongoing animation
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  });
  
  // Also reset zoom when changing images
  nextBtn.addEventListener("click", function() {
    scale = 1;
    moveX = 0;
    moveY = 0;
    momentumX = 0;
    momentumY = 0;
    
    // Cancel any ongoing animation
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  });
  
  prevBtn.addEventListener("click", function() {
    scale = 1;
    moveX = 0;
    moveY = 0;
    momentumX = 0;
    momentumY = 0;
    
    // Cancel any ongoing animation
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
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