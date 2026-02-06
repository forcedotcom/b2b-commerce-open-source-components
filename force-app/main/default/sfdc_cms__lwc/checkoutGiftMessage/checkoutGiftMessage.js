import { LightningElement, api } from 'lwc';
export default class CheckoutGiftMessage extends LightningElement {
  static renderMode = 'light';
  _labels;
  @api
  set labels(value) {
    this._labels = value;
  }
  get labels() {
    return this._labels;
  }
  _showGiftMessagingBox = false;
  _giftMessage;
  @api
  get giftMessageText() {
    return this._giftMessage;
  }
  set giftMessageText(value) {
    this._giftMessage = value;
  }
  connectedCallback() {
    if (!this._giftMessage || this._giftMessage === '') {
      this._showGiftMessagingBox = false;
    } else {
      this._showGiftMessagingBox = true;
    }
  }
  _maxLength = 200;
  @api
  get maxLength() {
    return this._maxLength;
  }
  set maxLength(value) {
    this._maxLength = value;
  }
  handleCheckboxChange(event) {
    this._showGiftMessagingBox = event.target.checked;
    this.dispatchEvent(new CustomEvent('giftmessagingselected', {
      detail: {
        isGiftMessagingSelected: this._showGiftMessagingBox
      }
    }));
  }
  @api
  get remainingChars() {
    return this._maxLength - (this._giftMessage?.length || 0);
  }
  @api
  get remainingCharactersLabel() {
    return this._labels?.giftMessageRemainingCharactersLabel?.replace('{0}', this.remainingChars.toString()) ?? '';
  }
  handleInputChange(event) {
    this._giftMessage = event.target.value;
    this.dispatchEvent(new CustomEvent('giftmessageupdate', {
      detail: {
        giftMessage: this._giftMessage.trim()
      }
    }));
  }
}