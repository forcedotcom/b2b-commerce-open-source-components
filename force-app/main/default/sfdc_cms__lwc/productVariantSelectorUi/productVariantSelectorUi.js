import { api, LightningElement, track } from 'lwc';
import { Labels } from './labels';
import { VARIANT_SELECTED_EVT, PLACEHOLDER_VALUE, COLOR_SWATCH_TYPE, PILL_TYPE, DROP_DOWN_TYPE } from './constants';
import { buildVariantProductAttributeToInventoryMap, getAvailableOptions, getAvailableValuesFromOptions, getSelectedAttributeState, isVariantSupportedProductClass, transformVariationData, updateIsOutOfStockFieldInOptions } from './productVariantSelectorUiUtils';
export { isVariantSupportedProductClass };
export default class ProductVariantSelectorUi extends LightningElement {
  static renderMode = 'light';
  _productDetails;
  @api
  outOfStockText;
  @api
  assistiveOutOfStockText;
  _canonicalProductMap = new Map();
  @track
  attributeFields = [];
  get formattedAttributeFields() {
    return this.attributeFields.map(field => ({
      ...field,
      options: field.options.map(option => ({
        ...option,
        label: option.isOutOfStock && field.isDropDown ? `${option.label} ${this.outOfStockText || Labels.defaultOutOfStockText}` : option.label
      }))
    }));
  }
  _variantAttributeOptions = {};
  _variantProductAttributeToInventoryMap;
  attributeSelectionState = new Map();
  @api
  get product() {
    return this._productDetails;
  }
  @api
  get variantProductAttributeToInventoryMap() {
    return this._variantProductAttributeToInventoryMap;
  }
  set product(val) {
    const transformVal = {
      ...val,
      variationInfo: val?.variationInfo ? transformVariationData(val.variationInfo) : val?.variationInfo
    };
    this._productDetails = val ? transformVal : val;
    this._variantProductAttributeToInventoryMap = buildVariantProductAttributeToInventoryMap(this._productDetails);
    this.initializeState();
  }
  initializeState() {
    this.initializeAttributeFields();
    this.filterOptions();
  }
  initializeAttributeFields() {
    (this._productDetails?.variationInfo?.attributesToProductMappings || []).forEach(productMap => {
      if (productMap.canonicalKey) {
        this._canonicalProductMap.set(productMap.canonicalKey, productMap);
      }
    });
    const currentProductOptionValues = this._productDetails?.variationInfo?.attributesToProductMappings.find(p => p.productId === this?._productDetails?.id);
    const selectedOptions = currentProductOptionValues?.selectedAttributes.reduce((acc, item) => {
      acc[item.apiName] = item.value;
      return acc;
    }, {}) ?? {};
    this.attributeFields = Object.values(this._productDetails?.variationInfo?.variationAttributeInfo ?? {}).sort((attribute1, attribute2) => {
      return attribute1.sequence - attribute2.sequence;
    }).map(attributeField => {
      const {
        apiName,
        availableValues,
        sequence,
        label,
        viewType,
        options
      } = attributeField;
      this.attributeSelectionState.set(apiName, selectedOptions[apiName] ?? PLACEHOLDER_VALUE);
      const attributeAvailableValues = Array.isArray(availableValues) ? availableValues : [];
      this._variantAttributeOptions[apiName] = getAvailableValuesFromOptions(options);
      return {
        apiName,
        availableValues: attributeAvailableValues,
        sequence,
        value: this.attributeSelectionState.get(apiName),
        label,
        options: this.getOptions(apiName, options),
        isColorSwatch: viewType === COLOR_SWATCH_TYPE,
        isPill: viewType === PILL_TYPE,
        isDropDown: !viewType || viewType === DROP_DOWN_TYPE || ![COLOR_SWATCH_TYPE, PILL_TYPE].includes(viewType)
      };
    });
  }
  filterOptions() {
    const validCombinations = [...this._canonicalProductMap.keys()].filter(Boolean);
    const availableOptions = getAvailableOptions(validCombinations, this._variantAttributeOptions, this.attributeSelectionState);
    this.attributeFields = updateIsOutOfStockFieldInOptions(this.attributeFields, this.attributeSelectionState, this._variantProductAttributeToInventoryMap, this.product?.quantity);
    this.attributeFields = this.attributeFields.map(attribute => {
      const options = availableOptions[attribute.apiName].map(avalOptionApi => {
        const baseOption = attribute.options.find(option => option.value === avalOptionApi);
        const isOutOfStock = baseOption?.isOutOfStock || false;
        const selectedAttributeOptionValue = this.attributeSelectionState.get(attribute.apiName);
        return {
          label: baseOption?.label,
          value: avalOptionApi,
          selected: selectedAttributeOptionValue === baseOption?.value,
          isOutOfStock: isOutOfStock,
          hexCode: attribute.isColorSwatch ? baseOption?.hexCode : undefined
        };
      });
      if (attribute.isDropDown && this._productDetails?.productClass === 'VariationParent') {
        options.unshift({
          label: Labels.placeholderText,
          value: PLACEHOLDER_VALUE,
          selected: false,
          isOutOfStock: false,
          hexCode: undefined
        });
      }
      return {
        ...attribute,
        options,
        value: this.attributeSelectionState.get(attribute.apiName)
      };
    });
  }
  getOptions(attributeFieldApiName, options) {
    if (options) {
      return options.map(option => {
        const selectedAttributeOption = this.attributeSelectionState.get(attributeFieldApiName);
        return {
          label: option.label,
          value: option.apiName,
          hexCode: option.colorHexCode,
          selected: selectedAttributeOption === option.apiName,
          isOutOfStock: false
        };
      });
    }
    return [];
  }
  dispatchProductState() {
    const selectedOptionValues = [...this.attributeSelectionState.values()];
    const currentCanonicalKey = selectedOptionValues.join('_');
    const productData = this._canonicalProductMap.get(currentCanonicalKey);
    this.dispatchEvent(new CustomEvent(VARIANT_SELECTED_EVT, {
      detail: {
        productId: productData?.productId,
        isValid: Boolean(productData),
        options: selectedOptionValues,
        urlName: productData?.urlName
      }
    }));
  }
  handleVariantAttributeOptionChanged(event) {
    event.stopPropagation();
    const {
      attributeApiName,
      value
    } = event.detail;
    this.handlePostChangedEvent(attributeApiName, value);
  }
  handleChange(event) {
    const value = event.detail.value;
    const fieldName = event.target.dataset.fieldName;
    this.handlePostChangedEvent(fieldName, value);
  }
  handlePostChangedEvent(attributeApiName, optionApiValue) {
    this.attributeSelectionState = getSelectedAttributeState(attributeApiName, optionApiValue, this.attributeSelectionState, this._canonicalProductMap, this._productDetails?.productClass, this._productDetails?.variationInfo?.variationAttributeInfo, this._variantAttributeOptions);
    this.filterOptions();
    this.dispatchProductState();
  }
}