// ============================================
// Nosso Menu - Filtros por categoria
// ============================================

// Inicializa os filtros da secao "Nosso Menu".
// Responsabilidades:
// 1) Marcar visualmente qual filtro esta ativo.
// 2) Mostrar/esconder cards conforme categoria.
// 3) Resetar o estado de flip dos itens que forem escondidos.
const initMenuFilters = () => {
  // Limita a busca de elementos para dentro da secao do menu.
  // Se a secao nao existir nesta pagina, encerra sem erro.
  const section = document.querySelector('#nosso-menu');
  if (!section) return;

  // Botoes de filtro (ex.: todos, burgers, combos...).
  const filterButtons = section.querySelectorAll('[data-filter]');
  // Itens/cartoes que serao filtrados.
  const items = section.querySelectorAll('.menu-flip-section__item');

  // Aplica o filtro recebido e sincroniza UI + acessibilidade.
  const applyFilter = (filter) => {
    // Atualiza estado ativo de cada botao e aria-pressed para leitores de tela.
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    // Percorre todos os itens para decidir se devem aparecer.
    items.forEach((item) => {
      // Categoria vinda do data-category no HTML.
      const category = item.dataset.category;
      // Regra: "todos" mostra tudo; caso contrario, compara categoria.
      const shouldShow = filter === 'todos' || category === filter;
      // Usa atributo hidden (semantico) para ocultar/exibir item.
      item.hidden = !shouldShow;

      // Se o item for ocultado, garante que o cartao volte para frente
      // para nao preservar estado visual inconsistente quando reaparecer.
      if (!shouldShow) {
        const card = item.querySelector('[data-card-flip]');
        const toggle = item.querySelector('.menu-flip-card__toggle');
        if (card) card.classList.remove('is-flipped');
        if (toggle) toggle.setAttribute('aria-pressed', 'false');
      }
    });
  };

  // Liga cada botao ao seu filtro correspondente.
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      // Protecao: ignora botoes sem data-filter definido.
      if (!filter) return;
      applyFilter(filter);
    });
  });
};

// ============================================
// Nosso Menu - Flip por toque/clique
// ============================================

// Controla o comportamento de "virar card" no menu.
// Regras de UX:
// - Somente 1 card aberto por vez.
// - Clique fora fecha todos.
// - Tecla Escape fecha todos.
const initMenuCardFlip = () => {
  // Todos os cards que suportam flip.
  const cards = document.querySelectorAll('[data-card-flip]');
  // Se nao houver card na pagina, encerra silenciosamente.
  if (!cards.length) return;

  // Fecha todos os cards, exceto um opcional (usado ao abrir um novo).
  const closeCards = (exceptCard = null) => {
    cards.forEach((card) => {
      // Mantem aberto apenas o card passado como excecao.
      if (card === exceptCard) return;
      card.classList.remove('is-flipped');
      const toggle = card.querySelector('.menu-flip-card__toggle');
      // Mantem atributo ARIA coerente com estado visual.
      if (toggle) toggle.setAttribute('aria-pressed', 'false');
    });
  };

  // Configura o botao de flip de cada card.
  cards.forEach((card) => {
    const toggle = card.querySelector('.menu-flip-card__toggle');
    // Alguns cards podem nao ter botao; nesse caso ignora.
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      // Descobre se este clique deve abrir (true) ou fechar (false) o card.
      const willFlip = !card.classList.contains('is-flipped');
      // Fecha os demais para manter apenas um aberto por vez.
      closeCards(card);
      // Aplica o novo estado no card clicado.
      card.classList.toggle('is-flipped', willFlip);
      // Atualiza estado ARIA do botao.
      toggle.setAttribute('aria-pressed', String(willFlip));
    });
  });

  // Clique fora de qualquer card fecha todos.
  document.addEventListener('click', (event) => {
    const target = event.target;
    // Narrowing de tipo para garantir uso seguro de closest().
    if (!(target instanceof Element)) return;
    if (!target.closest('[data-card-flip]')) closeCards();
  });

  // Atalho de teclado para acessibilidade e usabilidade.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCards();
  });
};

// ============================================
// Nosso Menu - Animacoes de entrada
// ============================================

const MENU_FLIP_ENTER_CONFIG = [
  { selector: '.menu-flip-section__title', delay: 120 },
  { selector: '.menu-flip-section__subtitle', delay: 260 },
];

