// Change "USD" / "en-US" here (e.g. "INR" / "en-IN") to change prices everywhere.
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export const formatPrice = (value) => currency.format(Number(value) || 0);

export const formatDateTime = (iso) => (iso ? dateTime.format(new Date(iso)) : "-");
