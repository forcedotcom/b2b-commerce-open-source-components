import { api, LightningElement } from 'lwc';
import { isDesignMode } from 'experience/clientApi';
import { generateElementAlignmentClass } from 'experience/styling';
export default class ProductBundleButtonViewAll extends LightningElement {
  static renderMode = 'light';
  static PAGINATION_ACTION_APPEND = 'append';
  @api
  nextPageToken;
  @api
  text;
  @api
  type;
  @api
  size;
  @api
  width;
  @api
  alignment;
  get buttonClass() {
    return ['action-button', ...(this.alignment ? [generateElementAlignmentClass(this.alignment)] : [])].join(' ');
  }
  handleShowMore(event) {
    const target = event.target;
    target?.dispatchEvent(new CustomEvent(ProductBundleButtonViewAll.PAGINATION_ACTION_APPEND, {
      bubbles: true,
      composed: true
    }));
  }
  get isDisplayable() {
    return isDesignMode || Boolean(this.nextPageToken);
  }
}