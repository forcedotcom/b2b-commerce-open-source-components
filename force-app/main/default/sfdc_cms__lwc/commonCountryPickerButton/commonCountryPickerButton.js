import { LightningElement, api } from 'lwc';
import BasePath from '@salesforce/community/basePath';
import { generateButtonVariantClass, generateButtonIconSize } from 'experience/styling';
const EVENT_OPEN_COUNTRY_PICKER = 'opencountrypicker';
const BUTTON_LABEL_TEMPLATE = '{0} | {1} - {2}';
const BUTTON_BLANK_LABEL_TEMPLATE = '{0} | {1}';
export default class CommonCountryPickerButton extends LightningElement {
  static renderMode = 'light';
  @api
  variant;
  @api
  alignment;
  @api
  size;
  @api
  buttonLabel;
  @api
  disabled = false;
  @api
  buttonLang;
  @api
  buttonCountry;
  @api
  showGlobeIcon = false;
  get iconPath() {
    return `${BasePath}/assets/images/globe-icon.svg#globe-icon`;
  }
  @api
  focusButton() {
    this.querySelector('button')?.focus();
  }
  get buttonLabelText() {
    const labelTemplate = this.buttonLabel?.trim() ? BUTTON_LABEL_TEMPLATE : BUTTON_BLANK_LABEL_TEMPLATE;
    return labelTemplate.replace('{0}', this.buttonCountry ?? '').replace('{1}', this.buttonLang ?? '').replace('{2}', this.buttonLabel ?? '');
  }
  get customIconClasses() {
    const classes = [generateButtonVariantClass(this.variant ?? null)];
    this.disabled ? classes.push('site-common-country-picker-button-icon-disabled') : classes.push('site-common-country-picker-button-icon');
    return classes;
  }
  get alignmentClasses() {
    return 'site-common-country-picker-button-alignment';
  }
  get customPickerClasses() {
    const classes = ['site-common-country-picker-button'];
    if (!this.disabled) {
      this.variant === 'primary' ? classes.push('site-common-country-picker-ui-primary-icon-color') : classes.push('site-common-country-picker-ui-icon-color');
    }
    return classes;
  }
  get customIconSize() {
    return generateButtonIconSize(this.size ?? 'small');
  }
  handleClick() {
    const openCountryPicker = new CustomEvent(EVENT_OPEN_COUNTRY_PICKER);
    this.dispatchEvent(openCountryPicker);
  }
}