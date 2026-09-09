/**
 * Muhammad Ibnu Syafrizal — Developer Portfolio Script
 * Interactive client-side controllers for mobile navigation, project filters,
 * email clipboard copy toast, dynamic year, and active scroll spy.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initProjectFilter();
  initClipboardHelper();
  initDynamicYear();
  initScrollSpy();
});

/* -------------------------------------------------------------------------- */
/* Mobile Navigation Drawer                                                  */
/* -------------------------------------------------------------------------- */
function initNavigation() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navDrawer = document.querySelector('.nav-drawer');
  const navOverlay = document.querySelector('.nav-overlay');
  const navLinks = document.querySelectorAll('.drawer-link, .nav-link');

  if (!toggleBtn || !navDrawer) return;

  function openMenu() {
    toggleBtn.setAttribute('aria-expanded', 'true');
    navDrawer.classList.add('is-active');
    if (navOverlay) navOverlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggleBtn.setAttribute('aria-expanded', 'false');
    navDrawer.classList.remove('is-active');
    if (navOverlay) navOverlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  // Close menu when clicking on any mobile nav link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navDrawer.classList.contains('is-active')) {
        closeMenu();
      }
    });
  });

  // Handle ESC key to close mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDrawer.classList.contains('is-active')) {
      closeMenu();
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Project Category Filter                                                   */
/* -------------------------------------------------------------------------- */
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');

        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.classList.remove('is-hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.classList.add('is-hidden');
          }, 250);
        }
      });
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Clipboard Helper with Feedback Toast                                      */
/* -------------------------------------------------------------------------- */
function initClipboardHelper() {
  const copyButtons = document.querySelectorAll('[data-copy-email]');
  const toast = document.getElementById('copy-toast');
  let toastTimeout = null;

  function showToast(message = 'Email Copied to Clipboard!') {
    if (!toast) return;
    const toastText = toast.querySelector('.toast-text');
    if (toastText) toastText.textContent = message;

    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-copy-email') || 'Ibnusyafrizal05@gmail.com';

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
          showToast('Email Copied to Clipboard!');
        } else {
          const tempInput = document.createElement('input');
          tempInput.value = email;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          showToast('Email Copied to Clipboard!');
        }
      } catch (err) {
        console.warn('Clipboard write failed, opening mailto:', err);
        window.location.href = `mailto:${email}`;
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Dynamic Copyright Year                                                    */
/* -------------------------------------------------------------------------- */
function initDynamicYear() {
  const yearEls = document.querySelectorAll('.current-year');
  const currentYear = new Date().getFullYear();
  yearEls.forEach((el) => {
    el.textContent = currentYear;
  });
}

/* -------------------------------------------------------------------------- */
/* Scroll Spy for Active Header Link                                         */
/* -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-desktop .nav-link');

  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    let currentId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}
