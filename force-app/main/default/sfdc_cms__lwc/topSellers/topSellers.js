import { api, LightningElement, track, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { ProductPricingCollectionAdapter, ProductSearchAdapter } from 'commerce/productApi';
import { AppContextAdapter } from 'commerce/contextApi';
function toFiniteNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}
export default class TopSellers extends LightningElement {
  static renderMode = 'light';
  @track
  _state = {
    results: []
  };
  @track
  _searchQuery = {
    searchTerm: '',
    categoryId: '',
    refinements: [],
    page: 0
  };
  _productIds = [];
  defaultCurrencyCode = 'USD';
  @api
  get headerText() {
    return this._state.headerText;
  }
  set headerText(value) {
    this._state.headerText = value ?? '';
  }
  @api
  get categoryId() {
    return this._searchQuery.categoryId;
  }
  set categoryId(value) {
    this._searchQuery.categoryId = value ?? '';
  }
  @api
  get pageSize() {
    return this._state.pageSize;
  }
  set pageSize(value) {
    this._state.pageSize = toFiniteNumber(value);
  }
  @api
  get browseStep() {
    return this._state.browseStep;
  }
  set browseStep(value) {
    this._state.browseStep = toFiniteNumber(value);
  }
  @wire(ProductSearchAdapter, {
    searchQuery: '$_searchQuery'
  })
  updateProductSearch(result) {
    if (result.data) {
      this._state.results = this._setupProductData(result.data);
      const newProductIds = this._state.results.map(product => product.id).filter(Boolean);
      const sameIds = this._productIds.length === newProductIds.length && this._productIds.every((id, i) => id === newProductIds[i]);
      if (!sameIds) {
        this._productIds = newProductIds;
      }
    } else if (result.error) {
      this._state.results = [];
      this._productIds = [];
    }
  }
  @wire(AppContextAdapter)
  updateAppContext({
    data,
    error,
    loaded
  }) {
    if (data && loaded && !error && data.defaultCurrency) {
      this.defaultCurrencyCode = data?.defaultCurrency;
    } else {
      this.defaultCurrencyCode = 'USD';
    }
  }
  @wire(ProductPricingCollectionAdapter, {
    productIds: '$_productIds'
  })
  updateProductPricing({
    data,
    loaded
  }) {
    if (loaded && data) {
      this.decorateSearchResultsWithPrice(data);
    }
  }
  @wire(NavigationContext)
  navContext;
  _setupProductData(results) {
    return (results.productsPage.products || []).map(item => {
      const defaultImage = Object.assign({}, item.defaultImage, {
        imageUrl: item.defaultImage ? item.defaultImage.url : null,
        mediaContentDocument: null
      });
      return {
        ...item,
        defaultImage,
        cardContentMapping: [{
          name: 'Name',
          showLabel: false,
          label: 'Product Name',
          fontSize: 'medium',
          fontColor: 'rgb(63, 63, 63)'
        }],
        currencyIsoCode: results.productsPage.currencyIsoCode ?? this.defaultCurrencyCode
      };
    });
  }
  handleNavigateToPage(event) {
    if (event.detail.pageReference) {
      navigate(this.navContext, event.detail.pageReference);
    }
  }
  decorateSearchResultsWithPrice(results) {
    if (!results?.pricingLineItemResults || !results.currencyIsoCode) {
      return;
    }
    const pricingData = results.pricingLineItemResults.reduce((acc, item) => {
      acc[item.productId] = {
        ...item
      };
      return acc;
    }, {});
    this._state.results = this._state.results.map(product => {
      if (!product.id) {
        return product;
      }
      return {
        ...product,
        ...(pricingData[product.id] ? {
          prices: pricingData[product.id],
          currencyIsoCode: results.currencyIsoCode
        } : {})
      };
    });
  }
}