# WealthPulse — Financial Habit & Wealth Tracker

A full-stack personal finance web application to track daily income and expenses, build consistent saving habits with streaks, set milestone goals, manage investments, and visualize overall net worth growth.

Built for the **Unified Mentor** project submission.

---

## 📌 Project Overview

**WealthPulse** is an all-in-one personal finance web app designed to help users take control of their money. Most basic expense trackers only record past transactions without encouraging better financial behavior. WealthPulse combines day-to-day cash flow tracking with habit streaks, sinking funds (savings goals), and investment portfolio monitoring in one simple dashboard.

---

## 🎯 Problem & Motivation

Managing personal finances using multiple spreadsheets or complex tools usually leads to:
- **No habit consistency**: People start tracking expenses but quit within weeks because there is no motivation or streak system.
- **Scattered financial data**: Bank balances, savings goals, and investment assets are spread across different apps.
- **Lack of clear goal tracking**: Hard to see how close you are to specific targets like an emergency fund or vacation fund.
- **Complicated analytics**: Manually calculating monthly savings rates and category expense percentages takes too much time.

---

## 💡 What WealthPulse Solves

- **Daily Habit Streaks**: Encourages good financial routines (e.g., daily saving, expense review) using interactive streak counters.
- **Combined Net Worth**: Automatically calculates true net worth by combining liquid savings with investment asset values.
- **Visual Analytics**: Clean charts (powered by Chart.js) showing monthly income vs expense, category breakdown, and savings rate.
- **Multi-Asset Portfolio**: Track stocks, mutual funds, FDs, and crypto with automatic profit/loss calculation.
- **Lightweight & Self-Contained**: Uses SQLite with WAL mode via `better-sqlite3`, so the project runs immediately with zero external database setup.
- **Theme Support**: Easily toggle between Dark Slate, Clean Light, and Executive Indigo themes.

---

## 🚀 Key Features

### 👤 User Features
- **User Authentication**: Secure registration and login using JWT and bcrypt password hashing.
- **Dashboard Overview**: At-a-glance summary cards for Net Worth, Total Income, Total Expenses, and today's active habits.
- **Income & Expense Tracker**:
  - Add and delete income and expense entries with category tags and dates.
  - Category summaries with percentage breakdowns.
- **Habit Tracker**:
  - Create habits with daily, weekly, or monthly frequency.
  - One-click completion check-in with streak counter (`🔥`).
- **Savings Goals**:
  - Set target amounts and target dates for specific goals (Emergency Fund, Travel, Gadgets, etc.).
  - Add contributions and track dynamic progress bars.
- **Investment Portfolio**:
  - Log assets across Stocks, Mutual Funds, Fixed Deposits, Gold, and Crypto.
  - Auto-calculated total invested, current market value, and unrealized profit/loss.
- **Analytics Page**:
  - Monthly cash flow comparison (Income vs Expense).
  - Expense distribution by category (Doughnut chart).
  - Savings rate percentage trend over time.
- **Theme Switcher**: Dark Slate, Clean Light, and Executive Indigo options saved in browser storage.
- **Feedback Form**: Built-in form to send feedback or support queries.

### 🛡️ Admin Features
- **Admin Dashboard**: Overview of total registered users, habits created, active goals, and feedback tickets.
- **User Management**: List of all registered users, option to promote/demote roles (Admin/User), and delete accounts.
- **Feedback Moderation**: View submitted feedback queries and mark them as resolved.
- **Auto-Seeded Admin**: Default admin account created automatically on first run for quick evaluation.

