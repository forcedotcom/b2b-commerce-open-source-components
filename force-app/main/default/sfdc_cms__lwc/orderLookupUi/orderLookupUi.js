import { LightningElement, api, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import { getI18nCountries } from 'experience/internationalizationApi';
export default class OrderLookupUi extends LightningElement {
  static renderMode = 'light';
  phoneDefaultCountry;
  rawInternationalizationData;
  _showLoader = false;
  _email;
  _lastName;
  _orderNumber;
  _phoneNumber;
  _errorMessage;
  @api
  emailFieldLabel;
  @api
  lastNameFieldLabel;
  @api
  orderNumberFieldLabel;
  @api
  orderNumberFieldTooltip;
  @api
  phoneNumberFieldLabel;
  @api
  emailRequired = false;
  @api
  hideLastName = false;
  @api
  lastNameRequired = false;
  @api
  phoneNumberRequired = false;
  @api
  get email() {
    return this._email;
  }
  set email(value) {
    this._email = value;
  }
  @api
  get lastName() {
    return this._lastName;
  }
  set lastName(value) {
    this._lastName = value;
  }
  @api
  get orderNumber() {
    return this._orderNumber;
  }
  set orderNumber(value) {
    this._orderNumber = value;
  }
  @api
  get phoneNumber() {
    return this._phoneNumber;
  }
  set phoneNumber(value) {
    this._phoneNumber = value;
  }
  @api
  get errorMessage() {
    return this._errorMessage;
  }
  set errorMessage(value) {
    this._errorMessage = value;
  }
  @api
  showLoader(value) {
    this._showLoader = value;
  }
  @wire(AppContextAdapter)
  appContextHandler(response) {
    this.phoneDefaultCountry = response?.data?.country;
  }
  @wire(getI18nCountries, {
    excludeCountryFilter: true
  })
  internationalizationHandler(response) {
    if (response.loaded) {
      this.rawInternationalizationData = response.data;
    }
  }
  get showLastName() {
    return !this.hideLastName;
  }
  clearErrorMessage() {
    this._errorMessage = '';
  }
  handleOrderNumberChange(event) {
    this._orderNumber = event?.target?.value;
    this.clearErrorMessage();
  }
  handleEmailChange(event) {
    this._email = event?.target?.value;
    this.clearErrorMessage();
  }
  handleLastNameChange(event) {
    this._lastName = event?.target?.value;
    this.clearErrorMessage();
  }
  handlePhoneNumberChange(event) {
    this._phoneNumber = event.detail?.phoneNumber;
    this.clearErrorMessage();
  }
  getComponentsToValidate() {
    return Array.from(this.querySelectorAll('[data-validate]'));
  }
  reportValidity() {
    const componentsToValidate = this.getComponentsToValidate();
    return componentsToValidate.reduce((result, component) => {
      return component.reportValidity && component.reportValidity() && result;
    }, true);
  }
  handleActionClick() {
    if (this.reportValidity()) {
      this.dispatchEvent(new CustomEvent('submit', {
        detail: {
          orderNumber: this.orderNumber,
          email: this.email,
          lastName: this.showLastName ? this.lastName : undefined,
          phoneNumber: this.phoneNumber
        }
      }));
    }
  }
}