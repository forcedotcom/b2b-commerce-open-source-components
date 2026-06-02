import { api, LightningElement, wire } from 'lwc';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { ShippingLabel, BillingLabel, FirstNameLabel, LastNameLabel, AddressTypeLabel, AddressTypePlaceHolderLabel, CompanyNameLabel, CountryLabel, CityLabel, ProvinceLabel, PostalCodeLabel, AddressLineOneLabel, AddressLineTwoLabel, PhoneNumberLabel, SaveLabel } from './labels';
import { navigate, NavigationContext, CurrentPageReference } from 'lightning/navigation';
import { createMyAccountAddress, updateMyAccountAddress } from 'commerce/myAccountApi';
import { isLastNameFirstCountry, getCustomLocale } from 'site/checkoutInternationalization';
import { MyAccountAddressDetailAdapter } from 'commerce/myAccountApi';
import { getErrorInfo } from './errorHandler';
import { getI18nCountries } from 'experience/internationalizationApi';
import { transformCountryOptions, transformStateOptions } from './utils';
import { convertCompactAddressToStreet, convertStreetToCompactAddress } from 'site/checkoutData';
const DEFAULTS = {
  shipping: 'Shipping'
};
const ADDRESS_TYPE_OPTIONS = [{
  label: ShippingLabel,
  value: 'Shipping'
}, {
  label: BillingLabel,
  value: 'Billing'
}];
/**
 * @slot actionButtons
 */
