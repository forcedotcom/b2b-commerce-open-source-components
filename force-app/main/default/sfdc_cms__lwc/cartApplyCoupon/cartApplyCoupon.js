import { api, LightningElement } from 'lwc';
import { getErrorInfo } from 'site/cartFailedActionEvaluator';
import labels from './labels';
import { createCouponApplyAction, dispatchAction } from 'commerce/actionApi';
import { generateStyleProperties } from 'experience/styling';
/**
 * @slot revealButton
 */
export default class CartApplyCoupon extends LightningElement {
  static renderMode = 'light';
  _isValid = false;
  _errorMessage;
  _applyingChanges = false;
  _couponInputValue = '';
  _disableApplyButton = false;
  @api
  showRevealButton = false;
  @api
  applyCouponButtonText;
  @api
  applyCouponButtonProcessingText;
  @api
  applyCouponButtonTextColor;
  @api
  applyCouponButtonTextHoverColor;
  @api
  applyCouponButtonBackgroundColor;
  @api
  applyCouponButtonBackgroundHoverColor;
  @api
  applyCouponButtonBorderColor;
  @api
  applyCouponButtonBorderRadius;
  @api
  couponInputPlaceholderText;
  @api
  couponInputBorderRadius;
  @api
  couponInputBackgroundColor;
  @api
  couponInputTextColor;
  applyCoupon;
  get disableApplyCouponButton() {
    return this._applyingChanges || this._disableApplyButton || this.inputFormIsEmpty || !this._isValid;
  }
  get inputFormIsEmpty() {
    return this._couponInputValue ? !this._couponInputValue.trim() : !this._couponInputValue;
  }
  get couponInputValue() {
    return this._couponInputValue;
  }
  get errorMessage() {
    return this._errorMessage;
  }
  get computedApplyCouponButtonText() {
    return this._applyingChanges ? this.applyCouponButtonProcessingText : this.applyCouponButtonText;
  }
  get applyCouponCssStyles() {
    const styles = [{
      name: '--com-c-cart-text-input-background-color',
      value: this.couponInputBackgroundColor
    }, {
      name: '--com-c-cart-text-input-font-color',
      value: this.couponInputTextColor
    }, {
      name: '--com-c-cart-text-input-border-radius',
      value: this.couponInputBorderRadius,
      suffix: 'px'
    }, {
      name: '--com-c-button-color',
      value: this.applyCouponButtonTextColor
    }, {
      name: '--com-c-button-color-hover',
      value: this.applyCouponButtonTextHoverColor
    }, {
      name: '--com-c-button-color-background',
      value: this.applyCouponButtonBackgroundColor
    }, {
      name: '--com-c-button-color-background-hover',
      value: this.applyCouponButtonBackgroundHoverColor
    }, {
      name: '--com-c-button-radius-border',
      value: this.applyCouponButtonBorderRadius,
      suffix: 'px'
    }, {
      name: '--com-c-button-color-border',
      value: this.applyCouponButtonBorderColor
    }];
    return generateStyleProperties(styles);
  }
  clear() {
    this._errorMessage = '';
    this._couponInputValue = '';
  }
  handleInputChange(event) {
    const detail = event.detail;
    if (detail) {
      this._couponInputValue = detail.value;
    }
    this._isValid = false;
    this._errorMessage = '';
    if (this._couponInputValue) {
      this._isValid = true;
    }
  }
  handleApplyCoupon() {
    if (this._isValid && this._couponInputValue) {
      this.applyCartCoupon(this._couponInputValue);
    }
  }
  applyCartCoupon(couponCode) {
    this._applyingChanges = true;
    dispatchAction(this, createCouponApplyAction(couponCode), {
      onSuccess: () => {
        this.clear();
        this._applyingChanges = false;
      },
      onError: error => {
        if (error?.[0]?.message) {
          this._errorMessage = error?.[0]?.message;
        } else {
          const code = error?.errors?.[0]?.type;
          const failureMessageFromApi = error?.errors?.[0]?.message;
          if (failureMessageFromApi) {
            this._errorMessage = failureMessageFromApi?.replace('{code}', couponCode);
          } else {
            const errorInfo = getErrorInfo(code, this.applyCouponLocalizedErrorMessages);
            const failureMessage = errorInfo?.message?.replace('{code}', couponCode);
            this._errorMessage = failureMessage;
          }
        }
        this._applyingChanges = false;
        this.applyCoupon?.focusInput();
      }
    });
  }
  get applyCouponLocalizedErrorMessages() {
    return {
      webstoreNotFound: labels.webstoreNotFound,
      effectiveAccountNotFound: labels.effectiveAccountNotFound,
      insufficientAccess: labels.insufficientAccess,
      maximumLimitExceeded: labels.maximumLimitExceeded,
      maximumCartItemLimitExceeded: labels.maximumCartItemLimitExceeded,
      alreadyApplied: labels.alreadyApplied,
      blockedExclusive: labels.blockedExclusive,
      unqualifiedCart: labels.unqualifiedCart,
      defaultErrorMessage: labels.defaultErrorMessage,
      invalidInput: labels.invalidInput,
      limitExceeded: labels.maximumLimitExceeded,
      gateDisabled: '',
      tooManyRecords: '',
      itemNotFound: '',
      missingRecord: '',
      invalidBatchSize: ''
    };
  }
  renderedCallback() {
    this.applyCoupon = this.refs.applyCoupon;
  }
}