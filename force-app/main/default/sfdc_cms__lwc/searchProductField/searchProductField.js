import { LightningElement, api } from 'lwc';
import sanitizeValue from 'site/commonRichtextsanitizerUtils';
import { generateStyleProperties, generateTextHeadingSizeClass } from 'experience/styling';
import { FieldTypeEnum } from './constants';
export default class SearchProductField extends LightningElement {
  static renderMode = 'light';
  @api
  configuration;
  @api
  displayData;
  @api
  focus() {
    this.querySelector('div')?.focus?.();
  }
  get label() {
    return this.displayData?.label;
  }
  get tooltipText() {
    return sanitizeValue(this.displayData?.value, []);
  }
  get value() {
    return (this.displayData?.value ?? '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  }
  get type() {
    return this.displayData?.type ?? '';
  }
  get fontSize() {
    return this.configuration?.fontSize ?? '';
  }
  get fontColor() {
    return this.configuration?.fontColor ?? '';
  }
  get showLabel() {
    return Boolean(this.configuration?.showLabel);
  }
  get tabStoppable() {
    return Boolean(this.displayData?.tabStoppable);
  }
  get isLabelAvailable() {
    return this.showLabel && !!this.label;
  }
  get isDefaultDisplayType() {
    return !this.isBoldStringType && !this.isCurrencyType && !this.isDateTimeType && !this.isNumberType && !this.isEmailType && !this.isPercentType && !this.isPhoneType && !this.isTimeType && !this.isUrlType && !this.isVariationType;
  }
  get isBoldStringType() {
    return this.type === FieldTypeEnum.BOLD_STRING;
  }
  get isCurrencyType() {
    return this.type === FieldTypeEnum.CURRENCY;
  }
  get isDateTimeType() {
    return this.type === FieldTypeEnum.DATETIME || this.type === FieldTypeEnum.DATE;
  }
  get isNumberType() {
    return this.type === FieldTypeEnum.DOUBLE || this.type === FieldTypeEnum.INTEGER;
  }
  get isEmailType() {
    return this.type === FieldTypeEnum.EMAIL;
  }
  get isPercentType() {
    return this.type === FieldTypeEnum.PERCENT;
  }
  get isPhoneType() {
    return this.type === FieldTypeEnum.PHONE;
  }
  get isTimeType() {
    return this.type === FieldTypeEnum.TIME;
  }
  get isUrlType() {
    return this.type === FieldTypeEnum.URL;
  }
  get isVariationType() {
    return this.type === FieldTypeEnum.VARIATION;
  }
  get allContentCustomStyling() {
    return generateStyleProperties({
      color: this.fontColor
    });
  }
  get allContentCustomClasses() {
    const classes = [generateTextHeadingSizeClass(this.fontSize)];
    if (!this.isVariationType) {
      classes.push('slds-truncate');
    }
    return classes;
  }
  get getTabindex() {
    return this.tabStoppable ? 0 : -1;
  }
}