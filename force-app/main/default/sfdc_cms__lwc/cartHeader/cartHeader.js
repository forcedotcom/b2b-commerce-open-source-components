import { LightningElement, api } from 'lwc';
import { sortByLabelText, confirmClearCart } from './labels';
import { SORT_OPTIONS, CHANGE_SORT_ORDER_EVENT, CLEAR_CART_EVENT } from './constants';
import { defaultSortOrder } from 'site/commonConfig';
import ClearCartModal from 'site/cartClearCartModal';
export { CHANGE_SORT_ORDER_EVENT } from './constants';
export default class CartHeader extends LightningElement {
  static renderMode = 'light';
  @api
  showSortOptions = false;
  get sortingOptions() {
    return SORT_OPTIONS;
  }
  get sortByLabel() {
    return sortByLabelText;
  }
  @api
  sortOrder;
  get _sortOrder() {
    return SORT_OPTIONS.find(option => option.value === (this.sortOrder ?? defaultSortOrder));
  }
  handleChangeSortSelection(event) {
    this.dispatchEvent(new CustomEvent(CHANGE_SORT_ORDER_EVENT, {
      detail: event.detail.value,
      composed: true,
      bubbles: true
    }));
  }
  get cartHeaderLabelClasses() {
    return this.showSortOptions ? 'header-labels' : 'header-labels header-without-sort';
  }
  get confirmClearCartButtonText() {
    return confirmClearCart;
  }
  handleModalClearCartButton() {
    this.dispatchEvent(new CustomEvent(CLEAR_CART_EVENT, {
      composed: true,
      bubbles: true
    }));
  }
  async handleClearCartButton() {
    await ClearCartModal.open({
      size: 'small',
      onsubmit: e => {
        this.handleModalClearCartButton();
        e?.detail?.close();
      }
    });
  }
}