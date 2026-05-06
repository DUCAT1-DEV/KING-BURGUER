// ============================================
// Hero KB Ninja - Animacoes da secao principal
// ============================================

const HERO_ENTER_CONFIG = [
  { selector: '.hero-kb-ninja__content', delay: 80 },
  { selector: '.hero-kb-ninja__media', delay: 220 },
];

const initHeroAnimations = () => {
  const heroSection = document.querySelector('#hero-kb-ninja');
  if (!heroSection || heroSection.dataset.heroAnimated === 'true') return;

  heroSection.dataset.heroAnimated = 'true';
  heroSection.classList.add('is-hero-animated');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = HERO_ENTER_CONFIG.map(({ selector, delay }) => {
    const element = heroSection.querySelector(selector);
    if (!element) return null;

    return { element, delay };
  }).filter(Boolean);

  if (!targets.length) return;

  targets.forEach(({ element, delay }) => {
    element.classList.add('hero-kb-ninja__enter-init');
    element.style.setProperty('--hero-enter-delay', `${delay}ms`);

    // Remove classes/vars apos a animacao para manter o DOM limpo.
    element.addEventListener(
      'transitionend',
      () => {
        element.classList.remove('hero-kb-ninja__enter-init', 'hero-kb-ninja__enter-active');
        element.style.removeProperty('--hero-enter-delay');
        element.style.removeProperty('will-change');
      },
      { once: true }
    );
  });

  requestAnimationFrame(() => {
    targets.forEach(({ element }) => {
      element.classList.add('hero-kb-ninja__enter-active');
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroAnimations);
} else {
  initHeroAnimations();
}
