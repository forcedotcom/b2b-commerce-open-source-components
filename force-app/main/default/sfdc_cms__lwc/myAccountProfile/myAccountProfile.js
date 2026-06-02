import { LightningElement, api } from 'lwc';
import { COMMERCE_REG_PROCESS, RECAPTCHA_URL, RESEND_DELAY, VERIFY_ERROR_EXPIRED_CODE, VERIFY_ERROR_INVALID_CODE, VERIFY_ERROR_INVALID_IDENTIFIER, VERIFY_ERROR_TOO_MANY_ATTEMPTS, VERIFY_EMAIL_SUCCESS, VERIFY_PHONE_SUCCESS, VERIFY_SUCCESS_STATUS, INIT_OTP_EMAIL_SUCCESS, INIT_OTP_PHONE_SUCCESS, DEFAULT_ERROR_MESSAGE, ACTION_DISABLED_IN_PREVIEW_MESSAGE, CHANGE_PASSWORD_SUCCESS_MESSAGE, INIT_UNKNOWN_EXCEPTION, RECAPTCHA_LOAD_FAILED_ERROR_CODE, PERSONAL_DETAILS_UPDATED_SUCCESS_MESSAGE, EMAIL_UPDATED_SUCCESS_MESSAGE, EMAIL_UPDATED_WITH_LINK_SUCCESS_MESSAGE, PHONE_UPDATED_SUCCESS_MESSAGE, AUTHENTICATION_SUCCESS, ADD_MOBILE_ERROR_EMAIL_NOT_VERIFIED, INVALID_API_INPUT, INVALID_INPUT, INTERNAL_ERROR, INSUFFICIENT_ACCESS, PROFILE_UPDATE_FAILED, UNKNOWN_EXCEPTION } from './constants';
import { getSiteKey } from 'commerce/loginApi';
import { loadScript } from 'lightning/platformResourceLoader';
import Toast from 'site/commonToast';
import { isPreviewMode } from 'experience/clientApi';
import { dispatchAction, createMyAccountProfileOtpInitAction, createMyAccountProfileOtpVerifyAction, createMyAccountProfilePasswordResetAction, createMyAccountProfileUpdateAction } from 'commerce/actionApi';
import { verifyEmailHeaderLabel, verifyPhoneHeaderLabel, verifyEmailDescriptionLabel, verifyPhoneDescriptionLabel, verifyEmailSuccessfulMessage, verifyPhoneSuccessfulMessage, invalidIdentifierErrorMessage, invalidCodeErrorMessage, expiredCodeErrorMessage, tooManyAttemptsErrorMessage, defaultErrorMessage, actionDisabledInPreviewMessage, changePasswordSuccessfulMessage, backActionLabel, otpGenerationErrorMessage, reCaptchaGenerationErrorMessage, personalDetailsUpdatedSuccessMessage, emailUpdatedSuccessMessage, phoneUpdatedSuccessMessage, emailInitOtpSuccessMessage, phoneInitOtpSuccessMessage, editPersonalDetailsHeaderLabel, editEmailHeaderLabel, editPhoneHeaderLabel, addPhoneHeaderLabel, editEmailDescriptionLabel, editPhoneDescriptionLabel, editFirstNameLabel, editLastNameLabel, editEmailLabel, editPhoneLabel, authenticateHeaderLabel, authenticateEmailDescriptionLabel, authenticatePhoneDescriptionLabel, authenticateViaEmailButtonLabel, authenticateViaMobileButtonLabel, authenticateSuccessfulMessage, addMobileErrorMessageIfEmailNotVerified, ProfileWithEmailUpdatedSuccess, ProfileUpdatedFailed, loaderAssistiveText } from './labels';
/**
 * @slot header
 * @slot personalDetailsHeaderLabel
 * @slot changePasswordButton
 * @slot emailHeaderLabel
 * @slot phoneHeaderLabel
 */
