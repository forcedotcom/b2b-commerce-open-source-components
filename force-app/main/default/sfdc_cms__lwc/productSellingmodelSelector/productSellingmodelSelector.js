import { api, LightningElement } from 'lwc';
import { createProductSubscriptionUpdateAction, dispatchAction } from 'commerce/actionApi';
import { generateStyleProperty } from 'experience/styling';

/**
 * @slot lifeTimeLabel
 * @slot subscriptionLabel
 * @slot lifeTimePrice
 * @slot selectedSubscriptionPrice
 * @slot oneTimeDescription
 * @slot subscribeDescription
 */
export default class ProductSellingmodelSelector extends LightningElement {
  static renderMode = 'light';
  @api
  product;
  @api
  productPricing;
  @api
  selectedProductSellingModel;
  @api
  productVariant;
  @api
  showBorder = false;
  @api
  borderRadius;
  @api
  borderColor;
  get _displayProductSellingOptions() {
    return this.productVariant?.isValid !== false && this.product?.productClass !== 'VariationParent' && this.product?.productClass !== 'Set' && this.hasSubscriptionPrice();
  }
  hasSubscriptionPrice() {
    return this.product?.productSellingModels?.some(productSellingModel => {
      return this.productPricing?.productPriceEntries?.some(productPriceEntry => {
        return productSellingModel.id === productPriceEntry.productSellingModelId && Boolean(productPriceEntry.unitPrice);
      });
    }) ?? false;
  }
  get _customStyles() {
    return [...(this.borderRadius ? [generateStyleProperty('--com-c-product-selling-model-border-radius', this.borderRadius, 'px')] : []), ...(this.borderColor ? [generateStyleProperty('--com-c-product-selling-model-border-color', this.borderColor)] : [])].join('');
  }
  handleSubscriptionChanged(event) {
    event.stopPropagation();
    dispatchAction(this, createProductSubscriptionUpdateAction(event.detail.productSellingModelId, event.detail.subscriptionTerm));
  }
  renderedCallback() {
    this.classList.toggle('slds-hide', !this._displayProductSellingOptions);
  }
}