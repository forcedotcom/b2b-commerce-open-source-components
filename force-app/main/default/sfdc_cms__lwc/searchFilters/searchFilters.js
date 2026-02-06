import { LightningElement, api, wire } from 'lwc';
import { createSearchCategoryClearAction, createSearchFiltersClearAction, createSearchFiltersUpdateAction, createSearchSortUpdateAction, createSearchOpenFilterPanelAction, createSearchFilterPanelUpdateAction, dispatchAction } from 'commerce/actionApi';
import { CurrentPageReference } from 'lightning/navigation';
import { generateTextFormatStyles, generatePaddingClass, generateThemeTextSizeProperty } from 'experience/styling';
const DEFAULT_SEARCH_FILTER_PAGE = 1;
const DEFAULT_HEADING_TAG = 'h3';
const DEFAULT_HEADING_TAG_LIST = 'p';
const textNodeMap = {
  h1: 'heading1',
  h2: 'heading2',
  h3: 'heading3',
  h4: 'heading4',
  h5: 'heading5',
  h6: 'heading6',
  p: 'paragraph'
};
export default class SearchFilters extends LightningElement {
  static renderMode = 'light';
  @api
  searchResults;
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
  get computedTextStylesForHeading() {
    const computedStyles = generateTextFormatStyles(this.headingTextDecoration ? JSON.parse(this.headingTextDecoration) : undefined);
    return {
      weight: computedStyles.weight ? computedStyles.weight : '',
      style: computedStyles.style ? computedStyles.style : '',
      decoration: computedStyles.decoration ? computedStyles.decoration : ''
    };
  }
  _rawHeadingTextDisplayInfo;
  _parsedHeadingDisplayInfo;
  @api
  get headingTextDisplayInfo() {
    return this._rawHeadingTextDisplayInfo;
  }
  set headingTextDisplayInfo(value) {
    this._rawHeadingTextDisplayInfo = value;
    this._parsedHeadingDisplayInfo = value ? JSON.parse(value) : undefined;
  }
  get headingTextNodeTag() {
    return textNodeMap[this._parsedHeadingDisplayInfo?.headingTag ?? DEFAULT_HEADING_TAG];
  }
  get dxpClassForSizeForHeading() {
    const _textStyle = this._parsedHeadingDisplayInfo?.textStyle ?? 'heading-small';
    return generateThemeTextSizeProperty(_textStyle);
  }
  get headingTextEmphasis() {
    const decoration = this.computedTextStylesForHeading.decoration;
    return decoration !== undefined && decoration !== '' ? decoration : 'var(' + this.dxpClassForSizeForHeading + '-text-decoration)';
  }
  get headingTextWeight() {
    const weight = this.computedTextStylesForHeading.weight;
    return weight !== undefined && weight !== '' ? weight : 'var(' + this.dxpClassForSizeForHeading + '-font-weight)';
  }
  get headingTextStyle() {
    const style = this.computedTextStylesForHeading.style;
    return style !== undefined && style !== '' ? style : 'var(' + this.dxpClassForSizeForHeading + '-font-style)';
  }
  get headingTextFontSize() {
    return 'var(' + this.dxpClassForSizeForHeading + '-font-size)';
  }
  get headingTextFontFamily() {
    return 'var(' + this.dxpClassForSizeForHeading + '-font-family)';
  }
  @api
  maxDepth;
  @api
  linkColor;
  @api
  linkHoverColor;
  @api
  linkTextAlign;
  @api
  textDecoration;
  @api
  linkSpacing;
  get computedTextStyles() {
    const computedStyles = generateTextFormatStyles(this.textDecoration ? JSON.parse(this.textDecoration) : undefined);
    return {
      weight: computedStyles.weight ? computedStyles.weight : '',
      style: computedStyles.style ? computedStyles.style : '',
      decoration: computedStyles.decoration ? computedStyles.decoration : ''
    };
  }
  _rawTextDisplayInfo;
  _parsedDisplayInfo;
  @api
  get textDisplayInfo() {
    return this._rawTextDisplayInfo;
  }
  set textDisplayInfo(value) {
    if (value) {
      this._parsedDisplayInfo = JSON.parse(value);
    }
    this._rawTextDisplayInfo = value;
  }
  get textNodeTag() {
    return textNodeMap[this._parsedDisplayInfo?.headingTag ?? DEFAULT_HEADING_TAG_LIST];
  }
  get dxpClassForSize() {
    const _textStyle = this._parsedDisplayInfo?.textStyle ?? 'body-regular';
    return generateThemeTextSizeProperty(_textStyle);
  }
  get linkTextDecoration() {
    const decoration = this.computedTextStyles.decoration;
    return decoration !== '' ? decoration : 'var(' + this.dxpClassForSize + '-text-decoration)';
  }
  get linkTextWeight() {
    const weight = this.computedTextStyles.weight;
    return weight !== '' ? weight : 'var(' + this.dxpClassForSize + '-font-weight)';
  }
  get linkTextStyle() {
    const style = this.computedTextStyles.style;
    return style !== '' ? style : 'var(' + this.dxpClassForSize + '-font-style)';
  }
  get linkTextFontSize() {
    return 'var(' + this.dxpClassForSize + '-font-size)';
  }
  get linkTextFontFamily() {
    return 'var(' + this.dxpClassForSize + '-font-family)';
  }
  get lineItemPadding() {
    return generatePaddingClass(this.linkSpacing ?? 'x-small', 'vertical');
  }
  get filterData() {
    return this.searchResults?.filtersPanel;
  }
  get categoryName() {
    return this.searchResults?.categoryName;
  }
  @api
  showFilters;
  @api
  sortRuleId;
  @api
  showFacetCounts;
  @api
  sortRules;
  @api
  searchTerm;
  get total() {
    return this.searchResults?.total;
  }
  @wire(CurrentPageReference)
  currentPageReference;
  get filterPanelState() {
    const {
      page,
      refinements,
      sortRule,
      categoryId,
      facets,
      minPrice,
      maxPrice,
      minLimit,
      maxLimit,
      ...filterPanelState
    } = this.currentPageReference?.state || {};
    return filterPanelState;
  }
  handleCategoryUpdateEvent(event) {
    event.stopPropagation();
    const categoryId = event.detail;
    const searchFiltersPayload = {
      page: DEFAULT_SEARCH_FILTER_PAGE,
      categoryId: categoryId
    };
    dispatchAction(this, createSearchFiltersUpdateAction(searchFiltersPayload));
  }
  handleBackToSearchUpdateEvent(event) {
    event.stopPropagation();
    dispatchAction(this, createSearchCategoryClearAction());
  }
  handleFacetValueUpdateEvent(event) {
    event.stopPropagation();
    const {
      mruFacet,
      refinements,
      minPrice,
      maxPrice,
      shouldClearUnitPrice
    } = event.detail;
    const searchFiltersPayload = {
      page: DEFAULT_SEARCH_FILTER_PAGE,
      refinements,
      mruFacet,
      minPrice,
      maxPrice,
      shouldClearUnitPrice
    };
    dispatchAction(this, createSearchFiltersUpdateAction(searchFiltersPayload));
  }
  handleClearAllFiltersEvent(event) {
    event.stopPropagation();
    dispatchAction(this, createSearchFiltersClearAction(true));
  }
  handleSearchSortEvent({
    detail
  }) {
    dispatchAction(this, createSearchSortUpdateAction(detail.sortRuleId));
  }
  handleFilterPanelClose() {
    dispatchAction(this, createSearchOpenFilterPanelAction(false));
  }
  handleFilterSectionExpand({
    detail
  }) {
    dispatchAction(this, createSearchFilterPanelUpdateAction(detail));
  }
}