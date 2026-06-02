import { LightningElement, api } from 'lwc';
import { LABELS } from './labels';
import { DEFAULT_CART_ITEMS_PAGE_SIZE } from 'commerce/checkoutCartApi';
export const GO_TO_PAGE = 'splitshipgotopage';
export default class CartSplitshipmentItemsUi extends LightningElement {
  static renderMode = 'light';
  digitalGoodsScopedNotification = LABELS.digitalGoodsScopedNotificationLabel;
  @api
  currencyIsoCode;
  @api
  deliveryGroups;
  @api
  products;
  @api
  splitShipPagination;
  @api
  showSku = false;
  @api
  skuLabel;
  @api
  rawInternationalizationData;
  @api
  showProductImage = false;
  @api
  showProductVariants = false;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  @api
  deliveryGroupCartProps;
  get hasDigitalProducts() {
    return !!this.deliveryGroupCartProps?.hasDigitalProducts;
  }
  handleGotoPageEvent(event) {
    event.stopPropagation();
    const pageNumber = event.detail.pageNumber;
    this.dispatchEvent(new CustomEvent(GO_TO_PAGE, {
      composed: true,
      bubbles: true,
      detail: {
        pageNumber: pageNumber,
        pageSize: this.pageSize
      }
    }));
  }
  handlePreviousPageEvent(event) {
    event.stopPropagation();
    if (this.currentPageNumber) {
      const previousPageNumber = this.currentPageNumber - 1;
      this.dispatchEvent(new CustomEvent(GO_TO_PAGE, {
        composed: true,
        bubbles: true,
        detail: {
          pageNumber: previousPageNumber,
          pageSize: this.pageSize
        }
      }));
    }
  }
  handleNextPageEvent(event) {
    event.stopPropagation();
    if (this.currentPageNumber) {
      const nextPageNumber = this.currentPageNumber + 1;
      this.dispatchEvent(new CustomEvent(GO_TO_PAGE, {
        composed: true,
        bubbles: true,
        detail: {
          pageNumber: nextPageNumber,
          pageSize: this.pageSize
        }
      }));
    }
  }
  pagesDisplayed = 7;
  get pageSize() {
    return this.splitShipPagination?.pageSize ? this.splitShipPagination.pageSize : DEFAULT_CART_ITEMS_PAGE_SIZE;
  }
  get totalItemCount() {
    return this.splitShipPagination?.totalItemCount ? this.splitShipPagination?.totalItemCount : 0;
  }
  get showEmptySplitShipmentModal() {
    let _totalItemCount = 0;
    this.products?.forEach(product => {
      if (product.cartItems) {
        _totalItemCount += product.cartItems.length;
      }
    });
    return _totalItemCount === 1;
  }
  get currentPageNumber() {
    return this.splitShipPagination?.currentPage ? this.splitShipPagination?.currentPage : 1;
  }
}