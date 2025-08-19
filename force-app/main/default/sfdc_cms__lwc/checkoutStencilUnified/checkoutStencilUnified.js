import { api, LightningElement } from 'lwc';
import defaultStencil from './stencilTemplates/defaultStencil.html';
import defaultEdit from './stencilTemplates/defaultEdit.html';
import shippingAddress from './stencilTemplates/shippingAddress.html';
import shippingAddressPicker from './stencilTemplates/shippingAddressPicker.html';
import shippingAddressEdit from './stencilTemplates/shippingAddressEdit.html';
import shippingMethod from './stencilTemplates/shippingMethod.html';
import payment from './stencilTemplates/payment.html';
import contactInfoEdit from './stencilTemplates/contactInfoEdit.html';
import cartItems from './stencilTemplates/cartItems.html';
import { StencilType } from './stencilType';
export { StencilType };
const COUNT_DEFAULTS = {
  item: 5
};
export default class CheckoutStencilUnified extends LightningElement {
  static renderMode = 'light';
  _type = StencilType.DEFAULT_STENCIL;
  _itemCount = COUNT_DEFAULTS.item;
  @api
  stencilType = StencilType.DEFAULT_STENCIL;
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
      case StencilType.DEFAULT_EDIT:
        return defaultEdit;
      case StencilType.SHIPPING_ADDRESS:
        return shippingAddress;
      case StencilType.SHIPPING_ADDRESS_PICKER:
        return shippingAddressPicker;
      case StencilType.SHIPPING_ADDRESS_EDIT:
        return shippingAddressEdit;
      case StencilType.SHIPPING_METHOD:
        return shippingMethod;
      case StencilType.PAYMENT:
        return payment;
      case StencilType.CONTACT_INFO_EDIT:
        return contactInfoEdit;
      case StencilType.CART_ITEMS:
        return cartItems;
      default:
        return defaultStencil;
    }
  }
}