export default class MyAccountProfile extends LightningElement {
  static renderMode = 'light';
  _profileViewState = 'profileRead';
  _editMode;
  _authMode;
  _verifyMode;
  _recipient = '';
  _resendWaitTimeLeft = '';
  _showResendCodeButton = false;
  _showChangeAuthenticationButton = false;
  _resendTimer;
  _showOtpSpinner = false;
  _showLoader = false;
  _showOtpError = false;
  _otpErrorMessage;
  _updateFocus = false;
  @api
  clientState;
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
  showPhoneDetails;
  @api
  profileCardBorderColor;
  get _editFirstNameLabel() {
    return editFirstNameLabel;
  }
  get _editLastNameLabel() {
    return editLastNameLabel;
  }
  get _editEmailLabel() {
    return editEmailLabel;
  }
  get _editPhoneLabel() {
    return editPhoneLabel;
  }
  get _authenticateHeaderLabel() {
    return authenticateHeaderLabel;
  }
  get _backActionLabel() {
    return backActionLabel;
  }
  get _loaderAssistiveText() {
    return loaderAssistiveText;
  }
  @api
  profileCardBorderRadius;
  get _profileCardBorderRadius() {
    return this.profileCardBorderRadius ? this.profileCardBorderRadius + 'px' : '';
  }
  @api
  errors;
  get _isProfileReadState() {
    return this._profileViewState === 'profileRead';
  }
  get _isProfileEditState() {
    return this._profileViewState === 'profileEdit';
  }
  async loadCaptcha() {
    let siteKey = '';
    const options = {
      registrationProcess: COMMERCE_REG_PROCESS
    };
    const response = await getSiteKey(options);
    if (response?.siteKey) {
      siteKey = response.siteKey;
    }
    const scriptExists = document.querySelector(`script[src^="${RECAPTCHA_URL}"]`);
    if (!scriptExists) {
      loadScript(this, RECAPTCHA_URL + siteKey);
    }
  }
  connectedCallback() {
    if (!import.meta.env.SSR && !isPreviewMode) {
      this.loadCaptcha();
    }
  }
  renderedCallback() {
    if (this._updateFocus) {
      const ref = this.refs?.[this._profileViewState];
      ref?.focus();
      this._updateFocus = false;
    }
  }
  get _isLoading() {
    return !!this.clientState?.isLoading || this._showLoader;
  }
  get _isProfileVerifyState() {
    return this._profileViewState === 'verify';
  }
  get _isProfileAuthState() {
    return this._profileViewState === 'authenticate';
  }
  get _showBacktoProfileAction() {
    return this._profileViewState !== 'profileRead';
  }
  get _profileEditorHeader() {
    const headers = {
      personalDetails: editPersonalDetailsHeaderLabel,
      email: editEmailHeaderLabel,
      phone: this.profile?.phoneNumber ? editPhoneHeaderLabel : addPhoneHeaderLabel
    };
    return headers[this._editMode];
  }
  get _profileEditorDescription() {
    if (this._editMode === 'email') {
      return editEmailDescriptionLabel;
    } else if (this._editMode === 'phone') {
      return editPhoneDescriptionLabel;
    }
    return '';
  }
  get _verificationHeader() {
    return this._verifyMode === 'email' ? verifyEmailHeaderLabel : verifyPhoneHeaderLabel;
  }
  get _verificationDescription() {
    return this._verifyMode === 'email' ? verifyEmailDescriptionLabel?.replace('{0}', this._recipient) : verifyPhoneDescriptionLabel?.replace('{0}', this._recipient);
  }
  get _authenticationDescription() {
    return this._authMode === 'email' ? authenticateEmailDescriptionLabel?.replace('{0}', this._recipient) : authenticatePhoneDescriptionLabel?.replace('{0}', this._recipient);
  }
  get _changeAuthenticationMethodButtonLabel() {
    return this._authMode === 'email' ? authenticateViaMobileButtonLabel : authenticateViaEmailButtonLabel;
  }
  get _showChangeAuthenticationMethodButton() {
    return !!this.profile?.isEmailVerified && !!this.profile?.isPhoneVerified;
  }
  get _showContent() {
    return !this._isLoading;
  }
  get _isPasswordLessLoginEnabled() {
    return !!(this.profile && (this.profile.isPhoneVerified !== null || this.profile.isEmailVerified !== null));
  }
  set profileViewState(value) {
    this._profileViewState = value;
    this._updateFocus = !this.isIOS();
  }
  isIOS() {
    return /iPad|iPhone/.test(navigator.userAgent);
  }
  _startResendTimer() {
    let timeLeft = RESEND_DELAY;
    const updateTimer = () => {
      if (timeLeft > 0) {
        this._resendWaitTimeLeft = this._formatTimeLeft(timeLeft);
        timeLeft--;
        this._resendTimer = setTimeout(updateTimer, 1000);
      } else {
        this._showResendCodeButton = true;
        this._resendWaitTimeLeft = '';
      }
    };
    updateTimer();
  }
  _formatTimeLeft(timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = String(timeLeft % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
  _clearResendTimer() {
    if (this._resendTimer) {
      clearTimeout(this._resendTimer);
      this._resendTimer = undefined;
      this._resendWaitTimeLeft = '';
      this._showResendCodeButton = false;
    }
  }
  get _codeToMessageMap() {
    return new Map([[VERIFY_EMAIL_SUCCESS, verifyEmailSuccessfulMessage], [AUTHENTICATION_SUCCESS, authenticateSuccessfulMessage], [ADD_MOBILE_ERROR_EMAIL_NOT_VERIFIED, addMobileErrorMessageIfEmailNotVerified], [VERIFY_PHONE_SUCCESS, verifyPhoneSuccessfulMessage], [VERIFY_ERROR_EXPIRED_CODE, expiredCodeErrorMessage], [VERIFY_ERROR_INVALID_CODE, invalidCodeErrorMessage], [VERIFY_ERROR_INVALID_IDENTIFIER, invalidIdentifierErrorMessage], [VERIFY_ERROR_TOO_MANY_ATTEMPTS, tooManyAttemptsErrorMessage], [DEFAULT_ERROR_MESSAGE, defaultErrorMessage], [ACTION_DISABLED_IN_PREVIEW_MESSAGE, actionDisabledInPreviewMessage], [CHANGE_PASSWORD_SUCCESS_MESSAGE, changePasswordSuccessfulMessage], [INIT_UNKNOWN_EXCEPTION, otpGenerationErrorMessage], [UNKNOWN_EXCEPTION, defaultErrorMessage], [RECAPTCHA_LOAD_FAILED_ERROR_CODE, reCaptchaGenerationErrorMessage], [PERSONAL_DETAILS_UPDATED_SUCCESS_MESSAGE, personalDetailsUpdatedSuccessMessage], [EMAIL_UPDATED_SUCCESS_MESSAGE, emailUpdatedSuccessMessage], [EMAIL_UPDATED_WITH_LINK_SUCCESS_MESSAGE, ProfileWithEmailUpdatedSuccess], [PHONE_UPDATED_SUCCESS_MESSAGE, phoneUpdatedSuccessMessage], [INIT_OTP_EMAIL_SUCCESS, emailInitOtpSuccessMessage], [INIT_OTP_PHONE_SUCCESS, phoneInitOtpSuccessMessage], [INVALID_API_INPUT, defaultErrorMessage], [INVALID_INPUT, defaultErrorMessage], [INTERNAL_ERROR, defaultErrorMessage], [INSUFFICIENT_ACCESS, defaultErrorMessage], [PROFILE_UPDATE_FAILED, ProfileUpdatedFailed]]);
  }
  _getMessage(messageCode) {
    return this._codeToMessageMap.get(messageCode) || defaultErrorMessage;
  }
  get _errorCode() {
    return this.errors?.[0]?.code || DEFAULT_ERROR_MESSAGE;
  }
  _showSuccessToast(message) {
    Toast.show({
      label: message,
      variant: 'success'
    }, this);
  }
  _showErrorToast(message) {
    Toast.show({
      label: message,
      variant: 'error'
    }, this);
  }
  _dispatchInitAction(nextViewState, mode) {
    const initPayload = {
      method: mode === 'email' ? 'Email' : 'Sms',
      type: nextViewState === 'verify' ? 'Verify' : 'StepUp',
      reCaptchaToken: null
    };
    this._showLoader = true;
    dispatchAction(this, createMyAccountProfileOtpInitAction(initPayload), {
      onSuccess: result => {
        this._showLoader = false;
        this._startResendTimer();
        this.profileViewState = nextViewState;
        if (result.recipient) {
          this._recipient = result.recipient;
        }
        const messageCode = mode === 'email' ? INIT_OTP_EMAIL_SUCCESS : INIT_OTP_PHONE_SUCCESS;
        this._showSuccessToast(this._getMessage(messageCode));
      },
      onError: () => {
        this._showLoader = false;
        let messageCode = this._errorCode;
        if (messageCode !== RECAPTCHA_LOAD_FAILED_ERROR_CODE) {
          messageCode = INIT_UNKNOWN_EXCEPTION;
        }
        this._showErrorToast(this._getMessage(messageCode));
        this.profileViewState = 'profileRead';
      }
    });
  }
  _preventActionInPreview() {
    if (isPreviewMode) {
      this._showErrorToast(this._getMessage(ACTION_DISABLED_IN_PREVIEW_MESSAGE));
      return true;
    }
    return false;
  }
  handleEditActionButtonClick(event) {
    this._editMode = event.detail.editMode;
    if (this._editMode === 'personalDetails') {
      this.profileViewState = 'profileEdit';
      return;
    }
    if (this._preventActionInPreview()) {
      return;
    }
    if (!this._isPasswordLessLoginEnabled) {
      this.profileViewState = 'profileEdit';
      return;
    }
    this._authMode = this.profile?.isEmailVerified ? 'email' : 'phone';
    this._dispatchInitAction('authenticate', this._authMode);
  }
  handleVerifyActionButtonClick(event) {
    if (this._preventActionInPreview()) {
      return;
    }
    this._authMode = undefined;
    this._verifyMode = event.detail.verifyMode;
    this._dispatchInitAction('verify', this._verifyMode);
  }
  handleAddMobileButtonClick(event) {
    event.stopPropagation();
    this._editMode = 'phone';
    if (this._preventActionInPreview()) {
      return;
    }
    if (!this._isPasswordLessLoginEnabled) {
      this.profileViewState = 'profileEdit';
      return;
    }
    if (!this.profile?.isEmailVerified) {
      this._showErrorToast(this._getMessage(ADD_MOBILE_ERROR_EMAIL_NOT_VERIFIED));
      return;
    }
    this._authMode = 'email';
    this._dispatchInitAction('authenticate', this._authMode);
  }
  handleSubmitOtp(event) {
    event.stopPropagation();
    const verifyPayload = {
      code: event.detail.code,
      identifier: null
    };
    this._showOtpSpinner = true;
    this._showOtpError = false;
    dispatchAction(this, createMyAccountProfileOtpVerifyAction(verifyPayload), {
      onSuccess: result => {
        const status = result?.status;
        this._showOtpSpinner = false;
        if (status === VERIFY_SUCCESS_STATUS) {
          this._handleSuccessfulVerification();
        }
      },
      onError: () => {
        this._showOtpSpinner = false;
        this._handleVerificationError();
      }
    });
  }
  _handleSuccessfulVerification() {
    const isAuthenticating = this._profileViewState === 'authenticate';
    const isEmailVerification = this._verifyMode === 'email';
    const verificationMessage = isEmailVerification ? VERIFY_EMAIL_SUCCESS : VERIFY_PHONE_SUCCESS;
    const updateMessage = isEmailVerification ? EMAIL_UPDATED_SUCCESS_MESSAGE : PHONE_UPDATED_SUCCESS_MESSAGE;
    const messageCode = isAuthenticating ? AUTHENTICATION_SUCCESS : this._authMode ? updateMessage : verificationMessage;
    this._showSuccessToast(this._getMessage(messageCode));
    this.profileViewState = isAuthenticating ? 'profileEdit' : 'profileRead';
    this._clearResendTimer();
  }
  _handleVerificationError() {
    const inlineErrorStatuses = [VERIFY_ERROR_INVALID_CODE, VERIFY_ERROR_EXPIRED_CODE, VERIFY_ERROR_TOO_MANY_ATTEMPTS];
    if (inlineErrorStatuses.includes(this._errorCode)) {
      this._showOtpError = true;
      this._otpErrorMessage = this._getMessage(this._errorCode);
      return;
    }
    this._showErrorToast(this._getMessage(this._errorCode));
  }
  handleChangeAuthenticationMethodButton(event) {
    event.stopPropagation();
    this.profileViewState = 'authenticate';
    this._clearResendTimer();
    this._showOtpError = false;
    this._authMode = this._authMode === 'email' ? 'phone' : 'email';
    this._dispatchInitAction('authenticate', this._authMode);
  }
  handleResendOtp(event) {
    event.stopPropagation();
    this._clearResendTimer();
    this._showOtpError = false;
    this._dispatchInitAction(this._profileViewState, this._authMode ?? this._verifyMode);
  }
  handleBackToProfile(event) {
    event.stopPropagation();
    this._clearResendTimer();
    this.profileViewState = 'profileRead';
    this._showOtpError = false;
  }
  handleChangePasswordActionClick(event) {
    event.stopPropagation();
    if (this._preventActionInPreview()) {
      return;
    }
    if (this.profile?.userName) {
      this._showLoader = true;
      dispatchAction(this, createMyAccountProfilePasswordResetAction(this.profile?.userName), {
        onSuccess: () => {
          this._showLoader = false;
          const message = this._getMessage(CHANGE_PASSWORD_SUCCESS_MESSAGE).replace('{0}', this.profile?.email || '');
          this._showSuccessToast(message);
        },
        onError: () => {
          this._showLoader = false;
          this._showErrorToast(this._getMessage(DEFAULT_ERROR_MESSAGE));
        }
      });
    }
  }
  handleSaveProfile(event) {
    event.stopPropagation();
    if (this._preventActionInPreview()) {
      return;
    }
    const payload = event.detail?.profile;
    this._showLoader = true;
    dispatchAction(this, createMyAccountProfileUpdateAction(payload), {
      onSuccess: result => {
        this._showLoader = false;
        if (this._editMode === 'personalDetails') {
          this.profileViewState = 'profileRead';
          this._showSuccessToast(this._getMessage(PERSONAL_DETAILS_UPDATED_SUCCESS_MESSAGE));
          return;
        }
        if (!this._isPasswordLessLoginEnabled && this._editMode === 'email') {
          this.profileViewState = 'profileRead';
          this._showSuccessToast(this._getMessage(EMAIL_UPDATED_WITH_LINK_SUCCESS_MESSAGE));
          return;
        }
        if (!this._isPasswordLessLoginEnabled && this._editMode === 'phone') {
          this.profileViewState = 'profileRead';
          this._showSuccessToast(this._getMessage(PHONE_UPDATED_SUCCESS_MESSAGE));
          return;
        }
        this._verifyMode = this._editMode;
        if (result?.verificationResponse?.recipient) {
          this._initiateVerificationFlow(result?.verificationResponse?.recipient);
        }
      },
      onError: () => {
        this._showLoader = false;
        this._showErrorToast(this._getMessage(PROFILE_UPDATE_FAILED));
      }
    });
  }
  _initiateVerificationFlow(recipient) {
    this._startResendTimer();
    this.profileViewState = 'verify';
    this._recipient = recipient;
    const messageCode = this._verifyMode === 'email' ? INIT_OTP_EMAIL_SUCCESS : INIT_OTP_PHONE_SUCCESS;
    this._showSuccessToast(this._getMessage(messageCode));
  }
  get _profileCardCustomCssStyles() {
    return `
            --com-c-my-profile-border-color: ${this.profileCardBorderColor || 'initial'};
            --com-c-my-profile-border-radius: ${this._profileCardBorderRadius || 'initial'};
        `;
  }
}