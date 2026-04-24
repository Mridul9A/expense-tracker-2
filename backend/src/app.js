import express from "express";
import cors from "cors";
import expensesRouter from "./routes/expenses.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/expenses", expensesRouter);

app.use((err, _req, res, _next) => {
  console.error("🔥 ERROR:", err);
  res.status(500).json({ error: err.message });
});

export default app;