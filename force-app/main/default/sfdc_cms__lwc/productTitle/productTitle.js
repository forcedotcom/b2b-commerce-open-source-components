import { LightningElement, api } from 'lwc';
import generateLabel from './textGenerator';
import sanitizeValue from 'site/commonRichtextsanitizerUtils';
const NAV_TO_PRODUCT_DETAIL_EVENT = 'navigatetoproductdetailpage';
export default class ProductTitle extends LightningElement {
  static renderMode = 'light';
  @api
  name = '';
  @api
  isAvailable = false;
  @api
  productUnavailableMessage = '';
  @api
  productId;
  @api
  url;
  @api
  focusTitle() {
    const titleLink = this.querySelector('a');
    titleLink?.focus();
  }
  _htmlProductNameGate = false;
  @api
  set htmlProductNameGate(value) {
    this._htmlProductNameGate = value;
  }
  get htmlProductNameGate() {
    return this._htmlProductNameGate;
  }
  get _isNavigable() {
    return (this.productId || '').length > 0 && this.isAvailable === true;
  }
  get productName() {
    let sanitizedLabel = this.name;
    if (!import.meta.env.SSR && this.htmlProductNameGate) {
      sanitizedLabel = sanitizeValue(sanitizedLabel);
    }
    return sanitizedLabel;
  }
  get _productNameWithInvalidLabel() {
    return generateLabel(this.productName, this.productUnavailableMessage);
  }
  navigateToProductDetailPage(event) {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent(NAV_TO_PRODUCT_DETAIL_EVENT, {
      bubbles: true,
      composed: true,
      detail: {
        productId: this.productId
      }
    }));
  }
}