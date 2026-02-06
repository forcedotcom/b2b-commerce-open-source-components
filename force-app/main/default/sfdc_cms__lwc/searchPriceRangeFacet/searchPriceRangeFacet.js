import { LightningElement, api } from 'lwc';
import currencyFormatter from 'site/commonFormatterCurrency';
import labels from './labels';
import { EVENT } from './constants';
export default class SearchPriceRangeFacet extends LightningElement {
  static renderMode = 'light';
  _minPriceErrorMessage;
  _maxPriceErrorMessage;
  _minPrice;
  _maxPrice;
  @api
  priceRangeMinLimitLabel;
  @api
  priceRangeMaxLimitLabel;
  @api
  priceRangeMinLimitErrorLabel;
  @api
  priceRangeMaxLimitErrorLabel;
  @api
  priceRangeMinPriceErrorLabel;
  @api
  priceRangeMaxPriceErrorLabel;
  @api
  priceRangeApplyButtonText;
  @api
  priceRangeApplyButtonAssistiveText;
  @api
  currencyCode;
  @api
  minLimit;
  @api
  maxLimit;
  @api
  get minPrice() {
    return this._minPrice;
  }
  set minPrice(value) {
    this._minPrice = value;
  }
  @api
  get maxPrice() {
    return this._maxPrice;
  }
  set maxPrice(value) {
    this._maxPrice = value;
  }
  get minLimitLabel() {
    const effectiveMinLimit = this.minLimit ?? 0;
    return `${labels.priceRangeMinLimit?.replace('{0}', effectiveMinLimit.toString())}`;
  }
  get maxLimitLabel() {
    const effectiveMaxLimit = this.maxLimit ?? Number.MAX_VALUE;
    return `${labels.priceRangeMaxLimit?.replace('{0}', effectiveMaxLimit.toString())}`;
  }
  get priceRangeValidationLabel() {
    return this._minPriceErrorMessage || this._maxPriceErrorMessage;
  }
  get applyButtonLabel() {
    return labels.priceRangeApplyButtonText;
  }
  get errorClassMinInput() {
    return this._minPriceErrorMessage ? 'slds-has-error' : '';
  }
  get errorClassMaxInput() {
    return this._maxPriceErrorMessage ? 'slds-has-error' : '';
  }
  get isApplyButtonDisabled() {
    return this._minPriceErrorMessage !== undefined || this._maxPriceErrorMessage !== undefined;
  }
  clearErrorMessages() {
    this._minPriceErrorMessage = undefined;
    this._maxPriceErrorMessage = undefined;
  }
  handleMinPriceChange(event) {
    this.clearErrorMessages();
  }
  handleMaxPriceChange(event) {
    this.clearErrorMessages();
  }
  handleMinPriceBlur(event) {
    const targetField = event.target;
    const effectiveMinLimit = this.minLimit ?? 0;
    if (targetField.value === '') {
      return;
    }
    const formattedValue = parseFloat(targetField.value);
    if (isNaN(formattedValue) || formattedValue < effectiveMinLimit) {
      this._minPrice = effectiveMinLimit;
      targetField.value = this._minPrice.toString();
    } else {
      this._minPrice = Math.floor(Number(formattedValue));
      targetField.value = this._minPrice.toString();
    }
    this.validateMinPrice();
    if (this._minPriceErrorMessage === undefined) {
      this.validateMaxPrice();
    }
  }
  validateMinPrice() {
    const effectiveMaxPrice = this.maxPrice;
    const effectiveMaxLimit = this.maxLimit ?? Number.MAX_VALUE;
    if (this.minPrice || this.minPrice === 0) {
      if (effectiveMaxPrice && this.minPrice > effectiveMaxPrice) {
        this._minPriceErrorMessage = labels.priceRangeMinPriceError;
        this._maxPriceErrorMessage = undefined;
        return false;
      } else if (this.minPrice > effectiveMaxLimit) {
        const currencyValue = currencyFormatter(this.currencyCode, effectiveMaxLimit, 'symbol');
        this._minPriceErrorMessage = `${labels.priceRangeMinLimitError.replace('{0}', currencyValue)}`;
        this._maxPriceErrorMessage = undefined;
        return false;
      }
      this._minPriceErrorMessage = undefined;
      return true;
    }
    return true;
  }
  handleMaxPriceBlur(event) {
    const targetField = event.target;
    if (targetField.value === '') {
      return;
    }
    const effectiveMaxLimit = this.maxLimit ?? Number.MAX_VALUE;
    const formattedValue = parseFloat(targetField.value);
    if (isNaN(formattedValue) || formattedValue > effectiveMaxLimit) {
      this._maxPrice = effectiveMaxLimit;
      targetField.value = this._maxPrice.toString();
    } else {
      this._maxPrice = Math.ceil(Number(formattedValue));
      targetField.value = this._maxPrice.toString();
    }
    this.validateMaxPrice();
    if (this._maxPriceErrorMessage === undefined) {
      this.validateMinPrice();
    }
  }
  validateMaxPrice() {
    const effectiveMinPrice = this.minPrice;
    const effectiveMinLimit = this.minLimit ?? 0;
    if (this.maxPrice || this.maxPrice === 0) {
      if (effectiveMinPrice && this.maxPrice < effectiveMinPrice) {
        this._maxPriceErrorMessage = labels.priceRangeMaxPriceError;
        this._minPriceErrorMessage = undefined;
        return false;
      } else if (this.maxPrice < effectiveMinLimit) {
        const currencyValue = currencyFormatter(this.currencyCode, effectiveMinLimit, 'symbol');
        this._maxPriceErrorMessage = `${labels.priceRangeMaxLimitError?.replace('{0}', currencyValue)}`;
        this._minPriceErrorMessage = undefined;
        return false;
      }
      this._maxPriceErrorMessage = undefined;
      return true;
    }
    return true;
  }
  handlePriceRangeApplyClick() {
    if (this.validateMinPrice() && this.validateMaxPrice()) {
      const minPrice = this.minPrice ?? this.minLimit;
      const maxPrice = this.maxPrice ?? this.maxLimit;
      this.dispatchEvent(new CustomEvent(EVENT.FACETVALUE_PRICE_UPDATE_EVT, {
        bubbles: true,
        composed: true,
        detail: {
          minPrice,
          maxPrice
        }
      }));
    }
  }
}