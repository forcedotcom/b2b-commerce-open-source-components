import { LightningElement, api } from 'lwc';
import { getDefaultGrossTaxFields, getDefaultNetTaxFields } from './orderAmountPreprocessor';
export { getDefaultGrossTaxFields, getDefaultNetTaxFields } from './orderAmountPreprocessor';
export default class OrderAmount extends LightningElement {
  static renderMode = 'light';
  @api
  orderSummaryDetails;
  @api
  orderDiscounts;
  @api
  netTaxOrdersFieldMapping;
  @api
  grossTaxOrdersFieldMapping;
  @api
  totalsCardTitle;
  @api
  totalsCardBackgroundColor;
  @api
  totalsCardBorderColor;
  @api
  totalsCardTextColor;
  @api
  totalsCardBorderRadius;
  @api
  showHorizontalLineAboveLastField = false;
  @api
  showLastFieldAsBold = false;
  @api
  hideTitle = false;
  @api
  hideFieldValueSeparator = false;
  get _netTaxFields() {
    return this.netTaxOrdersFieldMapping ? JSON.parse(this.netTaxOrdersFieldMapping) : getDefaultNetTaxFields();
  }
  get _grossTaxFields() {
    return this.grossTaxOrdersFieldMapping ? JSON.parse(this.grossTaxOrdersFieldMapping) : getDefaultGrossTaxFields();
  }
}