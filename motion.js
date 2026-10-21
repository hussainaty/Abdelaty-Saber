/* Royalbev-inspired depth and pacing, using the artist's existing content. */
(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const media = gsap.matchMedia();
  media.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 901px) and (min-height: 540px) and (hover: hover) and (pointer: fine)" }, context => {
    if (!context.conditions.motion) return;
    const desktop = context.conditions.desktop;
    const hero = document.querySelector(".hero");
    const film = document.querySelector(".logo-film");
    const frame = film.querySelector(".logo-film-frame");
    const stage = film.querySelector(".logo-film-stage");

    // Preserve Arabic shaping: never split joined script into characters.
    if (hero.getBoundingClientRect().bottom > 0 && !location.hash) {
      gsap.from(".hero-role, .hero h1, .hero-years, .hero-link", {
        y: 32, opacity: 0.35, duration: 1.1, stagger: 0.11,
        ease: "power3.out", clearProps: "transform,opacity"
      });
    }
    if (desktop) {
      gsap.to(".hero-stage > img", {
        yPercent: 8, scale: 1.035, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 }
      });
      gsap.to(".hero-copy", {
        y: -45, opacity: 0.4, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom 15%", scrub: 0.8 }
      });
    }

    // Start reveals on entry. The CSS default always leaves content visible.
    const reveals = document.querySelectorAll("main h2, .discipline, .graphic-layout .artwork, .graphic-strip .artwork, .identity-image, .identity-accent, .art-grid .artwork, .course-poster-panel, .course-evidence .artwork, .about-photo, .archive-timeline li, .certificate-card");
    reveals.forEach((element, index) => {
      ScrollTrigger.create({
        trigger: element, start: "top 94%", once: true,
        onEnter: context.add(null, () => {
          const image = element.matches(".artwork, .discipline, .certificate-card, .about-photo, .course-poster-panel");
          gsap.fromTo(element,
            { y: image ? (desktop ? 44 : 22) : 26, opacity: image ? 0.65 : 0.5, scale: image ? 0.975 : 1 },
            { y: 0, opacity: 1, scale: 1, duration: image ? 1.05 : 0.85, delay: image ? (index % 3) * 0.055 : 0,
              ease: "power3.out", clearProps: "transform,opacity" });
        })
      });
    });

    if (desktop) {
      gsap.fromTo(frame, { scale: 0.88 }, {
        scale: 1, ease: "none",
        scrollTrigger: {
          trigger: film, start: "top top", end: () => "+=" + Math.min(innerHeight * 0.65, 650),
          pin: stage, scrub: 0.9, anticipatePin: 1, invalidateOnRefresh: true
        }
      });
    } else {
      // Touch and short landscape screens keep natural, unpinned scrolling.
      gsap.fromTo(frame, { scale: 0.95 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: film, start: "top bottom", end: "top 15%", scrub: 0.5 }
      });
    }
    gsap.fromTo(".contact-layout", { y: desktop ? 65 : 25 }, {
      y: 0, ease: "none",
      scrollTrigger: { trigger: "#contact", start: "top bottom", end: "top 45%", scrub: 0.7 }
    });
    // matchMedia automatically reverts owned tweens and pins when settings change.
  });

  const refresh = () => ScrollTrigger.refresh();
  document.addEventListener("portfolio:language", refresh);
  window.addEventListener("load", refresh, { once: true });
  document.fonts?.ready.then(refresh);
  document.querySelectorAll("main img").forEach(img => {
    if (!img.complete) img.addEventListener("load", refresh, { once: true });
  });
  window.addEventListener("pageshow", refresh);
})();
