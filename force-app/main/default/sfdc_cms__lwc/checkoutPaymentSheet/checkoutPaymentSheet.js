import { api, track, wire } from 'lwc';
import { CheckoutComponentBase, postAuthorizePayment, CheckoutStatus, processShippingForPaymentSheet, applyProcessShippingResult } from 'commerce/checkoutApi';
import { CheckoutStage } from 'commerce/checkoutApi';
import { CheckoutStencilType } from 'site/checkoutStencil';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { generateUrl, NavigationContext } from 'lightning/navigation';
import currency from '@salesforce/i18n/currency';
import requiredFieldError from '@salesforce/label/site.checkoutPaymentSheet.requiredFieldError';
import duplicateUserError from '@salesforce/label/site.checkoutPaymentSheet.duplicateUserError';
import { buildFullName } from 'site/checkoutInternationalization';
import { PaymentAuthorizationError } from 'site/paymentAuthorizationError';
import { Deferred } from './checkoutPaymentSheetDeferredPromise';
import { registerCheckoutUser } from 'site/commonLoginHandler';
import { createCheckoutPaymentDataEvent, createCheckoutPaymentRenderDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
export const paymentSheetLocator = 'experience-payment-sheet';
export const COMMERCE_REG_PROCESS = 'SFDC_COMMERCE_1CC';
export const PAY_PAGE_ROUTE = 'pay';
function isAddressValid(address) {
  return !!address?.country;
}
function paymentCompleted(responseCode, data) {
  return responseCode === 0 && data.paymentToken !== undefined;
}
const paymentProcessingPageRef = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Payment_Processing'
  }
};

/**
 * @slot heading
 * @slot billingAddress
 */
