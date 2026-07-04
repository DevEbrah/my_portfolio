/* ============================================
   MAIN JS — portfolio/js/main.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAV: Scroll shadow ----
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 5);
  }, { passive: true });


  // ---- NAV: Mobile toggle ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav__links');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });


  // ---- SCROLL REVEAL ----
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // only trigger once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));


  // ---- ACTIVE NAV LINK on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

  // ---- CONTACT FORM ----
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;

      // Basic validation
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        showFormFeedback(form, 'Please fill in all required fields.', 'error');
        return;
      }

      // Captcha validation — check if hCaptcha was completed
      const captchaResponse = form.querySelector('[name="h-captcha-response"]');
      const captchaReminder = document.getElementById('captchaReminder');

      if (!captchaResponse || !captchaResponse.value) {
        if (captchaReminder) {
          captchaReminder.style.display = 'block';
          setTimeout(() => {
            captchaReminder.style.display = 'none';
          }, 5000);
        }
        return;
      }

      if (captchaReminder) {
        captchaReminder.style.display = 'none';
      }

      // Show loading state
      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: json
        });

        const result = await response.json();

        if (result.success) {
          showFormFeedback(form, "✅ Message sent! Thank you for reaching out — I'll get back to you as soon as possible!", 'success');
          form.reset();
        } else {
          showFormFeedback(form, result.message || 'Something went wrong. Please try again.', 'error');
        }

      } catch (error) {
        showFormFeedback(form, 'No connection found. Please check your internet and try again.', 'network');
      } finally {
        btn.textContent = original;
        btn.disabled = false;
      }
    });
  }

  // ---- FORM FEEDBACK HELPER ----
  function showFormFeedback(form, message, type) {
    let feedback = document.getElementById('formFeedback');
    if (!feedback) {
      feedback = form.querySelector('.form-feedback');
    }
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'form-feedback';
      form.appendChild(feedback);
    }

    // Pick icon based on type
    let icon = '';
    if (type === 'success') {
      icon = '<i class="fa-solid fa-circle-check"></i>';
    } else if (type === 'error') {
      icon = '<i class="fa-solid fa-circle-exclamation"></i>';
    } else if (type === 'network') {
      icon = '<i class="fa-solid fa-wifi"></i>';
    }

    feedback.innerHTML = `${icon} ${message}`;
    feedback.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-top: 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      background: ${type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 69, 0, 0.1)'};
      border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 69, 0, 0.3)'};
      color: ${type === 'success' ? 'var(--color-green)' : 'var(--color-accent)'};
    `;

    setTimeout(() => feedback.remove(), 5000);
  }

  // ---- SKILL TAGS: add reveal-stagger to grids ----
  document.querySelectorAll('.services__grid, .projects__grid').forEach(grid => {
    grid.classList.add('reveal-stagger');
    revealObserver.observe(grid);
  });

});

// ---- SCROLLBAR TRAIL EFFECT ----
const style = document.createElement('style');
document.head.appendChild(style);

let lastScrollY = window.scrollY;
let scrollTimeout;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const scrollingDown = currentScrollY > lastScrollY;
  lastScrollY = currentScrollY;

  // Gradient flips based on direction
  // Scrolling down — trail fades upward (transparent at top)
  // Scrolling up — trail fades downward (transparent at bottom)
  const gradient = scrollingDown
    ? `linear-gradient(to bottom, transparent, var(--color-accent), var(--color-accent))`
    : `linear-gradient(to top, transparent, var(--color-accent), var(--color-accent))`;

  style.textContent = `
      ::-webkit-scrollbar-thumb {
        background: ${gradient};
        border-radius: 9999px;
        box-shadow: 
          0 0 8px var(--color-accent),
          0 0 16px var(--color-accent),
          0 0 30px rgba(255, 69, 0, 0.6),
          0 0 50px rgba(255, 69, 0, 0.3);
      }
    `;

  // Fade back to resting state when scrolling stops
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    style.textContent = `
        ::-webkit-scrollbar-thumb {
          background: var(--color-accent);
          border-radius: 9999px;
          box-shadow: 
            0 0 6px var(--color-accent),
            0 0 12px rgba(255, 69, 0, 0.4);
        }
      `;
  }, 150);

}, { passive: true });