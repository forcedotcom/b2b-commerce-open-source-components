import { LightningElement, api, wire } from 'lwc';
import { ProductChildrenAdapter } from 'commerce/productApi';
import { ProductInventoryLevelsAdapter } from 'commerce/productApi';
import { handleAddToCartErrorWithToast } from 'site/productAddToCartUtils';
import { navigate, NavigationContext } from 'lightning/navigation';
import { cartItemsAdd, toCommerceError } from 'commerce/checkoutCartApi';
import { createCartItemAddDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
import { generateStyleProperties, generateTextFontSize } from 'experience/styling';
import { transformToProductInventoryResult } from './transformers';
const GUEST_INSUFFICIENT_ACCESS = 'GUEST_INSUFFICIENT_ACCESS';
export const CHILDREN_API_DEFAULT_PAGE_LIMIT = 20;
/**
 * @slot lifeTimeLabel
 * @slot subscriptionLabel
 */
export default class ProductSet extends LightningElement {
  static renderMode = 'light';
  @wire(ProductChildrenAdapter, {
    productId: '$productId',
    mediaGroups: ['productListImage'],
    pageSize: CHILDREN_API_DEFAULT_PAGE_LIMIT,
    includeProductSellingModels: true
  })
  productSetEntry;
  @wire(ProductInventoryLevelsAdapter, {
    productIds: '$_productIds'
  })
  wireProductInventory({
    data,
    loaded
  }) {
    if (loaded) {
      this._childProductInventories = transformToProductInventoryResult(data);
    }
  }
  get _productIds() {
    return this.productSet?.items?.map(product => product.productInfo.id) ?? [];
  }
  _childProductInventories = {};
  @wire(NavigationContext)
  navContext;
  @api
  product;
  @api
  currencyIsoCode;
  @api
  productId;
  @api
  showAddAllToCartButton = false;
  @api
  slot1PriceTextColor;
  @api
  slot1PriceTextSize;
  @api
  slot1PriceLabel;
  @api
  slot2PriceTextColor;
  @api
  slot2PriceTextSize;
  @api
  slot2PriceLabel;
  @api
  slot3PriceTextColor;
  @api
  slot3PriceTextSize;
  @api
  slot3PriceLabel;
  @api
  promotionalMessageTextColor;
  @api
  promotionalMessageTextSize;
  @api
  pricingType;
  @api
  unavailablePriceLabel;
  @api
  showTaxIndication;
  @api
  lastLowestPriceLabelSize;
  @api
  lastLowestPriceLabelColor;
  @api
  lastLowestPriceLabel;
  @api
  taxIncludedLabel;
  @api
  taxLabelSize;
  @api
  taxLabelColor;
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
  get isProductSet() {
    return this.product?.productClass === 'Set';
  }
  get productSet() {
    return this.productSetEntry?.data;
  }
  get isProductSetLoaded() {
    return Boolean(this.productSetEntry?.loaded);
  }
  @api
  outOfStockText;
  navigateToLogin() {
    navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
  handleAddAllToCart(event) {
    event.stopPropagation();
    const {
      detail,
      target
    } = event;
    const {
      products
    } = detail;
    const cartPayload = products.map(product => {
      const {
        productId,
        quantity,
        productSellingModelId,
        subscriptionTerm
      } = product;
      return {
        productId,
        quantity,
        productSellingModelId,
        subscriptionTerm
      };
    });
    const currencyIsoCode = this.currencyIsoCode || '';
    if (Array.isArray(products) && products.length > 0) {
      cartItemsAdd(cartPayload).then(fulfilled => {
        if (!fulfilled.hasErrors) {
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
      });
    }
  }
  get priceStyles() {
    return generateStyleProperties({
      '--com-c-product-pricing-details-lowest-unit-price-label-color': this.lastLowestPriceLabelColor || 'initial',
      '--com-c-product-pricing-details-lowest-unit-price-label-size': generateTextFontSize(this.lastLowestPriceLabelSize),
      '--com-c-product-pricing-details-tax-info-label-color': this.taxLabelColor || 'initial',
      '--com-c-product-pricing-details-tax-info-label-size': generateTextFontSize(this.taxLabelSize),
      '--com-c-product-pricing-details-slot-3-price-label-color': this.slot3PriceTextColor || 'initial',
      '--com-c-product-pricing-details-slot-3-price-label-size': generateTextFontSize(this.slot3PriceTextSize),
      '--com-c-product-pricing-details-slot-2-price-label-color': this.slot2PriceTextColor || 'initial',
      '--com-c-product-pricing-details-slot-2-price-label-size': generateTextFontSize(this.slot2PriceTextSize),
      '--com-c-product-pricing-details-slot-1-price-label-color': this.slot1PriceTextColor || 'initial',
      '--com-c-product-pricing-details-slot-1-price-label-size': generateTextFontSize(this.slot1PriceTextSize),
      '--com-c-product-pricing-details-promotional-message-color': this.promotionalMessageTextColor || 'initial',
      '--com-c-product-pricing-details-promotional-message-label-size': generateTextFontSize(this.promotionalMessageTextSize)
    });
  }
  renderedCallback() {
    this.classList.toggle('slds-hide', !this.isProductSet);
  }
}