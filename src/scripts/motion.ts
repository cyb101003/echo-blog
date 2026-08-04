const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
type MotionWindow = Window & { __echoNameDecoded?: boolean; __echoPageMotionReady?: boolean };

function setupHeroEntrance() {
  const items = [...document.querySelectorAll<HTMLElement>("[data-entrance]")];
  if (!items.length) return;

  if (reducedMotion()) {
    items.forEach(item => item.classList.add("is-entered"));
    return;
  }

  window.requestAnimationFrame(() => {
    items.forEach(item => item.classList.add("is-entered"));
  });
}

function setupNameDecode() {
  const target = document.querySelector<HTMLElement>("[data-decode-name]");
  if (!target) return;

  const finalValue = target.dataset.decodeName || "Echo";
  const runtime = window as MotionWindow;
  if (reducedMotion() || runtime.__echoNameDecoded === true) {
    target.textContent = finalValue;
    return;
  }

  runtime.__echoNameDecoded = true;
  const glyphs = "#?70_<>/{}[]";
  const initialScrambleFrames = 4;
  const framesPerCharacter = 5;
  const settleFrames = 4;
  const frameInterval = 72;
  const totalFrames = initialScrambleFrames + finalValue.length * framesPerCharacter + settleFrames;
  let frame = 0;

  const draw = () => {
    const lockedCharacters = Math.max(0, Math.floor((frame - initialScrambleFrames) / framesPerCharacter));
    target.textContent = [...finalValue].map((character, index) => {
      if (index < lockedCharacters) return character;
      return glyphs[(frame * 5 + index * 3) % glyphs.length];
    }).join("");

    frame += 1;
    if (frame <= totalFrames) {
      window.setTimeout(draw, frameInterval);
    } else {
      target.textContent = finalValue;
      window.setTimeout(() => target.classList.add("is-decoded"), 260);
    }
  };

  draw();
}

function setupScrollReveal() {
  const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")]
    .filter(item => item.dataset.revealReady !== "true");
  if (!targets.length) return;

  if (reducedMotion() || !("IntersectionObserver" in window)) {
    targets.forEach(item => item.classList.add("is-visible"));
    return;
  }

  targets.forEach(item => {
    item.dataset.revealReady = "true";
    item.classList.add("reveal-ready");
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -4%" });

  targets.forEach(item => observer.observe(item));
}

function setupImageReveal() {
  const images = [...document.querySelectorAll<HTMLImageElement>("[data-image-reveal], .prose img, .about-portrait img")];
  images.forEach(image => {
    if (image.dataset.imageReady === "true") return;
    image.dataset.imageReady = "true";
    image.classList.add("image-reveal");
    const reveal = () => image.classList.add("is-loaded");
    const showError = () => {
      image.classList.add("is-loaded", "is-error");
      image.closest(".profile-image-wrap, .about-portrait, figure")?.classList.add("image-load-error");
    };
    if (image.complete) window.requestAnimationFrame(image.naturalWidth > 0 ? reveal : showError);
    else {
      image.addEventListener("load", reveal, { once: true });
      image.addEventListener("error", showError, { once: true });
    }
  });
}

function setupPageTransitionFallback() {
  const runtime = window as MotionWindow;
  if (runtime.__echoPageMotionReady === true) return;
  runtime.__echoPageMotionReady = true;

  document.addEventListener("astro:after-swap", () => {
    if (reducedMotion()) return;
    const root = document.documentElement;
    root.classList.add("motion-enabled");
    root.classList.add("page-entering");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root.classList.remove("page-entering"));
    });
  });
}

function setupNavIndicator() {
  const nav = document.querySelector<HTMLElement>("[data-site-nav]");
  const active = nav?.querySelector<HTMLElement>('a[aria-current="page"]');
  if (!nav || !active) return;

  const update = () => {
    nav.style.setProperty("--nav-indicator-x", `${active.offsetLeft}px`);
    nav.style.setProperty("--nav-indicator-width", `${active.offsetWidth}px`);
    nav.classList.add("has-indicator");
  };

  update();
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(update);
    observer.observe(nav);
  }
}

function setupReadingCards() {
  document.querySelectorAll<HTMLElement>("[data-reading-card]").forEach(card => {
    const slug = card.dataset.readingCard;
    const track = card.querySelector<HTMLElement>("[data-reading-track]");
    const valueNode = card.querySelector<HTMLElement>("[data-reading-value]");
    const label = card.querySelector<HTMLElement>("[data-reading-label]");
    if (!slug || !track || !valueNode || !label) return;

    let stored = 0;
    try {
      stored = Number(window.localStorage.getItem(`echo:reading:${slug}`) || 0);
    } catch {
      stored = 0;
    }
    const value = Math.max(0, Math.min(1, stored));
    if (value <= 0.01) {
      track.hidden = true;
      return;
    }

    track.hidden = false;
    valueNode.style.transform = `scaleX(${value})`;
    label.textContent = value >= 0.98 ? "已读" : `${Math.round(value * 100)}%`;
  });
}

export function setupMotionSystem() {
  document.documentElement.classList.add("motion-enabled");
  setupPageTransitionFallback();
  setupHeroEntrance();
  setupNameDecode();
  setupScrollReveal();
  setupImageReveal();
  setupNavIndicator();
  setupReadingCards();
}
