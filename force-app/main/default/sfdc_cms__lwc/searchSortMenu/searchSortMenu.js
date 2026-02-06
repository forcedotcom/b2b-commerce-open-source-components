import { api, LightningElement } from 'lwc';
import { Labels } from './labels';
import { createSearchSortUpdateAction, createSearchOpenFilterPanelAction, dispatchAction } from 'commerce/actionApi';

/**
 * @slot sortMenuLabel
 */
export default class SearchSortMenu extends LightningElement {
  static renderMode = 'light';
  @api
  sortRuleId;
  @api
  sortRules;
  sortAndFilterLabel = Labels.sortAndFilter;
  sortAndFilterPanelAriaLabel = Labels.sortAndFilterPanelAriaLabel;
  handleSearchSortEvent({
    detail
  }) {
    dispatchAction(this, createSearchSortUpdateAction(detail.sortRuleId));
  }
  handleShowFilterSortPanel() {
    dispatchAction(this, createSearchOpenFilterPanelAction(true));
  }
}