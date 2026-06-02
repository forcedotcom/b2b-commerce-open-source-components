import { LightningElement, api, track, wire } from 'lwc';
import { validate, validateEmailConfirmation, validatePhoneConfirmation, validateEmailIsDifferent, validatePhoneIsDifferent } from './validateUtils';
import { getI18nCountries } from 'experience/internationalizationApi';
import { AppContextAdapter } from 'commerce/contextApi';
import { ConfirmEmailLabel, ConfirmPhoneLabel, ExistingEmailError, ExistingPhoneError, SaveActionLabel, SaveAndVerifyActionLabel, ConfirmEmailMismatchError, ConfirmPhoneMismatchError, CancelActionLabel } from './labels';
export default class MyAccountProfileEditor extends LightningElement {
  static renderMode = 'light';
  @api
  profile;
  @api
  firstNameLabel;
  @api
  lastNameLabel;
  @api
  emailLabel;
  @api
  phoneLabel;
  @api
  header;
  @api
  description;
  @api
  passwordLessLoginEnabled;
  @api
  editMode;
  @api
  focus() {
    const target = this.refs?.input;
    target?.focus();
  }
  @track
  _updatedProfile = {};
  @track
  _rawInternationalizationData;
  _defaultCountry;
  get _confirmEmailLabel() {
    return ConfirmEmailLabel;
  }
  get _confirmPhoneLabel() {
    return ConfirmPhoneLabel;
  }
  get _cancelActionLabel() {
    return CancelActionLabel;
  }
  get _firstName() {
    return this.profile?.firstName || '';
  }
  get _lastName() {
    return this.profile?.lastName || '';
  }
  @wire(getI18nCountries, {
    excludeCountryFilter: false
  })
  internationalizationHandler(response) {
    if (!response.loading) {
      this._rawInternationalizationData = response.data;
    }
  }
  @wire(AppContextAdapter)
  appContextHandler(response) {
    this._defaultCountry = response?.data?.country || '';
  }
  get _isPersonalDetailsEditable() {
    return this.editMode === 'personalDetails';
  }
  get _isPhoneEditable() {
    return this.editMode === 'phone';
  }
  get _isEmailEditable() {
    return this.editMode === 'email';
  }
  get _isSaveDisabled() {
    return !validate(this.profile, this._updatedProfile, this.editMode);
  }
  get _errorMessage() {
    if (this.editMode === 'email') {
      if (!validateEmailIsDifferent(this.profile?.email, this._updatedProfile?.email)) {
        return ExistingEmailError;
      }
      if (!validateEmailConfirmation(this._updatedProfile)) {
        return ConfirmEmailMismatchError;
      }
    }
    if (this.editMode === 'phone') {
      if (!validatePhoneIsDifferent(this.profile?.phoneNumber, this._updatedProfile?.phoneNumber)) {
        return ExistingPhoneError;
      }
      if (!validatePhoneConfirmation(this._updatedProfile)) {
        return ConfirmPhoneMismatchError;
      }
    }
    return undefined;
  }
  get _showErrorMessage() {
    return !!this._errorMessage;
  }
  get _saveActionLabel() {
    return this.passwordLessLoginEnabled && (this.editMode === 'email' || this.editMode === 'phone') ? SaveAndVerifyActionLabel : SaveActionLabel;
  }
  reportValidity() {
    const componentsToValidate = Array.from(this.querySelectorAll('[data-validate]'));
    return componentsToValidate.reduce((result, component) => {
      return component.reportValidity && component.reportValidity() && result;
    }, true);
  }
  handleFirstNameChange(event) {
    this._updatedProfile = {
      ...this._updatedProfile,
      firstName: event?.target?.value
    };
  }
  handleLastNameChange(event) {
    this._updatedProfile = {
      ...this._updatedProfile,
      lastName: event?.target?.value
    };
  }
  handleEmailChange(event) {
    this._updatedProfile = {
      ...this._updatedProfile,
      email: event?.target?.value?.trim()
    };
  }
  handleConfirmEmailChange(event) {
    this._updatedProfile = {
      ...this._updatedProfile,
      confirmEmail: event?.target?.value?.trim()
    };
  }
  handlePhoneNumberChange(event) {
    this._updatedProfile = {
      ...this._updatedProfile,
      phoneNumber: event?.detail?.phoneNumber
    };
  }
  handleConfirmPhoneNumberChange(event) {
    this._updatedProfile = {
      ...this._updatedProfile,
      confirmPhoneNumber: event?.detail?.phoneNumber
    };
  }
  handleSave() {
    if (!this.reportValidity() || !validate(this.profile, this._updatedProfile, this.editMode)) {
      return;
    }
    const {
      confirmEmail,
      confirmPhoneNumber,
      ...updatedProfile
    } = this._updatedProfile;
    this.dispatchEvent(new CustomEvent('saveprofile', {
      bubbles: true,
      composed: true,
      detail: {
        editMode: this.editMode,
        profile: updatedProfile
      }
    }));
  }
  handleCancel() {
    this.dispatchEvent(new CustomEvent('backtoprofile', {
      bubbles: true,
      composed: true
    }));
  }
  handlePaste(event) {
    event.stopPropagation();
    event.preventDefault();
  }
}