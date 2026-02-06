import { LightningElement, api, wire, track } from 'lwc';
import currency from '@salesforce/i18n/currency';
import { labels } from './labels';
import Toast from 'site/commonToast';
import { createCartInventoryReserveAction, dispatchActionAsync } from 'commerce/actionApi';
import { ExpressMode } from './types';
import { splitName } from 'site/checkoutInternationalization';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { navigate, NavigationContext } from 'lightning/navigation';
import { createCheckoutPaymentDataEvent, createCheckoutPaymentRenderDataEvent, dispatchDataEvent, creatOrderAcceptedDataEvent } from 'commerce/dataEventApi';
import { CheckoutAdapter, checkoutStatusIsReady, CartStatusAdapter, checkoutPlaceOrder, checkoutReload, checkoutUpdate, postAuthorizePayment } from 'commerce/checkoutCartApi';
import { getI18nCountries } from 'experience/internationalizationApi';
const DEFAULTCONTACTINFO = {
  phoneNumber: '',
  email: ''
};
function paymentCompleted(responseCode, data) {
  return responseCode === 0 && data.paymentToken !== undefined;
}
export default class PaymentByExpress extends LightningElement {
  static renderMode = 'light';
  @api
  paymentMethodSetId;
  @api
  useManualCapture = false;
  @api
  buttonShape;
  get _buttonShape() {
    return this.buttonShape || 'pill';
  }
  @api
  sectionLabel;
  get _sectionLabel() {
    return this.sectionLabel || '';
  }
  @api
  buttonSize;
  @api
  applepayColor;
  get _applepayColor() {
    return this.applepayColor || 'black';
  }
  @api
  googlepayColor;
  get _googlepayColor() {
    return this.googlepayColor || 'black';
  }
  @api
  paypalColor;
  get _paypalColor() {
    return this.paypalColor || 'gold';
  }
  @api
  venmoColor;
  get _venmoColor() {
    return this.venmoColor || 'blue';
  }
  @api
  applepayLabel;
  get _applepayLabel() {
    return this.applepayLabel || 'plain';
  }
  @api
  googlepayLabel;
  get _googlepayLabel() {
    return this.googlepayLabel || 'plain';
  }
  @api
  paypalLabel;
  get _paypalLabel() {
    return this.paypalLabel || 'paypal';
  }
  @api
  venmoLabel;
  get _venmoLabel() {
    return this.venmoLabel || 'paypal';
  }
  _errorLabels = [];
  _currencyIsoCode = currency;
  _grandTotalAmount;
  _totalTaxAmount;
  _shippingPrice;
  _totalProductAmount;
  _cartId;
  _uniqueProductCount;
  _hasMultipleDeliveryGroups = false;
  _hasSubscriptionProducts = false;
  _paymentProcessingLabel = labels.paymentProcessingLabel;
  _paymentCancelMessage = labels.paymentCancelMessageLabel;
  _adjustedProductAmount;
  _inventoryConfiguration;
  @track
  _expressShippingUpdates = {};
  _isLoading = true;
  _hasLoaded = false;
  _requestShippingChange = false;
  _postProcessPaymentNeeded = false;
  _paymentConfirmResponse;
  _address;
  _availableDeliveryMethods;
  _selectedDeliveryMethod;
  _showPaymentProcessingSpinner = false;
  _isManagedEnabled = false;
  _webstoreId;
  _effectiveAccountId;
  _shippingAddressRequired = true;
  _emailAddressRequired = true;
  _phoneNumberRequired = true;
  _checkoutId;
  _orderReferenceNumber;
  _paymentMethodsAvailable = [];
  _isLoggedIn = false;
  contactInfo = DEFAULTCONTACTINFO;
  navigationContext;
  _handlePaymentButtonsAvailable = this.handlePaymentButtonsAvailable.bind(this);
  @wire(AppContextAdapter)
  appContextHandler(response) {
    if (!response?.loading) {
      this._inventoryConfiguration = response?.data?.inventoryConfiguration;
      this._webstoreId = response?.data?.webstoreId;
      this._isManagedEnabled = !!response?.data?.checkoutSettings?.isManagedCheckoutEnabled;
    }
  }
  @wire(NavigationContext)
  navigationContextHandler(navigationContext) {
    this.navigationContext = navigationContext;
  }
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (response?.data) {
      this._isLoggedIn = response?.data?.isLoggedIn;
      if (this._isLoggedIn) {
        this._effectiveAccountId = response?.data?.effectiveAccountId;
      }
    }
  }
  @wire(CheckoutAdapter)
  checkoutAdapterHandler({
    data,
    loading
  }) {
    this._isLoading = !checkoutStatusIsReady(data?.checkoutStatus);
    if (!data || loading) {
      this._availableDeliveryMethods = [];
      this._hasMultipleDeliveryGroups = false;
    } else {
      this._checkoutId = data.checkoutId;
      this._orderReferenceNumber = data.orderReferenceNumber;
      this._hasLoaded = checkoutStatusIsReady(data?.checkoutStatus);
      if (this._hasLoaded) {
        if (this._requestShippingChange === true) {
          this._requestShippingChange = false;
          this.processShippingAddressUpdate(this._address);
          if (this._postProcessPaymentNeeded === true) {
            return;
          }
        }
        if (this._postProcessPaymentNeeded === true) {
          this._postProcessPaymentNeeded = false;
          this.completePayment();
        }
        this._availableDeliveryMethods = data?.deliveryGroups?.items[0].availableDeliveryMethods ?? [];
        this._selectedDeliveryMethod = data?.deliveryGroups?.items[0].selectedDeliveryMethod;
        this._hasMultipleDeliveryGroups = (data.deliveryGroups?.items.length ?? 0) > 1;
        if (data.cartSummary) {
          const cartData = data.cartSummary;
          this._currencyIsoCode = cartData?.currencyIsoCode;
          this._grandTotalAmount = cartData?.grandTotalAmount;
          this._totalTaxAmount = cartData?.totalTaxAmount;
          this._shippingPrice = cartData.totalChargeAmount;
          this._totalProductAmount = cartData.totalProductAmount;
          this._cartId = cartData?.cartId;
          this._uniqueProductCount = cartData?.uniqueProductCount;
          this._adjustedProductAmount = cartData?.totalProductAmountAfterAdjustments;
          this._hasSubscriptionProducts = cartData?.totalSubProductCount !== undefined && parseFloat(cartData.totalSubProductCount) > 0;
          if (this._shippingAddressRequired && this._availableDeliveryMethods && this._availableDeliveryMethods.length > 0) {
            this.setShippingUpdates(this._availableDeliveryMethods);
          }
        } else {
          this._uniqueProductCount = undefined;
        }
      }
    }
  }
  @wire(CartStatusAdapter)
  checkoutCapabilitiesHandler;
  _rawInternationalizationData;
  @wire(getI18nCountries, {
    excludeCountryFilter: false
  })
  internationalizationHandler(response) {
    if (!response.loading) {
      this._rawInternationalizationData = response.data;
    }
  }
  get canCheckout() {
    return !!this.checkoutCapabilitiesHandler?.data?.isGuestCheckoutEnabled;
  }
  get total() {
    return this._grandTotalAmount;
  }
  get canExpressCheckout() {
    return this.canCheckout && !this._hasSubscriptionProducts && !this._hasMultipleDeliveryGroups && Number(this.total) > 0 && this._uniqueProductCount > 0;
  }
  get isGuestUser() {
    return !this._isLoggedIn;
  }
  handlePaymentButtonsAvailable(event) {
    event.stopPropagation();
    const customEvent = event;
    this._paymentMethodsAvailable = customEvent?.detail?.paymentMethodsAvailable;
    const paymentData = {
      isExpressPayment: true,
      paymentMethod: undefined,
      initialOrn: this._orderReferenceNumber,
      isManualCapture: this.useManualCapture,
      paymentMethods: this._paymentMethodsAvailable
    };
    if (this._cartId) {
      dispatchDataEvent(this, createCheckoutPaymentRenderDataEvent(this._cartId, paymentData));
    }
  }
  async handleExpressButtonClick() {
    if (this.canCheckout) {
      await checkoutReload();
    }
  }
  handleShippingAddressChange(event) {
    const shippingAddress = event.detail.shippingAddress;
    if (shippingAddress) {
      const formattedAddress = Object.assign({}, shippingAddress);
      formattedAddress.region = shippingAddress.state;
      formattedAddress.country = shippingAddress.country;
      const isValid = this.validateAddress(formattedAddress);
      if (!isValid) {
        this._expressShippingUpdates = {
          grandTotalAmount: this._grandTotalAmount,
          shippingMethods: [],
          lineItems: [],
          selectedShippingMethod: this._selectedDeliveryMethod,
          errors: 'state_error'
        };
        this._requestShippingChange = false;
        return;
      }
      this._requestShippingChange = true;
      const address = Object.assign({}, shippingAddress);
      address.city = shippingAddress.city;
      address.postalCode = shippingAddress.postal_code;
      address.region = shippingAddress.state;
      address.country = shippingAddress.country;
      address.street = 'Not applicable';
      this._address = address;
      if (this._hasLoaded) {
        this.processShippingAddressUpdate(this._address);
      }
    }
  }
  handleShippingRateChange(event) {
    let item1 = null;
    if (this._availableDeliveryMethods) {
      if (event.detail.shippingRate.displayName) {
        item1 = this._availableDeliveryMethods.find(i => i.name === event.detail.shippingRate.displayName);
      } else if (event.detail.shippingRate.id) {
        item1 = this._availableDeliveryMethods.find(i => i.id === event.detail.shippingRate.id);
      }
      if (item1) {
        this.processShippingMethodUpdate(item1.id);
      }
    }
  }
  async doValidationBeforeApproval(event) {
    const customEvent = event;
    const billingDetails = customEvent.detail.billingDetails;
    const formattedAddress = Object.assign({}, billingDetails.address);
    formattedAddress.region = billingDetails.address.state;
    formattedAddress.country = billingDetails.address.country;
    const isValid = this.validateAddress(formattedAddress, true);
    if (!isValid) {
      throw new Error();
    }
    if (!billingDetails.phone) {
      throw new Error();
    }
    if (this.isInventoryReservationSkipped) {
      return Promise.resolve();
    }
    const data = await dispatchActionAsync(this, createCartInventoryReserveAction());
    if (!data.success) {
      throw new Error();
    }
    return Promise.resolve();
  }
  handleExpressButtonBeforeApproval(event) {
    const validation = this.doValidationBeforeApproval(event);
    event.detail.addValidation(validation);
    validation.catch(() => {
      Toast.show({
        label: labels.paymentErrorTitle,
        message: labels.paymentErrorMessage,
        variant: 'error'
      }, this);
    });
  }
  handlePaymentApproval(event) {
    event.stopPropagation();
    this._showPaymentProcessingSpinner = true;
    const response = event.detail;
    const successResponse = response.data;
    this._paymentConfirmResponse = response;
    this.processContactAndAddress(successResponse);
  }
  handlePaymentCancellation(event) {
    event.stopPropagation();
    Toast.show({
      label: this._paymentCancelMessage,
      variant: 'info'
    }, this);
  }
  async completePayment() {
    try {
      if (this._paymentConfirmResponse) {
        const successResponse = this._paymentConfirmResponse.data;
        const billingDetailsFromProvider = successResponse.billingDetails;
        if (paymentCompleted(this._paymentConfirmResponse.responseCode, successResponse) && this._checkoutId) {
          const res = await postAuthorizePayment(this._checkoutId, successResponse?.paymentToken, this.transformToPaymentAddress(billingDetailsFromProvider), {
            isExpress: true,
            ...successResponse?.paymentData
          });
          const result = await checkoutPlaceOrder();
          if (result?.orderReferenceNumber && this.navigationContext) {
            this.navigateToOrder(this.navigationContext, result.orderReferenceNumber);
            const paymentData = {
              isExpressPayment: true,
              paymentMethod: successResponse.paymentMethodSelected,
              initialOrn: result.orderReferenceNumber,
              isManualCapture: this.useManualCapture,
              paymentMethods: this._paymentMethodsAvailable
            };
            if (this._cartId && res.salesforceResultCode === 'Success') {
              dispatchDataEvent(this, createCheckoutPaymentDataEvent(this._cartId, paymentData));
              const cartTotalData = {
                grandTotal: Number(this._grandTotalAmount),
                productAmount: Number(this._totalProductAmount),
                adjustedProductAmount: Number(this._adjustedProductAmount),
                taxAmount: Number(this._totalTaxAmount),
                chargeAmount: Number(this._shippingPrice)
              };
              if (this._currencyIsoCode && cartTotalData) {
                dispatchDataEvent(this, creatOrderAcceptedDataEvent(result.orderReferenceNumber, this._cartId, this._currencyIsoCode, cartTotalData));
              }
            }
          } else {
            throw new Error('Required orderReferenceNumber is missing');
          }
          this._showPaymentProcessingSpinner = false;
        }
      }
    } catch (e) {
      this.generateErrors(e);
      this._showPaymentProcessingSpinner = false;
    }
  }
  async updateContactInfo(billingDetails) {
    const contactInfo = {
      ...this.contactInfo
    };
    contactInfo.email = billingDetails.email;
    contactInfo.phoneNumber = billingDetails.phone;
    const {
      firstName,
      lastName
    } = splitName(billingDetails.name, billingDetails.address?.country);
    contactInfo.firstName = firstName;
    contactInfo.lastName = lastName;
    contactInfo.isoCountryCodeForPhoneNumber = billingDetails.address?.country;
    this.contactInfo = contactInfo;
    await checkoutUpdate({
      body: {
        contactInfo: this.contactInfo
      }
    });
  }
  async processContactAndAddress(successResponse) {
    const billingDetailsFromProvider = successResponse.billingDetails;
    const shippingDetailsFromProvider = successResponse.shippingDetails;
    try {
      let address;
      address = Object.assign({}, address);
      address = this.transformToShippingAddress(shippingDetailsFromProvider);
      this._address = address;
      if (this.isGuestUser) {
        this._postProcessPaymentNeeded = true;
        this._requestShippingChange = true;
        await this.updateContactInfo(billingDetailsFromProvider);
      } else {
        this._postProcessPaymentNeeded = false;
        this._requestShippingChange = false;
        await this.processShippingAddressUpdate(this._address);
        this.completePayment();
      }
    } catch (e) {
      this.generateErrors(e);
      this._showPaymentProcessingSpinner = false;
    }
  }
  async processShippingMethodUpdate(deliveryMethodId) {
    await checkoutUpdate({
      body: {
        deliveryMethodId: deliveryMethodId
      }
    });
  }
  async processShippingAddressUpdate(address) {
    await checkoutUpdate({
      body: {
        deliveryAddress: address
      },
      options: {
        omitAddressName: true
      }
    });
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
  transformToShippingAddress(shippingDetails) {
    return {
      city: shippingDetails.address.city,
      country: shippingDetails.address.country,
      name: shippingDetails.name,
      postalCode: shippingDetails.address.postalCode,
      region: shippingDetails.address.state,
      street: shippingDetails.address.line1
    };
  }
  setShippingUpdates(availableDeliveryMethods) {
    const lineItems = [];
    lineItems.push({
      name: labels.productAmountTitle,
      amount: Number(this._totalProductAmount)
    });
    lineItems.push({
      name: labels.taxTitle,
      amount: Number(this._totalTaxAmount)
    });
    lineItems.push({
      name: labels.shippingTitle,
      amount: Number(this._shippingPrice)
    });
    this._expressShippingUpdates = {
      grandTotalAmount: this._grandTotalAmount,
      shippingMethods: availableDeliveryMethods,
      lineItems: lineItems,
      selectedShippingMethod: this._selectedDeliveryMethod
    };
  }
  get isInventoryReservationSkipped() {
    return !(this._inventoryConfiguration?.isInventoryEnabled && this._inventoryConfiguration?.inventoryDefaultSource);
  }
  navigateToOrder(navigationContext, orderNumber) {
    navigate(navigationContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Order'
      },
      state: {
        orderNumber: orderNumber
      }
    });
  }
  generateErrors(exception) {
    if (exception instanceof Error) {
      this._errorLabels.push(exception.message);
    } else {
      this._errorLabels.push(String(exception));
    }
  }
  connectedCallback() {
    this.addEventListener('paymentbuttonsavailable', this._handlePaymentButtonsAvailable);
  }
  disconnectedCallback() {
    this.removeEventListener('paymentbuttonsavailable', this._handlePaymentButtonsAvailable);
  }
  get _paymentInitiationSource() {
    return {
      application: 'Commerce',
      process: this._isManagedEnabled ? 'Managed Checkout' : 'Custom Checkout',
      standardReferences: {
        accountId: this._effectiveAccountId,
        webStoreId: this._webstoreId,
        webCartId: this._cartId
      }
    };
  }
  validateAddress(address, isBilling = false) {
    if (isBilling) {
      if (!address.region || address.region.length <= 0) {
        return true;
      }
    } else {
      if (!address.region) {
        return false;
      }
    }
    const countryData = this._rawInternationalizationData?.addressCountries?.find(addressCountry => addressCountry.isoCode === address.country);
    const stateData = countryData?.states.find(state => state.isoCode === address.region);
    if (!stateData) {
      return false;
    }
    return true;
  }
  get _expressMode() {
    return ExpressMode.DEFAULT;
  }
}