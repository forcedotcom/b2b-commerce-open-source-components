import { api, LightningElement, wire } from 'lwc';
import Toast from 'site/commonToast';
import { ProductSearchAdapter } from 'commerce/productApi';
import { defaultSearchErrorMessage, removeButtonAssistiveTextWithNoEntry, removeButtonAssistiveTextWithValidEntry, searchInputAriaLabel, skuIsUnavailableInlineErrorMessage, subscriptionProductSkuIsNotAvailableInlineErrorMessage } from './labels';
import { createSearchDataEvent, dispatchDataEvent, updateSearchCorrelationId } from 'commerce/dataEventApi';
const DEFAULT_PRODUCT_SEARCH_QUERY = {
  includeQuantityRule: true,
  searchTerm: undefined,
  page: 0,
  fields: ['StockKeepingUnit', 'Name'],
  pageSize: 1,
  grouping: 'NoGrouping'
};
const SKU_SEARCH = 'sku:';
function sameSku(searchTerm, other) {
  return !!other && !searchTerm.localeCompare(other, undefined, {
    sensitivity: 'base'
  });
}
export default class OrderQuickOrderItem extends LightningElement {
  static renderMode = 'light';
  _randomId = this.generateUuid();
  labels = {
    searchInputAriaLabel,
    removeButtonAssistiveTextWithNoEntry,
    removeButtonAssistiveTextWithValidEntry
  };
  @api
  addToCartInProgress = false;
  @api
  item;
  @api
  skuLabelText;
  @api
  searchInputPlaceHolderText;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  searchDisabled = false;
  get showSkuLabel() {
    if (this.productSummaryData?.fields?.StockKeepingUnit?.value && this.skuLabelText) {
      return true;
    }
    return false;
  }
  get generatedSkuLabel() {
    const sku = this.productSummaryData?.fields?.StockKeepingUnit?.value;
    return this.skuLabelText.replace('{0}', sku);
  }
  get productSummaryData() {
    return this.item?.productSummaryData;
  }
  get purchaseQuantityRuleMin() {
    return this.productSummaryData?.purchaseQuantityRule?.minimum;
  }
  get purchaseQuantityRuleMax() {
    return this.productSummaryData?.purchaseQuantityRule?.maximum;
  }
  get purchaseQuantityRuleStep() {
    return this.productSummaryData?.purchaseQuantityRule?.increment;
  }
  get removeButtonAssistiveText() {
    if (this.displayProductName) {
      return this.labels.removeButtonAssistiveTextWithValidEntry.replace('{name}', this.displayProductName);
    }
    return this.labels.removeButtonAssistiveTextWithNoEntry;
  }
  get randomId() {
    return `quick-order-input-${this._randomId}`;
  }
  get variants() {
    return this.productSummaryData?.variationAttributeSet?.attributes?.map(attribute => {
      return {
        ...attribute,
        name: attribute.label
      };
    });
  }
  _searchQuery;
  get searchQuerysearchTerm() {
    return (this._searchQuery?.searchTerm || '').slice(SKU_SEARCH.length);
  }
  notifications;
  get showProductDetails() {
    return !!this.item?.productSummaryData;
  }
  get quantity() {
    return this.item?.productSummaryData?.purchaseQuantityRule ? undefined : this.item?.quantity ?? 1;
  }
  get isQuantitySelectorDisabled() {
    return this.addToCartInProgress;
  }
  get isSearchDisabled() {
    return this.addToCartInProgress || this.searchDisabled;
  }
  get hasErrors() {
    return !!this.notifications;
  }
  get searchStyleClasses() {
    return this.hasErrors ? 'search-input slds-has-error' : 'search-input';
  }
  get searchTerm() {
    const term = this.item?.searchTerm?.trim() ?? '';
    if (term === '' && !this.showProductDetails) {
      this.notifications = undefined;
    }
    return term;
  }
  get displayProductName() {
    return this.productSummaryData?.fields?.Name?.value;
  }
  handleSearchKeyup(event) {
    const value = this.item?.searchTerm?.trim();
    if (event.key === 'Enter' && value) {
      this._searchQuery = this.updateSearchQuery(value);
    }
  }
  handleBlur(event) {
    const value = event.target?.value.trim();
    if (value && this.item?.searchTerm !== '') {
      this._searchQuery = this.updateSearchQuery(value);
    }
  }
  handleSearchValueChanged(event) {
    const value = event.target?.value;
    const data = {
      ...this.item,
      searchTerm: value
    };
    this.dispatchUpdateEntriesEvent(data);
  }
  handleValueChanged({
    detail
  }) {
    if (detail?.isValid) {
      const data = {
        ...this.item,
        quantity: detail.value,
        quantityErrorState: false
      };
      this.dispatchUpdateEntriesEvent(data);
    }
  }
  handleValidityChanged({
    detail
  }) {
    this.notifications = detail?.isValid ? undefined : detail.description;
    const data = {
      ...this.item,
      quantityErrorState: !detail?.isValid
    };
    this.dispatchUpdateEntriesEvent(data);
  }
  updateSearchQuery(searchTerm) {
    return {
      ...DEFAULT_PRODUCT_SEARCH_QUERY,
      searchTerm: searchTerm ? SKU_SEARCH + searchTerm : ''
    };
  }
  @wire(ProductSearchAdapter, {
    searchQuery: '$_searchQuery'
  })
  updateProductSearch(result) {
    this.searchDisabled = !result?.loaded;
    if (result.data) {
      const productResult = this.getValidResult(result.data, this.searchQuerysearchTerm);
      if (productResult) {
        if (productResult.productSellingModelInformation?.isSubscriptionProduct) {
          this.notifications = subscriptionProductSkuIsNotAvailableInlineErrorMessage;
        } else {
          updateSearchCorrelationId(result.data?.correlationId ?? '');
          dispatchDataEvent(this, createSearchDataEvent(this.searchTerm, undefined, {
            searchAction: 'VIEW',
            searchResultId: result.data?.correlationId,
            searchType: ['product'],
            numberOfResultsRequested: result?.data?.productsPage?.pageSize,
            originalSearchQuery: this.searchTerm,
            correlationId: result.data?.correlationId,
            resultsReturnedQuantity: result?.data?.productsPage?.total
          }));
          const data = {
            ...this.item,
            searchTerm: this.searchQuerysearchTerm,
            productSummaryData: productResult
          };
          this.dispatchUpdateEntriesEvent(data);
          this.notifications = undefined;
        }
      } else {
        if (this._searchQuery) {
          this.notifications = skuIsUnavailableInlineErrorMessage;
        }
      }
    } else if (result.error && this.searchQuerysearchTerm) {
      this._searchQuery = this.updateSearchQuery('');
      const data = {
        ...this.item,
        searchTerm: ''
      };
      this.dispatchUpdateEntriesEvent(data);
      Toast.show({
        label: defaultSearchErrorMessage,
        variant: 'error'
      }, this);
    }
  }
  getValidResult(results, searchTerm) {
    if (!results.productsPage.products?.length || !searchTerm || results.productsPage.products[0].productClass === 'Set') {
      return undefined;
    }
    const productSummaryData = results.productsPage.products[0];
    return sameSku(searchTerm, productSummaryData.fields.StockKeepingUnit?.value) || sameSku(searchTerm, productSummaryData.fields.Name?.value) ? productSummaryData : undefined;
  }
  dispatchUpdateEntriesEvent(data) {
    const minimum = Number(data?.productSummaryData?.purchaseQuantityRule?.minimum);
    if (data.quantity && data.quantity < minimum) {
      data = {
        ...data,
        quantity: minimum
      };
    }
    const detail = {
      updateType: 'UpdateEntry',
      data
    };
    this.dispatchEvent(new CustomEvent('updateentries', {
      bubbles: true,
      composed: true,
      detail
    }));
  }
  handleRemoveItem() {
    const detail = {
      updateType: 'DeleteEntry',
      data: this.item
    };
    this.dispatchEvent(new CustomEvent('updateentries', {
      bubbles: true,
      composed: true,
      detail
    }));
  }
  generateUuid() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16));
  }
  renderedCallback() {
    if ((this.item?.searchTerm?.trim() ?? '') === '' && !this.showProductDetails && this.refs?.searchInput) {
      this.refs.searchInput.classList.remove('slds-has-error');
    }
  }
}