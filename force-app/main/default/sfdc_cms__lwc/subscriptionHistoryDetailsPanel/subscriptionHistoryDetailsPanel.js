import { LightningElement } from 'lwc';
import BasePath from '@salesforce/community/basePath';
import { closeButtonAriaLabel } from './labels';

/**
 * @slot panelHeading
 * @slot panelBody
 */
export default class SubscriptionHistoryDetailsPanel extends LightningElement {
  static renderMode = 'light';
  get _closeButtonAriaLabel() {
    return closeButtonAriaLabel;
  }
  get closeIcon() {
    return `${BasePath}/assets/icons/utility-sprite/svg/symbols.svg#close`;
  }
  handleClose(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('close', {
      detail: event
    }));
  }
}