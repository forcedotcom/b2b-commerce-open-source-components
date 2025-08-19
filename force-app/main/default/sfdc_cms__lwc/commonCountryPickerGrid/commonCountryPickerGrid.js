import { LightningElement, api } from 'lwc';
import { getFlagEmoji, getLocaleLabel } from './util';
export default class CommonCountryPickerGrid extends LightningElement {
  static renderMode = 'light';
  @api
  locales;
  get formattedLocales() {
    return (this.locales ?? []).map(locale => ({
      ...locale,
      flag: getFlagEmoji(locale.countryCode),
      localeLabel: getLocaleLabel(locale.languageLabel, locale.countryLabel)
    }));
  }
  handleLocaleClick(e) {
    const locale = e.currentTarget?.dataset.locale;
    this.dispatchEvent(new CustomEvent('localechange', {
      bubbles: true,
      composed: true,
      detail: locale
    }));
  }
}