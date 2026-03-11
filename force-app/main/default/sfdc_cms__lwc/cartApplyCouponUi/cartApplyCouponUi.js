import { api, LightningElement } from 'lwc';
import labels from './labels';
import { COUPON_APPLY_EVENT, VALUE_CHANGED_EVENT, ENTER_COUPON_ACTION_EVENT } from './constants';
import { debounce } from 'experience/utils';
import { getThemeVersion } from 'site/checkoutData';
export { COUPON_APPLY_EVENT };
const DEFAULT_THEME_VERSION = 2;
export const applyCouponInputLocator = '.coupon-code-input';
export default class CartApplyCouponUi extends LightningElement {
  static renderMode = 'light';
  _revealButtonClicked = false;
  @api
  showRevealButton = false;
  @api
  applyCouponButtonText;
  @api
  couponInputPlaceholderText;
  @api
  couponInputText;
  @api
  disableApplyCouponButton = false;
  @api
  errorMessage;
  couponInput;
  @api
  focusInput() {
    this.couponInput?.focus();
  }
  get _labels() {
    return labels;
  }
  get _couponInputPlaceholderText() {
    return this.couponInputPlaceholderText || this._labels.couponCodeInputPlaceHolderText;
  }
  handleCouponCodeChange(event) {
    const input = event?.target;
    const inputValue = input?.value;
    const detail = {};
    detail.value = inputValue;
    this.dispatchEvent(new CustomEvent(VALUE_CHANGED_EVENT, {
      bubbles: true,
      composed: true,
      detail
    }));
  }
  get revealButtonClass() {
    const classes = ['revealButton'];
    if (this.showInputForm) {
      classes.push('slds-hide');
    }
    return classes.join(' ');
  }
  get couponInputContainerClasses() {
    return `coupon-input-container slds-grid ${this.isInvalid ? 'error' : ''}`;
  }
  get showInputForm() {
    return this.showRevealButton && this._revealButtonClicked || !this.showRevealButton;
  }
  get hasError() {
    return this.isInvalid;
  }
  get isInvalid() {
    return !!this.errorMessage;
  }
  handleCouponButtonClick() {
    this.dispatchEvent(new CustomEvent(COUPON_APPLY_EVENT, {
      composed: true,
      bubbles: true
    }));
  }
  handleKeyup(event) {
    const code = event?.code;
    if (code === 'Enter') {
      this.dispatchEvent(new CustomEvent(ENTER_COUPON_ACTION_EVENT, {
        bubbles: true,
        composed: true
      }));
    }
  }
  _focusOnReveal = debounce(() => {
    this.focusInput();
  }, 100);
  handleRevealButtonClick() {
    this._focusOnReveal();
    this._revealButtonClicked = true;
  }
  get themeVersion() {
    let theme;
    if (!import.meta.env.SSR && (theme = getThemeVersion())) {
      return theme;
    }
    return DEFAULT_THEME_VERSION;
  }
  get inputVariant() {
    return this.themeVersion >= 2 ? 'standard' : 'label-hidden';
  }
  get buttonVariant() {
    return this.themeVersion >= 2 ? 'secondary' : 'primary';
  }
  get placeHolderText() {
    return this.themeVersion >= 2 ? '' : this.couponInputPlaceholderText;
  }
  renderedCallback() {
    this.couponInput = this.refs.couponInput;
  }
}