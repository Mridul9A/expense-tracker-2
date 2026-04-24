import db from "../config/db.js";

const toCents = (v) => Math.round(Number(v) * 100);
const fromCents = (c) => (c / 100).toFixed(2);

const serialize = (row) => ({
  id: row.id,
  amount: fromCents(row.amount),
  category: row.category,
  description: row.description,
  date: row.date,
  created_at: row.created_at,
});

export const createExpense = ({
  id,
  idempotency_key,
  amount,
  category,
  description,
  date,
}) => {
  if (
    amount === undefined ||
    amount === null ||
    Number(amount) <= 0 ||
    !category ||
    !description ||
    !date
  ) {
    throw new Error("Invalid or missing fields");
  }

  db.prepare(`
    INSERT INTO expenses 
    (id, idempotency_key, amount, category, description, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    idempotency_key ?? null,
    toCents(amount),
    (category || "").trim(),
    (description || "").trim(),
    date
  );

  return getExpenseById(id);
};

export const getExpenseByIdempotencyKey = (key) => {
  if (!key || typeof key !== "string") return null;

  const cleanKey = key.trim();
  if (!cleanKey) return null;

  const row = db
    .prepare("SELECT * FROM expenses WHERE idempotency_key = ?")
    .get(cleanKey);

  return row ? serialize(row) : null;
};

export const getExpenseById = (id) => {
  if (!id) return null;

  const row = db
    .prepare("SELECT * FROM expenses WHERE id = ?")
    .get(id);

  return row ? serialize(row) : null;
};

export const listExpenses = ({ category } = {}) => {
  let sql = "SELECT * FROM expenses";
  const params = [];

  if (category) {
    sql += " WHERE category = ?";
    params.push(category);
  }

  sql += " ORDER BY date DESC, created_at DESC";

  return db.prepare(sql).all(...params).map(serialize);
};

export const listCategories = () =>
  db
    .prepare("SELECT DISTINCT category FROM expenses ORDER BY category ASC")
    .all()
    .map((r) => r.category);