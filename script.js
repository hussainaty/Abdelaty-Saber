const root = document.documentElement;
const header = document.querySelector("[data-header]");
const languageButton = document.querySelector("[data-language]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const dialog = document.querySelector("[data-lightbox-dialog]");
const dialogImage = document.querySelector("[data-dialog-image]");
const dialogCaption = document.querySelector("[data-dialog-caption]");
const dialogClose = document.querySelector("[data-dialog-close]");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const players = [];
let lightboxTrigger;
let closeAnimation;

document.querySelector("[data-current-year]").textContent = String(new Date().getFullYear());
menuButton.setAttribute("aria-controls", mobileMenu.id);

function updateMenuLabel() {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-label", root.lang === "ar" ? (open ? "إغلاق القائمة" : "فتح القائمة") : (open ? "Close menu" : "Open menu"));
}
function syncPlayers() { players.forEach(player => player.sync()); }
function closeMenu(restoreFocus = false) {
  menuButton.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenu.inert = true;
  document.body.classList.remove("menu-open");
  document.querySelector("main").inert = false;
  document.querySelector(".site-footer").inert = false;
  updateMenuLabel();
  if (restoreFocus) menuButton.focus();
  syncPlayers();
}
function openMenu() {
  menuButton.setAttribute("aria-expanded", "true");
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  mobileMenu.inert = false;
  document.body.classList.add("menu-open");
  document.querySelector("main").inert = true;
  document.querySelector(".site-footer").inert = true;
  updateMenuLabel();
  mobileMenu.querySelector("a").focus();
  syncPlayers();
}
function setLanguage(language) {
  const arabic = language === "ar";
  root.lang = language;
  root.dir = arabic ? "rtl" : "ltr";
  document.title = arabic ? "عبدالعاطي صابر" : "Abdelaty Saber";
  languageButton.textContent = arabic ? "English" : "العربية";
  languageButton.setAttribute("aria-label", arabic ? "Switch to English" : "تبديل اللغة إلى العربية");
  document.querySelectorAll("[data-en][data-ar]").forEach(element => {
    element.innerHTML = arabic ? element.dataset.ar : element.dataset.en;
  });
  document.querySelector(".brand").setAttribute("aria-label", arabic ? "عبدالعاطي صابر — الصفحة الرئيسية" : "Abdelaty Saber — home");
  updateMenuLabel();
  dialog.setAttribute("aria-label", arabic ? "عرض العمل الفني" : "Artwork preview");
  dialogClose.setAttribute("aria-label", arabic ? "إغلاق عرض العمل الفني" : "Close artwork preview");
  const logo = document.querySelector("[data-logo-film]");
  logo.setAttribute("aria-label", arabic ? "فيلم شعار عبدالعاطي صابر ثلاثي الأبعاد" : "Abdelaty Saber 3D logo film");
  logo.querySelector("video").setAttribute("aria-label", logo.getAttribute("aria-label"));
  logo.querySelector(".logo-film-poster").alt = arabic ? "اسم عبدالعاطي صابر بالخط العربي الذهبي ثلاثي الأبعاد" : "Abdelaty Saber's golden Arabic calligraphy in 3D";
  players.forEach(player => player.refreshCopy());
  try { localStorage.setItem("abdelaty-saber-language", language); } catch { /* Storage can be disabled in private browsing. */ }
  document.dispatchEvent(new Event("portfolio:language"));
}

function openLightbox(trigger) {
  closeAnimation?.cancel();
  lightboxTrigger = trigger;
  dialogImage.src = trigger.dataset.src;
  dialogImage.alt = trigger.dataset.alt;
  dialogCaption.textContent = root.lang === "ar" ? trigger.dataset.captionAr : trigger.dataset.captionEn;
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("lightbox-open");
  if (!reduceMotion.matches && dialog.animate) {
    dialog.animate([{ opacity: 0, transform: "translateY(24px) scale(.97)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
  }
  dialogClose.focus();
  syncPlayers();
}
function closeLightbox() {
  if (!dialog.open || closeAnimation?.playState === "running") return;
  if (reduceMotion.matches || !dialog.animate) return dialog.close();
  closeAnimation = dialog.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(12px) scale(.985)" }], { duration: 190, easing: "ease-in" });
  closeAnimation.onfinish = () => dialog.close();
}

// Observe a sentinel instead of running a handler on every scroll frame.
const headerSentinel = document.createElement("div");
headerSentinel.className = "header-sentinel";
headerSentinel.setAttribute("aria-hidden", "true");
document.body.prepend(headerSentinel);
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => header.classList.toggle("is-scrolled", !entry.isIntersecting)).observe(headerSentinel);
} else header.classList.add("is-scrolled");

languageButton.addEventListener("click", () => setLanguage(root.lang === "ar" ? "en" : "ar"));
menuButton.addEventListener("click", () => menuButton.getAttribute("aria-expanded") === "true" ? closeMenu(true) : openMenu());
matchMedia("(min-width: 901px)").addEventListener("change", event => { if (event.matches) closeMenu(); });
mobileMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    closeMenu();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
  });
});
document.addEventListener("keydown", event => {
  if (menuButton.getAttribute("aria-expanded") !== "true") return;
  if (event.key === "Escape") closeMenu(true);
  if (event.key !== "Tab") return;
  const focusable = [...header.querySelectorAll("a, button"), ...mobileMenu.querySelectorAll("a")].filter(element => element.getClientRects().length);
  const index = focusable.indexOf(document.activeElement);
  if (event.shiftKey && index <= 0) { event.preventDefault(); focusable.at(-1).focus(); }
  else if (!event.shiftKey && index === focusable.length - 1) { event.preventDefault(); focusable[0].focus(); }
});
document.querySelectorAll("[data-lightbox]").forEach(trigger => trigger.addEventListener("click", () => openLightbox(trigger)));
// Native smooth anchor travel is explicit; global smooth CSS would interfere
// with ScrollTrigger's resize/pin measurements and shift the scroll position.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, "", link.hash);
    target.scrollIntoView({ behavior: reduceMotion.matches ? "instant" : "smooth", block: "start" });
    if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  });
});
dialogClose.addEventListener("click", closeLightbox);
dialog.addEventListener("click", event => { if (event.target === dialog) closeLightbox(); });
dialog.addEventListener("cancel", event => { event.preventDefault(); closeLightbox(); });
dialog.addEventListener("close", () => {
  document.body.classList.remove("lightbox-open");
  lightboxTrigger?.focus({ preventScroll: true });
  syncPlayers();
});