const MENU_FLIP_FILTER_DELAY_START = 380;
const MENU_FLIP_FILTER_DELAY_STEP = 90;
const MENU_FLIP_GRID_DELAY_GAP = 140;

const initMenuFlipAnimations = () => {
  const section = document.querySelector('#nosso-menu');
  if (!section || section.dataset.menuFlipAnimated === 'true') return;

  const baseTargets = MENU_FLIP_ENTER_CONFIG.map(({ selector, delay }) => {
    const element = section.querySelector(selector);
    if (!element) return null;

    return { element, delay };
  }).filter(Boolean);

  const filterButtons = Array.from(section.querySelectorAll('.menu-flip-section__filter-button'));
  const filterTargets = filterButtons.map((button, index) => ({
    element: button,
    delay: MENU_FLIP_FILTER_DELAY_START + index * MENU_FLIP_FILTER_DELAY_STEP,
  }));

  const grid = section.querySelector('.menu-flip-section__grid');
  const lastFilterDelay = filterTargets.length
    ? filterTargets[filterTargets.length - 1].delay
    : MENU_FLIP_FILTER_DELAY_START;
  const gridTarget = grid
    ? [{ element: grid, delay: lastFilterDelay + MENU_FLIP_GRID_DELAY_GAP }]
    : [];

  const targets = [...baseTargets, ...filterTargets, ...gridTarget];

  if (!targets.length) return;

  const markAsAnimated = () => {
    section.dataset.menuFlipAnimated = 'true';
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    markAsAnimated();
    return;
  }

  section.classList.add('is-menu-flip-enter-pending');

  const animateIn = () => {
    targets.forEach(({ element, delay }) => {
      element.classList.add('menu-flip-section__enter-init');
      element.style.setProperty('--menu-flip-enter-delay', `${delay}ms`);

      element.addEventListener(
        'transitionend',
        () => {
          element.classList.remove('menu-flip-section__enter-init', 'menu-flip-section__enter-active');
          element.style.removeProperty('--menu-flip-enter-delay');
          element.style.removeProperty('will-change');
        },
        { once: true }
      );
    });

    requestAnimationFrame(() => {
      section.classList.remove('is-menu-flip-enter-pending');
      targets.forEach(({ element }) => {
        element.classList.add('menu-flip-section__enter-active');
      });
    });

    markAsAnimated();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateIn();
        observer.unobserve(section);
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  observer.observe(section);
};

// ============================================
// The Kings Showcase - Animacoes de entrada
// ============================================

const KINGS_SHOWCASE_ENTER_CONFIG = [
  { selector: '.the-kings-showcase__title', delay: 160 },
  { selector: '.the-kings-showcase__subtitle', delay: 320 },
  { selector: '.the-kings-card:nth-child(1)', delay: 520 },
  { selector: '.the-kings-card:nth-child(2)', delay: 700 },
  { selector: '.the-kings-card:nth-child(3)', delay: 880 },
];

const initKingsShowcaseAnimations = () => {
  const section = document.querySelector('#mais-promocoes');
  if (!section || section.dataset.kingsAnimated === 'true') return;

  const targets = KINGS_SHOWCASE_ENTER_CONFIG.map(({ selector, delay }) => {
    const element = section.querySelector(selector);
    if (!element) return null;

    return { element, delay };
  }).filter(Boolean);

  if (!targets.length) return;

  const markAsAnimated = () => {
    section.dataset.kingsAnimated = 'true';
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isUserAlreadyAtSectionOnReload = () => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const probeY = viewportHeight * 0.28;
    const isProbeInsideSection = rect.top <= probeY && rect.bottom >= probeY;

    // So considera "ja na secao" quando houve scroll real na pagina.
    return window.scrollY > 120 && isProbeInsideSection;
  };

  // Em recarregamento com a secao ja visivel, nao repete animacao.
  if (prefersReducedMotion || isUserAlreadyAtSectionOnReload()) {
    markAsAnimated();
    return;
  }

  section.classList.add('is-kings-enter-pending');

  const animateIn = () => {
    targets.forEach(({ element, delay }) => {
      element.classList.add('the-kings-showcase__enter-init');
      element.style.setProperty('--kings-enter-delay', `${delay}ms`);

      element.addEventListener(
        'transitionend',
        () => {
          element.classList.remove('the-kings-showcase__enter-init', 'the-kings-showcase__enter-active');
          element.style.removeProperty('--kings-enter-delay');
          element.style.removeProperty('will-change');
        },
        { once: true }
      );
    });

    requestAnimationFrame(() => {
      section.classList.remove('is-kings-enter-pending');
      targets.forEach(({ element }) => {
        element.classList.add('the-kings-showcase__enter-active');
      });
    });

    markAsAnimated();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateIn();
        observer.unobserve(section);
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -12% 0px',
    }
  );

  observer.observe(section);
};

