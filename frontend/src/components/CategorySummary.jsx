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

export function CategorySummary({ expenses }) {
  if (!expenses.length) return null;

  const totals = {};
  let grand = 0;

  for (const e of expenses) {
    const cents = Math.round(parseFloat(e.amount) * 100);
    totals[e.category] = (totals[e.category] || 0) + cents;
    grand += cents;
  }

  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  return (
    <section className="category-summary">
      <h2>By Category</h2>
      <div className="summary-bars">
        {sorted.map(([cat, cents]) => {
          const pct = grand > 0 ? (cents / grand) * 100 : 0;
          const color = CATEGORY_COLORS[cat] || "#6b7280";
          return (
            <div key={cat} className="summary-row">
              <span className="summary-cat">{cat}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <span className="summary-amount">{formatMoney(cents / 100)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
