export function roundMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;

  return Math.round((number + Number.EPSILON) * 100) / 100;
}