// ============================================
// Ingredients Premium - Animacoes de entrada
// ============================================

const initIngredientsPremiumAnimations = () => {
  const section = document.querySelector('#ingredientes-premium');
  if (!section || section.dataset.ingredientsAnimated === 'true') return;

  const title = section.querySelector('.ingredients-premium__title');
  const subtitle = section.querySelector('.ingredients-premium__subtitle');
  const cards = section.querySelectorAll('.ingredients-premium__item');

  const targets = [
    title ? { element: title, delay: 120, type: 'transition' } : null,
    subtitle ? { element: subtitle, delay: 260, type: 'transition' } : null,
    ...Array.from(cards).map((card, index) => ({
      element: card,
      delay: 420 + index * 130,
      type: 'animation',
    })),
  ].filter(Boolean);

  if (!targets.length) return;

  const markAsAnimated = () => {
    section.dataset.ingredientsAnimated = 'true';
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    markAsAnimated();
    return;
  }

  section.classList.add('is-ingredients-enter-pending');

  const animateIn = () => {
    targets.forEach(({ element, delay, type }) => {
      element.classList.add('ingredients-premium__enter-init');
      element.style.setProperty('--ingredients-enter-delay', `${delay}ms`);

      const completionEvent = type === 'animation' ? 'animationend' : 'transitionend';
      element.addEventListener(
        completionEvent,
        () => {
          element.classList.remove('ingredients-premium__enter-init', 'ingredients-premium__enter-active');
          element.style.removeProperty('--ingredients-enter-delay');
          element.style.removeProperty('will-change');
        },
        { once: true }
      );
    });

    requestAnimationFrame(() => {
      section.classList.remove('is-ingredients-enter-pending');
      targets.forEach(({ element }) => {
        element.classList.add('ingredients-premium__enter-active');
      });
    });

    markAsAnimated();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateIn();
        observer.unobserve(section);
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  observer.observe(section);
};

// ============================================
// HMMMM Nuggets - Animacoes de entrada
// ============================================

const HMMMM_NUGGETS_ENTER_CONFIG = [
  { selector: '.hmmmm-nuggets__title', delay: 120, type: 'transition' },
  { selector: '.hmmmm-nuggets__subtitle', delay: 260, type: 'transition' },
  { selector: '.hmmmm-nuggets__media', delay: 430, type: 'animation' },
  { selector: '.hmmmm-nuggets__content', delay: 560, type: 'transition' },
];

const initHmmmmNuggetsAnimations = () => {
  const section = document.querySelector('#hmmmm-nuggets');
  if (!section || section.dataset.hmmmmAnimated === 'true') return;

  const targets = HMMMM_NUGGETS_ENTER_CONFIG.map(({ selector, delay, type }) => {
    const element = section.querySelector(selector);
    if (!element) return null;

    return { element, delay, type };
  }).filter(Boolean);

  if (!targets.length) return;

  const markAsAnimated = () => {
    section.dataset.hmmmmAnimated = 'true';
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    markAsAnimated();
    return;
  }

  section.classList.add('is-hmmmm-enter-pending');

  const animateIn = () => {
    targets.forEach(({ element, delay, type }) => {
      element.classList.add('hmmmm-nuggets__enter-init');
      element.style.setProperty('--hmmmm-enter-delay', `${delay}ms`);

      const completionEvent = type === 'animation' ? 'animationend' : 'transitionend';
      element.addEventListener(
        completionEvent,
        () => {
          element.classList.remove('hmmmm-nuggets__enter-init', 'hmmmm-nuggets__enter-active');
          element.style.removeProperty('--hmmmm-enter-delay');
          element.style.removeProperty('will-change');
        },
        { once: true }
      );
    });

    requestAnimationFrame(() => {
      section.classList.remove('is-hmmmm-enter-pending');
      targets.forEach(({ element }) => {
        element.classList.add('hmmmm-nuggets__enter-active');
      });
    });

    markAsAnimated();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateIn();
        observer.unobserve(section);
      });
    },
    {
      threshold: 0.22,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  observer.observe(section);
};

