import { LightningElement } from 'lwc';
import { isPreviewMode } from 'experience/clientApi';
import { errorHeading, errorDescription } from './labels';
import basePath from '@salesforce/community/basePath';
/**
 * @slot dateFilter
 * @slot emptyBody
 * @slot quoteListRepeater
 */
export default class QuoteList extends LightningElement {
  static renderMode = 'light';
  static DXP_EVENT_NAME_NEXT_PAGE = 'nextpage';
  static DXP_EVENT_NAME_PREVIOUS_PAGE = 'previouspage';
  _quotesCount;
  _error = false;
  _filterRange;
  _handleStatus = evt => this.handleStatus(evt);
  _handleDateFilterChange = evt => this.handleDateFilterChange(evt);
  _handleLoadingQuotes = evt => this.handleLoadingQuotes(evt);
  _handleFilterInit = evt => this.handleFilterInit(evt);
  _isLoadingQuotes = false;
  _isInitialFilter = false;
  _initialFilterEvent;
  get showEmptyState() {
    return isPreviewMode || this._quotesCount === 0 && !this._error;
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
    return !isPreviewMode && this._isLoadingQuotes;
  }
  get warningIconPath() {
    return `${basePath}/assets/icons/warning-filled.svg#warning-filled`;
  }
  connectedCallback() {
    this.addEventListener('quoteliststatus', this._handleStatus);
    this.addEventListener('filterbydate', this._handleDateFilterChange);
    this.addEventListener('loadingquotes', this._handleLoadingQuotes);
    this.addEventListener('initfilter', this._handleFilterInit);
  }
  disconnectedCallback() {
    this.removeEventListener('quoteliststatus', this._handleStatus);
    this.removeEventListener('filterbydate', this._handleDateFilterChange);
    this.removeEventListener('loadingquotes', this._handleLoadingQuotes);
    this.removeEventListener('initfilter', this._handleFilterInit);
  }
  handleStatus(event) {
    event.stopPropagation();
    this._quotesCount = event?.detail?.count;
    this._error = event?.detail?.error;
  }
  handleLoadingQuotes(event) {
    event.stopPropagation();
    this._isLoadingQuotes = event?.detail?.loading;
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
    const dataProvider = this.querySelector('commerce_data_provider-quote-summary-list-data-provider');
    if (dataProvider) {
      dataProvider.filterRange = this._filterRange;
    }
    const grid = this.querySelector('commerce_data_provider-quote-summary-list-data-provider dxp_content_layout-list');
    grid?.dispatchEvent(new CustomEvent(QuoteList.DXP_EVENT_NAME_NEXT_PAGE, {
      bubbles: true,
      detail: {
        paginationAction: null
      }
    }));
    grid?.dispatchEvent(new CustomEvent(QuoteList.DXP_EVENT_NAME_PREVIOUS_PAGE, {
      bubbles: true,
      detail: {
        paginationAction: null
      }
    }));
  }
}