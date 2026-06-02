import { wire, api } from 'lwc';
import { CurrentPageReference, navigate, NavigationContext } from 'lightning/navigation';
import { generateElementAlignmentClass, generateStyleProperties } from 'experience/styling';
import { CheckoutComponentBase, CheckoutStage, CheckoutStatus } from 'commerce/checkoutApi';
import { CheckoutError } from 'site/checkoutErrorHandler';
import { createCheckoutSubmitDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
import { toCheckoutOrderReferenceNumber, toCommerceError } from 'commerce/checkoutCartApi';
export default class CheckoutPlaceOrder extends CheckoutComponentBase {
  static renderMode = 'light';
  @api
  text;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  alignment;
  @api
  buttonTextColor;
  @api
  buttonTextHoverColor;
  @api
  buttonBackgroundColor;
  @api
  buttonBackgroundHoverColor;
  @api
  buttonBorderColor;
  @api
  buttonBorderRadius;
  @api
  checkoutDetails;
  get displayPlaceOrderButton() {
    return !this.checkoutDetails?.display?.hidePlaceOrderButton;
  }
  get buttonStyle() {
    const styles = {};
    if (this.buttonTextColor) {
      styles['--com-c-button-color'] = this.buttonTextColor;
    }
    if (this.buttonTextHoverColor) {
      styles['--com-c-button-color-hover'] = this.buttonTextHoverColor;
    }
    if (this.buttonBackgroundColor) {
      styles['--com-c-button-color-background'] = this.buttonBackgroundColor;
    }
    if (this.buttonBackgroundHoverColor) {
      styles['--com-c-button-color-background-hover'] = this.buttonBackgroundHoverColor;
    }
    if (this.buttonBorderRadius) {
      styles['--com-c-button-radius-border'] = this.buttonBorderRadius + 'px';
    }
    if (this.buttonBorderColor) {
      styles['--com-c-button-color-border'] = this.buttonBorderColor;
    }
    return generateStyleProperties(styles);
  }
  get customButtonClasses() {
    return generateElementAlignmentClass(this.alignment || 'center');
  }
  get content() {
    return this.text ?? '';
  }
  get disabled() {
    return this._readOnlyIfValid || this.checkoutDetails?.checkoutStatus !== CheckoutStatus.Ready;
  }
  get cartSummary() {
    return this.checkoutDetails?.cartSummary;
  }
  _readOnlyIfValid = false;
  setAspect(newAspect) {
    this._readOnlyIfValid = newAspect.readOnlyIfValid;
  }
  connectedCallback() {
    this.dispatchRequestAspect({
      summarizable: true
    });
    const hasExistingError = this.checkoutDetails?.notifications?.find(n => n.groupId === 'CheckoutPlaceOrder');
    if (hasExistingError) {
      this.dispatchUpdateErrorAsync({
        groupId: 'CheckoutPlaceOrder'
      });
    }
  }
  handleButtonClick(event) {
    event.stopPropagation();
    if (this.cartSummary?.cartId) {
      dispatchDataEvent(this, createCheckoutSubmitDataEvent(this.cartSummary.cartId));
    }
    this.dispatchFinalizeAsync();
  }
  @wire(NavigationContext)
  _navigationContext;
  async placeOrderAndNavigate() {
    await this.dispatchUpdateErrorAsync({
      groupId: 'CheckoutPlaceOrder'
    });
    try {
      const orderConfirmation = await this.dispatchPlaceOrderAsync();
      if (this._navigationContext && this._payByLinkId) {
        globalThis.sessionStorage.removeItem('CLONED_CART_ID');
        navigate(this._navigationContext, {
          type: 'comm__namedPage',
          attributes: {
            name: 'Order'
          },
          state: {
            orderNumber: orderConfirmation.orderReferenceNumber,
            isPaymentLink: true
          }
        });
      } else if (this._navigationContext && orderConfirmation.orderReferenceNumber) {
        navigate(this._navigationContext, {
          type: 'comm__namedPage',
          attributes: {
            name: 'Order'
          },
          state: {
            orderNumber: orderConfirmation.orderReferenceNumber,
            isPaymentLink: false
          }
        });
      } else {
        throw new Error(CheckoutError.MISSING_ORDER_REFERENCE_NUMBER);
      }
      return true;
    } catch (e) {
      await this.dispatchUpdateErrorAsync({
        groupId: 'CheckoutPlaceOrder',
        type: toCommerceError(e).code === 'CHECKOUT_INVENTORY_RESERVATION' ? '/commerce/global/place-order' : '/site/commerceErrors/checkout-failure',
        exception: e
      });
      console.warn('[CheckoutPlaceOrder] placeOrderAndNavigate', e);
      return false;
    }
  }
  async prepareOrder() {
    await this.dispatchUpdateErrorAsync({
      groupId: 'CheckoutPlaceOrder'
    });
    try {
      await this.dispatchPrepareOrderAsync();
      return true;
    } catch (e) {
      await this.dispatchUpdateErrorAsync({
        groupId: 'CheckoutPlaceOrder',
        type: toCommerceError(e).code === 'CHECKOUT_INVENTORY_RESERVATION' ? '/commerce/global/place-order' : '/site/commerceErrors/checkout-failure',
        exception: e
      });
      console.warn('[CheckoutPlaceOrder] prepareOrder', e);
      return false;
    }
  }
  async submitOrderAndNavigate() {
    await this.dispatchUpdateErrorAsync({
      groupId: 'CheckoutPlaceOrder'
    });
    try {
      const submitOrderResponse = await this.dispatchSubmitOrderAsync();
      const orderReferenceNumber = toCheckoutOrderReferenceNumber(submitOrderResponse);
      if (this._navigationContext && this._payByLinkId) {
        globalThis.sessionStorage.removeItem('CLONED_CART_ID');
        navigate(this._navigationContext, {
          type: 'comm__namedPage',
          attributes: {
            name: 'Order'
          },
          state: {
            orderNumber: orderReferenceNumber,
            isPaymentLink: true
          }
        });
      } else if (this._navigationContext && orderReferenceNumber) {
        navigate(this._navigationContext, {
          type: 'comm__namedPage',
          attributes: {
            name: 'Order'
          },
          state: {
            orderNumber: orderReferenceNumber,
            isPaymentLink: false
          }
        });
      } else {
        throw new Error(CheckoutError.MISSING_ORDER_REFERENCE_NUMBER);
      }
      return true;
    } catch (e) {
      await this.dispatchUpdateErrorAsync({
        groupId: 'CheckoutPlaceOrder',
        type: '/site/commerceErrors/checkout-failure',
        exception: e
      });
      console.warn('[CheckoutPlaceOrder] submitOrderAndNavigate', e);
      return false;
    }
  }
  stageAction(checkoutStage) {
    switch (checkoutStage) {
      case CheckoutStage.PLACE_ORDER:
        return this.placeOrderAndNavigate();
      case CheckoutStage.PREPARE_ORDER:
        return this.prepareOrder();
      case CheckoutStage.SUBMIT_ORDER:
        return this.submitOrderAndNavigate();
      default:
        return Promise.resolve(true);
    }
  }
  _payByLinkId;
  @wire(CurrentPageReference)
  getPaymentLinkFromPageRef(pageRef) {
    this._payByLinkId = pageRef?.state?.paymentLinkId;
  }
}