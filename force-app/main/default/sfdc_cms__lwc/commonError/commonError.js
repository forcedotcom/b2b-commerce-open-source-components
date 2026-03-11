import { LightningElement, api } from 'lwc';
import BasePath from '@salesforce/community/basePath';
import { getIconPath } from 'experience/iconUtils';
export default class CommonError extends LightningElement {
  static renderMode = 'light';
  _errorType;
  iconType = 'warning';
  @api
  errorLabel;
  @api
  get errorType() {
    return this._errorType;
  }
  set errorType(value) {
    this.iconType = value || 'warning';
    this._errorType = value;
  }
  get iconPath() {
    if (this.iconType === 'warning') {
      return `${BasePath}/assets/icons/warning-filled.svg#warning-filled`;
    }
    return getIconPath(`utility:${this.iconType}`);
  }
  get iconVariantClassName() {
    if (this.iconType === 'warning') {
      return 'slds-icon-text-warning';
    }
    return `slds-icon-text-${this.iconType}`;
  }
  get computedTextColorClass() {
    let classNames = 'slds-m-horizontal_x-small';
    if (this.errorType === 'error') {
      classNames = `${classNames} slds-text-color_error`;
    }
    return classNames;
  }
}