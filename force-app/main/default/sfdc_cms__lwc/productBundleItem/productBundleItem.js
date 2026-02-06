import { LightningElement, api, wire } from 'lwc';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import { variantAttributeFieldWithCommaSeparator, attributeNameWithColonSeparator } from './labels';
import { transformProductFields } from './transformers';
export default class ProductBundleItem extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navigationContext;
  @api
  item;
  @api
  quantityText;
  @api
  productDetailSummaryFieldMapping;
  @api
  hideQuantityWhenItsOne;
  @api
  parentProductDetails;
  @api
  dynamicAttributesAvailableText;
  get productImage() {
    return this.item?.mediaGroups?.filter(group => group.usageType === 'Listing')[0]?.mediaItems?.[0];
  }
  get hideQuantity() {
    return this.quantity === 1 && this.hideQuantityWhenItsOne !== undefined && this.hideQuantityWhenItsOne;
  }
  get pageReference() {
    if (!this.item?.id) {
      return null;
    }
    return {
      type: 'standard__recordPage',
      attributes: {
        objectApiName: 'Product2',
        recordId: this.item?.id,
        actionName: 'view',
        urlName: this.item?.urlName
      },
      state: {
        recordName: this.item?.fields?.Name ?? 'Product2'
      }
    };
  }
  get imageUrl() {
    return this.productImage?.thumbnailUrl || this.productImage?.url || '';
  }
  get imageAltText() {
    return this.productImage?.alternateText ?? this.productName;
  }
  get itemUrl() {
    const pageReference = this.pageReference;
    return this.navigationContext && pageReference ? generateUrl(this.navigationContext, pageReference) : '';
  }
  get quantityTextWithColon() {
    return attributeNameWithColonSeparator.replace('{attributeName}', `${this.quantityText}`);
  }
  @api
  get quantity() {
    return this.item ? Number(this.item?.defaultQuantity) : undefined;
  }
  get variantAttributesField() {
    const attributes = this.item?.variationAttributeSet?.attributes;
    const variationInfo = this.item?.variationInfo;
    if (!attributes || !variationInfo || !variationInfo.variationAttributeInfo) {
      return '';
    }
    const variationAttributeInfo = variationInfo.variationAttributeInfo;
    const result = [];
    for (const key of Object.keys(attributes)) {
      if (key) {
        const value = attributes[key];
        if (value && variationAttributeInfo[key]) {
          const attributeLabel = variationAttributeInfo[key].label;
          const attributeLabelWithColon = attributeNameWithColonSeparator.replace('{attributeName}', `${attributeLabel}`);
          result.push(attributeLabelWithColon + value);
        }
      }
    }
    return result.map((item, index) => {
      if (index === result.length - 1) {
        return item;
      }
      return variantAttributeFieldWithCommaSeparator.replace('{variantAttributeField}', `${item}`);
    }).join('');
  }
  get productName() {
    return this.item?.fields?.Name ?? '';
  }
  get currencyCode() {
    return this.item?.fields?.CurrencyIsoCode;
  }
  get currencyCodeForItemPrice() {
    return this.item?.pricingDetails?.currencyIsoCode;
  }
  get productFieldsData() {
    const fields = transformProductFields(this.productDetailSummaryFieldMapping, this.item?.fields);
    const normalizedFields = fields?.map((field, index) => ({
      ...field,
      id: index,
      label: attributeNameWithColonSeparator.replace('{attributeName}', `${field.label}`)
    }));
    return normalizedFields;
  }
  get isPriceIncludedInParent() {
    return this.item?.isPriceIncludedInParent;
  }
  get isRequired() {
    return this.item?.isRequired;
  }
  get isDefault() {
    return this.item?.isDefault;
  }
  get componentGroup() {
    return this.item?.componentGroup;
  }
  get isNavigable() {
    return this.item?.isEntitled === true;
  }
  get isParentDynamicBundle() {
    const parent = this.parentProductDetails;
    return parent?.productClass === 'Bundle' && parent?.isConfigurationAllowed === true;
  }
  get pricingDetails() {
    return this.item?.pricingDetails;
  }
  get dynamicAttributesAvailableTextFormatted() {
    if (!this.item?.dynamicAttributeCount || !this.dynamicAttributesAvailableText) {
      return '';
    }
    return this.dynamicAttributesAvailableText.replace('{0}', this.item.dynamicAttributeCount.toString());
  }
  handleImageClicked(event) {
    event.stopPropagation();
    const pageReference = this.pageReference;
    if (pageReference) {
      navigate(this.navigationContext, pageReference);
    }
  }
}