### 🔒 Security & Architecture
- Passwords hashed with bcrypt (10 salt rounds).
- Protected API endpoints verified using Bearer JWT authentication tokens.
- User data isolation (each user can only query and modify their own records).
- Self-initializing SQLite database with WAL mode for fast local read/write performance.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Custom CSS3 (CSS Variables, Flexbox/Grid), Chart.js
- **Backend**: Node.js, Express.js
- **Database**: SQLite (via `better-sqlite3`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Deployment**: Render / Vercel

---

## 📁 Project Structure

```text
finance-website/
├── backend/
│   ├── db/
│   │   ├── index.js          # Database schema, table setup & admin seeder
│   │   └── data.sqlite       # Local SQLite database file (auto-generated)
│   ├── middleware/
│   │   └── auth.js           # JWT authentication & admin check middleware
│   ├── routes/
│   │   ├── admin.js          # Admin metrics, user management & feedback routes
│   │   ├── analytics.js      # Aggregated chart data endpoints
│   │   ├── auth.js           # Register, login, and user profile routes
│   │   ├── expenses.js       # Expense CRUD and category summaries
│   │   ├── feedback.js       # Feedback submission and status update
│   │   ├── goals.js          # Savings goals and contribution tracking
│   │   ├── habits.js         # Habit streaks and check-ins
│   │   ├── income.js         # Income record management
│   │   └── investments.js   # Portfolio assets and P&L calculation
│   ├── .env.example          # Sample environment variables
│   ├── .env                  # Local environment file
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express app entry & static frontend server
├── frontend/
│   ├── Css/
│   │   └── styles.css        # Stylesheet & color themes
│   ├── JS/
│   │   ├── api.js            # API request helper & JWT token handler
│   │   └── layout.js         # Sidebar navigation & theme toggle logic
│   ├── admin.html            # Admin dashboard & user management
│   ├── analytics.html        # Wealth charts & financial metrics
│   ├── dashboard.html        # Main user dashboard
│   ├── expenses.html         # Income & expense ledger
│   ├── goals.html            # Savings goals tracking
│   ├── habits.html           # Habit streak tracker
│   ├── index.html            # Landing page
│   ├── investments.html      # Investment portfolio & P&L
│   ├── login.html            # User login page
│   └── register.html         # User signup page
├── vercel.json               # Vercel configuration
├── .gitignore
├── README.md                 # Original README
└── README_NEW.md             # Updated WealthPulse README
```

---

## ⚙️ How to Run Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Steps to Run

1. Open a terminal and navigate to the project directory:
   ```bash
   cd "finance website"
   ```

2. Go to the backend folder and install packages:
   ```bash
   cd backend
   npm install
   ```

3. Create your `.env` file (you can copy `.env.example`):
   ```env
   PORT=8000
   JWT_SECRET=your_jwt_secret_key_here
   ADMIN_EMAIL=admin@financetrack.com
   ADMIN_PASSWORD=Admin@12345
   ```

4. Start the server:
   ```bash
   npm start
   ```
   *(Or run `npm run dev` if you have nodemon installed)*

5. Open your browser and go to:
   ```text
   http://localhost:8000
   ```

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login user & return token | No |
| `GET` | `/api/auth/me` | Get logged-in user profile | Yes |

### Income (`/api/income`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/income` | Get all income entries | Yes |
| `POST` | `/api/income` | Add new income | Yes |
| `DELETE` | `/api/income/:id` | Delete income | Yes |

### Expenses (`/api/expenses`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/expenses` | Get all expenses | Yes |
| `POST` | `/api/expenses` | Add new expense | Yes |
| `DELETE` | `/api/expenses/:id` | Delete expense | Yes |
| `GET` | `/api/expenses/summary/monthly` | Get monthly spending by category | Yes |

### Habits (`/api/habits`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/habits` | Get all habits with streak count | Yes |
| `POST` | `/api/habits` | Create a new habit | Yes |
| `POST` | `/api/habits/:id/complete` | Mark habit done today | Yes |
| `DELETE` | `/api/habits/:id` | Delete habit | Yes |

### Savings Goals (`/api/goals`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/goals` | Get all goals & progress | Yes |
| `POST` | `/api/goals` | Create a new goal | Yes |
| `PATCH` | `/api/goals/:id/contribute` | Add savings amount to goal | Yes |
| `DELETE` | `/api/goals/:id` | Delete goal | Yes |

### Investments (`/api/investments`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/investments` | Get portfolio assets & P&L | Yes |
| `POST` | `/api/investments` | Add new asset | Yes |
| `PATCH` | `/api/investments/:id` | Update asset value | Yes |
| `DELETE` | `/api/investments/:id` | Delete asset | Yes |

### Analytics (`/api/analytics`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/analytics/summary` | Get chart data summary | Yes |

### Feedback (`/api/feedback`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/feedback` | Submit user feedback | Optional |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/admin/stats` | Platform summary counts | Admin |
| `GET` | `/api/admin/users` | List all users | Admin |
| `PATCH` | `/api/admin/users/:id/role` | Change user role | Admin |
| `DELETE` | `/api/admin/users/:id` | Delete user account | Admin |
| `GET` | `/api/admin/feedback` | List user feedback tickets | Admin |
| `PATCH` | `/api/admin/feedback/:id` | Resolve feedback ticket | Admin |

---

## 📌 Reviewer Notes

- **Zero DB Setup**: SQLite is built-in via `better-sqlite3`, so you do not need MongoDB or MySQL to run and evaluate this project.
- **Local Persistence**: All data persists in `backend/db/data.sqlite`.
- **Integrated Frontend**: The Express backend serves the frontend files directly on the same port (`8000`).
