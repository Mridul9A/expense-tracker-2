/**
 * Integration tests for the Expense Tracker API
 * Run with: npm test
 *
 * Uses Node's built-in test runner (no additional test framework needed).
 * Tests spin up the actual Express app against a temp SQLite DB.
 */
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Use a temp DB for tests
process.env.DB_PATH = ":memory:";

const BASE_URL = "http://localhost:3002";

let server;

before(async () => {
  // Dynamic import so DB_PATH env var is picked up
  const { default: app } = await import("../index.js");
  server = app.listen(3002);
  // Wait for server to be ready
  await new Promise((r) => setTimeout(r, 100));
});

after(() => {
  server?.close();
});

const postExpense = (body, headers = {}) =>
  fetch(`${BASE_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

const getExpenses = (params = "") =>
  fetch(`${BASE_URL}/expenses${params}`);

const VALID_EXPENSE = {
  amount: "12.50",
  category: "Food",
  description: "Lunch",
  date: "2024-03-15",
};

describe("POST /expenses", () => {
  it("creates an expense and returns 201", async () => {
    const res = await postExpense(VALID_EXPENSE);
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.amount, "12.50");
    assert.equal(body.category, "Food");
    assert.ok(body.id, "should have an id");
    assert.ok(body.created_at, "should have created_at");
  });

  it("returns 422 for negative amount", async () => {
    const res = await postExpense({ ...VALID_EXPENSE, amount: "-5" });
    assert.equal(res.status, 422);
  });

  it("returns 422 for zero amount", async () => {
    const res = await postExpense({ ...VALID_EXPENSE, amount: "0" });
    assert.equal(res.status, 422);
  });

  it("returns 422 for missing category", async () => {
    const res = await postExpense({ ...VALID_EXPENSE, category: "" });
    assert.equal(res.status, 422);
  });

  it("returns 422 for invalid date", async () => {
    const res = await postExpense({ ...VALID_EXPENSE, date: "not-a-date" });
    assert.equal(res.status, 422);
  });

  it("is idempotent: duplicate idempotency key returns the original expense", async () => {
    const key = `test-key-${Date.now()}`;
    const headers = { "Idempotency-Key": key };

    const res1 = await postExpense(VALID_EXPENSE, headers);
    const body1 = await res1.json();
    assert.equal(res1.status, 201);

    const res2 = await postExpense(VALID_EXPENSE, headers);
    const body2 = await res2.json();
    // Second call should return 200 (already processed), same record
    assert.equal(res2.status, 200);
    assert.equal(body2.id, body1.id);
  });
});

describe("GET /expenses", () => {
  it("returns expenses list with meta", async () => {
    const res = await getExpenses();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(typeof body.meta.total === "string");
    assert.ok(typeof body.meta.count === "number");
    assert.ok(Array.isArray(body.meta.categories));
  });

  it("filters by category", async () => {
    // Create a unique category
    await postExpense({ ...VALID_EXPENSE, category: "UniqueTestCategory" });
    const res = await getExpenses("?category=UniqueTestCategory");
    const body = await res.json();
    assert.ok(body.data.every((e) => e.category === "UniqueTestCategory"));
  });

  it("returns expenses sorted by date newest first", async () => {
    const res = await getExpenses("?sort=date_desc");
    const body = await res.json();
    const dates = body.data.map((e) => e.date);
    const sorted = [...dates].sort((a, b) => (a < b ? 1 : -1));
    assert.deepEqual(dates, sorted);
  });

  it("total reflects filtered results only", async () => {
    const category = `FilterTest-${Date.now()}`;
    await postExpense({ ...VALID_EXPENSE, amount: "10.00", category });
    await postExpense({ ...VALID_EXPENSE, amount: "5.00", category });

    const res = await getExpenses(`?category=${category}`);
    const body = await res.json();
    assert.equal(body.meta.total, "15.00");
  });
});
