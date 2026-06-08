/* =============================================================
   APEX YACHTS — Luxury Yacht Sales  |  script.js
   =============================================================
   Sections:
   1. Water Ripple Effect (Three.js — navy theme)
   2. GSAP Scroll Animations (page2 panels + page3 tag cloud)
   3. Parallax Tag Mover (page3)
   4. Yacht Overlay (details drawer)
   5. Horizontal Parallax Gallery (GSAP ScrollTrigger)
   6. Lenis Smooth Scroll
   ============================================================= */

/* ──────────────────────────────────────────────────────────────
   1. GSAP SCROLL ANIMATIONS
   ────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  /* SplitType instances store to revert on demand if needed */
  let activeSplitInstances = [];

  /* Generic reveal system using SplitType & ScrollTrigger */
  function initTextReveals() {
    const revealElements = document.querySelectorAll("[data-split-reveal]");

    revealElements.forEach((el) => {
      // Ignorar elementos da Hero (#page1) e Showcase Header para não ter conflito com os reveals específicos
      if (el.closest("#page1") || el.closest(".showcase-header")) return;

      const type = el.getAttribute("data-split-reveal");

      const split = new SplitType(el, {
        types: type === "chars" ? "words,chars" : type === "words" ? "words" : "lines",
        lineClass: "split-line",
        wordClass: "split-word",
        charClass: "split-char"
      });

      activeSplitInstances.push(split);

      if (type === "lines" && split.lines) {
        split.lines.forEach((line) => {
          const wrapper = document.createElement("span");
          wrapper.className = "line-wrapper";
          line.parentNode.insertBefore(wrapper, line);
          wrapper.appendChild(line);
        });
      }

      const targets = type === "chars" ? split.chars : type === "words" ? split.words : split.lines;

      if (targets && targets.length) {
        gsap.set(targets, { yPercent: 115 });

        gsap.to(targets, {
          yPercent: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: type === "chars" ? 0.02 : type === "words" ? 0.04 : 0.08,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            end: "bottom 12%",
            toggleActions: "play none none reverse",
          }
        });
      }
    });
  }

  /* Fullscreen SVG Mask Scroll-Driven Vertical Blinds Transition */
  function initStackingCards() {
    const stage = document.querySelector(".stage");
    const layers = document.querySelectorAll(".layer");
    if (!stage || !layers.length) return;

    const blindCount = 12;
    const svgNS = 'http://www.w3.org/2000/svg';
    let blindsSets = [];
    let master;

    function createBlinds(groupId, isFirstLayer, vbWidth) {
      const g = document.getElementById(groupId);
      if (!g) return null;
      g.innerHTML = '';

      const w = vbWidth / blindCount;
      const blinds = [];
      let currentX = 0;

      for (let i = 0; i < blindCount; i++) {
        const centerX = currentX + w / 2;
        const rectLeft = document.createElementNS(svgNS, 'rect');
        const rectRight = document.createElementNS(svgNS, 'rect');

        [rectLeft, rectRight].forEach((r) => {
          r.setAttribute('y', '0');
          r.setAttribute('height', '100');
          r.setAttribute('width', isFirstLayer ? (w / 2 + 0.1).toString() : '0');
          r.setAttribute('fill', 'white');
          r.setAttribute('shape-rendering', 'crispEdges');
        });

        if (isFirstLayer) {
          rectLeft.setAttribute('x', (centerX - w / 2).toString());
          rectRight.setAttribute('x', centerX.toString());
        } else {
          rectLeft.setAttribute('x', centerX.toString());
          rectRight.setAttribute('x', centerX.toString());
        }

        g.appendChild(rectLeft);
        g.appendChild(rectRight);

        blinds.push({ left: rectLeft, right: rectRight, x: centerX, w: w / 2 });
        currentX += w;
      }
      return blinds;
    }

    function openBlinds(blinds) {
      return gsap.to(
        blinds.flatMap((b) => [b.left, b.right]),
        {
          attr: {
            x: (i) => {
              const b = blinds[Math.floor(i / 2)];
              return i % 2 === 0 ? b.x - b.w : b.x;
            },
            width: (i) => {
              const b = blinds[Math.floor(i / 2)];
              return b.w + 0.05;
            },
          },
          ease: 'none',
          stagger: { each: 0.02, from: 'start' },
        }
      );
    }

    function updateLayout() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const vbWidth = (width / height) * 100;
      const vbHeight = 100;

      blindsSets = [];

      layers.forEach((svg, i) => {
        svg.setAttribute('viewBox', `0 0 ${vbWidth} ${vbHeight}`);

        const maskRect = svg.querySelector('mask rect');
        if (maskRect) {
          maskRect.setAttribute('width', vbWidth.toString());
          maskRect.setAttribute('height', vbHeight.toString());
        }

        const img = svg.querySelector('image');
        if (img) {
          img.setAttribute('width', vbWidth.toString());
          img.setAttribute('height', vbHeight.toString());
          img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        }

        const blindElement = svg.querySelector('g[id^="blinds"]');
        if (blindElement) {
          const blinds = createBlinds(blindElement.id, i === 0, vbWidth);
          if (blinds) blindsSets.push(blinds);
        }
      });

      buildMasterTimeline();
    }

    function buildMasterTimeline() {
      if (master) master.kill();

      const texts = gsap.utils.toArray('.texts .txt');

      master = gsap.timeline({
        scrollTrigger: {
          trigger: '.stage',
          start: 'top top',
          end: '+=800%',
          scrub: 2.0,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Dynamic text indicator classes for click events toggle
            const progress = self.progress;
            const totalSteps = texts.length;
            const activeIndex = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));

            texts.forEach((txt, idx) => {
              if (idx === activeIndex) {
                txt.classList.add("active");
              } else {
                txt.classList.remove("active");
              }
            });
          }
        },
      });

      gsap.set(texts, { clipPath: 'inset(0% 0% 100% 0%)', y: 40, opacity: 0 });
      gsap.set(texts[0], { clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1 });

      // Initial holding period for Slide 0 ("Navegar") to prevent immediate fading
      master.to({}, { duration: 3.0 });

      blindsSets.forEach((blinds, i) => {
        if (i === 0) return;

        if (texts[i - 1]) {
          master.to(
            texts[i - 1],
            {
              clipPath: 'inset(0% 0% 100% 0%)',
              y: -40,
              opacity: 0,
              duration: 0.8,
            },
            '>'
          );
        }

        master.add(openBlinds(blinds), '-=0.3');

        if (texts[i]) {
          master.to(
            texts[i],
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              y: 0,
              opacity: 1,
              duration: 0.8,
            },
            '-=0.5'
          );
        }

        // Holding period for slides 1, 2, 3
        master.to({}, { duration: 2.0 });
      });
    }

    function initProgressBar() {
      const progressFills = gsap.utils.toArray('.progress-bar .fill');
      ScrollTrigger.create({
        trigger: '.stage',
        start: 'top top',
        end: '+=800%',
        scrub: 0.3,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalSteps = progressFills.length;
          progressFills.forEach((fill, i) => {
            let p = (progress - i / totalSteps) * totalSteps;
            p = Math.max(0, Math.min(1, p));
            fill.style.width = `${p * 100}%`;
          });
        },
      });
    }

    updateLayout();
    initProgressBar();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateLayout();
        ScrollTrigger.refresh();
      }, 250);
    });
  }

  /* Concept Details Overlay Panel (Slow and Smooth Reveal from Corner '+') */
  function initConceptModal() {
    const plusBtns = document.querySelectorAll(".plus-btn");

    plusBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        // Find the slide that contains this plus button
        const slide = btn.closest(".slide") || btn.closest(".txt");
        if (!slide) return;

        const overlay = slide.querySelector(".details-card-overlay");
        const wrapper = slide.querySelector(".details-card-wrapper");
        if (!overlay || !wrapper) return;

        // If the plus button is already active, close the modal
        if (btn.classList.contains("is-active")) {
          closeModal(overlay, wrapper);
          return;
        }

        // Freeze scrolling
        document.body.style.overflow = "hidden";
        window.lenis?.stop();

        // 1. Open overlay
        overlay.classList.add("is-open");
        btn.classList.add("is-active");

        // Select all inner elements to stagger-reveal
        const titleGroup = wrapper.querySelector(".details-card-title-group");
        const thumb = wrapper.querySelector(".details-card-thumb");
        const desc = wrapper.querySelector(".details-card-desc");
        const specsRows = wrapper.querySelectorAll(".details-spec-row");
        const reserveText = wrapper.querySelector(".details-card-reserve");
        const costBox = wrapper.querySelector(".details-card-cost-box");

        // Set transform origins for premium expansion
        gsap.set(wrapper, { transformOrigin: "bottom left" });
        gsap.set(costBox, { transformOrigin: "left center" });

        // Reset elements before animating
        gsap.set(wrapper, { scale: 0.1, y: 150, opacity: 0 });
        gsap.set(costBox, { scaleX: 0, opacity: 0 });

        // Content elements to reveal from left to right
        const leftToRightElements = [
          titleGroup,
          thumb,
          desc,
          ...specsRows,
          reserveText
        ].filter(Boolean);

        gsap.set(leftToRightElements, { x: -50, opacity: 0 });

        // Morph the plus button: grow to 50px and spin 135deg to turn + into X
        gsap.to(btn, {
          width: 50,
          height: 50,
          rotation: 135,
          duration: 0.6,
          ease: "power2.out"
        });

        // 2. Coordinated Timeline
        const tl = gsap.timeline();

        // Step A: Load the grey card base + black box first!
        tl.to(wrapper, {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power4.out"
        })
          .to(costBox, {
            scaleX: 1,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out"
          }, "-=0.3"); // Overlaps with card expansion

        // Step B: Stagger-reveal all text and image elements from left to right (after base is loaded)
        tl.to(leftToRightElements, {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out"
        }, "-=0.1"); // Starts just as the cost box finishes
      });
    });

    // Click outside to close
    const overlays = document.querySelectorAll(".details-card-overlay");
    overlays.forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          const wrapper = overlay.querySelector(".details-card-wrapper");
          closeModal(overlay, wrapper);
        }
      });
    });

    // Escape key close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openOverlay = document.querySelector(".details-card-overlay.is-open");
        if (openOverlay) {
          const wrapper = openOverlay.querySelector(".details-card-wrapper");
          closeModal(openOverlay, wrapper);
        }
      }
    });

    function closeModal(overlay, wrapper) {
      if (!overlay || !wrapper) return;

      // Find the active plus button in the parent slide to rotate it back and restore size
      const slide = overlay.closest(".slide") || overlay.closest(".txt");
      if (slide) {
        const btn = slide.querySelector(".plus-btn");
        if (btn) {
          btn.classList.remove("is-active");
          gsap.to(btn, {
            width: 40,
            height: 40,
            rotation: 0,
            duration: 0.6,
            ease: "power2.inOut"
          });
        }
      }

      const titleGroup = wrapper.querySelector(".details-card-title-group");
      const thumb = wrapper.querySelector(".details-card-thumb");
      const desc = wrapper.querySelector(".details-card-desc");
      const specsRows = wrapper.querySelectorAll(".details-spec-row");
      const reserveText = wrapper.querySelector(".details-card-reserve");
      const costBox = wrapper.querySelector(".details-card-cost-box");

      const tl = gsap.timeline({
        onComplete: () => {
          overlay.classList.remove("is-open");
          document.body.style.overflow = "";
          window.lenis?.start();
        }
      });

      // Close stagger out quickly, then hide wrapper
      tl.to([costBox, reserveText], { y: 15, opacity: 0, duration: 0.25, stagger: 0.05, ease: "power2.in" })
        .to(specsRows, { x: -15, opacity: 0, duration: 0.2, stagger: 0.03, ease: "power2.in" }, "-=0.15")
        .to([desc, thumb, titleGroup], { y: 15, opacity: 0, duration: 0.25, stagger: 0.05, ease: "power2.in" }, "-=0.15")
        .to(wrapper, { scale: 0.92, y: 30, opacity: 0, duration: 0.45, ease: "power3.inOut" }, "-=0.2");
    }
  }

  /* Showcase Category Tabs Filtering */
  function initShowcaseFilters() {
    const tabs = document.querySelectorAll(".showcase-tab");
    const cards = document.querySelectorAll(".yacht-card");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        // Toggle active class on tabs
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const filter = tab.getAttribute("data-filter");

        // Fade out all cards, filter, and fade in matching cards
        gsap.to(cards, {
          opacity: 0,
          scale: 0.95,
          y: 20,
          duration: 0.3,
          onComplete: () => {
            cards.forEach(card => {
              const category = card.getAttribute("data-category");
              if (filter === "all" || category === filter) {
                card.style.display = "block";
              } else {
                card.style.display = "none";
              }
            });

            // Recalculate ScrollTrigger markers since layout dimensions changed
            ScrollTrigger.refresh();

            // Staggered fade in of visible cards
            const visibleCards = Array.from(cards).filter(c => c.style.display !== "none");
            gsap.fromTo(visibleCards,
              { opacity: 0, scale: 0.95, y: 30 },
              { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", overwrite: "auto" }
            );
          }
        });
      });
    });
  }

  /* Scroll reveal text in Host Grotesk font with progress color fill */
  function initScrollRevealText() {
    const textEl = document.querySelector(".reveal-paragraph[data-scroll-fill]");
    if (!textEl) return;

    const split = new SplitType(textEl, {
      types: "words,chars",
      charClass: "reveal-char"
    });

    gsap.fromTo(split.chars,
      { color: "rgba(244, 239, 231, 0.18)" },
      {
        color: "rgb(244, 239, 231)",
        stagger: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: "#page-reveal-text",
          start: "top 65%",
          end: "bottom 35%",
          scrub: true,
        }
      }
    );
  }

  /* Progressive, scroll-driven reveal for Frota Showcase Header (Section 3) */
  function initShowcaseHeaderReveal() {
    const header = document.querySelector(".showcase-header");
    if (!header) return;
    const title = header.querySelector("h2");
    const subtitle = header.querySelector("p");
    const tabs = header.querySelector(".showcase-tabs");
    if (!title || !subtitle) return;

    const splitTitle = new SplitType(title, { types: "chars", charClass: "showcase-split-char" });
    const splitSubtitle = new SplitType(subtitle, { types: "lines", lineClass: "showcase-split-line-wrap" });

    // Wrap lines in overflow hidden span masks
    if (splitSubtitle.lines) {
      splitSubtitle.lines.forEach(line => {
        const wrapper = document.createElement("span");
        wrapper.className = "line-wrapper";
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });
    }

    gsap.set(splitTitle.chars, { yPercent: 115 });
    gsap.set(splitSubtitle.lines, { yPercent: 115 });
    if (tabs) gsap.set(tabs, { opacity: 0, y: 20 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: "top 95%",
        end: "bottom 65%",
        scrub: 1.0
      }
    });

    tl.to(splitTitle.chars, {
      yPercent: 0,
      stagger: 0.03,
      ease: "power2.out"
    })
      .to(splitSubtitle.lines, {
        yPercent: 0,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.3");

    if (tabs) {
      tl.to(tabs, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.2");
    }
  }

  /* ── Scroll reveal for showcase cards (Section 3) ── */
  function initShowcaseCards() {
    gsap.utils.toArray(".yacht-card").forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 92%",
            end: "bottom 10%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }

  /* Subtle hardware-accelerated parallax inside Showcase Cards */
  function initShowcaseParallax() {
    const images = gsap.utils.toArray(".yacht-parallax-img");
    images.forEach(img => {
      gsap.fromTo(img,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".yacht-card"),
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });
  }

  /* ── Horizontal Parallax Gallery (Section 4 - Codrops Clone) ──
     Pins #parallax-gallery and slides .gallery__image__container.
     Applies the exact 2D DOM parallax shift to .gallery__media__image.
     Optimized: Cached coordinates on initialization & resize to avoid layout thrashing.
     ──────────────────────────────────────────────────────────── */
  function initHorizontalGallery() {
    const gallerySection = document.querySelector("#parallax-gallery");
    const scrollContainer = document.querySelector(".gallery__image__container");

    if (gallerySection && scrollContainer) {
      const getTotal = () => {
        const wrapper = document.querySelector(".gallery__wrapper");
        return scrollContainer.scrollWidth - (wrapper ? wrapper.clientWidth : window.innerWidth);
      };

      let cachedImagePositions = [];

      const cachePositions = () => {
        cachedImagePositions = [];
        const images = document.querySelectorAll(".gallery__media__image");
        images.forEach((image) => {
          const parent = image.closest(".gallery__media");
          if (!parent) return;
          cachedImagePositions.push({
            element: image,
            offsetLeft: parent.offsetLeft,
            width: parent.offsetWidth
          });
        });
      };

      // Cache elements position on initialization and every time ScrollTrigger refreshes (e.g. resize)
      ScrollTrigger.addEventListener("refreshInit", cachePositions);
      cachePositions();

      gsap.to(scrollContainer, {
        x: () => -getTotal(),
        ease: "none",
        scrollTrigger: {
          trigger: gallerySection,
          start: "top top",
          end: () => "+=" + (getTotal() * 0.5),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const vw = window.innerWidth;
            const viewportCenter = vw * 0.5;

            // Calculate the current translation X mathematically using ScrollTrigger progress
            const totalDistance = getTotal();
            const currentX = -self.progress * totalDistance;

            cachedImagePositions.forEach((data) => {
              // Position on screen = offsetLeft + translation + width / 2
              const elementCenter = data.offsetLeft + currentX + data.width * 0.5;

              // clamp scale between -1 (fully left) and 1 (fully right)
              const t = Math.max(-1, Math.min(1, (elementCenter - viewportCenter) / viewportCenter));

              // Codrops uses 10% max displacement for its 125% width images (-12.5% left offset)
              const maxShift = 12.5;
              const shift = -t * maxShift; // opposite direction for depth/parallax

              data.element.style.transform = `translate3d(${shift}%, 0, 0)`;
            });
          }
        },
      });
    }
  }



  /* Premium Opening Reveal Animation (Awwwards-grade GSAP Reveal) */
  function initHeroReveal() {
    const hero = document.getElementById("hero");
    if (!hero) return;

    // Congelar scroll
    window.lenis?.stop();
    document.body.style.overflow = "hidden";

    // Seletores de texto para SplitType
    const tag = hero.querySelector(".hero-tag");
    const title = hero.querySelector(".hero-title");
    const subtitle = hero.querySelector(".hero-subtitle");
    const desc = hero.querySelector(".hero-desc");

    const splitTag = new SplitType(tag, { types: "words" });
    const splitTitle = new SplitType(title, { types: "chars", charClass: "hero-split-char" });
    const splitSubtitle = new SplitType(subtitle, { types: "lines", lineClass: "hero-split-line-wrap" });
    const splitDesc = new SplitType(desc, { types: "lines", lineClass: "hero-split-line-wrap" });

    // Mascarar linhas com span overflow-hidden
    [splitSubtitle.lines, splitDesc.lines].forEach((lines) => {
      if (lines) {
        lines.forEach((line) => {
          const wrapper = document.createElement("span");
          wrapper.className = "line-wrapper";
          line.parentNode.insertBefore(wrapper, line);
          wrapper.appendChild(line);
        });
      }
    });

    // Animação de digitação/surgimento do Logo na Nav
    const navLogo = document.querySelector("main nav #logo");
    const splitLogo = new SplitType(navLogo, { types: "chars" });

    // Outros elementos a serem revelados
    const navLinks = document.querySelectorAll("main nav #nav-links a");
    const navCta = document.querySelector("main nav #nav-cta button");
    const pills = hero.querySelectorAll(".hero-pill");
    const buttons = hero.querySelectorAll(".hero-buttons button");
    const specs = hero.querySelectorAll(".hero-spec");

    // Definir estados iniciais
    gsap.set(splitLogo.chars, { opacity: 0, y: 10 });
    gsap.set(navLinks, { opacity: 0, y: -15 });
    gsap.set(navCta, { opacity: 0, scale: 0.8 });

    gsap.set(splitTag.words, { yPercent: 115 });
    gsap.set(splitTitle.chars, { yPercent: 115, rotate: 4 });
    gsap.set(splitSubtitle.lines, { yPercent: 115 });
    gsap.set(splitDesc.lines, { yPercent: 115 });

    gsap.set(pills, { opacity: 0, scale: 0.8, y: 15 });
    gsap.set(buttons, { opacity: 0, y: 25 });
    gsap.set(specs, { opacity: 0, x: 40 });

    // Timeline da animação de abertura
    const tl = gsap.timeline({
      onComplete: () => {
        // Liberar scroll
        document.body.style.overflow = "";
        window.lenis?.start();
      }
    });

    // 1. Exposição suave e escala do Background
    tl.fromTo(hero,
      { filter: "brightness(0.2) contrast(1.25)" },
      { filter: "brightness(1) contrast(1)", duration: 2.2, ease: "power3.out" }
    );

    // 2. Revelação da Barra de Navegação (staggered)
    tl.to(splitLogo.chars, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.03,
      ease: "power2.out"
    }, 0.3)
      .to(navLinks, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out"
      }, 0.5)
      .to(navCta, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.5)"
      }, 0.7);

    // 3. Revelação da Tagline & Título Principal com elasticidade
    tl.to(splitTag.words, {
      yPercent: 0,
      duration: 0.8,
      ease: "power3.out"
    }, 0.6)
      .to(splitTitle.chars, {
        yPercent: 0,
        rotate: 0,
        duration: 1.2,
        stagger: 0.03,
        ease: "elastic.out(1, 0.75)"
      }, 0.7);

    // 4. Revelação das linhas de Subtítulo e Descrição
    tl.to(splitSubtitle.lines, {
      yPercent: 0,
      duration: 1.0,
      ease: "power4.out"
    }, 0.9)
      .to(splitDesc.lines, {
        yPercent: 0,
        duration: 1.0,
        stagger: 0.08,
        ease: "power4.out"
      }, 1.1);

    // 5. Revelação dos Pills e Botões de Ação
    tl.to(pills, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: "back.out(1.2)"
    }, 1.3)
      .to(buttons, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      }, 1.4);

    // 6. Revelação das especificações da direita
    tl.to(specs, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out"
    }, 1.2);
  }

  /* Coordinated Left-Side Reveal Timeline for Showroom Section */
  function initShowroomLeftReveal() {
    const section = document.querySelector("#showroom-section");
    if (!section) return;

    const tag = section.querySelector(".showroom-tag");
    const title = section.querySelector(".showroom-title");
    const desc = section.querySelector(".showroom-desc");
    const pills = section.querySelectorAll(".showroom-pill");

    // Split title letters and description lines safely (words,chars prevents character-level wrapping)
    let splitTitle = title ? new SplitType(title, { types: "words,chars" }) : null;
    let splitDesc = desc ? new SplitType(desc, { types: "lines" }) : null;

    // Wrap desc lines in masks for ultra-clean reveal
    if (splitDesc && splitDesc.lines) {
      splitDesc.lines.forEach(line => {
        const wrapper = document.createElement("span");
        wrapper.className = "line-wrapper";
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });
    }

    const titleChars = splitTitle ? splitTitle.chars : [];
    const descLines = splitDesc ? splitDesc.lines : [];

    // Set initial states
    if (tag) gsap.set(tag, { y: 15, opacity: 0 });
    if (titleChars.length) gsap.set(titleChars, { yPercent: 115 });
    if (descLines.length) gsap.set(descLines, { yPercent: 115 });
    if (pills.length) gsap.set(pills, { scale: 0.8, y: 15, opacity: 0 });

    // Coordinated Progressive Timeline (Scrubbed) tied to scrollbar position and speed
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 68%",
        end: "top 18%",
        scrub: 2.0
      }
    });

    if (tag) {
      tl.to(tag, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      });
    }

    if (titleChars.length) {
      tl.to(titleChars, {
        yPercent: 0,
        duration: 0.8,
        stagger: 0.02,
        ease: "power4.out"
      }, tag ? "-=0.4" : "0");
    }

    if (descLines.length) {
      tl.to(descLines, {
        yPercent: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "power3.out"
      }, "-=0.5");
    }

    if (pills.length) {
      tl.to(pills, {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "back.out(1.2)"
      }, "-=0.4");
    }
  }

  /* SVG Vertical Blinds Automatic and Manual Showroom Carousel */
  function initShowroomCarousel() {
    const section = document.querySelector("#showroom-section");
    const layers = document.querySelectorAll("#showroom-section .showroom-layer");
    if (!section || !layers.length) return;

    const blindCount = 12;
    const svgNS = 'http://www.w3.org/2000/svg';
    let showroomBlindsSets = [];
    let currentShowroomIndex = 0;
    let isTransitioning = false;
    let autoplayTimer = null;
    const autoplayInterval = 4500; // 4.5 seconds

    function createShowroomBlinds(groupId, isFirstLayer) {
      const g = document.getElementById(groupId);
      if (!g) return null;
      g.innerHTML = '';

      const w = 100 / blindCount;
      const blinds = [];
      let currentX = 0;

      for (let i = 0; i < blindCount; i++) {
        const centerX = currentX + w / 2;
        const rectLeft = document.createElementNS(svgNS, 'rect');
        const rectRight = document.createElementNS(svgNS, 'rect');

        [rectLeft, rectRight].forEach((r) => {
          r.setAttribute('y', '0');
          r.setAttribute('height', '100');
          r.setAttribute('width', isFirstLayer ? (w / 2 + 0.1).toString() : '0');
          r.setAttribute('fill', 'white');
          r.setAttribute('shape-rendering', 'crispEdges');
        });

        if (isFirstLayer) {
          rectLeft.setAttribute('x', (centerX - w / 2).toString());
          rectRight.setAttribute('x', centerX.toString());
        } else {
          rectLeft.setAttribute('x', centerX.toString());
          rectRight.setAttribute('x', centerX.toString());
        }

        g.appendChild(rectLeft);
        g.appendChild(rectRight);

        blinds.push({ left: rectLeft, right: rectRight, x: centerX, w: w / 2 });
        currentX += w;
      }
      return blinds;
    }

    // Initialize layer elements and masks
    layers.forEach((svg, i) => {
      // Set fixed aspect viewBox coordinate system
      svg.setAttribute('viewBox', '0 0 100 100');

      const maskRect = svg.querySelector('mask rect');
      if (maskRect) {
        maskRect.setAttribute('width', '100');
        maskRect.setAttribute('height', '100');
      }

      const img = svg.querySelector('image');
      if (img) {
        img.setAttribute('width', '100');
        img.setAttribute('height', '100');
        img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      }

      const blindElement = svg.querySelector('g[id^="showroom-blinds"]');
      if (blindElement) {
        const blinds = createShowroomBlinds(blindElement.id, i === 0);
        if (blinds) showroomBlindsSets.push(blinds);
      }

      // Initial Z-Index setup
      svg.style.zIndex = i === 0 ? '2' : '0';
    });

    function changeShowroomSlide(nextIndex) {
      if (isTransitioning || nextIndex === currentShowroomIndex) return;
      isTransitioning = true;

      const currentLayer = layers[currentShowroomIndex];
      const nextLayer = layers[nextIndex];
      const blinds = showroomBlindsSets[nextIndex];

      if (!blinds) {
        isTransitioning = false;
        return;
      }

      // 1. Reset incoming blinds to width 0 (fully closed)
      blinds.forEach(b => {
        b.left.setAttribute('x', b.x.toString());
        b.left.setAttribute('width', '0');
        b.right.setAttribute('x', b.x.toString());
        b.right.setAttribute('width', '0');
      });

      // 2. Adjust zIndexes
      layers.forEach((svg, idx) => {
        if (idx === currentShowroomIndex) {
          svg.style.zIndex = '1';
        } else if (idx === nextIndex) {
          svg.style.zIndex = '2';
        } else {
          svg.style.zIndex = '0';
        }
      });

      // 3. Animate incoming blinds to open (width w)
      gsap.to(
        blinds.flatMap((b) => [b.left, b.right]),
        {
          attr: {
            x: (i) => {
              const b = blinds[Math.floor(i / 2)];
              return i % 2 === 0 ? b.x - b.w : b.x;
            },
            width: (i) => {
              const b = blinds[Math.floor(i / 2)];
              return b.w + 0.05;
            },
          },
          duration: 0.8,
          ease: 'power2.inOut',
          stagger: { each: 0.02, from: 'start' },
          onComplete: () => {
            // 4. Fully close previous slide's blinds to width 0
            const prevBlinds = showroomBlindsSets[currentShowroomIndex];
            if (prevBlinds) {
              prevBlinds.forEach(b => {
                b.left.setAttribute('width', '0');
                b.left.setAttribute('x', b.x.toString());
                b.right.setAttribute('width', '0');
                b.right.setAttribute('x', b.x.toString());
              });
            }

            // 5. Update state
            currentShowroomIndex = nextIndex;
            isTransitioning = false;
          }
        }
      );
    }

    function showNext() {
      const nextIdx = (currentShowroomIndex + 1) % layers.length;
      changeShowroomSlide(nextIdx);
    }

    function showPrev() {
      const prevIdx = (currentShowroomIndex - 1 + layers.length) % layers.length;
      changeShowroomSlide(prevIdx);
    }

    // Set Autoplay Interval
    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(showNext, autoplayInterval);
    }

    // Stop Autoplay Interval
    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    // Manual Event Listeners (Selected by ID as per the updated circular design layout)
    const prevBtn = document.getElementById("showroom-prev");
    const nextBtn = document.getElementById("showroom-next");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        stopAutoplay();
        showPrev();
        startAutoplay(); // Resume autoplay after interaction
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        stopAutoplay();
        showNext();
        startAutoplay(); // Resume autoplay after interaction
      });
    }

    // Start autoplay initially
    startAutoplay();
  }

  /* Premium Internal Parallax Effect for Section 6 CTA */
  function initCtaParallax() {
    const ctaSection = document.querySelector("#cta-parallax-section");
    const ctaBg = document.querySelector(".cta-parallax-bg");
    if (!ctaSection || !ctaBg) return;

    gsap.fromTo(ctaBg,
      { yPercent: -15 },
      {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ctaSection,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  }

  /* Premium Coordinated Reveal Animation for Section 6 CTA */
  function initCtaReveal() {
    const ctaSection = document.querySelector("#cta-parallax-section");
    if (!ctaSection) return;

    const title = ctaSection.querySelector(".cta-massive-title");
    const glowLine = ctaSection.querySelector(".cta-glow-line");
    const leftText = ctaSection.querySelector(".cta-concept-title");
    const button = ctaSection.querySelector(".cta-btn");
    const rightText = ctaSection.querySelector(".cta-concept-desc");

    // Split texts safely using SplitType
    let splitTitle = title ? new SplitType(title, { types: "words,chars" }) : null;
    let splitLeft = leftText ? new SplitType(leftText, { types: "lines" }) : null;
    let splitRight = rightText ? new SplitType(rightText, { types: "lines" }) : null;

    // Wrap lines in overflow hidden spans for clean mask reveals
    [splitLeft, splitRight].forEach(split => {
      if (split && split.lines) {
        split.lines.forEach(line => {
          const wrapper = document.createElement("span");
          wrapper.className = "line-wrapper";
          line.parentNode.insertBefore(wrapper, line);
          wrapper.appendChild(line);
        });
      }
    });

    const titleChars = splitTitle ? splitTitle.chars : [];
    const leftLines = splitLeft ? splitLeft.lines : [];
    const rightLines = splitRight ? splitRight.lines : [];

    console.log("APEX DEBUG: titleChars length:", titleChars.length);
    console.log("APEX DEBUG: leftLines length:", leftLines.length);
    console.log("APEX DEBUG: rightLines length:", rightLines.length);
    console.log("APEX DEBUG: button exists:", !!button);

    // Set initial states
    if (titleChars.length) gsap.set(titleChars, { yPercent: 115 });
    if (glowLine) gsap.set(glowLine, { scaleX: 0, transformOrigin: "left center" });
    if (leftLines.length) gsap.set(leftLines, { yPercent: 115 });
    if (button) gsap.set(button, { yPercent: 115, opacity: 0 });
    if (rightLines.length) gsap.set(rightLines, { yPercent: 115 });

    // Create ScrollTrigger timeline with progressive scrubbing
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ctaSection,
        start: "top 80%",
        end: "bottom 95%",
        scrub: 2.2,
        onToggle: self => console.log("APEX DEBUG: ScrollTrigger toggled, active:", self.isActive)
      }
    });

    // Build flat array of targets to avoid nested array animation ignore bug in GSAP
    const targetsToAnimate = [];
    if (leftLines.length) targetsToAnimate.push(...leftLines);
    if (button) targetsToAnimate.push(button);
    if (rightLines.length) targetsToAnimate.push(...rightLines);

    tl.to(titleChars, {
      yPercent: 0,
      duration: 1.5,
      stagger: 0.04,
      ease: "power4.out"
    })
      .to(glowLine, {
        scaleX: 1,
        duration: 1.0,
        ease: "power2.out"
      }, "-=0.8")
      .to(targetsToAnimate, {
        yPercent: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.12,
        ease: "power3.out"
      }, "-=0.6");
  }

  // Split initialization inside fonts ready / page load wrapper
  const startSplits = () => {
    // 1. Section 1 (Hero) initialized after preloader completes
    try {
      initBrandPreloader(() => {
        initHeroReveal();
      });
    } catch (e) {
      console.error("Error in initBrandPreloader:", e);
      try { initHeroReveal(); } catch (he) { console.error("Error in initHeroReveal:", he); }
    }

    // 2. Section 2 (Stacking Cards with Pinning)
    try { initStackingCards(); } catch (e) { console.error("Error in initStackingCards:", e); }

    // 3. Section 3 (Showcase Cards)
    try { initShowcaseHeaderReveal(); } catch (e) { console.error("Error in initShowcaseHeaderReveal:", e); }
    try { initShowcaseCards(); } catch (e) { console.error("Error in initShowcaseCards:", e); }
    try { initShowcaseParallax(); } catch (e) { console.error("Error in initShowcaseParallax:", e); }

    // 4. Section 4 (Horizontal Gallery with Pinning)
    try { initHorizontalGallery(); } catch (e) { console.error("Error in initHorizontalGallery:", e); }

    // 5. Section 5 (Showroom Atelier)
    try { initShowroomLeftReveal(); } catch (e) { console.error("Error in initShowroomLeftReveal:", e); }
    try { initShowroomCarousel(); } catch (e) { console.error("Error in initShowroomCarousel:", e); }

    // 6. Section 6 (Premium Parallax CTA)
    try { initCtaParallax(); } catch (e) { console.error("Error in initCtaParallax:", e); }
    try { initCtaReveal(); } catch (e) { console.error("Error in initCtaReveal:", e); }

    // 7. General Elements & Helpers
    try { initTextReveals(); } catch (e) { console.error("Error in initTextReveals:", e); }
    try { initScrollRevealText(); } catch (e) { console.error("Error in initScrollRevealText:", e); }
    try { initConceptModal(); } catch (e) { console.error("Error in initConceptModal:", e); }
    try { initShowcaseFilters(); } catch (e) { console.error("Error in initShowcaseFilters:", e); }

    // Refresh ScrollTrigger to sync all positions with pin offset spacers
    try { ScrollTrigger.refresh(); } catch (e) { console.error("Error in ScrollTrigger.refresh:", e); }
  };

  if (document.fonts) {
    document.fonts.ready.then(startSplits);
  } else {
    window.addEventListener("load", startSplits);
  }
});

