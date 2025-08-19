function evaluateCondition(condition, itemDetails) {
  const fieldValue = itemDetails[condition.field];
  return fieldValue === condition.fieldValue;
}
function evaluateConditions(conditions, itemDetails) {
  if (conditions.length === 0) {
    return true;
  }
  return conditions.reduce((result, condition, index) => {
    const conditionResult = evaluateCondition(condition, itemDetails);
    if (index === 0) {
      return conditionResult;
    }
    switch (condition.operation) {
      case 'AND':
        return result && conditionResult;
      case 'OR':
        return result || conditionResult;
      default:
        return result;
    }
  }, false);
}
export function getOutputValueFromTextConfig(textConfig, itemDetails) {
  for (const rule of textConfig) {
    if (evaluateConditions(rule.conditions, itemDetails)) {
      return rule.outputValue;
    }
  }
  return '';
}