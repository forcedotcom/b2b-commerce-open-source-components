import { api, LightningElement } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import { transformMediaItems } from './utils';
export default class ProductAttachmentsUi extends LightningElement {
  static renderMode = 'light';
  @api
  product;
  @api
  fileIconColor;
  @api
  openFilesInNewTab = false;
  get files() {
    return transformMediaItems(this.product);
  }
  get cssProperties() {
    return generateStyleProperties({
      ...(this.fileIconColor ? {
        '--com-c-product-attachments-icon-color-foreground-default': this.fileIconColor
      } : {}),
      '--slds-c-icon-color-foreground-default': `var(--com-c-product-attachments-icon-color-foreground-default, var(--sds-c-icon-color-foreground-default, #747474))`
    });
  }
  get target() {
    return this.openFilesInNewTab ? '_blank' : '_self';
  }
  get rel() {
    return this.openFilesInNewTab ? 'nofollow noopener noreferrer' : '';
  }
  renderedCallback() {
    this.classList.toggle('slds-hide', this.files.length === 0);
  }
}