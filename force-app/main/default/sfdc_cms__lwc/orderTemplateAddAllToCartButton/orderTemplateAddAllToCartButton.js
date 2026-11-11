import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { createCartsGetAction, dispatchAction } from 'commerce/actionApi';
import { getTruncatedName } from './utils';
import Toast from 'site/commonToast';
import { SessionContextAdapter, AppContextAdapter } from 'commerce/contextApi';
import OrderTemplateAddAllToCartModal from 'site/orderTemplateAddAllToCartModal';
import { addToCartButtonLabel, addAllToCartEmptyToast, fetchCartsLoading, fetchCartsNoResult, fetchCartsError } from './labels';
import { MAX_CARTS_DISPLAYED } from './constants';
const CART_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Current_Cart'
  }
};
const MODAL_SIZE = 'small';
const BUTTON_STYLE_TO_MENU_VARIANT = {
  primary: 'border-filled',
  secondary: 'border',
  tertiary: 'bare'
};
const BUTTON_STYLE_TO_BUTTON_VARIANT = {
  primary: 'brand',
  secondary: 'brand-outline',
  tertiary: 'neutral'
};
export default class OrderTemplateAddAllToCartButton extends LightningElement {
  static renderMode = 'light';
  _navContext;
  @wire(NavigationContext)
  navigationContextHandler(navContext) {
    this._navContext = navContext;
  }
  @wire(SessionContextAdapter)
  sessionContext;
  @wire(AppContextAdapter)
  appContext;
  @api
  orderTemplateSummaryData;
  @api
  addAllToCartButtonLabel;
  @api
  variant;
  carts = [];
  _isMenuPopulated = false;
  _hasFetchError = false;
  _hasUserOpenedMenu = false;
  _politeStatusText = '';
  get isMultiCartEnabled() {
    return Boolean(this.appContext?.data?.commerceMultiCartEnabled);
  }
  get _menuVariant() {
    return BUTTON_STYLE_TO_MENU_VARIANT[this.variant ?? ''] ?? 'border';
  }
  get _buttonVariant() {
    return BUTTON_STYLE_TO_BUTTON_VARIANT[this.variant ?? ''] ?? 'brand-outline';
  }
  get _addAllToCartButtonLabelText() {
    return this.addAllToCartButtonLabel || addToCartButtonLabel;
  }
  get _showLoading() {
    return !this._isMenuPopulated;
  }
  get _showFetchError() {
    return this._isMenuPopulated && this._hasFetchError;
  }
  get _hasNoCarts() {
    return this._isMenuPopulated && !this._hasFetchError && this.carts.length === 0;
  }
  get _hasCarts() {
    return this._isMenuPopulated && !this._hasFetchError && this.carts.length > 0;
  }
  get _fetchCartsLoadingLabel() {
    return fetchCartsLoading;
  }
  get _fetchCartsNoResultLabel() {
    return fetchCartsNoResult;
  }
  get _fetchCartsErrorLabel() {
    return fetchCartsError;
  }
  get _showAssistiveErrorMirror() {
    return this._hasUserOpenedMenu && this._showFetchError;
  }
  populateCartMenuItems() {
    this._isMenuPopulated = false;
    this._politeStatusText = fetchCartsLoading;
    const payload = {
      pageSize: MAX_CARTS_DISPLAYED
    };
    dispatchAction(this, createCartsGetAction(payload), {
      onSuccess: data => {
        const allCarts = Array.isArray(data?.carts) ? data.carts : [];
        this.carts = allCarts.slice(0, MAX_CARTS_DISPLAYED).map(cart => ({
          id: cart.cartId,
          name: cart.name,
          label: getTruncatedName(cart.name)
        }));
        this._hasFetchError = false;
        this._isMenuPopulated = true;
        this._politeStatusText = this.carts.length === 0 ? fetchCartsNoResult : '';
      },
      onError: () => {
        this.carts = [];
        this._hasFetchError = true;
        this._isMenuPopulated = true;
        this._politeStatusText = '';
      }
    });
  }
  handleCartMenuOpen(event) {
    const isLoggedIn = this.sessionContext?.data?.isLoggedIn;
    if (!isLoggedIn) {
      event.preventDefault();
      event.stopPropagation();
      this.navigateToLogin();
      return;
    }
    this._hasUserOpenedMenu = true;
    this.populateCartMenuItems();
  }
  handleAddAllToCart(event) {
    const cartId = event?.detail?.value;
    if (!cartId) {
      return;
    }
    this.performAddAllToCart(cartId);
  }
  handleSingleCartClick() {
    const isLoggedIn = this.sessionContext?.data?.isLoggedIn;
    if (!isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    this.performAddAllToCart();
  }
  async performAddAllToCart(cartId) {
    const wishlistId = this.orderTemplateSummaryData?.id;
    if (!wishlistId) {
      return;
    }
    if (!this.orderTemplateSummaryData?.wishlistProductCount) {
      Toast.show({
        label: addAllToCartEmptyToast,
        variant: 'error'
      }, this);
      return;
    }
    const result = await OrderTemplateAddAllToCartModal.open({
      size: MODAL_SIZE,
      wishlistId,
      cartId
    });
    if (result?.action === 'viewcart') {
      this.handleViewCart(result.cartId);
    }
  }
  handleViewCart(cartId) {
    if (!this._navContext) {
      return;
    }
    if (cartId && this.isMultiCartEnabled) {
      navigate(this._navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Current_Cart'
        },
        state: {
          recordId: cartId
        }
      });
    } else {
      navigate(this._navContext, CART_PAGE_REF);
    }
  }
  navigateToLogin() {
    this._navContext && navigate(this._navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
}