import { LightningElement, api } from 'lwc';
import { FILTER_OPTIONS } from './constants';
export default class ProductListPurchasedFilterange extends LightningElement {
  static renderMode = 'light';
  _value = FILTER_OPTIONS[0].value;
  @api
  sortMenuLabel;
  get filterOptions() {
    return FILTER_OPTIONS;
  }
  get value() {
    return this._value;
  }
  handleFilterRangeChange(event) {
    event.stopPropagation();
    this._value = event.detail.value;
    this.dispatchEvent(new CustomEvent('filterrangechange', {
      bubbles: true,
      detail: {
        filterRange: this._value
      }
    }));
  }
}