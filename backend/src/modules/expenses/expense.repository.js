import db from "../../config/db.js";
import { toCents } from "../../utils/money.js";

export const insertExpense = (expense) => {
  db.prepare(`
    INSERT INTO expenses 
    (id, idempotency_key, amount, category, description, date)
    VALUES ($id, $key, $amount, $category, $description, $date)
  `).run({
    $id: expense.id,
    $key: expense.idempotency_key,
    $amount: toCents(expense.amount),
    $category: expense.category,
    $description: expense.description,
    $date: expense.date,
  });
};

export const findByIdempotencyKey = (key) =>
  db.prepare("SELECT * FROM expenses WHERE idempotency_key = $key")
    .get({ $key: key });

export const findAll = ({ category }) => {
  let sql = "SELECT * FROM expenses";
  const params = {};

  if (category) {
    sql += " WHERE category = $category";
    params.$category = category;
  }

  sql += " ORDER BY date DESC";

  return db.prepare(sql).all(params);
};