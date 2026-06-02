import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { modalHeader, otpDescriptionEmail, otpDescriptionPhone, resendButton, guestCheckout, switchEmailButton } from './labels';
export default class CommonPasswordlessLoginModal extends LightningModal {
  get labels() {
    return {
      modalHeader,
      otpDescriptionEmail,
      otpDescriptionPhone,
      resendButton,
      guestCheckout,
      switchEmailButton
    };
  }
  _deliveryMethod;
  @api
  get deliveryMethod() {
    return this._deliveryMethod;
  }
  set deliveryMethod(value) {
    this._deliveryMethod = value;
  }
  @api
  showLogo;
  @api
  logoUrl;
  @api
  phoneNumber;
  modalErrorMessage;
  modalShowSpinner = false;
  otp;
  firstFocus = false;
  renderedCallback() {
    const firstDigit = this.template?.querySelectorAll('input')[0];
    if (!this.firstFocus) {
      setTimeout(() => {
        firstDigit?.focus();
        this.firstFocus = true;
      }, 0);
    }
  }
  handleVerifyOTP() {
    const otpSegments = this.template?.querySelectorAll('input');
    this.otp = '';
    otpSegments?.forEach(segment => {
      this.otp += segment.value;
    });
    const otpEvent = new CustomEvent('submit', {
      detail: {
        otp: this.otp,
        callback: (error, showSpinner) => {
          this.modalErrorMessage = error;
          this.modalShowSpinner = showSpinner;
          if (!showSpinner) {
            otpSegments?.item(0).focus();
            otpSegments?.forEach(segment => {
              segment.value = '';
            });
          }
        }
      }
    });
    this.dispatchEvent(otpEvent);
  }
  resendOTP() {
    this.modalErrorMessage = '';
    const resendEvent = new CustomEvent('resend', {
      detail: {
        otp: this.otp
      }
    });
    this.dispatchEvent(resendEvent);
    const otpSegments = this.template?.querySelectorAll('input');
    otpSegments?.item(0).focus();
    otpSegments?.forEach(segment => {
      segment.value = '';
    });
  }
  switchToEmail() {
    this.modalErrorMessage = '';
    const emailEvent = new CustomEvent('emailswitch', {
      detail: {
        otp: this.otp
      }
    });
    this.dispatchEvent(emailEvent);
    this._deliveryMethod = 'Email';
    const otpSegments = this.template?.querySelectorAll('input');
    otpSegments?.item(0).focus();
    otpSegments?.forEach(segment => {
      segment.value = '';
    });
  }
  guestCheckout() {
    const checkoutEvent = new CustomEvent('guestcheckout');
    this.dispatchEvent(checkoutEvent);
    this.close();
  }
  handleInput(event) {
    const inputField = event.target;
    if (inputField.value && inputField.dataset.segment) {
      const segmentNumber = parseInt(inputField.dataset.segment, 10);
      if (segmentNumber < 6) {
        const nextSegment = this.template?.querySelector(`[data-segment="${segmentNumber + 1}"]`);
        if (nextSegment) {
          nextSegment.focus();
        }
      }
      if (this.segmentsFilled()) {
        this.handleVerifyOTP();
      }
    }
  }
  handleKeyDown(event) {
    const inputField = event.target;
    if (event.key === 'Backspace' && !inputField.value && inputField.dataset.segment) {
      const segmentNumber = parseInt(inputField.dataset.segment, 10);
      const prevSegment = this.template?.querySelector(`[data-segment="${segmentNumber - 1}"]`);
      if (prevSegment && segmentNumber > 1) {
        prevSegment.focus();
      }
    }
  }
  handlePaste(event) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text');
    const inputField = event.target;
    if (pastedText && inputField.dataset.segment) {
      let currentInputIndex = parseInt(inputField.dataset.segment, 10) - 1;
      const otpSegments = this.template?.querySelectorAll('input');
      for (let i = 0; i < pastedText.length && currentInputIndex + i < otpSegments.length; i++) {
        otpSegments[currentInputIndex + i].value = pastedText[i];
      }
      if (currentInputIndex + pastedText.length < otpSegments.length) {
        currentInputIndex += pastedText.length;
        otpSegments[currentInputIndex].focus();
      }
    }
    if (this.segmentsFilled()) {
      this.handleVerifyOTP();
    }
  }
  segmentsFilled() {
    const otpSegments = this.template?.querySelectorAll('input');
    for (let i = 0; i < otpSegments.length; i++) {
      if (otpSegments[i].value === '') {
        return false;
      }
    }
    return true;
  }
  get showTextButton() {
    return this.deliveryMethod === 'Sms';
  }
  get descriptionLabel() {
    const lastFourDigits = this.phoneNumber?.slice(-4);
    if (this.deliveryMethod === 'Sms' && lastFourDigits) {
      return otpDescriptionPhone.replace('****', lastFourDigits);
    }
    return otpDescriptionEmail;
  }
}