import { api, LightningElement } from 'lwc';
import { ERROR_RANGE_UNDERFLOW, stringOnlyHasNumbers } from 'site/commonNumberInput';
import { defaultRules, errorLabels, VALUE_CHANGED_EVT, VALIDITY_CHANGED_EVT } from './constants';
import { outOfStock as outOfStockDefaultLabel } from './labels';
export { defaultRules, VALUE_CHANGED_EVT };
const generateRandomId = (() => {
  let lastId = 0;
  return () => crypto?.randomUUID?.() || String(++lastId);
})();
export default class CommonQuantitySelector extends LightningElement {
  static renderMode = 'light';
  _minimum;
  _step;
  _isValid = true;
  _validationFailureReason = '';
  _isOutOfStock = false;
  _availableQuantity;
  dataId;
  connectedCallback() {
    const dataId = this.getAttribute('data-id');
    if (!dataId) {
      this.dataId = generateRandomId();
      this.setAttribute('data-id', this.dataId);
    } else {
      this.dataId = dataId;
    }
  }
  @api
  get minimum() {
    return this._minimum;
  }
  set minimum(value) {
    this._minimum = value;
    this.determineOutOfStock();
  }
  @api
  maximum;
  @api
  get step() {
    return this._step;
  }
  set step(value) {
    this._step = value;
    this.determineOutOfStock();
  }
  @api
  hideLabel = false;
  @api
  hideButtons = false;
  @api
  hideNotifications = false;
  @api
  disabled = false;
  @api
  label;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  stepValueGuideText;
  @api
  value;
  @api
  outOfStockText;
  @api
  hideOutOfStock = false;
  @api
  customErrorMessage;
  @api
  get availableQuantity() {
    return this._availableQuantity;
  }
  set availableQuantity(value) {
    this._availableQuantity = value;
    this.determineOutOfStock();
  }
  get inputValue() {
    return this.value == null ? this.rulesAsNumbers.minimum : this.value;
  }
  get rulesAsNumbers() {
    return {
      minimum: this._minimum && stringOnlyHasNumbers(this._minimum) ? +this._minimum : defaultRules.minimum,
      maximum: this.maximum && stringOnlyHasNumbers(this.maximum) ? +this.maximum : defaultRules.maximum,
      step: this._step && stringOnlyHasNumbers(this._step) ? +this._step : defaultRules.step
    };
  }
  get ruleOrInventoryMaximum() {
    const {
      minimum,
      maximum,
      step
    } = this.rulesAsNumbers;
    return this._availableQuantity && this._availableQuantity < maximum ? this._availableQuantity - (this._availableQuantity - minimum) % step : maximum;
  }
  get minimumText() {
    return this._minimum && this.minimumValueGuideText ? this.minimumValueGuideText?.replace('{0}', this._minimum) : '';
  }
  get maximumText() {
    const maximum = this.ruleOrInventoryMaximum;
    return (this.maximum || this._availableQuantity) && this.maximumValueGuideText ? this.maximumValueGuideText?.replace('{0}', maximum.toString()) : '';
  }
  get stepText() {
    return this._step && this.stepValueGuideText ? this.stepValueGuideText?.replace('{0}', this._step) : '';
  }
  get showRulePopover() {
    return !this._isOutOfStock && [this.minimumText, this.maximumText, this.stepText].some(text => text && text.length > 0);
  }
  get hasValidationError() {
    return !this._isValid && !!this._validationFailureReason;
  }
  get hasCustomError() {
    return !!this.customErrorMessage;
  }
  get showOutOfStock() {
    return this._isOutOfStock && !this.hideOutOfStock;
  }
  get showValidationError() {
    return this.hasValidationError && !this._isOutOfStock;
  }
  get isDisabled() {
    return this.disabled || this._isOutOfStock;
  }
  get showNotification() {
    return !this.hideNotifications;
  }
  get hasError() {
    return this.hasCustomError || this.showOutOfStock || this.showValidationError;
  }
  get computedClasses() {
    const classes = 'slds-p-top_x-small slds-text-align_left slds-m-right_small';
    if (this.hasError) {
      return `${classes} slds-text-color_error`;
    }
    return `${classes} slds-hide`;
  }
  get ariaDescribedByLabel() {
    return `common-quantity-selector-${this.dataId}`;
  }
  get notificationText() {
    const errorLabel = this.hasValidationError ? errorLabels[this._validationFailureReason] : errorLabels[ERROR_RANGE_UNDERFLOW];
    if (this.customErrorMessage) {
      return this.customErrorMessage;
    }
    if (this._isOutOfStock) {
      return this.outOfStockText || outOfStockDefaultLabel;
    }
    return errorLabel.replace('{min}', `${this.rulesAsNumbers.minimum}`).replace('{max}', `${this.ruleOrInventoryMaximum}`).replace('{step}', `${this.rulesAsNumbers.step}`);
  }
  determineOutOfStock() {
    const inventory = this._availableQuantity;
    const min = this.rulesAsNumbers.minimum;
    const step = this.rulesAsNumbers.step;
    let newOutOfStock = false;
    if (inventory != null) {
      newOutOfStock = inventory === 0 || inventory < min || inventory < step;
    }
    if (newOutOfStock !== this._isOutOfStock) {
      this._isOutOfStock = newOutOfStock;
    }
  }
  handleQuantityChanged(e) {
    e.stopPropagation();
    const detail = e.detail;
    if (detail) {
      this.dispatchEvent(new CustomEvent(VALUE_CHANGED_EVT, {
        bubbles: true,
        composed: true,
        detail: {
          value: detail.value,
          lastValue: detail.lastValue,
          isValid: detail.isValid
        }
      }));
    }
  }
  handleValidityChanged(e) {
    e.stopPropagation();
    const detail = e.detail;
    if (detail) {
      this._isValid = detail.isValid;
      this._validationFailureReason = detail.reason;
    }
    this.dispatchEvent(new CustomEvent(VALIDITY_CHANGED_EVT, {
      bubbles: true,
      composed: true,
      detail: {
        ...e.detail,
        description: this.notificationText
      }
    }));
  }
}