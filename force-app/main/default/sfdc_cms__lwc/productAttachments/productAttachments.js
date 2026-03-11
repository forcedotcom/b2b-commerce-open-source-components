import { api, LightningElement } from 'lwc';
export default class ProductAttachments extends LightningElement {
  static renderMode = 'light';
  @api
  product;
  @api
  fileIconColor;
  @api
  openFilesInNewTab;
}