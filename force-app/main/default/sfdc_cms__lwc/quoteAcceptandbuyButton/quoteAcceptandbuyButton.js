import { api, LightningElement, wire } from 'lwc';
import { SessionContextAdapter } from 'commerce/contextApi';
import { navigate, NavigationContext } from 'lightning/navigation';
import QuoteToCartModal from 'site/quoteTocartModal';
import { isDesignMode } from 'experience/clientApi';
import buyButtonLabel from '@salesforce/label/site.quoteAcceptandbuyButton.buyButtonLabel';
import acceptAndBuyButtonLabel from '@salesforce/label/site.quoteAcceptandbuyButton.acceptAndBuyButtonLabel';
const CART_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Current_Cart'
  }
};
export default class QuoteAcceptandbuyButton extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @wire(SessionContextAdapter)
  sessionContext;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  buyButtonText;
  @api
  buyModalTitleText;
  @api
  buyModalDescriptionLabel;
  @api
  buyModalInfoText;
  @api
  buyModalCancelButtonLabel;
  @api
  buyModalSendRequestButtonLabel;
  @api
  acceptAndBuyButtonText;
  @api
  acceptAndBuyModalTitleText;
  @api
  acceptAndBuyModalDescriptionLabel;
  @api
  acceptAndBuyModalInfoText;
  @api
  acceptAndBuyModalCancelButtonLabel;
  @api
  acceptAndBuyModalSendRequestButtonLabel;
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
    const isAccepted = (this.quoteStatus ?? '').trim().toLowerCase() === 'accepted';
    if (isAccepted) {
      return this.buyButtonText ?? buyButtonLabel;
    }
    return this.acceptAndBuyButtonText ?? acceptAndBuyButtonLabel;
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
    const isApprovedOrAccepted = s === 'approved' || s === 'accepted';
    const hideWhenAcceptedWithOrder = s === 'accepted' && hasOrderId;
    return isApprovedOrAccepted && !hideWhenAcceptedWithOrder;
  }
  get isDisabled() {
    if (isDesignMode) {
      return false;
    }
    return !this.quoteId || !this.hasLineItems;
  }
  renderedCallback() {
    const isAccepted = (this.quoteStatus ?? '').trim().toLowerCase() === 'accepted';
    this.modalConfiguration = {
      mode: 'acceptQuote',
      quoteId: this.quoteId,
      titleText: isAccepted ? this.buyModalTitleText : this.acceptAndBuyModalTitleText,
      descriptionLabel: isAccepted ? this.buyModalDescriptionLabel : this.acceptAndBuyModalDescriptionLabel,
      infoText: isAccepted ? this.buyModalInfoText : this.acceptAndBuyModalInfoText,
      cancelButtonLabel: isAccepted ? this.buyModalCancelButtonLabel : this.acceptAndBuyModalCancelButtonLabel,
      sendRequestButtonLabel: isAccepted ? this.buyModalSendRequestButtonLabel : this.acceptAndBuyModalSendRequestButtonLabel
    };
  }
  handleButtonClick() {
    if (isDesignMode) {
      this.processAcceptAndBuy();
      return;
    }
    if (!this.quoteId || !this.hasLineItems) {
      return;
    }
    if (!this.isUserLoggedIn) {
      this.redirectToLogin();
      return;
    }
    this.processAcceptAndBuy();
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
  async processAcceptAndBuy() {
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