/* ──────────────────────────────────────────────────────────────
   4. YACHT OVERLAY  (details drawer)
   ────────────────────────────────────────────────────────────── */

/* Yacht database with wide premium images from download folder */
const YACHT_DATA = {
  mansa60: {
    tag: "SÉRIE LIMITADA",
    name: "Apex 60",
    type: "Sport Cruiser",
    desc: "Sua fusão ideal de velocidade esportiva e acomodações requintadas. Projetada para viagens ágeis de final de semana sem abrir mão do conforto de uma suíte master de luxo.",
    length: "18.3 metros",
    speed: "38 nós",
    cabins: "6 convidados / 3 suítes",
    engine: "Volvo Penta IPS 1350",
    imgs: [
      "./img/barcos/iate_esportivo/wide/White_sport_yacht_on_water_202605281621.jpeg",
      "./img/barcos/iate_cruiser/wide/Iate_Interior_Sala_Estar_Luxo_BR_202605281621.jpeg",
      "./img/barcos/iate_cruiser/wide/Iate_Interior_Cabine_Comando_BR_202605281621.jpeg",
      "./img/barcos/iate_branco_costa/wide/Iate_Branco_Costa_Exterior_Rastro_Wide_16x9_202605281621.jpeg"
    ],
  },
  mansa72: {
    tag: "BESTSELLER",
    name: "Apex 72",
    type: "Flybridge Luxury",
    desc: "O flybridge mais aguardado da nossa frota. Terraços panorâmicos sobre o oceano com acabamentos em mármore e madeira de lei selecionada a mão.",
    length: "21.9 metros",
    speed: "32 nós",
    cabins: "8 convidados / 4 suítes",
    engine: "MAN V8-1200",
    imgs: [
      "./img/barcos/iate_multideck/wide/Iate_MultiDeck_Exterior_Destaque_Wide_16x9_202605281621.jpeg",
      "./img/barcos/iate_cruiser/wide/Iate_Interior_Lounge_Multinivel_BR_202605281621.jpeg",
      "./img/barcos/iate_cruiser/wide/Iate_Interior_Sala_Jantar_Moderna_BR_202605281621.jpeg",
      "./img/barcos/iate_esportivo/wide/Cockpit_and_helm_sport_yacht_202605281621.jpeg"
    ],
  },
  mansa90: {
    tag: "MEGA YACHT",
    name: "Apex 90",
    type: "Mega Yacht",
    desc: "Nossa joia de coroa. Uma embarcação de 90 pés com piscina de vidro, heliponto e sistemas de estabilização ativa para a travessia oceânica mais suave do mundo.",
    length: "27.4 metros",
    speed: "26 nós",
    cabins: "12 convidados / 6 suítes",
    engine: "MTU 16V 2000 M96L (Twin)",
    imgs: [
      "./img/barcos/iate_multideck/wide/Iate_MultiDeck_Exterior_Cruzeiro_Wide_16x9_202605281621.jpeg",
      "./img/barcos/iate_cruiser/wide/Iate_Interior_Cinema_Privativo_BR_202605281621.jpeg",
      "./img/barcos/iate_cruiser/wide/Iate_Interior_Banheiro_Spa_BR_202605281621.jpeg",
      "./img/barcos/iate_cruiser/story/Vertical_view_modern_lounge_yacht_202605281621.jpeg"
    ],
  },
  explorer: {
    tag: "EXPEDITION",
    name: "Apex Explorer",
    type: "Expedition Vessel",
    desc: "Construída para ir onde outros não chegam. Autonomia oceânica de 4.000 milhas náuticas com casco de aço reforçado e laboratório de mergulho integrado.",
    length: "25.9 metros",
    speed: "22 nós",
    cabins: "10 convidados / 5 suítes",
    engine: "Caterpillar C32 (Twin)",
    imgs: [
      "./img/barcos/iate_cruiser/story/Yacht_cruising_over_reef_202605281621.jpeg",
      "./img/barcos/iate_cruiser/wide/Iate_Interior_Cabine_Esportiva_BR_202605281621.jpeg",
      "./img/barcos/iate_cruiser/story/Drone_shot_yacht_anchored_bay_202605281621.jpeg",
      "./img/barcos/iate_cruiser/wide/Yacht_surrounded_by_coral_reefs_202605281621.jpeg"
    ],
  },
  gp1800r: {
    tag: "HIGH PERFORMANCE",
    name: "Apex GP1800R",
    type: "Yamaha Performance",
    desc: "Projetado para pilotos exigentes que buscam aceleração instantânea, agilidade cirúrgica nas curvas e velocidade máxima inigualável nos oceanos. Equipado com casco ultra leve NanoXcel2®.",
    length: "1.812 cc (SVHO)",
    speed: "68 nós",
    cabins: "3 pessoas",
    engine: "Yamaha Marine SVHO®",
    imgs: [
      "./img/jetski/jetski_yamaha_preto/wide/Black_Yamaha_jet_ski_choppy_202605281621.jpeg",
      "./img/jetski/jetski_yamaha_preto/story/Black_jet_ski_high-speed_motion_202605281621.jpeg",
      "./img/jetski/jetski_esportivo/wide/Jet_ski_controls_and_seat_202605281621.jpeg",
      "./img/jetski/jetski_esportivo/wide/Jet_ski_dashboard_and_handlebars_202605281621.jpeg"
    ],
  },
  rxpx325: {
    tag: "SUPERCHARGED",
    name: "Apex RXP-X 325",
    type: "Sea-Doo Sports",
    desc: "A definição extrema de potência sobre as águas. Motor supercharged de 325 cavalos com sistema de assento ergonômico ajustável Ergolock R™ e estabilização T3-R.",
    length: "1.630 cc (Rotax)",
    speed: "72 nós",
    cabins: "2 pessoas",
    engine: "Rotax® 1630 ACE™",
    imgs: [
      "./img/jetski/jetski_verde/wide/Green_jet_ski_making_sharp_202605281621.jpeg",
      "./img/jetski/jetski_esportivo/story/Jet_ski_carving_blue_water_202605281621.jpeg",
      "./img/jetski/jetski_esportivo/wide/Jet_ski_seat_and_handlebars_202605281621.jpeg",
      "./img/jetski/jetski_esportivo/wide/Jet_ski_jumping_over_wave_202605281621.jpeg"
    ],
  },
  minimalist: {
    tag: "MINIMALIST LUXURY",
    name: "Apex Minimalist",
    type: "Bespoke Minimalist",
    desc: "Uma expressão definitiva do minimalismo moderno flutuante. Tetos altos, vidros do teto ao chão e estabilizadores ativos criam um oásis de tranquilidade absoluta nos mares.",
    length: "24.3 metros",
    speed: "30 nós",
    cabins: "8 convidados / 4 suítes",
    engine: "Twin Volvo Penta D13",
    imgs: [
      "./img/barcos/iate_luxo_minimalista/wide/Iate_Luxo_Minimalista_Exterior_Wide_16x9_202605281621.jpeg",
      "./img/barcos/iate_luxo_minimalista/wide/Iate_Luxo_Minimalista_Exterior_Ondas_Wide_16x9_202605281621.jpeg",
      "./img/barcos/iate_luxo_minimalista/wide/Iate_Luxo_Minimalista_Interior_Cabine_Wide_16x9_202605281621.jpeg",
      "./img/barcos/iate_branco_costa/wide/Iate_Branco_Costa_Interior_Moderno_Wide_16x9_202605281621.jpeg"
    ],
  },
  costa: {
    tag: "BESPOKE CRUISER",
    name: "Apex Costa",
    type: "Bespoke Cruiser",
    desc: "Desenhada para cruzar costas escarpadas e águas rasas com o máximo de requinte. Possui deck traseiro expansível e acabamentos artesanais italianos premium.",
    length: "20.7 metros",
    speed: "34 nós",
    cabins: "6 convidados / 3 suítes",
    engine: "Volvo Penta IPS 1200",
    imgs: [
      "./img/barcos/iate_branco_costa/wide/Iate_Branco_Costa_Exterior_Falésias_Wide_16x9_202605281621.jpeg",
      "./img/barcos/iate_branco_costa/wide/Iate_Branco_Costa_Exterior_Rastro_Wide_16x9_202605281621.jpeg",
      "./img/barcos/iate_branco_costa/wide/Iate_Branco_Costa_Interior_Moderno_Wide_16x9_202605281621.jpeg",
      "./img/barcos/iate_esportivo/wide/Cockpit_and_helm_sport_yacht_202605281621.jpeg"
    ],
  },
  cruisespark: {
    tag: "SEA-DOO FUN",
    name: "Apex Cruise Spark",
    type: "Sea-Doo Fun",
    desc: "O companheiro perfeito para diversão em águas calmas e exploração de enseadas. Leve, ágil e equipado com sistema de som portátil integrado.",
    length: "899 cc",
    speed: "48 nós",
    cabins: "3 pessoas",
    engine: "Rotax 900 ACE",
    imgs: [
      "./img/jetski/jetski_esportivo/wide/Jet_ski_cruising_at_sunset_202605281621.jpeg",
      "./img/jetski/jetski_esportivo/wide/Jet_ski_speeding_across_ocean_202605281621.jpeg",
      "./img/jetski/jetski_esportivo/wide/Jet_ski_dashboard_and_handlebars_202605281621.jpeg",
      "./img/jetski/jetski_esportivo/wide/Jet_ski_seat_and_handlebars_202605281621.jpeg"
    ],
  },
};

