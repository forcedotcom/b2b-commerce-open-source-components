import { LightningElement, api } from 'lwc';
import genericErrorMessage from '@salesforce/label/site.orderDetailsUi.genericErrorMessage';
export default class OrderDetailsUi extends LightningElement {
  static renderMode = 'light';
  @api
  orderSummaryDetails;
  @api
  orderSummaryHighlightsFieldMapping;
  @api
  highlightsTitle;
  @api
  highlightsCardBackgroundColor;
  @api
  highlightsCardBorderColor;
  @api
  highlightsCardTextColor;
  @api
  highlightsCardBorderRadius;
  get _highlightsCardBorderRadius() {
    return this.highlightsCardBorderRadius ? this.highlightsCardBorderRadius + 'px' : '';
  }
  get _hasError() {
    if (this.orderSummaryDetails === null) {
      return true;
    }
    return false;
  }
  get _errorMessage() {
    return genericErrorMessage;
  }
  get _customStyles() {
    return `
            --com-c-my-account-order-details-background-color: ${this.highlightsCardBackgroundColor || 'initial'};
            --com-c-my-account-order-details-font-color: ${this.highlightsCardTextColor || 'initial'};
            --com-c-my-account-order-details-border-color: ${this.highlightsCardBorderColor || 'initial'};
            --com-c-my-account-order-details-border-radius: ${this._highlightsCardBorderRadius || 'initial'};
        `;
  }
}