import { LightningElement, api, wire } from 'lwc';
import { createSearchFiltersUpdateAction, dispatchAction, createLoadMoreAction, createLoadPreviousAction } from 'commerce/actionApi';
import { tranformCollection, generateClassForSpacing, generateNumberForGridLayout } from './searchResultsGridUtil';
import { generateStyleProperties } from 'experience/styling';
import labels from './labels';
import { CurrentPageReference } from 'lightning/navigation';
const FILTER_CHANGED = 'filterchanged';
const MORE_PAGES_AVAILABLE = 'morepagesavailable';
export default class SearchResultsGrid extends LightningElement {
  static renderMode = 'light';
  _currentPage = '1';
  _currentPageNumber = 1;
  _hasNextPage;
  _previousPageNumber = 0;
  _showProductImage = true;
  _showCallToActionButton = true;
  _resetPreviousPageNumber = this.resetPreviousPageNumber.bind(this);
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
  get showProductImage() {
    return this._showProductImage;
  }
  set showProductImage(value) {
    this._showProductImage = value;
  }
  @api
  priceType = 'displayAllPrices';
  @api
  get showCallToActionButton() {
    return this._showCallToActionButton;
  }
  set showCallToActionButton(value) {
    this._showCallToActionButton = value;
  }
  @api
  addToCartButtonText = 'Add to cart';
  @api
  addToCartButtonStyle = 'primary';
  @api
  viewOptionsButtonText = 'View options';
  @api
  cardContentMapping;
  connectedCallback() {
    this._previousPageNumber = this.getPageValue() - 1;
    if (!import.meta.env.SSR) {
      window.addEventListener(FILTER_CHANGED, this._resetPreviousPageNumber);
      window.addEventListener(MORE_PAGES_AVAILABLE, this.handleMorePagesAvailable);
    }
  }
  disconnectedCallback() {
    if (!import.meta.env.SSR) {
      window.removeEventListener(FILTER_CHANGED, this._resetPreviousPageNumber);
      window.removeEventListener(MORE_PAGES_AVAILABLE, this.handleMorePagesAvailable);
    }
  }
  @wire(CurrentPageReference)
  wirePageReference(currentPageReference) {
    if (currentPageReference?.type) {
      let currentPageNum = parseInt(currentPageReference.state?.page || '', 10);
      if (Number.isNaN(currentPageNum)) {
        currentPageNum = 1;
      }
      this._previousPageNumber = currentPageNum - 1;
    }
  }
  set hasNextPage(val) {
    this._hasNextPage = val;
  }
  get hasNextPage() {
    return this._hasNextPage;
  }
  handleMorePagesAvailable = event => {
    const detail = event?.detail;
    this.hasNextPage = detail?.hasNextPage;
  };
  resetPreviousPageNumber() {
    this.hasNextPage = undefined;
    this._previousPageNumber = 0;
  }
  get resolvedResultNavigationType() {
    return this.resultNavigationType ?? 'pagination';
  }
  @api
  searchResults;
  get collection() {
    return tranformCollection(this.searchResults?.cardCollection);
  }
  @api
  gridColumnSpacing;
  @api
  gridRowSpacing;
  @api
  numberOfColumns;
  @api
  numberOfColumnsOnMobile;
  get loadingLabel() {
    return labels.loading;
  }
  get layoutSpacingClasses() {
    const row = generateClassForSpacing(this.gridRowSpacing ?? 'small', 'vertical');
    const col = generateClassForSpacing(this.gridColumnSpacing ?? 'small', 'horizontal');
    return `${row} ${col}`.trim();
  }
  get layoutCustomStyles() {
    const numberOfCardsInRow = generateNumberForGridLayout(this.numberOfColumns ?? 'default');
    return generateStyleProperties({
      '--com-c-grid-columns-mobile': this.numberOfColumnsOnMobile || 2,
      '--com-c-grid-columns-tablet': numberOfCardsInRow !== 2 ? numberOfCardsInRow - 1 : numberOfCardsInRow,
      '--com-c-grid-columns-desktop': numberOfCardsInRow,
      '--com-c-grid-columns-largeDesktop': numberOfCardsInRow + 1,
      '--com-c-grid-columns-xlargeDesktop': numberOfCardsInRow + 2,
      '--com-c-grid-columns-xxlargeDesktop': numberOfCardsInRow + 3
    });
  }
  @api
  set currentPage(newCurrentPage) {
    this.updatePageAndPageNumber(newCurrentPage);
  }
  get currentPage() {
    return this._currentPage;
  }
  updatePageAndPageNumber(newCurrentPage) {
    this._currentPage = newCurrentPage;
    const newPageAsNumber = parseInt(newCurrentPage, 10);
    if (!Number.isNaN(newPageAsNumber)) {
      this._currentPageNumber = newPageAsNumber;
    }
  }
  updatePreviousPageNumber() {
    this._previousPageNumber--;
  }
  get totalItemCount() {
    return this.total ?? 0;
  }
  get resultsPageSize() {
    return this.pageSize ?? 20;
  }
  get showPagingControl() {
    return this.totalItemCount > this.resultsPageSize && this.resolvedResultNavigationType !== 'loadMore';
  }
  get showLoadMore() {
    if (this.hasNextPage !== undefined) {
      return this.resolvedResultNavigationType === 'loadMore' && this.hasNextPage;
    }
    let totalPageNumber = 0;
    if (this.pageSize) {
      totalPageNumber = Math.ceil(this.totalItemCount / this.pageSize);
    }
    return this.resolvedResultNavigationType === 'loadMore' && totalPageNumber >= this.getPageValue() + 1;
  }
  get previousPageNumber() {
    return this._previousPageNumber;
  }
  get showLoadPrevious() {
    return this.resolvedResultNavigationType === 'loadMore' && this.previousPageNumber > 0;
  }
  getPageValue() {
    let params;
    if (typeof window !== 'undefined') {
      params = new URLSearchParams(window.location.search);
    }
    const pageValue = params?.get('page');
    return pageValue && !isNaN(Number(pageValue)) ? Number(pageValue) : 1;
  }
  handlePreviousPageEvent(event) {
    event.stopPropagation();
    const previousPageNumber = this._currentPageNumber - 1;
    this.updatePageAndPageNumber(String(previousPageNumber));
    dispatchAction(this, createSearchFiltersUpdateAction({
      page: previousPageNumber
    }));
  }
  handleNextPageEvent(event) {
    event.stopPropagation();
    const nextPageNumber = this._currentPageNumber + 1;
    this.updatePageAndPageNumber(String(nextPageNumber));
    dispatchAction(this, createSearchFiltersUpdateAction({
      page: nextPageNumber
    }));
  }
  handleGotoPageEvent(event) {
    event.stopPropagation();
    const pageNumber = event.detail.pageNumber;
    this.updatePageAndPageNumber(String(pageNumber));
    dispatchAction(this, createSearchFiltersUpdateAction({
      page: pageNumber
    }));
  }
  handleLoadMore(event) {
    event.stopPropagation();
    const nextPage = this.getPageValue() + 1;
    dispatchAction(this, createLoadMoreAction(nextPage));
  }
  handleLoadPrevious(event) {
    event.stopPropagation();
    dispatchAction(this, createLoadPreviousAction(this.previousPageNumber));
    this.updatePreviousPageNumber();
  }
}