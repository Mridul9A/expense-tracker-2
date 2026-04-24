import { Router } from "express";
import { createExpense, listExpenses } from "./expense.controller.js";

const router = Router();

router.post("/", createExpense);
router.get("/", listExpenses);

export default router;

