import { useState, useEffect, useCallback, useRef } from "react";
import { fetchExpenses, createExpense as apiCreateExpense } from "../lib/api.js";

const DEFAULT_FILTERS = { category: "", sort: "date_desc" };

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState({ count: 0, total: "0.00", categories: [] });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const controllerRef = useRef(null);

  const load = useCallback(async (currentFilters) => {
    // cancel previous request
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchExpenses(
        {
          category: currentFilters.category || undefined,
          sort: currentFilters.sort || undefined,
        },
        { signal: controller.signal }
      );

      setExpenses(result.data);
      setMeta(result.meta);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to load expenses");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filters);
    return () => controllerRef.current?.abort();
  }, [filters, load]);

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const addExpense = useCallback(async (formData) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      await apiCreateExpense(formData);
      await load(filters);
      return { success: true };
    } catch (err) {
      const msg = err.validationErrors
        ? err.validationErrors.map((e) => e.msg).join(", ")
        : err.message || "Failed to create expense";
      setSubmitError(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [filters, load]);

  return {
    expenses,
    meta,
    filters,
    loading,
    error,
    updateFilters,
    addExpense,
    submitting,
    submitError,
    clearSubmitError: () => setSubmitError(null),
    reload: () => load(filters),
  };
}