import { LightningElement, wire, api } from 'lwc';
import { NavigationContext, generateUrl, navigate } from 'lightning/navigation';
import { CartStatusAdapter, cartStatusUpdate } from 'commerce/checkoutCartApi';
import generateLabel from './textGenerator';
import { generateStyleProperties } from 'experience/styling';
import Toast from 'site/commonToast';
import { preserveGuestCartErrorTitle, preserveGuestCartErrorMessage } from './labels';
import BasePath from '@salesforce/community/basePath';
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
  get iconUrl() {
    return `${BasePath}/assets/icons/cart.svg#cart`;
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
  handleCartButtonIconClick(event) {
    event.preventDefault();
    if (this.showMiniCart) {
      this.handleOpenMiniCart();
    } else if (this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Current_Cart'
        }
      });
    }
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
  handleOpenMiniCart() {
    this.dispatchEvent(new CustomEvent('open'));
  }
}