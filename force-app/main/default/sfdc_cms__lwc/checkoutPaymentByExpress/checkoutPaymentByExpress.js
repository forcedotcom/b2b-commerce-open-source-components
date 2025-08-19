import { LightningElement, api, track } from 'lwc';
import Toast from 'site/commonToast';
import { ExpressMode } from './ExpressMode';
export { ExpressMode } from './ExpressMode';
import { checkoutReload, checkoutUpdate, postAuthorizePayment, checkoutPlaceOrder, checkoutStatusIsReady } from 'commerce/checkoutCartApi';
import { createCheckoutPaymentDataEvent, createCheckoutPaymentRenderDataEvent, dispatchDataEvent, creatOrderAcceptedDataEvent } from 'commerce/dataEventApi';
import { createCartInventoryReserveAction, dispatchActionAsync } from 'commerce/actionApi';
import { splitName } from 'site/checkoutInternationalization';
const DEFAULTCONTACTINFO = {
  phoneNumber: '',
  email: ''
};
function paymentCompleted(responseCode, data) {
  return responseCode === 0 && data.paymentToken !== undefined;
}
export default class CheckoutPaymentByExpress extends LightningElement {
  static renderMode = 'light';
  @track
  _labels;
  @api
  set labels(value) {
    this._labels = value;
    this._paymentProcessingLabel = value?.paymentProcessingLabel;
  }
  get labels() {
    return this._labels;
  }
  @api
  paymentMethodSetId;
  @api
  useManualCapture = false;
  @api
  maximumButtonCount = undefined;
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
  isLoggedIn = false;
  @api
  expressMode = ExpressMode.DEFAULT;
  @api
  set cartSummary(cartSummaryValue) {
    if (cartSummaryValue) {
      this._cartSummaryValue = cartSummaryValue;
      this._grandTotalAmount = cartSummaryValue?.grandTotalAmount;
      this._uniqueProductCount = cartSummaryValue?.uniqueProductCount;
      this._cartId = cartSummaryValue?.cartId;
      this._hasSubscriptionProducts = cartSummaryValue?.totalSubProductCount !== undefined && parseFloat(cartSummaryValue?.totalSubProductCount) > 0;
    }
  }
  get cartSummary() {
    return this._cartSummaryValue;
  }
  @api
  set defaultCurrency(value) {
    this._currencyIsoCode = value;
  }
  get defaultCurrency() {
    return this._currencyIsoCode;
  }
  @api
  inventoryConfiguration;
  @api
  rawInternationalizationData;
  @api
  effectiveAccountId;
  @api
  webstoreId;
  @api
  cartTotals;
  _errorLabels = [];
  _cartSummaryValue;
  _currencyIsoCode;
  _grandTotalAmount;
  _totalTaxAmount;
  _shippingPrice;
  _totalProductAmount;
  _cartId;
  _uniqueProductCount;
  _hasMultipleDeliveryGroups = false;
  _hasSubscriptionProducts = false;
  _paymentProcessingLabel;
  _cartTotalData;
  _adjustedProductAmount;
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
  _shippingAddressRequired = true;
  _emailAddressRequired = true;
  _phoneNumberRequired = true;
  _checkoutId;
  _orderReferenceNumber;
  _paymentMethodsAvailable = [];
  contactInfo = DEFAULTCONTACTINFO;
  _handlePaymentButtonsAvailable = this.handlePaymentButtonsAvailable.bind(this);
  @track
  _checkoutDetails;
  @api
  get checkoutDetails() {
    return this._checkoutDetails;
  }
  set checkoutDetails(value) {
    this._checkoutDetails = value;
    this.setCheckoutInformation();
  }
  setCheckoutInformation() {
    const checkoutData = this.checkoutDetails;
    this._isLoading = !checkoutStatusIsReady(this.checkoutDetails?.checkoutStatus);
    if (!checkoutData || this._isLoading) {
      this._availableDeliveryMethods = [];
      this._hasMultipleDeliveryGroups = false;
    } else {
      this._checkoutId = checkoutData.checkoutId;
      this._orderReferenceNumber = checkoutData.orderReferenceNumber;
      this._hasLoaded = checkoutStatusIsReady(checkoutData?.checkoutStatus);
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
      }
      this._availableDeliveryMethods = checkoutData?.deliveryGroups?.items[0].availableDeliveryMethods ?? [];
      this._selectedDeliveryMethod = checkoutData?.deliveryGroups?.items[0].selectedDeliveryMethod;
      this._hasMultipleDeliveryGroups = (checkoutData.deliveryGroups?.items.length ?? 0) > 1;
    }
    this.setCartDataFromCheckoutDetails();
  }
  setCartDataFromCheckoutDetails() {
    if (this.checkoutDetails) {
      const cartData = this.checkoutDetails?.cartSummary;
      if (cartData) {
        this._currencyIsoCode = cartData?.currencyIsoCode;
        this._grandTotalAmount = cartData?.grandTotalAmount;
        this._totalTaxAmount = cartData?.totalTaxAmount;
        this._shippingPrice = cartData.totalChargeAmount;
        this._totalProductAmount = cartData.totalProductAmount;
        this._cartId = cartData?.cartId;
        this._uniqueProductCount = cartData?.uniqueProductCount;
        this._adjustedProductAmount = this.cartTotals?.adjustedProductAmount;
        this._hasSubscriptionProducts = cartData?.totalSubProductCount !== undefined && parseFloat(cartData.totalSubProductCount) > 0;
        if (this._shippingAddressRequired && this._hasLoaded) {
          if (this._availableDeliveryMethods && this._availableDeliveryMethods.length > 0) {
            this.setShippingUpdates(this._availableDeliveryMethods);
          }
        }
        this._cartTotalData = {
          grandTotal: Number(this._grandTotalAmount),
          productAmount: Number(this._totalProductAmount),
          adjustedProductAmount: Number(this._adjustedProductAmount),
          taxAmount: Number(this._totalTaxAmount),
          chargeAmount: Number(this._shippingPrice)
        };
      } else {
        this._uniqueProductCount = undefined;
      }
    }
  }
  @api
  guestCheckoutEnabled = false;
  get canCheckout() {
    return !!this.guestCheckoutEnabled;
  }
  get total() {
    return this._grandTotalAmount;
  }
  get canExpressCheckout() {
    return this.canCheckout && !this._hasSubscriptionProducts && !this._hasMultipleDeliveryGroups && Number(this.total) > 0 && this._uniqueProductCount > 0;
  }
  get isGuestUser() {
    return !this.isLoggedIn;
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
    this.dispatchEvent(new CustomEvent('expressbuttonclick', {
      bubbles: true,
      composed: false
    }));
    if (this.canCheckout && this.expressMode !== ExpressMode.MINICART) {
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
  handleExpressButtonBeforeApproval(event) {
    const validation = this.doValidationBeforeApproval(event);
    event.detail.addValidation(validation);
    validation.catch(() => {
      Toast.show({
        label: this.labels?.paymentErrorTitle ?? '',
        message: this.labels?.paymentErrorMessage,
        variant: 'error'
      }, this);
    });
  }
  get isInventoryReservationSkipped() {
    return !(this.inventoryConfiguration?.isInventoryEnabled && this.inventoryConfiguration?.inventoryDefaultSource);
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
    if (this?.labels?.paymentCancelMessageLabel) {
      Toast.show({
        label: this.labels.paymentCancelMessageLabel,
        variant: 'info'
      }, this);
    }
  }
  async completePayment() {
    try {
      if (this._paymentConfirmResponse) {
        const successResponse = this._paymentConfirmResponse.data;
        const billingDetailsFromProvider = successResponse.billingDetails;
        if (paymentCompleted(this._paymentConfirmResponse.responseCode, successResponse) && this._checkoutId) {
          const res = await postAuthorizePayment(this._checkoutId, successResponse?.paymentToken, this.transformToPaymentAddress(billingDetailsFromProvider), successResponse?.paymentData);
          const result = await checkoutPlaceOrder();
          if (result?.orderReferenceNumber) {
            this.navigateToOrder(result.orderReferenceNumber);
            const paymentData = {
              isExpressPayment: true,
              paymentMethod: successResponse.paymentMethodSelected,
              initialOrn: result.orderReferenceNumber,
              isManualCapture: this.useManualCapture,
              paymentMethods: this._paymentMethodsAvailable
            };
            if (this._cartId && res.salesforceResultCode === 'Success') {
              dispatchDataEvent(this, createCheckoutPaymentDataEvent(this._cartId, paymentData));
              if (this._currencyIsoCode && this._cartTotalData) {
                dispatchDataEvent(this, creatOrderAcceptedDataEvent(result.orderReferenceNumber, this._cartId, this._currencyIsoCode, this._cartTotalData));
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
        contactInfo
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
      this._requestShippingChange = true;
      if (this.isGuestUser) {
        this._postProcessPaymentNeeded = true;
        await this.updateContactInfo(billingDetailsFromProvider);
      } else {
        this._postProcessPaymentNeeded = false;
        this.completePayment();
      }
    } catch (e) {
      this.generateErrors(e);
      this._showPaymentProcessingSpinner = false;
    }
  }
  async processShippingMethodUpdate(deliveryMethodId) {
    try {
      await checkoutUpdate({
        body: {
          deliveryMethodId
        }
      });
    } catch (e) {
      this.generateErrors(e);
    }
  }
  async processShippingAddressUpdate(deliveryAddress) {
    if (deliveryAddress) {
      await checkoutUpdate({
        body: {
          deliveryAddress
        },
        options: {
          omitAddressName: true
        }
      });
    }
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
      name: this.labels?.productAmountTitle,
      amount: Number(this._totalProductAmount)
    });
    lineItems.push({
      name: this.labels?.taxTitle,
      amount: Number(this._totalTaxAmount)
    });
    lineItems.push({
      name: this.labels?.shippingTitle,
      amount: Number(this._shippingPrice)
    });
    this._expressShippingUpdates = {
      grandTotalAmount: this._grandTotalAmount,
      shippingMethods: availableDeliveryMethods,
      lineItems: lineItems,
      selectedShippingMethod: this._selectedDeliveryMethod
    };
  }
  navigateToOrder(orderNumber) {
    this.dispatchEvent(new CustomEvent('navigateorderconfirmation', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        orderNumber: orderNumber
      }
    }));
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
      process: 'Managed Checkout',
      standardReferences: {
        accountId: this.effectiveAccountId,
        webStoreId: this.webstoreId,
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
    const countryData = this.rawInternationalizationData?.addressCountries?.find(addressCountry => addressCountry.isoCode === address.country);
    const stateData = countryData?.states.find(state => state.isoCode === address.region);
    if (!stateData) {
      return false;
    }
    return true;
  }
}