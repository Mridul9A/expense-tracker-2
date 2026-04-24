import { useExpenses } from "./hooks/useExpenses.js";
import { ExpenseForm } from "./components/ExpenseForm.jsx";
import { ExpenseList } from "./components/ExpenseList.jsx";
import { CategorySummary } from "./components/CategorySummary.jsx";

export default function App() {
  const {
    expenses, meta, filters, loading, error,
    updateFilters, addExpense, submitting, submitError, clearSubmitError, reload,
  } = useExpenses();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">$</span>
            <span className="logo-text">Ledger</span>
          </div>
          <p className="tagline">Track what you spend. Understand where it goes.</p>
        </div>
      </header>

      <main className="app-main">
        <div className="layout">
          <aside className="sidebar">
            <ExpenseForm
              onSubmit={addExpense}
              submitting={submitting}
              submitError={submitError}
              onClearError={clearSubmitError}
            />
            <CategorySummary expenses={expenses} />
          </aside>

          <div className="content">
            <ExpenseList
              expenses={expenses}
              meta={meta}
              filters={filters}
              onFilterChange={updateFilters}
              loading={loading}
              error={error}
              onRetry={reload}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
