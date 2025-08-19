import { LightningElement, api } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
export default class SearchListBoxOption extends LightningElement {
  static renderMode = 'light';
  @api
  get item() {
    return this._item;
  }
  set item(value) {
    this._item = value;
    this.setType();
  }
  @api
  customStyles;
  _isOptionInline = false;
  isHovered = false;
  _item = {};
  handleMouseEnter() {
    this.isHovered = true;
  }
  handleMouseLeave() {
    this.isHovered = false;
  }
  get optionStyles() {
    const isHovering = this.isHovered || this.item.highlight;
    const listboxStyles = [{
      name: 'background-color',
      value: isHovering ? this.customStyles?.['listbox-background-hover-color'] : this.customStyles?.['listbox-background-color']
    }];
    return generateStyleProperties(listboxStyles);
  }
  handleClick() {
    this.dispatchEvent(new CustomEvent('select', {
      bubbles: true,
      cancelable: true,
      detail: {
        id: this.item.id
      }
    }));
  }
  setType() {
    this._isOptionInline = this._item.type === 'option-inline';
  }
}