import { LightningElement, api } from 'lwc';

/**
 * @slot resultsLayout
 * @slot noResults
 * @slot loaderPlaceholder
 */
export default class SearchResultsLayoutEmpty extends LightningElement {
  static renderMode = 'light';
  @api
  searchResultsTotal;
  @api
  searchResultsLoading;
  get showResults() {
    return this.searchResultsTotal !== undefined && this.searchResultsTotal > 0;
  }
  get showNoResults() {
    return this.searchResultsTotal === 0 && !this.searchResultsLoading;
  }
  get showLoaderPlaceholder() {
    return Boolean(this.searchResultsTotal === undefined || this.searchResultsLoading || this.searchResultsTotal === null);
  }
}