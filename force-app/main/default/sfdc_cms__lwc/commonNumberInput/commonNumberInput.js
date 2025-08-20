import { api, LightningElement } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import { decrementAltText, incrementAltText, inputAriaLabel } from './labels';
import { getLocale, getDecimalSeparator, getGroupingSeparator } from './locale';
import { numberFormattedValue, findReason, first, isLessThanOrEqual } from './utils';
import BasePath from '@salesforce/community/basePath';
export const VALUE_CHANGED_EVT = 'valuechanged';
export const VALIDITY_CHANGED_EVT = 'validitychanged';
export const ERROR_RANGE_OVERFLOW = 'rangeOverflow';
export const ERROR_RANGE_UNDERFLOW = 'rangeUnderflow';
export const STEP_MISMATCH = 'stepMismatch';
export const PATTERN_MISMATCH = 'patternMismatch';
export { stringOnlyHasNumbers } from './utils';
const generateRandomId = (() => {
  let lastId = 0;
  return () => crypto?.randomUUID?.() || String(++lastId);
})();
const MAX_DECIMAL_DIGITS = 20;
export default class CommonNumberInput extends LightningElement {
  static renderMode = 'light';
  _min;
  _max;
  _step;
  _isValid = true;
  _validationFailureReason = '';
  _displayedInput = null;
  _hiddenInput = null;
  _internalValue;
  _displayValue;
  _customValidity;
  i18n = {
    decrementAltText,
    incrementAltText,
    inputAriaLabel
  };
  dataId = '';
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
  hideButtons = false;
  @api
  hideLabel = false;
  @api
  disabled = false;
  @api
  fieldLabel;
  @api
  fieldDescribedBy;
  @api
  get customValidity() {
    return this._customValidity;
  }
  set customValidity(val) {
    this._customValidity = val;
  }
  @api
  get min() {
    return this._min;
  }
  set min(value) {
    this._min = value;
    if ((value === 0 || value) && this._internalValue && this.hiddenInput) {
      this.hiddenInput.min = value.toString();
      this.validateAndDispatch(this._internalValue);
    }
  }
  @api
  get max() {
    return this._max;
  }
  set max(value) {
    this._max = value;
    if ((value === 0 || value) && this._internalValue && this.hiddenInput) {
      this.hiddenInput.max = value.toString();
      this.validateAndDispatch(this._internalValue);
    }
  }
  @api
  get step() {
    return this._step;
  }
  set step(value) {
    this._step = value;
    if ((value === 0 || value) && this._internalValue && this.hiddenInput) {
      this.hiddenInput.step = value.toString();
      this.validateAndDispatch(this._internalValue);
    }
  }
  @api
  get value() {
    return this._internalValue;
  }
  set value(value) {
    if (typeof value === 'number' && !isNaN(value) && value !== this._internalValue) {
      this._displayValue = this.formatValue(value);
      this._internalValue = Number(value);
      if (this.hiddenInput) {
        this.validateAndDispatch(value);
      }
    }
  }
  renderedCallback() {
    this._displayedInput = this.refs?.displayedInput;
    this._hiddenInput = this.refs?.hiddenInput;
    if (this._hiddenInput && !this._hiddenInput.hasAttribute('data-initialized')) {
      const params = [[this.min, 'min'], [this.max, 'max'], [this.step, 'step'], [this._internalValue, 'value']];
      params.forEach(([param, name]) => {
        if ((param === 0 || param) && this._hiddenInput && name) {
          this._hiddenInput[name] = param.toString();
        }
      });
      this._hiddenInput.setAttribute('data-initialized', 'true');
      this.validateAndDispatch(this._internalValue);
    }
  }
  get minOrDefault() {
    return this.min ?? Number.MIN_SAFE_INTEGER;
  }
  get maxOrDefault() {
    return this.max ?? Number.MAX_SAFE_INTEGER;
  }
  get pattern() {
    return `[+\\-]?(\\d*[${getGroupingSeparator()}]?)*[${getDecimalSeparator()}]?\\d*`;
  }
  get isIncrementButtonDisabled() {
    return this.disabled || isLessThanOrEqual(Number(this.value), Number(this.maxOrDefault));
  }
  get isDecrementButtonDisabled() {
    return this.disabled || isLessThanOrEqual(Number(this.minOrDefault), Number(this.value));
  }
  get displayedInput() {
    return this._displayedInput;
  }
  get hiddenInput() {
    return this._hiddenInput;
  }
  get formattedValue() {
    return this._displayValue ?? '';
  }
  get labelOrAriaLabel() {
    return this.fieldLabel ?? this.i18n.inputAriaLabel;
  }
  get ariaDescribedByLabel() {
    return this.fieldDescribedBy ?? this.dataId;
  }
  get randomId() {
    return `displayed-input-${this.dataId}`;
  }
  get spanClasses() {
    const classes = ['slds-grid'];
    if (!this.disabled && (this.isInvalid || this.customValidity)) {
      classes.push('error');
    }
    return classes.join(' ');
  }
  get inputStyles() {
    return generateStyleProperties({
      'border-radius': !this.hideButtons ? 0 : ''
    });
  }
  get isInvalid() {
    return !this._isValid;
  }
  get addIconPath() {
    return `${BasePath}/assets/icons/add.svg#add`;
  }
  get dashIconPath() {
    return `${BasePath}/assets/icons/dash.svg#dash`;
  }
  modifyValue(modifier) {
    const lastValue = this.value;
    if (modifier) {
      modifier();
    }
    this._internalValue = Number(this.hiddenInput?.value);
    this._displayValue = this.formatValue(Number(this.hiddenInput?.value));
    const detail = {
      isValid: true,
      reason: undefined,
      value: Number(this._internalValue),
      lastValue: Number(lastValue)
    };
    this.dispatchEvents(detail);
    this._isValid = true;
  }
  decrement() {
    const modifier = this.hiddenInput?.stepDown.bind(this.hiddenInput);
    this.modifyValue(modifier);
  }
  increment() {
    const modifier = this.hiddenInput?.stepUp.bind(this.hiddenInput);
    this.modifyValue(modifier);
  }
  handleInputChange(event) {
    const lastValue = this._internalValue;
    const value = event?.target.value;
    const detail = {};
    let {
      reason,
      isValid
    } = this.validate(value, this.displayedInput);
    this._displayValue = value;
    if (!isValid) {
      detail.reason = reason;
      detail.isValid = isValid;
      detail.value = NaN;
      detail.lastValue = Number(lastValue);
    }
    if (isValid) {
      const numberValue = numberFormattedValue(value, getDecimalSeparator(), getGroupingSeparator());
      this._displayValue = this.formatValue(Number(numberValue));
      this._internalValue = numberValue;
      ({
        reason,
        isValid
      } = this.validate(numberValue, this.hiddenInput));
      detail.reason = reason;
      detail.isValid = isValid;
      detail.value = Number(numberValue);
      detail.lastValue = Number(lastValue);
    }
    this.dispatchEvents(detail);
    this._isValid = isValid;
    this._validationFailureReason = reason;
  }
  dispatchEvents(detail) {
    const isValidChanged = detail.isValid !== this._isValid;
    const reasonChanged = detail.reason !== this._validationFailureReason;
    if (isValidChanged || reasonChanged) {
      this.dispatch(VALIDITY_CHANGED_EVT, {
        isValid: detail.isValid,
        reason: detail.reason
      });
    }
    this.dispatch(VALUE_CHANGED_EVT, {
      value: detail.value,
      lastValue: detail.lastValue,
      isValid: detail.isValid
    });
  }
  dispatch(event, detail) {
    if (!import.meta.env.SSR) {
      this.dispatchEvent(new CustomEvent(event, {
        bubbles: true,
        composed: true,
        detail
      }));
    }
  }
  validate(value, inputField) {
    if (value === 0 || value) {
      inputField.value = value.toString();
    }
    const reason = first(findReason(inputField?.validity), 'valid');
    const isValid = reason === 'valid';
    return {
      reason,
      isValid
    };
  }
  validateAndDispatch(value) {
    const {
      isValid,
      reason
    } = this.validate(value, this.hiddenInput);
    if (isValid !== this._isValid) {
      this.dispatch(VALIDITY_CHANGED_EVT, {
        value,
        reason,
        isValid
      });
    }
    this._isValid = isValid;
  }
  formatValue(unformatted) {
    return unformatted.toLocaleString(getLocale(), {
      maximumFractionDigits: MAX_DECIMAL_DIGITS
    });
  }
}