import { LightningElement, api } from 'lwc';
import { resolve } from 'experience/resourceResolver';
import { createImageDataMap } from 'experience/picture';
import labels from './labels';
export default class OrderSummaryProductMediaUi extends LightningElement {
  static renderMode = 'light';
  @api
  productMediaList;
  @api
  orderSummaryId;
  @api
  productCount;
  @api
  orderDetailUrl;
  _imageSizes = {
    mobile: 300,
    tablet: 130,
    desktop: 330
  };
  _mobileTileCapacity = 5;
  _desktopTileCapacity = 6;
  get lastTileTextForDesktop() {
    const count = this.productCount - this._desktopTileCapacity;
    return labels.lastTileText.replace('{count}', count.toString());
  }
  get lastTileTextForMobile() {
    const count = this.productCount - this._mobileTileCapacity;
    return labels.lastTileText.replace('{count}', count.toString());
  }
  get displayLastTileInDesktop() {
    return !!this.productCount && this.productCount > this._desktopTileCapacity;
  }
  get displayLastTileInMobile() {
    return !!this.productCount && this.productCount > this._mobileTileCapacity;
  }
  get images() {
    return this.productMediaList?.map(productMedia => this.getImage(productMedia)) ?? [];
  }
  getImage(productMedia) {
    const url = productMedia.url ?? '';
    return {
      available: Boolean(productMedia.url),
      id: productMedia.id,
      alternateText: productMedia.alternateText,
      url: resolve(url, false, {
        width: 460
      }),
      images: createImageDataMap(url, this._imageSizes)
    };
  }
  handleTileClick(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('navigatetoorderdetail', {
      bubbles: true,
      composed: true
    }));
  }
}