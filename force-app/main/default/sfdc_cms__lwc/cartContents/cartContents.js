import { LightningElement, api, wire } from 'lwc';
import { alternativeSpinnerText } from './labels';
import { CartStatusAdapter } from 'commerce/checkoutCartApi';
import { isDesignMode } from 'experience/clientApi';
import { createCartClearAction, createCartSortUpdateAction, createCartStatusUpdateAction, dispatchAction } from 'commerce/actionApi';
const sortOptionLocator = 'lightning-combobox.sort-menu';
export default class CartContents extends LightningElement {
  static renderMode = 'light';
  sortOrder;
  labels = {
    alternativeSpinnerText
  };
  @api
  displayStates;
  @api
  items;
  @api
  showSortOptions = false;
  @api
  messages;
  _errors;
  @api
  get errors() {
    return this._errors;
  }
  set errors(value) {
    this._errors = value;
  }
  @api
  get parsedErrors() {
    if (Array.isArray(this._errors)) {
      return this._errors;
    }
    if (typeof this._errors === 'string') {
      try {
        return JSON.parse(this._errors);
      } catch {
        return [];
      }
    }
    return [];
  }
  @wire(CartStatusAdapter)
  cartStatus;
  @api
  get isCartProcessing() {
    if (isDesignMode) {
      return false;
    }
    const hasError = this.parsedErrors && this.parsedErrors.length > 0;
    return !!this.cartStatus?.data?.isProcessing || !!this.cartStatus?.loading || !this.items && !hasError;
  }
  get forceEmptyState() {
    return !!this.displayStates?.includes('empty');
  }
  get forceItemsState() {
    return !!this.displayStates?.includes('items');
  }
  get showEmptyState() {
    return this.forceEmptyState || Array.isArray(this.items) && !this.items.length;
  }
  get showItemState() {
    return this.forceItemsState || !!this.items?.length;
  }
  get showSpinner() {
    return this.isCartProcessing && !this.forceEmptyState && !this.forceItemsState;
  }
  get message() {
    return this.messages && this.messages.length > 0 ? this.messages[0] : undefined;
  }
  handleCartClear() {
    dispatchAction(this, createCartClearAction());
  }
  sortChanged = false;
  handleCartChangeSortOrder(event) {
    this.sortChanged = true;
    this.sortOrder = event.detail;
    dispatchAction(this, createCartSortUpdateAction(this.sortOrder));
  }
  handleCartUpdateStatus(event) {
    dispatchAction(this, createCartStatusUpdateAction(event.detail));
  }
  renderedCallback() {
    if (this.showSortOptions) {
      const sortOptionElement = this.querySelector(sortOptionLocator);
      if (this.sortChanged && sortOptionElement) {
        sortOptionElement?.focus();
        this.sortChanged = false;
      }
    }
  }
}