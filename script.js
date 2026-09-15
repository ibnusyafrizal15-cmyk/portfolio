/**
 * Muhammad Ibnu Syafrizal — Developer Portfolio Script
 * Interactive client-side controllers for mobile navigation, project filters,
 * email clipboard copy toast, dynamic year, and active scroll spy.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initProjectFilter();
  initProjectsCarousel();
  initClipboardHelper();
  initDynamicYear();
  initScrollSpy();
  initSkillsCarousel();
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
/* Project Category Filter (integrates with Projects Carousel)               */
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
        const isVisible = selectedCategory === 'all' || cardCategory === selectedCategory || cardCategory === 'all';
        card.classList.toggle('is-filtered-out', !isVisible);
      });

      // Tell the carousel to rebuild after filter changes
      if (window._projectsCarousel) {
        window._projectsCarousel.rebuild();
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Projects Carousel Controller (2-per-view)                                 */
/* -------------------------------------------------------------------------- */
function initProjectsCarousel() {
  const wrapper = document.getElementById('projectsCarouselWrapper');
  const track = document.getElementById('projectsCarouselTrack');
  const prevBtn = document.getElementById('projectsPrev');
  const nextBtn = document.getElementById('projectsNext');
  const dotsContainer = document.getElementById('projectsDots');

  if (!wrapper || !track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let allCards = [];

  function getSlidesPerView() {
    return window.innerWidth <= 768 ? 1 : 2;
  }

  function getVisibleCards() {
    return Array.from(track.querySelectorAll('.project-card:not(.is-filtered-out)'));
  }

  function getTotalPages() {
    const visible = getVisibleCards().length;
    const perView = getSlidesPerView();
    return Math.max(1, Math.ceil(visible / perView));
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const total = getTotalPages();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === currentIndex ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Page ${i + 1}`);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentIndex);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
  }

  function goTo(index) {
    const total = getTotalPages();
    currentIndex = Math.max(0, Math.min(index, total - 1));

    const visible = getVisibleCards();
    const perView = getSlidesPerView();
    const startCardIndex = currentIndex * perView;

    // Show only the cards for this page, hide others in track
    // We use inline order trick: shift the track so the right cards are visible
    // Since cards are filtered out with display:none, we need to move by visible card widths
    const visibleInTrack = Array.from(track.querySelectorAll('.project-card'));
    let offset = 0;

    if (visible.length > 0 && startCardIndex < visible.length) {
      const targetCard = visible[startCardIndex];
      // Calculate offset relative to track start
      const trackRect = track.getBoundingClientRect();
      const cardRect = targetCard.getBoundingClientRect();
      // Use the card's position relative to the wrapper
      const wrapperRect = wrapper.getBoundingClientRect();
      offset = targetCard.offsetLeft;
    }

    track.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= total - 1;
    updateDots();
  }

  function rebuild() {
    currentIndex = 0;
    buildDots();
    goTo(0);
  }

  // Expose rebuild for filter integration
  window._projectsCarousel = { rebuild };

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // Keyboard arrow support
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex + 1); }
  });

  // Drag / swipe support
  let dragStartX = 0;
  let isDragging = false;

  wrapper.addEventListener('pointerdown', (e) => {
    dragStartX = e.clientX;
    isDragging = true;
    wrapper.setPointerCapture(e.pointerId);
  });

  wrapper.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
  }, { passive: false });

  wrapper.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const delta = dragStartX - e.clientX;
    if (delta > 60) goTo(currentIndex + 1);
    else if (delta < -60) goTo(currentIndex - 1);
  });

  wrapper.addEventListener('pointercancel', () => { isDragging = false; });

  // Responsive resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      currentIndex = Math.min(currentIndex, getTotalPages() - 1);
      goTo(currentIndex);
    }, 180);
  });

  // Init
  buildDots();
  goTo(0);
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

/* -------------------------------------------------------------------------- */
/* Skills Domain Carousel Controller                                          */
/* -------------------------------------------------------------------------- */
function initSkillsCarousel() {
  const wrapper = document.getElementById('skillsCarouselWrapper');
  const track = document.getElementById('skillsCarouselTrack');
  const prevBtn = document.getElementById('skillsPrev');
  const nextBtn = document.getElementById('skillsNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (!wrapper || !track || !prevBtn || !nextBtn) return;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  if (!slides.length) return;

  let currentIndex = 0;

  // Determine how many slides are visible based on breakpoints
  function getSlidesPerView() {
    const w = window.innerWidth;
    if (w >= 1025) return 3;
    if (w >= 769) return 2;
    return 1;
  }

  // Total number of "pages" (positions) the carousel can be at
  function getTotalPages() {
    return Math.max(1, slides.length - getSlidesPerView() + 1);
  }

  // Build dot indicators
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const total = getTotalPages();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === currentIndex ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Domain ${i + 1}`);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  // Update dots state
  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentIndex);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
  }

  // Move carousel to a given index
  function goTo(index) {
    const total = getTotalPages();
    currentIndex = Math.max(0, Math.min(index, total - 1));

    // Calculate slide width including gap
    const slideEl = slides[0];
    const trackStyle = window.getComputedStyle(track);
    const gap = parseFloat(trackStyle.gap) || 24;
    const slideWidth = slideEl.getBoundingClientRect().width;
    const offset = currentIndex * (slideWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= total - 1;

    updateDots();
  }

  // Arrow button events
  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // Keyboard arrow support when focused within carousel
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex + 1); }
  });

  // Pointer drag / touch swipe support
  let dragStartX = 0;
  let isDragging = false;

  wrapper.addEventListener('pointerdown', (e) => {
    dragStartX = e.clientX;
    isDragging = true;
    wrapper.setPointerCapture(e.pointerId);
  });

  wrapper.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    // Prevent text selection while dragging
    e.preventDefault();
  }, { passive: false });

  wrapper.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const delta = dragStartX - e.clientX;
    const threshold = 60;
    if (delta > threshold) {
      goTo(currentIndex + 1);
    } else if (delta < -threshold) {
      goTo(currentIndex - 1);
    }
  });

  wrapper.addEventListener('pointercancel', () => { isDragging = false; });

  // Re-initialize on resize (breakpoint changes slides-per-view)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      // Clamp index within new total pages
      const total = getTotalPages();
      currentIndex = Math.min(currentIndex, total - 1);
      goTo(currentIndex);
    }, 180);
  });

  // Initialize
  buildDots();
  goTo(0);
}
