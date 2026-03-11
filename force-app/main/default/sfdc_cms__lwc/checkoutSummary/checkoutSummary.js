import { api, LightningElement } from 'lwc';
import expandableCartItemsTitle from '@salesforce/label/site.checkoutSummary.expandableCartItemsTitle';
import expandableSummaryHeading from '@salesforce/label/site.checkoutSummary.expandableSummaryHeading';
/**
 * @slot checkoutmobileheading
 * @slot summary
 * @slot cartitems
 */
export default class CheckoutSummary extends LightningElement {
  static renderMode = 'light';
  isMobileExpanded = false;
  _showCartItemsExpanded = false;
  get expanderIconName() {
    return this._showCartItemsExpanded ? 'utility:chevronup' : 'utility:chevrondown';
  }
  get mobileExpanderName() {
    return this.isMobileExpanded ? 'utility:chevronup' : 'utility:chevrondown';
  }
  get _expandableCartItemsTitle() {
    if (this.cartDetails?.totalProductCount) {
      return this.expandableCartItemsTitle.replace('{0}', `(${this.cartDetails?.totalProductCount})`);
    }
    return this.expandableCartItemsTitle.replace('{0}', ``).trim();
  }
  @api
  cartDetails;
  @api
  checkoutDetails;
  @api
  hideCartItemsTitle = false;
  get _hideCartItemsTitle() {
    return !this.hideCartItemsTitle && this.showCartItemsInfo;
  }
  get showCartItemsInfo() {
    const deliveryGroups = this.checkoutDetails?.deliveryGroups;
    if (!deliveryGroups) {
      return true;
    }
    return deliveryGroups.items.length <= 1;
  }
  @api
  expandableSummaryHeading = expandableSummaryHeading;
  @api
  expandableCartItemsTitle = expandableCartItemsTitle;
  @api
  set showCartItemsExpanded(value) {
    this._showCartItemsExpanded = value;
  }
  get showCartItemsExpanded() {
    return this._showCartItemsExpanded;
  }
  handleExpandableCartItemsClick() {
    this._showCartItemsExpanded = !this._showCartItemsExpanded;
  }
  get cartItemsClasses() {
    return `cartitems ${this._showCartItemsExpanded ? 'show' : 'hide'}`;
  }
  get expandableSummaryClasses() {
    return `expandable-summary ${this.isMobileExpanded ? 'show' : 'hide'}`;
  }
  handleClick() {
    this.handleMobileExpander();
  }
  handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleMobileExpander();
    }
  }
  handleMobileExpander() {
    this.isMobileExpanded = !this.isMobileExpanded;
    this.dispatchEvent(new CustomEvent('summarytoggle', {
      bubbles: true,
      composed: true,
      cancelable: true
    }));
  }
  renderedCallback() {
    const cartSummaryHeader = this.querySelector('site-cart-summary-ui header');
    const isCheckoutMobile = window.matchMedia('(max-width: 78em)');
    if (cartSummaryHeader && isCheckoutMobile.matches) {
      cartSummaryHeader.style.display = 'none';
    } else if (cartSummaryHeader) {
      cartSummaryHeader.style.display = 'block';
    }
  }
}