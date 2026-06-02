import { LightningElement, api } from 'lwc';
import { Labels } from './labels';
export default class PromotionTermsConditionsPopover extends LightningElement {
  static renderMode = 'light';
  @api
  headerText;
  @api
  bodyText;
  openPopup() {
    this.popup?.open({
      alignment: 'bottom',
      autoFlip: false,
      size: 'small'
    });
  }
  closePopup() {
    this.popup?.close();
  }
  get popup() {
    return this.refs?.popupSource ?? null;
  }
  get labels() {
    return Labels;
  }
}