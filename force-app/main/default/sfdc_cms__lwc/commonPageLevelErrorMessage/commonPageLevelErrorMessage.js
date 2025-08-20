import { LightningElement, api } from 'lwc';
export default class CommonPageLevelErrorMessage extends LightningElement {
  static renderMode = 'light';
  @api
  errorIconName;
  @api
  errorIconSize;
  @api
  errorIconVariant;
  @api
  errorHeading;
  @api
  errorDescription;
  @api
  errorActionLabel;
  @api
  errorActionVariant;
  handleErrorActionClick() {
    this.dispatchEvent(new CustomEvent('erroractionclick'));
  }
}