export default class MyAccountInputAddress extends LightningElement {
  static renderMode = 'light';
  _firstName = '';
  _lastName = '';
  _addressType = DEFAULTS.shipping;
  _street = '';
  _streetAddress = '';
  _subpremise = '';
  _city = '';
  _country;
  _province;
  _phoneNumber;
  _postalCode = '';
  _isDefaultAddress = false;
  _addressId = '';
  _address;
  _showAddressForm = false;
  _showDiffAddressTypes = true;
  _companyName = '';
  _errorMessage = '';
  isPreview = false;
  _showPageSpinner = false;
  _countries = [];
  _shippingCountries = [];
  _defaultCountry = '';
  _supportedCountries;
  phoneDefaultCountry;
  rawInternationalizationData;
  _cancelErrorListener = () => this.handleCloseAddressFormClicked();
  _saveErrorListener = () => this.handleSaveAddressFormClicked();
  _skipPhoneNumberValidationEnabled = false;
  connectedCallback() {
    this.addEventListener('firstaction', this._cancelErrorListener);
    this.addEventListener('secondaction', this._saveErrorListener);
  }
  disconnectedCallback() {
    this.removeEventListener('firstaction', this._cancelErrorListener);
    this.removeEventListener('secondaction', this._saveErrorListener);
  }
  @wire(NavigationContext)
  navContext;
  @wire(SessionContextAdapter)
  updateSessionContext({
    data
  }) {
    this.isPreview = data?.isPreview === true;
  }
  @wire(CurrentPageReference)
  pageRef;
  @wire(MyAccountAddressDetailAdapter, {
    addressId: '$addressId'
  })
  AddressDetailHandler(response) {
    if (response?.data?.items) {
      this._address = response.data.items[0];
      this.setEditAddress(this._address);
      this._showAddressForm = true;
    }
    if (response?.error) {
      this._errorMessage = getErrorInfo(response?.error, this.isPreview);
    }
  }
  @wire(AppContextAdapter)
  appContextHandler(response) {
    this._supportedCountries = response?.data?.shippingCountries;
    this._defaultCountry = response?.data?.country || this._supportedCountries?.[0] || '';
    this.phoneDefaultCountry = response?.data?.country;
    this._skipPhoneNumberValidationEnabled = !!response?.data?.skipPhoneNumberValidationEnabled;
  }
  @wire(getI18nCountries, {
    excludeCountryFilter: true
  })
  internationalizationHandler(response) {
    this.rawInternationalizationData = response?.data;
    this._countries = response?.data?.addressCountries || [];
    this._shippingCountries = this._countries.filter(country => this._supportedCountries?.includes(country.isoCode));
  }
  @api
  componentHeaderNewAddressLabel;
  @api
  componentHeaderEditAddressLabel;
  @api
  makeDefaultAddressLabel;
  @api
  showComponentHeader = false;
  @api
  showCompanyName = false;
  @api
  formWidth;
  @api
  showPhoneNumber;
  @api
  makePhoneNumberRequired;
  @api
  get showDifferentAddressTypes() {
    return this._showDiffAddressTypes;
  }
  set showDifferentAddressTypes(value) {
    if (!value) {
      this._addressType = DEFAULTS.shipping;
    }
    this._showDiffAddressTypes = value;
  }
  @api
  get firstName() {
    return this._firstName;
  }
  set firstName(value) {
    this._firstName = value;
  }
  @api
  get lastName() {
    return this._lastName;
  }
  set lastName(value) {
    this._lastName = value;
  }
  @api
  get street() {
    return this._street;
  }
  set street(value) {
    this._street = value;
    this.convertToCompactAddress(value);
  }
  @api
  get city() {
    return this._city;
  }
  set city(value) {
    this._city = value;
  }
  @api
  get country() {
    return this.normalizedCountry;
  }
  set country(value) {
    if (value) {
      this._country = value;
    }
  }
  @api
  get province() {
    return this._province;
  }
  set province(value) {
    if (value) {
      this._province = value;
    }
  }
  @api
  get phoneNumber() {
    return this._phoneNumber;
  }
  set phoneNumber(value) {
    this._phoneNumber = value;
  }
  @api
  get postalCode() {
    return this._postalCode;
  }
  set postalCode(value) {
    this._postalCode = value;
  }
  @api
  get addressType() {
    return this._addressType;
  }
  set addressType(value) {
    this._addressType = value;
  }
  @api
  get companyName() {
    return this._companyName;
  }
  set companyName(value) {
    this._companyName = value;
  }
  @api
  get skipPhoneNumberValidationEnabled() {
    return this._skipPhoneNumberValidationEnabled;
  }
  set skipPhoneNumberValidationEnabled(value) {
    this._skipPhoneNumberValidationEnabled = value;
  }
  get addressTypeOptions() {
    return ADDRESS_TYPE_OPTIONS.map(item => ({
      label: item.label,
      value: item.value,
      isChecked: this._addressType === item.value
    }));
  }
  @api
  get isDefaultAddress() {
    return this._isDefaultAddress;
  }
  set isDefaultAddress(value) {
    this._isDefaultAddress = value;
  }
  get normalizedCountry() {
    return this._country || this._defaultCountry;
  }
  get isNewAddressMode() {
    return !this.addressId;
  }
  get showAddressForm() {
    if (!this.addressId || this.isPreview) {
      this._showAddressForm = true;
    }
    return this._showAddressForm;
  }
  get addressId() {
    this._addressId = this.pageRef?.state?.addressId || '';
    return this._addressId;
  }
  get labels() {
    return {
      firstNameLabel: FirstNameLabel,
      lastNameLabel: LastNameLabel,
      addressTypeLabel: AddressTypeLabel,
      addressTypePlaceHolderLabel: AddressTypePlaceHolderLabel,
      companyNameLabel: CompanyNameLabel,
      countryLabel: CountryLabel,
      cityLabel: CityLabel,
      addressLineOneLabel: AddressLineOneLabel,
      addressLineTwoLabel: AddressLineTwoLabel,
      provinceLabel: ProvinceLabel,
      postalCodeLabel: PostalCodeLabel,
      phoneNumberLabel: PhoneNumberLabel,
      saveLabel: SaveLabel
    };
  }
  get addressInput() {
    const result = {
      firstName: this.firstName,
      lastName: this.lastName,
      companyName: this.companyName,
      street: convertCompactAddressToStreet({
        street: this._streetAddress,
        subpremise: this._subpremise
      }),
      city: this.city,
      postalCode: this.postalCode,
      region: this.province,
      country: this.country,
      isDefault: this.isDefaultAddress,
      addressType: this.addressType,
      phoneNumber: this.phoneNumber
    };
    return result;
  }
  setEditAddress(address) {
    if (address.firstName && address.lastName) {
      this._firstName = address.firstName;
      this._lastName = address.lastName;
    } else {
      if (isLastNameFirstCountry(address.country)) {
        this._lastName = address.name;
      } else {
        this._firstName = address.name;
      }
    }
    this._companyName = address.companyName;
    this._street = address.street;
    this._city = address.city;
    this._country = address.country;
    this._postalCode = address.postalCode;
    this._province = address.region;
    this._isDefaultAddress = address.isDefault;
    this._addressId = address.addressId;
    this._addressType = address.addressType;
    this._phoneNumber = address.phoneNumber;
    this.convertToCompactAddress(this._street);
  }
  get countryOptions() {
    let countries;
    if (this.addressType === DEFAULTS.shipping && this._shippingCountries.length > 0) {
      countries = transformCountryOptions(this._shippingCountries);
    } else {
      countries = transformCountryOptions(this._countries);
    }
    return countries.length > 0 ? countries : undefined;
  }
  get provinceOptions() {
    return this.country ? transformStateOptions(this.country, this._countries) : [];
  }
  get formStyle() {
    return `--com-c-my-account-input-address-form-width: ${this.formWidth}%`;
  }
  get customLocale() {
    return getCustomLocale(this.normalizedCountry || '');
  }
  get isLastNameFirst() {
    return isLastNameFirstCountry(this.normalizedCountry || '');
  }
  handleAddressChange(event) {
    const target = event.target;
    this._streetAddress = target.street;
    this._subpremise = target.subpremise;
    this._street = convertCompactAddressToStreet({
      street: target.street,
      subpremise: target.subpremise
    });
    this._city = target.city;
    if (this._country !== target.country) {
      this._province = '';
    } else {
      this._province = target.province;
    }
    this._country = target.country;
    this._postalCode = target.postalCode;
  }
  handleAddressTypeChange(event) {
    this._addressType = event.target.value;
  }
  handleFirstNameChange(event) {
    this._firstName = event?.target?.value;
  }
  handleLastNameChange(event) {
    this._lastName = event?.target?.value;
  }
  handleCompanyNameChange(event) {
    this._companyName = event?.target?.value;
  }
  handleIsDefaultAddressChange(event) {
    this._isDefaultAddress = event.target.checked;
  }
  handleCloseAddressFormClicked() {
    navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Address_List'
      },
      state: {
        addressType: this.addressType
      }
    });
  }
  handleDismissNotification() {
    this._errorMessage = '';
  }
  async handleSaveAddressFormClicked() {
    let outputAddress;
    const isFormValid = this.reportValidity();
    if (isFormValid) {
      if (this.isNewAddressMode) {
        try {
          this._showPageSpinner = true;
          outputAddress = await createMyAccountAddress(this.addressInput);
        } catch (e) {
          this._errorMessage = getErrorInfo(e, this.isPreview);
        } finally {
          this._showPageSpinner = false;
        }
      } else {
        try {
          this._showPageSpinner = true;
          outputAddress = await updateMyAccountAddress({
            ...this.addressInput,
            addressId: this.addressId
          });
        } catch (e) {
          this._errorMessage = getErrorInfo(e, this.isPreview);
        } finally {
          this._showPageSpinner = false;
        }
      }
      if (outputAddress?.addressId) {
        navigate(this.navContext, {
          type: 'comm__namedPage',
          attributes: {
            name: 'Address_List'
          },
          state: {
            addressType: this.addressType
          }
        });
      }
    }
  }
  handlePhoneNumberChange(event) {
    this._phoneNumber = this.skipPhoneNumberValidationEnabled ? event?.target?.value : event.detail?.phoneNumber;
  }
  reportValidity() {
    const componentsToValidate = this.findComponentsToValidate();
    function reportValidityAndCheckResult(result, component) {
      return component.reportValidity && component.reportValidity() && result;
    }
    const firstError = componentsToValidate.find(element => {
      return element.classList.contains('slds-has-error') || !element.checkValidity();
    });
    firstError?.focus();
    return [...componentsToValidate].reduce(reportValidityAndCheckResult, true);
  }
  findComponentsToValidate() {
    return Array.from(this.querySelectorAll('[data-validate]'));
  }
  convertToCompactAddress(street) {
    const streetParts = convertStreetToCompactAddress(street || '');
    this._streetAddress = streetParts.street;
    this._subpremise = streetParts.subpremise;
  }
}