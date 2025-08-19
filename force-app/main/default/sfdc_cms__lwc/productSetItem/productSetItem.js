import { api, LightningElement } from 'lwc';
import { isVariantSupportedProductClass } from 'site/productVariantSelectorUi';
import { resolve } from 'experience/resourceResolver';
import { addToCartButtonText } from './labels';
import { normalizeQuantityRule } from './utils';
import { getOneTimeProductSellingModelPrice } from 'site/productPricingDetails';
import { calculateNegotiatedPriceForPriceBookEntry } from './transformers';
import { createImageDataMap } from 'experience/picture';
export const QUANTITY_CHANGED_EVENT_NAME = 'quantitychanged';
export const VALIDITY_CHANGED_EVENT_NAME = 'validitychanged';
export const VARIANT_CHANGED_EVENT_NAME = 'variantchanged';
export const IMAGE_SELECTED_EVENT_NAME = 'imageselected';
export const OUT_OF_STOCK_EVENT_NAME = 'outofstock';
export const SUBSCRIPTION_CHANGED_EVENT_NAME = 'subscriptionchanged';
export const ADD_PRODUCT_TO_CART_EVT = 'addproducttocart';
const PRODUCT_FIELDS = [{
  name: 'Name',
  type: 'STRING'
}, {
  name: 'Description',
  type: 'TEXTAREA'
}];
export default class ProductSetItem extends LightningElement {
  static renderMode = 'light';
  imageSizes = {
    mobile: 60,
    tablet: 80,
    desktop: 100
  };
  _quantity;
  _productVariant;
  @api
  productTax;
  @api
  unavailablePriceLabel;
  @api
  taxIncludedLabel;
  @api
  pricingType;
  @api
  showTaxIndication = false;
  @api
  addToCartButtonText;
  @api
  taxLocaleType;
  @api
  productPricing;
  @api
  product;
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
  itemUrl;
  @api
  set quantity(qty) {
    this._quantity = qty;
  }
  get quantity() {
    return this._quantity;
  }
  @api
  outOfStockText;
  @api
  isOutOfStock = false;
  @api
  lowestUnitPriceLabel;
  @api
  availableQuantity;
  @api
  productSellingModelPriceType;
  @api
  productSellingModelId;
  @api
  subscriptionTerm;
  _imageAltText;
  get selectedProductSellingModel() {
    const subscriptionTerm = this.subscriptionTerm;
    const productSellingModelId = this.productSellingModelId;
    const sellingModel = this.product?.productSellingModels?.find(productSellingModel => productSellingModel.id === productSellingModelId);
    let selectedProductPriceEntry = this.productPricing?.productPriceEntries?.find(productPriceEntry => productPriceEntry.productSellingModelId === productSellingModelId);
    if (!sellingModel || !selectedProductPriceEntry) {
      return undefined;
    }
    selectedProductPriceEntry = {
      ...selectedProductPriceEntry,
      negotiatedPrice: calculateNegotiatedPriceForPriceBookEntry(selectedProductPriceEntry, this.quantity, subscriptionTerm)
    };
    return {
      detail: sellingModel,
      price: selectedProductPriceEntry,
      subscriptionTerm,
      productSellingModelId: productSellingModelId
    };
  }
  get isProductDataAvailable() {
    return this.product !== undefined && this.product !== null;
  }
  get isProductPricingDataAvailable() {
    return this.productPricing !== undefined && this.productPricing !== null;
  }
  get _displayProductSellingOptions() {
    return this.isDisplayConditionSatisfied() && Boolean(this.product?.productSellingModels?.length);
  }
  get displayPricing() {
    return this.isDisplayConditionSatisfied() && (Boolean(this.productSellingModelPriceType) || !this.selectedProductSellingModel);
  }
  isDisplayConditionSatisfied() {
    return this.productVariant?.isValid !== false && this.product?.productClass !== 'VariationParent' && this.product?.productClass !== 'Set' && this.isProductDataAvailable && this.isProductPricingDataAvailable;
  }
  get _oneTimeProductSellingModelPrice() {
    return getOneTimeProductSellingModelPrice(this.product?.productSellingModels, this.productPricing?.productPriceEntries);
  }
  get isProductSet() {
    return this.product?.productClass === 'Set';
  }
  get isDisplayable() {
    return isVariantSupportedProductClass(this.product?.productClass);
  }
  get shouldReserveSpace() {
    return !this.isProductPricingDataAvailable && this.product?.productClass !== 'VariationParent' && this.product?.productClass !== 'Set' && !this.selectedProductSellingModel && Boolean(!this.productSellingModelPriceType);
  }
  get productId() {
    return this.product?.id;
  }
  get addToCartButtonLabel() {
    return this.addToCartButtonText || addToCartButtonText;
  }
  get productVariant() {
    return this._productVariant;
  }
  get imageAltText() {
    return this._imageAltText;
  }
  get imageUrl() {
    const productImageMediaData = this.product?.mediaGroups?.filter(group => group.usageType === 'Listing')?.[0]?.mediaItems?.[0];
    this._imageAltText = productImageMediaData?.alternateText || undefined;
    return resolve(productImageMediaData?.thumbnailUrl || productImageMediaData?.url || '');
  }
  get productImage() {
    return createImageDataMap(this.imageUrl, this.imageSizes);
  }
  get isProductImageVisible() {
    return Boolean(this.showProductImage && this.hasProductImage);
  }
  get hasProductImage() {
    return !!this.imageUrl && this.imageUrl.trim() !== '';
  }
  get productClass() {
    return this.product?.productClass;
  }
  get taxRate() {
    const taxOrNaN = Number(this.productTax?.taxPolicies?.[0]?.taxRatePercentage);
    return Number.isFinite(taxOrNaN) ? taxOrNaN : undefined;
  }
  get isAddToCartDisabled() {
    return this.productVariant && !this.productVariant.isValid || this.productClass === 'VariationParent' || !this.productPricing || Object.keys(this.productPricing).length === 0;
  }
  get quantityRule() {
    return normalizeQuantityRule(this.product?.purchaseQuantityRule);
  }
  get productFieldsData() {
    const productFields = this.product?.fields ?? {};
    return PRODUCT_FIELDS.reduce((fields, field) => {
      const fieldValue = this.showProductDescription || field.name !== 'Description' ? productFields[field.name] : undefined;
      if (fieldValue?.length) {
        fields.push({
          value: fieldValue,
          name: '',
          type: field.type
        });
      }
      return fields;
    }, []);
  }
  get productName() {
    return this.product?.fields?.Name;
  }
  handleQuantityChanged(event) {
    event.stopPropagation();
    this._quantity = event.detail.value;
    if (this.productId && typeof this._quantity === 'number') {
      this.dispatchEvent(new CustomEvent(QUANTITY_CHANGED_EVENT_NAME, {
        bubbles: true,
        composed: true,
        detail: {
          quantity: this._quantity,
          productId: this.productId
        }
      }));
    }
  }
  handleSubscriptionchanged(event) {
    event.stopPropagation();
    if (this.productId) {
      const {
        productSellingModelId,
        subscriptionTerm
      } = event.detail;
      this.dispatchEvent(new CustomEvent(SUBSCRIPTION_CHANGED_EVENT_NAME, {
        bubbles: true,
        composed: true,
        detail: {
          productSellingModelId: productSellingModelId,
          subscriptionTerm: subscriptionTerm,
          productId: this.productId
        }
      }));
    }
  }
  handleValidityChanged(event) {
    event.stopPropagation();
    if (this.productId) {
      this.dispatchEvent(new CustomEvent(VALIDITY_CHANGED_EVENT_NAME, {
        bubbles: true,
        composed: true,
        detail: {
          isValid: event.detail.isValid,
          productId: this.productId
        }
      }));
    }
  }
  handleVariantChanged(event) {
    event.stopPropagation();
    this._productVariant = {
      isValid: event.detail.isValid,
      options: event.detail.options
    };
    this.dispatchEvent(new CustomEvent(VARIANT_CHANGED_EVENT_NAME, {
      bubbles: true,
      composed: true,
      detail: {
        variantProductId: event.detail.productId,
        isValid: event.detail.isValid
      }
    }));
  }
  handleAddProductToCart(event) {
    event.stopPropagation();
    const quantity = event.detail.quantity;
    this.dispatchEvent(new CustomEvent(ADD_PRODUCT_TO_CART_EVT, {
      bubbles: true,
      composed: true,
      detail: {
        quantity,
        productSellingModelId: this.productSellingModelId,
        subscriptionTerm: this.subscriptionTerm
      }
    }));
  }
  handleImageSelected(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dispatchEvent(new CustomEvent(IMAGE_SELECTED_EVENT_NAME, {
      bubbles: true,
      composed: true
    }));
  }
}