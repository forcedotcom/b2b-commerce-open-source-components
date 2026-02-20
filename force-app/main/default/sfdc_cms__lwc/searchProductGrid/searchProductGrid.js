import { api, LightningElement } from 'lwc';
import { EVENT, KEY_CODE } from './constants';
import { i18n } from './labels';
function generateClassForSpacing(spacing, direction) {
  return ['none', 'small', 'medium', 'large'].includes(spacing) ? `slds-m-${direction}_${spacing}` : '';
}
export default class SearchProductGrid extends LightningElement {
  static renderMode = 'light';
  @api
  configuration;
  @api
  displayData;
  get normalizedDisplayData() {
    return this.displayData ?? [];
  }
  get layoutSpacingClasses() {
    const list = this?.querySelector('ul');
    const spacingRow = list && getComputedStyle(list).getPropertyValue('--com-c-product-grid-spacing-row');
    const spacingCol = list && getComputedStyle(list).getPropertyValue('--com-c-product-grid-spacing-column');
    const row = generateClassForSpacing(spacingRow || '', 'vertical');
    const col = generateClassForSpacing(spacingCol || '', 'horizontal');
    return `${row} ${col}`.trim();
  }
  get layoutContainerClass() {
    return this.isGridLayout ? 'product-grid-container' : '';
  }
  get isGridLayout() {
    return this.configuration?.layout === 'grid';
  }
  get ariaLabelForSearchResults() {
    return i18n.searchResults;
  }
  get cardConfiguration() {
    return this.configuration?.cardConfiguration;
  }
  handleAddToCart(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent(EVENT.ADD_PRODUCT_TO_CART_EVT, {
      detail: event.detail
    }));
  }
  handleNavigateToProductPage(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
      detail: event.detail
    }));
  }
  handleKeyDown(event) {
    const {
      code
    } = event;
    if (event.target instanceof HTMLElement) {
      const id = event.target.dataset.id;
      const index = this.normalizedDisplayData.findIndex(product => product.id === id);
      const callToActionButtonEnabled = this.configuration?.cardConfiguration.showCallToActionButton;
      switch (code) {
        case KEY_CODE.ARROW_DOWN:
          if (!callToActionButtonEnabled) {
            event.preventDefault();
            this.focusListItem(index, +1);
          }
          break;
        case KEY_CODE.ARROW_UP:
          if (!callToActionButtonEnabled) {
            event.preventDefault();
            this.focusListItem(index, -1);
          }
          break;
        case KEY_CODE.HOME:
          event.preventDefault();
          this.focusListItem(0, 0);
          break;
        case KEY_CODE.END:
          event.preventDefault();
          this.focusListItem(0, -1);
          break;
        default:
          break;
      }
    }
  }
  focusListItem(baseIndex, steps) {
    const itemCount = this.normalizedDisplayData.length;
    let newActiveIndex = (baseIndex + steps) % itemCount;
    if (newActiveIndex < 0) {
      newActiveIndex = itemCount - 1;
    }
    Array.from(this.querySelectorAll('site-search-product-card')).at(newActiveIndex)?.focus();
  }
}