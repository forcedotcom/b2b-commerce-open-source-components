import { LightningElement, api } from 'lwc';
export default class SearchProductSuggestionsGridUi extends LightningElement {
  static renderMode = 'light';
  @api
  productSuggestions;
  @api
  header;
  get normalizedProductSuggestions() {
    return this.productSuggestions || [];
  }
  get normalizedHeader() {
    return this.header || '';
  }
}