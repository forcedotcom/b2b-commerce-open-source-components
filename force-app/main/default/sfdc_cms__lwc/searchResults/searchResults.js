import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext, CurrentPageReference } from 'lightning/navigation';
import { createCartItemAddAction, createSearchFiltersUpdateAction, dispatchAction } from 'commerce/actionApi';
import { Labels } from './labels';
import Toast from 'site/commonToast';
import { createProductRecommendationDataEvent, dispatchDataEvent, updateSearchCorrelationId } from 'commerce/dataEventApi';
export default class SearchResults extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @api
  searchResultsLoading;
  @api
  searchResults;
  @api
  searchResultsFields;
  @api
  includeQuantityRules;
  @api
  resultsLayout;
  @api
  gridColumnSpacing;
  @api
  gridRowSpacing;
  @api
  gridMaxColumnsDisplayed;
  @api
  listRowSpacing;
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
  negotiatedPriceTextSize;
  @api
  showNegotiatedPrice = false;
  @api
  negotiatedPriceTextColor;
  @api
  showOriginalPrice = false;
  @api
  originalPriceTextSize;
  @api
  originalPriceTextColor;
  @api
  showProductImage = false;
  @api
  cardContentMapping;
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
  currentPage;
  @api
  resultNavigation;
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
  navigateToParentProduct = false;
  get normalizedCardContentMapping() {
    return JSON.parse(this.cardContentMapping ?? '[]');
  }
  handleAddToCart(event) {
    event.stopPropagation();
    const {
      productId,
      quantity
    } = event.detail;
    dispatchAction(this, createCartItemAddAction(productId, quantity), {
      onError: () => {
        Toast.show({
          label: Labels.unexpectedAddToCartError,
          variant: 'error'
        }, this);
      }
    });
  }
  handleNavigateToProductPage(event) {
    event.stopPropagation();
    const pageReference = {
      type: 'standard__recordPage',
      attributes: {
        objectApiName: 'Product2',
        recordId: event.detail.productId,
        actionName: 'view',
        urlName: event.detail.productUrlName
      },
      state: {
        recordName: event.detail.productName
      }
    };
    const matchingCard = this.searchResults?.cardCollection?.find(({
      id
    }) => id === event.detail.productId);
    const rank = matchingCard?.rank ?? 0;
    const pageOffset = matchingCard?.pageOffset ?? 0;
    const pageSize = matchingCard?.pageSize ?? 0;
    let categoryId;
    if (this.currentPageReference) {
      if (this.currentPageReference.type === 'standard__search') {
        const searchTerm = this.currentPageReference.state?.term ?? '';
      } else if (this.currentPageReference.type === 'standard__recordPage') {
        categoryId = this.currentPageReference.state?.category ?? this.currentPageReference.attributes?.recordId ?? '';
      }
    }
    if (this.navContext && pageReference) {
      const correlationId = this.searchResults?.correlationId;
      updateSearchCorrelationId(correlationId ?? '');
      if (correlationId) {
        dispatchDataEvent(this, createProductRecommendationDataEvent({
          id: event.detail.productId,
          type: 'Product',
          attributes: {
            categoryId: categoryId,
            searchResultTitle: event.detail.productName,
            searchResultPosition: rank + pageSize * pageOffset,
            searchResultPositionInPage: rank,
            searchResultId: correlationId,
            searchResultPageNumber: pageOffset,
            correlationId: correlationId
          }
        }));
      }
      navigate(this.navContext, pageReference);
    }
  }
  @wire(CurrentPageReference)
  currentPageReference;
  get selectedResultNavigationType() {
    return this.resultNavigation ?? 'pagination';
  }
  handleUpdateCurrentPage(event) {
    event.stopPropagation();
    dispatchAction(this, createSearchFiltersUpdateAction({
      page: event.detail.newPageNumber
    }));
  }
}