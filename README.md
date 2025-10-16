# Magnate - Budgeting Web App

## Overview

Magnate is a lightweight web application designed for anyone who wants to take control of their finances. Magnate is a spinoff of the Financier project, building upon its foundation to create a more mature and developed version with enhanced features. The app runs entirely in the browser using `localStorage` for data persistence, requiring no server setup. It also includes Progressive Web App (PWA) support for mobile installation.

## Google Analytics

This application includes Google Analytics tracking to monitor basic usage metrics and improve user experience. Please note that no personal or financial data is shared with Google Analytics - only general page usage and navigation metrics are collected.

## Getting Started

1. Clone this repository.
2. Launch a local web server from the project directory:
   ```bash
   python3 -m http.server
   ```
   Then open `http://localhost:8000` in your browser. You can also open `index.html` directly without a server.
3. If you prefer not to run a server, the latest version is hosted on GitHub Pages:
   <https://rhythmd22.github.io/Magnate/>

## Progressive Web App (PWA) Support

Magnate can be installed as a Progressive Web App on mobile devices:
1. Open the site in Safari on iOS at <https://rhythmd22.github.io/Magnate/>.
2. Tap the "Share" button.
3. Select "Add to Home Screen".
4. The app will now appear on your home screen and launch in full-screen mode.

## Application Pages

The web app consists of several static HTML pages, each serving a specific function:

- `index.html`: The main landing page with quick links to other sections.
- `Goals & Categories.html`: Configure custom categories and set financial goals.
- `Track Transactions.html`: Record income and expenses for each category.
- `Analytics.html`: View charts summarizing weekly and monthly spending trends.
- `Calculator.html`: Perform calculations without leaving the app.
- `Money Tips.html`: Browse practical budgeting advice.

All data is saved in your browser via `localStorage` and can be exported as CSV.

## Key Features

- **Goal Setting:** Define and track financial goals with customizable categories.
- **Expense & Income Tracking:** Add transactions with titles, amounts, categories, and dates.
- **Visual Summaries:** Interactive charts (using Chart.js loaded via CDN) for weekly and monthly spending/income.
- **Built-in Calculator:** A financial calculator with history, accessible within the app.
- **Budgeting Tips:** Static content providing financial advice.
- **Local Data Storage:** All data is saved in the browser's `localStorage` and can be exported/imported as a CSV file.
- **PWA Support:** Can be installed on mobile devices for a native app-like experience with offline capabilities.

## New Features and Improvements

- **Improve WCAG compliance**
- **Improved Mobile Spacing**: Increased vertical spacing in Financial Goals cards on mobile devices for better readability and usability.
- **Partial Save Functionality**: Implemented partial save functionality for goal, category, and transaction editing, allowing users to save completed prompts even if they cancel subsequent prompts.
- **UI Consistency**: Fixed font sizing and spacing issues between headings and containers for improved consistency in Goals & Categories and Track Transactions pages.
- **Transaction Groups Section**: Replaced the meal plan section with a new Transaction Groups feature to group transactions and display budget information.
- **Notes Section**: Added a new notes section with markdown support via EasyMDE CDN integration.
- **UI Improvements**: Added background containers for SVG action buttons in Track Transactions for better visual consistency.
- **Calculator Logic**: Improved sequential calculator with more robust logic for handling operations.
- **Layout Optimization**: Switched from grid to Flexbox layout in the Calculator section to prevent display movement during calculations.
- **Calculation Management**: Added timestamps to each calculation included in the CSV export/import functionality.
- **Calculation Deletion**: Implemented the ability to delete individual calculations.
- **Category Update**: Changed "Textbooks" category to "Subscriptions" to better serve the target audience.
- **Content Updates**: Revised various tips to better align with the website's audience and goals.
- **Mobile Sidebar Open/Close Functionality**: Added functionality to open and close the sidebar on mobile devices by swiping. The sidebar now closes when tapping outside the sidebar area, with a backdrop overlay to prevent accidental taps on main content.
- **Font Declaration Refactor**: Refactored font-family declarations to use html element instead of universal selector for better performance and consistency.

## Technology Stack

- **Core Technologies**: HTML5, CSS3, JavaScript (ES6+)
- **Data Storage**: `localStorage` for client-side data persistence.
- **UI Framework**: Custom CSS with responsive design for mobile and desktop.
- **External Libraries**: 
  - EasyMDE (loaded via CDN) for markdown-enabled notes editing in the Track Transactions section.
  - Chart.js (loaded via CDN) for data visualization in the Analytics section.
- **PWA Support**: Includes a service worker for offline functionality and installability.

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
