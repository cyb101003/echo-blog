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
    window.requestAnimationFrame(() => {
      items.forEach(item => item.classList.add("is-entered"));
    });
  });
}

function setupNameDecode() {
  const target = document.querySelector<HTMLElement>("[data-decode-name]");
  if (!target || target.dataset.decodeReady === "true") return;
  target.dataset.decodeReady = "true";

  const finalValue = target.dataset.decodeName || "Echo";
  const runtime = window as MotionWindow;
  if (reducedMotion() || runtime.__echoNameDecoded === true) {
    target.textContent = finalValue;
    target.classList.add("is-decoded");
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
  if (!targets.length || reducedMotion() || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -4%" });

  targets.forEach(item => {
    item.dataset.revealReady = "true";
    item.classList.add("reveal-ready");
    observer.observe(item);
  });
  document.addEventListener("astro:before-swap", () => observer.disconnect(), { once: true });
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

type MarqueeState = {
  band: HTMLElement;
  track: HTMLElement;
  group: HTMLElement;
  width: number;
  pos: number;
  skew: number;
  velocity: number;
  visible: boolean;
};

function setupScrollMarquee() {
  const bands = [...document.querySelectorAll<HTMLElement>("[data-marquee]")]
    .filter(band => band.dataset.marqueeReady !== "true");
  if (!bands.length) return;
  bands.forEach(band => {
    band.dataset.marqueeReady = "true";
  });

  const states: MarqueeState[] = [];
  bands.forEach(band => {
    const track = band.querySelector<HTMLElement>("[data-marquee-track]");
    const group = band.querySelector<HTMLElement>("[data-marquee-group]");
    if (!track || !group) return;
    // 补两份副本做无缝循环，副本对读屏隐藏，原文只读一次
    for (let copy = 0; copy < 2; copy += 1) {
      const clone = group.cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }
    states.push({
      band,
      track,
      group,
      width: group.getBoundingClientRect().width,
      pos: 0,
      skew: 0,
      velocity: 0,
      visible: true
    });
  });
  if (!states.length) return;

  const measure = () => {
    states.forEach(state => {
      const width = state.group.getBoundingClientRect().width;
      if (width > 0) state.width = width;
    });
  };
  measure();
  window.addEventListener("resize", measure, { passive: true });
  document.fonts?.ready.then(measure).catch(() => {});

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const state = states.find(item => item.band === entry.target);
        if (state) state.visible = entry.isIntersecting;
      });
    }, { rootMargin: "140px" });
    states.forEach(state => observer.observe(state.band));
  }

  if (reducedMotion()) return;

  let lastScroll = window.scrollY;
  let lastTime = performance.now();

  const loop = (now: number) => {
    // 路由切走后清掉引用，避免旧循环一直跑
    for (let index = states.length - 1; index >= 0; index -= 1) {
      if (!states[index].band.isConnected) states.splice(index, 1);
    }
    if (!states.length) return;

    const delta = Math.min(3, Math.max(0.2, (now - lastTime) / 16.667));
    lastTime = now;
    const scroll = window.scrollY;
    const scrolled = scroll - lastScroll;
    lastScroll = scroll;

    states.forEach(state => {
      if (!state.visible) return;
      state.velocity += (scrolled - state.velocity) * 0.22;
      const speed = (0.78 + Math.min(9, Math.abs(state.velocity) * 0.6)) * delta;
      state.pos -= speed;
      if (state.width > 0 && -state.pos >= state.width) state.pos += state.width;
      const targetSkew = Math.max(-3.5, Math.min(3.5, state.velocity * 0.1));
      state.skew += (targetSkew - state.skew) * 0.09;
      state.track.style.transform =
        `translate3d(${state.pos.toFixed(2)}px, 0, 0) skewX(${state.skew.toFixed(2)}deg)`;
    });

    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);
}

function setupOdometers() {
  const nodes = [...document.querySelectorAll<HTMLElement>("[data-odo]")]
    .filter(node => node.dataset.odoReady !== "true");
  if (!nodes.length) return;
  nodes.forEach(node => {
    node.dataset.odoReady = "true";
  });

  // 降级到服务端渲染好的静态数字
  if (reducedMotion()) return;

  const playable: HTMLElement[] = [];

  nodes.forEach(node => {
    const value = node.dataset.odo ?? "";
    if (!/^\d+$/.test(value)) return;

    node.querySelector(".odo-fallback")?.remove();
    const digits = document.createElement("span");
    digits.className = "odo-digits";
    digits.setAttribute("aria-hidden", "true");
    // 先挂进文档再量行高，否则 getBoundingClientRect 全是 0
    node.appendChild(digits);

    [...value].forEach(digit => {
      const column = document.createElement("span");
      column.className = "odo-col";
      const strip = document.createElement("span");
      strip.className = "odo-strip";
      for (let n = 0; n <= 9; n += 1) {
        const glyph = document.createElement("b");
        glyph.textContent = String(n);
        strip.appendChild(glyph);
      }
      column.appendChild(strip);
      digits.appendChild(column);

      // 实测单格高度，避免用 em 猜字体造成半格裁切
      const step = strip.firstElementChild?.getBoundingClientRect().height ?? 0;
      if (step > 0) {
        column.style.height = `${step}px`;
        column.dataset.step = String(step);
      }
      column.dataset.digit = digit;
    });

    playable.push(node);
  });

  if (!playable.length) return;

  const play = (node: HTMLElement) => {
    const columns = [...node.querySelectorAll<HTMLElement>(".odo-col")];
    columns.forEach((column, index) => {
      const step = Number(column.dataset.step ?? 0);
      const digit = Number(column.dataset.digit ?? 0);
      window.setTimeout(() => {
        const strip = column.querySelector<HTMLElement>(".odo-strip");
        if (strip) strip.style.transform = `translateY(-${digit * step}px)`;
      }, 140 + index * 90);
    });
  };

  if (!("IntersectionObserver" in window)) {
    playable.forEach(play);
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      play(entry.target as HTMLElement);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  playable.forEach(node => observer.observe(node));
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
  setupScrollMarquee();
  setupOdometers();
}
