import LightningModal from 'lightning/modal';
import { labels } from './labels';
import { api } from 'lwc';
export default class CheckoutEmptyshipmentModal extends LightningModal {
  @api
  cartItemId;
  get labels() {
    return labels;
  }
  handleCancel() {
    this.close();
  }
  handleSubmit() {
    const submitEvent = new CustomEvent('submit', {
      composed: true,
      bubbles: true,
      detail: {
        cartItemId: this.cartItemId,
        close: this.close.bind(this)
      }
    });
    this.dispatchEvent(submitEvent);
  }
}