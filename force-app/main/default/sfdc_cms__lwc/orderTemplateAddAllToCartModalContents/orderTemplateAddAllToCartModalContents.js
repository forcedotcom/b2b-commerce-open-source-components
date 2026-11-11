import { LightningElement, api } from 'lwc';
import BasePath from '@salesforce/community/basePath';
import { generateModalSubheading } from './textGenerator';
import LABELS from './labels';
import { resolve } from 'experience/resourceResolver';
import { createImageDataMap } from 'experience/picture';
const generateClipPathId = (() => {
  let lastId = 0;
  return () => `order-template-add-all-clip-${crypto?.randomUUID?.() || String(++lastId)}`;
})();
export default class OrderTemplateAddAllToCartModalContents extends LightningElement {
  static renderMode = 'light';
  @api
  succeededProductCount;
  @api
  failedProductCount;
  @api
  failedItems;
  @api
  errors = false;
  @api
  loading = false;
  _imageSizes = {
    mobile: 300,
    tablet: 130,
    desktop: 330
  };
  get _unavailableItemsText() {
    return LABELS.unavailableItems;
  }
  get _modalSubheading() {
    if (this.errors) {
      return LABELS.errorSubheading;
    } else if (!this.failedProductCount) {
      return LABELS.successSubheading;
    }
    return generateModalSubheading(this.succeededProductCount, this.failedProductCount);
  }
  get _showSubheadings() {
    return Boolean(this.failedProductCount) && !this.errors;
  }
  get _spinnerHelpText() {
    return LABELS.spinnerText;
  }
  get _isLoading() {
    return this.loading;
  }
  get _unavailableProducts() {
    return Boolean(this.failedItems?.length);
  }
  get _showIcon() {
    return !this.failedProductCount || this.errors;
  }
  get _getCustomIcon() {
    return this.errors ? `${BasePath}/assets/icons/info-filled.svg#info-filled` : `${BasePath}/assets/icons/check-filled.svg#check-filled`;
  }
  get _iconClassGenerator() {
    return `slds-align_absolute-center slds-is-relative ${this.errors ? 'error-icon' : 'success-icon'}`;
  }
  get _subHeadingBodyContainerClassGenerator() {
    return `sub-heading-body-container ${this.failedItems?.length ? 'slds-m-vertical_small' : 'slds-m-vertical_x-large'}`;
  }
  get _ariaLiveMessage() {
    if (this._isLoading) {
      return '';
    }
    return this._modalSubheading || '';
  }
  getImage(url, alternateText) {
    return {
      available: Boolean(url),
      alternateText,
      url: resolve(url, false, {
        width: 460
      }),
      images: createImageDataMap(url, this._imageSizes)
    };
  }
  get _failedProductList() {
    return this.failedItems?.map(item => {
      const cartItem = item.cartItem;
      const productDetails = cartItem?.productDetails;
      const thumbnailUrl = productDetails?.thumbnailImage?.url ?? '';
      const alternateText = productDetails?.thumbnailImage?.alternateText ?? null;
      const image = thumbnailUrl ? this.getImage(thumbnailUrl, alternateText) : undefined;
      const clipPathId = generateClipPathId();
      return {
        productId: cartItem?.productId,
        productName: productDetails?.name ?? cartItem?.name,
        productSKU: productDetails?.sku,
        errorMessage: item.message,
        hasImage: Boolean(image?.available),
        image,
        clipPathId,
        clipPathRef: `url(#${clipPathId})`
      };
    });
  }
}