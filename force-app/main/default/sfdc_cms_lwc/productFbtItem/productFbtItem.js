import { api, LightningElement } from 'lwc';
import { Labels } from './labels';
import { EVENT } from './constants';
export { EVENT };
export default class ProductFbtItem extends LightningElement {
  static renderMode = 'light';
  @api
  product;
  @api
  showSalePrice = false;
  @api
  showOriginalPrice = false;
  @api
  currencyCode;
  @api
  showProductVariants = false;
  @api
  promotionalPrices;
  @api
  get negotiatedPrice() {
    const negotiatedPrice = Number(this.product?.prices?.unitPrice);
    const promotionalPrice = Number(this.product?.promotionalPrice);
    if (promotionalPrice && negotiatedPrice && promotionalPrice < negotiatedPrice) {
      return promotionalPrice;
    }
    return negotiatedPrice;
  }
  @api
  get originalPrice() {
    return this.product?.prices?.listPrice;
  }
  @api
  get isProductImageVisible() {
    return Boolean(this.product?.defaultImage?.url);
  }
  @api
  get checkBoxComponent() {
    return this.querySelector('lightning-input');
  }
  @api
  get displayAssistiveText() {
    return Boolean(this.showOriginalPrice && this.negotiatedPrice && this.originalPrice);
  }
  @api
  get strikethroughAssistiveText() {
    return Labels.strikethroughAssistiveText;
  }
  @api
  get mainProductText() {
    return Labels.mainProductText;
  }
  @api
  getMinimalQuantity(product) {
    return Number(product?.purchaseQuantityRule?.minimum) || 1;
  }
  @api
  get showQuantityText() {
    return this.getMinimalQuantity(this.product) !== 1;
  }
  @api
  get quantityUnitLabel() {
    return Labels.unitsText.replace('{0}', this.getMinimalQuantity(this.product).toString());
  }
  @api
  get variationAttributes() {
    if (this.product?.variationAttributeSet?.attributes && Array.isArray(this.product?.variationAttributeSet?.attributes) && this.product?.variationAttributeSet?.attributes.length > 0) {
      return this.product.variationAttributeSet.attributes.slice().sort((attr1, attr2) => {
        return attr1.sequence - attr2.sequence;
      }).map(a => ({
        name: a.name,
        value: a.value
      }));
    }
    return [];
  }
  handleToggleCheckbox(event) {
    event.stopPropagation();
    if (this.product?.id) {
      this.dispatchEvent(new CustomEvent(EVENT.TOGGLE_CHECKBOX_EVT, {
        bubbles: true,
        composed: true,
        detail: {
          productId: this.product.id,
          isChecked: this.checkBoxComponent.checked,
          quantity: this.checkBoxComponent.checked ? this.getMinimalQuantity(this.product) : 0
        }
      }));
    }
  }
  handleProductDetailNavigation(event) {
    event.stopPropagation();
    if (this.product?.id) {
      this.dispatchEvent(new CustomEvent(EVENT.VIEW_PRODUCT_EVT, {
        bubbles: true,
        composed: true,
        detail: {
          productId: this.product.id,
          productName: this.product?.name,
          urlName: this.product?.urlName ? this.product?.urlName : undefined
        }
      }));
    }
  }
}