/* ===== INTRO LOGIC ===== */
const intro = document.getElementById('intro');
const mainContent = document.getElementById('main-content');

document.body.classList.add('intro-active');

/* Pre-decode intro image before revealing it */
if (intro) {
  const introImg = intro.querySelector('.intro-img');

  if (introImg) {
    if (introImg.complete) {
      introImg.classList.add('loaded');
    } else {
      introImg.onload = () => introImg.classList.add('loaded');
      introImg.onerror = () => introImg.classList.add('loaded');
    }
    // Fallback: reveal after 2s regardless
    setTimeout(() => introImg.classList.add('loaded'), 2000);
  }

  intro.addEventListener('click', () => {
    intro.classList.add('hidden');
    document.body.classList.remove('intro-active');

    // Main content fades in after intro starts dissolving
    setTimeout(() => {
      mainContent.classList.remove('locked');
    }, 500);

    // Hero elements stagger in after main content begins appearing
    setTimeout(() => {
      const heroEls = document.querySelectorAll('.hero .reveal');
      heroEls.forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.18}s`;
        el.classList.add('visible');
      });
      const heroUp = document.querySelector('.hero .reveal-up');
      if (heroUp) heroUp.classList.add('visible');
      const heroStats = document.querySelector('.hero-stats');
      if (heroStats) heroStats.classList.add('visible');
    }, 900);
  });
}

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ===== HAMBURGER / MOBILE MENU ===== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

function closeMobile() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
}

/* ===== SCROLL REVEAL ===== */
const revealEls = document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .reveal-up'
);
const cardEls = document.querySelectorAll('.reveal-card');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const index = parseInt(entry.target.dataset.index || '0');
      entry.target.style.setProperty('--delay', index);
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

cardEls.forEach(el => cardObserver.observe(el));

/* ===== EXPERIENCE STAGGER REVEAL ===== */
const expStaggerEls = document.querySelectorAll('.exp-stagger');

const expObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const siblings = Array.from(document.querySelectorAll('.exp-stagger'));
      const index = siblings.indexOf(el);
      el.style.transitionDelay = `${index * 120}ms`;
      el.classList.add('visible');
      expObserver.unobserve(el);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

expStaggerEls.forEach(el => expObserver.observe(el));

/* ===== SMOOTH ACTIVE NAV ===== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? '#000' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ===== FORM SUBMIT ===== */
const form = document.getElementById('td-form');
const toast = document.getElementById('toast');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const u = JSON.parse(localStorage.getItem('bmw_user') || 'null');
  const formData = new FormData(form);

  if (u && u._id) {
    try {
      await fetch((window.location.origin) + '/api/book-test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: u._id,
          user_name: formData.get('fullname') || u.name,
          user_email: formData.get('email') || u.email,
          user_phone: formData.get('phone') || '',
          car_model: formData.get('model') || '',
          date: formData.get('date') || ''
        })
      });
      loadMyBookings();
    } catch (err) { /* server may not be running */ }
  }

  showToast();
  form.reset();
});

/* ===== BOOKING STATUS TRACKER ===== */
async function loadMyBookings() {
  const u = JSON.parse(localStorage.getItem('bmw_user') || 'null');
  const statusEl = document.getElementById('td-status');
  const cardsEl = document.getElementById('td-status-cards');
  const titleEl = document.getElementById('td-status-title');
  const subEl = document.getElementById('td-status-sub');

  if (!u || !u._id || !statusEl) return;

  try {
    const res = await fetch(window.location.origin + '/api/my-test-drives?user_id=' + u._id);
    const bookings = await res.json();

    if (!bookings.length) {
      statusEl.style.display = 'none';
      form.style.display = '';
      return;
    }

    statusEl.style.display = 'block';
    form.style.display = 'none';

    const allApproved = bookings.every(b => b.status === 'approved');
    const hasPending = bookings.some(b => b.status === 'pending');

    const headerSvg = statusEl.querySelector('.td-status-header svg');

    if (allApproved) {
      titleEl.textContent = 'You\'re All Set';
      subEl.textContent = 'Your test drive has been confirmed. See you at the showroom!';
      if (headerSvg) headerSvg.style.stroke = '#1C69D4';
    } else if (hasPending) {
      titleEl.textContent = 'Booking Received';
      subEl.textContent = 'Our team is reviewing your request. We\'ll update you shortly.';
      if (headerSvg) headerSvg.style.stroke = '#c0392b';
    } else {
      titleEl.textContent = 'Booking Status';
      subEl.textContent = 'Here\'s the latest on your test drive requests.';
      if (headerSvg) headerSvg.style.stroke = '#c0392b';
    }

    cardsEl.innerHTML = bookings.map(b => {
      const badgeClass = b.status === 'approved' ? 'td-badge-approved'
                       : b.status === 'rejected' ? 'td-badge-rejected'
                       : 'td-badge-pending';
      const statusText = b.status === 'pending' ? 'Processing' : b.status;

      return `
        <div class="td-booking-card">
          <div class="td-booking-info">
            <h4>${b.car_model}</h4>
            <p>Requested on ${new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div class="td-booking-right">
            <span class="td-booking-badge ${badgeClass}">${statusText}</span>
            ${b.status === 'approved' ? `<div class="td-booking-date" style="color:#1C69D4">Test Drive: ${b.date}</div>` : ''}
            ${b.status === 'pending' ? `<div class="td-booking-date" style="color:#c0392b">Awaiting confirmation</div>` : ''}
            ${b.status === 'rejected' ? `<div class="td-booking-date" style="color:#c0392b">Request declined</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) { /* server may not be running */ }
}

// Load bookings on page load if logged in
loadMyBookings();

// Auto-refresh bookings every 15 seconds
setInterval(loadMyBookings, 15000);

function showToast() {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ===== PARALLAX HERO CAR ===== */
const heroCar = document.querySelector('.hero-car');

if (heroCar) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroCar.style.transform = `translateY(${scrolled * 0.05}px)`;
    }
  }, { passive: true });
}

/* ===== HERO TITLE STAGGER ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Intro trigger handles this now if intro exists
  if (!document.getElementById('intro')) {
    const heroEls = document.querySelectorAll('.hero .reveal');
    heroEls.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.15}s`;
      setTimeout(() => el.classList.add('visible'), 100 + i * 150);
    });

    const heroUp = document.querySelector('.hero .reveal-up');
    if (heroUp) {
      setTimeout(() => heroUp.classList.add('visible'), 600);
    }

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
      setTimeout(() => heroStats.classList.add('visible'), 900);
    }
  }
});

