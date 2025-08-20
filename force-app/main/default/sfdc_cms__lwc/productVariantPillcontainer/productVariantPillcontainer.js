import { LightningElement, api } from 'lwc';
import { Labels } from './labels';
export default class ProductVariantPillcontainer extends LightningElement {
  static renderMode = 'light';
  _attributeOptions = [];
  _disableScrollToSelectedItem = false;
  @api
  get options() {
    return this._attributeOptions;
  }
  set options(value) {
    this._attributeOptions = value;
  }
  @api
  attributeName = null;
  @api
  attributeApiName = null;
  @api
  enableMobileHorizontalScrolling = false;
  @api
  assistiveOutOfStockText;
  get label() {
    const selected = this.options.find(option => option.selected === true);
    return selected ? selected.label : null;
  }
  get keyValueSeparator() {
    return Labels.keyValueSeparator;
  }
  handlePillClick(event) {
    event.stopPropagation();
    this.dispatchChangeEvent(event.detail);
  }
  dispatchChangeEvent(selectedValue) {
    this.dispatchEvent(new CustomEvent('variantattributeoptionchanged', {
      detail: {
        attributeApiName: this.attributeApiName,
        value: selectedValue
      }
    }));
  }
  scrollToTheSelectedItem() {
    if (!this.enableMobileHorizontalScrolling || !this.options.some(option => option.selected) || this._disableScrollToSelectedItem) {
      return;
    }
    const pillElements = Array.from(this.querySelectorAll('site-product-variant-pill'));
    const selectedPill = pillElements.find(pill => pill.selected);
    if (selectedPill) {
      requestAnimationFrame(() => {
        selectedPill.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      });
      this._disableScrollToSelectedItem = true;
    }
  }
  renderedCallback() {
    this.scrollToTheSelectedItem();
  }
}