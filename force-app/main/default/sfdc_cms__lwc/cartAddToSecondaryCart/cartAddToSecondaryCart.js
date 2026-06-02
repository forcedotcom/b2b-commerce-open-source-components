import { api, LightningElement, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { createCartsGetAction, createCartItemAddAction, dispatchAction } from 'commerce/actionApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import { addToSecondaryCart, addToSecondaryCartFailureToast, addToSecondaryCartSuccessToast, fetchSecondaryCartsErrorLine1, fetchSecondaryCartsErrorLine2, fetchSecondaryCartsLoading, fetchSecondaryCartsNoResult, itemsLabel } from './labels';
import { MAX_SECONDARY_CARTS } from './constants';
import { getCartCountByType, getCartMenuLabel, getTruncatedName, showAddToSecondaryCartErrorToast, showAddToSecondaryCartSuccessToast } from './utils';
export { MAX_NAME_LENGTH, MAX_SECONDARY_CARTS, TRAILING_DOTS } from './constants';
export { getCartCountByType, getCartMenuLabel, getTruncatedName, showSecondaryCartErrorToast } from './utils';
export default class CartAddToSecondaryCart extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @api
  disabled;
  @api
  productId;
  @api
  quantity;
  @api
  productName;
  @api
  showItemCount = false;
  @api
  countType;
  @wire(SessionContextAdapter)
  sessionContext;
  secondaryCarts = [];
  _isMenuPopulated = false;
  _hasFetchError = false;
  _hasUserOpenedSecondaryMenu = false;
  get _addToSecondaryCartLabel() {
    return addToSecondaryCart;
  }
  get _fetchSecondaryCartsNoResultLabel() {
    return fetchSecondaryCartsNoResult;
  }
  get _fetchSecondaryCartsErrorLine1Label() {
    return fetchSecondaryCartsErrorLine1;
  }
  get _fetchSecondaryCartsErrorLine2Label() {
    return fetchSecondaryCartsErrorLine2;
  }
  get _fetchSecondaryCartsLoadingLabel() {
    return fetchSecondaryCartsLoading;
  }
  get _showLoading() {
    return !this._isMenuPopulated;
  }
  get _showFetchError() {
    return this._isMenuPopulated && this._hasFetchError;
  }
  get _hasNoSecondaryCarts() {
    return this._isMenuPopulated && !this._hasFetchError && this.secondaryCarts.length === 0;
  }
  get _hasSecondaryCarts() {
    return this._isMenuPopulated && !this._hasFetchError && this.secondaryCarts.length > 0;
  }
  get _showAssistiveErrorMirror() {
    return this._hasUserOpenedSecondaryMenu && this._showFetchError;
  }
  get _assistiveErrorStatusText() {
    return `${this._fetchSecondaryCartsErrorLine1Label} ${this._fetchSecondaryCartsErrorLine2Label}`.trim();
  }
  get _showAssistivePoliteMirror() {
    return this._hasUserOpenedSecondaryMenu && (this._showLoading || this._hasNoSecondaryCarts);
  }
  get _assistivePoliteStatusText() {
    if (this._showLoading) {
      return this._fetchSecondaryCartsLoadingLabel;
    } else if (this._hasNoSecondaryCarts) {
      return this._fetchSecondaryCartsNoResultLabel;
    }
    return '';
  }
  formatToastMessage(messageTemplate, productName, cartName) {
    return messageTemplate.replace('{0}', productName).replace('{1}', cartName);
  }
  populateSecondaryCartMenuItems() {
    this._isMenuPopulated = false;
    const payload = {
      pageSize: MAX_SECONDARY_CARTS + 1
    };
    dispatchAction(this, createCartsGetAction(payload), {
      onSuccess: data => {
        const carts = Array.isArray(data?.carts) ? data.carts : [];
        const showItemCount = this.showItemCount !== false;
        this.secondaryCarts = carts.filter(cart => cart.isSecondary === true).slice(0, MAX_SECONDARY_CARTS).map(cart => {
          const count = getCartCountByType(this.countType, cart.totalProductCount, cart.uniqueProductCount);
          return {
            id: cart.cartId,
            name: cart.name,
            label: getCartMenuLabel(getTruncatedName(cart.name), count, itemsLabel, showItemCount)
          };
        });
        this._hasFetchError = false;
        this._isMenuPopulated = true;
      },
      onError: () => {
        this.secondaryCarts = [];
        this._hasFetchError = true;
        this._isMenuPopulated = true;
      }
    });
  }
  handleSecondaryCartMenuOpen(event) {
    const isLoggedIn = this.sessionContext?.data?.isLoggedIn;
    if (!isLoggedIn) {
      event.preventDefault();
      event.stopPropagation();
      this.navigateToLogin();
      return;
    }
    this._hasUserOpenedSecondaryMenu = true;
    this.populateSecondaryCartMenuItems();
  }
  handleAddToSecondaryCart(event) {
    const cartId = event?.detail?.value;
    const productId = this.productId;
    if (!cartId || !productId) {
      return;
    }
    const selectedCart = this.secondaryCarts.find(cart => cart.id === cartId);
    const selectedCartName = getTruncatedName(selectedCart?.name);
    const selectedProductName = getTruncatedName(this.productName);
    const addItemPayload = {
      quantity: this.quantity,
      options: {
        cartId
      }
    };
    dispatchAction(this, createCartItemAddAction(productId, addItemPayload), {
      onSuccess: () => {
        showAddToSecondaryCartSuccessToast(this.formatToastMessage(addToSecondaryCartSuccessToast, selectedProductName, selectedCartName), this);
      },
      onError: () => {
        showAddToSecondaryCartErrorToast(this.formatToastMessage(addToSecondaryCartFailureToast, selectedProductName, selectedCartName), this);
      }
    });
  }
  navigateToLogin() {
    this.navContext && navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
}