import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import {
  createExpense,
  listExpenses,
  listCategories,
  getExpenseByIdempotencyKey,
} from "../db/expenseModel.js";

const router = Router();

const createExpenseRules = [
  body("amount").isFloat({ gt: 0 }),
  body("category").isString().trim().notEmpty(),
  body("description").isString().trim().notEmpty(),
  body("date").isISO8601().toDate(),
];

const listExpensesRules = [
  query("category").optional().isString().trim(),
  query("sort").optional().isIn(["date_desc"]),
];

router.post("/", createExpenseRules, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { amount, category, description, date } = req.body;

  // 🔥 SAFE idempotency handling
  const rawKey = req.headers["idempotency-key"];
  const idempotencyKey =
    typeof rawKey === "string" && rawKey.trim() !== ""
      ? rawKey.trim()
      : null;

  let existing = null;

  if (idempotencyKey) {
    existing = getExpenseByIdempotencyKey(idempotencyKey);
  }

  if (existing) {
    return res.status(200).json(existing);
  }

  try {
    const expense = createExpense({
      id: uuidv4(),
      idempotency_key: idempotencyKey,
      amount,
      category,
      description,
      date:
        date instanceof Date
          ? date.toISOString().split("T")[0]
          : date,
    });

    return res.status(201).json(expense);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE" && idempotencyKey) {
      const existing = getExpenseByIdempotencyKey(idempotencyKey);
      if (existing) return res.status(200).json(existing);
    }
    next(err);
  }
});

router.get("/", listExpensesRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { category, sort } = req.query;

  const expenses = listExpenses({ category, sort });
  const categories = listCategories();

  const total = expenses
    .reduce((sum, e) => sum + Number(e.amount), 0)
    .toFixed(2);

  return res.json({
    data: expenses,
    meta: {
      count: expenses.length,
      total,
      categories,
    },
  });
});

export default router;