import { api, LightningElement } from 'lwc';
import { Labels } from './labels';
export default class ProductVariantSwatchcontainer extends LightningElement {
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
  hideTitle = false;
  @api
  attributeName = null;
  @api
  attributeApiName = null;
  @api
  enableMobileHorizontalScrolling = false;
  @api
  assistiveOutOfStockText;
  get keyValueSeparator() {
    return Labels.keyValueSeparator;
  }
  get label() {
    const selected = this.options.find(option => option.selected === true);
    return selected ? selected.label : null;
  }
  handleSwatchClick(event) {
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
    const swatchElements = Array.from(this.querySelectorAll('site-product-variant-swatchitem'));
    const selectedSwatch = swatchElements.find(swatch => swatch.selected);
    if (selectedSwatch) {
      requestAnimationFrame(() => {
        selectedSwatch.scrollIntoView({
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