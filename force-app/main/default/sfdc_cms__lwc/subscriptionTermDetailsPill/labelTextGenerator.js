import { LABELS_MAP } from './labelsMapConfig';
const getFormattedLabelText = (label, pricingTerm, subscriptionTerm) => {
  if (!label) {
    return label;
  }
  return label.replace('{pricingTerm}', pricingTerm.toString()).replace('{subscriptionTerm}', subscriptionTerm?.toString() || '');
};
export const getTermDetailsPillText = (sellingModelType, pricingTerm, pricingTermUnit, subscriptionTerm) => {
  const labelsForSellingModel = LABELS_MAP[sellingModelType];
  const labelsForPricingTerm = labelsForSellingModel?.[pricingTermUnit];
  const pillLabel = pricingTerm === 1 ? labelsForPricingTerm?.ONE : labelsForPricingTerm?.MORE_THAN_ONE;
  return getFormattedLabelText(pillLabel, pricingTerm, subscriptionTerm);
};