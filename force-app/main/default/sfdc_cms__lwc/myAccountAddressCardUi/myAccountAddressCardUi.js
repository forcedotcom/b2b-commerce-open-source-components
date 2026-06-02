import { LightningElement, api } from 'lwc';
import addressCardStyleStringGenerator from './addressCardStyleStringGenerator';
import { AddressLabel, PhoneNumberLabel } from './labels';
import { getCustomLocale, isLastNameFirstCountry } from 'site/checkoutInternationalization';
function coerceStringProperty(value, fallback) {
  return value === null || value === undefined || value === '' ? fallback : String(value);
}
function coerceBooleanProperty(value) {
  if (typeof value === 'string') {
    return value !== '' && value.toLowerCase() !== 'false';
  }
  return !!value;
}
const DEFAULTS = {
  address: AddressLabel,
  defaultBadgeColor: 'var(--dxp-g-root)',
  defaultBorderRadius: '0'
};
export default class MyAccountAddressCardUi extends LightningElement {
  static renderMode = 'light';
  _addressType = '';
  _isDefault = false;
  _street = '';
  _city = '';
  _country = '';
  _phoneNumber = '';
  _postalCode = '';
  _defaultBadgeColor = DEFAULTS.defaultBadgeColor;
  _defaultBorderRadius = DEFAULTS.defaultBorderRadius;
  _defaultBadgeLabel = '';
  _countryNameToCode = {
    Japan: 'JP',
    China: 'CN',
    'Korea, Republic Of': 'KR',
    Taiwan: 'TW',
    Thailand: 'TH',
    Vietnam: 'VN',
    Malaysia: 'MY'
  };
  @api
  name;
  @api
  firstName;
  @api
  lastName;
  @api
  get addressType() {
    return this._addressType;
  }
  set addressType(value) {
    this._addressType = coerceStringProperty(value, '');
  }
  @api
  get isDefault() {
    return this._isDefault;
  }
  set isDefault(value) {
    this._isDefault = coerceBooleanProperty(value);
  }
  @api
  get street() {
    return this._street;
  }
  set street(value) {
    this._street = coerceStringProperty(value, '');
  }
  @api
  get city() {
    return this._city;
  }
  set city(value) {
    this._city = coerceStringProperty(value, '');
  }
  @api
  region;
  @api
  get country() {
    return this._country;
  }
  set country(value) {
    this._country = coerceStringProperty(value, '');
  }
  @api
  get phoneNumber() {
    return this._phoneNumber;
  }
  set phoneNumber(value) {
    this._phoneNumber = coerceStringProperty(value, '');
  }
  @api
  get postalCode() {
    return this._postalCode;
  }
  set postalCode(value) {
    this._postalCode = coerceStringProperty(value, '');
  }
  @api
  get defaultBadgeColor() {
    return this._defaultBadgeColor;
  }
  set defaultBadgeColor(value) {
    this._defaultBadgeColor = coerceStringProperty(value, '');
  }
  @api
  get defaultBorderRadius() {
    return this._defaultBorderRadius;
  }
  set defaultBorderRadius(value) {
    this._defaultBorderRadius = coerceStringProperty(value, '');
  }
  @api
  get defaultBadgeLabel() {
    return this._defaultBadgeLabel;
  }
  set defaultBadgeLabel(value) {
    this._defaultBadgeLabel = coerceStringProperty(value, '');
  }
  get showDefaultLabel() {
    return this.isDefault && this.defaultBadgeLabel !== '';
  }
  get defaultBadgeStyle() {
    const styles = {
      'default-badge-bg-color': `var(--com-c-my-account-address-card-badge-background-color,${this.defaultBadgeColor})`,
      'default-badge-border-radius': `var(--com-c-my-account-address-card-badge-border-radius, ${this.defaultBorderRadius}px)`
    };
    return addressCardStyleStringGenerator.defaultBadgeStyle.createForStyles(styles);
  }
  get customLocale() {
    return getCustomLocale(this.country in this._countryNameToCode ? this._countryNameToCode[this.country] : this.country);
  }
  get normalisedName() {
    if (this.firstName && this.lastName) {
      return this.concatenatedName();
    }
    return this.name;
  }
  get phoneNumberLabel() {
    return PhoneNumberLabel;
  }
  concatenatedName() {
    return isLastNameFirstCountry(this.country in this._countryNameToCode ? this._countryNameToCode[this.country] : this.country) ? `${this.lastName} ${this.firstName}` : `${this.firstName} ${this.lastName}`;
  }
}