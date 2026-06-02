import { LightningElement, api } from 'lwc';
import genericErrorMessage from '@salesforce/label/site.orderAmountUi.genericErrorMessage';
export default class OrderAmountUi extends LightningElement {
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
  get _totalsCardBorderRadius() {
    return this.totalsCardBorderRadius ? this.totalsCardBorderRadius + 'px' : '';
  }
  @api
  showHorizontalLineAboveLastField = false;
  @api
  showLastFieldAsBold = false;
  @api
  hideTitle = false;
  @api
  hideFieldValueSeparator = false;
  get _hasError() {
    if (this.orderSummaryDetails === null) {
      return true;
    }
    return false;
  }
  get _errorMessage() {
    return genericErrorMessage;
  }
  get totalsCustomCssStyles() {
    return `
            --com-c-my-account-order-summary-amount-background-color: ${this.totalsCardBackgroundColor || 'initial'};
            --com-c-my-account-order-summary-amount-text-color: ${this.totalsCardTextColor || 'initial'};
            --com-c-my-account-order-summary-amount-border-color: ${this.totalsCardBorderColor || 'initial'};
            --com-c-my-account-order-summary-amount-border-radius: ${this._totalsCardBorderRadius || 'initial'};
        `;
  }
  get filteredOrderDiscounts() {
    if (!this.orderDiscounts) {
      return null;
    }
    return this.orderDiscounts.filter(adj => adj.lineItemType === 'Order Product' || adj.lineItemType === 'Product');
  }
}