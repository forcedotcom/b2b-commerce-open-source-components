export function computeSortOptions(sortRules) {
  return Array.isArray(sortRules) ? sortRules.map(item => {
    const {
      sortRuleId,
      label
    } = item;
    return {
      value: sortRuleId,
      label: label
    };
  }) : [];
}