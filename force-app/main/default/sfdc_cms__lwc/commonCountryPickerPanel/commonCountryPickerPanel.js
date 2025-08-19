import { LightningElement, api } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import { closeButtonText } from './labels';
export default class CommonCountryPickerPanel extends LightningElement {
  static renderMode = 'light';
  labels = {
    closeButtonText
  };
  @api
  columns;
  get _columnsCssValue() {
    return this.columns ? this.generateCssGridColumnValue(this.columns) : '';
  }
  @api
  locales;
  @api
  headingLabelText;
  get gridStyles() {
    const styleProps = {
      '--com-c-country-picker-grid-columns': this._columnsCssValue
    };
    return generateStyleProperties(styleProps);
  }
  generateCssGridColumnValue(numColumns) {
    return new Array(numColumns).fill('1fr').join(' ');
  }
  handleClose(e) {
    e.stopPropagation();
    this.closePanel();
  }
  handleKeyDown(e) {
    if (e.code === 'Escape') {
      this.closePanel();
    }
  }
  closePanel() {
    this.dispatchEvent(new CustomEvent('closecountrypicker'));
  }
}