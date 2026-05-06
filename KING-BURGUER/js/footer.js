// ============================================
// Footer - Log ao entrar na viewport via scroll
// ============================================

const FOOTER_FADE_DURATION_MS = 700;

const initFooterScrollLog = () => {
  const footer = document.querySelector('.kb-footer');
  if (!footer) return;

  const targets = Array.from(footer.querySelectorAll('.kb-footer__container *')).filter(
    (element) => !element.classList.contains('kb-footer__sr-only')
  );

  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  targets.forEach((element) => {
    if (prefersReducedMotion) {
      element.style.opacity = '1';
      element.style.removeProperty('will-change');
      return;
    }

    // Mantem todos os elementos escondidos ate o footer entrar na viewport.
    element.style.opacity = '0';
    element.style.transition = `opacity ${FOOTER_FADE_DURATION_MS}ms ease`;
    element.style.willChange = 'opacity';

    element.addEventListener(
      'transitionend',
      () => {
        element.style.removeProperty('will-change');
      },
      { once: true }
    );
  });

  if (prefersReducedMotion) return;

  const isFooterInViewport = () => {
    const rect = footer.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= viewportHeight && rect.bottom >= 0;
  };

  let hasLogged = false;

  const revealFooterElements = () => {
    window.requestAnimationFrame(() => {
      targets.forEach((element) => {
        element.style.opacity = '1';
      });
    });
  };

  const detachListeners = () => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleScroll);
  };

  const handleScroll = () => {
    if (hasLogged) return;

    const isInViewport = isFooterInViewport();
    if (isInViewport) {
      revealFooterElements();
      hasLogged = true;
      detachListeners();
      return;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll);
  handleScroll();
};

document.addEventListener('DOMContentLoaded', () => {
  initFooterScrollLog();
});