// ============================================
// King em Dobro - Animacoes de entrada
// ============================================

const KING_DOUBLE_ENTER_CONFIG = [
  { selector: '.promo-king-double__offer', delay: 120 },
  { selector: '.promo-king-double__selector', delay: 320 },
];

const initKingDoubleAnimations = () => {
  const section = document.querySelector('#promo-king-em-dobro');
  if (!section || section.dataset.kingDoubleAnimated === 'true') return;

  const headlineNumber = section.querySelector('.promo-king-double__headline-number');
  const headlineFinalValue = headlineNumber
    ? Number.parseInt(headlineNumber.textContent.trim(), 10)
    : null;
  const priceValue = section.querySelector('.promo-king-double__price-value');
  const priceCents = section.querySelector('.promo-king-double__price-cents');
  const priceFinalValue = priceValue ? Number.parseInt(priceValue.textContent.trim(), 10) : null;
  const priceFinalCents = priceCents
    ? Number.parseInt(priceCents.textContent.replace(/[^0-9]/g, ''), 10)
    : null;

  const targets = KING_DOUBLE_ENTER_CONFIG.map(({ selector, delay }) => {
    const element = section.querySelector(selector);
    if (!element) return null;

    return { element, delay };
  }).filter(Boolean);

  if (!targets.length) return;

  const markAsAnimated = () => {
    section.dataset.kingDoubleAnimated = 'true';
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateHeadlineNumber = () => {
    if (!headlineNumber || !Number.isFinite(headlineFinalValue)) return;

    const duration = 900;
    const startAt = window.performance.now();

    const update = (currentTime) => {
      const progress = Math.min((currentTime - startAt) / duration, 1);
      const nextValue = Math.round(headlineFinalValue * progress);
      headlineNumber.textContent = String(nextValue);

      if (progress < 1) {
        window.requestAnimationFrame(update);
        return;
      }

      headlineNumber.textContent = String(headlineFinalValue);
    };

    window.requestAnimationFrame(update);
  };

  const animatePriceNumber = () => {
    if (
      !priceValue ||
      !priceCents ||
      !Number.isFinite(priceFinalValue) ||
      !Number.isFinite(priceFinalCents)
    ) {
      return;
    }

    const duration = 1000;
    const startAt = window.performance.now();
    const finalInCents = priceFinalValue * 100 + priceFinalCents;

    const update = (currentTime) => {
      const progress = Math.min((currentTime - startAt) / duration, 1);
      const nextInCents = Math.round(finalInCents * progress);
      const nextValue = Math.floor(nextInCents / 100);
      const nextCents = nextInCents % 100;

      priceValue.textContent = String(nextValue);
      priceCents.textContent = `,${String(nextCents).padStart(2, '0')}`;

      if (progress < 1) {
        window.requestAnimationFrame(update);
        return;
      }

      priceValue.textContent = String(priceFinalValue);
      priceCents.textContent = `,${String(priceFinalCents).padStart(2, '0')}`;
    };

    window.requestAnimationFrame(update);
  };

  if (headlineNumber && Number.isFinite(headlineFinalValue)) {
    headlineNumber.textContent = '0';
  }

  if (priceValue && priceCents && Number.isFinite(priceFinalValue) && Number.isFinite(priceFinalCents)) {
    priceValue.textContent = '0';
    priceCents.textContent = ',00';
  }

  if (prefersReducedMotion) {
    if (headlineNumber && Number.isFinite(headlineFinalValue)) {
      headlineNumber.textContent = String(headlineFinalValue);
    }

    if (priceValue && priceCents && Number.isFinite(priceFinalValue) && Number.isFinite(priceFinalCents)) {
      priceValue.textContent = String(priceFinalValue);
      priceCents.textContent = `,${String(priceFinalCents).padStart(2, '0')}`;
    }

    markAsAnimated();
    return;
  }

  section.classList.add('is-king-double-enter-pending');

  const animateIn = () => {
    targets.forEach(({ element, delay }) => {
      element.classList.add('promo-king-double__enter-init');
      element.style.setProperty('--king-double-enter-delay', `${delay}ms`);

      element.addEventListener(
        'transitionend',
        () => {
          element.classList.remove('promo-king-double__enter-init', 'promo-king-double__enter-active');
          element.style.removeProperty('--king-double-enter-delay');
          element.style.removeProperty('will-change');
        },
        { once: true }
      );
    });

    requestAnimationFrame(() => {
      section.classList.remove('is-king-double-enter-pending');
      targets.forEach(({ element }) => {
        element.classList.add('promo-king-double__enter-active');
      });
      animateHeadlineNumber();
      animatePriceNumber();
    });

    markAsAnimated();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateIn();
        observer.unobserve(section);
      });
    },
    {
      threshold: 0.22,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  observer.observe(section);
};

