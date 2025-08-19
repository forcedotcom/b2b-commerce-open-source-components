import { api, LightningElement } from 'lwc';
const DEFAULT_ITEM_COUNT = 3;
export default class ProductStencil extends LightningElement {
  static renderMode = 'light';
  _itemCount = DEFAULT_ITEM_COUNT;
  @api
  set itemCount(value) {
    this._itemCount = Math.floor(value);
  }
  get itemCount() {
    return this._itemCount;
  }
  get items() {
    return this.createArrayFromCount(this.itemCount);
  }
  createArrayFromCount(count) {
    return new Array(count).fill(null).map((element, index) => {
      return {
        key: this.generateKey(index)
      };
    });
  }
  generateKey(index) {
    return `stencil-${index}`;
  }
}