function initYachtOverlay() {
  const overlay = document.getElementById("yacht-details-overlay");
  const closeBtn = overlay ? overlay.querySelector(".close-overlay-btn") : null;
  const openBtns = document.querySelectorAll(".open-details-btn");

  if (!overlay) return;

  const wrapper = overlay.querySelector(".overlay-content-wrapper");
  if (wrapper) {
    gsap.set(wrapper, { xPercent: 100 });
  }

  /* ── Populate and open ── */
  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const yachtId = btn.getAttribute("data-yacht");
      const data = YACHT_DATA[yachtId];
      if (!data) return;

      // Update Spec Labels dynamically based on type (Yacht vs Jet Ski)
      const lengthLabel = overlay.querySelector(".spec-item:nth-child(1) .spec-label");
      const speedLabel = overlay.querySelector(".spec-item:nth-child(2) .spec-label");
      const cabinsLabel = overlay.querySelector(".spec-item:nth-child(3) .spec-label");
      const engineLabel = overlay.querySelector(".spec-item:nth-child(4) .spec-label");

      if (yachtId === "gp1800r" || yachtId === "rxpx325" || yachtId === "cruisespark") {
        if (lengthLabel) lengthLabel.textContent = "Cilindradas";
        if (speedLabel) speedLabel.textContent = "Velocidade";
        if (cabinsLabel) cabinsLabel.textContent = "Capacidade";
        if (engineLabel) engineLabel.textContent = "Motorização";
      } else {
        if (lengthLabel) lengthLabel.textContent = "Comprimento";
        if (speedLabel) speedLabel.textContent = "Velocidade Máxima";
        if (cabinsLabel) cabinsLabel.textContent = "Acomodação";
        if (engineLabel) engineLabel.textContent = "Motorização";
      }

      /* Fill text */
      document.getElementById("overlay-yacht-tag").textContent = data.tag;
      document.getElementById("overlay-yacht-name").textContent = data.name;
      document.getElementById("overlay-yacht-type").textContent = data.type;
      document.getElementById("overlay-yacht-desc").textContent = data.desc;
      document.getElementById("spec-length").textContent = data.length;
      document.getElementById("spec-speed").textContent = data.speed;
      document.getElementById("spec-cabins").textContent = data.cabins;
      document.getElementById("spec-engine").textContent = data.engine;

      /* Fill images */
      for (let i = 1; i <= 4; i++) {
        const img = document.getElementById(`overlay-img-${i}`);
        if (img && data.imgs[i - 1]) img.src = data.imgs[i - 1];
      }

      /* Reset scroll */
      const left = overlay.querySelector(".overlay-left");
      const right = overlay.querySelector(".overlay-right");
      if (left) left.scrollTop = 0;
      if (right) right.scrollTop = 0;

      /* Open overlay with premium GSAP reveal */
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      window.lenis?.stop();

      const wrapper = overlay.querySelector(".overlay-content-wrapper");

      // Selecionar elementos para o stagger
      const titleName = document.getElementById("overlay-yacht-name");
      const type = document.getElementById("overlay-yacht-type");
      const desc = document.getElementById("overlay-yacht-desc");
      const specsItems = left.querySelectorAll(".spec-item");
      const galleryImgs = right.querySelectorAll("img");
      const galleryTitle = right.querySelector(".gallery-scroll-title");

      // Reverter SplitType anterior se houver ou dividir título de forma segura
      let splitChars = [];
      if (typeof SplitType !== "undefined") {
        try {
          if (titleName.splitInstance) {
            titleName.splitInstance.revert();
          }
          const splitName = new SplitType(titleName, { types: "chars" });
          titleName.splitInstance = splitName;
          splitChars = splitName.chars || [];
        } catch (err) {
          console.warn("SplitType failed on details title:", err);
          splitChars = [titleName];
        }
      } else {
        splitChars = [titleName];
      }

      // Definir estados iniciais das animações do reveal de forma 100% segura contra nulos
      const safeSplitChars = [...splitChars].filter(Boolean);
      const safeTexts = [type, desc].filter(Boolean);
      const safeSpecs = [...specsItems].filter(Boolean);
      const safeGallery = [galleryTitle, ...galleryImgs].filter(Boolean);

      gsap.set(wrapper, { xPercent: 100 });
      gsap.set(safeSplitChars, { opacity: 0, x: -15 });
      gsap.set(safeTexts, { opacity: 0, x: -30 });
      gsap.set(safeSpecs, { opacity: 0, x: -30 });
      gsap.set(safeGallery, { opacity: 0, y: -40 });

      // Timeline de abertura lenta e amanteigada
      const tl = gsap.timeline();

      // 1. Painel azul da direita para a esquerda (xPercent: 100 -> 0)
      tl.to(wrapper, {
        xPercent: 0,
        duration: 1.1,
        ease: "power4.out"
      });

      // 2. Título letra por letra da esquerda para a direita
      tl.to(safeSplitChars, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.03,
        ease: "power2.out"
      }, "-=0.6");

      // 3. Textos da esquerda (da esquerda para a direita)
      tl.to(safeTexts, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      }, "-=0.5")
        .to(safeSpecs, {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.05,
          ease: "power3.out"
        }, "-=0.6");

      // 4. Imagens da direita (de cima para baixo em cascata)
      tl.to(safeGallery, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out"
      }, "-=0.7");
    });
  });

  /* ── Close by button ── */
  if (closeBtn) {
    closeBtn.addEventListener("click", closeOverlay);
  }

  /* ── Close by clicking outside the panel ── */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  /* ── Close by Escape key ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      closeOverlay();
    }
  });

  function closeOverlay() {
    const wrapper = overlay.querySelector(".overlay-content-wrapper");
    gsap.to(wrapper, {
      xPercent: 100,
      duration: 0.7,
      ease: "power3.in",
      onComplete: () => {
        overlay.classList.remove("is-open");
        document.body.style.overflow = "";
        window.lenis?.start();
      }
    });
  }
}

/* ──────────────────────────────────────────────────────────────
   Technical FAQ Accordion
   ────────────────────────────────────────────────────────────── */
