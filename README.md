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
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [PWA Support](#progressive-web-app-pwa-support)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Feature | Description |
|---------|------------|
| Goal Setting | Define financial goals with customizable categories and budgets |
| Expense & Income Tracking | Add, edit, and delete transactions with title, amount, category, and date |
| Visual Summaries | Interactive charts (Chart.js) for weekly and monthly spending/income |
| Built-in Calculator | Financial calculator with persistent history and CSV export |
| Transaction Groups | Group related transactions side-by-side for faster scanning |
| Notes with Markdown | Rich-text notes section powered by EasyMDE |
| Budgeting Tips | Curated static content offering practical financial advice |
| CSV Import/Export | Backup or migrate your data with proper date escaping and blob cleanup |
| Local Data Storage | All data persisted in `localStorage` — no account, no server |
| Dark-Themed Dialogs | Custom accessible dialogs (`role="dialog"`, `aria-modal`) with keyboard support |
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
├── index.html                  # Dashboard / home page
├── Goals & Categories.html     # Goal and category management
├── Track Transactions.html     # Transaction entries with notes
├── Analytics.html              # Charts and data visualization
├── Calculator.html             # Financial calculator
├── Money Tips.html             # Budgeting advice
├── css/
│   ├── styles.css              # Global variables, reset, and layout
│   ├── index.css               # Dashboard styles
│   ├── goals-categories.css
│   ├── track-transactions.css
│   ├── analytics.css
│   ├── calculator.css
│   └── money-tips.css
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
├── images/
├── SVGs/
├── manifest.json               # PWA manifest
├── service-worker.js           # Offline caching and install flow
├── LICENSE
└── README.md
```

The app is a single-page-style multi-document application. Each HTML page represents a distinct view, with shared JavaScript modules (`data-manager.js`, `dialogs.js`, `navigation.js`, `utils.js`, `csv-handler.js`) loaded across pages. Data flows through `localStorage`, dispatched by `data-manager.js`, and consumed by page-specific scripts. There is no build step or bundler.

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Keep the app dependency-free. All libraries are loaded via CDN — do not introduce npm packages or build steps.

---

## License

MIT © [Rhythm Desai](LICENSE)