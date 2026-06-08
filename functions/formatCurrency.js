export function formatMoney(amount, currency = "PHP", locale = "en-PH") {
  const value = Number(amount);

  if (isNaN(value)) {
    return "₱0.00";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
