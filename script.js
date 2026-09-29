document.addEventListener('DOMContentLoaded', () => {
  const clickCountEl = document.getElementById('click-count');
  const cookieBtn = document.getElementById('cookie-btn');
  const resetBtn = document.getElementById('reset-btn');

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

  const trophyCards = document.querySelectorAll('.trophy-card');

  function updateAchievements(currentCount) {
    trophyCards.forEach(card => {
      const threshold = parseInt(card.getAttribute('data-threshold'), 10);
      if (currentCount >= threshold) {
        card.classList.remove('locked');
        card.classList.add('unlocked');
      } else {
        card.classList.remove('unlocked');
        card.classList.add('locked');
      }
    });
  }

  // Load persisted count from browser cookie
  const savedCookieCount = getCookie('cookieClicks');
  let count = parseInt(savedCookieCount || '0', 10);
  if (isNaN(count)) count = 0;
  clickCountEl.textContent = count;
  updateAchievements(count);

  function incrementCount(e) {
    count++;
    clickCountEl.textContent = count;
    setCookie('cookieClicks', count, 365);
    updateAchievements(count);

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
    setCookie('cookieClicks', 0, 365);
    updateAchievements(count);
  });
});
