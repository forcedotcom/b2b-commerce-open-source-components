import { LightningElement, api } from 'lwc';
export default class MyAccountAddressCard extends LightningElement {
  static renderMode = 'light';
  static STATE_NAME_COUNTRIES = ['JP', 'CN', 'KR', 'TW', 'TH', 'VN', 'MY'];
  @api
  item;
  @api
  cardDefaultBadgeLabel;
  @api
  footerEditLabel;
  @api
  footerDeleteLabel;
  @api
  rawInternationalizationData;
  get addressId() {
    return this.item?.addressId;
  }
  get name() {
    return this.item?.name;
  }
  get firstName() {
    return this.item?.firstName;
  }
  get lastName() {
    return this.item?.lastName;
  }
  get addressType() {
    return this.item?.addressType;
  }
  get street() {
    return this.item?.street;
  }
  get city() {
    return this.item?.city;
  }
  get region() {
    return this.getInternationalizedValue('region');
  }
  get country() {
    return this.getInternationalizedValue('country');
  }
  get phoneNumber() {
    return this.item?.phoneNumber;
  }
  get postalCode() {
    return this.item?.postalCode;
  }
  get isDefault() {
    return this.item?.isDefault;
  }
  get footerDisable() {
    return false;
  }
  getInternationalizedValue(fieldType) {
    const {
      country,
      region
    } = this.item ?? {};
    if (!country || !MyAccountAddressCard.STATE_NAME_COUNTRIES.includes(country)) {
      return fieldType === 'region' ? region : country;
    }
    const countryData = this.rawInternationalizationData?.addressCountries?.find(c => c.isoCode === country);
    switch (fieldType) {
      case 'region':
        return countryData?.states?.find(s => s.isoCode === region)?.label || region;
      default:
        return countryData?.label || country;
    }
  }
}