/* ===== AUTH MODAL ===== */
const authOverlay = document.getElementById('auth-overlay');
const loginBtn = document.getElementById('login-btn');
const authClose = document.getElementById('auth-close');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  authOverlay.classList.add('active');
  showLogin();
});

authClose.addEventListener('click', () => {
  authOverlay.classList.remove('active');
});

authOverlay.addEventListener('click', (e) => {
  if (e.target === authOverlay) {
    authOverlay.classList.remove('active');
  }
});

function showLogin() {
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
}

function showRegister() {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
}

const API = window.location.origin + '/api';

// Check if user is already logged in — update nav
function updateNavForUser() {
  const u = JSON.parse(localStorage.getItem('bmw_user') || 'null');
  if (u && loginBtn) {
    loginBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      ${u.name}
    `;
    loginBtn.removeEventListener('click', openAuthModal);
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Logout?')) {
        localStorage.removeItem('bmw_user');
        window.location.reload();
      }
    });
  }
}

function openAuthModal(e) {
  e.preventDefault();
  authOverlay.classList.add('active');
  showLogin();
}

// Re-bind login button
loginBtn.removeEventListener('click', openAuthModal);
loginBtn.addEventListener('click', openAuthModal);
updateNavForUser();

async function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Login failed');
      return;
    }

    localStorage.setItem('bmw_user', JSON.stringify(data));

    authOverlay.classList.remove('active');

    // Redirect based on role
    if (data.role === 'admin') {
      window.location.href = '/admin.html';
    } else if (data.role === 'salesman') {
      window.location.href = '/salesman.html';
    } else {
      window.location.reload();
    }
  } catch (err) {
    alert('Could not connect to server. Make sure it is running.');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirm = formData.get('confirm');

  if (password !== confirm) {
    alert('Passwords do not match');
    return;
  }

  try {
    const res = await fetch(API + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Registration failed');
      return;
    }

    localStorage.setItem('bmw_user', JSON.stringify(data));
    authOverlay.classList.remove('active');
    window.location.reload();
  } catch (err) {
    alert('Could not connect to server. Make sure it is running.');
  }
}
