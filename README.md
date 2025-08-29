# Financier - College Budgeting Web App

## Overview

Financier is a lightweight web application that helps college students track spending, plan budgets and manage income. The app runs entirely in the browser using `localStorage` for data persistence, requiring no server setup. It also includes Progressive Web App (PWA) support for mobile installation.

## Getting Started

1. Clone this repository.
2. Launch a local web server from the project directory:
   ```bash
   python3 -m http.server
   ```
   Then open `http://localhost:8000` in your browser. You can also open `index.html` directly without a server.
3. If you prefer not to run a server, the latest version is hosted on GitHub Pages:
   <https://rhythmd22.github.io/Financier/>

## Progressive Web App (PWA) Support

Financier can be installed as a Progressive Web App on mobile devices:
1. Open the site in Safari on iOS at <https://rhythmd22.github.io/Financier/>.
2. Tap the "Share" button.
3. Select "Add to Home Screen".
4. The app will now appear on your home screen and launch in full-screen mode.

## Application Pages

The web app consists of several static HTML pages, each serving a specific function:

- `index.html`: The main landing page with quick links to other sections.
- `Goals & Categories.html`: Configure custom categories and set financial goals.
- `Track Transactions.html`: Record income and expenses for each category.
- `Analytics.html`: View charts summarizing weekly and monthly spending trends (uses Chart.js for data visualization).
- `Calculator.html`: Perform calculations without leaving the app.
- `Money Tips.html`: Browse practical budgeting advice.

All data is saved in your browser via `localStorage` and can be exported as CSV.

## Key Features

- **Goal Setting:** Define and track financial goals with customizable categories.
- **Expense & Income Tracking:** Add transactions with titles, amounts, categories, and dates.
- **Meal Planning Deductions:** A unique feature allowing users to log planned expenses (e.g., groceries for the week) and deduct them from specific categories.
- **Visual Summaries:** Interactive charts (using Chart.js loaded via CDN) for weekly and monthly spending/income.
- **Built-in Calculator:** A financial calculator with history, accessible within the app.
- **Budgeting Tips:** Static content providing financial advice.
- **Local Data Storage:** All data is saved in the browser's `localStorage` and can be exported/imported as a CSV file.
- **PWA Support:** Can be installed on mobile devices for a native app-like experience with offline capabilities.

## Technology Stack

- **Core Technologies**: HTML5, CSS3, JavaScript (ES6+)
- **Data Storage**: `localStorage` for client-side data persistence
- **UI Framework**: Custom CSS with responsive design for mobile and desktop
- **External Libraries**: Chart.js (loaded via CDN) for data visualization in the Analytics section
- **PWA Support**: Includes a service worker for offline functionality and installability

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
