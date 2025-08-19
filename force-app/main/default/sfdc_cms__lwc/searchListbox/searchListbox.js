import { LightningElement, api } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
export default class SearchListbox extends LightningElement {
  static renderMode = 'light';
  @api
  items;
  @api
  get listBoxId() {
    return this._listBoxId;
  }
  set listBoxId(value) {
    this._listBoxId = value;
    this.syncA11y();
  }
  @api
  customStyles;
  _listBoxId = '';
  get listBoxItemStyles() {
    const itemStyles = [{
      name: 'border-bottom-color',
      value: this.customStyles?.['listbox-divider-color']
    }];
    return generateStyleProperties(itemStyles);
  }
  get listBoxContainerStyles() {
    const containerStyles = [{
      name: 'border-bottom-left-radius',
      value: this.customStyles?.['border-radius']
    }, {
      name: 'border-bottom-right-radius',
      value: this.customStyles?.['border-radius']
    }, {
      name: 'border-color',
      value: this.customStyles?.['border-color']
    }];
    return generateStyleProperties(containerStyles);
  }
  renderedCallback() {
    this.syncA11y();
  }
  handleOptionSelection = event => {
    event.stopPropagation();
    const id = event.detail.id;
    let position = this.items?.findIndex(item => {
      return item.id === id;
    });
    const {
      value,
      category
    } = this.items[position];
    position += 1;
    this.dispatchEvent(new CustomEvent('searchoptionselection', {
      bubbles: true,
      cancelable: true,
      detail: {
        value,
        position,
        category
      }
    }));
  };
  syncA11y() {
    const ulEl = this.querySelector('ul');
    if (ulEl && this._listBoxId) {
      ulEl.setAttribute('id', this._listBoxId);
    }
    const liEls = Array.from(this.querySelectorAll('li'));
    liEls.forEach(el => {
      el.setAttribute('id', el.dataset.id);
    });
  }
}