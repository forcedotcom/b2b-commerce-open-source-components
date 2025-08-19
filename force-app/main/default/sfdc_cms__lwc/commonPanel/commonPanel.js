import { LightningElement, api } from 'lwc';
import BasePath from '@salesforce/community/basePath';
import { labels } from './labels';

/**
 * @slot panelHeading
 * @slot panelBody
 * @slot panelFooter
 */
export default class CommonPanel extends LightningElement {
  static renderMode = 'light';
  _panelFooterHeight;
  closeButtonAriaLabel = labels.closeButtonAriaLabel;
  renderedCallback() {
    this._panelFooterHeight = this.refs?.panelFooter?.clientHeight;
  }
  @api
  get fetchIcon() {
    return `${BasePath}/assets/icons/utility-sprite/svg/symbols.svg#close`;
  }
  get panelBodyStyles() {
    return `padding-bottom: ${this._panelFooterHeight || 0}px`;
  }
  handleClose(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('close', {
      detail: event
    }));
  }
}