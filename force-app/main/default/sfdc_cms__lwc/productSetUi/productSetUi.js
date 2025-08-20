import { LightningElement, api } from 'lwc';
import { Labels } from './labels';
import { getDefaultSelectedProductSellingModel, transformProductDetailData, transformToProductInventoryResult, VARIATION_DROP_DOWN_TYPE, isProductOutOfStock } from './transformers';
import { getProduct, getProductInventoryCollection } from 'commerce/productApi';
export const ADD_ALL_TO_CART_EVENT_NAME = 'addalltocart';
export default class ProductSetUi extends LightningElement {
  static renderMode = 'light';
  _productOrder = [];
  _productSet;
  _productSetItemPrice = new Map();
  _productSetInventories;
  @api
  showAddAllToCartButton = false;
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
  outOfStockText;
  @api
  lastLowestPriceLabel;
  @api
  set productSetInventories(value) {
    this._productSetInventories = value;
  }
  get productSetInventories() {
    return this._productSetInventories;
  }
  get products() {
    return this._productOrder.map((productSetItem, index) => {
      const {
        productSellingModelId,
        quantity,
        isQuantityValid,
        isValid,
        subscriptionTerm,
        product,
        productId
      } = productSetItem;
      const availableQuantity = this.productSetInventories?.[productId]?.details?.availableToOrder ?? null;
      const purchaseQuantityRuleMinimium = product?.purchaseQuantityRule?.minimum ?? 1;
      return {
        id: productId,
        quantity,
        index: `productSetIndex${index}`,
        productSellingModelId,
        subscriptionTerm,
        product,
        availableQuantity,
        isOutOfStock: isProductOutOfStock(availableQuantity, purchaseQuantityRuleMinimium),
        isQuantityValid,
        isValid
      };
    });
  }
  get areProductsValid() {
    return this.products.every(({
      isValid,
      isQuantityValid,
      isOutOfStock
    }) => isValid && isQuantityValid && !isOutOfStock);
  }
  get isAddAllToCartDisabled() {
    return !this.areProductsValid;
  }
  get addAllToCartButtonText() {
    return Labels.addAllToCartButtonText;
  }
  @api
  set productSet(value) {
    this._productSet = value;
    if (value?.items && Array.isArray(value?.items)) {
      this._productOrder = Array.from(value?.items, item => {
        const quantity = parseFloat(item.defaultQuantity);
        const defaultSelectedPSM = getDefaultSelectedProductSellingModel(item.productInfo.productSellingModels);
        return {
          productId: item.productInfo.id,
          isQuantityValid: true,
          quantity: Number.isFinite(quantity) ? quantity : 1,
          isValid: item.productInfo.productClass !== 'VariationParent',
          productClass: item.productInfo.productClass,
          productSellingModelId: defaultSelectedPSM.productSellingModelId,
          subscriptionTerm: defaultSelectedPSM.subscriptionTerm,
          product: this.assignDropdownViewType(transformProductDetailData(item.productInfo))
        };
      });
    }
  }
  get productSet() {
    return this._productSet;
  }
  handleAddAllToCartClick(event) {
    event.stopPropagation();
    const productSetItemQuantity = this._productOrder.reduce((res, item) => {
      const isProductSet = item.productClass === 'Set';
      let key = `${item.productId}`;
      if (item.productSellingModelId) {
        key += `_${item.productSellingModelId}`;
      }
      if (item.productSellingModelId && item.subscriptionTerm) {
        key += `_${item.subscriptionTerm}`;
      }
      return isProductSet ? res : Object.assign(res, {
        [key]: res[key] ? res[key] + (item.quantity ?? 0) : item.quantity
      });
    }, {});
    const payload = Object.entries(productSetItemQuantity).map(([key, value]) => {
      const [productId, productSellingModelId, subscriptionTerm] = key.split('_');
      const price = !productSellingModelId ? this._productSetItemPrice.get(key) : this._productSetItemPrice.get(`${productId}_${productSellingModelId}`);
      return {
        productId: productId,
        quantity: value,
        price: price === undefined || price === null ? null : Number(price),
        productSellingModelId: productSellingModelId,
        subscriptionTerm: subscriptionTerm ? Number(subscriptionTerm) : undefined
      };
    }).filter(item => item.price !== null);
    this.dispatchEvent(new CustomEvent(ADD_ALL_TO_CART_EVENT_NAME, {
      bubbles: true,
      composed: true,
      detail: {
        products: payload
      }
    }));
  }
  handleQuantityChanged(event) {
    this.updateProductOrder(event.currentTarget, item => ({
      ...item,
      quantity: event.detail.quantity
    }));
  }
  handleValidityChanged(event) {
    this.updateProductOrder(event.currentTarget, item => ({
      ...item,
      isQuantityValid: event.detail.isValid
    }));
  }
  handleSubscriptionchanged(event) {
    event.stopPropagation();
    this.updateProductOrder(event.currentTarget, item => ({
      ...item,
      productSellingModelId: event.detail.productSellingModelId,
      subscriptionTerm: event.detail.subscriptionTerm,
      isValid: true
    }));
  }
  async handleVariantChanged(event) {
    event.stopPropagation();
    const {
      variantProductId: productId,
      isValid
    } = event.detail;
    const currentTarget = event.currentTarget;
    if (productId && isValid) {
      const [productResult, inventoryResult] = await Promise.allSettled([getProduct({
        productId
      }), getProductInventoryCollection({
        productIds: [productId]
      })]);
      let product;
      let purchaseQuantityRuleMinimium = 1;
      if (productResult.status === 'fulfilled') {
        product = this.assignDropdownViewType(transformProductDetailData(productResult.value));
        purchaseQuantityRuleMinimium = product?.purchaseQuantityRule?.minimum ?? 1;
      }
      if (product) {
        if (inventoryResult.status === 'fulfilled') {
          const inventoryData = transformToProductInventoryResult(inventoryResult.value);
          this._productSetInventories = {
            ...this._productSetInventories,
            [productId]: inventoryData[productId]
          };
        }
        this.updateProductOrder(currentTarget, () => {
          return {
            productId,
            productClass: 'Variation',
            quantity: purchaseQuantityRuleMinimium,
            isValid,
            isQuantityValid: true,
            product
          };
        });
      }
    } else {
      this.updateProductOrder(currentTarget, item => {
        return {
          ...item,
          isValid: false
        };
      });
    }
  }
  assignDropdownViewType(productDetails) {
    const variationAttributeInfo = productDetails?.variationInfo?.variationAttributeInfo;
    for (const key in variationAttributeInfo) {
      if (Object.prototype.hasOwnProperty.call(variationAttributeInfo, key)) {
        variationAttributeInfo[key].viewType = VARIATION_DROP_DOWN_TYPE;
      }
    }
    return productDetails;
  }
  handleChildProductPriceLoaded(event) {
    event.stopPropagation();
    if (event?.detail?.productId && event?.detail?.price != null) {
      this._productSetItemPrice.set(event.detail.productId, event.detail.price);
      if (event.detail.sellingModelPrices && event.detail.sellingModelPrices.length > 0) {
        event.detail.sellingModelPrices.forEach(psm => {
          this._productSetItemPrice.set(`${event.detail.productId}_${psm.productSellingModelId}`, psm.price);
        });
      }
    }
  }
  updateProductOrder(target, updateFn) {
    const index = target?.dataset.index;
    if (index) {
      const parsedIndex = parseInt(index, 10);
      if (Number.isInteger(parsedIndex) && parsedIndex >= 0) {
        this._productOrder = [...this._productOrder.slice(0, parsedIndex), {
          ...this._productOrder[parsedIndex],
          ...updateFn(this._productOrder[parsedIndex])
        }, ...this._productOrder.slice(parsedIndex + 1)];
      }
    }
  }
}