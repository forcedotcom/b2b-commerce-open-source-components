import { LightningElement, wire, api } from 'lwc';
import { NavigationContext, generateUrl, navigate } from 'lightning/navigation';
import { CartStatusAdapter, cartStatusUpdate, getCarts } from 'commerce/checkoutCartApi';
import { AppContextAdapter } from 'commerce/contextApi';
import generateLabel from './textGenerator';
import { generateStyleProperties } from 'experience/styling';
import Toast from 'site/commonToast';
import { preserveGuestCartErrorTitle, preserveGuestCartErrorMessage, viewAllCartsLabel, itemsLabel, defaultCartLabel, loadingCartsLabel, loadCartsErrorLine1, loadCartsErrorLine2 } from './labels';
import BasePath from '@salesforce/community/basePath';
import { getCartMenuLabel, getTruncatedName } from 'site/cartAddToSecondaryCart';
import { MAX_CART_LIST_ITEMS, MAX_SECONDARY_CARTS_WITHOUT_PRIMARY, CART_LIST_PAGE_SIZE, VIEW_ALL_CARTS_MENU_VALUE } from './constants';
export default class CartBadgeUi extends LightningElement {
  static renderMode = 'light';
  _displayMiniCart = false;
  @api
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
  showMiniCart = false;
  @api
  showCartsList = false;
  @api
  isB2bStore = false;
  @api
  defaultPillLabel;
  @api
  cartId;
  @api
  isLoggedIn;
  get iconUrl() {
    return `${BasePath}/assets/icons/cart.svg#cart`;
  }
  get _cartsListIconStyle() {
    return `--cart-list-icon-url: url(${BasePath}/assets/images/cartBadgeWithChevron.svg)`;
  }
  get hasItems() {
    return this.totalCartCount ? this.totalCartCount > 0 : false;
  }
  get showBadge() {
    return this.showCount && this.hasItems;
  }
  get iconAssistiveText() {
    return generateLabel(this.countType, this.totalCartCount);
  }
  @api
  totalCartCount;
  @api
  badgeItemsCount;
  @wire(AppContextAdapter)
  _appContext;
  get customStyles() {
    return generateStyleProperties([{
      name: '--com-c-unified-cart-badge-link-color',
      value: this.iconLinkColor
    }, {
      name: '--com-c-unified-cart-badge-link-color-hover',
      value: this.iconLinkHoverColor
    }]);
  }
  @wire(NavigationContext)
  navContext;
  @wire(CartStatusAdapter)
  cartStatus(cartStatusHandler) {
    if (cartStatusHandler?.data?.preserveGuestCartNumberOfProductsWithError) {
      const toast = {
        label: preserveGuestCartErrorTitle,
        message: preserveGuestCartErrorMessage?.replace('{0}', cartStatusHandler?.data.preserveGuestCartNumberOfProductsWithError.toString()),
        variant: 'error',
        mode: 'dismissible'
      };
      Toast.show(toast, this);
      cartStatusUpdate({
        preserveGuestCartNumberOfProductsWithError: 0
      });
    }
  }
  @api
  cartItems;
  _cartMenuItems = [];
  _totalCartsCount = 0;
  _cartsFetchState = 'idle';
  _isCartsMenuOpen = false;
  _boundHandleOutsideClick = null;
  get _defaultPillLabel() {
    return this.defaultPillLabel || defaultCartLabel;
  }
  get _isCartsLoading() {
    return this._cartsFetchState === 'loading';
  }
  get _isCartsError() {
    return this._cartsFetchState === 'error';
  }
  get _hasCartsLoaded() {
    return this._cartsFetchState === 'success';
  }
  get _loadingCartsLabel() {
    return loadingCartsLabel;
  }
  get _loadCartsErrorLine1() {
    return loadCartsErrorLine1;
  }
  get _loadCartsErrorLine2() {
    return loadCartsErrorLine2;
  }
  get _viewAllCartsClass() {
    const base = 'slds-dropdown__item cart-list-item';
    return this._cartMenuItems.length > 0 ? `slds-has-divider_top-space ${base}` : base;
  }
  get _cartListWrapperClass() {
    const base = 'cart-list-wrapper';
    return this._isCartsMenuOpen ? `${base} menu-open` : base;
  }
  get _viewAllCartsLabel() {
    return this._totalCartsCount > 0 ? `${viewAllCartsLabel} (${this._totalCartsCount})` : viewAllCartsLabel;
  }
  handleCartButtonIconClick(event) {
    event.preventDefault();
    if (this.showMiniCart) {
      this.handleOpenMiniCart();
    } else if (this.navContext) {
      const isMultiCartEnabled = Boolean(this._appContext?.data?.commerceMultiCartEnabled);
      let pageName;
      if (isMultiCartEnabled && this.isLoggedIn && this.isB2bStore) {
        pageName = this.cartId ? 'Cart_Detail' : 'Cart_List';
      } else {
        pageName = 'Current_Cart';
      }
      const pageRef = {
        type: 'comm__namedPage',
        attributes: {
          name: pageName
        }
      };
      if (pageName === 'Cart_Detail' && this.cartId) {
        pageRef.state = {
          recordId: this.cartId
        };
      }
      navigate(this.navContext, pageRef);
    }
  }
  handleCartsListOpen() {
    this._isCartsMenuOpen = true;
    this.fetchCarts();
    this.addOutsideClickListener();
  }
  handleCartsListClose() {
    this._isCartsMenuOpen = false;
    this.removeOutsideClickListener();
  }
  addOutsideClickListener() {
    this.removeOutsideClickListener();
    this._boundHandleOutsideClick = this.handleOutsideClick.bind(this);
    setTimeout(() => {
      document.addEventListener('click', this._boundHandleOutsideClick, true);
    }, 0);
  }
  removeOutsideClickListener() {
    if (this._boundHandleOutsideClick) {
      document.removeEventListener('click', this._boundHandleOutsideClick, true);
      this._boundHandleOutsideClick = null;
    }
  }
  handleOutsideClick(event) {
    if (!this._isCartsMenuOpen) {
      return;
    }
    const cartListWrapper = this.querySelector('.cart-list-wrapper');
    const target = event.target;
    if (cartListWrapper && !cartListWrapper.contains(target)) {
      this.closeCartsDropdown();
      this.focusMenuTrigger();
    }
  }
  handleCartSelect(event) {
    event.stopPropagation();
    const value = event.currentTarget?.dataset?.value;
    if (!value || !this.navContext) {
      return;
    }
    this.closeCartsDropdown();
    if (value === VIEW_ALL_CARTS_MENU_VALUE) {
      this.navigateToCartListPage();
    } else {
      this.navigateToCartDetailPage(value);
    }
  }
  handleKeyboardClick(event) {
    const target = event.currentTarget;
    const key = event.key;
    switch (key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.handleCartSelect(event);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextMenuItem(target);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousMenuItem(target);
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstMenuItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastMenuItem();
        break;
      case 'Escape':
        event.preventDefault();
        this.closeCartsDropdown();
        this.focusMenuTrigger();
        break;
      case 'Tab':
        this.closeCartsDropdown();
        break;
      default:
        break;
    }
  }
  focusNextMenuItem(currentItem) {
    const nextItem = currentItem.nextElementSibling;
    if (nextItem?.classList.contains('cart-list-item')) {
      nextItem.focus();
    } else {
      this.focusFirstMenuItem();
    }
  }
  focusPreviousMenuItem(currentItem) {
    const prevItem = currentItem.previousElementSibling;
    if (prevItem?.classList.contains('cart-list-item')) {
      prevItem.focus();
    } else {
      this.focusLastMenuItem();
    }
  }
  focusFirstMenuItem() {
    const firstItem = this.querySelector('.cart-list-item');
    firstItem?.focus();
  }
  focusLastMenuItem() {
    const items = this.querySelectorAll('.cart-list-item');
    const lastItem = items[items.length - 1];
    lastItem?.focus();
  }
  focusMenuTrigger() {
    const menu = this.querySelector('lightning-button-menu');
    const menuButton = menu?.shadowRoot?.querySelector('button');
    menuButton?.focus();
  }
  closeCartsDropdown() {
    if (!this._isCartsMenuOpen) {
      return;
    }
    this._isCartsMenuOpen = false;
    this.removeOutsideClickListener();
    const menu = this.querySelector('lightning-button-menu');
    const menuButton = menu?.shadowRoot?.querySelector('button');
    if (menuButton) {
      menuButton.click();
    }
  }
  fetchCarts() {
    this._cartsFetchState = 'loading';
    getCarts({
      pageSize: CART_LIST_PAGE_SIZE
    }).then(data => {
      const carts = Array.isArray(data?.carts) ? data.carts : [];
      this._totalCartsCount = data?.total ?? carts.length;
      const cartsToShow = this.getCartsToShow(carts);
      this._cartMenuItems = cartsToShow.map(cart => ({
        id: cart.cartId ?? '',
        label: this.buildCartMenuLabel(cart.name, cart.totalProductCount, cart.uniqueProductCount, cart.cartId),
        isDefault: cart.isSecondary === false
      }));
      this._cartsFetchState = 'success';
    }).catch(() => {
      this._cartMenuItems = [];
      this._totalCartsCount = 0;
      this._cartsFetchState = 'error';
    });
  }
  getCartsToShow(carts) {
    const primaryCart = carts.find(cart => cart.isSecondary === false);
    const secondaryCarts = carts.filter(cart => cart.isSecondary === true);
    if (primaryCart) {
      return [primaryCart, ...secondaryCarts.slice(0, MAX_CART_LIST_ITEMS - 1)];
    }
    return secondaryCarts.slice(0, MAX_SECONDARY_CARTS_WITHOUT_PRIMARY);
  }
  navigateToCartListPage() {
    if (this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Cart_List'
        }
      });
    }
  }
  navigateToCartDetailPage(cartId) {
    if (this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Cart_Detail'
        },
        state: {
          recordId: cartId
        }
      });
    }
  }
  buildCartMenuLabel(name, totalProductCount, uniqueProductCount, cartId) {
    const isUniqueCount = this.countType === 'Unique';
    let count;
    if (!isUniqueCount && cartId && cartId === this.cartId && this.totalCartCount !== undefined) {
      count = String(this.totalCartCount);
    } else {
      count = isUniqueCount ? String(uniqueProductCount ?? 0) : totalProductCount;
    }
    if (this.showCount) {
      return getCartMenuLabel(getTruncatedName(name), count, itemsLabel) ?? '';
    }
    return getTruncatedName(name) ?? '';
  }
  _cartPageUrl = '';
  connectedCallback() {
    this.navContext && (this._cartPageUrl = generateUrl(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Current_Cart'
      }
    }));
  }
  disconnectedCallback() {
    this.removeOutsideClickListener();
  }
  handleOpenMiniCart() {
    this.dispatchEvent(new CustomEvent('open'));
  }
}