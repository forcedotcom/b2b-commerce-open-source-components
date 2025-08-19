import { LightningElement, api } from 'lwc';
import { generatePagesForRange } from './searchPagingControlHelper';
import { EVENT, PAGING_RANGE_SYMBOL, MAX_RESULTS_OFFSET } from './constants';
import { previous, next, resultsLimitHitText } from './labels';
function isNumber(value, min) {
  return typeof value === 'number' && !Number.isNaN(value) && value > min;
}
export default class SearchPagingcontrol extends LightningElement {
  static renderMode = 'light';
  @api
  currentPageNumber;
  @api
  pageSize;
  @api
  totalItemCount;
  @api
  maximumPagesDisplayed;
  label = {
    previous,
    next,
    resultsLimitHitText
  };
  get normalizedPageNumber() {
    return isNumber(this.currentPageNumber, 1) ? this.currentPageNumber : 1;
  }
  get normalizedPageSize() {
    return isNumber(this.pageSize, 1) ? this.pageSize : 1;
  }
  get normalizedItemCount() {
    const totalProductCount = isNumber(this.totalItemCount, 0) ? this.totalItemCount : 0;
    return Math.min(MAX_RESULTS_OFFSET, totalProductCount);
  }
  get disablePaginationPrevious() {
    return this.normalizedPageNumber === 1;
  }
  get disablePaginationNext() {
    return this.normalizedPageNumber >= this.totalPages;
  }
  get showMessageForResultsLimit() {
    return this.normalizedItemCount === MAX_RESULTS_OFFSET && this.normalizedPageNumber >= this.totalPages;
  }
  get totalPages() {
    return Math.ceil(this.normalizedItemCount / this.normalizedPageSize);
  }
  get pageNumbers() {
    const max = isNumber(this.maximumPagesDisplayed, 0) ? this.maximumPagesDisplayed : 5;
    return generatePagesForRange(this.normalizedPageNumber, this.totalPages, max);
  }
  get rangeSymbol() {
    return PAGING_RANGE_SYMBOL;
  }
  handlePaginationPrevious() {
    this.dispatchEvent(new CustomEvent(EVENT.PAGE_CHANGE_PREVIOUS_EVT));
  }
  handlePaginationNext() {
    this.dispatchEvent(new CustomEvent(EVENT.PAGE_CHANGE_NEXT_EVT));
  }
  handlePaginationPage(event) {
    this.dispatchEvent(new CustomEvent(EVENT.PAGE_CHANGE_GOTOPAGE_EVT, {
      detail: {
        pageNumber: parseInt(event.target.value, 10)
      }
    }));
  }
}