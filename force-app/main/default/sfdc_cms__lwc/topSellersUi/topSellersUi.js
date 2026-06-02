import { api, LightningElement } from 'lwc';
const NAVIGATE_TO_PAGE_EVENT = 'navigatetopage';
export default class TopSellersUi extends LightningElement {
  static renderMode = 'light';
  @api
  headerText;
  @api
  pageSize;
  @api
  browseStep;
  _products = [];
  @api
  get products() {
    return this._products;
  }
  set products(val) {
    this._products = (val || []).map(product => this.productToCard(product));
  }
  productCardConfig = {
    priceConfiguration: {
      showNegotiatedPrice: true,
      showListingPrice: true
    },
    fieldConfiguration: {
      Name: {
        showLabel: false
      }
    },
    layout: 'grid',
    addToCartDisabled: false,
    showProductImage: true
  };
  get config() {
    return this.productCardConfig;
  }
  get carouselItems() {
    const total = this._products.length;
    return this._products.map((product, index) => ({
      id: `${product.id ?? index}`,
      key: `top-sellers-slide-${product.id ?? index}`,
      data: product,
      isActive: index === 0,
      slideTitle: `slide ${index + 1} of ${total}`
    }));
  }
  handleProductClick(event) {
    const itemId = event.detail?.productId;
    if (!itemId) {
      return;
    }
    const product = this._products.find(({
      id
    }) => id === itemId);
    this.dispatchEvent(new CustomEvent(NAVIGATE_TO_PAGE_EVENT, {
      bubbles: true,
      cancelable: true,
      detail: {
        menuItemId: itemId,
        pageReference: product?.pageReference ?? null
      }
    }));
  }
  productToCard(product) {
    const name = product.fields?.Name?.value;
    return {
      id: product.id,
      name,
      pageReference: {
        type: 'standard__recordPage',
        attributes: {
          objectApiName: 'Product2',
          recordId: product.id,
          actionName: 'view',
          urlName: product.urlName
        },
        state: {
          recordName: 'Product2'
        }
      },
      image: {
        alternateText: name,
        url: product.defaultImage ? product.defaultImage.imageUrl : null
      },
      prices: {
        listingPrice: product.prices ? product.prices.listPrice ?? null : null,
        negotiatedPrice: product.prices ? product.prices.unitPrice ?? null : null,
        currencyIsoCode: product.currencyIsoCode
      },
      fields: [{
        name: 'Name',
        label: 'Product Name',
        type: 'STRING',
        value: name,
        tabStoppable: true
      }]
    };
  }
}