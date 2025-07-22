import { LightningElement, api } from 'lwc';
import generateText from './textGenerator';
import labels from './labels';
export default class ProductVariantAttributesDisplay extends LightningElement {
  static renderMode = 'light';
  @api
  attributes;
  @api
  format;
  @api
  dotSeparator = false;
  @api
  mobileStack = false;
  get labels() {
    return labels;
  }
  get _hasAttributes() {
    return Array.isArray(this.attributes) && this.attributes.length > 0;
  }
  get _displayAttributes() {
    let result = [];
    if (this.attributes) {
      result = this.attributes.map((attribute, index) => ({
        id: index,
        set: generateText(attribute.name, attribute.value)
      }));
    }
    return result;
  }
  get showNewLineFormat() {
    return Boolean(this.format === 'newline');
  }
  get commaSeparator() {
    return !this.dotSeparator;
  }
  get variantListClasses() {
    const classes = `${this.dotSeparator ? 'dot-separator' : ''} ${this.mobileStack ? 'mobile-stack' : ''}`.trim();
    return classes ? classes : undefined;
  }
}