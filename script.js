document.addEventListener('DOMContentLoaded', () => {
  const clickCountEl = document.getElementById('click-count');
  const cookieBtn = document.getElementById('cookie-btn');
  const resetBtn = document.getElementById('reset-btn');

  const SECRET_SALT = 'c00k13_cl1ck3r_s3cr3t_s4lt_2025';

  // Simple string hash for cookie integrity checking
  function computeHash(val) {
    let hash = 0;
    const str = `${val}:${SECRET_SALT}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }

  function loadSecureCount() {
    const rawVal = getCookie('cookieClicks');
    const signature = getCookie('cookieSig');

    if (!rawVal) return 0;

    const count = parseInt(rawVal, 10);
    if (isNaN(count) || count < 0) return 0;

    // Verify cookie integrity signature
    const expectedSig = computeHash(count);
    if (signature !== expectedSig) {
      console.warn('Cookie tampering detected! Count has been reset.');
      saveSecureCount(0);
      return 0;
    }

    return count;
  }

  function saveSecureCount(newCount) {
    const sig = computeHash(newCount);
    setCookie('cookieClicks', newCount, 365);
    setCookie('cookieSig', sig, 365);
  }

  // Load initial validated count
  let count = loadSecureCount();
  clickCountEl.textContent = count;

  function incrementCount(e) {
    count++;
    clickCountEl.textContent = count;
    saveSecureCount(count);

    createFloatingText(e);
  }

  function createFloatingText(e) {
    const text = document.createElement('div');
    text.className = 'floating-text';
    text.textContent = '+1';

    const rect = cookieBtn.getBoundingClientRect();
    let x, y;

    if (e && e.clientX && e.clientY) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      x = rect.width / 2;
      y = rect.height / 2;
    }

    text.style.left = `${x}px`;
    text.style.top = `${y}px`;

    cookieBtn.appendChild(text);

    setTimeout(() => {
      text.remove();
    }, 800);
  }

  cookieBtn.addEventListener('click', incrementCount);
  cookieBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      incrementCount(e);
    }
  });

  resetBtn.addEventListener('click', () => {
    count = 0;
    clickCountEl.textContent = count;
    saveSecureCount(0);
  });

  // --- Client-side anti-tampering & Developer Tools Prevention ---

  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Prevent developer tool shortcuts
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I (Inspect)
    // Ctrl+Shift+J / Cmd+Option+J (Console)
    // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
    // Ctrl+U / Cmd+Option+U (View Source)
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.shiftKey || e.altKey || e.key.toLowerCase() === 'u')
    ) {
      const key = e.key.toLowerCase();
      if (['i', 'j', 'c', 'u'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  });
});
