import { LightningElement, api } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
export default class CommonButton extends LightningElement {
  static renderMode = 'light';
  @api
  text;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  buttonTextColor;
  @api
  buttonTextHoverColor;
  @api
  buttonBackgroundColor;
  @api
  buttonBackgroundHoverColor;
  @api
  buttonBorderColor;
  @api
  buttonBorderRadius;
  @api
  disabled = false;
  get buttonStyleValue() {
    return generateStyleProperties([{
      name: '--com-c-button-color',
      value: this.buttonTextColor
    }, {
      name: '--com-c-button-color-hover',
      value: this.buttonTextHoverColor
    }, {
      name: '--com-c-button-color-background',
      value: this.buttonBackgroundColor
    }, {
      name: '--com-c-button-color-background-hover',
      value: this.buttonBackgroundHoverColor
    }, {
      name: '--com-c-button-radius-border',
      value: this.buttonBorderRadius,
      suffix: 'px'
    }, {
      name: '--com-c-button-color-border',
      value: this.buttonBorderColor
    }]);
  }
  get content() {
    return this.text ?? '';
  }
}