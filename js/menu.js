// ============================================
// Menu principal - compacta ao rolar a pagina
// ============================================

const initStickyMenuAnimation = () => {
  const header = document.querySelector('.header-shell');
  if (!header) return;

  const shrinkOffset = 24;
  let isShrunk = null;
  let animationFrameId = null;

  const syncHeaderState = () => {
    animationFrameId = null;

    const shouldShrink = window.scrollY > shrinkOffset;
    if (shouldShrink === isShrunk) return;

    header.classList.toggle('is-shrunk', shouldShrink);
    isShrunk = shouldShrink;
  };

  const requestStateSync = () => {
    if (animationFrameId !== null) return;
    animationFrameId = window.requestAnimationFrame(syncHeaderState);
  };

  window.addEventListener('scroll', requestStateSync, { passive: true });
  window.addEventListener('resize', requestStateSync);

  requestStateSync();
};

// ============================================
// Menu principal - rolagem suave para secoes
// ============================================

const initMenuSmoothScroll = () => {
  const menuLinks = document.querySelectorAll('.desktop-nav a[href^="#"], .drawer-nav a[href^="#"]');
  if (!menuLinks.length) return;

  const mobileNavToggle = document.querySelector('#mobile-nav-toggle');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const getHeaderOffset = () => {
    const header = document.querySelector('.header-shell');
    if (!header) return 0;
    return header.getBoundingClientRect().height;
  };

  const closeMobileDrawer = () => {
    if (mobileNavToggle instanceof HTMLInputElement) {
      mobileNavToggle.checked = false;
    }
  };

  menuLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;

      event.preventDefault();

      const headerOffset = getHeaderOffset() + 8;
      const targetTop = targetSection.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
      });

      closeMobileDrawer();
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initStickyMenuAnimation();
  initMenuSmoothScroll();
});
