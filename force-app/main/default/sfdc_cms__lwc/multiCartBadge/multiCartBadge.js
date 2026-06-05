import { LightningElement, api, wire } from 'lwc';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
export default class MultiCartBadge extends LightningElement {
  static renderMode = 'light';
  @api
  showCount = false;
  @api
  iconLinkColor;
  @api
  iconLinkHoverColor;
  @api
  countType;
  @api
  showMiniCartProperties = false;
  @api
  showMiniCart = false;
  @api
  headerText;
  @api
  checkoutButtonText;
  @api
  checkoutButtonSize;
  @api
  showContinueShoppingButton = false;
  @api
  continueShoppingButtonText;
  @api
  continueShoppingButtonSize;
  @api
  showExpressCheckoutButton = false;
  @api
  useManualCapture = false;
  @api
  paymentMethodSetId;
  @api
  showViewCartButton = false;
  @api
  viewCartButtonText;
  @api
  viewCartButtonSize;
  @api
  recommendationHeaderText;
  @api
  recommendationPriceDisplayType;
  @api
  showRecommendation = false;
  @api
  showCartDropdown = false;
  @api
  defaultPillLabel = 'Default';
  @wire(AppContextAdapter)
  appContext;
  @wire(SessionContextAdapter)
  sessionContext;
  get _showCartsList() {
    return Boolean(this.appContext?.data?.commerceMultiCartEnabled && this.sessionContext?.data?.isLoggedIn && !this.showMiniCart && this.showCartDropdown);
  }
}