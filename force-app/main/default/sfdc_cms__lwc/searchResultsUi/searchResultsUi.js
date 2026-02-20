import { api, LightningElement } from 'lwc';
import { generateStyleProperties, generateThemeTextSizeProperty } from 'experience/styling';
import { computeConfiguration, transformDataWithConfiguration } from './searchResultsUtils';
import { EVENT, DEFAULTS } from './constants';
import labels from './labels';
function dxpTextSize(textSize) {
  const themeSize = generateThemeTextSizeProperty(`heading-${textSize}`);
  return themeSize ? `var(${themeSize}-font-size)` : 'initial';
}
export default class SearchResultsUi extends LightningElement {
  static renderMode = 'light';
  _currentPage = '1';
  _currentPageNumber = 1;
  @api
  searchResultsLoading;
  _latestResultsLoaded = false;
  @api
  set searchResults(value) {
    this._latestResultsLoaded = true;
    this._searchResults = value;
  }
  get searchResults() {
    return this._searchResults;
  }
  _searchResults;
  @api
  resultsLayout;
  @api
  gridColumnSpacing;
  @api
  gridRowSpacing;
  @api
  listRowSpacing;
  @api
  showProductImage = false;
  @api
  showNegotiatedPrice = false;
  @api
  negotiatedPriceTextSize;
  @api
  negotiatedPriceTextColor;
  @api
  showOriginalPrice = false;
  @api
  originalPriceTextSize;
  @api
  originalPriceTextColor;
  @api
  subscriptionOptionsText;
  @api
  showCallToActionButton = false;
  @api
  addToCartButtonText;
  @api
  addToCartButtonStyle;
  @api
  addToCartButtonProcessingText;
  @api
  viewOptionsButtonText;
  @api
  cardContentMapping;
  @api
  cardBackgroundColor;
  @api
  cardAlignment;
  @api
  cardBorderColor;
  @api
  cardBorderRadius;
  @api
  cardDividerColor;
  @api
  quantitySelectorLabel;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  @api
  showQuantityRulesText = false;
  @api
  showQuantitySelector = false;
  @api
  resultNavigationType;
  @api
  navigateToParentProduct = false;
  @api
  set currentPage(newCurrentPage) {
    this.updatePageAndPageNumber(newCurrentPage);
  }
  get currentPage() {
    return this._currentPage;
  }
  get loadingLabel() {
    return labels.loading;
  }
  get resultsLoadedLabel() {
    const totalResults = this.searchResults?.total || 0;
    const resultCount = this.searchResults?.cardCollection?.length || 0;
    const pageSize = this.searchResults?.pageSize || 20;
    const currentPage = this._currentPageNumber;
    if (totalResults === 0) {
      return labels.noResultsFound;
    } else if (totalResults === resultCount) {
      return labels.resultsLoaded.replace('{totalResults}', totalResults.toString());
    }
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(startIndex + pageSize - 1, totalResults);
    return labels.resultsLoadedPartial.replace('{currentPage}', currentPage.toString()).replace('{startIndex}', startIndex.toString()).replace('{endIndex}', endIndex.toString()).replace('{totalResults}', totalResults.toString());
  }
  get searchResultsLoaded() {
    return !this.searchResultsLoading && !!this.searchResults && this._latestResultsLoaded;
  }
  updatePageAndPageNumber(newCurrentPage) {
    this._currentPage = newCurrentPage;
    const newPageAsNumber = parseInt(newCurrentPage, 10);
    if (!Number.isNaN(newPageAsNumber)) {
      this._currentPageNumber = newPageAsNumber;
    }
  }
  get _gridColumnSpacing() {
    return this.gridColumnSpacing ?? DEFAULTS.gridColumnSpacing;
  }
  get _gridRowSpacing() {
    return this.gridRowSpacing ?? DEFAULTS.gridRowSpacing;
  }
  get _listRowSpacing() {
    return this.listRowSpacing ?? DEFAULTS.listRowSpacing;
  }
  get _negotiatedPriceTextSize() {
    return this.negotiatedPriceTextSize ?? DEFAULTS.negotiatedPriceTextSize;
  }
  get _negotiatedPriceTextColor() {
    return this.negotiatedPriceTextColor ?? DEFAULTS.negotiatedPriceTextColor;
  }
  get _originalPriceTextSize() {
    return this.originalPriceTextSize ?? DEFAULTS.originalPriceTextSize;
  }
  get _originalPriceTextColor() {
    return this.originalPriceTextColor ?? DEFAULTS.originalPriceTextColor;
  }
  get _cardContentMapping() {
    return Array.isArray(this.cardContentMapping) ? this.cardContentMapping : [];
  }
  get _cardBackgroundColor() {
    return this.cardBackgroundColor ?? DEFAULTS.cardBackgroundColor;
  }
  get _cardAlignment() {
    return this.cardAlignment ?? DEFAULTS.cardAlignment;
  }
  get _cardBorderColor() {
    return this.cardBorderColor ?? DEFAULTS.cardBorderColor;
  }
  get _cardBorderRadius() {
    return this.cardBorderRadius ?? DEFAULTS.cardBorderRadius;
  }
  get _cardDividerColor() {
    return this.cardDividerColor ?? DEFAULTS.cardDividerColor;
  }
  get normalizedSearchResults() {
    return transformDataWithConfiguration(this.searchResults, this.cardConfiguration);
  }
  get _resultsLayout() {
    return this.resultsLayout ?? DEFAULTS.resultsLayout;
  }
  get cardConfiguration() {
    return {
      showProductImage: this.showProductImage,
      showNegotiatedPrice: this.showNegotiatedPrice,
      showOriginalPrice: this.showOriginalPrice,
      subscriptionOptionsText: this.subscriptionOptionsText,
      showCallToActionButton: this.showCallToActionButton,
      addToCartButtonText: this.addToCartButtonText,
      addToCartButtonProcessingText: this.addToCartButtonProcessingText,
      viewOptionsButtonText: this.viewOptionsButtonText,
      cardContentMapping: this._cardContentMapping,
      showQuantitySelector: this.showQuantitySelector,
      quantitySelectorLabelText: this.quantitySelectorLabel,
      showQuantityRulesText: this.showQuantityRulesText,
      minimumQuantityGuideText: this.minimumValueGuideText,
      maximumQuantityGuideText: this.maximumValueGuideText,
      incrementQuantityGuideText: this.incrementValueGuideText,
      navigateToParentProduct: this.navigateToParentProduct
    };
  }
  get resultsConfiguration() {
    return computeConfiguration({
      layout: this._resultsLayout,
      builderCardConfiguration: this.cardConfiguration,
      addToCartDisabled: false
    });
  }
  get customCssProperties() {
    const isGridLayout = this._resultsLayout === 'grid';
    return generateStyleProperties({
      '--com-c-product-grid-spacing-row': isGridLayout ? this._gridRowSpacing : this._listRowSpacing,
      ...(isGridLayout ? {
        '--com-c-product-grid-spacing-column': this._gridColumnSpacing
      } : {}),
      ...(isGridLayout ? {} : {
        '--com-c-product-grid-list-color-border': this._cardDividerColor
      }),
      '--com-c-product-card-button-variant': this.addToCartButtonStyle || 'primary',
      '--com-c-product-card-container-color-background': this._cardBackgroundColor,
      '--com-c-product-card-container-color-border': this._cardBorderColor,
      '--com-c-product-card-container-radius-border': this._cardBorderRadius,
      ...(isGridLayout ? {
        '--com-c-product-card-content-align-self': this._cardAlignment
      } : {}),
      ...(isGridLayout ? {
        '--com-c-product-card-content-justify-self': this._cardAlignment
      } : {}),
      '--com-c-product-pricing-negotiated-price-label-color': this._negotiatedPriceTextColor,
      '--com-c-product-pricing-negotiated-price-label-size': dxpTextSize(this._negotiatedPriceTextSize),
      '--com-c-product-pricing-original-price-label-color': this._originalPriceTextColor,
      '--com-c-product-pricing-original-price-label-size': dxpTextSize(this._originalPriceTextSize)
    });
  }
  get pageSize() {
    return this.searchResults?.pageSize ?? 20;
  }
  get totalItemCount() {
    return this.searchResults?.total ?? 0;
  }
  get showPagingControl() {
    const totalPages = Math.ceil(this.totalItemCount / this.pageSize);
    return totalPages > 1;
  }
  get selectedNavigationType() {
    return this.resultNavigationType === 'slidingWindow' ? 'slidingWindow' : 'pagination';
  }
  handleAddToCart(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent(EVENT.ADD_PRODUCT_TO_CART_EVT, {
      detail: event.detail
    }));
  }
  handleNavigateToProductPage(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
      detail: event.detail
    }));
  }
  handlePreviousPageEvent(event) {
    event.stopPropagation();
    this._latestResultsLoaded = false;
    const previousPageNumber = this._currentPageNumber - 1;
    this.dispatchUpdateCurrentPageEvent(previousPageNumber);
  }
  handleNextPageEvent(event) {
    event.stopPropagation();
    this._latestResultsLoaded = false;
    const nextPageNumber = this._currentPageNumber + 1;
    this.dispatchUpdateCurrentPageEvent(nextPageNumber);
  }
  handleGotoPageEvent(event) {
    event.stopPropagation();
    this._latestResultsLoaded = false;
    const pageNumber = event.detail.pageNumber;
    this.dispatchUpdateCurrentPageEvent(pageNumber);
  }
  dispatchUpdateCurrentPageEvent(newPageNumber) {
    this.updatePageAndPageNumber(String(newPageNumber));
    this.dispatchEvent(new CustomEvent(EVENT.UPDATE_CURRENT_PAGE_EVT, {
      detail: {
        newPageNumber
      }
    }));
  }
}