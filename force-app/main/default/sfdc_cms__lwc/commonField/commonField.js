import { LightningElement, api } from 'lwc';
import timeZone from '@salesforce/i18n/timeZone';
import basePath from '@salesforce/community/basePath';
import FieldType from './fieldTypes';
import { yesAssistiveText, noAssistiveText } from './labels';
export default class CommonField extends LightningElement {
  static renderMode = 'light';
  @api
  type;
  @api
  value;
  @api
  currencyCode;
  get timezone() {
    return timeZone;
  }
  get yesAssistiveText() {
    return yesAssistiveText;
  }
  get noAssistiveText() {
    return noAssistiveText;
  }
  get _normalizedType() {
    return (this.type || '').toUpperCase();
  }
  get isDefaultDisplayType() {
    const isText = FieldType.get(this._normalizedType) === 'TEXT';
    const isUnknownType = !FieldType.has(this._normalizedType);
    return isText || isUnknownType;
  }
  get isCurrencyType() {
    return FieldType.get(this._normalizedType) === 'CURRENCY';
  }
  get checkIconPath() {
    return `${basePath}/assets/icons/checkmark.svg#checkmark`;
  }
  get isDateTimeType() {
    return FieldType.get(this._normalizedType) === 'DATETIME';
  }
  get isDateType() {
    return FieldType.get(this._normalizedType) === 'DATE';
  }
  get isNumberType() {
    return FieldType.get(this._normalizedType) === 'NUMBER';
  }
  get isEmailType() {
    return FieldType.get(this._normalizedType) === 'EMAIL';
  }
  get isPercentType() {
    return FieldType.get(this._normalizedType) === 'PERCENT';
  }
  get isPhoneType() {
    return FieldType.get(this._normalizedType) === 'PHONE';
  }
  get isTimeType() {
    return FieldType.get(this._normalizedType) === 'TIME';
  }
  get isUrlType() {
    return FieldType.get(this._normalizedType) === 'URL';
  }
  get isAddressType() {
    return FieldType.get(this._normalizedType) === 'ADDRESS';
  }
  get isTrueBooleanType() {
    return FieldType.get(this._normalizedType) === 'BOOLEAN' && (this.value === 'true' || this.value === true);
  }
  get isFalseBooleanType() {
    return FieldType.get(this._normalizedType) === 'BOOLEAN' && !(this.value === 'true' || this.value === true);
  }
  get isLocationType() {
    return FieldType.get(this._normalizedType) === 'GEOLOCATION';
  }
}