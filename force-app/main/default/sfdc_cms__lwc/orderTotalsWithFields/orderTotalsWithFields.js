import { api, LightningElement } from 'lwc';
import { generateFieldLabelText } from './fieldLabelGenerator';
import { PROMO_FIELD_MAPPINGS } from './constants';
export default class OrderTotalsWithFields extends LightningElement {
  static renderMode = 'light';
  @api
  titleText;
  @api
  netTaxFields;
  @api
  grossTaxFields;
  @api
  showHorizontalLineAboveLastField = false;
  @api
  showLastFieldAsBold = false;
  @api
  hideTitle = false;
  @api
  hideFieldValueSeparator = false;
  get _currencyCode() {
    return this.totalsData?.currencyIsoCode;
  }
  get totalDiscount() {
    return this.totalsData?.adjustmentAggregates?.totalProductPromotionTotalAmount;
  }
  get _fieldsData() {
    if (this.totalsData?.fields) {
      const taxLocaleTypeFieldObj = this.totalsData.fields.TaxLocaleType;
      const taxLocaleType = taxLocaleTypeFieldObj?.text ?? '';
      const fieldsToDisplay = taxLocaleType === 'Gross' ? this.grossTaxFields : this.netTaxFields;
      return (fieldsToDisplay || []).map(field => ({
        name: field.name,
        label: this.hideFieldValueSeparator ? field.label : generateFieldLabelText(field.label),
        value: this.getFieldValue(this.totalsData, field)
      })).filter(fieldData => fieldData.value);
    }
    return undefined;
  }
  @api
  totalsData;
  @api
  discounts;
  getFieldValue(totalsData, inputField) {
    if (inputField.name === 'TotalOtherAdjustments') {
      return this.calculateOtherAdjustmentsTotal();
    }
    if (inputField.entity === 'OrderAdjustmentAggregateSummary') {
      const adjAggregateFieldMapping = this.getAdjAggregateFieldMapping(inputField.name);
      const fieldName = this.normalizeFieldNameForAdjustmentAggregates(adjAggregateFieldMapping);
      if (totalsData?.adjustmentAggregates) {
        const adjFieldValue = totalsData?.adjustmentAggregates[fieldName];
        if (parseFloat(adjFieldValue) === 0) {
          return null;
        }
        return adjFieldValue;
      }
    } else {
      const fieldObj = totalsData?.fields[inputField.name];
      if (fieldObj && fieldObj.text) {
        return fieldObj.text;
      }
    }
    return '';
  }
  normalizeFieldNameForAdjustmentAggregates(fieldName) {
    return fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
  }
  getAdjAggregateFieldMapping(fieldName) {
    return PROMO_FIELD_MAPPINGS[fieldName] ?? fieldName;
  }
  calculateOtherAdjustmentsTotal() {
    if (!this.discounts || this.discounts.length === 0) {
      return undefined;
    }
    const otherAdjustments = this.discounts.filter(discount => discount?.type === 'Other');
    if (otherAdjustments.length === 0) {
      return undefined;
    }
    const total = otherAdjustments.reduce((sum, discount) => {
      const amountStr = discount.amount ?? '0';
      const amount = parseFloat(amountStr);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    return total === 0 ? undefined : total.toString();
  }
  get filteredDiscounts() {
    if (!this.discounts || this.discounts.length === 0) {
      return undefined;
    }
    const filtered = this.discounts.filter(discount => discount?.type !== 'Other');
    return filtered.length > 0 ? filtered : undefined;
  }
}