function initTechnicalFAQ() {
  const triggers = document.querySelectorAll(".faq-trigger");
  triggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      const panel = trigger.nextElementSibling;
      const verticalBar = trigger.querySelector(".vertical-bar");

      // Close other panels (single expand accordion style)
      triggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute("aria-expanded", "false");
          otherTrigger.nextElementSibling.style.maxHeight = null;
          const otherBar = otherTrigger.querySelector(".vertical-bar");
          if (otherBar) otherBar.style.transform = "scaleY(1)";
        }
      });

      if (isExpanded) {
        trigger.setAttribute("aria-expanded", "false");
        panel.style.maxHeight = null;
        if (verticalBar) verticalBar.style.transform = "scaleY(1)";
      } else {
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
        if (verticalBar) verticalBar.style.transform = "scaleY(0)";
      }
    });
  });
}

/* Fullscreen Mobile Hamburger Menu Interactivity */
function initMobileMenu() {
  const burgerBtn = document.getElementById("burger-menu-btn");
  const closeBtn = document.getElementById("close-mobile-menu-btn");
  const overlay = document.getElementById("mobile-menu-overlay");
  const menuLinks = document.querySelectorAll(".mobile-nav-links a");
  const ctaBtn = document.querySelector(".mobile-menu-cta");

  if (!burgerBtn || !overlay) return;

  function openMenu() {
    burgerBtn.classList.add("is-active");
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    window.lenis?.stop();
  }

  // Bind keydown close menu on escape key
  function onMenuKeyDown(e) {
    if (e.key === "Escape") {
      closeMenu();
    }
  }

  function closeMenu() {
    burgerBtn.classList.remove("is-active");
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    window.lenis?.start();
    document.removeEventListener("keydown", onMenuKeyDown);
  }

  burgerBtn.addEventListener("click", () => {
    if (overlay.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
      document.addEventListener("keydown", onMenuKeyDown);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  // Auto-close menu when a link is clicked for anchor smooth scrolling
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  if (ctaBtn) {
    ctaBtn.addEventListener("click", () => {
      closeMenu();
    });
  }
}

/* ──────────────────────────────────────────────────────────────
   PHASE III — PREMIUM MOTION & FUNNEL IMPLEMENTATIONS
   ────────────────────────────────────────────────────────────── */

/* ── 1. Brand Preloader Overlay (Option 3) ── */
function initBrandPreloader(onCompleteCallback) {
  const preloader = document.getElementById("brand-preloader");
  if (!preloader) {
    if (onCompleteCallback) onCompleteCallback();
    return;
  }

  // Freeze scroll
  document.body.style.overflow = "hidden";
  window.lenis?.stop();

  const logo = preloader.querySelector(".preloader-logo");
  const sub = preloader.querySelector(".preloader-sub");

  let splitLogo = null;
  let splitSub = null;

  if (typeof SplitType !== "undefined" && logo) {
    splitLogo = new SplitType(logo, { types: "chars" });
    if (sub) {
      splitSub = new SplitType(sub, { types: "words" });
    }
  }

  const logoChars = splitLogo ? splitLogo.chars : [logo];
  const subWords = splitSub ? splitSub.words : [sub];

  // Set initial states
  gsap.set(logoChars, { opacity: 0, y: 30, rotate: 2 });
  if (subWords && subWords[0]) gsap.set(subWords, { opacity: 0, y: 15 });

  const tl = gsap.timeline();

  // Stagger letters
  tl.to(logoChars, {
    opacity: 1,
    y: 0,
    rotate: 0,
    duration: 0.9,
    stagger: 0.04,
    ease: "back.out(1.7)"
  });

  // Reveal subtext
  if (subWords && subWords[0]) {
    tl.to(subWords, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.05,
      ease: "power2.out"
    }, "-=0.4");
  }

  // Slide up overlay and start hero reveal
  tl.to(preloader, {
    yPercent: -100,
    duration: 1.1,
    ease: "power4.inOut",
    delay: 1.4, // Keep it visible for around 1.8s
    onComplete: () => {
      preloader.style.display = "none";
      if (onCompleteCallback) onCompleteCallback();
    }
  });
}

/* ── 2. Ambient Soundtrack Player (Option 4) ── */
function initAmbientSound() {
  const audio = document.getElementById("ambient-ocean-audio");
  const btn = document.getElementById("sound-toggle-btn");
  if (!audio || !btn) return;

  audio.volume = 0;

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        btn.classList.add("playing");
        
        // Bulletproof GSAP volume fade-in
        const vol = { val: audio.volume };
        gsap.to(vol, {
          val: 0.60,
          duration: 2.0,
          ease: "power1.inOut",
          onUpdate: () => {
            audio.volume = vol.val;
          }
        });
      }).catch(err => {
        console.warn("Audio autoplay blocked:", err);
      });
    } else {
      // Bulletproof GSAP volume fade-out
      const vol = { val: audio.volume };
      gsap.to(vol, {
        val: 0,
        duration: 1.5,
        ease: "power1.inOut",
        onUpdate: () => {
          audio.volume = vol.val;
        },
        onComplete: () => {
          audio.pause();
          btn.classList.remove("playing");
        }
      });
    }
  });
}



