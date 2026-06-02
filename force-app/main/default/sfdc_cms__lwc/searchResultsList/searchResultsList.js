import { LightningElement, api, wire } from 'lwc';
import { createSearchFiltersUpdateAction, dispatchAction, createLoadMoreAction, createLoadPreviousAction } from 'commerce/actionApi';
import { tranformCollection, generateClassForSpacing } from './utils';
import labels from './labels';
import { CurrentPageReference } from 'lightning/navigation';
const FILTER_CHANGED = 'filterchanged';
const MORE_PAGES_AVAILABLE = 'morepagesavailable';

/**
 * @slot sfdcRepeaterItem
 */
export default class SearchResultsList extends LightningElement {
  static renderMode = 'light';
  _currentPage = '1';
  _currentPageNumber = 1;
  _hasNextPage;
  _previousPageNumber = 0;
  @api
  loadMoreLabel;
  @api
  loadPreviousLabel;
  @api
  searchResultsLoading;
  @api
  pageSize;
  @api
  total;
  @api
  resultNavigationType;
  @api
  listRowSpacing;
  @api
  searchResults;
  _onFilterChanged = () => {
    this._hasNextPage = undefined;
    this._previousPageNumber = 0;
  };
  _onMorePagesAvailable = event => {
    this._hasNextPage = event?.detail?.hasNextPage;
  };
  connectedCallback() {
    this._previousPageNumber = this.urlPageValue - 1;
    if (!import.meta.env.SSR) {
      window.addEventListener(FILTER_CHANGED, this._onFilterChanged);
      window.addEventListener(MORE_PAGES_AVAILABLE, this._onMorePagesAvailable);
    }
  }
  disconnectedCallback() {
    if (!import.meta.env.SSR) {
      window.removeEventListener(FILTER_CHANGED, this._onFilterChanged);
      window.removeEventListener(MORE_PAGES_AVAILABLE, this._onMorePagesAvailable);
    }
  }
  @wire(CurrentPageReference)
  wirePageReference(ref) {
    if (ref?.type) {
      const pageNum = parseInt(ref.state?.page || '', 10);
      this._previousPageNumber = (Number.isNaN(pageNum) ? 1 : pageNum) - 1;
    }
  }
  get resolvedResultNavigationType() {
    return this.resultNavigationType ?? 'pagination';
  }
  get collection() {
    return tranformCollection(this.searchResults?.cardCollection);
  }
  get layoutDataAttribute() {
    return 'list';
  }
  get containerClass() {
    return 'product-list-container';
  }
  get itemClass() {
    return 'list-item slds-border_bottom';
  }
  get loadingLabel() {
    return labels.loading;
  }
  get layoutSpacingClasses() {
    return generateClassForSpacing(this.listRowSpacing ?? 'small', 'vertical');
  }
  get layoutCustomStyles() {
    return '';
  }
  @api
  set currentPage(newCurrentPage) {
    this._currentPage = newCurrentPage;
    const parsed = parseInt(newCurrentPage, 10);
    if (!Number.isNaN(parsed)) {
      this._currentPageNumber = parsed;
    }
  }
  get currentPage() {
    return this._currentPage;
  }
  get totalItemCount() {
    return this.total ?? 0;
  }
  get resultsPageSize() {
    return this.pageSize ?? 20;
  }
  get isLoadMoreMode() {
    return this.resolvedResultNavigationType === 'loadMore';
  }
  get showPagingControl() {
    return this.totalItemCount > this.resultsPageSize && !this.isLoadMoreMode;
  }
  get showLoadMore() {
    if (this._hasNextPage !== undefined) {
      return this.isLoadMoreMode && this._hasNextPage;
    }
    const totalPages = this.pageSize ? Math.ceil(this.totalItemCount / this.pageSize) : 0;
    return this.isLoadMoreMode && totalPages >= this.urlPageValue + 1;
  }
  get previousPageNumber() {
    return this._previousPageNumber;
  }
  get showLoadPrevious() {
    return this.isLoadMoreMode && this.previousPageNumber > 0;
  }
  get urlPageValue() {
    if (import.meta.env.SSR) {
      return 1;
    }
    const val = new URLSearchParams(globalThis.location?.search).get('page');
    return val && !isNaN(Number(val)) ? Number(val) : 1;
  }
  navigateToPage(event, pageNumber) {
    event.stopPropagation();
    this._currentPage = String(pageNumber);
    this._currentPageNumber = pageNumber;
    dispatchAction(this, createSearchFiltersUpdateAction({
      page: pageNumber
    }));
  }
  handlePreviousPageEvent(event) {
    this.navigateToPage(event, this._currentPageNumber - 1);
  }
  handleNextPageEvent(event) {
    this.navigateToPage(event, this._currentPageNumber + 1);
  }
  handleGotoPageEvent(event) {
    this.navigateToPage(event, event.detail.pageNumber);
  }
  handleLoadMore(event) {
    event.stopPropagation();
    dispatchAction(this, createLoadMoreAction(this.urlPageValue + 1));
  }
  handleLoadPrevious(event) {
    event.stopPropagation();
    dispatchAction(this, createLoadPreviousAction(this.previousPageNumber));
    this._previousPageNumber--;
  }
}