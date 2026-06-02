import { LightningElement, api } from 'lwc';
/**
 * @slot content
 * @slot summary
 * @slot error
 */
export default class OrderConfirmationLayoutContent extends LightningElement {
  static renderMode = 'light';
  @api
  clientState;
  @api
  loaderAltText;
  get showLoader() {
    return !!this.clientState?.isLoading;
  }
  get showError() {
    return !this.showLoader && !!this.clientState?.hasErrors;
  }
  get showContent() {
    return !this.showLoader && !this.clientState?.hasErrors;
  }
}