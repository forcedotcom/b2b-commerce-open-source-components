import { api, LightningElement } from 'lwc';
import { Labels } from './labels';
import { generateStyleProperties } from 'experience/styling';
import BasePath from '@salesforce/community/basePath';
export const ADD_ITEMS_TO_CART_EVENT_NAME = 'additemstocart';
const OFFSET = 0.8;
const NEAREST_MULTIPLE = 5;
const MIN_CARD_WIDTH = 100;
export default class ProductFrequentlyBoughtTogetherUi extends LightningElement {
  static renderMode = 'light';
  @api
  showPlusIconOnDesktop = false;
  @api
  showSalePrice = false;
  @api
  showOriginalPrice = false;
  @api
  showTotalPrice = false;
  @api
  showProductVariants = false;
  @api
  addToCartButtonText;
  @api
  currencyCode;
  @api
  addToCartButtonVariant;
  @api
  addToCartButtonSize;
  @api
  totalPromotionalPrice;
  get customStyles() {
    return generateStyleProperties({
      '--slds-c-icon-color-foreground-default': `var(--com-c-product-frequently-bought-together-display-icon-color, var(--sds-c-icon-color-foreground-default, #747474))`,
      ...(!this.displayPlusIcon ? {
        visibility: 'hidden'
      } : '')
    });
  }
  _productQuantities = {};
  _products = [];
  _containerWidth;
  @api
  set products(value) {
    if (Array.isArray(value) && value.length > 0) {
      this._products = value.filter(item => item.id);
      this._productQuantities = this._products.reduce((res, item) => {
        return Object.assign(res, {
          [item.id]: Number(item.purchaseQuantityRule?.minimum) || 1
        });
      }, {});
    }
  }
  get products() {
    return this._products;
  }
  @api
  isAddToCartInProgress;
  get isAddToCartDisabled() {
    const hasTotalPromotionalPrice = Boolean(this.totalPromotionalPrice);
    return this.isAddToCartInProgress || !hasTotalPromotionalPrice;
  }
  get displayPlusIcon() {
    return this.showPlusIconOnDesktop;
  }
  get displayTotalPrice() {
    return this.showTotalPrice && !!this.totalPromotionalPrice;
  }
  get labels() {
    return Labels;
  }
  handleSelectItem(event) {
    this._productQuantities = {
      ...this._productQuantities,
      [event.detail.productId]: event?.detail?.quantity
    };
  }
  _containerResizeObserver = null;
  _elementToObserve = null;
  get _cardWidth() {
    if (this._containerWidth) {
      const adjustedWidth = this._containerWidth * OFFSET;
      const totalProducts = this.products.length;
      const cardWidth = Math.floor(adjustedWidth / totalProducts);
      return Math.max(cardWidth - cardWidth % NEAREST_MULTIPLE, MIN_CARD_WIDTH);
    }
    return MIN_CARD_WIDTH;
  }
  get productStyles() {
    return generateStyleProperties([{
      name: '--com-c-product-frequently-bought-together-item-width',
      value: this._cardWidth,
      suffix: 'px'
    }, {
      name: '--com-c-product-frequently-bought-together-item-height',
      value: this._cardWidth,
      suffix: 'px'
    }]);
  }
  handleAddAllToCart(event) {
    event.stopPropagation();
    const payload = [];
    Object.entries(this._productQuantities).forEach(([key, value]) => {
      const targetProduct = this.products.find(p => p.id === key);
      if (value > 0 && targetProduct?.prices?.unitPrice && targetProduct.isChecked) {
        const price = Number(targetProduct?.prices?.unitPrice);
        if (!isNaN(price)) {
          payload.push({
            productId: key,
            quantity: value,
            price: price
          });
        }
      }
    });
    if (payload.length > 0) {
      this.dispatchEvent(new CustomEvent(ADD_ITEMS_TO_CART_EVENT_NAME, {
        bubbles: true,
        composed: true,
        detail: {
          products: payload
        }
      }));
    }
  }
  get addIconPath() {
    return `${BasePath}/assets/icons/add.svg#add`;
  }
  _resizeAnimationFrame = null;
  connectedCallback() {
    this._containerResizeObserver = new ResizeObserver(entries => {
      if (this._resizeAnimationFrame) {
        cancelAnimationFrame(this._resizeAnimationFrame);
      }
      this._resizeAnimationFrame = requestAnimationFrame(() => {
        this._resizeAnimationFrame = null;
        this._containerWidth = entries[0]?.contentRect.width;
      });
    });
  }
  disconnectedCallback() {
    if (this._containerResizeObserver) {
      this._containerResizeObserver.unobserve(this._elementToObserve);
      this._containerResizeObserver = null;
    }
    if (this._resizeAnimationFrame) {
      cancelAnimationFrame(this._resizeAnimationFrame);
      this._resizeAnimationFrame = null;
    }
  }
  renderedCallback() {
    const cardContainer = this.querySelector('.frequently-bought-together');
    if (cardContainer && !this._elementToObserve) {
      this._elementToObserve = cardContainer;
      this._containerResizeObserver?.observe(cardContainer);
    }
  }
}