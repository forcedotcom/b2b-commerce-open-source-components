import { LightningElement, api, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import { generateStyleProperties, generateTextFormatStyles, generateThemeTextSizeProperty } from 'experience/styling';
export default class CommonFormattedCurrency extends LightningElement {
  static renderMode = 'light';
  @api
  value;
  @api
  displayAs;
  @api
  get textDisplayInfo() {
    return this._textDisplayInfo;
  }
  set textDisplayInfo(value) {
    if (value) {
      this._parsedDisplayInfo = JSON.parse(value);
    }
    this._textDisplayInfo = value;
  }
  get parsedDisplayInfo() {
    return this._parsedDisplayInfo;
  }
  @api
  get textDecoration() {
    return this._textDecoration;
  }
  set textDecoration(value) {
    if (value) {
      this._parsedTextDecoration = JSON.parse(value);
    }
    this._textDecoration = value;
  }
  @api
  backgroundColor;
  @api
  textAlign;
  @api
  textColor;
  @api
  paddingVertical;
  @api
  paddingHorizontal;
  _parsedDisplayInfo;
  _textDisplayInfo;
  _parsedTextDecoration;
  _textDecoration;
  state = {
    overrideCurrencyCode: undefined,
    marketCurrencyCode: undefined
  };
  _publicCurrencyCode;
  @api
  get currencyCode() {
    return this._publicCurrencyCode;
  }
  set currencyCode(value) {
    this._publicCurrencyCode = value;
    this.state.overrideCurrencyCode = value;
  }
  get computedCurrencyCode() {
    return this.state.overrideCurrencyCode ?? this.state.marketCurrencyCode;
  }
  get customStyles() {
    const DEFAULT_TEXTHEADINGSIZE = 'heading-medium';
    const {
      weight,
      style,
      decoration
    } = generateTextFormatStyles(this._parsedTextDecoration);
    const textStyle = this._parsedDisplayInfo?.textStyle || DEFAULT_TEXTHEADINGSIZE;
    return generateStyleProperties([{
      name: '--com-c-formatted-currency-text-color',
      value: this.textColor ? this.textColor : `var(${generateThemeTextSizeProperty(textStyle)}-color)`
    }, {
      name: '--com-c-formatted-currency-text-align',
      value: this.textAlign ? this.textAlign : `var(${generateThemeTextSizeProperty(textStyle)}-text-align)`
    }, {
      name: '--com-c-formatted-currency-background-color',
      value: this.backgroundColor
    }, {
      name: '--com-c-formatted-currency-font-weight',
      value: weight ? weight : `var(${generateThemeTextSizeProperty(textStyle)}-font-weight)`
    }, {
      name: '--com-c-formatted-currency-font-style',
      value: style ? style : `var(${generateThemeTextSizeProperty(textStyle)}-font-style)`
    }, {
      name: '--com-c-formatted-currency-text-decoration',
      value: decoration ? decoration : `var(${generateThemeTextSizeProperty(textStyle)}-text-decoration)`
    }]);
  }
  @wire(AppContextAdapter)
  getDefaultCurrency({
    data,
    loaded,
    error
  }) {
    if (!this.state.overrideCurrencyCode && loaded && data && !error) {
      this.state = {
        ...this.state,
        marketCurrencyCode: data.defaultCurrency
      };
    }
  }
}