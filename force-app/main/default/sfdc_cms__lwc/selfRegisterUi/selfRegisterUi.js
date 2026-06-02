import { LightningElement, api } from 'lwc';
import { createUserRegistrationInfoAddDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
import labels from './labels';
const ENTER_KEY = 'Enter';
export default class SelfRegisterUi extends LightningElement {
  static renderMode = 'light';
  @api
  firstnameLabel;
  @api
  lastnameLabel;
  @api
  emailLabel;
  @api
  includePasswordField = false;
  @api
  passwordLabel;
  @api
  confirmPasswordLabel;
  @api
  submitButtonLabel;
  @api
  cancelLinkLabel;
  @api
  extraFieldsFieldSet;
  @api
  accountId;
  @api
  startUrl;
  @api
  regConfirmUrl;
  @api
  readOnly = false;
  @api
  phoneNumberLabel;
  @api
  phoneNumberPlaceholderText;
  @api
  showPhoneNumberField = false;
  @api
  phoneNumberRequired = false;
  @api
  rawInternationalizationData;
  @api
  emailConsentOptions;
  @api
  isLoading = false;
  @api
  showError = false;
  @api
  errorMessage;
  @api
  extraFieldsJsonArray;
  phoneDefaultCountry = 'US';
  _email;
  _lastName;
  _firstName;
  _phoneNumber;
  _pword;
  _confirmPword;
  getStartUrlFromCurrentUrl() {
    if (import.meta.env.SSR) {
      return '';
    }
    try {
      const urlParams = new URLSearchParams(globalThis.location?.search);
      const encodedURI = urlParams?.get('startURL') || '';
      return decodeURI(encodedURI);
    } catch (URIError) {
      return '';
    }
  }
  handlePhoneNumberChange(event) {
    this._phoneNumber = event.detail?.phoneNumber;
  }
  handleFirstNameChange(event) {
    this._firstName = event?.target?.value;
    this.togglePopulatedAttribute(event);
  }
  handleLastNameChange(event) {
    this._lastName = event?.target?.value;
    this.togglePopulatedAttribute(event);
  }
  handleEmailChange(event) {
    this._email = event?.target?.value;
    this.togglePopulatedAttribute(event);
  }
  handlePasswordChange(event) {
    this._pword = event?.target?.value;
    this.togglePopulatedAttribute(event);
  }
  handleConfirmPasswordChange(event) {
    this._confirmPword = event?.target?.value;
    this.togglePopulatedAttribute(event);
  }
  get isConsentListAvailable() {
    return Boolean(this.emailConsentOptions?.length);
  }
  get accountIdString() {
    return this.accountId || '';
  }
  get startUrlString() {
    if (this.startUrl) {
      return this.startUrl;
    }
    const startUrl = this.getStartUrlFromCurrentUrl();
    return startUrl ? decodeURIComponent(startUrl) : '';
  }
  async handleKeyDown(event) {
    if (event.key === ENTER_KEY) {
      await this.submit();
    }
  }
  @api
  get phoneNumber() {
    return this._phoneNumber || '';
  }
  set phoneNumber(value) {
    this._phoneNumber = value;
  }
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
  get firstName() {
    return this._firstName;
  }
  set firstName(value) {
    this._firstName = value;
  }
  @api
  get pword() {
    return this._pword;
  }
  set pword(value) {
    this._pword = value;
  }
  @api
  get confirmPword() {
    return this._confirmPword;
  }
  set confirmPword(value) {
    this._confirmPword = value;
  }
  togglePopulatedAttribute(event) {
    const lightningInput = event?.target;
    if (lightningInput?.value) {
      lightningInput?.setAttribute('populated', '');
    } else {
      lightningInput?.removeAttribute('populated');
    }
  }
  @api
  focusError() {
    const errorElement = this.querySelector('site-common-error');
    errorElement?.focus();
  }
  submit() {
    const elements = Array.from(this.querySelectorAll('[data-extra-field]'));
    const valuesArray = elements.map(element => element.value);
    this.matchPassword();
    const isFormValid = this.reportValidity();
    if (isFormValid) {
      this.dispatchEvent(new CustomEvent('submit', {
        bubbles: true,
        cancelable: true,
        detail: {
          firstname: this.firstName,
          lastname: this.lastName,
          email: this.email,
          password: this.pword,
          confirmPassword: this.confirmPword,
          accountId: this.accountIdString.valueOf(),
          regConfirmUrl: this.regConfirmUrl,
          startUrl: this.startUrlString,
          phoneNumber: this.phoneNumber,
          extraFieldsInput: valuesArray
        }
      }));
      dispatchDataEvent(this, createUserRegistrationInfoAddDataEvent(this.email, this.lastName, this.firstName, this.phoneNumber));
    }
  }
  cancel() {
    this.dispatchEvent(new CustomEvent('cancel', {
      bubbles: true,
      cancelable: true
    }));
  }
  reportValidity() {
    const componentsToValidate = Array.from(this.querySelectorAll('[data-validate]'));
    function reportValidityAndCheckResult(result, component) {
      return component.reportValidity && component.reportValidity() && result;
    }
    const firstError = componentsToValidate.find(element => {
      return element.classList.contains('slds-has-error') || !element.checkValidity();
    });
    firstError?.focus();
    return [...componentsToValidate].reduce(reportValidityAndCheckResult, true);
  }
  matchPassword() {
    const confirmPwdToValidate = this.refs?.confirmPassword;
    if (confirmPwdToValidate) {
      if (this._pword === this._confirmPword) {
        confirmPwdToValidate.setCustomValidity('');
      } else {
        confirmPwdToValidate.setCustomValidity(labels.passwordMismatchLabel);
      }
    }
  }
}