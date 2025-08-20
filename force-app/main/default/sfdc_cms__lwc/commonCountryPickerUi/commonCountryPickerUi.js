import { LightningElement, api } from 'lwc';
import CountrySelectorConfirmationModal from 'site/commonCountryPickerConfirmationModal';
import { generateStyleProperties } from 'experience/styling';
import { sortLocales } from './util';
export default class CommonCountryPickerUi extends LightningElement {
  static renderMode = 'light';
  @api
  locales;
  @api
  sort;
  @api
  displayType;
  @api
  countryTextColor;
  @api
  countryHoverTextColor;
  @api
  countryTextAlignment;
  @api
  backgroundColor;
  @api
  backgroundTransparency;
  @api
  pickerButtonAlignment;
  @api
  pickerButtonStyle;
  @api
  pickerButtonSize;
  @api
  pickerButtonLabelText;
  @api
  pickerButtonLanguage;
  @api
  pickerButtonCountry;
  @api
  showGlobeIcon = false;
  @api
  totalProductCount;
  @api
  headingLabelText;
  @api
  headingTextDisplayInfo;
  @api
  headingTextAlignment;
  @api
  headingTextDecoration;
  @api
  headingPaddingVertical;
  @api
  headingTextColor;
  displayPanel = false;
  get localesSorted() {
    return sortLocales(this.locales ?? [], this.sort);
  }
  get disabled() {
    return this.localesSorted.length < 2;
  }
  get panelClasses() {
    return this.displayPanel ? 'slds-show' : 'slds-hide';
  }
  get customStyles() {
    return generateStyleProperties({
      '--com-c-country-picker-panel-background': this.backgroundColor || '',
      '--com-c-country-picker-grid-country-label-color': this.countryTextColor || '',
      '--com-c-country-picker-grid-country-label-hover-color': this.countryHoverTextColor || '',
      '--com-c-country-picker-grid-country-horizontal-align': this.countryTextAlignment || ''
    });
  }
  handlePickerButton() {
    this.displayPanel = !this.displayPanel;
  }
  async handleLocaleChange(e) {
    e.stopPropagation();
    if (this.totalProductCount) {
      this.displayPanel = false;
      await CountrySelectorConfirmationModal.open({
        locale: e.detail,
        onconfirmselection: () => {
          this.dispatchLocaleChangeEvent(e.detail);
        }
      });
    } else {
      this.dispatchLocaleChangeEvent(e.detail);
    }
  }
  dispatchLocaleChangeEvent(locale) {
    this.dispatchEvent(new CustomEvent('localechange', {
      bubbles: true,
      composed: true,
      detail: locale
    }));
  }
  handleClose(e) {
    e.stopPropagation();
    this.displayPanel = false;
    Promise.resolve().then(() => {
      const countryPickerButton = this.refs?.countryPickerButton;
      countryPickerButton?.focusButton();
    });
  }
}