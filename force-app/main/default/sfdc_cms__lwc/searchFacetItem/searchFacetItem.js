import { LightningElement, api } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import { FacetUiTypeEnum, FACETVALUE_TOGGLE_EVT } from './constants';
export default class SearchFacetItem extends LightningElement {
  static renderMode = 'light';
  @api
  value;
  @api
  type = FacetUiTypeEnum.CHECKBOX;
  @api
  focusOnInit = false;
  @api
  showFacetCounts;
  get displayLabel() {
    const shouldIncludeCount = this.showFacetCounts && this.value?.name && this.value?.productCount !== undefined;
    return shouldIncludeCount ? `${this.value?.name} (${this.value?.productCount})` : this.value?.name;
  }
  get hasColorSwatch() {
    return Boolean(this.value?.displayMetadata?.swatch?.color);
  }
  get colorSwatchStyles() {
    return generateStyleProperties({
      'background-color': this.value?.displayMetadata?.swatch?.color
    });
  }
  hasRenderedAtLeastOnce = false;
  hasInitiallyFocused = false;
  renderedCallback() {
    const lightningInputElement = this.refs?.lightningInput;
    if (!this.hasRenderedAtLeastOnce && !this.hasInitiallyFocused && this.focusOnInit) {
      lightningInputElement?.focus();
      this.hasInitiallyFocused = true;
    }
    if (this.type === FacetUiTypeEnum.CHECKBOX) {
      lightningInputElement.setAttribute('disabled', this.value?.productCount === 0 ? 'true' : 'false');
    }
    this.hasRenderedAtLeastOnce = true;
  }
  disconnectedCallback() {
    this.hasInitiallyFocused = false;
    this.hasRenderedAtLeastOnce = false;
  }
  handleKeyPress(event) {
    if (event.code === 'Space') {
      this.handleFacetValueToggle(event);
    }
  }
  handleFacetValueToggle(event) {
    const element = event.target;
    this.dispatchEvent(new CustomEvent(FACETVALUE_TOGGLE_EVT, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        id: element.dataset.id,
        checked: element.checked
      }
    }));
  }
}