/* ── 4. Multistep Luxury Lead Modal (Option 2) ── */
function initLeadModal() {
  const modal = document.getElementById("lead-modal");
  const card = modal ? modal.querySelector(".modal-card") : null;
  const form = document.getElementById("lead-multistep-form");
  const progressBar = document.getElementById("lead-progress-bar");
  const successScreen = document.getElementById("lead-success-screen");
  const closeBtn = modal ? modal.querySelector(".modal-close-btn") : null;
  const closeSuccessBtn = successScreen ? successScreen.querySelector(".close-success-btn") : null;

  if (!modal || !form || !progressBar || !successScreen) return;

  let currentStep = 1;

  function openModal() {
    currentStep = 1;
    progressBar.style.width = "33.33%";

    const steps = form.querySelectorAll(".form-step");
    steps.forEach((step, idx) => {
      if (idx === 0) {
        step.style.display = "block";
        step.classList.add("active");
        gsap.set(step, { opacity: 1, x: 0 });
      } else {
        step.style.display = "none";
        step.classList.remove("active");
        gsap.set(step, { opacity: 0, x: 0 });
      }
    });

    form.style.display = "block";
    gsap.set(form, { opacity: 1, y: 0 });
    successScreen.style.display = "none";

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    window.lenis?.stop();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    window.lenis?.start();
  }

  const triggerElements = [];

  const navBtn = document.querySelector("#nav-cta button");
  if (navBtn) {
    navBtn.removeAttribute("onclick");
    triggerElements.push(navBtn);
  }

  const mobileCta = document.querySelector(".mobile-menu-cta");
  if (mobileCta) {
    mobileCta.removeAttribute("onclick");
    triggerElements.push(mobileCta);
  }

  const heroSecBtn = document.querySelector(".hero-buttons .btn-secondary");
  if (heroSecBtn) {
    heroSecBtn.removeAttribute("onclick");
    triggerElements.push(heroSecBtn);
  }

  const ctaBtn = document.querySelector(".cta-btn");
  if (ctaBtn) {
    triggerElements.push(ctaBtn);
  }

  const footerLinks = document.querySelectorAll("footer a");
  footerLinks.forEach(link => {
    if (link.textContent.includes("Consultor")) {
      link.removeAttribute("onclick");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
      });
    }
  });

  triggerElements.forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (closeSuccessBtn) closeSuccessBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  form.querySelectorAll(".next-step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const currentStepEl = form.querySelector(`.form-step[data-step="${currentStep}"]`);
      const inputs = currentStepEl.querySelectorAll("input, select, textarea");
      let isValid = true;
      inputs.forEach(input => {
        if (!input.checkValidity()) {
          input.reportValidity();
          isValid = false;
        }
      });

      if (isValid && currentStep < 3) {
        goToStep(currentStep, currentStep + 1);
      }
    });
  });

  form.querySelectorAll(".prev-step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentStep > 1) {
        goToStep(currentStep, currentStep - 1);
      }
    });
  });

  function goToStep(fromStep, toStep) {
    const currentStepEl = form.querySelector(`.form-step[data-step="${fromStep}"]`);
    const nextStepEl = form.querySelector(`.form-step[data-step="${toStep}"]`);
    if (!currentStepEl || !nextStepEl) return;

    const progressPercent = ((toStep - 1) / 2) * 66.66 + 33.33;
    gsap.to(progressBar, { width: `${progressPercent}%`, duration: 0.6, ease: "power3.out" });

    const isNext = toStep > fromStep;
    const exitX = isNext ? -40 : 40;
    const entryX = isNext ? 40 : -40;

    gsap.timeline()
      .to(currentStepEl, {
        opacity: 0,
        x: exitX,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          currentStepEl.classList.remove("active");
          currentStepEl.style.display = "none";

          nextStepEl.style.display = "block";
          nextStepEl.classList.add("active");
        }
      })
      .fromTo(nextStepEl,
        { opacity: 0, x: entryX },
        { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" }
      );

    currentStep = toStep;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    gsap.to(form, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        form.style.display = "none";
        successScreen.style.display = "flex";

        const iconBox = successScreen.querySelector(".success-icon-box");
        const title = successScreen.querySelector(".success-title");
        const desc = successScreen.querySelector(".success-desc");
        const closeBtn = successScreen.querySelector(".close-success-btn");

        gsap.fromTo([iconBox, title, desc, closeBtn],
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.1 }
        );
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initYachtOverlay);
document.addEventListener("DOMContentLoaded", initTechnicalFAQ);
document.addEventListener("DOMContentLoaded", initMobileMenu);
document.addEventListener("DOMContentLoaded", initAmbientSound);
document.addEventListener("DOMContentLoaded", initLeadModal);

/* ──────────────────────────────────────────────────────────────
   5. LENIS SMOOTH SCROLL
   Initialized inside DOMContentLoaded to avoid race condition
   with gsap.registerPlugin(ScrollTrigger).
   ────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Ultra-smooth, Cushioned Lenis initialization
  const lenis = new Lenis({
    duration: 1.8, // Slower, luxurious smooth scroll duration
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponetial easeOut easing
    direction: "vertical",
    gestureDirection: "vertical",
    smoothWheel: true,
    wheelMultiplier: 0.85, // Balanced slower speed for high tactile feedback
    touchMultiplier: 1.5,
    infinite: false
  });
  window.lenis = lenis; // Expose globally for overlay pauses

  // Sync Lenis scroll events with GSAP ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  // Pipe Lenis raf into GSAP ticker for perfectly synced animations
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
});
