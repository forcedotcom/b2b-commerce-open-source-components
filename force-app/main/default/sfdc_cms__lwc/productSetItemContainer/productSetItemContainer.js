import { api, LightningElement, wire } from 'lwc';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import { ProductPricingAdapter, ProductTaxAdapter } from 'commerce/productApi';
import { transformToProductTaxResult } from './transformers';
import { handleAddToCartErrorWithToast } from 'site/productAddToCartUtils';
import { AppContextAdapter } from 'commerce/contextApi';
import { addItemToCart } from 'commerce/cartApi';
import { createCartItemAddDataEvent, createClickOnProductDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
import { transformPricingData } from './transformers';
const GUEST_INSUFFICIENT_ACCESS = 'GUEST_INSUFFICIENT_ACCESS';
export const PRODUCT_SET_ITEM_PRICE_EVENT_NAME = 'childproductpriceloaded';
export default class ProductSetItemContainer extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navigationContext;
  @wire(AppContextAdapter)
  appContextEntry;
  @wire(ProductTaxAdapter, {
    productId: '$productId'
  })
  productTaxEntry;
  @wire(ProductPricingAdapter, {
    productId: '$productId',
    allProductSellingModelPrices: true
  })
  wireProductPrice({
    data,
    loaded
  }) {
    if (loaded) {
      if (data) {
        this._productPricing = data;
      } else {
        this._productPricing = {};
      }
    }
    this.initializePriceData();
  }
  _productPricing;
  initializePriceData() {
    const priceData = this._productPricing;
    const productData = this.product;
    if (priceData) {
      if (Object.keys(priceData).length === 0) {
        this._productPriceEntry = priceData;
        return;
      }
      this._productPriceEntry = transformPricingData(productData, priceData, this.quantity);
      if (this.productId) {
        const price = this._productPriceEntry?.negotiatedPrice ? Number(this._productPriceEntry.negotiatedPrice) : null;
        const sellingModelPrices = this._productPriceEntry.productPriceEntries?.filter(item => item.productSellingModelId).map(item => ({
          price: Number(item.unitPrice),
          productSellingModelId: item.productSellingModelId
        }));
        if (!import.meta.env.SSR) {
          this.dispatchEvent(new CustomEvent(PRODUCT_SET_ITEM_PRICE_EVENT_NAME, {
            bubbles: false,
            composed: false,
            detail: {
              productId: this.productId,
              price: price,
              sellingModelPrices: sellingModelPrices
            }
          }));
        }
      }
    } else {
      this._productPriceEntry = undefined;
    }
  }
  isAddToCartDisabled = false;
  @api
  productId;
  @api
  availableQuantity;
  @api
  isOutOfStock = false;
  _quantity;
  @api
  set quantity(qty) {
    this._quantity = qty;
    this.initializePriceData();
  }
  get quantity() {
    return this._quantity;
  }
  @api
  unavailablePriceLabel;
  @api
  taxIncludedLabel;
  @api
  pricingType;
  @api
  showTaxIndication = false;
  @api
  showProductImage = false;
  @api
  showProductDescription = false;
  @api
  quantitySelectorLabel;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  @api
  productSellingModelId;
  @api
  subscriptionTerm;
  get isProductLoaded() {
    return Boolean(this.product);
  }
  @api
  product;
  get taxLocaleType() {
    return this.appContextEntry?.data?.taxType;
  }
  get productTax() {
    const transformedData = transformToProductTaxResult(this.productTaxEntry?.data)[this.productId];
    return transformedData;
  }
  get pageReference() {
    if (!this.productId) {
      return null;
    }
    return {
      type: 'standard__recordPage',
      attributes: {
        objectApiName: 'Product2',
        recordId: this.productId,
        actionName: 'view',
        urlName: this.product?.urlName
      },
      state: {
        recordName: this.product?.fields?.Name ?? 'Product2'
      }
    };
  }
  get itemUrl() {
    const pageReference = this.pageReference;
    return this.navigationContext && pageReference ? generateUrl(this.navigationContext, pageReference) : '';
  }
  @api
  outOfStockText;
  @api
  lastLowestPriceLabel;
  _productPriceEntry;
  get productPricing() {
    return this._productPriceEntry;
  }
  navigateToLogin() {
    this.navigationContext && navigate(this.navigationContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
  handleImageSelected(event) {
    event.stopPropagation();
    const {
      target
    } = event;
    if (target && this.product?.id) {
      dispatchDataEvent(target, createClickOnProductDataEvent(this.product.id));
    }
    const pageReference = this.pageReference;
    if (this.navigationContext && pageReference) {
      navigate(this.navigationContext, pageReference);
    }
  }
  handleAddProductToCart(event) {
    const price = this._productPriceEntry?.negotiatedPrice ? Number(this._productPriceEntry.negotiatedPrice) : null;
    const currencyIsoCode = this._productPriceEntry?.currencyIsoCode || '';
    const {
      quantity,
      productSellingModelId,
      subscriptionTerm
    } = event.detail;
    addItemToCart(this.productId, {
      quantity,
      productSellingModelId,
      subscriptionTerm
    }).then(fulfilled => {
      if (price && fulfilled.cartId) {
        dispatchDataEvent(this, createCartItemAddDataEvent(fulfilled, fulfilled.cartId, currencyIsoCode));
      }
    }).catch(error => {
      if (error?.error?.code === GUEST_INSUFFICIENT_ACCESS) {
        this.navigateToLogin();
        return;
      }
      handleAddToCartErrorWithToast(error, this);
    });
  }
}