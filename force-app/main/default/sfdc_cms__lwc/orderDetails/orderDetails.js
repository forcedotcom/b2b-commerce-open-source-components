import { LightningElement, api } from 'lwc';
import { getDefaultFields } from './orderDetailsPreprocessor';
export { getDefaultFields } from './orderDetailsPreprocessor';
export default class OrderDetails extends LightningElement {
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
  get _orderSummaryFields() {
    return this.orderSummaryHighlightsFieldMapping ? JSON.parse(this.orderSummaryHighlightsFieldMapping) : getDefaultFields();
  }
}