const navLinks = [...document.querySelectorAll(".desktop-nav a")];
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute("href") === "#" + entry.target.dataset.section;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-20% 0px -60% 0px" });
  document.querySelectorAll("[data-section]").forEach(section => sectionObserver.observe(section));
}

// Playback is independent of GSAP. The logo is an automatic, scroll-controlled
// film; the existing reel retains its manual controls and motion preferences.
function createPlayer(container, videos, isReel = false) {
  const automatic = container.hasAttribute("data-scroll-playback");
  const toggle = container.querySelector("[data-player-toggle]");
  const start = container.querySelector("[data-player-start]");
  const progress = container.querySelector("[data-motion-progress]");
  const fallback = container.querySelector("[data-player-fallback]");
  const saveData = Boolean(navigator.connection?.saveData);
  let active = 0;
  let visible = false;
  let userPaused = false;
  let userStarted = false;
  let blocked = false;
  let transitioning = false;
  let transitionTimer;
  let playRequest = 0;
  const failedSources = new WeakMap();
  // The logo's explicit automatic mode only overrides media playback defaults;
  // decorative GSAP/CSS motion still respects the system preference.
  const allowed = () => visible && !document.hidden && !dialog.open && !document.body.classList.contains("menu-open") && !userPaused && (automatic || (!reduceMotion.matches && !saveData) || userStarted);
  const name = video => root.lang === "ar" ? video.dataset.titleAr : video.dataset.titleEn;
  function refreshCopy() {
    const video = videos[active];
    const playing = !video.paused && !video.ended;
    container.classList.toggle("is-playing", playing);
    const action = root.lang === "ar" ? (playing ? "إيقاف مؤقت" : "تشغيل الفيديو") : (playing ? "Pause video" : "Play video");
    if (toggle) {
      toggle.setAttribute("aria-label", action);
      toggle.title = action;
    }
    if (start) start.setAttribute("aria-label", root.lang === "ar" ? "تشغيل الفيديو" : "Play logo film");
    if (isReel) {
      container.querySelector("[data-motion-title]").textContent = name(video);
      container.querySelector("[data-motion-index]").textContent = String(active + 1).padStart(2, "0") + " / " + String(videos.length).padStart(2, "0");
    }
  }
  function loadVideo(video) {
    if (video.dataset.loaded) return;
    const mobile = saveData || matchMedia("(max-width: 767px)").matches;
    video.querySelectorAll("source[data-src]").forEach(source => {
      source.src = mobile && source.dataset.mobileSrc ? source.dataset.mobileSrc : source.dataset.src;
    });
    video.dataset.loaded = "true";
    failedSources.set(video, new Set());
    video.preload = automatic ? "auto" : "metadata";
    video.load();
  }
  function showError(video) {
    if (video !== videos[active]) return;
    container.classList.add("has-error");
    blocked = true;
    video.pause();
    refreshCopy();
    if (start) start.hidden = true;
    if (fallback) {
      fallback.hidden = false;
      if (toggle) toggle.hidden = true;
    } else if (!automatic) { video.controls = true; video.tabIndex = 0; }
  }
  function sync() {
    const video = videos[active];
    if (!allowed()) {
      playRequest++;
      videos.forEach(item => item.pause());
      refreshCopy();
      return;
    }
    if (blocked || transitioning || !video.paused) return;
    loadVideo(video);
    video.muted = true;
    const request = ++playRequest;
    video.play().then(() => {
      // A tab may be hidden while play() waits for the first decoded frame.
      // An older request must never pause a newer, valid play request.
      if (request !== playRequest) return;
      if (!allowed()) video.pause();
      refreshCopy();
    }).catch(error => {
      if (request !== playRequest) return;
      if (error.name !== "AbortError") blocked = true;
      if (error.name === "NotSupportedError") showError(video);
      // Some browsers require a tap in low-power mode. This recovery action can
      // only start the film, never pause it, and disappears as soon as it plays.
      if (error.name === "NotAllowedError" && start) start.hidden = false;
      refreshCopy();
    });
  }
  function show(index) {
    active = index;
    videos.forEach((video, i) => {
      video.classList.toggle("is-active", i === active);
      video.classList.remove("is-leaving");
      video.setAttribute("aria-hidden", String(i !== active));
      if (i !== active) video.pause();
    });
    if (progress) progress.style.transform = "scaleX(0)";
    refreshCopy();
  }
  function advance() {
    if (transitioning) return;
    const next = (active + 1) % videos.length;
    if (reduceMotion.matches || !visible) { show(next); sync(); return; }
    transitioning = true;
    container.querySelector("[data-motion-wipe-index]").textContent = String(next + 1).padStart(2, "0");
    container.querySelector("[data-motion-wipe-title]").textContent = name(videos[next]);
    loadVideo(videos[next]);
    videos[active].classList.add("is-leaving");
    container.classList.add("is-transitioning");
    transitionTimer = setTimeout(() => {
      show(next);
      if (videos[next].readyState >= 1) videos[next].currentTime = 0;
      container.classList.remove("is-transitioning");
      transitioning = false;
      sync();
    }, 760);
  }
  videos.forEach((video, index) => {
    video.controls = false;
    video.muted = true;
    video.defaultMuted = true;
    video.tabIndex = -1;
    video.addEventListener("play", refreshCopy);
    video.addEventListener("pause", refreshCopy);
    video.addEventListener("playing", () => {
      container.classList.remove("has-error");
      if (fallback) fallback.hidden = true;
      if (toggle) toggle.hidden = false;
      if (start) start.hidden = true;
    });
    video.addEventListener("error", () => showError(video));
    const sources = [...video.querySelectorAll("source")];
    sources.forEach(source => source.addEventListener("error", () => {
      if (!video.dataset.loaded) return;
      const failures = failedSources.get(video) || new Set();
      failures.add(source);
      failedSources.set(video, failures);
      if (failures.size === sources.length) showError(video);
    }));
    video.addEventListener("timeupdate", () => {
      if (progress && index === active && video.duration > 0) progress.style.transform = "scaleX(" + video.currentTime / video.duration + ")";
    });
    if (isReel) video.addEventListener("ended", advance);
  });
  if (toggle) toggle.hidden = false;
  toggle?.addEventListener("click", () => {
    const video = videos[active];
    if (!video.paused) { userPaused = true; sync(); }
    else {
      userStarted = true; userPaused = false; blocked = false; visible = true;
      if (video.error || container.classList.contains("has-error")) delete video.dataset.loaded;
      sync();
    }
  });
  start?.addEventListener("click", () => {
    blocked = false;
    sync();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && (!automatic || entry.intersectionRatio >= 0.18);
      sync();
    }, { threshold: [0, 0.18] })
      .observe(container.querySelector(isReel ? ".motion-cinema-stage" : ".logo-film-stage"));
    const preloadObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (!saveData && (automatic || !reduceMotion.matches)) loadVideo(videos[active]);
      preloadObserver.disconnect();
    }, { rootMargin: "450px" });
    preloadObserver.observe(container);
  } else visible = true;
  reduceMotion.addEventListener("change", () => {
    userStarted = false;
    if (transitioning) {
      clearTimeout(transitionTimer);
      transitioning = false;
      container.classList.remove("is-transitioning");
      videos[active].classList.remove("is-leaving");
    }
    sync();
  });
  container.classList.add("is-enhanced");
  show(0);
  sync();
  return { sync, refreshCopy };
}
const reel = document.querySelector("[data-motion-cinema]");
if (reel) players.push(createPlayer(reel, [...reel.querySelectorAll("[data-motion-video]")], true));
const logoFilm = document.querySelector("[data-logo-film]");
if (logoFilm) players.push(createPlayer(logoFilm, [logoFilm.querySelector("[data-logo-video]")]));
document.addEventListener("visibilitychange", syncPlayers);
window.addEventListener("pagehide", () => document.querySelectorAll("video").forEach(video => video.pause()));
window.addEventListener("pageshow", syncPlayers);
let savedLanguage;
try { savedLanguage = localStorage.getItem("abdelaty-saber-language"); } catch { /* Keep the default language if storage is unavailable. */ }
setLanguage(savedLanguage === "ar" ? "ar" : "en");
