# ⚡ FamilyFinance - Frontend Web App

FamilyFinance is a modern, mobile-first, and PWA-supported web application designed to manage personal and family finances, expenses, crypto assets, and recurring subscriptions from a single centralized hub.

This project is built as a React-based SPA (Single Page Application) that communicates with a robust .NET Core backend architecture.

## 🚀 Key Features

*   **📱 Mobile-First & PWA Support:** Installable as an app on iOS and Android devices, offering a seamless mobile experience (Bottom Tab Bar, Swipe-to-close Bottom Sheets).
*   **🌓 Dynamic Theme Management:** System-preference-aware, instantly togglable Dark / Light mode support.
*   **📊 Advanced Dashboard:** Interactive pie, line, and bar charts built with Recharts. Features instant data filtering by user and month/year.
*   **🧠 Smart Input:** Quickly add transactions from a single line using an NLP-like approach (e.g., "150 file market").
*   **📑 Headless Data Table:** High-performance data table powered by TanStack Table for desktop views, featuring strict pagination and sorting.
*   **🪙 Crypto Asset Management:** Custom widget for real-time tracking, portfolio distribution, and calculating total value in USD.
*   **⏳ Recurring Payments & Installments:** Module to track the remaining months and frequencies of subscriptions (Netflix, Rent, etc.) and credit card installments.
*   **🔐 Master Data Management:** System control panel where users with Admin privileges can manage categories (with parent/child relations), merchants, countries, and exchange rates.

## 🛠️ Tech Stack

*   **Core:** React 19, Vite
*   **Routing:** React Router v7
*   **Styling:** Tailwind CSS v4
*   **Data Visualization:** Recharts
*   **Table Management:** TanStack React Table v8
*   **PWA:** vite-plugin-pwa

## 📂 Project Structure

```text
src/
├── assets/          # Static files and images
├── Components/      # Reusable UI components (Modals, Widgets, Tables)
├── context/         # React Context API definitions (ThemeContext)
├── hooks/           # Custom React Hooks (useTransactions, useDashboard, etc.)
├── Pages/           # Main page views (Home, Login, MasterData)
├── utils/           # Helper functions (Date formatters, etc.)
├── App.jsx          # Main layout and route definitions
└── main.jsx         # React DOM integration
```

## ⚙️ Setup and Installation

Follow these steps to run the project in your local environment:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create an `.env.local` file in the root directory and specify your backend API URL:
   ```env
   VITE_API_BASE_URL=https://localhost:7xxx/api
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will run at `http://localhost:5173` by default.

## 🏗️ Build (Production)

To prepare the project for production:
```bash
npm run build
```
This command will generate optimized static files along with PWA assets into the `/dist` folder.