import { LightningElement, api } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
function sanitizeValue(richTextValue) {
  if (!richTextValue) {
    return '';
  }
  return richTextValue.replace(/<[^>]*>/g, '');
}
export default class SearchListBoxOptionInline extends LightningElement {
  static renderMode = 'light';
  @api
  get item() {
    return this._item;
  }
  set item(data) {
    this._item = data;
  }
  @api
  customStyles;
  _item = {};
  @api
  isHovered = false;
  get _displayText() {
    const isHovering = this.isHovered || false;
    const textStyles = [{
      name: 'color',
      value: isHovering ? this.customStyles?.['listbox-text-hover-color'] : this.customStyles?.['listbox-text-color']
    }];
    const styleString = generateStyleProperties(textStyles);
    return `<span style="${styleString};">${this._item.text}</span>`;
  }
  get _tooltipText() {
    return sanitizeValue(this._item.title);
  }
}