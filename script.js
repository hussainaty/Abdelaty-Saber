const root = document.documentElement;
const header = document.querySelector("[data-header]");
const languageButton = document.querySelector("[data-language]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const dialog = document.querySelector("[data-lightbox-dialog]");
const dialogImage = document.querySelector("[data-dialog-image]");
const dialogCaption = document.querySelector("[data-dialog-caption]");
const dialogClose = document.querySelector("[data-dialog-close]");
let refreshMotionCopy = () => {};

document.querySelector("[data-current-year]").textContent = String(new Date().getFullYear());

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
}

function openMenu() {
  menuButton.setAttribute("aria-expanded", "true");
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
}

function setLanguage(language) {
  const isArabic = language === "ar";
  root.lang = language;
  root.dir = isArabic ? "rtl" : "ltr";
  document.title = isArabic ? "عبدالعاطي صابر" : "Abdelaty Saber";
  languageButton.textContent = isArabic ? "English" : "العربية";
  languageButton.setAttribute("aria-label", isArabic ? "Switch to English" : "تبديل اللغة إلى العربية");

  document.querySelectorAll("[data-en][data-ar]").forEach((element) => {
    element.innerHTML = isArabic ? element.dataset.ar : element.dataset.en;
  });

  document.querySelector(".brand").setAttribute(
    "aria-label",
    isArabic ? "عبدالعاطي صابر — الصفحة الرئيسية" : "Abdelaty Saber — home"
  );
  menuButton.setAttribute("aria-label", isArabic ? "فتح القائمة" : "Open menu");
  localStorage.setItem("abdelaty-saber-language", language);
  refreshMotionCopy();
}

function openLightbox(trigger) {
  dialogImage.src = trigger.dataset.src;
  dialogImage.alt = trigger.dataset.alt;
  dialogCaption.textContent = root.lang === "ar" ? trigger.dataset.captionAr : trigger.dataset.captionEn;
  if (!dialog.open) {
    dialog.showModal();
  }
  dialogClose.focus();
}

function closeLightbox() {
  if (dialog.open) {
    dialog.close();
  }
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

languageButton.addEventListener("click", () => {
  setLanguage(root.lang === "ar" ? "en" : "ar");
});

menuButton.addEventListener("click", () => {
  if (menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu();
  } else {
    openMenu();
  }
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
  trigger.addEventListener("click", () => openLightbox(trigger));
});

dialogClose.addEventListener("click", closeLightbox);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    closeLightbox();
  }
});

const navLinks = [...document.querySelectorAll(".desktop-nav a")];
const observedSections = [...document.querySelectorAll("[data-section]")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-in-view", entry.isIntersecting);
      if (!entry.isIntersecting) return;
      const activeName = entry.target.dataset.section;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + activeName);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
);

observedSections.forEach((section) => sectionObserver.observe(section));

const transitionSections = [...document.querySelectorAll("main > section:not(.hero)")];
const transitionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-in-view", entry.isIntersecting));
  },
  { rootMargin: "-12% 0px -16% 0px", threshold: 0.08 }
);

transitionSections.forEach((section) => transitionObserver.observe(section));

const motionCinema = document.querySelector("[data-motion-cinema]");

if (motionCinema) {
  const motionVideos = [...motionCinema.querySelectorAll("[data-motion-video]")];
  const motionTitle = motionCinema.querySelector("[data-motion-title]");
  const motionIndex = motionCinema.querySelector("[data-motion-index]");
  const motionKind = motionCinema.querySelector("[data-motion-kind]");
  const motionWipeIndex = motionCinema.querySelector("[data-motion-wipe-index]");
  const motionWipeTitle = motionCinema.querySelector("[data-motion-wipe-title]");
  const motionProgress = motionCinema.querySelector("[data-motion-progress]");
  let activeMotion = 0;
  let reelIsVisible = false;
  let isTransitioning = false;

  const motionName = (video) => (root.lang === "ar" ? video.dataset.titleAr : video.dataset.titleEn);
  const sequenceIndex = (index) => `${String(index + 1).padStart(2, "0")} / ${String(motionVideos.length).padStart(2, "0")}`;

  const startProgress = (video) => {
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration * 1000 : 8000;
    motionProgress.style.setProperty("--motion-duration", `${duration}ms`);
    motionProgress.classList.remove("is-running");
    void motionProgress.offsetWidth;
    motionProgress.classList.add("is-running");
  };

  refreshMotionCopy = () => {
    const activeVideo = motionVideos[activeMotion];
    motionTitle.textContent = motionName(activeVideo);
    motionIndex.textContent = sequenceIndex(activeMotion);
    motionKind.textContent = root.lang === "ar" ? motionKind.dataset.ar : motionKind.dataset.en;
  };

  const playActiveMotion = ({ restart = false } = {}) => {
    const activeVideo = motionVideos[activeMotion];
    if (!activeVideo || !reelIsVisible || document.hidden) return;

    activeVideo.muted = true;
    activeVideo.controls = false;
    if (restart || activeVideo.ended) activeVideo.currentTime = 0;
    startProgress(activeVideo);
    activeVideo.play().catch(() => {});
  };

  const showMotion = (index) => {
    activeMotion = index;
    motionVideos.forEach((video, videoIndex) => {
      const isActive = videoIndex === activeMotion;
      video.classList.toggle("is-active", isActive);
      video.classList.remove("is-leaving");
      video.setAttribute("aria-hidden", String(!isActive));
      if (!isActive) {
        video.pause();
        video.currentTime = 0;
      }
    });
    refreshMotionCopy();
  };

  const advanceMotion = () => {
    if (isTransitioning || !reelIsVisible) return;
    isTransitioning = true;
    const leavingVideo = motionVideos[activeMotion];
    const nextMotion = (activeMotion + 1) % motionVideos.length;
    const nextVideo = motionVideos[nextMotion];

    motionWipeIndex.textContent = String(nextMotion + 1).padStart(2, "0");
    motionWipeTitle.textContent = motionName(nextVideo);
    motionProgress.classList.remove("is-running");
    leavingVideo.classList.add("is-leaving");
    motionCinema.classList.add("is-transitioning");

    window.setTimeout(() => {
      leavingVideo.classList.remove("is-active");
      leavingVideo.pause();
      showMotion(nextMotion);
      motionCinema.classList.remove("is-transitioning");
      isTransitioning = false;
      playActiveMotion({ restart: true });
    }, 980);
  };

  motionVideos.forEach((video, index) => {
    video.muted = true;
    video.controls = false;
    video.addEventListener("ended", advanceMotion);
    video.addEventListener("loadedmetadata", () => {
      if (index === activeMotion && !video.paused) startProgress(video);
    });
    video.addEventListener("pause", () => {
      if (video.classList.contains("is-active") && !video.ended && reelIsVisible && !document.hidden && !isTransitioning) {
        window.setTimeout(() => video.play().catch(() => {}), 0);
      }
    });
  });

  const motionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        reelIsVisible = entry.isIntersecting;
        if (reelIsVisible) {
          playActiveMotion();
        } else {
          motionVideos[activeMotion].pause();
        }
      });
    },
    { threshold: 0.45 }
  );

  motionObserver.observe(motionCinema);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) playActiveMotion();
  });
  showMotion(0);
}

const savedLanguage = localStorage.getItem("abdelaty-saber-language");
if (savedLanguage === "ar" || savedLanguage === "en") {
  setLanguage(savedLanguage);
}