// ============================================
// App Download Club - Animacoes + Ripple
// ============================================

const initAppDownloadClubAnimations = () => {
  const section = document.querySelector('#app-download-club');
  if (!section || section.dataset.appClubAnimated === 'true') return;

  const container = section.querySelector('.app-download-club__container');
  const content = section.querySelector('.app-download-club__content');
  const storeButtons = Array.from(section.querySelectorAll('.store-button'));

  const markAsAnimated = () => {
    section.dataset.appClubAnimated = 'true';
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const createRipple = (button, event) => {
    const bounds = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(bounds.width, bounds.height) * 1.2;

    const relativeX = event.clientX > 0 ? event.clientX - bounds.left : bounds.width / 2;
    const relativeY = event.clientY > 0 ? event.clientY - bounds.top : bounds.height / 2;

    ripple.className = 'store-button__ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${relativeX}px`;
    ripple.style.top = `${relativeY}px`;

    const oldRipples = button.querySelectorAll('.store-button__ripple');
    oldRipples.forEach((oldRipple) => oldRipple.remove());

    ripple.addEventListener(
      'animationend',
      () => {
        ripple.remove();
      },
      { once: true }
    );

    button.appendChild(ripple);
  };

  if (!prefersReducedMotion) {
    storeButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        if (button.getAttribute('href') === '#') {
          event.preventDefault();
        }

        createRipple(button, event);
      });
    });
  }

  if (prefersReducedMotion) {
    markAsAnimated();
    return;
  }

  section.classList.add('is-app-club-enter-pending');
  if (container) {
    container.style.willChange = 'opacity';
  }
  if (content) content.style.willChange = 'opacity, transform';

  const animateIn = () => {
    let hasCleanedUp = false;

    const cleanUp = () => {
      if (hasCleanedUp) return;
      hasCleanedUp = true;

      section.classList.remove('is-app-club-enter-pending');
      if (container) container.style.removeProperty('will-change');
      if (content) content.style.removeProperty('will-change');
    };

    if (content) {
      content.addEventListener(
        'transitionend',
        (event) => {
          if (event.target !== content || event.propertyName !== 'transform') return;
          cleanUp();
        },
        { once: true }
      );
    }

    // Duplo RAF garante que o browser aplique o estado inicial antes da entrada.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        section.classList.add('is-app-club-enter-active');
      });
    });

    // Fallback para casos onde transitionend nao dispara.
    window.setTimeout(cleanUp, 1500);

    markAsAnimated();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateIn();
        observer.unobserve(section);
      });
    },
    {
      threshold: 0.22,
      rootMargin: '0px 0px -4% 0px',
    }
  );

  observer.observe(section);
};

// ============================================
// Hero KB Ninja - Scroll para The Kings Bacon
// ============================================

const initHeroScrollToKings = () => {
  const scrollButton = document.querySelector('.hero-kb-ninja__scroll');
  const kingsSection = document.querySelector('#mais-promocoes');

  // Se o botao/section nao existirem nesta pagina, nao faz nada.
  if (!scrollButton || !kingsSection) return;

  scrollButton.addEventListener('click', (event) => {
    // Mantem o href como fallback sem JS, mas com JS aplica scroll suave.
    event.preventDefault();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    kingsSection.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  });
};

// ============================================
// Kids Menu - Carrossel com autoplay
// ============================================

