import { api, LightningElement } from 'lwc';
import { FirstNameLabel, LastNameLabel, CompanyNameLabel, CountryLabel, CityLabel, ProvinceLabel, PostalCodeLabel, AddressLineOneLabel, AddressLineTwoLabel } from './labels';
import { isLastNameFirstCountry, getCustomLocale } from 'site/checkoutInternationalization';
import { transformCountryOptions, transformStateOptions, stateZipNameType } from './utils';
import { convertCompactAddressToStreet, convertStreetToCompactAddress } from 'site/checkoutData';
export default class CheckoutInputAddress extends LightningElement {
  static renderMode = 'light';
  @api
  showBackToListLink = false;
  _isDisabled = false;
  @api
  get disabled() {
    return this._isDisabled;
  }
  set disabled(value) {
    this._isDisabled = value;
  }
  get isDefaultDisabled() {
    return this._isDisabled || this.readonlyDefaultAddress;
  }
  @api
  componentHeaderEditAddressLabel;
  @api
  backToListLabel;
  @api
  phoneNumberLabel;
  @api
  phoneNumberPlaceholderText;
  @api
  makeDefaultAddressLabel;
  @api
  showPhoneNumber = false;
  @api
  phoneNumberRequired = false;
  @api
  skipPhoneNumberValidationEnabled = false;
  @api
  showPersonName = false;
  @api
  showCompanyName = false;
  @api
  showDefaultAddress = false;
  @api
  readonlyDefaultAddress = false;
  @api
  showFormBorderStyle = false;
  @api
  showAllCountries = false;
  @api
  defaultCountry = '';
  @api
  showAddressLookup = false;
  @api
  get rawInternationalizationData() {
    return this._rawInternationalizationData;
  }
  set rawInternationalizationData(data) {
    this._rawInternationalizationData = data;
  }
  @api
  get rawInternationalizationDataPhone() {
    return this._rawInternationalizationDataPhone;
  }
  set rawInternationalizationDataPhone(data) {
    this._rawInternationalizationDataPhone = data;
  }
  _firstName = '';
  _lastName = '';
  _companyName = '';
  _phoneNumber = '';
  _street = '';
  _streetAddress = '';
  _subpremise = '';
  _city = '';
  _country = '';
  _province = '';
  _postalCode = '';
  _isDefaultAddress = false;
  _addressId = '';
  _rawInternationalizationData;
  _rawInternationalizationDataPhone;
  _contactInfo = {};
  firstNameField;
  lastNameFieldFirst;
  renderedCallback() {
    this.firstNameField = this.refs.firstNameField;
    this.lastNameFieldFirst = this.refs.lastNameFieldFirst;
  }
  @api
  get address() {
    const result = {
      firstName: this.firstName,
      lastName: this.lastName,
      companyName: this._companyName,
      phoneNumber: this._phoneNumber,
      street: convertCompactAddressToStreet({
        street: this._streetAddress,
        subpremise: this._subpremise
      }),
      city: this.city,
      postalCode: this.postalCode,
      region: this.province,
      country: this.country,
      isDefault: this.isDefaultAddress
    };
    if (this._addressId) {
      result.addressId = this._addressId;
    }
    return result;
  }
  set address(address) {
    if (address) {
      if (address.firstName && address.lastName) {
        this._firstName = address.firstName;
        this._lastName = address.lastName;
      } else {
        this._firstName = address.name || address.firstName || address.lastName;
      }
      this._companyName = address.companyName;
      this._phoneNumber = address.phoneNumber;
      this._street = address.street || '';
      this._city = address.city || '';
      this._postalCode = address.postalCode || '';
      this._province = address.region || '';
      this._country = address.country ? address.country : '';
      this._isDefaultAddress = address.isDefault ?? false;
      this._addressId = address.addressId ?? '';
      this.convertToCompactAddress(this._street);
    }
  }
  @api
  get contactInfo() {
    return this._contactInfo;
  }
  set contactInfo(contactInfo) {
    this._contactInfo = contactInfo;
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
  get companyName() {
    return this._companyName;
  }
  set companyName(value) {
    this._companyName = value;
  }
  @api
  get phoneNumber() {
    return this._phoneNumber;
  }
  set phoneNumber(value) {
    this._phoneNumber = value;
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
    return this._country || this.defaultCountry;
  }
  set country(value) {
    this._country = value;
  }
  @api
  get province() {
    return this._province;
  }
  set province(value) {
    this._province = value;
  }
  @api
  get postalCode() {
    return this._postalCode;
  }
  set postalCode(value) {
    this._postalCode = value;
  }
  @api
  get isDefaultAddress() {
    return this._isDefaultAddress;
  }
  set isDefaultAddress(value) {
    this._isDefaultAddress = value;
  }
  get isNewAddressMode() {
    return !this._addressId;
  }
  get customLocale() {
    return getCustomLocale(this.country);
  }
  get disableCountryDropdown() {
    if (!this.showAllCountries) {
      return this.rawInternationalizationData?.addressCountries?.length === 1;
    }
    return false;
  }
  @api
  focus() {
    if (this.isLastNameFirst) {
      this.lastNameFieldFirst?.focus();
    } else {
      this.firstNameField?.focus();
    }
  }
  @api
  validity(report) {
    const componentsToValidate = this.findComponentsToValidate();
    function validate(result, component) {
      if (report) {
        return component.reportValidity && component.reportValidity() && result;
      }
      return component.checkValidity && component.checkValidity() && result;
    }
    return [...componentsToValidate].reduce(validate, true);
  }
  @api
  reportValidity() {
    return this.validity(true);
  }
  @api
  checkValidity() {
    return this.validity(false);
  }
  get labels() {
    const stateZipLabels = stateZipNameType(this.country, this.rawInternationalizationData?.addressCountries || []);
    return {
      firstNameLabel: FirstNameLabel,
      lastNameLabel: LastNameLabel,
      companyNameLabel: CompanyNameLabel,
      countryLabel: CountryLabel,
      cityLabel: CityLabel,
      addressLineOneLabel: AddressLineOneLabel,
      addressLineTwoLabel: AddressLineTwoLabel,
      provinceLabel: stateZipLabels.stateNameLabel || ProvinceLabel,
      postalCodeLabel: stateZipLabels.zipNameLabel || PostalCodeLabel
    };
  }
  get countryOptions() {
    const countries = transformCountryOptions(this.rawInternationalizationData?.addressCountries || []);
    return countries.length > 0 ? countries : undefined;
  }
  get provinceOptions() {
    const countryStates = this.country ? transformStateOptions(this.country, this.rawInternationalizationData?.addressCountries) : [];
    return countryStates.length ? countryStates : [];
  }
  get isLastNameFirst() {
    return isLastNameFirstCountry(this.country);
  }
  get formBorderClass() {
    return this.showFormBorderStyle ? 'slds-form-element slds-p-around_medium slds-box' : 'slds-form-element';
  }
  findComponentsToValidate() {
    return [...this.querySelectorAll('[data-validate]')];
  }
  handleAddressChange(event) {
    const target = event.target;
    if (this._country !== target.country) {
      this._province = '';
    } else {
      this._province = target.province;
    }
    this._streetAddress = target.street;
    this._subpremise = target.subpremise;
    this._street = convertCompactAddressToStreet({
      street: target.street,
      subpremise: target.subpremise
    });
    this._city = target.city;
    this._country = target.country;
    this._postalCode = target.postalCode;
    this.dispatchChangeEvent();
  }
  handleFirstNameChange(event) {
    this._firstName = event.target.value;
    this.dispatchChangeEvent();
  }
  handleLastNameChange(event) {
    this._lastName = event.target.value;
    this.dispatchChangeEvent();
  }
  handleCompanyNameChange(event) {
    this._companyName = event.target.value;
    this.dispatchChangeEvent();
  }
  handlePhoneNumberChange(event) {
    this._phoneNumber = this.skipPhoneNumberValidationEnabled ? event.target?.value : event.detail?.phoneNumber;
    this.dispatchChangeEvent();
  }
  handleIsDefaultAddressChange(event) {
    this._isDefaultAddress = event.target.checked;
    this.dispatchChangeEvent();
  }
  dispatchChangeEvent() {
    const isFormValid = this.checkValidity();
    if (isFormValid) {
      this.dispatchEvent(new CustomEvent('addresschanged', {
        composed: true,
        bubbles: true,
        detail: {
          valid: isFormValid,
          address: this.address
        }
      }));
    } else {
      this.dispatchEvent(new CustomEvent('addressdirty', {
        composed: true,
        bubbles: true
      }));
    }
  }
  handleCloseNewAddressFormClicked() {
    const closeNewAddressFormClickEvent = new CustomEvent('closenewaddressformclick');
    this.dispatchEvent(closeNewAddressFormClickEvent);
  }
  convertToCompactAddress(street) {
    const streetParts = convertStreetToCompactAddress(street);
    this._streetAddress = streetParts.street;
    this._subpremise = streetParts.subpremise;
  }
}