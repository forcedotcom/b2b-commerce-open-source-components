import { api, LightningElement } from 'lwc';
import { EVENT_SORT_ORDER_CHANGED } from './constants';
import { computeSortOptions } from './utils';
import { Labels } from './labels';
export const SORT_MENU_SECTION_ID = 'sort-menu-list';
export default class SearchSortMenuUi extends LightningElement {
  static renderMode = 'light';
  _sortRules;
  _options = [];
  @api
  sortRuleId;
  @api
  customStyles;
  @api
  customClasses;
  @api
  isHeadingH1;
  @api
  isHeadingH2;
  @api
  isHeadingH3;
  @api
  isHeadingH4;
  @api
  isHeadingH5;
  @api
  isHeadingH6;
  @api
  isBody;
  @api
  groupName;
  @api
  set sortRules(value) {
    this._sortRules = value;
    this._options = computeSortOptions(value);
  }
  get sortRules() {
    return this._sortRules;
  }
  @api
  filterPanelState;
  sortLabel = Labels.sort;
  get activeOption() {
    const selectedOption = this._options.find(sortOption => sortOption.value === this.sortRuleId);
    return selectedOption || this._options.at(0) || {
      label: '',
      value: ''
    };
  }
  get selectedLabel() {
    return [this.activeOption.value];
  }
  get sectionHeader() {
    return Labels.sort;
  }
  get sectionId() {
    return SORT_MENU_SECTION_ID;
  }
  get sortByAltText() {
    return Labels.sortByAltText;
  }
  handleDropdownSelect({
    detail: {
      selected
    }
  }) {
    if (selected && selected !== this.sortRuleId) {
      this.dispatchSortOrderChangeEvent(selected);
    }
  }
  handleChange({
    detail: {
      value
    }
  }) {
    if (value && value !== this.sortRuleId) {
      this.dispatchSortOrderChangeEvent(value);
    }
  }
  dispatchSortOrderChangeEvent(sortRuleId) {
    this.dispatchEvent(new CustomEvent(EVENT_SORT_ORDER_CHANGED, {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        sortRuleId
      }
    }));
  }
}