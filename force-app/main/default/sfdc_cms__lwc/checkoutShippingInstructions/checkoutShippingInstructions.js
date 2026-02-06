import { api, track } from 'lwc';
import { CheckoutComponentBase } from 'commerce/checkoutApi';
import { CheckoutStage } from 'commerce/checkoutApi';
import { CheckoutStencilType } from 'site/checkoutStencil';
import shippingInstructionsFieldLabel from '@salesforce/label/site.checkoutShippingInstructions.deliveryInstructions';

/**
 * @slot heading
 */
export default class CheckoutShippingInstructions extends CheckoutComponentBase {
  static renderMode = 'light';
  @api
  placeholderLabel;
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
  _shippingInstructionsFieldLabel = shippingInstructionsFieldLabel;
  _stencilType = CheckoutStencilType.DEFAULT_EDIT;
  _shippingInstructionsStencilItemCount = 1;
  _showStencil = true;
  _summarized = false;
  _readOnly = false;
  get _showSummary() {
    return !this._showStencil && this._summarized && !!this.shippingInstructions;
  }
  get _showEdit() {
    return !this._showStencil && !this._summarized;
  }
  get showHeadingClass() {
    return this._showStencil || this._showEdit || this._showSummary ? '' : 'slds-hide';
  }
  connectedCallback() {
    this.onSetProperties();
  }
  onSetProperties() {
    if (!this.isConnected) {
      return;
    }
    if (this._checkoutDetails && this._showStencil) {
      this._showStencil = false;
      this.dispatchRequestAspect({
        summarizable: true
      });
    }
  }
  setAspect(newAspect) {
    this._readOnly = newAspect.readOnlyIfValid && this.checkValidity();
    this._summarized = newAspect.summary;
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
  get shippingInstructions() {
    return this._checkoutDetails?.deliveryGroups?.items[0].shippingInstructions ?? '';
  }
  async handleShippingInstructionChange(event) {
    const shippingInstructions = event.target.value.trim();
    if (this.checkValidity()) {
      await this.dispatchUpdateAsync({
        defaultDeliveryGroup: {
          shippingInstructions
        }
      });
      this.dispatchCommit();
    }
  }
  getShippingInstructionsInputElement() {
    return this.refs?.dataShippingInstructions;
  }
  checkValidity() {
    return !this._showStencil && (!this._showEdit || (this.getShippingInstructionsInputElement()?.checkValidity() ?? false));
  }
  reportValidity() {
    return !this._showStencil && (!this._showEdit || (this.getShippingInstructionsInputElement()?.reportValidity() ?? false));
  }
}