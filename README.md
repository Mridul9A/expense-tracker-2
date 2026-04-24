# Ledger — Expense Tracker

> A minimal, production-quality full-stack expense tracker built to satisfy realistic conditions: unreliable networks, browser refreshes, and client retries. Built as part of a timed engineering assignment.

**Live Demo:** [expense-tracker-2-liart.vercel.app](https://expense-tracker-2-liart.vercel.app/)  
**Repository:** [github.com/Mridul9A/expense-tracker-2](https://github.com/Mridul9A/expense-tracker-2)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Running Locally](#setup--running-locally)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Key Design Decisions](#key-design-decisions)
- [Trade-offs & What I Left Out](#trade-offs--what-i-left-out)
- [Future Improvements](#future-improvements)
- [AI Tool Usage](#ai-tool-usage)

---

## Features

- Add expenses with amount, category, description, and date
- View a live list of all expenses
- Filter by category
- Sort by date (newest first)
- See a running total for the current filtered/sorted view
- Category summary breakdown (Nice to Have)
- Idempotent POST to safely handle retries and duplicate submissions
- Loading and error states in the UI

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18 (Vite), plain CSS        |
| Backend  | Node.js, Express                  |
| Database | SQLite via `better-sqlite3`       |

---

## Project Structure

```
expense-tracker-2/
├── backend/
│   └── src/
│       ├── modules/
│       │   └── expenses/
│       │       └── routes/
│       │           └── expenses.js      # Route handlers for POST and GET /expenses
│       ├── utils/
│       │   └── money.js                 # Cent conversion utilities
│       ├── app.js                       # Express app setup, middleware
│       └── server.js                    # Entry point
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ExpenseForm.jsx           # Add expense form
│       │   ├── ExpenseList.jsx           # Table with filter/sort controls
│       │   └── CategorySummary.jsx      # Per-category totals
│       ├── hooks/
│       │   └── useExpenses.js           # Data fetching and state logic
│       ├── lib/
│       │   └── api.js                   # Axios/fetch wrapper
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│   ├── .env
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

## Setup & Running Locally

### Prerequisites

- Node.js v18+
- npm v9+

### Backend

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=3001
DB_PATH=data/expenses.db
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001
```

---

## API Reference

### `POST /expenses`

Creates a new expense. Idempotent — safe to retry with the same `Idempotency-Key`.

**Headers:**

```
Content-Type: application/json
Idempotency-Key: <unique-uuid>
```

**Request Body:**

```json
{
  "amount": "12.50",
  "category": "Food",
  "description": "Lunch",
  "date": "2026-04-24"
}
```

**Response:** `201 Created` — the created expense object.

---

### `GET /expenses`

Returns a list of expenses.

**Query Parameters:**

| Param      | Type   | Description                        |
|------------|--------|------------------------------------|
| `category` | string | Filter results by category         |
| `sort`     | string | `date_desc` to sort newest first   |

**Response:** `200 OK` — array of expense objects.

**Expense Object Schema:**

```json
{
  "id": 1,
  "amount": 1250,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-04-24",
  "created_at": "2026-04-24T08:00:00.000Z"
}
```

> **Note:** `amount` is stored and returned in **cents** (integer). Formatting for display is handled on the frontend via `money.js`.

---

## Key Design Decisions

### SQLite via `better-sqlite3`
Chosen for zero-config setup, file-based persistence (no external DB service needed), and synchronous API that simplifies transactional logic. For a personal finance tool at small scale this is appropriate. The README notes migration to PostgreSQL as a future step.

### Amounts stored in cents (integers)
Floating-point arithmetic is unreliable for money. Storing amounts as integers in cents (e.g., `$12.50` → `1250`) avoids precision errors entirely. All conversion logic lives in `utils/money.js` and is applied at the boundary — on input and before display.

### Idempotency via `Idempotency-Key` header
Users may click Submit multiple times, or the browser may retry on page reload. The backend stores the idempotency key alongside each record and returns the existing record (instead of creating a duplicate) if the same key is resubmitted. This mirrors the pattern used by Stripe and other production APIs.

### Hooks-based data layer (`useExpenses.js`)
All data fetching, filtering, and sorting state lives in a single custom hook. Components stay declarative and free of side-effect logic, making the data layer easy to replace or extend independently.

### Filtering and sorting on the backend
Rather than fetching all records and filtering client-side, the API supports `category` and `sort` query params so the server does the work. This keeps it correct and scales naturally.

---

## Trade-offs & What I Left Out

| Decision | Reason |
|---|---|
| No authentication | Out of scope for a personal tool under a timebox. Noted as a future improvement. |
| No edit/delete | Not in the acceptance criteria. Adding it would have taken time better spent on correctness and idempotency. |
| No automated tests | Would have written integration tests for the `POST` idempotency logic and `GET` filters given more time. |
| SQLite instead of PostgreSQL | Faster to set up locally and sufficient for this scale. A clear migration path exists. |
| Minimal styling | Prioritized correctness, structure, and edge-case handling over visual polish per the assignment brief. |
| Client-side total calculation | The total is computed from the filtered list already returned by the server — no extra round trip needed. |

---

## Future Improvements

- **Edit and delete expenses**
- **User authentication** (JWT or session-based)
- **Charts** — spending over time, category breakdown pie chart
- **PostgreSQL migration** for multi-user or hosted deployment
- **Integration tests** — idempotency, filter/sort correctness, constraint validation
- **Export to CSV**

---

## AI Tool Usage

This project was developed with assistance from AI tools (Claude) for boilerplate generation, debugging, and README drafting. All architectural decisions, data model choices, and implementation logic were made and reviewed independently. The idempotency strategy, money handling approach, and hook structure reflect deliberate design choices, not AI defaults.