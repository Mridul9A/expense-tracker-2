import { body, query } from "express-validator";

export const createExpenseValidator = [
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),

  body("category")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Category is required"),

  body("description")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("date")
    .isISO8601()
    .withMessage("Invalid date format"),
];

export const listExpensesValidator = [
  query("category").optional().isString().trim(),
  query("sort").optional().isIn(["date_desc"]),
];