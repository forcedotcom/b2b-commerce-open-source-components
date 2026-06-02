import { api, LightningElement, wire } from 'lwc';
import { missingPaymentMethodSetKeyDescription, missingPaymentMethodSetKeyTitle } from './labels';
import { SessionContextAdapter } from 'commerce/contextApi';
import { AppContextAdapter } from 'commerce/contextApi';
import { getI18nCountries } from 'experience/internationalizationApi';
import { navigate, NavigationContext } from 'lightning/navigation';
import { MyAccountProfileAdapter, MyAccountAddressesAdapter } from 'commerce/myAccountApi';
import { clearSavedPaymentMethods, getPaymentMethodSet } from 'experience/paymentApi';
import { buildFullName } from 'site/checkoutInternationalization';
export default class PaymentAddPaymentMethods extends LightningElement {
  static renderMode = 'light';
  _missingStateTitle = missingPaymentMethodSetKeyTitle;
  _missingStateDescription = missingPaymentMethodSetKeyDescription;
  _rawInternationalizationData;
  _defaultCountry;
  _userEmail;
  _paymentMethodSetId;
  _excludeUnsupportedCountries = false;
  _addressType = 'Billing';
  _showOnlyDefaultAddress = true;
  paymentMethodSet;
  _billingDetails = {
    isDefault: false,
    address: {
      country: '',
      line1: '',
      name: ''
    }
  };
  @api
  get paymentMethodSetId() {
    return this._paymentMethodSetId;
  }
  set paymentMethodSetId(value) {
    this._paymentMethodSetId = value;
  }
  @api
  sepaDebitMandate;
  get showMissingPaymentMethodSetMessage() {
    return Boolean(!this.paymentMethodSetId);
  }
  get userAccountId() {
    return this.wireSessionContext?.data?.effectiveAccountId;
  }
  get disableSave() {
    return !this._billingDetails.isDefault;
  }
  get billingDetails() {
    return this._billingDetails;
  }
  @wire(SessionContextAdapter)
  wireSessionContext;
  @wire(AppContextAdapter)
  appContextHandler(response) {
    this._defaultCountry = response?.data?.country || response?.data?.shippingCountries[0] || '';
    if (response?.data?.checkoutSettings?.isManagedCheckoutEnabled) {
      this._paymentMethodSetId = response?.data?.checkoutSettings?.paymentConfiguration?.paymentMethodSetDevName;
    }
  }
  @wire(MyAccountProfileAdapter)
  getBuyerProfile(response) {
    this._userEmail = response?.data?.email;
  }
  @wire(getI18nCountries, {
    excludeCountryFilter: true
  })
  internationalizationHandler(response) {
    this._rawInternationalizationData = response?.data;
  }
  @wire(MyAccountAddressesAdapter, {
    accountId: '$userAccountId',
    addressType: '$_addressType',
    excludeUnsupportedCountries: '$_excludeUnsupportedCountries',
    defaultOnly: '$_showOnlyDefaultAddress'
  })
  AddressesHandler(response) {
    this._billingDetails.email = this._userEmail ?? undefined;
    if (response?.data?.items && response.data.items.length > 0) {
      const savedAddress = response?.data?.items[0];
      this._billingDetails = {
        ...this._billingDetails,
        isDefault: true,
        name: buildFullName(savedAddress.name, savedAddress.firstName, savedAddress.lastName, savedAddress.country),
        address: {
          ...this._billingDetails.address,
          line1: savedAddress.street ?? '',
          street: savedAddress.street,
          country: savedAddress.country ?? '',
          city: savedAddress.city,
          region: savedAddress.region,
          state: savedAddress.region,
          postalCode: savedAddress.postalCode,
          firstName: savedAddress.firstName,
          lastName: savedAddress.lastName
        }
      };
    }
  }
  @wire(getPaymentMethodSet, {
    developerName: '$paymentMethodSetId'
  })
  getPaymentMethodSet(result) {
    if (result.data) {
      this.paymentMethodSet = result.data;
    }
  }
  @wire(NavigationContext)
  navContext;
  handleRedirect() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    clearSavedPaymentMethods();
    if (urlSearchParams.get('redirect') === 'subscriptions') {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Subscriptions'
        }
      });
    } else {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'MyPaymentMethods_List'
        }
      });
    }
  }
}