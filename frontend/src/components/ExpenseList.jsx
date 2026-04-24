const formatDate = (iso) => {
  const [y, m, d] = iso.split("-");
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
};

const formatMoney = (amount) =>
  parseFloat(amount).toLocaleString("en-US", { style: "currency", currency: "USD" });

const CATEGORY_COLORS = {
  Food: "#e86c4a",
  Transport: "#4a9ee8",
  Housing: "#8b5cf6",
  Health: "#10b981",
  Entertainment: "#f59e0b",
  Shopping: "#ec4899",
  Other: "#6b7280",
};

export function ExpenseList({ expenses, meta, filters, onFilterChange, loading, error, onRetry }) {
  const allCategories = meta.categories;

  return (
    <section className="expense-list-section">
      <div className="list-header">
        <div className="list-header-title">
          <h2>Expenses</h2>
          <span className="expense-count">{meta.count} {meta.count === 1 ? "entry" : "entries"}</span>
        </div>
        <div className="total-badge">
          Total: <strong>{formatMoney(meta.total)}</strong>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-sort">Sort</label>
          <select
            id="filter-sort"
            value={filters.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value })}
          >
            <option value="date_desc">Newest first</option>
          </select>
        </div>

        {filters.category && (
          <button
            className="btn-clear-filter"
            onClick={() => onFilterChange({ category: "" })}
          >
            ✕ Clear filter
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn-retry" onClick={onRetry}>Retry</button>
        </div>
      )}

      {loading && !expenses.length && (
        <div className="loading-state">
          <span className="spinner" />
          <span>Loading expenses…</span>
        </div>
      )}

      {!loading && !error && expenses.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">💸</span>
          <p>{filters.category ? `No expenses in "${filters.category}"` : "No expenses yet. Add one above!"}</p>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th className="col-amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className={loading ? "row-stale" : ""}>
                  <td className="col-date">{formatDate(e.date)}</td>
                  <td>
                    <span
                      className="category-pill"
                      style={{ "--pill-color": CATEGORY_COLORS[e.category] || "#6b7280" }}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td className="col-description">{e.description}</td>
                  <td className="col-amount">{formatMoney(e.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="total-label">
                  {filters.category ? `Total for ${filters.category}` : "Total"}
                </td>
                <td className="col-amount total-value">{formatMoney(meta.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
