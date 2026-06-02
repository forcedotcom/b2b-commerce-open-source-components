import { api, LightningElement } from 'lwc';
import labels from './labels';
export default class OrderTotals extends LightningElement {
  static renderMode = 'light';
  @api
  titleText;
  @api
  showHorizontalLineAboveLastField = false;
  @api
  showLastFieldAsBold = false;
  @api
  hideTitle = false;
  @api
  hideFieldValueSeparator = false;
  @api
  discounts;
  dataLoaded = false;
  fieldsData;
  @api
  get fields() {
    return this.fieldsData;
  }
  get showTitle() {
    return !this.hideTitle;
  }
  set fields(value) {
    this.fieldsData = value;
    if (value) {
      this.dataLoaded = true;
    }
  }
  @api
  currencyCode;
  @api
  totalDiscount;
  get _labels() {
    return labels;
  }
  get displayableFields() {
    return this.fieldsData?.map((field, index, array) => ({
      ...field,
      cssClasses: this.generateCssClassesForField(index === array.length - 1),
      isDiscount: field.name === 'TotalProductPromotionDiscount'
    }));
  }
  generateCssClassesForField(isLastField) {
    let classes = 'field-item slds-grid slds-m-bottom_xx-small slds-grid_align-spread';
    if (isLastField && this.showHorizontalLineAboveLastField) {
      classes += ' slds-border_top slds-p-top_xx-small';
    }
    if (isLastField && this.showLastFieldAsBold) {
      classes += ' slds-text-title_bold';
    }
    return classes;
  }
}