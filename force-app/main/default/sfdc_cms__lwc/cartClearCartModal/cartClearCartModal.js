import LightningModal from 'lightning/modal';
import { cancelClearCart, clearCartConfirmationHeader, confirmClearCart } from './labels';
export default class CartClearCartModal extends LightningModal {
  get clearCartConfirmationHeaderText() {
    return clearCartConfirmationHeader;
  }
  get confirmClearCartButtonText() {
    return confirmClearCart;
  }
  get cancelClearCartButtonText() {
    return cancelClearCart;
  }
  handleModalCancelButton() {
    this.close('close');
  }
  handleConfirmClearCart() {
    const submitEvent = new CustomEvent('submit', {
      composed: true,
      bubbles: true,
      detail: {
        close: this.close.bind(this)
      }
    });
    this.dispatchEvent(submitEvent);
  }
}