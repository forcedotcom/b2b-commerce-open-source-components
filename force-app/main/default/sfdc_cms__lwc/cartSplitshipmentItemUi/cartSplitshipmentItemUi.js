import { LightningElement, api } from 'lwc';
import { resolve as resourceResolver } from 'experience/resourceResolver';
import { LABELS } from './labels';
import currencyFormatter from 'site/commonFormatterCurrency';
import { getBundleChildProductCountLabel } from 'site/cartItem';
import { createImageDataMap } from 'experience/picture';
import sanitizeValue from 'site/commonRichtextsanitizerUtils';
export default class CartSplitshipmentItemUi extends LightningElement {
  static renderMode = 'light';
  imageSizes = {
    mobile: 100,
    tablet: 100,
    desktop: 200
  };
  @api
  currencyIsoCode;
  @api
  deliveryGroups;
  @api
  product;
  @api
  showSku = false;
  @api
  skuLabel;
  @api
  rawInternationalizationData;
  @api
  showProductImage = false;
  @api
  showProductVariants = false;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  @api
  showEmptySplitShipmentModal = false;
  @api
  htmlProductNameGate = false;
  get generatedSkuLabel() {
    const sku = this.product?.productDetails?.sku;
    return this.skuLabel.replace('{0}', sku);
  }
  get imgAltText() {
    return this.product?.productDetails?.thumbnailImage?.alternateText || this.product?.productDetails?.name || this.labels.imageDefaultAssistiveText;
  }
  get labels() {
    return LABELS;
  }
  get normalizedProductVariants() {
    return this.product?.productDetails?.variationAttributes || {};
  }
  get productVariants() {
    return Object.values(this.normalizedProductVariants).map(variant => {
      return {
        name: variant.label,
        value: variant.value
      };
    });
  }
  get _showProductVariants() {
    return this.showProductVariants && Object.keys(this.normalizedProductVariants).length > 0;
  }
  get thumbnailImageUrl() {
    const cmsImageScalingProps = {
      width: 150
    };
    return resourceResolver(this.imageUrl, false, cmsImageScalingProps);
  }
  get imageUrl() {
    return this.product?.productDetails.thumbnailImage?.thumbnailUrl || this.product?.productDetails.thumbnailImage?.url || '';
  }
  get pricePerItemText() {
    return this.getPriceLabel(this.labels.pricePerItem);
  }
  get pricePerItemAssistiveText() {
    return this.getPriceLabel(this.labels.pricePerItemAssistiveText);
  }
  getPriceLabel(labelTemplate) {
    const currencyValue = currencyFormatter(this.currencyIsoCode, this.product?.salesPrice, 'symbol');
    return labelTemplate.replace('{0}', currencyValue);
  }
  get images() {
    return createImageDataMap(this.imageUrl, this.imageSizes);
  }
  get hasChildProductCount() {
    return Boolean(this.product?.cartItems?.[0]?.childProductCount);
  }
  get bundleProductCountText() {
    const childProductCount = this.product?.cartItems?.[0]?.childProductCount;
    return getBundleChildProductCountLabel(childProductCount);
  }
  get imageStyles() {
    return this.showProductImage ? 'slds-col slds-size_1-of-2' : 'slds-hide';
  }
  get productNameStyles() {
    return `product-details ${this.showProductImage ? 'slds-col slds-size_1-of-2' : 'slds-col slds-size_1-of-1'}`;
  }
  get productName() {
    const productName = this.product?.productDetails.name ?? '';
    if (!import.meta.env.SSR && this.htmlProductNameGate) {
      return sanitizeValue(productName);
    }
    return productName;
  }
}