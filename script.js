const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// 1. Generate Retro Stars Background
function generateStars() {
  const windowContents = $$('.window-content');
  
  windowContents.forEach(content => {
    const starField = $('.star-field', content);
    if (!starField) return;

    // Based on the area, define how many stars
    const rect = content.getBoundingClientRect();
    const area = rect.width * rect.height;
    // approx 1 star per 3000px²
    const starCount = Math.max(5, Math.floor(area / 3000));

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      
      // Star styles
      star.style.position = 'absolute';
      star.style.width = '2px';
      star.style.height = '2px';
      star.style.background = '#FFFFFF';
      
      // We will make it look like a little cross ("+") by using box-shadow
      star.style.boxShadow = '2px 0 0 #FFFFFF, -2px 0 0 #FFFFFF, 0 2px 0 #FFFFFF, 0 -2px 0 #FFFFFF';
      
      // Random position
      star.style.left = `${Math.random() * 95}%`;
      star.style.top = `${Math.random() * 95}%`;
      
      // Random animation delay for twinkling
      const animDelay = Math.random() * 4;
      const animDuration = 1.5 + Math.random() * 2;
      
      star.style.animation = `twinkle ${animDuration}s infinite ease-in-out ${animDelay}s alternate`;
      star.style.opacity = '0.1'; // Base opacity
      
      starField.appendChild(star);
    }
  });

  // Inject twinkle keyframes once
  if (!document.getElementById('star-styles')) {
    const style = document.createElement('style');
    style.id = 'star-styles';
    style.textContent = `
      @keyframes twinkle {
        0% { opacity: 0.1; transform: scale(0.8); }
        100% { opacity: 0.8; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
  }
}

// 2. Setup initial load animations
function setupEntranceAnimation() {
  const windows = $$('.os-window');
  let delay = 0;
  
  windows.forEach((win, index) => {
    win.style.opacity = '0';
    win.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      win.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      win.style.opacity = '1';
      win.style.transform = 'translateY(0)';
    }, 100 + (index * 100));
    
    // reset transition after entrance to allow hover scale
    setTimeout(() => {
      win.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    }, 1000 + (index * 100));
  });
}

function init() {
  generateStars();
  setupEntranceAnimation();
}

document.addEventListener('DOMContentLoaded', init);