export default class CheckoutPaymentSheet extends CheckoutComponentBase {
  static renderMode = 'light';
  _stencilType = CheckoutStencilType.PAYMENT;
  _expandedMode = false;
  _webstoreId;
  navigationContext;
  _appContext;
  _effectiveAccountId;
  _gatewayProviderName;
  _deferred = new Deferred();
  _paymentsApprovalDetails;
  _showBillingDetails = false;
  _isSessionContextLoaded = this._expandedMode;
  _isAppContextLoaded = this._expandedMode;
  _isCartTotalsLoaded = this._expandedMode;
  _isCheckoutDetailsLoaded = this._expandedMode;
  _isShippingLoaded = this._expandedMode;
  _isPaymentSheetInitialized = this._expandedMode;
  _isLoggedIn = false;
  _isPaymentsLoaded = false;
  _shippingDetails;
  _shippingAddress;
  _selectedPaymentMethod;
  _cancelPaymentOnError = false;
  _paymentMethodsAvailable = [];
  _summarizable = false;
  _showSummary = false;
  _isManagedEnabled = false;
  _enableExpress = false;
  _placeOrderV2Enabled = false;
  _savedPaymentMethodInfo;
  _userRegistrationId;
  _preferLegacyForms = false;
  _handlePaymentSheetLoaded = this.handlePaymentSheetLoaded.bind(this);
  _handlePaymentSelected = this.handlePaymentSelected.bind(this);
  _handlePaymentButtonClick = this.handlePaymentButtonClick.bind(this);
  _handlePaymentApproval = this.handlePaymentApproval.bind(this);
  _handlePaymentCancelled = this.handlePaymentCancelled.bind(this);
  _handlePaymentErrored = this.handlePaymentErrored.bind(this);
  _paymentApproved;
  @api
  paymentMethodSetId;
  @api
  useManualCapture = false;
  @api
  enableSavedPaymentMethods = false;
  @api
  enableBusinessAch = false;
  @api
  sepaDebitMandate;
  @api
  disableDeferredIncurrence = false;
  @api
  isBusinessAccountPayment = false;
  @api
  businessAccountId;
  @track
  _checkoutDetails;
  @api
  get checkoutDetails() {
    return this._checkoutDetails;
  }
  set checkoutDetails(value) {
    this._checkoutDetails = value;
    if (value) {
      this._isCheckoutDetailsLoaded = true;
    }
    this.paymentDataUpdate();
    this.onSetCheckoutProperties();
  }
  get _entryMode() {
    return !this.isPayNowInvoice() && this._placeOrderV2Enabled ? 'Place_Order_V2' : 'Payer_Online';
  }
  @api
  cartDetails;
  @track
  _cartTotals;
  @api
  get cartTotals() {
    return this._cartTotals;
  }
  set cartTotals(value) {
    this._cartTotals = value;
    if (this._cartTotals) {
      this._isCartTotalsLoaded = true;
      this.paymentDataUpdate();
    }
  }
  get _cartId() {
    return this._checkoutDetails?.cartSummary?.cartId;
  }
  get _totalPrice() {
    if (this._checkoutDetails?.checkoutStatus === CheckoutStatus.Ready) {
      return this._hasSubscriptions ? this._checkoutDetails?.cartSummary?.firstPymtGrandTotalAmount : this._checkoutDetails?.cartSummary?.grandTotalAmount;
    }
    return undefined;
  }
  get _currencyCode() {
    return this.checkoutDetails?.cartSummary?.currencyIsoCode || currency;
  }
  get _hasSubscriptions() {
    return parseInt(this.checkoutDetails?.cartSummary?.totalSubProductCount ?? '', 10) > 0;
  }
  get _manualCapturePayments() {
    return this._hasSubscriptions ? false : this.useManualCapture;
  }
  get _enforceSavedPaymentMethods() {
    return this._hasSubscriptions;
  }
  get _enableSavedPaymentMethods() {
    if (this.isBusinessAccountPayment) {
      return true;
    }
    return this._hasSubscriptions || !this._isLoggedIn ? false : this.enableSavedPaymentMethods;
  }
  get _enableBusinessAch() {
    return this.enableBusinessAch;
  }
  get _deferredIncurrence() {
    return this.disableDeferredIncurrence ? undefined : true;
  }
  get _paymentInitiationSource() {
    return this.isPayNowInvoice() ? undefined : {
      application: 'Commerce',
      process: this._isManagedEnabled ? 'Managed Checkout' : 'Custom Checkout',
      standardReferences: {
        accountId: this._effectiveAccountId,
        webStoreId: this._webstoreId,
        webCartId: this._cartId
      }
    };
  }
  @api
  set expandedMode(value) {
    this._expandedMode = value;
  }
  get expandedMode() {
    return this._expandedMode;
  }
  get showStencil() {
    return !this.expandedMode && (!this._isPaymentsLoaded || !this._isPaymentDataReady);
  }
  get _showBillingDetailsSection() {
    return this._showBillingDetails && !this._savedPaymentMethodInfo && !this._showSummary;
  }
  get paymentTitle() {
    return this._savedPaymentMethodInfo?.title ?? '';
  }
  get paymentDetails() {
    return this._savedPaymentMethodInfo?.details ?? '';
  }
  get paymentSummaryClass() {
    let summaryClass = '';
    if (this._selectedPaymentMethod) {
      summaryClass += 'paymentSummaryType-' + this._selectedPaymentMethod;
    }
    if (this._savedPaymentMethodInfo?.subtype) {
      summaryClass += ' paymentSummarySubType-' + this._savedPaymentMethodInfo?.subtype;
    }
    return summaryClass;
  }
  get _unsupportedPaymentMethods() {
    return this._hasSubscriptions ? ['us_bank_account', 'sepa_debit'] : [];
  }
  onSetCheckoutProperties() {
    const deliveryAddress = this._checkoutDetails?.deliveryGroups?.items?.[0]?.deliveryAddress;
    const result = processShippingForPaymentSheet(this._hideShippingAddress, deliveryAddress, this._shippingAddress);
    applyProcessShippingResult(result, () => {
      this._isShippingLoaded = true;
      this.paymentDataUpdate();
    }, (address, details) => {
      this._shippingAddress = address;
      this._shippingDetails = details;
      this._isShippingLoaded = true;
      this.paymentDataUpdate();
    });
  }
  get _paymentRedirectUrl() {
    if (this.navigationContext) {
      if (this.isPayNowInvoice()) {
        return window.location.href;
      }
      const paymentProcessingPath = generateUrl(this.navigationContext, paymentProcessingPageRef);
      const url = new URL(window.location.origin + paymentProcessingPath);
      if (this._cartId) {
        url.searchParams.append('cartId', this._cartId);
      }
      return url.toString();
    }
    return '';
  }
  @wire(NavigationContext)
  navigationContextHandler(navigationContext) {
    this.navigationContext = navigationContext;
  }
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (!this.expandedMode && !response.loading) {
      this._effectiveAccountId = response?.data?.effectiveAccountId;
      this._isLoggedIn = response?.data?.isLoggedIn;
    }
    this._isSessionContextLoaded = this.expandedMode || !!response?.data;
    this.paymentDataUpdate();
  }
  @wire(AppContextAdapter)
  appContextHandler(response) {
    this._appContext = response;
    if (!response.loading) {
      this._webstoreId = response?.data?.webstoreId;
      this._isManagedEnabled = !!response?.data?.checkoutSettings?.isManagedCheckoutEnabled;
      if (this._isManagedEnabled) {
        this._enableExpress = true;
      }
      this._placeOrderV2Enabled = !!response?.data?.placeOrderV2Enabled;
    }
    this._isAppContextLoaded = this.expandedMode || !!response?.data;
    this.paymentDataUpdate();
  }
  get _hideShippingAddress() {
    return this._appContext?.data?.hideShippingAddress ?? false;
  }
  @api
  async completePayment() {
    await this.dispatchUpdateErrorAsync({
      groupId: 'DbbPayment'
    });
    const paymentComponent = this.getSalesforcePaymentMethodComponent();
    const checkoutId = this._checkoutDetails?.checkoutId;
    const cartId = this._checkoutDetails?.cartSummary?.cartId;
    const email = this._checkoutDetails?.contactInfo?.email;
    const address = this._checkoutDetails?.billingInfo?.address;
    const billingFirstName = address.firstName;
    const billingLastName = address.lastName;
    paymentComponent.billingDetails = {
      name: buildFullName(address.name, billingFirstName, billingLastName, address.country),
      email: email,
      address: {
        line1: address.street,
        city: address.city,
        state: address.region,
        postalCode: address.postalCode,
        country: address.country
      }
    };
    if (!isAddressValid(address) || !checkoutId) {
      return false;
    }
    this.validateRequiredPaymentFields(paymentComponent, this._showBillingDetails);
    try {
      let checkoutSave;
      let synchronousConfirm = false;
      if (this._gatewayProviderName && this._gatewayProviderName === 'Paypal') {
        this._paymentsApprovalDetails.billingDetails = paymentComponent.billingDetails;
        checkoutSave = {
          responseCode: 0,
          data: this._paymentsApprovalDetails
        };
        synchronousConfirm = true;
      } else {
        checkoutSave = await paymentComponent.checkoutSave();
        if (checkoutSave.responseCode !== 0) {
          throw new PaymentAuthorizationError();
        }
      }
      if (synchronousConfirm || !this._placeOrderV2Enabled) {
        if (paymentCompleted(checkoutSave.responseCode, checkoutSave.data) && checkoutSave.data.paymentToken && checkoutSave.data.billingDetails) {
          await postAuthorizePayment(checkoutId, checkoutSave?.data?.paymentToken, this.transformToPaymentAddress(checkoutSave.data.billingDetails), checkoutSave?.data?.paymentData, this.checkoutDetails?.accountRegistrationId);
        } else {
          throw new PaymentAuthorizationError();
        }
      }
      const paymentData = {
        isExpressPayment: false,
        paymentMethod: this._selectedPaymentMethod,
        initialOrn: this._checkoutDetails?.orderReferenceNumber,
        isManualCapture: this.useManualCapture,
        paymentMethods: this._paymentMethodsAvailable
      };
      if (cartId) {
        dispatchDataEvent(this, createCheckoutPaymentDataEvent(cartId, paymentData));
      }
      return true;
    } catch (e) {
      await this.dispatchUpdateErrorAsync({
        groupId: 'DbbPayment',
        type: '/site/commerceErrors/payment-failure',
        exception: e
      });
      return false;
    }
  }
  async createPersonAccount() {
    globalThis.sessionStorage.removeItem('REGISTRATION_FAILED');
    if (this.checkoutDetails?.registerUser) {
      try {
        this._userRegistrationId = (await registerCheckoutUser(COMMERCE_REG_PROCESS, this.checkoutDetails)).accountId;
        await this.dispatchUpdateAsync({
          accountRegistrationId: this._userRegistrationId
        });
      } catch (e) {
        if (e instanceof Error && e.message !== duplicateUserError) {
          globalThis.sessionStorage.setItem('REGISTRATION_FAILED', 'TRUE');
        }
      }
    }
    return true;
  }
  transformToPaymentAddress(billingDetails) {
    return {
      city: billingDetails.address.city,
      country: billingDetails.address.country,
      name: billingDetails.name,
      postalCode: billingDetails.address.postalCode,
      region: billingDetails.address.state,
      street: billingDetails.address.line1
    };
  }
  reportValidity() {
    const paymentComponent = this.getSalesforcePaymentMethodComponent();
    const addressValid = isAddressValid(this._checkoutDetails?.billingInfo?.address);
    return (paymentComponent?.reportValidity() ?? false) && addressValid;
  }
  validateRequiredPaymentFields(paymentComponent, showBillingDetails) {
    const requiredFields = ['amount', 'currency', 'sourceObjectId'];
    this.validateFields(requiredFields, paymentComponent);
    this.validateFields(['name'], paymentComponent.shippingDetails);
    this.validateAddressFields(paymentComponent.shippingDetails?.address);
    if (showBillingDetails) {
      this.validateFields(['name', 'email'], paymentComponent.billingDetails);
      this.validateAddressFields(paymentComponent.billingDetails?.address);
    }
  }
  validateAddressFields(address) {
    const requiredFields = ['line1', 'country'];
    this.validateFields(requiredFields, address);
  }
  validateFields(requiredFields, objectType) {
    requiredFields.forEach(field => {
      const value = objectType[field];
      this.validateValue(field, value);
    });
  }
  validateValue(field, value) {
    if (!value?.trim().length) {
      throw new Error(requiredFieldError.replace('{field}', field));
    }
  }
  getSalesforcePaymentMethodComponent() {
    return this.getComponent(paymentSheetLocator);
  }
  getComponent(locator) {
    return this.querySelector(locator);
  }
  setAspect(newAspect) {
    this._showSummary = newAspect.summary;
  }
  stageAction(checkoutStage) {
    switch (checkoutStage) {
      case CheckoutStage.START_PAYMENT_SESSION:
        if (this._selectedPaymentMethod === 'applepay') {
          this.fireCheckoutEvent('showapplepay');
          this._cancelPaymentOnError = true;
        } else {
          this._cancelPaymentOnError = false;
        }
        return Promise.resolve(true);
      case CheckoutStage.ABORT_PAYMENT_SESSION:
        if (this._cancelPaymentOnError) {
          this.fireCheckoutEvent('abortapplepay');
          this._cancelPaymentOnError = false;
        }
        return Promise.resolve(true);
      case CheckoutStage.REPORT_VALIDITY_SAVE:
        return Promise.resolve(this.reportValidity());
      case CheckoutStage.BEFORE_PAYMENT:
        return this.createPersonAccount();
      case CheckoutStage.PAYMENT:
        if (this._gatewayProviderName && this._gatewayProviderName === 'Paypal') {
          this._deferred.resolve('resolved');
          return new Promise(resolve => {
            this._paymentApproved = resolve;
          });
        }
        return this.completePayment();
      default:
        return Promise.resolve(true);
    }
  }
  fireCheckoutEvent(type) {
    const el = this.querySelector('[sf-payments-checkout] .sfpp-component-checkout');
    const event = new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail: {}
    });
    el?.dispatchEvent(event);
  }
  get _isPaymentDataReady() {
    const isShippingRequired = !this._hideShippingAddress;
    const isShippingReady = !isShippingRequired || this._isShippingLoaded;
    return this._isCheckoutDetailsLoaded && this._isAppContextLoaded && this._isSessionContextLoaded && this._isCartTotalsLoaded && isShippingReady;
  }
  paymentDataUpdate() {
    this._isPaymentSheetInitialized = this._isPaymentSheetInitialized || this._isPaymentDataReady;
  }
  @api
  set isPaymentSheetInitialized(value) {
    this._isPaymentSheetInitialized = value;
  }
  get isPaymentSheetInitialized() {
    return this._isPaymentSheetInitialized;
  }
  get _showEditLayoutClass() {
    return this.showStencil ? 'slds-hide' : '';
  }
  get paymentSheetStyles() {
    return this.showStencil || this._showSummary ? 'slds-hide' : '';
  }
  summarize(savedPaymentMethodInfo) {
    this._savedPaymentMethodInfo = savedPaymentMethodInfo;
    const summarizable = !!savedPaymentMethodInfo;
    if (this._summarizable !== summarizable) {
      this._summarizable = summarizable;
      this.dispatchRequestAspect({
        summarizable: summarizable
      });
    }
  }
  isPayNowInvoice() {
    const pathList = globalThis.location.pathname.split('/');
    return pathList[pathList.length - 1] === PAY_PAGE_ROUTE;
  }
  handlePaymentSheetLoaded(event) {
    event.stopPropagation();
    const customEvent = event;
    if (customEvent?.detail?.paymentMethodsAvailable) {
      this._paymentMethodsAvailable = customEvent?.detail?.paymentMethodsAvailable;
      const paymentData = {
        isExpressPayment: false,
        paymentMethod: undefined,
        initialOrn: this._checkoutDetails?.orderReferenceNumber,
        isManualCapture: this.useManualCapture,
        paymentMethods: this._paymentMethodsAvailable
      };
      if (this._cartId) {
        dispatchDataEvent(this, createCheckoutPaymentRenderDataEvent(this._cartId, paymentData));
      }
    }
  }
  handlePaymentSelected(event) {
    event.stopPropagation();
    const customEvent = event;
    this._selectedPaymentMethod = customEvent?.detail?.selectedPaymentMethod;
    this._showBillingDetails = customEvent?.detail?.requiresBillingDetails ?? true;
    this._gatewayProviderName = customEvent?.detail?.selectedPaymentMethodVendor;
    this.summarize(customEvent?.detail?.savedPaymentMethodInfo);
    this.dispatchUpdateAsync({
      display: {
        hidePlaceOrderButton: customEvent?.detail?.requiresPayButton === false
      }
    });
    this._isPaymentsLoaded = true;
  }
  handlePaymentButtonClick(event) {
    event.stopPropagation();
    const customEvent = event;
    customEvent.detail.addValidation(this._deferred.promise);
    this.dispatchFinalizeAsync().then(() => {
      if (!this._paymentApproved) {
        this._deferred.reject('rejected');
        this._deferred = new Deferred();
      }
    });
  }
  handlePaymentApproval(event) {
    event.stopPropagation();
    if (this.isPayNowInvoice()) {
      const paymentApprovalEvent = new CustomEvent('paymentapproval', {
        bubbles: true,
        composed: true,
        detail: event.detail
      });
      this.dispatchEvent(paymentApprovalEvent);
      return;
    }
    const customEvent = event;
    this._paymentsApprovalDetails = {
      paymentData: {
        id: customEvent.detail.data.paymentData.id,
        uuid: customEvent.detail.data.paymentData.uuid,
        paymentGatewayId: customEvent.detail.data.paymentData.paymentGatewayId,
        intent: customEvent.detail.data.paymentData.intent
      },
      paymentToken: customEvent.detail.data.paymentToken,
      billingDetails: customEvent.detail.data.billingDetails,
      paymentMethodsAvailable: customEvent.detail.paymentMethodsAvailable,
      status: 'success'
    };
    this.completePayment().then(state => {
      this._paymentApproved(state);
    });
  }
  handlePaymentCancelled(event) {
    event.stopPropagation();
    if (this._paymentApproved) {
      this._paymentApproved(false);
    }
  }
  handlePaymentErrored(event) {
    event.stopPropagation();
    if (this._paymentApproved) {
      this._paymentApproved(false);
    }
  }
  connectedCallback() {
    this.addEventListener('paymentsheetloaded', this._handlePaymentSheetLoaded);
    this.addEventListener('paymentmethodselected', this._handlePaymentSelected);
    this.addEventListener('paymentinitiated', this._handlePaymentButtonClick);
    this.addEventListener('paymentapproved', this._handlePaymentApproval);
    this.addEventListener('paymentcancel', this._handlePaymentCancelled);
    this.addEventListener('paymenterrored', this._handlePaymentErrored);
  }
  disconnectedCallback() {
    this.removeEventListener('paymentsheetloaded', this._handlePaymentSheetLoaded);
    this.removeEventListener('paymentmethodselected', this._handlePaymentSelected);
    this.removeEventListener('paymentinitiated', this._handlePaymentButtonClick);
    this.removeEventListener('paymentapproved', this._handlePaymentApproval);
    this.removeEventListener('paymentcancel', this._handlePaymentCancelled);
    this.removeEventListener('paymenterrored', this._handlePaymentErrored);
  }
}