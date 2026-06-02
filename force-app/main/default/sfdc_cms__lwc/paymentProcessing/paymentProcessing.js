import { LightningElement, wire, api } from 'lwc';
import { navigate, NavigationContext, generateUrl } from 'lightning/navigation';
import { loadScript } from 'lightning/platformResourceLoader';
import { AppContextAdapter } from 'commerce/contextApi';
import { postAuthorizePayment, checkoutPlaceOrder, checkoutSubmitOrder, toCheckoutOrderReferenceNumber } from 'commerce/checkoutCartApi';
import { paymentErrorLabels } from 'site/checkoutErrorHandler';
import { splitFirstAndLast } from 'site/checkoutInternationalization';
import { getSdkUrl } from './utils';
import { createCheckoutPaymentDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
const isPostAuthSuccessful = ({
  errors,
  salesforceResultCode
}) => {
  const containsError = errors && errors.length > 0;
  const successfulResultCode = salesforceResultCode && salesforceResultCode === 'Success';
  return !containsError && successfulResultCode;
};
export const getAddress = billingDetails => {
  if (!billingDetails) {
    return undefined;
  }
  const {
    address: {
      city,
      country,
      postalCode,
      state: region,
      line1
    },
    name
  } = billingDetails;
  const {
    firstName,
    lastName
  } = splitFirstAndLast(name, country);
  return {
    firstName,
    lastName,
    city,
    country,
    street: line1,
    postalCode,
    region,
    name
  };
};
export const CHECKOUT_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Current_Checkout'
  }
};

/**
 * @slot processingIndicator
 * @slot paymentProcessingHeader
 * @slot informationalText
 */
export default class PaymentProcessing extends LightningElement {
  static renderMode = 'light';
  _paymentResult;
  _paymentFailed = false;
  _errorLabel = paymentErrorLabels;
  _checkoutUrl;
  _appContext;
  _navigationContext;
  @api
  hideReturnToCheckoutButton = false;
  get showReturnToCheckoutButton() {
    return !this.hideReturnToCheckoutButton;
  }
  @wire(AppContextAdapter)
  appContextHandler({
    data,
    loaded
  }) {
    if (loaded && data) {
      this._appContext = data;
      this.placeOrderIfReady();
    }
  }
  @wire(NavigationContext)
  navigationContextHandler(navContext) {
    this._navigationContext = navContext;
    this._checkoutUrl = generateUrl(navContext, CHECKOUT_PAGE_REF);
  }
  async placeOrderIfReady() {
    try {
      const paymentResult = await this.getPaymentStatus();
      if (paymentResult.responseCode === 0) {
        const result = paymentResult.data;
        return this.placeOrder(result);
      }
      this._paymentFailed = true;
    } catch (e) {
      this._paymentFailed = true;
    }
    return Promise.resolve();
  }
  async getPaymentStatus() {
    try {
      if (!globalThis.SFPayments) {
        await loadScript(this, getSdkUrl());
      }
      const SFPaymentsCtor = globalThis.SFPayments;
      const sfp = new SFPaymentsCtor();
      return await sfp.handleRedirect();
    } catch (e) {
      throw new Error('Failed to retrieve payment redirect status');
    }
  }
  async placeOrder(paymentResult) {
    try {
      const {
        paymentData,
        paymentToken,
        billingDetails
      } = paymentResult;
      const placeOrderV2Enabled = Boolean(this._appContext?.placeOrderV2Enabled);
      if ((paymentData?.redirectResultId || !placeOrderV2Enabled) && paymentToken) {
        const address = getAddress(billingDetails);
        const postAuthResponse = await postAuthorizePayment('active', paymentToken, address, paymentData);
        if (!isPostAuthSuccessful(postAuthResponse)) {
          this._paymentFailed = true;
          return;
        }
      }
      let orderReferenceNumber;
      if (placeOrderV2Enabled) {
        const submitOrderResponse = await checkoutSubmitOrder();
        orderReferenceNumber = toCheckoutOrderReferenceNumber(submitOrderResponse);
      } else {
        const placeOrderResponse = await checkoutPlaceOrder();
        orderReferenceNumber = placeOrderResponse?.orderReferenceNumber;
      }
      if (orderReferenceNumber) {
        this.navigateToOrder(orderReferenceNumber);
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const cartId = urlParams.get('cartId');
        const paymentDataD360 = {
          isExpressPayment: false,
          paymentMethod: paymentData?.type,
          initialOrn: orderReferenceNumber,
          isManualCapture: paymentData?.isManualCapture,
          paymentMethods: undefined
        };
        if (cartId) {
          dispatchDataEvent(this, createCheckoutPaymentDataEvent(cartId, paymentDataD360));
        }
      } else {
        throw new Error('Required orderReferenceNumber is missing');
      }
    } catch (e) {
      this._paymentFailed = true;
    }
  }
  onReturnToCheckoutClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const payByLinkId = globalThis.sessionStorage.getItem('PAYMENT_LINK_ID');
    globalThis.sessionStorage.removeItem('PAYMENT_LINK_ID');
    if (payByLinkId) {
      navigate(this._navigationContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Current_Checkout'
        },
        state: {
          paymentLinkId: payByLinkId
        }
      });
    } else {
      navigate(this._navigationContext, CHECKOUT_PAGE_REF);
    }
  }
  navigateToOrder(orderReferenceNumber) {
    navigate(this._navigationContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Order'
      },
      state: {
        orderNumber: orderReferenceNumber
      }
    });
  }
}