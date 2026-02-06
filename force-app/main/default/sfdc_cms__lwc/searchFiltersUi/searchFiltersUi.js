import { LightningElement, api } from 'lwc';
import { Labels } from './labels';
export const WRAPPER_ID = 'filterPanelWrapper';
export const WRAPPER_CLASS = 'panel-wrapper';
export const VISIBLE_CLASS = 'visible';
export const CONTAINER_CLASS = 'panel-container';
export default class SearchFiltersUi extends LightningElement {
  static renderMode = 'light';
  _showFilters = false;
  @api
  headingTextWeight;
  @api
  headingTextStyle;
  @api
  headingTextNodeTag;
  @api
  headingTextFontSize;
  @api
  headingTextFontFamily;
  @api
  headingTextColor;
  @api
  headingBackgroundColor;
  @api
  headingTextAlign;
  @api
  headingTextDecoration;
  @api
  paddingVertical;
  @api
  paddingHorizontal;
  @api
  maxDepth;
  @api
  linkTextWeight;
  @api
  linkTextStyle;
  @api
  textNodeTag;
  @api
  linkTextFontSize;
  @api
  linkTextFontFamily;
  @api
  linkColor;
  @api
  linkHoverColor;
  @api
  linkTextAlign;
  @api
  linkTextDecoration;
  @api
  lineItemPadding;
  @api
  total;
  @api
  showFacetCounts;
  @api
  set showFilters(val) {
    this._showFilters = val;
  }
  get showFilters() {
    return this._showFilters;
  }
  get filterRole() {
    return this._showFilters ? 'dialog' : null;
  }
  filterHeaderLabel = Labels.filterHeader;
  @api
  searchResults;
  @api
  sortRuleId;
  @api
  sortRules;
  @api
  categoryName;
  @api
  searchTerm;
  @api
  filterPanelState;
  get wrapperClasses() {
    const classes = [WRAPPER_CLASS];
    if (this.showFilters) {
      classes.push(VISIBLE_CLASS);
    }
    return classes;
  }
  get containerClasses() {
    return `${CONTAINER_CLASS} ${this.showFilters ? VISIBLE_CLASS : undefined}`;
  }
  get normalizedSearchSortRules() {
    return {
      rules: this.sortRules,
      currentSortRuleId: this.sortRuleId
    };
  }
  get ariaModalValue() {
    return this._showFilters || null;
  }
  handleClose() {
    this.closeFilterPanel();
  }
  handlePanelClick(event) {
    if (event.target?.getAttribute('data-id') === WRAPPER_ID) {
      this.closeFilterPanel();
    }
  }
  closeFilterPanel() {
    this._showFilters = false;
    this.dispatchEvent(new CustomEvent('closefilterpanel'));
  }
}