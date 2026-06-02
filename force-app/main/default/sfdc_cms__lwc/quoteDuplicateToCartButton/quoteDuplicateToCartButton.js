import { api, LightningElement, wire } from 'lwc';
import { SessionContextAdapter } from 'commerce/contextApi';
import { navigate, NavigationContext } from 'lightning/navigation';
import QuoteToCartModal from 'site/quoteCartModalUi';
import { isDesignMode } from 'experience/clientApi';
import duplicateToCartButtonLabel from '@salesforce/label/site.quoteDuplicateToCartButton.duplicateToCartButtonLabel';
const CART_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Current_Cart'
  }
};
export default class QuoteDuplicateToCartButton extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @wire(SessionContextAdapter)
  sessionContext;
  @api
  buttonText;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  titleText;
  @api
  descriptionLabel;
  @api
  infoText;
  @api
  cancelButtonLabel;
  @api
  sendRequestButtonLabel;
  @api
  quoteStatus;
  @api
  quoteId;
  @api
  orderId;
  @api
  hasLineItems;
  modalConfiguration = {};
  get content() {
    return this.buttonText ?? duplicateToCartButtonLabel;
  }
  get isUserLoggedIn() {
    return this.sessionContext?.data?.isLoggedIn ?? false;
  }
  get shouldShowButton() {
    if (isDesignMode) {
      return true;
    }
    const s = (this.quoteStatus ?? '').trim().toLowerCase();
    const hasOrderId = Boolean((this.orderId ?? '').trim());
    const notApprovedOrAccepted = s !== 'approved' && s !== 'accepted';
    const acceptedWithOrderId = s === 'accepted' && hasOrderId;
    return notApprovedOrAccepted || acceptedWithOrderId;
  }
  get isDisabled() {
    if (isDesignMode) {
      return false;
    }
    return !this.quoteId || !this.hasLineItems;
  }
  renderedCallback() {
    this.modalConfiguration = {
      mode: 'duplicateToCart',
      quoteId: this.quoteId,
      titleText: this.titleText,
      descriptionLabel: this.descriptionLabel,
      infoText: this.infoText,
      cancelButtonLabel: this.cancelButtonLabel,
      sendRequestButtonLabel: this.sendRequestButtonLabel
    };
  }
  handleButtonClick() {
    if (isDesignMode) {
      this.processDuplicateToCart();
      return;
    }
    if (!this.quoteId || !this.hasLineItems) {
      return;
    }
    if (!this.isUserLoggedIn) {
      this.redirectToLogin();
      return;
    }
    this.processDuplicateToCart();
  }
  redirectToLogin() {
    if (this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Login'
        }
      });
    }
  }
  async processDuplicateToCart() {
    const modal = await QuoteToCartModal.open({
      size: 'small',
      ...this.modalConfiguration
    });
    const result = await modal;
    if (result?.success && result?.cartId && this.navContext) {
      navigate(this.navContext, CART_PAGE_REF);
    }
  }
}