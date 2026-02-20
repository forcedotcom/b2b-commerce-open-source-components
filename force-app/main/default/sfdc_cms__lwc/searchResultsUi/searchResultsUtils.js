import variationAttributeLabel from '@salesforce/label/site.searchResultsUi.variationAttribute';
export function computeVariationAttributesField(attributeSet) {
  const {
    attributes = []
  } = attributeSet || {};
  return [...attributes].sort((value1, value2) => {
    const {
      sequence: sequence1
    } = value1;
    const {
      sequence: sequence2
    } = value2;
    return sequence1 - sequence2;
  }).map(item => {
    const {
      label,
      value
    } = item;
    return variationAttributeLabel.replace('{name}', label).replace('{value}', value);
  }).join(', ');
}
export function generateContentMappedFields(productFieldMap = {}, productClass = '', contentMapping = [], tabStoppable = false) {
  const PRODUCT_FIELD_NAME = 'Name';
  const fieldMap = productFieldMap;
  const fields = (contentMapping || []).map(({
    name,
    label,
    type
  }) => ({
    name,
    label: productClass === 'Variation' && type === 'VARIATION' ? '' : label,
    type,
    value: (fieldMap[name] || {})['value'] || '',
    tabStoppable: false
  })).filter(({
    value,
    type
  }) => productClass === 'VariationParent' && type === 'VARIATION' || value !== '');
  if (tabStoppable && fields.length > 0) {
    const nameField = fields.find(item => item.name === PRODUCT_FIELD_NAME);
    const fieldValueItem = nameField || fields[0];
    fieldValueItem.tabStoppable = true;
  }
  return fields;
}
function consolidateFieldDisplayData(fields, productClass, variationAttributeSet, cardConfig) {
  const transformedFields = new Map();
  for (const [key, value] of Object.entries(fields)) {
    transformedFields.set(key, value);
  }
  if (productClass === 'Variation' && variationAttributeSet) {
    transformedFields.set('VariationAttributes', {
      value: computeVariationAttributesField(variationAttributeSet)
    });
  }
  return generateContentMappedFields(Object.fromEntries(transformedFields), productClass, cardConfig.cardContentMapping, cardConfig.showCallToActionButton === false);
}
export function transformDataWithConfiguration(results, cardConfiguration = {}) {
  const cardCollection = ((results || {}).cardCollection || []).map(cardDetail => {
    const {
      fields,
      productClass,
      variationAttributeSet
    } = cardDetail;
    return {
      ...cardDetail,
      fields: consolidateFieldDisplayData(fields, productClass, variationAttributeSet, cardConfiguration)
    };
  });
  return {
    ...results,
    cardCollection
  };
}
export function computeConfiguration(configParameters) {
  const {
    layout = '',
    addToCartDisabled = false,
    builderCardConfiguration
  } = configParameters || {};
  const {
    subscriptionOptionsText = '',
    addToCartButtonText = '',
    addToCartButtonProcessingText = '',
    cardContentMapping = [],
    showCallToActionButton = false,
    showNegotiatedPrice = false,
    showOriginalPrice: showListingPrice = false,
    showProductImage = false,
    viewOptionsButtonText = '',
    showQuantitySelector = false,
    minimumQuantityGuideText = '',
    maximumQuantityGuideText = '',
    incrementQuantityGuideText = '',
    showQuantityRulesText = true,
    quantitySelectorLabelText = '',
    navigateToParentProduct = false
  } = builderCardConfiguration || {};
  const fieldConfiguration = cardContentMapping.reduce((acc, {
    name,
    fontSize,
    fontColor,
    showLabel = false
  }) => {
    acc[name] = {
      fontSize,
      fontColor,
      showLabel
    };
    return acc;
  }, {});
  return {
    layoutConfiguration: {
      layout,
      cardConfiguration: {
        subscriptionOptionsText,
        addToCartButtonText,
        addToCartButtonProcessingText,
        showCallToActionButton,
        viewOptionsButtonText,
        showQuantitySelector,
        minimumQuantityGuideText,
        maximumQuantityGuideText,
        incrementQuantityGuideText,
        showQuantityRulesText,
        quantitySelectorLabelText,
        showProductImage,
        addToCartDisabled,
        layout,
        fieldConfiguration,
        priceConfiguration: {
          showNegotiatedPrice,
          showListingPrice
        },
        navigateToParentProduct
      }
    }
  };
}