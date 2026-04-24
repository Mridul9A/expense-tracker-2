import { v4 as uuidv4 } from "uuid";
import {
  insertExpense,
  findByIdempotencyKey,
  findAll,
} from "./expense.repository.js";
import { fromCents } from "../../utils/money.js";

const serialize = (row) => ({
  ...row,
  amount: fromCents(row.amount),
});

export const createExpenseService = (data, headers) => {
  const idempotencyKey = headers["idempotency-key"];

  if (idempotencyKey) {
    const existing = findByIdempotencyKey(idempotencyKey);
    if (existing) return { status: 200, data: serialize(existing) };
  }

  const expense = {
    id: uuidv4(),
    idempotency_key: idempotencyKey,
    ...data,
  };

  insertExpense(expense);

  return { status: 201, data: expense };
};

export const listExpensesService = (query) => {
  const rows = findAll(query);

  const data = rows.map(serialize);

  const total = data.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );

  return {
    data,
    meta: {
      total: total.toFixed(2),
      count: data.length,
    },
  };
};