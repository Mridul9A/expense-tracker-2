const BASE_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.error || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.validationErrors = data?.errors ?? null;
  }
}

async function request(path, { signal, ...options } = {}) {
  const url = `${BASE_URL}${path}`;

  let res;
  try {
    res = await fetch(url, {
      ...options,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError(0, { error: "Network error. Please try again." });
  }

  let data = null;

  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data || { error: res.statusText || "Something went wrong" }
    );
  }

  return data;
}

const KEY = "expense_pending_idempotency_key";

const getKey = () => sessionStorage.getItem(KEY);
const setKey = (k) => sessionStorage.setItem(KEY, k);
const clearKey = () => sessionStorage.removeItem(KEY);

const newKey = () =>
  typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export async function createExpense(formData) {
  let key = getKey();

  if (!key) {
    key = newKey();
    setKey(key);
  }

  try {
    const expense = await request("/expenses", {
      method: "POST",
      headers: { "Idempotency-Key": key },
      body: JSON.stringify(formData),
    });

    clearKey();
    return expense;
  } catch (err) {
    if (err.status === 422) {
      clearKey();
    }
    throw err;
  }
}

export async function fetchExpenses(params = {}, { signal } = {}) {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      qs.set(k, v);
    }
  });

  return request(`/expenses${qs.toString() ? `?${qs}` : ""}`, { signal });
}