const initKidsMenuCarouselAutoplay = () => {
  const section = document.querySelector('#kids-menu-carousel');
  if (!section) return;

  const toggles = Array.from(section.querySelectorAll('.kids-menu-carousel__toggle'));
  const slides = Array.from(section.querySelectorAll('.kids-menu-carousel__slide'));
  const viewport = section.querySelector('.kids-menu-carousel__viewport');

  if (!toggles.length || !slides.length || !viewport) return;

  const AUTOPLAY_INTERVAL = 5000;
  const mobileMediaQuery = window.matchMedia('(max-width: 979px)');
  const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let autoplayTimerId = null;
  let scrollSyncFrameId = null;

  const setCheckedByIndex = (index) => {
    toggles.forEach((toggle, toggleIndex) => {
      toggle.checked = toggleIndex === index;
    });
  };

  const getCheckedIndex = () => {
    const checkedIndex = toggles.findIndex((toggle) => toggle.checked);
    return checkedIndex >= 0 ? checkedIndex : 0;
  };

  const clampIndex = (index) => {
    return Math.max(0, Math.min(index, slides.length - 1));
  };

  const syncViewportToIndex = (index, withSmoothBehavior) => {
    if (!mobileMediaQuery.matches) return;

    const safeIndex = clampIndex(index);
    const targetLeft = safeIndex * viewport.clientWidth;
    viewport.scrollTo({
      left: targetLeft,
      behavior: withSmoothBehavior && !reducedMotionMediaQuery.matches ? 'smooth' : 'auto',
    });
  };

  const goToSlide = (index, withSmoothBehavior = false) => {
    const safeIndex = clampIndex(index);
    setCheckedByIndex(safeIndex);
    syncViewportToIndex(safeIndex, withSmoothBehavior);
  };

  const goToNextSlide = () => {
    const currentIndex = getCheckedIndex();
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex, true);
  };

  const stopAutoplay = () => {
    if (autoplayTimerId === null) return;
    window.clearInterval(autoplayTimerId);
    autoplayTimerId = null;
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  const startAutoplay = () => {
    if (autoplayTimerId !== null) return;
    autoplayTimerId = window.setInterval(goToNextSlide, AUTOPLAY_INTERVAL);
  };

  toggles.forEach((toggle, index) => {
    toggle.addEventListener('change', () => {
      if (!toggle.checked) return;
      syncViewportToIndex(index, false);
      restartAutoplay();
    });
  });

  viewport.addEventListener(
    'scroll',
    () => {
      if (!mobileMediaQuery.matches || scrollSyncFrameId !== null) return;

      scrollSyncFrameId = window.requestAnimationFrame(() => {
        scrollSyncFrameId = null;
        const width = viewport.clientWidth;
        if (!width) return;

        const nearestIndex = clampIndex(Math.round(viewport.scrollLeft / width));
        setCheckedByIndex(nearestIndex);
        restartAutoplay();
      });
    },
    { passive: true }
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }

    startAutoplay();
  });

  window.addEventListener('resize', () => {
    goToSlide(getCheckedIndex(), false);
  });

  goToSlide(getCheckedIndex(), false);
  startAutoplay();
};

// ============================================
// Inicializacao
// ============================================

// Aguarda o HTML carregar para so entao buscar elementos e registrar eventos.
document.addEventListener('DOMContentLoaded', () => {
  // Ativa autoplay do carrossel Kids Menu (5s por slide).
  initKidsMenuCarouselAutoplay();
  // Ativa filtro de categorias.
  initMenuFilters();
  // Ativa interacao de flip dos cards.
  initMenuCardFlip();
  // Ativa animacoes da secao Nosso Menu ao entrar no viewport.
  initMenuFlipAnimations();
  // Ativa rolagem do botao do hero para secao The Kings Bacon.
  initHeroScrollToKings();
  // Ativa animacoes da secao The Kings quando entrar no viewport.
  initKingsShowcaseAnimations();
  // Ativa animacoes da secao King em Dobro ao entrar no viewport.
  initKingDoubleAnimations();
  // Ativa animacoes da secao Ingredients Premium ao entrar no viewport.
  initIngredientsPremiumAnimations();
  // Ativa animacoes da secao HMMMM Nuggets ao entrar no viewport.
  initHmmmmNuggetsAnimations();
  // Ativa animacoes e ripple da secao App Download Club.
  initAppDownloadClubAnimations();
});
