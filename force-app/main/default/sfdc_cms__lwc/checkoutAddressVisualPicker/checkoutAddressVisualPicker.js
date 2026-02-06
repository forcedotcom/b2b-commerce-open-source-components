import { api, LightningElement, track } from 'lwc';
import { badgeLabel, editButtonAriaLabel, labelRequired } from './labels';
import { getCustomLocale, isLastNameFirstCountry, getFormattedPhoneNumber, regionLabelCountryCodes } from 'site/checkoutInternationalization';
export default class CheckoutAddressVisualPicker extends LightningElement {
  static renderMode = 'light';
  static delegatesFocus = true;
  _rawInternationalizationData;
  _value;
  @track
  _options;
  @api
  get rawInternationalizationData() {
    return this._rawInternationalizationData;
  }
  set rawInternationalizationData(data) {
    this._rawInternationalizationData = data;
  }
  @api
  disabled = false;
  @api
  editAddressLabel;
  @api
  disableEdit = false;
  @api
  initValue;
  @api
  name;
  @api
  get options() {
    return this._options;
  }
  set options(addresses) {
    this._options = addresses;
  }
  @api
  focusOnValue(value) {
    this.querySelector(`input[value="${value}"]`)?.focus();
  }
  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }
  get badgeLabel() {
    return badgeLabel;
  }
  _helpMessage;
  get _ariaInvalid() {
    return !!this._helpMessage;
  }
  concatenatedName(item) {
    if (item.firstName && item.lastName) {
      return isLastNameFirstCountry(item.country) ? `${item.lastName} ${item.firstName}` : `${item.firstName} ${item.lastName}`;
    }
    return item.name || item.firstName || item.lastName;
  }
  countryData(countryCode) {
    return this.rawInternationalizationData?.addressCountries?.find(addressCountry => addressCountry.isoCode === countryCode);
  }
  countryLabel(countryCode) {
    return this.countryData(countryCode)?.label || countryCode || '';
  }
  stateLabel(countryCode, stateCode) {
    if (regionLabelCountryCodes.includes(countryCode || '')) {
      const stateData = this.countryData(countryCode)?.states.find(state => state.isoCode === stateCode);
      return stateData?.label;
    }
    return stateCode;
  }
  get transformedOptions() {
    return (this.options || []).map((item, index) => ({
      isChecked: this.value === item.addressId,
      canEdit: !this.disableEdit && this.value === item.addressId,
      indexId: `radio-${index}`,
      address: item,
      countryLabel: this.countryLabel(item.country),
      stateLabel: this.stateLabel(item.country, item.region),
      name: this.concatenatedName(item),
      hasCompanyName: !!item.companyName,
      formattedPhoneNumber: getFormattedPhoneNumber(item?.phoneNumber),
      customLocale: getCustomLocale(item.country || ''),
      ariaLabel: editButtonAriaLabel.replace('{0}', item.name ?? '')
    }));
  }
  getFirstInputElement() {
    return this.querySelector('input');
  }
  @api
  checkValidity() {
    return this.getFirstInputElement()?.checkValidity() ?? false;
  }
  @api
  reportValidity() {
    const valid = this.getFirstInputElement()?.reportValidity() ?? false;
    this.classList.toggle('slds-has-error', !valid);
    this._helpMessage = valid ? undefined : labelRequired;
    return valid;
  }
  handleChange(event) {
    event.stopPropagation();
    this._value = event.target.value;
    this.dispatchEvent(new CustomEvent('changeaddressoption', {
      detail: {
        value: event.target.value
      }
    }));
  }
  handleEdit(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('editaddress', {
      detail: {
        value: event.target.value
      }
    }));
  }
  connectedCallback() {
    this.classList.add('slds-form-element');
  }
  get fieldSetClasses() {
    const themeVersion = getComputedStyle(document.documentElement).getPropertyValue('--com-c-theme-version');
    if (Number(themeVersion) >= 2) {
      return 'separators';
    }
    return '';
  }
  get addressContainerClasses() {
    const themeVersion = getComputedStyle(document.documentElement).getPropertyValue('--com-c-theme-version');
    const classes = 'slds-grid slds-grid_vertical slds-wrap slds-grid_vertical-stretch address-stretch';
    if (Number(themeVersion) >= 2) {
      return 'slds-grid slds-grid_vertical slds-wrap slds-grid_vertical-stretch address-stretch';
    }
    return `${classes} slds-gutters_direct-x-small`;
  }
  get addressCardClasses() {
    const themeVersion = getComputedStyle(document.documentElement).getPropertyValue('--com-c-theme-version');
    const classes = 'slds-col slds-size_1-of-1';
    if (Number(themeVersion) >= 2) {
      return classes;
    }
    return `${classes} slds-medium-size_1-of-2 slds-large-size_1-of-3`;
  }
}