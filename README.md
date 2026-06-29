# Magnate

> Smart finance management in the browser — budget, track, and grow your money with no sign-up, no server, and no fuss.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-brightgreen)](#progressive-web-app-pwa-support)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://rhythmd22.github.io/Magnate/)

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Install](#install)
- [Architecture](#architecture)
- [Design System](#design-system)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [PWA Support](#progressive-web-app-pwa-support)
- [License](#license)

---

## Features

| Feature | Description |
|---------|------------|
| Goal Setting | Define financial goals with customizable categories and budgets |
| Expense & Income Tracking | Add, edit, delete, and search transactions with title, amount, category, and date |
| Visual Summaries | Interactive charts (Chart.js) for weekly and monthly spending/income, net summary, and budget progress |
| Built-in Calculator | Financial calculator with keyboard input, persistent history, and CSV export |
| Transaction Groups | Group related transactions side-by-side for faster scanning |
| Notes with Markdown | Rich-text notes section powered by EasyMDE with debounced autosave |
| Budgeting Tips | Auto-scrolling financial advice with pause-on-hover, 8 categories, and per-row shuffling |
| CSV Import/Export | Backup or migrate your data with proper date escaping and blob cleanup |
| Local Data Storage | All data persisted in `localStorage` — no account, no server |
| Dark-Themed Dialogs | Custom accessible dialogs (`role="dialog"`, `aria-modal`, `aria-labelledby`) with keyboard support |
| Responsive Design | Mobile-first layout with swipe-to-open sidebar, touch-friendly targets, and adaptive charts |
| Keyboard & Screen Reader | Focus-visible outlines, `aria-hidden` on decorative SVGs, labelled inputs, reduced-motion support |
| PWA Support | Install on mobile for a native app-like experience with offline access |

---

## Demo

Live GitHub Pages deployment:  
[https://rhythmd22.github.io/Magnate/](https://rhythmd22.github.io/Magnate/)

---

## Install

```bash
git clone https://github.com/rhythmd22/Magnate.git
cd Magnate
```

Then serve the directory with any static web server:

```bash
python3 -m http.server
```

Open `http://localhost:8000` in your browser. You can also open `index.html` directly.

---

## Architecture

```
Magnate/
├── .gitignore                  # Git ignore rules
├── index.html                  # Dashboard / home page
├── Goals & Categories.html     # Goal and category management
├── Track Transactions.html     # Transaction entries with notes
├── Analytics.html              # Charts and data visualization
├── Calculator.html             # Financial calculator
├── Money Tips.html             # Budgeting advice
├── css/
│   ├── styles.css              # Global variables, reset, and layout
│   ├── index.css               # Dashboard styles
│   ├── goals-categories.css    # Goal and category page styles
│   ├── track-transactions.css  # Transaction tracking page styles
│   ├── analytics.css           # Charts and analytics page styles
│   ├── calculator.css          # Financial calculator styles
│   └── money-tips.css          # Budgeting tips page styles
├── js/
│   ├── data-manager.js         # localStorage CRUD operations
│   ├── dialogs.js              # Custom dark-themed dialog system
│   ├── navigation.js           # Sidebar, routing, and mobile swipe
│   ├── csv-handler.js          # CSV import/export with data integrity fixes
│   ├── utils.js                # Shared helpers (formatting, dates, DOM)
│   ├── index.js                # Dashboard logic
│   ├── goals-categories.js     # Goal and category management
│   ├── track-transactions.js   # Transaction editing and notes
│   ├── analytics.js            # Chart.js visualizations
│   ├── calculator.js           # Sequential calculator with history
│   ├── money-tips.js           # Tips page interactivity
│   └── tips-data.js            # Static financial tip content
├── images/                     # Static illustrations (calculator, calendar)
├── SVGs/                       # SVG icons for categories and UI elements
├── icon.svg                    # Vector PWA icon (source)
├── icon-maskable.svg           # Maskable icon variant (source)
├── android-chrome-192x192.png  # PWA icon 192x192
├── android-chrome-512x512.png  # PWA icon 512x512
├── android-chrome-maskable-192x192.png  # Android adaptive icon 192x192
├── android-chrome-maskable-512x512.png  # Android adaptive icon 512x512
├── apple-touch-icon.png          # iOS home screen 180x180 (light)
├── apple-touch-icon-dark.png     # iOS home screen 180x180 (dark)
├── apple-touch-icon-120x120.png  # iOS home screen 120x120 (light)
├── apple-touch-icon-120x120-dark.png  # iOS home screen 120x120 (dark)
├── apple-touch-icon-152x152.png  # iOS home screen 152x152 (light)
├── apple-touch-icon-152x152-dark.png  # iOS home screen 152x152 (dark)
├── apple-touch-icon-167x167.png  # iOS home screen 167x167 (light)
├── apple-touch-icon-167x167-dark.png  # iOS home screen 167x167 (dark)
├── favicon.ico                 # Multi-resolution favicon (16+32+48)
├── manifest.json               # PWA manifest
└── service-worker.js           # Offline caching and install flow
```

The app is a single-page-style multi-document application. Each HTML page represents a distinct view, with shared JavaScript modules (`data-manager.js`, `dialogs.js`, `navigation.js`, `utils.js`, `csv-handler.js`) loaded across pages. Data flows through `localStorage`, dispatched by `data-manager.js`, and consumed by page-specific scripts. There is no build step or bundler.

---

## Design System

Magnate uses a CSS custom properties system consolidated into a cohesive dark theme:

### Backgrounds

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0F1114` | Page background |
| `--color-surface` | `#181A1E` | Cards, sidebar, dialogs |
| `--color-surface-hover` | `#24272B` | Hover states |
| `--color-border` | `#2D2F34` | Card borders, button backgrounds |
| `--color-border-hover` | `#3A3D42` | Border hover |
| `--color-progress-track` | `#40454A` | Progress bar backgrounds |

### Text

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#FFFFFF` | Headings, body text |
| `--color-text-muted` | `#A5A5A5` | Descriptions, secondary UI, icons, timestamps |

### Accent

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent` | `#1043B1` | Primary buttons |
| `--color-accent-hover` | `#2D6FE4` | Button hover states |
| `--color-accent-active` | `#0C338A` | Button active/pressed states |
| `--color-accent-light` | `#3B82F6` | Focus rings, charts, progress bar fills |
| `--color-accent-text` | `#508de6` | SVG icons, dollar amounts |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-expense` | `#F87171` | Expense amounts |
| `--color-success` | `#34D399` | Income amounts |
| `--color-danger` | `#dc2626` | Delete/AC buttons |
| `--color-danger-hover` | `#EF4444` | Danger hover states |

### Typography & Spacing

Typography uses **Figtree** for headings and the system font stack for body text. Spacing follows a 4-scale system (`--space-xs`: 0.25rem through `--space-xl`: 2rem). All cards share a consistent border-radius of 6px with a 1px border.

**Key design decisions:**
- **Vanilla JS modules** — shared scripts (`data-manager.js`, `dialogs.js`, `navigation.js`, `csv-handler.js`, `utils.js`) loaded across pages via `<script>` tags
- **No build step** — all libraries loaded via CDN, no bundler or package manager
- **Custom dialogs** — accessible dark-themed modals with `role="dialog"`, `aria-modal`, `aria-labelledby`, and keyboard support
- **Multi-page SPA** — each HTML page is a distinct view, sharing a common navigation sidebar and design system

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Core | HTML5, CSS3, JavaScript (ES6+) |
| Storage | `localStorage` |
| Charts | [Chart.js 4.5.1](https://www.chartjs.org/) (CDN) |
| Markdown Editor | [EasyMDE 2.21.0](https://github.com/Ionaru/easy-markdown-editor) (CDN) |
| Fonts | [Figtree](https://fonts.google.com/specimen/Figtree) (Google Fonts) |
| Analytics | Microsoft Clarity |
| Hosting | GitHub Pages |
| PWA | Service Worker API, Web App Manifest |

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (optional, for the local server)

### Local Setup

1. Clone the repository
2. Start a local server from the project directory:
   ```bash
   python3 -m http.server
   ```
3. Open `http://localhost:8000` in your browser

No dependencies to install, no environment variables to configure.

---

## Progressive Web App (PWA) Support

Magnate can be installed on mobile devices:

1. On iOS, open the site in Safari at [https://rhythmd22.github.io/Magnate/](https://rhythmd22.github.io/Magnate/)
2. Tap the Share button and select **Add to Home Screen**
3. The app launches in standalone full-screen mode with offline support

The service worker caches all application assets and CDN dependencies with version-pinned URLs. It uses `skipWaiting()` for immediate updates and includes CORS resource caching for offline font rendering.

---

## License

MIT © [Rhythm Desai](LICENSE)