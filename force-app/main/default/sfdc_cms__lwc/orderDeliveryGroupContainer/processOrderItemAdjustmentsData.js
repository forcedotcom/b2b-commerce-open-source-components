function generateDisplayablePromotionName(name, code) {
  const codeExists = typeof code === 'string' && code.length > 0;
  const nameExists = typeof name === 'string' && name.length > 0;
  if (codeExists) {
    const template = nameExists ? `{name} ({code})` : code;
    return template.replace('{code}', code).replace('{name}', name);
  }
  return name;
}
export function transformAdjustmentFieldsForDisplay(orderSummaryAdjustments, otherAdjustmentsLabel) {
  return orderSummaryAdjustments.map((adjustment, index) => {
    const name = adjustment.type === 'Other' ? otherAdjustmentsLabel : generateDisplayablePromotionName(adjustment.displayName, adjustment.basisReferenceDisplayName || '');
    return {
      name: name,
      id: index,
      discountAmount: adjustment.amount,
      ...adjustment
    };
  });
}
export function processOrderItemAdjustmentsData(data, otherAdjustmentsLabel) {
  return transformAdjustmentFieldsForDisplay(data.adjustments, otherAdjustmentsLabel);
}