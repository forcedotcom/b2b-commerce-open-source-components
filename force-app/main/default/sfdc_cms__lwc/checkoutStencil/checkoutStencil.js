import { api, LightningElement } from 'lwc';
import defaultStencil from './checkoutStencilTemplates/defaultStencil.html';
import defaultEdit from './checkoutStencilTemplates/defaultEdit.html';
import shippingAddress from './checkoutStencilTemplates/shippingAddress.html';
import shippingAddressPicker from './checkoutStencilTemplates/shippingAddressPicker.html';
import shippingAddressEdit from './checkoutStencilTemplates/shippingAddressEdit.html';
import shippingMethod from './checkoutStencilTemplates/shippingMethod.html';
import payment from './checkoutStencilTemplates/payment.html';
import contactInfoEdit from './checkoutStencilTemplates/contactInfoEdit.html';
import cartItems from './checkoutStencilTemplates/cartItems.html';
import { CheckoutStencilType } from './checkoutStencilType';
export { CheckoutStencilType };
const COUNT_DEFAULTS = {
  item: 5
};
export default class CheckoutStencil extends LightningElement {
  static renderMode = 'light';
  _type = CheckoutStencilType.DEFAULT_STENCIL;
  _itemCount = COUNT_DEFAULTS.item;
  @api
  stencilType = CheckoutStencilType.DEFAULT_STENCIL;
  @api
  set itemCount(value) {
    this._itemCount = Math.floor(value);
  }
  get itemCount() {
    return this._itemCount;
  }
  get items() {
    return this.createArrayFromCount(this._itemCount);
  }
  createArrayFromCount(count) {
    return new Array(count).fill(null).map((element, index) => {
      return {
        key: this.generateKey(index)
      };
    });
  }
  generateKey(index) {
    return this.stencilType + '-' + index;
  }
  render() {
    switch (this.stencilType) {
      case CheckoutStencilType.DEFAULT_EDIT:
        return defaultEdit;
      case CheckoutStencilType.SHIPPING_ADDRESS:
        return shippingAddress;
      case CheckoutStencilType.SHIPPING_ADDRESS_PICKER:
        return shippingAddressPicker;
      case CheckoutStencilType.SHIPPING_METHOD:
        return shippingMethod;
      case CheckoutStencilType.SHIPPING_ADDRESS_EDIT:
        return shippingAddressEdit;
      case CheckoutStencilType.PAYMENT:
        return payment;
      case CheckoutStencilType.CONTACT_INFO_EDIT:
        return contactInfoEdit;
      case CheckoutStencilType.CART_ITEMS:
        return cartItems;
      default:
        return defaultStencil;
    }
  }
}