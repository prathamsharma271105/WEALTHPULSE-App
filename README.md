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
- **Scalable Document Database**: Uses **MongoDB** with **Mongoose ODM** for flexible schema validation, relational user referencing, and robust data persistence.
- **Theme Support**: Easily toggle between Dark Slate, Clean Light, and Executive Indigo themes.
- **PDF & JSON Export**: Generate and download full PDF statements or export all account financial data as JSON.

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
- **Settings & Profile Management**:
  - Update user profile details (Name, Phone, Preferred Currency).
  - Set monthly income and savings targets.
  - Change account password securely.
  - Export complete financial data as JSON or generate PDF statements.
  - Delete account with cascading data deletion.
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
- MongoDB Mongoose schema models ensuring data integrity and robust indexing.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Custom CSS3 (CSS Variables, Flexbox/Grid), Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via `mongoose`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Deployment**: Render / Vercel / Railway

---

## 📁 Project Structure

```text
Wealthpulse-main/
├── backend/
│   ├── db/
│   │   └── index.js          # MongoDB connection initialization & default admin seeder
│   ├── middleware/
│   │   └── auth.js           # JWT authentication & admin verification middleware
│   ├── models/
│   │   ├── Expense.js        # Expense schema & model
│   │   ├── Feedback.js       # Feedback ticket schema & model
│   │   ├── Goal.js           # Savings goals schema & model
│   │   ├── Habit.js          # Habit tracker schema & model
│   │   ├── HabitLog.js       # Daily habit completion check-in schema & model
│   │   ├── Income.js         # Income record schema & model
│   │   ├── Investment.js     # Portfolio asset & P&L schema & model
│   │   └── User.js           # User account, credentials & target preferences schema
│   ├── routes/
│   │   ├── admin.js          # Admin metrics, user management & feedback routes
│   │   ├── analytics.js      # Aggregated chart data endpoints
│   │   ├── auth.js           # Auth, profile, password update & data export routes
│   │   ├── expenses.js       # Expense CRUD and category summaries
│   │   ├── feedback.js       # Feedback submission and status update
│   │   ├── goals.js          # Savings goals and contribution tracking
│   │   ├── habits.js         # Habit streaks and check-ins
│   │   ├── income.js         # Income record management
│   │   └── investments.js    # Portfolio assets and P&L calculation
│   ├── .env.example          # Sample environment variables
│   ├── .env                  # Backend environment configuration
│   ├── package.json          # Backend dependencies and scripts
│   └── server.js             # Express app entry & static frontend server
├── frontend/
│   ├── css/
│   │   └── styles.css        # Core stylesheet & color themes
│   ├── js/
│   │   ├── api.js            # API request helper & JWT token handler
│   │   ├── layout.js         # Sidebar navigation & theme toggle logic
│   │   └── pdf-generator.js  # Client-side PDF financial report generator
│   ├── admin.html            # Admin dashboard & user management
│   ├── analytics.html        # Wealth charts & financial metrics
│   ├── dashboard.html        # Main user dashboard
│   ├── expenses.html         # Income & expense ledger
│   ├── goals.html            # Savings goals tracking
│   ├── habits.html           # Habit streak tracker
│   ├── index.html            # Landing page
│   ├── investments.html      # Investment portfolio & P&L
│   ├── login.html            # User login page
│   ├── register.html         # User signup page
│   └── settings.html         # Profile settings, targets & export options
├── .env.example              # Root sample environment file
├── .gitignore                # Git ignored paths
├── package.json              # Root package configuration & run scripts
└── README.md                 # Project documentation
```

---

## ⚙️ How to Run Locally

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm**
- **MongoDB** (Local MongoDB Community Server running or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Cloud Connection String)

### 2. Steps to Run

1. Open a terminal and navigate to the project directory:
   ```bash
   cd Wealthpulse-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   *(Or navigate to the `backend` folder and run `npm install`)*

3. Create your `.env` file (you can copy `.env.example`):
   ```env
   PORT=8000
   JWT_SECRET=super_secret_wealthpulse_key_2026
   ADMIN_EMAIL=admin@financetrack.com
   ADMIN_PASSWORD=Admin@12345
   MONGODB_URI=mongodb://127.0.0.1:27017/wealthpulse
   ```
   > **Note:** If using MongoDB Atlas in the cloud, replace `MONGODB_URI` with your connection string:
   > `MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/wealthpulse?retryWrites=true&w=majority`

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   ```text
   http://localhost:8000
   ```

---

## 🔌 API Endpoints

### Auth & User (`/api/auth`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login user & return JWT token | No |
| `GET` | `/api/auth/me` | Get currently logged-in user profile | Yes |
| `PATCH` | `/api/auth/profile` | Update profile, currency, or targets | Yes |
| `POST` | `/api/auth/change-password` | Change account password | Yes |
| `GET` | `/api/auth/export-all` | Export complete financial data JSON | Yes |
| `DELETE` | `/api/auth/delete-account` | Delete user account & all linked data | Yes |

### Income (`/api/income`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/income` | Get all income entries | Yes |
| `POST` | `/api/income` | Add new income entry | Yes |
| `DELETE` | `/api/income/:id` | Delete income entry | Yes |

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
| `PATCH` | `/api/admin/users/:id/role` | Change user role (User/Admin) | Admin |
| `DELETE` | `/api/admin/users/:id` | Delete user account | Admin |
| `GET` | `/api/admin/feedback` | List user feedback tickets | Admin |
| `PATCH` | `/api/admin/feedback/:id` | Resolve feedback ticket | Admin |

### System (`/api/health`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Server uptime & status check | No |

---

## 📌 Reviewer Notes

- **Database Architecture**: Powered by **MongoDB** with Mongoose models (`User`, `Income`, `Expense`, `Habit`, `HabitLog`, `Goal`, `Investment`, `Feedback`) providing schema validation and fast indexing.
- **Default Admin Account**: An admin account is seeded automatically upon startup (`admin@financetrack.com` / `Admin@12345`) for quick evaluation of admin management features.
- **Integrated Architecture**: Express serves both the REST API and the frontend static assets seamlessly on port `8000`.
