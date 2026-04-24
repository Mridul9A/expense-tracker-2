import {
  createExpenseService,
  listExpensesService,
} from "./expense.service.js";

export const createExpense = (req, res, next) => {
  try {
    const result = createExpenseService(req.body, req.headers);
    res.status(result.status).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const listExpenses = (req, res, next) => {
  try {
    const result = listExpensesService(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};