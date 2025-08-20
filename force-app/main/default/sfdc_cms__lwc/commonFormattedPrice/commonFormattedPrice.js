import { LightningElement, api } from 'lwc';
import currencyFormatter from 'site/commonFormatterCurrency';
export default class CommonFormattedPrice extends LightningElement {
  static renderMode = 'light';
  @api
  currencyCode;
  @api
  value;
  @api
  displayCurrencyAs;
  get formattedPrice() {
    if (this.value !== undefined && this.currencyCode) {
      return currencyFormatter(this.currencyCode, this.value, this.displayCurrencyAs || 'symbol');
    }
    return undefined;
  }
}