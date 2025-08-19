import { api, LightningElement } from 'lwc';
import { generatePaddingClass, generateThemeTextSizeClass } from 'experience/styling';
const DEFAULT_HEADING_TAG = 'h3';
export default class CommonFormattedCurrencyUi extends LightningElement {
  static renderMode = 'light';
  @api
  value;
  @api
  displayAs;
  @api
  currencyCode;
  @api
  textDisplayInfo;
  @api
  paddingVertical;
  @api
  paddingHorizontal;
  get customClasses() {
    const DEFAULT_TEXTHEADINGSIZE = 'heading-medium';
    const textStyle = this.textDisplayInfo?.textStyle || DEFAULT_TEXTHEADINGSIZE;
    return [generateThemeTextSizeClass(textStyle), this.paddingVertical ? generatePaddingClass(this.paddingVertical, 'vertical') : '', this.paddingHorizontal ? generatePaddingClass(this.paddingHorizontal, 'horizontal') : ''].filter(generatedClass => generatedClass).join(' ');
  }
  get headingTag() {
    return this.textDisplayInfo?.headingTag || DEFAULT_HEADING_TAG;
  }
  get isH1() {
    return this.headingTag === 'h1';
  }
  get isH2() {
    return this.headingTag === 'h2';
  }
  get isH3() {
    return this.headingTag === 'h3';
  }
  get isH4() {
    return this.headingTag === 'h4';
  }
  get isH5() {
    return this.headingTag === 'h5';
  }
  get isH6() {
    return this.headingTag === 'h6';
  }
  get isBody() {
    return this.headingTag === 'p';
  }
  get valueOrDefault() {
    return this.value ?? '';
  }
  get displayAsOrDefault() {
    return this.displayAs ?? 'symbol';
  }
}