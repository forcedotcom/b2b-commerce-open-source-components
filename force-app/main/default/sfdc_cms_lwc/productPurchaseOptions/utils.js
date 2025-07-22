const defaultEmptyObject = Object.create(null);
export const computePurchaseRuleSet = (quantityRule, quantityGuides) => {
  quantityRule = quantityRule || defaultEmptyObject;
  const {
    minimumValueGuideText = '',
    maximumValueGuideText = '',
    incrementValueGuideText = ''
  } = quantityGuides;
  const ruleSet = {
    incrementText: '',
    minimumText: '',
    maximumText: '',
    combinedText: ''
  };
  const ruleArr = [];
  [{
    text: 'minimumText',
    valueText: minimumValueGuideText,
    value: quantityRule?.minimum
  }, {
    text: 'maximumText',
    valueText: maximumValueGuideText,
    value: quantityRule?.maximum
  }, {
    text: 'incrementText',
    valueText: incrementValueGuideText,
    value: quantityRule?.increment
  }].filter(entry => entry.valueText && entry.value).forEach(entry => {
    const valueText = entry.valueText.replace('{0}', Number(entry.value));
    ruleSet[entry.text] = valueText;
    ruleArr.push(valueText);
  });
  ruleSet.combinedText = ruleArr.join(' • ');
  return ruleSet;
};