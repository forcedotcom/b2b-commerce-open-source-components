import { api, track, wire } from 'lwc';
import { SessionContextAdapter, AppContextAdapter } from 'commerce/contextApi';
import { CheckoutComponentBase } from 'commerce/checkoutApi';
import { CheckoutStage } from 'commerce/checkoutApi';
import { isPreviewMode } from 'experience/clientApi';
import emailMessageWhenPatternMismatchLabel from '@salesforce/label/site.checkoutContactInfo.emailMessageWhenPatternMismatch';
import { getI18nCountries } from 'experience/internationalizationApi';
import { NavigationContext } from 'lightning/navigation';
import { reCaptchaDisclaimerLabel } from './labels';
import { COMMERCE_REG_PROCESS, SMS_VERIFICATION_METHOD, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from './constants';
import { initializeUser, loadCaptcha } from 'site/commonLoginHandler';
import { CartContentsAdapter } from 'commerce/checkoutCartApi';
import { createContactInfoUpdateDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
import { CheckoutStencilType } from 'site/checkoutStencil';
export default class CheckoutContactInfo extends CheckoutComponentBase {
  static renderMode = 'light';
  @api
  alwaysShowComponent = false;
  @api
  enableUserLookup = false;
  @api
  emailLabel;
  @api
  phoneNumberLabel;
  @api
  phoneNumberPlaceholderText;
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
  _emailMessageWhenPatternMismatchLabel = emailMessageWhenPatternMismatchLabel;
  _stencilType = CheckoutStencilType.CONTACT_INFO_EDIT;
  _stencilItemCount = 2;
  _isLoggedIn = false;
  _showStencil = true;
  _summarizable = true;
  _showSummary = false;
  _readOnlyIfValid = true;
  _rawInternationalizationData;
  _supportedCountries;
  _defaultCountry;
  _sessionContext;
  _otp;
  _requestId;
  _userId;
  _showSpinner = false;
  _reCaptchaDisclaimerLabel = reCaptchaDisclaimerLabel.replace('{0}', PRIVACY_POLICY_URL).replace('{1}', TERMS_OF_SERVICE_URL);
  _previousEmail = '';
  _previousPhoneNumber = '';
  _cartId;
  _currentEmail;
  _skipPhoneNumberValidationEnabled = false;
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (!response.loading) {
      this._sessionContext = response.data;
      this._isLoggedIn = this._sessionContext?.isLoggedIn || false;
      this.onSetProperties();
    }
  }
  @wire(AppContextAdapter)
  appContextHandler(response) {
    this._defaultCountry = response?.data?.country || '';
    this._skipPhoneNumberValidationEnabled = !!response?.data?.skipPhoneNumberValidationEnabled;
  }
  @wire(getI18nCountries, {
    excludeCountryFilter: true
  })
  internationalizationHandler(response) {
    if (!response.loading) {
      this._rawInternationalizationData = response.data;
    }
  }
  @wire(NavigationContext)
  navContext;
  connectedCallback() {
    if (isPreviewMode) {
      this._showStencil = false;
      this._readOnlyIfValid = false;
    }
    this.onSetProperties();
    if (this.enableUserLookup) {
      loadCaptcha(COMMERCE_REG_PROCESS, this);
    }
  }
  @wire(CartContentsAdapter)
  cartSummary({
    data
  }) {
    this._cartId = data?.cartSummary?.cartId;
    if (this._cartId) {
      this.onSetProperties();
    }
  }
  onSetProperties() {
    if (this.alwaysShowComponent) {
      this._showStencil = false;
      this._readOnlyIfValid = false;
      return;
    }
    if (!this.isConnected || !this._sessionContext) {
      return;
    }
    if ((this.email !== this._previousEmail || this.phoneNumber !== this._previousPhoneNumber) && this._cartId) {
      this._previousEmail = this.email;
      this._previousPhoneNumber = this.phoneNumber;
      dispatchDataEvent(this, createContactInfoUpdateDataEvent(this.email, this.phoneNumber, this._cartId));
    }
    if (this.checkoutDetails && this._showStencil) {
      this._showStencil = false;
      if (this._summarizable) {
        this._summarizable = !!this.email && (!!this.phoneNumber || this._isLoggedIn);
        this.dispatchRequestAspect({
          summarizable: this._summarizable
        });
      }
    }
  }
  setAspect(newAspect) {
    this._readOnlyIfValid = newAspect.readOnlyIfValid && this.checkValidity();
    this._showSummary = newAspect.summary && !!this.email && (!!this.phoneNumber || this._isLoggedIn);
    if (newAspect.errorFocus) {
      if (!document.activeElement?.className?.split(' ')?.some(r => r === 'slds-has-error')) {
        const candidates = [this.refs?.emailInput, this.refs?.phoneInput, this.refs?.multiPhoneField];
        const findError = el => {
          if (!el) {
            return null;
          }
          if (el.className?.split(' ')?.some(c => c === 'slds-has-error')) {
            return el;
          }
          return el.querySelector?.('.slds-has-error') ?? null;
        };
        let errorElement = null;
        for (const candidate of candidates) {
          errorElement = findError(candidate);
          if (errorElement) {
            break;
          }
        }
        errorElement?.focus();
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
  get _showEdit() {
    return !this._showStencil && !this._showSummary;
  }
  get _emailReadOnly() {
    return this._isLoggedIn && !!this.email || this._readOnlyIfValid;
  }
  get _phoneReadOnly() {
    return this._isLoggedIn && !!this.phoneNumber || this._readOnlyIfValid;
  }
  get _showRequiredPhoneNumberField() {
    return !this._isLoggedIn || !!this.phoneNumber || this.alwaysShowComponent || isPreviewMode;
  }
  get email() {
    return this.checkoutDetails?.contactInfo?.email || '';
  }
  get phoneNumber() {
    return this.checkoutDetails?.contactInfo?.phoneNumber || '';
  }
  get formattedPhoneNumber() {
    const phoneRegex = /^(\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return this.phoneNumber?.startsWith('+1') ? this.phoneNumber.replace(phoneRegex, '$1 ($2) $3-$4') : this.phoneNumber;
  }
  async handleEmailChange(event) {
    const email = event.target.value.trim();
    if (this.getEmailInputElement()?.checkValidity()) {
      await this.dispatchUpdateAsync({
        contactInfo: {
          email
        }
      });
      this.dispatchCommit();
    }
  }
  async handlePhoneNumberChange(event) {
    const phoneNumber = this._skipPhoneNumberValidationEnabled ? event?.target?.value : event?.detail?.phoneNumber;
    if (this.getPhoneInputElement()?.checkValidity()) {
      await this.dispatchUpdateAsync({
        contactInfo: {
          phoneNumber
        }
      });
      this.dispatchCommit();
    }
  }
  getEmailInputElement() {
    return this.refs?.emailInput ?? null;
  }
  getPhoneInputElement() {
    const ref = this._skipPhoneNumberValidationEnabled ? this.refs?.phoneInput : this.refs?.multiPhoneField;
    return ref ?? null;
  }
  checkValidity() {
    const emailValidity = !!this.getEmailInputElement()?.checkValidity();
    const phoneValidity = !this._showRequiredPhoneNumberField || !!this.getPhoneInputElement()?.checkValidity();
    return !this._showStencil && (!this._showEdit || emailValidity && phoneValidity);
  }
  reportValidity() {
    const emailValidity = !!this.getEmailInputElement()?.reportValidity();
    const phoneValidity = !this._showRequiredPhoneNumberField || !!this.getPhoneInputElement()?.reportValidity();
    return !this._showStencil && (!this._showEdit || emailValidity && phoneValidity);
  }
  async handleUserLookup() {
    if (!this.enableUserLookup || this._isLoggedIn || this.getEmailInputElement()?.value === this._currentEmail) {
      return;
    }
    this._showSpinner = true;
    if (this.getEmailInputElement()?.checkValidity()) {
      this._currentEmail = this.getEmailInputElement()?.value;
      const loginInfo = {
        email: this.getEmailInputElement()?.value,
        startUrlString: globalThis.location.href,
        regProcess: COMMERCE_REG_PROCESS,
        verificationMethod: SMS_VERIFICATION_METHOD
      };
      const response = await initializeUser(loginInfo, this);
      if (response.status === 400) {
        globalThis.sessionStorage.setItem('SHOW_USER_REGISTRATION', 'TRUE');
      } else {
        globalThis.sessionStorage.removeItem('SHOW_USER_REGISTRATION');
      }
    }
    this._showSpinner = false;
  }
  get spinnerClass() {
    const themeVersion = getComputedStyle(document.documentElement).getPropertyValue('--com-c-theme-version');
    if (Number(themeVersion) >= 2) {
      return 'email-spinner-container-theme-2';
    }
    return 'email-spinner-container';
  }
}