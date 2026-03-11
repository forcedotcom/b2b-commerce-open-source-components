import { LightningElement, api } from 'lwc';
import { isPreviewMode } from 'experience/clientApi';
import { alternativeSpinnerText, errorHeading, errorDescription } from './labels';
import BasePath from '@salesforce/community/basePath';
/**
 * @slot emptyBody
 * @slot purchasedProductsRepeater
 */
export default class ProductListPurchased extends LightningElement {
  static renderMode = 'light';
  static DXP_EVENT_NAME_NEXT_PAGE = 'nextpage';
  @api
  sortMenuLabel;
  _actionProcessing = false;
  _filterRange;
  _purchasedProductCount;
  _error = false;
  _handleAddToCartClicked = evt => this.handleAddToCartClicked(evt);
  _handleAddToCartSuccess = evt => this.handleAddToCartSuccess(evt);
  _handleAddToCartError = evt => this.handleAddToCartError(evt);
  _handleStatus = evt => this.handleStatus(evt);
  _setActionState(processing) {
    this._actionProcessing = processing;
  }
  get showSpinner() {
    return !isPreviewMode && this._actionProcessing;
  }
  get showEmptyState() {
    return isPreviewMode || this._purchasedProductCount === 0 && !this._error;
  }
  get alternativeSpinnerText() {
    return alternativeSpinnerText;
  }
  get svg() {
    return `${BasePath}/assets/images/PurchasedProductEmptyState.svg`;
  }
  get hasError() {
    return !isPreviewMode && this._error;
  }
  get errorHeading() {
    return errorHeading;
  }
  get errorDescription() {
    return errorDescription;
  }
  get warningIconPath() {
    return `${BasePath}/assets/icons/warning-filled.svg#warning-filled`;
  }
  connectedCallback() {
    this?.addEventListener('addtocartclicked', this._handleAddToCartClicked);
    this?.addEventListener('addtocartsuccess', this._handleAddToCartSuccess);
    this?.addEventListener('addtocarterror', this._handleAddToCartError);
    this?.addEventListener('purchasedproductstatus', this._handleStatus);
  }
  disconnectedCallback() {
    this?.removeEventListener('addtocartclicked', this._handleAddToCartClicked);
    this?.removeEventListener('addtocartsuccess', this._handleAddToCartSuccess);
    this?.removeEventListener('addtocarterror', this._handleAddToCartError);
    this?.removeEventListener('purchasedproductstatus', this._handleStatus);
  }
  handleAddToCartClicked(event) {
    event.stopPropagation();
    this._setActionState(true);
  }
  handleAddToCartSuccess(event) {
    event.stopPropagation();
    this._setActionState(false);
  }
  handleAddToCartError(event) {
    event.stopPropagation();
    this._setActionState(false);
  }
  handleStatus(event) {
    event.stopPropagation();
    this._error = event?.detail?.error;
    this._purchasedProductCount = event?.detail?.count;
  }
  handleFilterRangeChange(event) {
    event.stopPropagation();
    this._filterRange = event?.detail?.filterRange;
    const dataProvider = this.querySelector('commerce_data_provider-purchased-products-data-provider');
    if (dataProvider) {
      dataProvider.filterRange = this._filterRange;
    }
    const grid = this.querySelector('commerce_data_provider-purchased-products-data-provider dxp_content_layout-grid');
    grid?.dispatchEvent(new CustomEvent(ProductListPurchased.DXP_EVENT_NAME_NEXT_PAGE, {
      bubbles: true,
      detail: {
        paginationAction: null
      }
    }));
  }
}