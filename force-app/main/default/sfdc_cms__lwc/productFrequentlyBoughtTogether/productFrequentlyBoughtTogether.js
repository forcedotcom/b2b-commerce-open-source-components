import { api, LightningElement, wire } from 'lwc';
import { ProductInventoryLevelsAdapter, ProductRecommendationsAdapter, ProductAdapter, ProductPricingAdapter } from 'commerce/productApi';
import { navigate, NavigationContext } from 'lightning/navigation';
import { handleAddToCartErrorWithToast } from 'site/productAddToCartUtils';
import { transformToProductInventoryResult, transformProductDetailData, transformPricingData } from './transformers';
import { PromotionApplicableAdapter } from 'commerce/promotionApi';
import { transformToAlignItemsProperty, transformToProductRecommendation, isProductAvailable } from './productFrequentlyBoughtTogetherUtils';
import { cartItemsAdd, toCommerceError } from 'commerce/checkoutCartApi';
import { createCartItemAddDataEvent, createClickOnProductDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
import { generateTextFormatStyles } from 'experience/styling';
import { generateStyleProperties, generateTextFontSize } from 'experience/styling';
import { transformPurchaseQuantityRule } from './transformers';
const GUEST_INSUFFICIENT_ACCESS = 'GUEST_INSUFFICIENT_ACCESS';
const CART_ITEM_ID_PREFIX = 'cart-item-id-';
const CART_ITEM_TYPE = 'Product';
export default class ProductFrequentlyBoughtTogether extends LightningElement {
  static renderMode = 'light';
  _salesPriceTextDecoration;
  _salesPriceTextDecorationObject;
  _originalPriceTextDecoration;
  _originalPriceTextDecorationObject;
  @api
  productId;
  @api
  recommendationCount;
  @api
  showProductVariants;
  @api
  showPlusIconOnDesktop;
  @api
  iconColor;
  @api
  showSalePrice;
  @api
  salePriceTextSize;
  @api
  salePriceTextColor;
  @api
  get salePriceTextDecoration() {
    return this._salesPriceTextDecoration;
  }
  set salePriceTextDecoration(value) {
    this._salesPriceTextDecoration = value;
    if (value) {
      this._salesPriceTextDecorationObject = JSON.parse(value);
    }
  }
  @api
  showOriginalPrice;
  @api
  originalPriceTextSize;
  @api
  originalPriceTextColor;
  @api
  get originalPriceTextDecoration() {
    return this._originalPriceTextDecoration;
  }
  set originalPriceTextDecoration(value) {
    this._originalPriceTextDecoration = value;
    if (value) {
      this._originalPriceTextDecorationObject = JSON.parse(value);
    }
  }
  @api
  sectionContentAlignment;
  @api
  cardContentAlignment;
  @api
  showTotalPrice;
  @api
  buttonLabel;
  @api
  buttonStyle;
  @api
  buttonSize;
  product;
  productPricing;
  availableQuantityToOrderForMainProduct;
  promotionalPrices = new Map();
  get customStyles() {
    const {
      weight: salePricePriceWeight,
      style: salePricePriceStyle,
      decoration: salePricePriceDecoration
    } = generateTextFormatStyles(this._salesPriceTextDecorationObject);
    const {
      weight: originalPriceWeight,
      style: originalPriceStyle,
      decoration: originalPriceDecoration
    } = generateTextFormatStyles(this._originalPriceTextDecorationObject);
    return generateStyleProperties({
      '--com-c-product-frequently-bought-together-item-sale-price-font-size': generateTextFontSize(this.salePriceTextSize),
      '--com-c-product-frequently-bought-together-item-sale-price-font-weight': salePricePriceWeight ?? '',
      '--com-c-product-frequently-bought-together-item-sale-price-font-style': salePricePriceStyle ?? '',
      '--com-c-product-frequently-bought-together-item-sale-price-text-decoration': salePricePriceDecoration ?? '',
      '--com-c-product-frequently-bought-together-item-sale-price-label-color': this.salePriceTextColor,
      '--com-c-product-frequently-bought-together-item-original-price-font-weight': originalPriceWeight ?? '',
      '--com-c-product-frequently-bought-together-item-original-price-font-size': generateTextFontSize(this.originalPriceTextSize),
      '--com-c-product-frequently-bought-together-item-original-price-font-style': originalPriceStyle ?? '',
      '--com-c-product-frequently-bought-together-item-original-price-text-decoration': originalPriceDecoration ?? '',
      '--com-c-product-frequently-bought-together-item-original-price-label-color': this.originalPriceTextColor,
      '--com-c-product-frequently-bought-together-display-icon-color': this.iconColor,
      '--com-c-product-frequently-bought-together-section-content-alignment': transformToAlignItemsProperty(this.sectionContentAlignment),
      '--com-c-product-frequently-bought-together-card-content-alignment': transformToAlignItemsProperty(this.cardContentAlignment)
    });
  }
  currencyIsoCode;
  totalPromotionalPrice;
  frequentlyBoughtTogetherProductsData = [];
  isChecked = true;
  isAddToCartInProgress = false;
  recordIds = [];
  get isDataAvailable() {
    return Boolean(this.mainProduct) && this.frequentlyBoughtTogetherProductsData?.length > 0;
  }
  get productIds() {
    return this.productId ? [this.productId] : [];
  }
  get promotionRequestData() {
    let requestObject;
    const products = this.products;
    if (products && products.length > 0) {
      const cartItems = products.filter(product => product.isChecked).map((product, index) => ({
        id: CART_ITEM_ID_PREFIX + index,
        type: CART_ITEM_TYPE,
        product2Id: product.id,
        quantity: String(product.purchaseQuantityRule?.minimum || '1')
      }));
      requestObject = {
        currencyIsoCode: this.currencyIsoCode ?? undefined,
        cartItems: cartItems
      };
      if (!cartItems.length) {
        this.totalPromotionalPrice = undefined;
      }
    }
    return requestObject;
  }
  get products() {
    const mainProduct = this.mainProduct;
    const allProducts = mainProduct && this.frequentlyBoughtTogetherProductsData.length ? [mainProduct, ...this.frequentlyBoughtTogetherProductsData] : [];
    return allProducts.map(product => ({
      ...product,
      promotionalPrice: product.id ? this.promotionalPrices.get(product.id) : undefined
    }));
  }
  get mainProduct() {
    if (this.productPricing?.unitPrice && this.product?.id) {
      return transformToProductRecommendation(this.product, this.productPricing, this.availableQuantityToOrderForMainProduct, this.isChecked, true);
    }
    return undefined;
  }
  handleSelectItem(event) {
    const {
      productId,
      isChecked
    } = event.detail;
    if (productId === this.productId) {
      this.isChecked = isChecked;
      return;
    }
    this.frequentlyBoughtTogetherProductsData = this.frequentlyBoughtTogetherProductsData.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          isChecked
        };
      }
      return product;
    });
  }
  @wire(ProductAdapter, {
    productId: '$productId'
  })
  wireProduct({
    data,
    loaded
  }) {
    this.product = loaded ? transformProductDetailData(data) || {} : undefined;
  }
  @wire(ProductPricingAdapter, {
    productId: '$productId',
    allProductSellingModelPrices: true
  })
  wireProductPrice({
    data,
    loaded
  }) {
    let pricingData = data;
    if (data) {
      pricingData = transformPricingData(this.product, data, undefined);
    }
    this.productPricing = loaded ? pricingData || {} : undefined;
  }
  @wire(ProductRecommendationsAdapter, {
    anchorValues: '$productIds',
    recommender: 'CustomersWhoBoughtAlsoBought'
  })
  wireRecommendations({
    data
  }) {
    if (data?.productPage?.products) {
      const additionalRecommendedProductsCount = this.recommendationCount && this.recommendationCount - 1;
      this.frequentlyBoughtTogetherProductsData = data.productPage.products.slice(0, additionalRecommendedProductsCount).map(product => ({
        ...product,
        isChecked: true,
        purchaseQuantityRule: transformPurchaseQuantityRule(product.purchaseQuantityRule)
      }));
      this.currencyIsoCode = data.productPage.currencyIsoCode;
      if (Array.isArray(this.frequentlyBoughtTogetherProductsData)) {
        this.recordIds = [this.productId, ...this.frequentlyBoughtTogetherProductsData.map(product => String(product.id))];
      }
    }
  }
  @wire(ProductInventoryLevelsAdapter, {
    productIds: '$recordIds'
  })
  wireProductInventory({
    data
  }) {
    if (data) {
      const inventoryData = transformToProductInventoryResult(data);
      this.frequentlyBoughtTogetherProductsData = this.frequentlyBoughtTogetherProductsData.filter(product => {
        const availableToOrder = inventoryData[product.id]?.details?.availableToOrder;
        return product.id && isProductAvailable(availableToOrder, product);
      });
      this.availableQuantityToOrderForMainProduct = inventoryData[this.productId]?.details?.availableToOrder;
    }
  }
  @wire(PromotionApplicableAdapter, {
    cart: '$promotionRequestData'
  })
  wirePromotions({
    data
  }) {
    if (data?.cart?.cartItems?.length) {
      data.cart.cartItems.forEach(cartItem => {
        this.promotionalPrices.set(cartItem.product2Id, cartItem.totalNetAmount);
      });
      this.totalPromotionalPrice = data.cart.totalNetAmount;
    }
  }
  @wire(NavigationContext)
  navigationContext;
  handleProductDetailNavigation(event) {
    event.stopPropagation();
    const {
      target
    } = event;
    if (event.detail.productId) {
      if (target) {
        dispatchDataEvent(target, createClickOnProductDataEvent(event.detail.productId));
      }
      navigate(this.navigationContext, {
        type: 'standard__recordPage',
        attributes: {
          objectApiName: 'Product2',
          recordId: event.detail.productId,
          actionName: 'view',
          urlName: event.detail.urlName
        },
        state: {
          recordName: event.detail.productName ?? 'Product2'
        }
      });
    }
  }
  navigateToLogin() {
    navigate(this.navigationContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
  handleAddItemsToCart(event) {
    event.stopPropagation();
    const {
      detail,
      target
    } = event;
    const {
      products
    } = detail;
    const cartPayload = products?.reduce((acc, product) => {
      return Object.assign(acc, {
        [product.productId]: product.quantity
      });
    }, {});
    const currencyIsoCode = this.productPricing?.currencyIsoCode || '';
    this.isAddToCartInProgress = true;
    cartItemsAdd(cartPayload).then(fulfilled => {
      if (Array.isArray(products) && products.length > 0 && !fulfilled.hasErrors) {
        fulfilled.results.forEach(item => {
          const cartItemData = item.result;
          if (cartItemData.listPrice && cartItemData.cartId) {
            dispatchDataEvent(target, createCartItemAddDataEvent(cartItemData, cartItemData.cartId, currencyIsoCode));
          }
        });
      }
    }).catch(error => {
      if (toCommerceError(error).code === GUEST_INSUFFICIENT_ACCESS) {
        this.navigateToLogin();
        return;
      }
      handleAddToCartErrorWithToast(toCommerceError(error), this);
    }).finally(() => {
      this.isAddToCartInProgress = false;
    });
  }
}