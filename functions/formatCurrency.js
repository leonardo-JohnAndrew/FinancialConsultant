
export function formatMoney(amount, currency = 'PHP', locale = 'en-PH') {
    if (typeof amount !== 'number' || isNaN(amount)) {
        throw new Error('Invalid amount: must be a number.');
    }
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
