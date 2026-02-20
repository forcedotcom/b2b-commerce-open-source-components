import { LightningElement, api } from 'lwc';
import labels from './labels';
import { generateStyleProperties } from 'experience/styling';
export const SEARCH_CATEGORY_SECTION_ID = 'categories-section';
const CATEGORY_UPDATE_EVT = 'categoryupdate';
const BACK_TO_SEARCH_UPDATE_EVT = 'backtosearchupdate';
const CATEGORY_LIST_CLASS = 'category-list';
const PARENT_CATEGORY_LIST_CLASS = 'slds-p-left_x-large';
export default class SearchFiltersCategoryList extends LightningElement {
  static renderMode = 'light';
  _categories;
  get showCategoryList() {
    return Boolean(this._categories?.length);
  }
  get categoryListClass() {
    return this.showBackButton ? [CATEGORY_LIST_CLASS, PARENT_CATEGORY_LIST_CLASS] : [CATEGORY_LIST_CLASS];
  }
  get hasParentCategory() {
    return this.parentCategory?.id !== undefined && this.parentCategory?.id !== null;
  }
  get hasSearchResultsParent() {
    return !!this.searchTerm && this.categoryName !== '' && !this.hasParentCategory;
  }
  get showBackButton() {
    return this.hasParentCategory || this.hasSearchResultsParent;
  }
  get backButtonAssistiveText() {
    return labels.backActionAssistiveText.replace('{categoryName}', this.searchResultsLabel);
  }
  @api
  set categories(categoryInfo) {
    this._categories = categoryInfo?.map(item => {
      return {
        ...item,
        label: item.name,
        isClickable: true,
        actionValue: item.id
      };
    }) ?? [];
  }
  get categories() {
    return this._categories;
  }
  @api
  parentCategory;
  @api
  categoryName;
  @api
  searchTerm;
  @api
  filterPanelState;
  get sectionHeader() {
    return labels.categoriesHeader;
  }
  get searchResultsLabel() {
    const label = this.hasSearchResultsParent ? labels.searchResults : this.parentCategory?.categoryName;
    return label;
  }
  get sectionId() {
    return SEARCH_CATEGORY_SECTION_ID;
  }
  updateCategory() {
    const categoryId = this.parentCategory?.id;
    const eventToDispatch = this.hasSearchResultsParent ? BACK_TO_SEARCH_UPDATE_EVT : CATEGORY_UPDATE_EVT;
    this.dispatchEvent(new CustomEvent(eventToDispatch, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: categoryId
    }));
  }
  handleBackClick(evt) {
    evt.preventDefault();
    this.updateCategory();
  }
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
  get customLinkStyles() {
    return generateStyleProperties({
      '--sds-c-button-text-color': this.linkColor ?? '--dxp-s-body-text-color',
      '--sds-c-button-text-color-hover': this.linkHoverColor ?? '',
      '--dxp-s-button-font-weight': this.linkTextWeight ?? '',
      '--dxp-s-button-font-style': this.linkTextStyle ?? '',
      '--dxp-s-button-text-decoration-active': this.linkTextDecoration ?? '',
      '--dxp-s-button-text-decoration-hover': this.linkTextDecoration ?? '',
      '--dxp-s-button-font-size': this.linkTextFontSize ?? '',
      '--dxp-s-button-font-family': this.linkTextFontFamily ?? ''
    });
  }
}