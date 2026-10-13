export function toCents(value: number) {
  return Math.round(value * 100);
}

export function fromCents(value: number) {
  return value / 100;
}

export function addMonthsClamped(isoDate: string, months: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

export function buildInstallments(
  total: number,
  count: number,
  firstDueDate: string,
) {
  const totalCents = toCents(total);
  const baseCents = Math.floor(totalCents / count);
  return Array.from({ length: count }, (_, index) => ({
    number: index + 1,
    dueDate: addMonthsClamped(firstDueDate, index),
    amount: fromCents(
      index === count - 1 ? totalCents - baseCents * (count - 1) : baseCents,
    ),
  }));
}
