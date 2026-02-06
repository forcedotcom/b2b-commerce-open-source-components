import { LightningElement } from 'lwc';
import { isPreviewMode } from 'experience/clientApi';
import { errorHeading, errorDescription } from './labels';
import BasePath from '@salesforce/community/basePath';

/**
 * @slot dateFilter
 * @slot emptyBody
 * @slot orderListRepeater
 */
export default class OrderList extends LightningElement {
  static renderMode = 'light';
  static DXP_EVENT_NAME_NEXT_PAGE = 'nextpage';
  static DXP_EVENT_NAME_PREVIOUS_PAGE = 'previouspage';
  _ordersCount;
  _error = false;
  _filterRange;
  _handleStatus = evt => this.handleStatus(evt);
  _handleDateFilterChange = evt => this.handleDateFilterChange(evt);
  _handleLoadingOrders = evt => this.handleLoadingOrders(evt);
  _handleFilterInit = evt => this.handleFilterInit(evt);
  _isLoadingOrders = false;
  _isInitialFilter = false;
  _initialFilterEvent;
  get showEmptyState() {
    return isPreviewMode || this._ordersCount === 0 && !this._error;
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
  get showSpinner() {
    return !isPreviewMode && this._isLoadingOrders;
  }
  get warningIconPath() {
    return `${BasePath}/assets/icons/warning-filled.svg#warning-filled`;
  }
  connectedCallback() {
    this.addEventListener('orderliststatus', this._handleStatus);
    this.addEventListener('filterbydate', this._handleDateFilterChange);
    this.addEventListener('loadingorders', this._handleLoadingOrders);
    this.addEventListener('initfilter', this._handleFilterInit);
  }
  disconnectedCallback() {
    this.removeEventListener('orderliststatus', this._handleStatus);
    this.removeEventListener('filterbydate', this._handleDateFilterChange);
    this.removeEventListener('loadingorders', this._handleLoadingOrders);
    this.removeEventListener('initfilter', this._handleFilterInit);
  }
  renderedCallback() {
    if (this._isInitialFilter && this._initialFilterEvent) {
      this._isInitialFilter = false;
      this.handleDateFilterChange(this._initialFilterEvent);
    }
  }
  handleStatus(event) {
    event.stopPropagation();
    this._ordersCount = event?.detail?.count;
    this._error = event?.detail?.error;
  }
  handleLoadingOrders(event) {
    event.stopPropagation();
    this._isLoadingOrders = event?.detail?.loading;
  }
  handleFilterInit(event) {
    event.stopPropagation();
    this._isInitialFilter = true;
    this._initialFilterEvent = event;
    this.removeEventListener('initfilter', this._handleFilterInit);
  }
  handleDateFilterChange(event) {
    event.stopPropagation();
    this._filterRange = event?.detail?.dateFilterOption;
    const dataProvider = this.querySelector('commerce_data_provider-order-list-data-provider');
    if (dataProvider) {
      dataProvider.filterRange = this._filterRange;
    }
    const grid = this.querySelector('commerce_data_provider-order-list-data-provider dxp_content_layout-list');
    grid?.dispatchEvent(new CustomEvent(OrderList.DXP_EVENT_NAME_NEXT_PAGE, {
      bubbles: true,
      detail: {
        paginationAction: null
      }
    }));
    grid?.dispatchEvent(new CustomEvent(OrderList.DXP_EVENT_NAME_PREVIOUS_PAGE, {
      bubbles: true,
      detail: {
        paginationAction: null
      }
    }));
  }
}