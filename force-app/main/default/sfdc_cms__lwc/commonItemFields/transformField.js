const TOTAL_LINE_ADJUSTMENT_AMOUNT = {
  fieldApiName: 'TotalLineAdjustmentAmount'
};
const TOTAL_LINE_PROMOTION_AMOUNT = {
  fieldApiName: 'TotalLinePromotionAmount'
};
const TOTAL_PROMOTION_DIST_AMOUNT = {
  fieldApiName: 'TotalPromotionDistAmount'
};
const TARGET_TYPE_HEADER = 'HEADER';
const TYPE_PROMOTION = 'PROMOTION';
const DATE = 'DATE';
const DATE_TIME = 'DATE/TIME';
export const transformFields = function (fields = [], adjustments) {
  return fields.map((field, index) => {
    let filteredAdjustments = [];
    const updatedField = {
      ...field
    };
    if (field.dataName === TOTAL_LINE_ADJUSTMENT_AMOUNT.fieldApiName) {
      filteredAdjustments = adjustments?.filter(adjustment => adjustment.targetType?.toUpperCase() !== TARGET_TYPE_HEADER);
    } else if (field.dataName === TOTAL_LINE_PROMOTION_AMOUNT.fieldApiName) {
      filteredAdjustments = adjustments?.filter(adjustment => adjustment.targetType?.toUpperCase() !== TARGET_TYPE_HEADER && adjustment.type?.toUpperCase() === TYPE_PROMOTION);
    } else if (field.dataName === TOTAL_PROMOTION_DIST_AMOUNT.fieldApiName) {
      filteredAdjustments = adjustments?.filter(adjustment => adjustment.targetType?.toUpperCase() === TARGET_TYPE_HEADER && adjustment.type?.toUpperCase() === TYPE_PROMOTION);
    }
    const showInfoIcon = (filteredAdjustments || []).length > 0;
    const cssClass = showInfoIcon ? 'adjustments-amount-text' : '';
    let assistiveText = '';
    const isGeolocation = field.type.toUpperCase() === 'GEOLOCATION';
    if (isGeolocation && field.text) {
      const value = JSON.parse(field.text);
      assistiveText = `${value.latitude} ${value.longitude}`;
    }
    const isDateTypeField = field.type.toUpperCase() === DATE || field.type.toUpperCase() === DATE_TIME;
    if (isDateTypeField && field.text) {
      updatedField.text = new Date(field.text).toISOString();
    }
    const updatedFields = {
      ...updatedField,
      id: index,
      showFieldName: (field.label || '').length > 0,
      assistiveText,
      showInfoIcon,
      cssClass,
      adjustments: showInfoIcon ? filteredAdjustments : undefined
    };
    return updatedFields;
  });
};