import { api, LightningElement, wire } from 'lwc';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import MiniCartPanel from 'site/cartMinicartpanel';
import { CartAdapter, onAddItemsToCart, onAddItemToCart, onAddConfigurationToCart, onUpdateConfigurationOnCart, onCartItemUpdate, onCartItemDelete, onCartDelete } from 'commerce/checkoutCartApi';
import { DEFAULTS, MAX_CART_ITEMS_COUNT } from './constants';
import badgeLabelGenerator from './badgeLabelGenerator';
import { successfullyAddedToCartPopupMessage, miniCartDefaultHeaderText, miniCartDefaultCheckoutButtonText, miniCartDefaultContinueShoppingButtonText, miniCartDefaultViewCartButtonText } from './labels';
import { getOptimisticDelta, getTotalCountFromCartData, isOptimisticCountEnabled, addAndFormatValues } from './utils';
import { handleAddToCartSuccessWithToast } from 'site/productAddToCartUtils';
export default class CartBadge extends LightningElement {
  static renderMode = 'light';
  miniCartPanelConstructor;
  addItemToCartActionSubscription;
  addItemsToCartActionSubscription;
  addConfigurationToCartSubscription;
  optimisticCountSubscriptions = [];
  optimisticTotalCount;
  displayMiniCart = false;
  wasSecondaryCartAction = false;
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
  showCartsList = false;
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
  defaultPillLabel;
  @api
  isB2bStore = false;
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
  get _isLoggedIn() {
    return Boolean(this.sessionContext?.data?.isLoggedIn);
  }
  cart;
  @wire(CartAdapter)
  cartHandler(response) {
    this.cart = response;
    if (this.optimisticTotalCount !== undefined && this.shouldUseOptimisticCount && !response.loading) {
      this.optimisticTotalCount = undefined;
    }
  }
  get _countType() {
    return this.countType === 'UniqueProductCount' ? 'Unique' : 'Total';
  }
  get _totalCartCount() {
    if (this.shouldUseOptimisticCount && this.optimisticTotalCount !== undefined) {
      return this.optimisticTotalCount;
    }
    return this.cart?.data ? this.setTotalCartCount(this._countType, this.cart.data) : DEFAULTS.totalCartCount;
  }
  get _cartId() {
    return this.cart?.data?.cartSummary?.cartId;
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
    const preAddConfigurationActionHandler = this.handlePreAddConfiguration.bind(this);
    const postAddConfigurationActionHandler = this.handlePostAddConfiguration.bind(this);
    this.addItemToCartActionSubscription = onAddItemToCart(preActionHandler, postSuccessActionHandler);
    this.addItemsToCartActionSubscription = onAddItemsToCart(preActionHandler, postSuccessActionHandler);
    this.addConfigurationToCartSubscription = onAddConfigurationToCart(preAddConfigurationActionHandler, postAddConfigurationActionHandler);
    this.subscribeOptimisticCountUpdates();
  }
  disconnectedCallback() {
    this.addItemToCartActionSubscription?.unsubscribe();
    this.addItemsToCartActionSubscription?.unsubscribe();
    this.addConfigurationToCartSubscription?.unsubscribe();
    this.optimisticCountSubscriptions.forEach(sub => sub?.unsubscribe());
    this.optimisticCountSubscriptions = [];
  }
  isSecondaryCartAction(action, calledFromPostHook) {
    const payload = action?.payload;
    const actionCartId = payload?.options?.cartId || payload?.cartId;
    if (!actionCartId || actionCartId === 'current') {
      return false;
    }
    const badgeCartId = this.cart?.data?.cartSummary?.cartId;
    if (!badgeCartId && actionCartId !== 'current' && (calledFromPostHook ?? false)) {
      return this.wasSecondaryCartAction;
    }
    return actionCartId !== badgeCartId;
  }
  handlePreItemAdded(action) {
    this.wasSecondaryCartAction = this.isSecondaryCartAction(action);
    if (this.wasSecondaryCartAction || !this._miniCartEnabled) {
      return;
    }
    this.loadAndDisplayMiniCart();
  }
  handleOpenMiniCart() {
    this._miniCartEnabled && this.loadAndDisplayMiniCart();
  }
  handleCloseMiniCart() {
    this.displayMiniCart = false;
  }
  handlePreAddConfiguration() {
    if (this._miniCartEnabled && !this.miniCartPanelConstructor) {
      this.miniCartPanelConstructor = MiniCartPanel;
    }
  }
  handlePostAddConfiguration(action) {
    if (this._miniCartEnabled) {
      this.displayMiniCart = true;
    }
    this.handlePostItemAdded(action);
  }
  handlePostItemAdded(action) {
    if (this.isSecondaryCartAction(action, true)) {
      return;
    }
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
  get shouldUseOptimisticCount() {
    return isOptimisticCountEnabled(this._countType);
  }
  subscribeOptimisticCountUpdates() {
    if (!this.shouldUseOptimisticCount) {
      return;
    }
    const handler = (action, state) => {
      this.handleOptimisticCountUpdate(action, state);
    };
    this.optimisticCountSubscriptions = [onAddItemToCart(handler), onAddConfigurationToCart(handler), onUpdateConfigurationOnCart(handler), onCartItemDelete(handler), onCartItemUpdate(handler), onCartDelete(handler)];
  }
  handleOptimisticCountUpdate(action, state) {
    if (!this.shouldUseOptimisticCount) {
      return;
    }
    if (this.isSecondaryCartAction(action)) {
      return;
    }
    if (action.type === 'ACTION_CART_DELETE') {
      this.optimisticTotalCount = DEFAULTS.totalCartCount;
      return;
    }
    const delta = getOptimisticDelta(action, state);
    if (delta === null || delta === 0 || Number.isNaN(delta)) {
      return;
    }
    const baseCount = this.optimisticTotalCount !== undefined ? this.optimisticTotalCount : getTotalCountFromCartData(this.cart?.data, DEFAULTS.totalCartCount);
    const nextCount = Number(addAndFormatValues(baseCount, delta));
    if (Number.isNaN(nextCount)) {
      return;
    }
    this.optimisticTotalCount = nextCount < 0 ? 0 : nextCount;
  }
}