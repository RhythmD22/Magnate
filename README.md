# Magnate - Budgeting Web App

## Overview

Magnate is a lightweight web application designed for anyone who wants to take control of their finances. Magnate is a spinoff of the Financier project, building upon its foundation to create a more mature and developed version with enhanced features. The app runs entirely in the browser using `localStorage` for data persistence, requiring no server setup. It also includes Progressive Web App (PWA) support for mobile installation.

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

## Key Features

- **Goal Setting:** Define and track financial goals with customizable categories.
- **Expense & Income Tracking:** Add transactions with titles, amounts, categories, and dates.
- **Visual Summaries:** Interactive charts (using Chart.js loaded via CDN) for weekly and monthly spending/income.
- **Built-in Calculator:** A financial calculator with history, accessible within the app.
- **Budgeting Tips:** Static content providing financial advice.
- **Local Data Storage:** All data is saved in the browser's `localStorage` and can be exported/imported as a CSV file.
- **PWA Support:** Can be installed on mobile devices for a native app-like experience with offline capabilities.

## New Features and Improvements

- **Dark-Themed Dialog System**: Replaced all native browser prompt, alert, and confirm dialogs with custom dark-themed modals that match the app's design language, with keyboard support and inline validation.
- **Sidebar Active State**: Active page is now visually indicated with a tinted background, white text, and blue SVG icon. Hover states include rounded corner highlights and SVG color transitions.
- **Two-Column Category Layout**: Expense category cards on the Goals & Categories page now display in a two-column grid on wider screens, making better use of horizontal space.
- **Per-Category Month Arrows Removed**: Month navigation now lives exclusively in the Total Monthly Budget section, eliminating duplicate controls on every category card.
- **Side-by-Side Transaction Groups**: The Transaction Groups section now splits expenses and incomes into separate columns for faster scanning.
- **Improved Font Sizing**: Bumped undersized text across the app (calculator timestamps, transaction card metadata, goal/category body text) and ensured mobile font sizes never shrink below their desktop counterparts.
- **Consistent Heading-to-Content Spacing**: Tightened section header margins across all pages and removed a negative margin hack for a cleaner, more predictable layout.
- **Mobile Sidebar Refinements**: Slightly wider sidebar with adjusted padding, proper alignment between the logo and nav links, and content pushed below the top navigation bar.
- **Bug Fixes**: Fixed duplicate ID generation race condition, null-safety in number formatting, orphaned category budget data on category deletion, incorrect calculator history entries, and global namespace leak in data-manager.js.
- **Improve WCAG compliance**
- **Service Worker Improvements**: Pinned CDN dependency versions (Chart.js 4.5.1, EasyMDE 2.21.0), added `skipWaiting()` for immediate updates, enabled CORS resource caching for offline font rendering, and fixed navigation fallback to serve the correct cached page instead of always redirecting to index.
- **Data Integrity Fixes**: Deep-cloned default category and goal objects to prevent silent mutation of defaults during edits. Fixed timezone bug where `toISOString()` caused incorrect date comparisons for users in UTC+ timezones. Guarded against `Math.max()` returning `-Infinity` on empty datasets and goal target division by zero. Fixed monthly date range calculations that incorrectly included the first day of the next month.
- **Memory Leak Fix**: Added `clearDetached()` to the listener manager to clean up event listeners on destroyed DOM elements, preventing unbounded memory growth during long sessions of goal, category, transaction, and calculator history editing.
- **CSV Export/Import Fixes**: Date fields are now properly CSV-escaped to prevent corruption. Blob URLs are revoked after export to prevent memory leaks. Notes section parsing was rewritten to correctly handle boundary detection without stripping content containing "Exported On".
- **Security — XSS Prevention**: Calculator history entries now use `textContent` instead of `innerHTML` to prevent stored XSS via manipulated localStorage data.
- **Accessibility**: Added `aria-expanded` attribute updates on the hamburger menu toggle. Custom dialog modals now include `role="dialog"` and `aria-modal="true"` for screen reader support.
- **CSS Fixes**: Prevented calculator AC button from losing its red color on active press. Fixed indentation in the swipe feedback element. Replaced unsupported complex `:not()` selector for Safari compatibility.
- **Improved Mobile Spacing**: Increased vertical spacing in Financial Goals cards on mobile devices for better readability and usability.
- **Partial Save Functionality**: Implemented partial save functionality for goal, category, and transaction editing, allowing users to save completed prompts even if they cancel subsequent prompts.
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
- **External Libraries**: 
  - EasyMDE (loaded via CDN) for markdown-enabled notes editing in the Track Transactions section.
  - Chart.js (loaded via CDN) for data visualization in the Analytics section.
- **PWA Support**: Includes a service worker for offline functionality and installability.

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.