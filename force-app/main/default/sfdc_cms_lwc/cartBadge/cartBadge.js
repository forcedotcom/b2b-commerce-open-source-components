import { api, LightningElement, wire } from 'lwc';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import MiniCartPanel from 'site/cartMinicartpanel';
import { CartAdapter, onAddItemsToCart, onAddItemToCart } from 'commerce/checkoutCartApi';
import { DEFAULTS, MAX_CART_ITEMS_COUNT } from './constants';
import badgeLabelGenerator from './badgeLabelGenerator';
import { successfullyAddedToCartPopupMessage, miniCartDefaultHeaderText, miniCartDefaultCheckoutButtonText, miniCartDefaultContinueShoppingButtonText, miniCartDefaultViewCartButtonText } from './labels';
import { handleAddToCartSuccessWithToast } from 'site/productAddToCartUtils';
export default class CartBadge extends LightningElement {
  static renderMode = 'light';
  miniCartPanelConstructor;
  addItemToCartActionSubscription;
  addItemsToCartActionSubscription;
  displayMiniCart = false;
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
  @wire(AppContextAdapter)
  appContext;
  @wire(SessionContextAdapter)
  sessionContext;
  get _showBadge() {
    return Boolean(this.appContext?.data?.guestCartEnabled !== undefined && this.sessionContext?.data?.isLoggedIn !== undefined || this.appContext?.error || this.sessionContext?.error);
  }
  get _miniCartEnabled() {
    return this.showMiniCart && Boolean(this.sessionContext?.data?.isLoggedIn || this.appContext?.data?.guestCartEnabled);
  }
  @wire(CartAdapter)
  cart;
  get _countType() {
    return this.countType === 'UniqueProductCount' ? 'Unique' : 'Total';
  }
  get _totalCartCount() {
    return this.cart?.data ? this.setTotalCartCount(this._countType, this.cart.data) : DEFAULTS.totalCartCount;
  }
  get badgeItemsCount() {
    return badgeLabelGenerator(this._totalCartCount, MAX_CART_ITEMS_COUNT);
  }
  get _headerText() {
    return this.headerText ? this.headerText : miniCartDefaultHeaderText;
  }
  get _checkoutButtonText() {
    return this.checkoutButtonText ? this.checkoutButtonText : miniCartDefaultCheckoutButtonText;
  }
  get _viewCartButtonText() {
    return this.viewCartButtonText ? this.viewCartButtonText : miniCartDefaultViewCartButtonText;
  }
  get _continueShoppingButtonText() {
    return this.continueShoppingButtonText ? this.continueShoppingButtonText : miniCartDefaultContinueShoppingButtonText;
  }
  setTotalCartCount(countType, data) {
    let total = 0;
    if (countType === 'Total') {
      total = Number(data.cartSummary?.totalProductCount);
    } else if (countType === 'Unique') {
      total = Number(data.cartSummary?.uniqueProductCount);
    }
    if (isNaN(total)) {
      total = 0;
    }
    return total;
  }
  connectedCallback() {
    const preActionHandler = this.handlePreItemAdded.bind(this);
    const postSuccessActionHandler = this.handlePostItemAdded.bind(this);
    this.addItemToCartActionSubscription = onAddItemToCart(preActionHandler, postSuccessActionHandler);
    this.addItemsToCartActionSubscription = onAddItemsToCart(preActionHandler, postSuccessActionHandler);
  }
  disconnectedCallback() {
    this.addItemToCartActionSubscription?.unsubscribe();
    this.addItemsToCartActionSubscription?.unsubscribe();
  }
  handlePreItemAdded() {
    this._miniCartEnabled && this.loadAndDisplayMiniCart();
  }
  handleOpenMiniCart() {
    this._miniCartEnabled && this.loadAndDisplayMiniCart();
  }
  handleCloseMiniCart() {
    this.displayMiniCart = false;
  }
  async handlePostItemAdded(action) {
    if (!this._miniCartEnabled) {
      const payload = action.payload;
      if (action.type !== 'ACTION_CART_ITEMS_ADD' || !payload.hasErrors) {
        handleAddToCartSuccessWithToast(successfullyAddedToCartPopupMessage, this);
      }
    }
  }
  loadAndDisplayMiniCart() {
    if (this.miniCartPanelConstructor) {
      this.displayMiniCart = true;
    } else {
      this.miniCartPanelConstructor = MiniCartPanel;
      this.displayMiniCart = true;
    }
  }
}