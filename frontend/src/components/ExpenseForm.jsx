import { useState } from "react";

const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Health",
  "Entertainment",
  "Shopping",
  "Other",
];

const today = () => new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
  amount: "",
  category: "",
  description: "",
  date: today(),
};

export function ExpenseForm({
  onSubmit,
  submitting,
  submitError,
  onClearError,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [localErrors, setLocalErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setLocalErrors((prev) => ({ ...prev, [field]: null }));
    if (submitError) onClearError();
    setSuccess(false);
  };


  const validate = () => {
    const errors = {};
    const amount = Number(form.amount);

    if (!form.amount || isNaN(amount) || amount <= 0) {
      errors.amount = "Enter a positive amount";
    } else if (!/^\d+(\.\d{1,2})?$/.test(form.amount)) {
      errors.amount = "At most 2 decimal places";
    }

    if (!form.category) errors.category = "Select a category";
    if (!form.description.trim())
      errors.description = "Description is required";
    if (!form.date) errors.date = "Date is required";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (submitting) return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    const result = await onSubmit(form);

    if (result.success) {
      setForm({ ...EMPTY_FORM, date: today() });
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Add Expense</h2>

      <div className="form-row">
        <div className="field">
          <label htmlFor="amount">Amount</label>
          <div className="input-prefix-wrapper">
            <span className="input-prefix">$</span>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={set("amount")}
              className={localErrors.amount ? "error" : ""}
              disabled={submitting}
              aria-invalid={!!localErrors.amount}
            />
          </div>
          {localErrors.amount && (
            <span className="field-error">{localErrors.amount}</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={form.category}
            onChange={set("category")}
            className={localErrors.category ? "error" : ""}
            disabled={submitting}
            aria-invalid={!!localErrors.category}
          >
            <option value="">Select...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {localErrors.category && (
            <span className="field-error">{localErrors.category}</span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          placeholder="What was this for?"
          value={form.description}
          onChange={set("description")}
          className={localErrors.description ? "error" : ""}
          disabled={submitting}
          maxLength={500}
          aria-invalid={!!localErrors.description}
        />
        {localErrors.description && (
          <span className="field-error">
            {localErrors.description}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={form.date}
          onChange={set("date")}
          className={localErrors.date ? "error" : ""}
          disabled={submitting}
          aria-invalid={!!localErrors.date}
        />
        {localErrors.date && (
          <span className="field-error">{localErrors.date}</span>
        )}
      </div>

      {submitError && (
        <div className="alert alert-error" role="alert">
          {submitError}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          Expense added successfully!
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? (
          <span className="btn-loading">
            <span className="spinner" aria-hidden="true" />
            Saving…
          </span>
        ) : (
          "Add Expense"
        )}
      </button>
    </form>
  );
}