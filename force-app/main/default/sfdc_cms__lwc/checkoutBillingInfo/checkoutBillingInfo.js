import { api, wire } from 'lwc';
import { getI18nCountries } from 'experience/internationalizationApi';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { CheckoutComponentBase } from 'commerce/checkoutApi';
import { CheckoutStage } from 'commerce/checkoutApi';
import { getCustomLocale } from 'site/checkoutInternationalization';
import { isSameBillingAddress } from 'site/checkoutAddresses';
import a11yBillingAddressLabel from '@salesforce/label/site.checkoutBillingInfo.a11yBillingAddressLabel';

/**
 * @slot heading
 */
export default class CheckoutBillingInfo extends CheckoutComponentBase {
  static renderMode = 'light';
  _expandedMode = false;
  _hideBillingInExpandedMode = false;
  _selectedAddress;
  _a11yBillingAddressLabel = a11yBillingAddressLabel;
  @api
  set expandedMode(value) {
    this._expandedMode = value;
    this.onSetProperties();
  }
  get expandedMode() {
    return this._expandedMode;
  }
  @api
  billingAddressSameAsShippingAddressLabel;
  @api
  checkoutDetails;
  _showAddressLookup = true;
  _showSummary = false;
  _readOnly = true;
  get _showEdit() {
    return !this._showSummary;
  }
  _showName = true;
  _dirty = false;
  _rawInternationalizationData;
  _defaultCountry;
  _showAllCountries = true;
  _sessionContext;
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (!response.loading) {
      this._sessionContext = response.data;
      this.onSetProperties();
    }
  }
  onSetProperties() {
    if (!this._sessionContext || !this.isConnected) {
      return;
    }
    if (this.expandedMode) {
      this._readOnly = false;
      this._showName = true;
    } else {
      this._showName = !this._sessionContext.isLoggedIn;
    }
  }
  @wire(AppContextAdapter)
  appContextHandler(response) {
    this._defaultCountry = response?.data?.country || response?.data?.shippingCountries[0] || '';
  }
  @wire(getI18nCountries, {
    excludeCountryFilter: true
  })
  internationalizationHandler(response) {
    this._rawInternationalizationData = response?.data;
  }
  setAspect(newAspect) {
    this._readOnly = newAspect.readOnlyIfValid && this.checkValidity();
    this._showSummary = newAspect.summary;
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
        return Promise.resolve(this.reportValidity());
      default:
        return Promise.resolve(true);
    }
  }
  get useShippingAddressForBilling() {
    if (this.expandedMode) {
      return false;
    }
    return this.checkoutDetails?.formStatus?.useShippingAddressForBilling ?? true;
  }
  get address() {
    return this._dirty && this.billingAddressComponent?.address || this.checkoutDetails?.billingInfo?.address;
  }
  get customLocale() {
    return getCustomLocale(this.address?.country ?? '');
  }
  get countryLabel() {
    const country = this.address?.country ?? '';
    return this._rawInternationalizationData?.addressCountries?.find(addressCountry => addressCountry.isoCode === country)?.label ?? country;
  }
  get billingAddressClasses() {
    return this.useShippingAddressForBilling || this.expandedMode && this._hideBillingInExpandedMode ? 'slds-hide' : '';
  }
  get showMultipleBillingAddresses() {
    return this.useShippingAddressForBilling && (this.checkoutDetails?.deliveryGroups?.items ?? []).length > 1 || this.expandedMode && this._hideBillingInExpandedMode;
  }
  get billingAddressComponent() {
    return this.querySelector('[data-billing-input-address]');
  }
  get deliveryGroupAddresses() {
    return this.checkoutDetails?.deliveryGroups?.items.filter(obj => obj.deliveryAddress !== undefined).map(addr => addr.deliveryAddress);
  }
  handleSelectedAddressChange(event) {
    event.stopPropagation();
    this._selectedAddress = event.detail.value;
    this.updateForm(this.useShippingAddressForBilling);
  }
  async updateForm(useShippingAddressForBilling) {
    if (useShippingAddressForBilling) {
      if (!!this._selectedAddress && !!this.checkoutDetails?.deliveryGroups?.items && this.checkoutDetails.deliveryGroups.items.length > 1) {
        const associatedGroupId = this.checkoutDetails.deliveryGroups.items.find(itm => isSameBillingAddress(this._selectedAddress, itm.deliveryAddress))?.id;
        await this.dispatchUpdateAsync({
          billingInfo: {
            addressDeliveryGroupId: associatedGroupId
          }
        });
      } else {
        await this.dispatchUpdateAsync({
          billingInfo: {
            address: null
          }
        });
      }
      this._dirty = false;
      this.dispatchCommit();
    } else if (this.checkValidity()) {
      let address = null;
      if (this.billingAddressComponent?.address) {
        address = this.billingAddressComponent?.address;
      }
      await this.dispatchUpdateAsync({
        billingInfo: {
          address
        }
      });
      this._dirty = false;
      this.dispatchCommit();
    } else {
      await this.dispatchUpdateAsync({
        billingInfo: {
          address: {
            street: ''
          }
        }
      });
      this.dispatchCommit();
    }
  }
  handleBillingAddressOptionChange(event) {
    this._hideBillingInExpandedMode = event.target.checked;
    this.updateForm(event.target.checked);
  }
  handleAddressChange(_event) {
    this.updateForm(this.useShippingAddressForBilling);
  }
  handleAddressDirty(_event) {
    if (!this.useShippingAddressForBilling) {
      this._dirty = true;
    }
  }
  checkValidity() {
    if (!this._showEdit || this.useShippingAddressForBilling) {
      return true;
    }
    return this.billingAddressComponent?.checkValidity() ?? false;
  }
  reportValidity() {
    if (!this._showEdit || this.useShippingAddressForBilling) {
      return true;
    }
    return this.billingAddressComponent?.reportValidity() ?? false;
  }
}