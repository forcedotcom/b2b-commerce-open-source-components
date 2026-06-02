import { LightningElement, api } from 'lwc';
import { PRIVACY_POLICY_URL, OTP_SIZE, TERMS_OF_SERVICE_URL } from './constants';
import { ResendCodeButtonLabel, ResendWaitMessage, ReCaptchaDisclaimer, OtpInputAriaLabel, LoaderAssistiveText } from './labels';
export default class MyAccountProfileVerification extends LightningElement {
  static renderMode = 'light';
  @api
  header;
  @api
  description;
  @api
  showOtpInputsOnly;
  @api
  showResendCodeButton;
  @api
  resendWaitTimeLeft;
  @api
  changeAuthenticationMethodButtonLabel;
  @api
  showOtpSpinner;
  @api
  showOtpError;
  @api
  showChangeAuthenticationMethodButton;
  @api
  otpErrorMessage;
  @api
  focus() {
    const target = this.refs?.input;
    target?.focus();
  }
  get _resendCodeButtonLabel() {
    return ResendCodeButtonLabel;
  }
  get _otpInputAriaLabel() {
    return OtpInputAriaLabel;
  }
  get _loaderAssistiveText() {
    return LoaderAssistiveText;
  }
  get _showNonOtpContent() {
    return !this.showOtpInputsOnly;
  }
  get _showResendWaitMessage() {
    return !this.showResendCodeButton;
  }
  get _resendWaitMessage() {
    return this.resendWaitTimeLeft ? ResendWaitMessage?.replace('{0}', this.resendWaitTimeLeft) : '';
  }
  get _reCaptchaDisclaimer() {
    return ReCaptchaDisclaimer?.replace('{0}', PRIVACY_POLICY_URL).replace('{1}', TERMS_OF_SERVICE_URL);
  }
  _segmentsFilled() {
    const otpSegments = this.querySelectorAll('input');
    for (let i = 0; i < otpSegments.length; i++) {
      if (otpSegments[i].value === '') {
        return false;
      }
    }
    return true;
  }
  handleInput(event) {
    const inputField = event.target;
    if (!/^[0-9]$/.test(inputField?.value)) {
      inputField.value = '';
    } else if (inputField.value && inputField.dataset.segment) {
      const segmentNumber = parseInt(inputField.dataset.segment, 10);
      if (segmentNumber < OTP_SIZE) {
        const nextSegment = this.refs?.otpContainer?.querySelector(`[data-segment="${segmentNumber + 1}"]`);
        if (nextSegment) {
          nextSegment.focus();
        }
      }
    }
    if (this._segmentsFilled()) {
      this.handleOtpSubmitAction();
    }
  }
  handleKeyDown(event) {
    const inputField = event.target;
    if (!inputField.dataset.segment) {
      return;
    }
    const segmentNumber = parseInt(inputField?.dataset?.segment, 10);
    if (event.key === 'Backspace' && !inputField.value && inputField.dataset.segment) {
      const prevSegment = this.refs?.otpContainer?.querySelector(`[data-segment="${segmentNumber - 1}"]`);
      if (prevSegment && segmentNumber > 1) {
        prevSegment.focus();
      }
    }
    if (event.key === 'ArrowLeft') {
      const prevSegment = this.refs?.otpContainer?.querySelector(`[data-segment="${segmentNumber - 1}"]`);
      if (prevSegment) {
        prevSegment.focus();
      }
    }
    if (event.key === 'ArrowRight') {
      const nextSegment = this.refs?.otpContainer?.querySelector(`[data-segment="${segmentNumber + 1}"]`);
      if (nextSegment) {
        nextSegment.focus();
      }
    }
  }
  handlePaste(event) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text');
    const inputField = event.target;
    if (pastedText && !/^\d{1,6}$/.test(pastedText)) {
      return;
    }
    if (pastedText && inputField.dataset.segment) {
      let currentInputIndex = parseInt(inputField.dataset.segment, 10) - 1;
      const otpSegments = this.querySelectorAll('input');
      for (let i = 0; i < pastedText.length && currentInputIndex + i < otpSegments.length; i++) {
        otpSegments[currentInputIndex + i].value = pastedText[i];
      }
      if (currentInputIndex + pastedText.length < otpSegments.length) {
        currentInputIndex += pastedText.length;
        otpSegments[currentInputIndex].focus();
      }
    }
    if (this._segmentsFilled()) {
      this.handleOtpSubmitAction();
    }
  }
  handleOtpSubmitAction() {
    const otpSegments = this.querySelectorAll('input');
    let code = '';
    otpSegments?.forEach(segment => {
      code += segment?.value;
    });
    this.dispatchEvent(new CustomEvent('submitotp', {
      bubbles: true,
      composed: true,
      detail: {
        code
      }
    }));
  }
  handleResendActionClick() {
    this.dispatchEvent(new CustomEvent('resendotp', {
      bubbles: true,
      composed: true
    }));
  }
  handleChangeAuthenticationMethodButtonClick() {
    this.dispatchEvent(new CustomEvent('changeauthenticationmethod', {
      bubbles: true,
      composed: true
    }));
  }
}