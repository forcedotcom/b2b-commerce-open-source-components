import { LightningElement, api } from 'lwc';
import { isDesignMode } from 'experience/clientApi';

/**
 * @slot itemsBody
 */
export default class ProductBundle extends LightningElement {
  static renderMode = 'light';
  @api
  productClass;
  @api
  total;
  get isVisible() {
    return isDesignMode || this.productClass === 'Bundle' && Boolean(this.total);
  }
}