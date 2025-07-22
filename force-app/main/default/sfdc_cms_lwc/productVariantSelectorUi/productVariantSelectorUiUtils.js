const variantSupportedProductClasses = new Set(['Variation', 'VariationParent']);
export const PLACEHOLDER_VALUE = '';
export function isVariantSupportedProductClass(productClass) {
  return variantSupportedProductClasses.has(productClass);
}
export function getAvailableValuesFromOptions(options) {
  return options ? options.filter(option => option.variantAvailable).map(option => [option.apiName, option.label]) : [];
}
export function getAvailableOptions(validCombinations, options, currentSelection) {
  const availableOptions = {};
  const attributes = Object.keys(options);
  const firstLevelAttribute = attributes[0];
  const selectedValuesPath = [];
  for (const [attribute, values] of Object.entries(options)) {
    let filteredValues = values;
    if (attribute !== firstLevelAttribute) {
      filteredValues = values.filter(value => {
        if (currentSelection.get(attribute) === value[0]) {
          return true;
        }
        const potentialPathUsingApi = [...selectedValuesPath, value[0]].join('_');
        return validCombinations.some(combination => {
          return combination.includes(potentialPathUsingApi);
        });
      });
    }
    if (currentSelection.has(attribute) && currentSelection.get(attribute).length > 0) {
      selectedValuesPath.push(currentSelection.get(attribute));
    }
    availableOptions[attribute] = filteredValues.map(value => value[0]);
  }
  return availableOptions;
}
export function getSelectedAttributeState(newSelectionFieldName, newSelectionValue, attributeSelectionState, canonicalProductMap, productClass, variationAttributeInfo, variantAttributeOptions) {
  const selectedOption = variantAttributeOptions[newSelectionFieldName].find(option => option[0] === newSelectionValue) || [newSelectionValue, newSelectionValue];
  attributeSelectionState.set(newSelectionFieldName, selectedOption[0]);
  const alternateCanonicalKey = [...attributeSelectionState.values()].join('_');
  if (canonicalProductMap.has(alternateCanonicalKey)) {
    return attributeSelectionState;
  }
  attributeSelectionState.set(newSelectionFieldName, newSelectionValue);
  let bestMatchCount = -1;
  let bestMatchingAttributes = null;
  let bestSequenceTotal = Number.MAX_SAFE_INTEGER;
  for (const canonicalProductInfo of canonicalProductMap.values()) {
    const hasFieldValue = canonicalProductInfo.selectedAttributes.some(selectedAttribute => {
      return selectedAttribute.apiName === newSelectionFieldName && selectedAttribute.value === selectedOption[0];
    });
    if (!hasFieldValue) {
      continue;
    }
    let matchCount = 0;
    let sequenceTotal = 0;
    for (const curProductSelectedAttributes of canonicalProductInfo.selectedAttributes) {
      if (attributeSelectionState.get(curProductSelectedAttributes.apiName) === curProductSelectedAttributes.value) {
        matchCount++;
      }
      if (variationAttributeInfo) {
        const matchingAttributeField = Object.values(variationAttributeInfo).find(item => item.apiName === curProductSelectedAttributes.apiName);
        const optionMatchIndex = matchingAttributeField?.options?.findIndex(option => option.apiName === curProductSelectedAttributes.value);
        if (optionMatchIndex !== undefined && optionMatchIndex > -1) {
          sequenceTotal += optionMatchIndex;
        }
      }
    }
    if (matchCount > bestMatchCount || matchCount === bestMatchCount && sequenceTotal < bestSequenceTotal) {
      bestMatchCount = matchCount;
      bestSequenceTotal = sequenceTotal;
      bestMatchingAttributes = canonicalProductInfo.selectedAttributes;
    }
  }
  if (bestMatchingAttributes) {
    for (const attr of bestMatchingAttributes) {
      attributeSelectionState.set(attr.apiName, attr.value);
    }
  }
  return attributeSelectionState;
}
export function createCanonicalKey(selectedAttributes) {
  return selectedAttributes.slice().sort((a, b) => a.sequence - b.sequence).map(attr => attr.value).join('_');
}
export function transformVariationData(variationData) {
  const allAttributeMetadata = variationData.variationAttributeInfo;
  const transformedData = {
    ...variationData,
    attributesToProductMappings: variationData.attributesToProductMappings.map(productVariantAttributeData => {
      const currentProductSelectedAttributes = productVariantAttributeData.selectedAttributes.map(attr => {
        const optionMetadata = allAttributeMetadata[attr.apiName]?.options?.find(opt => opt.label === attr.value || opt.apiName === attr.value);
        return {
          ...attr,
          value: optionMetadata?.apiName || attr.value
        };
      });
      return {
        ...productVariantAttributeData,
        canonicalKey: createCanonicalKey(currentProductSelectedAttributes),
        selectedAttributes: currentProductSelectedAttributes
      };
    })
  };
  return transformedData;
}
export function buildVariantProductAttributeToInventoryMap(product) {
  const availabilityMap = {};
  if (!product?.variationInfo?.attributesToProductMappings) {
    return availabilityMap;
  }
  const {
    attributesToProductMappings
  } = product.variationInfo;
  const isVariationParent = product.productClass === 'VariationParent';
  for (const mapping of attributesToProductMappings) {
    if (mapping.availableToOrder == null) {
      return {};
    }
    const {
      availableToOrder,
      selectedAttributes
    } = mapping;
    if (isVariationParent) {
      for (const attribute of selectedAttributes) {
        const attributeKey = JSON.stringify([attribute.value]);
        availabilityMap[attributeKey] = Math.max(availabilityMap[attributeKey] || 0, availableToOrder);
      }
    } else {
      const pathArray = [];
      for (const attribute of selectedAttributes) {
        pathArray.push(attribute.value);
        const currentPath = JSON.stringify(pathArray);
        availabilityMap[currentPath] = Math.max(availabilityMap[currentPath] || 0, availableToOrder);
      }
    }
  }
  return availabilityMap;
}
export function updateIsOutOfStockFieldInOptions(attributeFields, attributeSelectionState, inventoryMap, quantity) {
  if (!inventoryMap || !attributeFields.length) {
    return attributeFields;
  }
  const currPath = [];
  return attributeFields.map(attribute => {
    const updatedOptions = attribute.options.map(option => {
      const pathToOption = [...currPath, option.value];
      const pathKey = JSON.stringify(pathToOption);
      const inventory = inventoryMap[pathKey];
      return {
        ...option,
        isOutOfStock: inventory && quantity ? quantity > inventory : inventory === 0
      };
    });
    const selectedValue = attributeSelectionState.get(attribute.apiName);
    if (selectedValue) {
      currPath.push(selectedValue);
    }
    return {
      ...attribute,
      options: updatedOptions
    };
  });
}