import { api, LightningElement } from 'lwc';
import { resolve } from 'experience/resourceResolver';
import { createImageDataMap } from 'experience/picture';
import { getOutputValueFromTextConfig } from './textDeterminationUtil';
import { CHILD_PARENT_LABEL_CONFIGS, PRICING_LABEL_CONFIGS } from './conditionalTextconfigs';
export default class ProductBundleItemUi extends LightningElement {
  static renderMode = 'light';
  imageSizes = {
    mobile: 60,
    tablet: 80,
    desktop: 100
  };
  @api
  itemUrl;
  @api
  imageUrl;
  @api
  imageAltText;
  @api
  quantityTextWithColon;
  @api
  hideQuantity;
  @api
  quantity;
  @api
  productName;
  @api
  variantAttributesField;
  @api
  productFieldsData;
  @api
  currencyCode;
  @api
  isNavigable;
  @api
  isPriceIncludedInParent;
  @api
  isRequired;
  @api
  isDefault;
  @api
  isParentDynamicBundle;
  @api
  componentGroup;
  get isVariantAttributesFieldEmpty() {
    return !this.variantAttributesField || this.variantAttributesField.length === 0;
  }
  get resolvedUrl() {
    return this.imageUrl ? resolve(this.imageUrl) : '';
  }
  get images() {
    return createImageDataMap(this.resolvedUrl, this.imageSizes);
  }
  get normalizedProductFieldsData() {
    return this.productFieldsData?.map((field, index) => ({
      ...field,
      id: index
    })) || [];
  }
  get showFields() {
    return this.normalizedProductFieldsData.length > 0;
  }
  get componentGroupName() {
    return this.componentGroup?.name || '';
  }
  get hideComponentGroupName() {
    return !(this.isParentDynamicBundle && this.componentGroupName?.length);
  }
  get childParentRelationshipText() {
    const childItemDetails = {
      isPriceIncludedInParent: this.isPriceIncludedInParent,
      isRequired: this.isRequired,
      isDefault: this.isDefault
    };
    return getOutputValueFromTextConfig(CHILD_PARENT_LABEL_CONFIGS, childItemDetails);
  }
  get pricingText() {
    const childItemDetails = {
      isPriceIncludedInParent: this.isPriceIncludedInParent,
      isRequired: this.isRequired,
      isDefault: this.isDefault
    };
    return getOutputValueFromTextConfig(PRICING_LABEL_CONFIGS, childItemDetails);
  }
  get hideChildParentRelationshipText() {
    return !(this.isParentDynamicBundle && this.childParentRelationshipText?.length);
  }
  get hidePricingText() {
    return !(this.isParentDynamicBundle && this.pricingText?.length);
  }
  handleImageClicked(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('imageclicked', {
      bubbles: true,
      composed: true
    }));
  }
}