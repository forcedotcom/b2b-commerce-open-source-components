import { LightningElement, api } from 'lwc';
import labels from './labels';
import { debounce } from 'experience/utils';
import { refinementsFromFacetsMap } from './dataConverter';
import { EVENT } from './constants';
import currencyFormatter from 'site/commonFormatterCurrency';
import { generateStyleProperties, generatePaddingClass } from 'experience/styling';
import searchFiltersHeadingAlignment from './searchFiltersHeadingAlignment';
const textNodeMap = {
  h1: 'heading1',
  h2: 'heading2',
  h3: 'heading3',
  h4: 'heading4',
  h5: 'heading5',
  h6: 'heading6',
  p: 'paragraph'
};
export const FILTERS_PANEL_TRANSITION_DURATION = 350;
export const FUZZY_COUNT_START = 1000;
export const PANEL_CLASS = 'filter-panel';
export const EMPTY_CLASS = 'empty';
export default class SearchFiltersPanel extends LightningElement {
  static renderMode = 'light';
  _rawFilterData;
  _total = 0;
  _facetsMap;
  _mruFacet = {};
  _mruFacetId;
  @api
  showFacetCounts;
  @api
  set total(value) {
    this._total = value ?? 0;
  }
  get total() {
    return this._total;
  }
  @api
  set displayData(value) {
    this._rawFilterData = value;
    this._facetsMap = this._createFacetMap(value?.facets ?? []);
  }
  get displayData() {
    return this._rawFilterData;
  }
  @api
  categoryName;
  @api
  searchTerm;
  @api
  sortRulesData;
  @api
  filterPanelState;
  get shouldShowSelectedFilters() {
    return this.selectedFilters?.length > 0;
  }
  get shouldDisableClearFiltersButton() {
    return this.selectedFilters?.length === 0;
  }
  get selectedFilters() {
    return this.facets?.reduce((selected, facet) => {
      if (facet.values !== undefined) {
        return selected.concat(facet.values?.filter?.(value => value.checked).map(value => ({
          ...value,
          facetId: facet.id
        })));
      } else if (facet.displayType === 'Range' && facet.maxPrice !== undefined && facet.minPrice !== undefined) {
        const isoCode = facet.displayMetadata?.currencyInfo.isoCode;
        return [...selected, {
          id: facet.nameOrId,
          facetId: facet.id,
          name: currencyFormatter(isoCode, facet.minPrice, 'symbol') + '-' + currencyFormatter(isoCode, facet.maxPrice, 'symbol')
        }];
      }
      return selected;
    }, []);
  }
  get categories() {
    return this._rawFilterData?.childCategories ?? [];
  }
  get showCategoryList() {
    const allCategoriesHaveId = this.categories.length > 0 && this.categories.every(category => category.id && category.id.length > 0);
    return Boolean(allCategoriesHaveId || this.parentCategory?.id && this.parentCategory.id.length > 0 || this.searchTerm && this.categoryName);
  }
  get parentCategory() {
    return this._rawFilterData?.parentCategory ?? {};
  }
  get facets() {
    return this._rawFilterData?.facets ?? [];
  }
  get clearFiltersLabel() {
    return labels.clearFiltersButton;
  }
  get filterHeader() {
    return labels.filterHeader;
  }
  get closeButtonLabel() {
    return labels.closeLabel;
  }
  get sortAndFilters() {
    return labels.sortAndFilters;
  }
  get seeItemsButtonLabel() {
    const countText = this._total > FUZZY_COUNT_START ? '(1000+)' : `(${this._total})`;
    return this._total === 0 || this._total > 1 ? labels.multipleSeeItemsButton.replace('{count}', countText) : labels.oneSeeItemsButton;
  }
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
  get customClasses() {
    return `slds-truncate ${generatePaddingClass(this.paddingVertical ?? 'none', 'vertical')} ${generatePaddingClass(this.paddingHorizontal ?? 'none', 'horizontal')}`;
  }
  get customStyles() {
    return generateStyleProperties({
      '--com-c-search-filters-heading-text-color': this.headingTextColor ?? '',
      '--com-c-search-filters-heading-background-color': this.headingBackgroundColor ?? '',
      '--com-c-search-filters-heading-alignment': searchFiltersHeadingAlignment(this.headingTextAlign),
      '--com-c-search-filters-heading-decoration': this.headingTextDecoration ?? '',
      '--com-c-search-filters-heading-text-font-weight': this.headingTextWeight ?? '',
      '--com-c-search-filters-heading-text-font-style': this.headingTextStyle ?? '',
      '--com-c-search-filters-heading-text-font-size': this.headingTextFontSize ?? '',
      '--com-c-search-filters-heading-text-font-family': this.headingTextFontFamily ?? ''
    });
  }
  get isHeadingH1() {
    return this.headingTextNodeTag === textNodeMap.h1;
  }
  get isHeadingH2() {
    return this.headingTextNodeTag === textNodeMap.h2;
  }
  get isHeadingH3() {
    return this.headingTextNodeTag === textNodeMap.h3;
  }
  get isHeadingH4() {
    return this.headingTextNodeTag === textNodeMap.h4;
  }
  get isHeadingH5() {
    return this.headingTextNodeTag === textNodeMap.h5;
  }
  get isHeadingH6() {
    return this.headingTextNodeTag === textNodeMap.h6;
  }
  get isBody() {
    return this.headingTextNodeTag === textNodeMap.p;
  }
  get sortRules() {
    return this.sortRulesData?.rules ?? [];
  }
  get sortRuleId() {
    return this.sortRulesData?.currentSortRuleId;
  }
  handleHideFilterPanel() {
    this.dispatchEvent(new CustomEvent(EVENT.CLOSE_FILTER_PANEL));
  }
  handleCategoryClick(event) {
    const categoryId = event.detail.value?.id;
    this.dispatchEvent(new CustomEvent(EVENT.CATEGORY_UPDATE_EVT, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: categoryId
    }));
  }
  handleFacetValueToggle(evt) {
    if (evt.target instanceof HTMLElement) {
      this._mruFacetId = evt.detail.facetId;
      const facetValueId = evt.detail.id;
      const checked = evt.detail.checked;
      if (this._mruFacetId && this._facetsMap?.get(this._mruFacetId)) {
        this._facetsMap.get(this._mruFacetId)?.valuesCheckMap.set(facetValueId, checked);
        this._facetValueUpdated();
      }
    }
  }
  _createFacetMap(facets) {
    return facets?.reduce((facetAccumulator, searchFacet) => {
      return facetAccumulator.set(searchFacet.id, {
        searchFacet,
        valuesCheckMap: new Map(searchFacet.values?.map(facetValue => [facetValue.id, facetValue.checked]))
      });
    }, new Map());
  }
  _facetValueUpdated = debounce(() => {
    const mruFacetList = this.facets.filter(facet => facet.id === this._mruFacetId);
    if (mruFacetList && mruFacetList.length === 1) {
      this._mruFacet = mruFacetList[0];
    }
    const updatedMruFacet = Object.assign({}, this._mruFacet);
    updatedMruFacet.values = updatedMruFacet.values?.map(item => {
      return {
        ...item,
        checked: this._facetsMap?.get(this._mruFacetId)?.valuesCheckMap.get(item.id)
      };
    });
    this._mruFacet = updatedMruFacet;
    const priceFilterFacet = this.facets.find(item => item.displayType === 'Range');
    const minPrice = priceFilterFacet?.minPrice;
    const maxPrice = priceFilterFacet?.maxPrice;
    const refinements = refinementsFromFacetsMap(this._facetsMap, minPrice, maxPrice);
    this.dispatchEvent(new CustomEvent(EVENT.FACETVALUE_UPDATE_EVT, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        mruFacet: this._mruFacet,
        refinements,
        minPrice,
        maxPrice
      }
    }));
  }, 300);
  handleClearAll(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent(EVENT.CLEAR_ALL_FILTERS_EVT, {
      bubbles: true,
      composed: true
    }));
  }
  handleFacetValuePriceFilter(evt) {
    const refinements = refinementsFromFacetsMap(this._facetsMap, evt.detail.minPrice, evt.detail.maxPrice);
    this.dispatchEvent(new CustomEvent(EVENT.FACETVALUE_UPDATE_EVT, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        refinements,
        minPrice: Number(evt.detail.minPrice),
        maxPrice: Number(evt.detail.maxPrice),
        shouldClearUnitPrice: evt.detail.shouldClearUnitPrice
      }
    }));
  }
  _showFilters = false;
  @api
  set showFilters(value) {
    this._showFilters = value;
    if (value) {
      setTimeout(() => {
        const closeButton = this.refs?.closeButton;
        closeButton.focus();
      }, FILTERS_PANEL_TRANSITION_DURATION);
    }
  }
  get showFilters() {
    return this._showFilters;
  }
}