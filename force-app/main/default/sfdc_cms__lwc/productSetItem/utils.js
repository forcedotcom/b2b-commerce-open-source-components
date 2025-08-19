export function normalizeQuantityRule(rule) {
  if (rule === null || rule === undefined) {
    return undefined;
  }
  return {
    minimum: Number(rule.minimum).toString(),
    maximum: Number(rule.maximum).toString(),
    increment: Number(rule.increment).toString()
  };
}