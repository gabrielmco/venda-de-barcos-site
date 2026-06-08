# Apex Yachts — The World's Absolute Peak in Bespoke Yacht Brokerage

[![Aesthetic: Awwwards Elite](https://img.shields.io/badge/Aesthetics-Awwwards%20Elite-c9a84c?style=flat-square)](https://www.awwwards.com/)
[![Stack: Vanilla HTML5 / CSS3 / ES6](https://img.shields.io/badge/Stack-Vanilla%20Web-0fa3b1?style=flat-square)](#tech-stack)
[![Animations: GSAP + ScrollTrigger](https://img.shields.io/badge/Animations-GSAP%20%7C%20ScrollTrigger-ff6e14?style=flat-square)](#motion-architecture)
[![Scroll: Lenis Cushioned](https://img.shields.io/badge/Scroll-Lenis%20Smooth-0d3460?style=flat-square)](#smooth-scrolling)

A custom, ultra-premium front-end interface built to showcase **Apex Yachts**, the global peak authority in mega yacht acquisitions, bespoke marine engineering, and transaction advisory under absolute commercial NDAs. 

This platform leverages state-of-the-art web-animation technologies, luxurious Host Grotesk typography, and bespoke layouts designed to captivate ultra-high-net-worth clients at first glance.

---

## 💎 Motion Architecture & Core Features

### 1. Stacking Panels via SVG Mask Blinds (Section 2)
An immersive, scroll-driven vertical blinds transition using a fullscreen SVG mask system controlled by GSAP `ScrollTrigger`.
- **Intelligent SVG Masking**: Splitting slides into twelve crisp vector blinds that expand/contract symmetrically from the center.
- **Deep Contrast Shadows**: Layered linear gradients under text containers to ensure 100% typography legibility without dimming dawn highlights.
- **Tactile Micro-Modals**: Expanding detailed bespoke specs card directly centered on the "+" button, accompanied by a scale-up morph of the button into an active spinning "X" close trigger.

### 2. High-Performance Text Reveal (Concept Section)
An elegant, progressive text-fill reveal mechanism:
- Utilizes `SplitType` to divide characters dynamically.
- Colors fill progressively from a faded `rgba(244, 239, 231, 0.18)` baseline into a solid white as the page viewport advances.

### 3. Accelerated Parallax Lookbook Gallery (Section 4)
A high-impact desktop horizontal parallax photo collection inspired by Codrops.
- **Synchronized Parallax Shift**: 2D vector translation calculated on the coordinate center of each image, creating deep spatial depth.
- **Speed Optimized Scroll**: Doubled scrolling transitions (`getTotal() * 0.5`) to allow users to navigate through the entire layout with minimum vertical effort.

### 4. Interactive Showroom Carousel (Section 5)
A beautiful multi-layer preview of elite bespoke aesthetics:
- **Autoplay & Manual Controls**: Elegant circular arrows inside the image viewport, featuring an expanding gold border fill hover transition.
- **Custom Categorization Grid**: Smooth category tabs filter that dynamically cascades cards, complete with a clean translateY stagger.

### 5. Luxurious Technical FAQ (Accordion System)
Structured answers regarding ship classification, stabilization, and NDA logistics:
- Clean animated vertical-to-horizontal icon morph.
- Single-expand focus structure that closes other open items automatically.

### 6. Cushioned Lenis Scroll System
A custom implementation of Lenis smooth scroll configured for maximum kinetic cushion:
- Slower, elegant wheel multiplier (`0.85`) and duration (`1.8s`) for supreme tactile control.
- Synchronized `requestAnimationFrame` pipelining directly into the GSAP global ticker.

---

## 📱 Haute Couture Mobile Experience

The interface features an Awwwards-grade responsive mobile overhaul tailored to devices under `768px`:
- **Clean Hero Typography**: Hiding dense descriptive paragraphs (`.hero-desc`) to highlight the calm dawn colors and grand yacht backdrop without visual noise.
- **Full-Screen Navy-Mid Overlay Overlay**: Seamless hamburger menu trigger animating 3 thin white bars into a perfectly balanced "X".
- **Gesture Protection**: Body-scroll freeze (`overflow: hidden`) and Lenis temporary pauses when overlays are open to prevent double scrollbars or structural displacement.

---

## 🛠️ Tech Stack & Libraries

- **Markup & Structure**: Semantic HTML5 (incorporating unique testing IDs, single primary headers, and schema-ready metadata tags).
- **Styling & System**: Vanilla CSS3 (highly structured custom HSL/RGB variables, Host Grotesk modern font system, and strict performance bounds).
- **Motion & Control**: [GSAP 3.12](https://greensock.com/gsap/) with [ScrollTrigger](https://greensock.com/scrolltrigger/) & [SplitType](https://github.com/lucasconstantinou/split-type).
- **Smooth Scrolling**: [Lenis 1.3.10](https://github.com/darkroomengineering/lenis).

---

## 📂 Project Structure

```
├── Fonts/                  # Premium typography sets
├── img/                    # High-definition yacht assets
│   ├── barcos/             # Luxury yacht images (Vertical and Wide format)
│   ├── jetski/             # Premium watercraft images
│   └── download/           # Main Dawn background & cover photography
├── index.html              # Main landing layout and DOM structure
├── style.css               # Bespoke design system and mobile media queries
├── script.js               # Performance-cached GSAP and interactive controllers
└── README.md               # Architecture documentation
```

---

## 🔑 Operational Notes

- **Aesthetic First**: Built under the "no-placeholders" luxury mandate. All assets are loaded from local folders.
- **Clean Workspace**: Deactivated and deleted 62 unused draft images permanently to preserve storage bounds and project neatness.
- **Strict Accessibility**: Comprehensive `aria-label` tags on hamburger controls, accordion panels, and image carousels to fulfill SEO and performance guidelines.
