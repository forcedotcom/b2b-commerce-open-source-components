import { LightningElement, api } from 'lwc';
export default class PromotionPopover extends LightningElement {
  static renderMode = 'light';
  @api
  popoverText;
  @api
  assistiveText;
  get popover() {
    return this.refs?.popupSource;
  }
  openPopover() {
    if (!this.popoverText) {
      return;
    }
    this.popover?.open({
      alignment: 'top',
      autoFlip: false,
      size: 'small'
    });
  }
  closePopover() {
    this.popover?.close();
  }
}