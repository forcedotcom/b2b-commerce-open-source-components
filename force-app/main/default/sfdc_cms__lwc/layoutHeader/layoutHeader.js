import { api, LightningElement, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import { FORM_FACTOR_LARGE, FORM_FACTOR_MEDIUM, FORM_FACTOR_SMALL, getFormFactor } from 'experience/clientApi';
const formFactorToLayoutMap = new Map([[FORM_FACTOR_SMALL, 'mobile'], [FORM_FACTOR_MEDIUM, 'tablet'], [FORM_FACTOR_LARGE, 'desktop']]);

/**
 * @slot promoBanner
 * @slot storeLogo
 * @slot navigation
 * @slot searchInput
 * @slot shopperCopilot
 * @slot myAccount
 * @slot wishlist
 * @slot cart
 */
export default class LayoutHeader extends LightningElement {
  static renderMode = 'light';
  _formFactor;
  _pendingFormFactor;
  _pendingTimeout;
  _isConnected = false;
  _showCopilotShortcut = false;
  @wire(AppContextAdapter)
  wireAppContext({
    data
  }) {
    this._showCopilotShortcut = Boolean(data?.shopperCopilotUIEnabled);
  }
  get showCopilotShortcut() {
    return this._showCopilotShortcut;
  }
  @wire(getFormFactor)
  wireFormFactor(formFactor) {
    this._pendingFormFactor = formFactor;
    if (this._pendingTimeout) {
      return;
    }
    const applyFormFactor = () => {
      this._formFactor = this._pendingFormFactor;
      this._pendingTimeout = undefined;
      this._pendingFormFactor = undefined;
    };
    if (this._isConnected && typeof window !== 'undefined') {
      this._pendingTimeout = setTimeout(applyFormFactor);
    } else {
      applyFormFactor();
    }
  }
  @api
  hidePromoBanner = false;
  @api
  hideWishlistShortcut = false;
  get layout() {
    if (this._pendingTimeout) {
      return undefined;
    }
    return formFactorToLayoutMap.get(this._formFactor) ?? 'desktop';
  }
  connectedCallback() {
    this._isConnected = true;
  }
  disconnectedCallback() {
    this._isConnected = false;
    this._pendingTimeout && clearTimeout(this._pendingTimeout);
    delete this._pendingTimeout;
  }
}