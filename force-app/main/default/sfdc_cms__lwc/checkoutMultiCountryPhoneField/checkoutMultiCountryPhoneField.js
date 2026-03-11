import { api, LightningElement } from 'lwc';
import { PhonePrefixLabel, PhoneMessageWhenPatternMismatchLabel } from './labels';
import BasePath from '@salesforce/community/basePath';
const KEY = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ENTER: 'Enter',
  ESCAPE: 'Escape'
};
export default class CheckoutMultiCountryPhoneField extends LightningElement {
  static renderMode = 'light';
  _comboboxClassList = 'slds-dropdown-trigger slds-dropdown-trigger_click';
  _dropDownOpen = false;
  _country = '';
  _countryChanged = false;
  _northAmericaPhoneRegex = /^(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  _prevPhonePrefixDisplayValue;
  _tempDisableBlur = false;
  phoneNumberInput;
  countryCodeButton;
  listboxElement;
  renderedCallback() {
    this.phoneNumberInput = this.refs.phoneNumberInput;
    this.countryCodeButton = this.refs.countryCodeButton;
    this.listboxElement = this.refs.listboxElement;
  }
  @api
  readOnly = false;
  @api
  phoneNumberLabel;
  @api
  phoneNumberPlaceholderText;
  @api
  phoneNumber;
  @api
  phoneNumberRequired = false;
  @api
  rawInternationalizationData;
  @api
  get country() {
    return this._country;
  }
  set country(value) {
    this._country = value;
  }
  @api
  checkValidity() {
    return !!this.getPhoneInput()?.checkValidity();
  }
  @api
  reportValidity() {
    return !!this.getPhoneInput()?.reportValidity();
  }
  get phonePrefixDisplayValue() {
    let defaultPhoneCountry, selectedPhoneCountry;
    const rawCountryData = this.rawInternationalizationData?.addressCountries || [];
    if (this.country) {
      if (this.phoneNumber && !this._countryChanged) {
        const phoneCountryMatchWithCountryCode = rawCountryData?.find(countryData => {
          return countryData.isoCode === this.country && this.phoneNumber?.startsWith(`+${countryData.phoneCountryCode}`);
        });
        selectedPhoneCountry = phoneCountryMatchWithCountryCode || rawCountryData?.find(countryData => {
          return this.phoneNumber?.startsWith(`+${countryData.phoneCountryCode}`);
        });
        this._countryChanged = selectedPhoneCountry?.isoCode !== this._country;
        this._country = selectedPhoneCountry?.isoCode ?? this._country;
      } else {
        defaultPhoneCountry = rawCountryData?.find(countryData => countryData.isoCode === this.country) || rawCountryData[0];
      }
    }
    const phoneCountryCode = (selectedPhoneCountry || defaultPhoneCountry)?.phoneCountryCode?.toString();
    return phoneCountryCode ? `+${phoneCountryCode}` : '';
  }
  get phoneDisplayValue() {
    if (this.phoneNumber && this.phonePrefixDisplayValue === '+1' && this._northAmericaPhoneRegex.test(this.phoneNumber)) {
      return this.phoneNumber.replace(this._northAmericaPhoneRegex, '($1) $2-$3');
    }
    const selectedPrefixPhoneNumber = this._countryChanged && this.phoneNumber && this._prevPhonePrefixDisplayValue ? this.phoneNumber.replace(this._prevPhonePrefixDisplayValue, this.phonePrefixDisplayValue) : this.phoneNumber;
    return selectedPrefixPhoneNumber?.startsWith(this.phonePrefixDisplayValue) ? selectedPrefixPhoneNumber.replace(this.phonePrefixDisplayValue, '') : selectedPrefixPhoneNumber ?? '';
  }
  get comboboxClassList() {
    return this._dropDownOpen ? `${this._comboboxClassList} slds-is-open` : this._comboboxClassList;
  }
  get phonePrefixOptions() {
    const clonedCountryData = Array.from(this.rawInternationalizationData?.addressCountries || []);
    const sortedCountryData = clonedCountryData.sort((a, b) => a.label.localeCompare(b.label));
    const listBoxClassList = 'slds-media slds-listbox__option slds-listbox__option_plain slds-media_small';
    const options = sortedCountryData.map(countryData => {
      return {
        label: `${countryData.label} (+${countryData.phoneCountryCode})`,
        value: countryData.isoCode,
        classList: countryData.isoCode === this.country ? `${listBoxClassList} slds-is-selected slds-has-focus` : listBoxClassList,
        selected: countryData.isoCode === this.country
      };
    });
    return options;
  }
  get labels() {
    return {
      phonePrefixLabel: PhonePrefixLabel,
      phoneMessageWhenPatternMismatchLabel: PhoneMessageWhenPatternMismatchLabel
    };
  }
  get comboboxDisabled() {
    return this.rawInternationalizationData?.addressCountries?.length === 1 || this.readOnly;
  }
  get chevronDownIconPath() {
    return `${BasePath}/assets/icons/chevron-down.svg#chevron-down`;
  }
  getPhoneInput() {
    return this.phoneNumberInput;
  }
  mouseDown() {
    this._tempDisableBlur = true;
    setTimeout(() => {
      this._tempDisableBlur = false;
    }, 10);
  }
  toggleDropdown() {
    this.countryCodeButton?.focus();
    this._dropDownOpen = !this._dropDownOpen;
    if (this._dropDownOpen && this._country?.length) {
      this.countryCodeButton?.setAttribute('aria-activedescendant', this._country);
      this.scrollOptionIntoView(this._country);
    } else {
      this.countryCodeButton?.removeAttribute('aria-activedescendant');
    }
  }
  handleBlur() {
    if (!this._tempDisableBlur) {
      this._dropDownOpen = false;
    }
  }
  selectOption(event) {
    const countryIsoCode = event.currentTarget.dataset.value;
    this.changeCountry(countryIsoCode);
    this._dropDownOpen = false;
  }
  changeCountry(countryIsoCode) {
    this._prevPhonePrefixDisplayValue = this.phonePrefixDisplayValue;
    this._countryChanged = this._country !== countryIsoCode;
    this._country = countryIsoCode;
    const {
      formatted
    } = this.formatPhoneNumber(this.getPhoneInput().value);
    if (this._countryChanged && formatted.length) {
      this.dispatchCustomEvent(formatted);
    }
  }
  handleKeyDown(event) {
    if (this._dropDownOpen) {
      let index = this.phonePrefixOptions.findIndex(option => option.selected) || 0;
      const length = this.phonePrefixOptions.length;
      switch (event.key) {
        case KEY.ARROW_DOWN:
          event.preventDefault();
          index = (index + 1) % length;
          this.changeCountry(this.phonePrefixOptions[index].value);
          this.updateAriaActiveDescendant(this.phonePrefixOptions[index].value);
          this.scrollOptionIntoView(this.phonePrefixOptions[index].value);
          break;
        case KEY.ARROW_UP:
          event.preventDefault();
          index = index > 0 ? (index - 1) % length : length - 1;
          this.changeCountry(this.phonePrefixOptions[index].value);
          this.updateAriaActiveDescendant(this.phonePrefixOptions[index].value);
          this.scrollOptionIntoView(this.phonePrefixOptions[index].value);
          break;
        case KEY.ENTER:
        case KEY.ESCAPE:
          event.preventDefault();
          this._dropDownOpen = false;
          this.updateAriaActiveDescendant('');
          break;
        default:
          break;
      }
    } else if (event.key === KEY.ARROW_DOWN || event.key === KEY.ARROW_UP) {
      event.preventDefault();
      this.toggleDropdown();
    }
  }
  updateAriaActiveDescendant(value) {
    if (this.countryCodeButton) {
      if (value) {
        this.countryCodeButton.setAttribute('aria-activedescendant', value);
      } else {
        this.countryCodeButton.removeAttribute('aria-activedescendant');
      }
    }
  }
  scrollOptionIntoView(optionId) {
    const option = this.querySelector(`[id="${optionId}"]`);
    if (this.listboxElement && option) {
      const listboxRect = this.listboxElement.getBoundingClientRect();
      const optionRect = option.getBoundingClientRect();
      if (optionRect.bottom > listboxRect.bottom) {
        this.listboxElement.scrollTop += optionRect.bottom - listboxRect.bottom;
      } else if (optionRect.top < listboxRect.top) {
        this.listboxElement.scrollTop -= listboxRect.top - optionRect.top;
      }
    }
  }
  dispatchCustomEvent(prefixedPhoneNumber) {
    this.dispatchEvent(new CustomEvent('commit', {
      composed: true,
      bubbles: true,
      detail: {
        phoneNumber: prefixedPhoneNumber
      }
    }));
  }
  formatPhoneNumber(rawPhoneInput) {
    const userInputNumber = rawPhoneInput.replace(/[-\s()]./g, '').trim();
    const populated = userInputNumber.length !== 0;
    let formatted = '';
    if (populated) {
      if (this.phonePrefixDisplayValue === '+1' && this._northAmericaPhoneRegex.test(userInputNumber)) {
        formatted = `${this.phonePrefixDisplayValue}${userInputNumber.replace(this._northAmericaPhoneRegex, '$1$2$3')}`;
      } else if (/^[\d]*$/.test(userInputNumber)) {
        formatted = `${this.phonePrefixDisplayValue}${userInputNumber}`;
      }
    }
    return {
      formatted,
      populated
    };
  }
  handlePhoneNumberChange(event) {
    const formatResult = this.formatPhoneNumber(event.target.value);
    if (formatResult.populated) {
      if (formatResult.formatted.length) {
        this.dispatchCustomEvent(formatResult.formatted);
      }
      event?.target?.setAttribute('populated', '');
    } else {
      this.dispatchCustomEvent(formatResult.formatted);
      event?.target?.removeAttribute('populated');
    }
  }
}