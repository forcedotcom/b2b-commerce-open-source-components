import { LightningElement, api } from 'lwc';
import BasePath from '@salesforce/community/basePath';
import { generateModalSubheading } from './textGenerator';
import LABELS from './labels';
import { resolve } from 'experience/resourceResolver';
import { createImageDataMap } from 'experience/picture';
export default class ReorderModalContents extends LightningElement {
  static renderMode = 'light';
  @api
  succeededProductCount;
  @api
  failedProductCount;
  @api
  unaddedProductList;
  @api
  errors = false;
  @api
  errorCode;
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
      if (this.errorCode === 'DYNAMIC_BUNDLE_REORDER_ACTION_NOT_ALLOWED') {
        return LABELS.AddDynamicBundlesToCartException;
      }
      return LABELS.errorScreenSubHeaderText;
    } else if (!this.failedProductCount) {
      return LABELS.successfullyAddedToCart;
    }
    return generateModalSubheading(this.succeededProductCount, this.failedProductCount);
  }
  get _showSubheadings() {
    return Boolean(this.failedProductCount) && !this.errors;
  }
  get _spinnerHelpText() {
    return LABELS.spinnerScreenHelpText;
  }
  get _isLoading() {
    return this.loading;
  }
  get _unavailableProducts() {
    return Boolean(this.unaddedProductList?.length);
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
    return `sub-heading-body-container ${this.unaddedProductList?.length ? 'slds-m-vertical_small' : 'slds-m-vertical_x-large'}`;
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
  get _unaddedProductList() {
    return this.unaddedProductList?.map(unaddedProduct => ({
      image: unaddedProduct.media && this.getImage(unaddedProduct.media),
      productId: unaddedProduct.productId,
      productName: unaddedProduct.productName,
      productSKU: unaddedProduct.productSKU,
      errorCode: unaddedProduct.errorCode,
      errorMessage: unaddedProduct.errorMessage,
      media: unaddedProduct.media
    }));
  }
}