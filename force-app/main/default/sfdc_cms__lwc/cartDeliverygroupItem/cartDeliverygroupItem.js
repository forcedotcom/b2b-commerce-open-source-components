import { LightningElement, api } from 'lwc';
import { LABELS } from './labels';
import { CHANGE_DELIVERY_GROUP_EVENT, CHANGE_QUANTITY_EVENT, DELETE_CART_ITEM_EVENT } from './constants';
import { ITEM_TYPES } from 'site/cartItemDropdown';
import { SPLIT_CART_ITEM_EVENT } from './constants';
export { CHANGE_DELIVERY_GROUP_EVENT, CHANGE_QUANTITY_EVENT, DELETE_CART_ITEM_EVENT } from './constants';
export { SPLIT_CART_ITEM_EVENT };
export default class CartDeliverygroupItem extends LightningElement {
  static renderMode = 'light';
  defaultDeliveryGroup;
  _deliveryGroups;
  _itemType = ITEM_TYPES.DELIVERY_GROUP;
  @api
  rawInternationalizationData;
  @api
  addresses;
  @api
  cartItemId;
  @api
  deliveryGroupId;
  @api
  get deliveryGroups() {
    return this._deliveryGroups;
  }
  set deliveryGroups(value) {
    this._deliveryGroups = value;
  }
  _quantity;
  @api
  get quantity() {
    return this._quantity;
  }
  set quantity(value) {
    this._quantity = value;
  }
  get isSplittable() {
    return this.subType !== 'Bonus' && this.quantity ? this.quantity > 1 : false;
  }
  get showIncreaseQuantityInfoLabel() {
    return !this.isSplittable && this.subType !== 'Bonus';
  }
  @api
  product;
  @api
  subType;
  get disableQuantitySelector() {
    return this.subType === 'Bonus';
  }
  get showRemoveButton() {
    return this.subType !== 'Bonus';
  }
  handleSplitCartItem() {
    const productId = this.product?.productDetails.productId;
    this.dispatchEvent(new CustomEvent(SPLIT_CART_ITEM_EVENT, {
      detail: {
        productId,
        cartItemId: this.cartItemId,
        deliveryGroupId: this.deliveryGroupId
      },
      bubbles: true
    }));
  }
  get labels() {
    return LABELS;
  }
  handleQtyChanged(event) {
    if (event?.detail?.isValid) {
      const quantity = event.detail?.value;
      this.dispatchEvent(new CustomEvent(CHANGE_QUANTITY_EVENT, {
        detail: {
          cartItemId: this.cartItemId,
          quantity
        },
        composed: true,
        bubbles: true
      }));
    }
  }
  handleDeliveryGroupChanged(event) {
    const selectedDeliveryGroupId = event.detail.deliveryGroupId;
    this.dispatchEvent(new CustomEvent(CHANGE_DELIVERY_GROUP_EVENT, {
      detail: {
        cartItemId: this.cartItemId,
        deliveryGroupId: selectedDeliveryGroupId
      },
      bubbles: true
    }));
  }
  @api
  showEmptySplitShipmentModal = false;
  handleDeleteCartItem() {
    this.dispatchEvent(new CustomEvent(DELETE_CART_ITEM_EVENT, {
      detail: {
        cartItemId: this.cartItemId
      },
      bubbles: true
    }));
  }
}