# Video and motion update

The supplied `D:/ابي cv/Aty logo.mp4` remains untouched. Optimized MP4 versions,
a WebM fallback, and a poster frame are served locally from `assets/`.
The video-only section immediately precedes Contact. GSAP handles the desktop
camera approach, artwork reveals, and the transition into Contact. Touch and
short landscape viewports use unpinned scrolling. Reduced-motion preferences
disable these effects and leave the existing reel under the visitor's control.

The logo film automatically loads as its section approaches and plays muted in
a loop while at least 18% of its stage is visible. Scrolling away, hiding the tab,
or opening an overlay pauses it; returning resumes from the same position.
At the owner's request, the logo has no pause control and its media autoplay is
independent of reduced-motion preferences. Decorative motion still respects them.
Browser autoplay restrictions cannot be overridden: if playback is refused,
a play-only recovery button appears and disappears once playback starts.
Without JavaScript, the logo remains a static poster.

## Verification performed

- Syntax checks: `npm run check`.
- Content and asset checks: `node tools/verify.mjs` with `npm run dev` running.
  Existing bilingual strings, visible text, and links match the original Git
  revision. All referenced assets exist. Video byte-range requests return 206.
- Browser checks at 320x568, 390x844, 768x1024, 844x390, 1024x768,
  1366x768, and 1920x1080, in English and Arabic. No horizontal overflow or
  clipped headings in the final layout.
- Mobile video source selection, play/pause, and natural scrolling.
- Desktop scroll pinning; pins are removed under reduced-motion preferences.
- Automatic sequencing through all three existing motion films.
- Lightbox open/close, Escape, and mobile menu keyboard handling.
- MP4 blocked: the logo film decoded and played through WebM.
- All logo media blocked: the poster and direct film link remain visible.
- JavaScript disabled: the existing reel's native controls, logo poster, and
  page content remain available.
- Animation library blocked: page content and the independent player initialize.
- Final normal load recorded no JavaScript exceptions.

### Scroll-playback follow-up

- Confirmed automatic muted logo playback at 390x844 and 1366x768, using the
  smaller mobile MP4 and the desktop MP4 respectively; no horizontal overflow.
- Confirmed autoplay with reduced motion enabled, while scroll pinning remains
  disabled. The logo exposes neither native controls nor a pause button.
- Confirmed scrolling offscreen pauses the film at a stable time and returning
  resumes playback; no JavaScript exceptions were recorded.
- Syntax and content/asset checks pass, including the new no-pause-controls
  assertion. Autoplay-policy recovery still requires native-device testing.

Browser validation used the available Chromium-based preview with viewport and
media emulation. Native Safari, Firefox, physical iOS/Android/Linux devices, and
a Lighthouse run were not available in this verification. Device and network
performance should be confirmed on the eventual production host.

Preview: `npm run dev`, then open `http://127.0.0.1:4173/`.
The site remains a static HTML/CSS/JavaScript site; no build step is required.
