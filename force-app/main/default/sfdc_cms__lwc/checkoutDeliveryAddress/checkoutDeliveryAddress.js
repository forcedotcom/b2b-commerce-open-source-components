import { api, wire, track } from 'lwc';
import { NavigationContext, navigate } from 'lightning/navigation';
import { getI18nCountries } from 'experience/internationalizationApi';
import { createCheckoutAddressesPageChangeAction, createCheckoutAddressesCreateAction, createCheckoutAddressesUpdateAction, dispatchAction, dispatchActionAsync } from 'commerce/actionApi';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { CheckoutComponentBase } from 'commerce/checkoutApi';
import { CheckoutStage } from 'commerce/checkoutApi';
import { getFormFactor, FORM_FACTOR_LARGE } from 'experience/clientApi';
import { CheckoutStencilType } from 'site/checkoutStencil';
import { CheckoutError } from 'site/checkoutErrorHandler';
import { checkoutStatusIsReady } from './utils';
import { getCustomLocale, getFormattedPhoneNumber, regionLabelCountryCodes } from 'site/checkoutInternationalization';
import { isSameContactPointAddress, isSameDeliveryAddress } from 'site/checkoutAddresses';
import { ekgElapsedTime, ekgEnd, ekgPublishLogs } from 'site/checkoutEkg';
import AddressModal, { AddressModalMode } from 'site/checkoutAddressModal';
import { Labels } from './labels';
import { createShippingAddressUpdateDataEvent, createBillingAddressUpdateDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
const DUMMY_CPA_ID = 'dummy';
const DEFAULT_ADDRESS_LIMIT = 6;
export const INPUT_ADDRESS_CHANGE_DEBOUNCE_WAIT = 3000;
export default class CheckoutDeliveryAddress extends CheckoutComponentBase {
  static renderMode = 'light';
  @api
  summaryModeEnabled = false;
  @api
  shippingAddressLimit;
  _shippingAddressLimitCurrent;
  get _coalesceShippingAddressLimit() {
    return this._shippingAddressLimitCurrent ?? (this.shippingAddressLimit ? Number(this.shippingAddressLimit) : DEFAULT_ADDRESS_LIMIT);
  }
  @api
  shippingAddressLimitIncrease;
  get _coalesceShippingAddressLimitIncrease() {
    return this.shippingAddressLimitIncrease ? Number(this.shippingAddressLimitIncrease) : DEFAULT_ADDRESS_LIMIT;
  }
  @api
  editAddressLabel;
  @api
  newAddressButtonLabel;
  @api
  showMoreButtonLabel;
  @api
  componentHeaderEditAddressLabel;
  @api
  showCompanyName = false;
  @api
  makeDefaultAddressLabel;
  @api
  splitShipLinkLabel;
  _checkoutAddresses;
  @api
  get checkoutAddresses() {
    return this._checkoutAddresses;
  }
  set checkoutAddresses(value) {
    this._checkoutAddresses = value;
    this.onSetProperties();
  }
  @track
  _checkoutDetails;
  @api
  get checkoutDetails() {
    return this._checkoutDetails;
  }
  set checkoutDetails(value) {
    this._checkoutDetails = value;
    this.onSetProperties();
  }
  @api
  cartDetails;
  _showPhoneNumber = false;
  _phoneNumberRequired = false;
  @api
  showPhoneNumber = false;
  @api
  phoneNumberRequired = false;
  get _hasSubscriptionProducts() {
    return Boolean(this.cartDetails?.hasSubscriptionProducts);
  }
  get _stencilType() {
    return this._shouldShowAddressList ? CheckoutStencilType.SHIPPING_ADDRESS_PICKER : CheckoutStencilType.SHIPPING_ADDRESS_EDIT;
  }
  get _shippingStencilItemCount() {
    return this._shouldShowAddressList ? 1 : 8;
  }
  @wire(getFormFactor)
  formFactor;
  get isDesktop() {
    return this.formFactor === FORM_FACTOR_LARGE;
  }
  get modalSize() {
    return this.isDesktop ? 'small' : 'full';
  }
  _showAddressLookup = true;
  _shouldShowAddressList = false;
  _shouldShowAddressForm = false;
  _showPersonName = true;
  _shouldShowShowMoreAddressesButton = false;
  _shouldShowNewAddressButton = false;
  _readonlyDefaultAddress = false;
  _isModalOpen = false;
  _splitShipEnabled = false;
  _navToSplitShip = false;
  _showStencil = true;
  _summarized = false;
  _readOnlyIfValid = false;
  _addressWasDirty = false;
  _displaySpinner = false;
  _shipToMultipleLocations = false;
  _skipPhoneNumberValidationEnabled = false;
  get _readOnly() {
    return this._readOnlyIfValid && this.checkValidity();
  }
  get _showSummary() {
    return !this._showStencil && this._summarized && !!this.address;
  }
  get _showEdit() {
    return !this._showStencil && !this._summarized;
  }
  get _showAddressList() {
    return this._showEdit && this._shouldShowAddressList;
  }
  get _showAddressForm() {
    return this._showEdit && this._shouldShowAddressForm;
  }
  get _showButtons() {
    return this._showEdit && this._showAddressList && (this._shouldShowShowMoreAddressesButton || this._shouldShowNewAddressButton);
  }
  get _disableEditAddressButton() {
    return !this._shouldShowNewAddressButton || this._selectedAddressId === DUMMY_CPA_ID;
  }
  _rawInternationalizationData;
  _rawInternationalizationDataPhone;
  _defaultCountry;
  _supportedCountries;
  get countryLabel() {
    const country = this.address?.country || '';
    return this._rawInternationalizationData?.addressCountries?.find(addressCountry => addressCountry.isoCode === country)?.label || country;
  }
  get stateLabel() {
    if (regionLabelCountryCodes.includes(this.address?.country || '')) {
      const countryData = this._rawInternationalizationData?.addressCountries?.find(addressCountry => addressCountry.isoCode === this.address?.country);
      const stateData = countryData?.states.find(state => state.isoCode === this.address?.region);
      return stateData?.label;
    }
    return this.address?.region;
  }
  get customLocale() {
    return getCustomLocale(this.address?.country || '');
  }
  _cpaItems = [];
  get _addresses() {
    if (this.address && this._selectedAddressId === DUMMY_CPA_ID) {
      const preexisting = {
        ...this.address,
        addressId: DUMMY_CPA_ID
      };
      return [preexisting].concat(this._cpaItems);
    }
    return this._cpaItems;
  }
  get _selectedAddressId() {
    if (this.address) {
      return this.address.addressId ?? DUMMY_CPA_ID;
    }
    return '';
  }
  get _detailsAddressAsCpa() {
    const detailsAddress = this.checkoutDetails?.deliveryGroups?.items[0].deliveryAddress;
    if (detailsAddress && !detailsAddress.addressId) {
      const cpaAddress = this._cpaItems.find(address => isSameDeliveryAddress(address, detailsAddress));
      if (cpaAddress) {
        return cpaAddress;
      }
    }
    return detailsAddress;
  }
  _cpaEnabled = true;
  _hasAccountAddressManagerAccess = true;
  @api
  get hasAccountAddressManagerAccess() {
    return this._hasAccountAddressManagerAccess;
  }
  set hasAccountAddressManagerAccess(value) {
    this._hasAccountAddressManagerAccess = value;
  }
  _pendingTimeout = null;
  _dirty = false;
  _saveAddressInProgress = false;
  @track
  _addressForForm;
  get address() {
    return this._dirty && this._shouldShowAddressForm && this.shippingAddressFormComponent?.address || this._addressForForm || this._detailsAddressAsCpa;
  }
  get addressHasCompanyName() {
    return !!this.address?.companyName;
  }
  get formattedPhoneNumber() {
    return this.address && this.showPhoneNumber ? getFormattedPhoneNumber(this.address?.phoneNumber) : undefined;
  }
  shippingAddressListComponent;
  shippingAddressFormComponent;
  get showSplitShip() {
    return this._splitShipEnabled;
  }
  shippingMultipleLocationsSummaryLabel = Labels.shippingMultipleLocationsSummaryLabel;
  phoneNumberLabel = Labels.phoneNumberLabel;
  get showSummaryAddress() {
    return this.hasSameAddressDeliveryGroups;
  }
  get hasSameAddressDeliveryGroups() {
    const items = this.checkoutDetails?.deliveryGroups?.items;
    if (!items || items.length < 2) {
      return true;
    }
    return items.every(dg => isSameDeliveryAddress(items[0].deliveryAddress, dg.deliveryAddress));
  }
  get hasMultipleDeliveryGroups() {
    return Boolean(this._checkoutDetails?.deliveryGroups?.items?.length && this._checkoutDetails?.deliveryGroups?.items?.length > 1);
  }
  get disableSplitShip() {
    return !checkoutStatusIsReady(this.checkoutDetails?.checkoutStatus);
  }
  _showScopedNotification = false;
  _scopedNotificationLabel;
  get showScopedNotification() {
    return Boolean(this._showScopedNotification && this._scopedNotificationLabel);
  }
  get scopedNotificationLabel() {
    return this._scopedNotificationLabel;
  }
  get displaySpinner() {
    return this._displaySpinner;
  }
  _sessionContext;
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (!response.loading) {
      this._sessionContext = response.data;
      this.onSetProperties();
    }
  }
  @wire(AppContextAdapter)
  appContextHandler(response) {
    if (!response.loading) {
      this._supportedCountries = response?.data?.shippingCountries;
      this._defaultCountry = response?.data?.country || response?.data?.shippingCountries[0] || '';
      this._splitShipEnabled = !!response?.data?.splitShipmentEnabled;
      this._skipPhoneNumberValidationEnabled = !!response?.data?.skipPhoneNumberValidationEnabled;
      this.onSetProperties();
    }
  }
  @wire(getI18nCountries, {
    excludeCountryFilter: true
  })
  internationalizationHandler(response) {
    if (!response.loading) {
      this._rawInternationalizationDataPhone = response.data;
      this.onSetProperties();
    }
  }
  @wire(NavigationContext)
  navContext;
  _onSetPropertiesInitialized = false;
  onSetProperties() {
    if (!this._sessionContext || !this.isConnected) {
      return;
    }
    if (this._sessionContext.isLoggedIn) {
      if (this._showStencil) {
        if (!this._shouldShowAddressList) {
          this.dispatchShippingAddressLimit(this._coalesceShippingAddressLimit);
        }
        this._shouldShowAddressList = true;
      }
    } else {
      this._cpaEnabled = false;
    }
    if (this._checkoutAddresses && this._cpaEnabled) {
      this._shouldShowShowMoreAddressesButton = !!this._checkoutAddresses?.hasNextPage;
      this._cpaItems = (this._checkoutAddresses?.items ?? []).slice(0, this._coalesceShippingAddressLimit);
    }
    if (this._checkoutDetails && this.summaryModeEnabled) {
      const hasDeliveryAddress = !!this._checkoutDetails.deliveryGroups?.items?.[0]?.deliveryAddress;
      const isPhoneFieldSatisfied = !this.phoneNumberRequired || !!this._checkoutDetails.deliveryGroups?.items?.[0]?.deliveryAddress?.phoneNumber;
      const summarizable = hasDeliveryAddress && isPhoneFieldSatisfied && !this._addressWasDirty;
      if (summarizable !== this._summarized) {
        this.dispatchRequestAspect({
          summarizable
        });
      }
    }
    if (!this._onSetPropertiesInitialized && this._rawInternationalizationDataPhone && this._supportedCountries && this._checkoutDetails && (!this._cpaEnabled || this._checkoutAddresses)) {
      this._onSetPropertiesInitialized = true;
      this._showStencil = false;
      this._rawInternationalizationData = {
        addressCountries: this._rawInternationalizationDataPhone?.addressCountries?.filter(country => this._supportedCountries?.includes(country.isoCode))
      };
      if (this._sessionContext.isLoggedIn) {
        this._shouldShowNewAddressButton = this._hasAccountAddressManagerAccess;
      }
      if (this._cpaItems.length > 0) {
        this._shouldShowAddressList = true;
      } else if (this._cpaEnabled && !this._shouldShowNewAddressButton) {
        this._shouldShowAddressForm = false;
        this._shouldShowAddressList = false;
        this.dispatchUpdateErrorAsync({
          groupId: 'DbbDeliveryAddressPerm',
          exception: new Error(CheckoutError.NO_DELIVERY_ADDRESSES)
        });
      } else {
        this._shouldShowAddressForm = true;
        this._shouldShowAddressList = false;
        if (this._sessionContext.isLoggedIn) {
          const deliveryAddress = this._checkoutDetails.deliveryGroups?.items?.[0]?.deliveryAddress;
          this._addressForForm = {
            ...deliveryAddress,
            isDefault: true
          };
        }
      }
      ekgElapsedTime('address');
      ekgEnd('t-address-3');
      ekgPublishLogs();
    }
    const groupId = 'DbbDeliveryAddressPhone';
    const type = '/site/commerceErrors/shipping-failure';
    const types = [type, '/commerce/integrations/shipping', '/commerce/integrations/other'];
    const hasErrorTypeNotGroup = this.checkoutDetails?.notifications?.find(n => n.groupId !== groupId && n.type && types.includes(n.type)) || this.checkoutDetails?.errors?.find(n => n.type && types.includes(n.type));
    const hasErrorGroup = this.checkoutDetails?.notifications?.find(n => n.groupId === groupId);
    if (!hasErrorTypeNotGroup && this.address && !this._showAddressForm && this.phoneNumberRequired && !this.formattedPhoneNumber) {
      if (!hasErrorGroup) {
        this.dispatchUpdateErrorAsync({
          groupId,
          type,
          exception: new Error(Labels.requiredShippingPhoneMissing)
        });
      }
    } else if (hasErrorGroup) {
      this.dispatchUpdateErrorAsync({
        groupId: 'DbbDeliveryAddressPhone'
      });
    }
  }
  _lastD360ShippingAddress;
  _lastD360BillingAddress;
  onSendAddressEvent() {
    const cartId = this.cartDetails?.cartId;
    const billingAddress = this.checkoutDetails?.billingInfo?.address;
    const isNewShippingAddress = !isSameDeliveryAddress(this._lastD360ShippingAddress, this.address);
    const isBillingSameAsShipping = isSameDeliveryAddress(billingAddress, this.address);
    const isNewBillingAddress = !isSameDeliveryAddress(this._lastD360BillingAddress, billingAddress);
    if (cartId && this.address && isNewShippingAddress) {
      this._lastD360ShippingAddress = {
        ...this.address
      };
      dispatchDataEvent(this, createShippingAddressUpdateDataEvent(cartId, this.address, isBillingSameAsShipping));
    }
    if (cartId && billingAddress && !isBillingSameAsShipping && isNewBillingAddress) {
      this._lastD360BillingAddress = {
        ...billingAddress
      };
      dispatchDataEvent(this, createBillingAddressUpdateDataEvent(cartId, billingAddress));
    }
    return Promise.resolve(true);
  }
  setAspect(newAspect) {
    if (newAspect.readOnlyIfValid || newAspect.summary) {
      this._addressWasDirty = false;
    }
    this._readOnlyIfValid = newAspect.readOnlyIfValid;
    this._summarized = newAspect.summary;
    if (newAspect.errorFocus) {
      if (!document.activeElement?.className?.split(' ')?.some(r => r === 'slds-has-error')) {
        this.querySelector('.slds-has-error')?.focus();
      }
    }
  }
  stageAction(checkoutStage) {
    switch (checkoutStage) {
      case CheckoutStage.CHECK_VALIDITY_UPDATE:
        return Promise.resolve(this.checkValidity());
      case CheckoutStage.REPORT_VALIDITY_SAVE:
        return this.reportValiditySave();
      case CheckoutStage.BEFORE_PAYMENT:
        return this.onSendAddressEvent();
      case CheckoutStage.ABORT_PAYMENT_SESSION:
        this._displaySpinner = false;
        this._navToSplitShip = false;
        return Promise.resolve(true);
      case CheckoutStage.PERSISTED:
        return Promise.resolve(this.navToSplitShip());
      default:
        return Promise.resolve(true);
    }
  }
  navToSplitShip() {
    this._showScopedNotification = false;
    this._displaySpinner = false;
    if (this._navToSplitShip && this._splitShipEnabled && this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Split_Shipment'
        }
      });
    }
    this._navToSplitShip = false;
    return true;
  }
  async dispatchFormRequest(deliveryAddressUpdate) {
    if (this.hasMultipleDeliveryGroups) {
      let deliveryGroups = [];
      if (this.checkoutDetails?.deliveryGroups?.items) {
        deliveryGroups = this.checkoutDetails.deliveryGroups.items.filter(dg => isSameDeliveryAddress(this.checkoutDetails?.deliveryGroups?.items[0].deliveryAddress, dg.deliveryAddress));
      }
      const params = deliveryGroups.map(dg => ({
        id: dg.id,
        deliveryAddress: deliveryAddressUpdate
      }));
      await this.dispatchUpdateAsync({
        deliveryGroups: {
          items: params
        }
      });
    } else {
      await this.dispatchUpdateAsync({
        defaultDeliveryGroup: {
          deliveryAddress: deliveryAddressUpdate
        }
      });
    }
  }
  async reportValiditySave() {
    const valid = this.reportValidity();
    if (!valid || !this._dirty) {
      if (this._shipToMultipleLocations) {
        this._showScopedNotification = true;
        this._scopedNotificationLabel = Labels.shipToMultipleLocationsNoAddressLabel;
      } else {
        this._showScopedNotification = false;
      }
      this._shipToMultipleLocations = false;
      this._displaySpinner = false;
      return Promise.resolve(valid);
    }
    let deliveryAddress = this.shippingAddressFormComponent?.address;
    try {
      if (this._cpaEnabled && deliveryAddress && !this._saveAddressInProgress) {
        this._saveAddressInProgress = true;
        await this.dispatchUpdateErrorAsync({
          groupId: 'DbbDeliveryAddress'
        });
        if (!deliveryAddress.addressId) {
          deliveryAddress = await this.createContactPointAddress({
            ...deliveryAddress,
            addressType: 'Shipping'
          });
        } else if (!isSameContactPointAddress(this._addressForForm, deliveryAddress)) {
          deliveryAddress = await this.updateContactPointAddress({
            ...deliveryAddress,
            addressType: 'Shipping'
          });
        }
        this._addressForForm = deliveryAddress;
      }
    } catch (e) {
      await this.dispatchUpdateErrorAsync({
        groupId: 'DbbDeliveryAddress',
        type: '/site/commerceErrors/shipping-failure',
        exception: e
      });
      return Promise.resolve(false);
    } finally {
      this._saveAddressInProgress = false;
    }
    if (deliveryAddress) {
      this.dispatchFormRequest(deliveryAddress);
      this._dirty = false;
    }
    return Promise.resolve(!this._dirty);
  }
  checkValidity() {
    if (this._showStencil) {
      return false;
    }
    if (this._isModalOpen) {
      return false;
    }
    if (this._showAddressForm) {
      return this.shippingAddressFormComponent?.checkValidity() ?? false;
    }
    if (this._showAddressList) {
      return !!this.shippingAddressListComponent?.checkValidity();
    }
    return this._showSummary;
  }
  reportValidity() {
    if (this._showStencil) {
      return false;
    }
    if (this._isModalOpen) {
      return false;
    }
    if (this._showAddressForm) {
      return this.shippingAddressFormComponent?.reportValidity() ?? false;
    }
    if (this._showAddressList) {
      return !!this.shippingAddressListComponent?.reportValidity();
    }
    return this._showSummary;
  }
  async handleAddressOptionChange(event) {
    const addressId = event.detail.value;
    const deliveryAddress = this._cpaItems.find(address => address.addressId === addressId);
    if (deliveryAddress) {
      this.dispatchFormRequest(deliveryAddress);
      this.dispatchCommit();
    }
  }
  async handleSubmit(mode, addressForForm) {
    let deliveryAddress;
    try {
      if (this._cpaEnabled && addressForForm) {
        await this.dispatchUpdateErrorAsync({
          groupId: 'DbbDeliveryAddress'
        });
        if (mode === AddressModalMode.CREATE) {
          deliveryAddress = await this.createContactPointAddress({
            ...addressForForm,
            addressType: 'Shipping'
          });
        }
        if (mode === AddressModalMode.EDIT) {
          deliveryAddress = await this.updateContactPointAddress({
            ...addressForForm,
            addressType: 'Shipping'
          });
        }
      }
    } catch (e) {
      await this.dispatchUpdateErrorAsync({
        groupId: 'DbbDeliveryAddress',
        type: '/site/commerceErrors/shipping-failure',
        exception: e
      });
    }
    if (deliveryAddress) {
      this.dispatchFormRequest(deliveryAddress);
    }
    this._dirty = false;
    this._addressWasDirty = false;
    this._isModalOpen = false;
    this.dispatchCommit();
    this.dispatchRequestAspect({
      summarizable: true
    });
  }
  async handleEditAddress(event) {
    const addressId = event.detail.value;
    const deliveryAddress = this._cpaItems.find(address => address.addressId === addressId);
    if (addressId && deliveryAddress) {
      this.dispatchFormRequest(deliveryAddress);
      this._isModalOpen = true;
      await AddressModal.open({
        size: this.modalSize,
        description: Labels.addressModalDescriptionLabel,
        mode: AddressModalMode.EDIT,
        showAddressLookup: this._showAddressLookup,
        address: {
          ...deliveryAddress
        },
        showCompanyName: this.showCompanyName,
        showPhoneNumber: this.showPhoneNumber,
        phoneNumberRequired: this.phoneNumberRequired,
        rawInternationalizationData: this._rawInternationalizationData,
        rawInternationalizationDataPhone: this._rawInternationalizationDataPhone,
        isLoggedIn: this._sessionContext?.isLoggedIn,
        supportedCountries: this._supportedCountries,
        defaultCountry: this._defaultCountry,
        skipPhoneNumberValidationEnabled: this._skipPhoneNumberValidationEnabled,
        onsubmit: e => {
          this.handleSubmit(AddressModalMode.EDIT, e.detail?.addressForForm);
          e?.detail?.close();
        },
        onaddressdirty: this.handleAddressDirty.bind(this),
        componentHeaderEditAddressLabel: this.componentHeaderEditAddressLabel
      });
      this._isModalOpen = false;
    }
  }
  handleShowMoreAddressesClicked() {
    this._shippingAddressLimitCurrent = this._coalesceShippingAddressLimit + this._coalesceShippingAddressLimitIncrease;
    this.dispatchShippingAddressLimit(this._coalesceShippingAddressLimit);
  }
  async handleNewAddressButtonClicked() {
    this._isModalOpen = true;
    await AddressModal.open({
      size: this.modalSize,
      description: Labels.addressModalDescriptionLabel,
      mode: AddressModalMode.CREATE,
      showAddressLookup: this._showAddressLookup,
      address: {
        street: '',
        isDefault: false
      },
      showCompanyName: this.showCompanyName,
      showPhoneNumber: this.showPhoneNumber,
      phoneNumberRequired: this.phoneNumberRequired,
      rawInternationalizationData: this._rawInternationalizationData,
      rawInternationalizationDataPhone: this._rawInternationalizationDataPhone,
      isLoggedIn: this._sessionContext?.isLoggedIn,
      supportedCountries: this._supportedCountries,
      defaultCountry: this._defaultCountry,
      skipPhoneNumberValidationEnabled: this._skipPhoneNumberValidationEnabled,
      onaddressdirty: this.handleAddressDirty.bind(this),
      onsubmit: e => {
        this.handleSubmit(AddressModalMode.CREATE, e.detail?.addressForForm);
        e?.detail?.close();
      },
      componentHeaderEditAddressLabel: this.componentHeaderEditAddressLabel
    });
    this._isModalOpen = false;
  }
  handleAddressChanged(_event) {
    this._dirty = true;
    this._addressWasDirty = true;
    if (this._pendingTimeout !== null) {
      clearTimeout(this._pendingTimeout);
    }
    this._pendingTimeout = setTimeout(() => {
      this.dispatchCommit();
    }, INPUT_ADDRESS_CHANGE_DEBOUNCE_WAIT);
  }
  handleAddressDirty(_event) {
    this._dirty = true;
    this._addressWasDirty = true;
  }
  handleShipToMultipleLocations(event) {
    event.preventDefault();
    if (!this._hasSubscriptionProducts) {
      this._displaySpinner = true;
      this._navToSplitShip = true;
      this._shipToMultipleLocations = true;
      this.dispatchEvent(new CustomEvent('navtosplitship', {
        detail: {
          nav: true
        },
        composed: true,
        bubbles: true
      }));
    } else {
      this._showScopedNotification = true;
      this._scopedNotificationLabel = Labels.shipmentWithSubscriptionLabel;
      this._shipToMultipleLocations = false;
    }
  }
  dispatchShippingAddressLimit(total) {
    dispatchAction(this, createCheckoutAddressesPageChangeAction(total));
  }
  createContactPointAddress(address) {
    return dispatchActionAsync(this, createCheckoutAddressesCreateAction(address));
  }
  updateContactPointAddress(address) {
    return dispatchActionAsync(this, createCheckoutAddressesUpdateAction(address));
  }
  renderedCallback() {
    this.shippingAddressListComponent = this.refs.shippingAddressList;
    this.shippingAddressFormComponent = this.refs.shippingAddressForm;
  }
  connectedCallback() {
    this.onSetProperties();
  }
  constructor() {
    super();
    if (this._hasAccountAddressManagerAccess) {
      this.onSetProperties();
    }
  }
}