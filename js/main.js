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
    
    const parseFrames = (item) => {
      const frameString = item.getAttribute('data-frames');
      if (!frameString) return [];
      const thumbs = (item.getAttribute('data-thumbs') || '').split(',').map(s => s.trim());
      return frameString.split(',').map((frame, i) => {
        const [src, title = ''] = frame.split('|').map(part => part.trim());
        return { src, title, thumb: thumbs[i] || src };
      }).filter(frame => frame.src);
    };

    // Warms the browser's cache for a frame so a later swap is instant.
    // Safe to call repeatedly - the Image object is discarded, the
    // decoded bytes stay in the browser's HTTP cache.
    const preloadFrame = (item, frameIndex) => {
      const frames = item._frames;
      if (!frames || !frames.length) return;
      const normalizedIndex = ((frameIndex % frames.length) + frames.length) % frames.length;
      const frame = frames[normalizedIndex];
      if (!frame || frame._preloaded) return;
      frame._preloaded = true;
      const preloadImg = new Image();
      preloadImg.src = frame.src;
    };

    const setFrame = (item, frameIndex) => {
      const frames = item._frames || (item._frames = parseFrames(item));
      if (!frames.length) return;
      const normalizedIndex = ((frameIndex % frames.length) + frames.length) % frames.length;
      const frame = frames[normalizedIndex];

      item.dataset.currentFrame = normalizedIndex;
      item.dataset.fullImage = frame.src;
      item.dataset.title = frame.title || item.dataset.title || '';

      const img = item.querySelector('img');
      if (img) {
        img.src = frame.thumb;
        img.alt = frame.title || img.alt;
      }

      // Preload the frames on either side so the next click feels instant
      // instead of waiting on a fresh network request.
      preloadFrame(item, normalizedIndex + 1);
      preloadFrame(item, normalizedIndex - 1);
    };

    const openLightbox = (index) => {
      currentIndex = (index + galleryItems.length) % galleryItems.length;
      updateLightboxContent(galleryItems[currentIndex]);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };
    
    // Open lightbox
    galleryItems.forEach((item, index) => {
      const frames = parseFrames(item);
      if (frames.length) {
        item._frames = frames;
        setFrame(item, Number(item.dataset.currentFrame || 0));
      }

      item.addEventListener('click', () => {
        openLightbox(index);
      });
    });

    // Book card arrow navigation
    const bookArrowButtons = document.querySelectorAll('.book-arrow');
    bookArrowButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const direction = button.dataset.direction;
        const item = button.closest('.gallery-item');
        if (!item) return;

        const currentFrame = Number(item.dataset.currentFrame || 0);
        const nextFrame = direction === 'prev' ? currentFrame - 1 : currentFrame + 1;
        setFrame(item, nextFrame);
      });
    });

    // Touch/Swipe support for gallery items
    const setupGallerySwipe = () => {
      const galleryItems = document.querySelectorAll('.gallery-item');
      let touchStartX = 0;
      let touchEndX = 0;
      const minSwipeDistance = 50; // Minimum distance for a swipe

      galleryItems.forEach((item) => {
        item.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].clientX;
        }, false);

        item.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].clientX;
          handleGallerySwipe(item);
        }, false);

        const handleGallerySwipe = (item) => {
          const distance = touchStartX - touchEndX;
          if (Math.abs(distance) > minSwipeDistance) {
            const currentFrame = Number(item.dataset.currentFrame || 0);
            if (distance > 0) {
              // Swiped left, show next frame
              setFrame(item, currentFrame + 1);
            } else {
              // Swiped right, show previous frame
              setFrame(item, currentFrame - 1);
            }
          }
        };
      });
    };

    setupGallerySwipe();
    
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
    
    const getCurrentFrameIndex = (item) => Number(item.dataset.currentFrame || 0);
    const getFrameCount = (item) => (item._frames || []).length;

    // Next image
    nextBtn.addEventListener('click', () => {
      const currentItem = galleryItems[currentIndex];
      if (getFrameCount(currentItem) > 1) {
        setFrame(currentItem, getCurrentFrameIndex(currentItem) + 1);
        updateLightboxContent(currentItem);
      } else {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateLightboxContent(galleryItems[currentIndex]);
      }
    });
    
    // Previous image
    prevBtn.addEventListener('click', () => {
      const currentItem = galleryItems[currentIndex];
      if (getFrameCount(currentItem) > 1) {
        setFrame(currentItem, getCurrentFrameIndex(currentItem) - 1);
        updateLightboxContent(currentItem);
      } else {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightboxContent(galleryItems[currentIndex]);
      }
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

  // Touch/Swipe support for lightbox
  const setupLightboxSwipe = () => {
    const lightbox = document.querySelector('.lightbox');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    lightbox.addEventListener('touchstart', (e) => {
      // Only track swipe if not zoomed in (to avoid conflicts with pan)
      if (scale === 1) {
        touchStartX = e.changedTouches[0].clientX;
      }
    }, false);

    lightbox.addEventListener('touchend', (e) => {
      // Only handle swipe if not zoomed in
      if (scale === 1) {
        touchEndX = e.changedTouches[0].clientX;
        const distance = touchStartX - touchEndX;
        if (Math.abs(distance) > minSwipeDistance) {
          if (distance > 0) {
            // Swiped left, show next
            nextBtn.click();
          } else {
            // Swiped right, show previous
            prevBtn.click();
          }
        }
      }
    }, false);
  };

  // Initialize the gallery functionality
  setupGallery();
  setupLightboxSwipe();
  
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