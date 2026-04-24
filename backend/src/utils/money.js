export const toCents = (v) => Math.round(parseFloat(v) * 100);
export const fromCents = (c) => (c / 100).toFixed(2);