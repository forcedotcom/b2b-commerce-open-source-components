export function transformProductFields(productDetailSummaryFieldMapping, allProductFields, skuFieldLabel) {
  let fieldMappingData = [];
  if (allProductFields === undefined) {
    return undefined;
  }
  if (productDetailSummaryFieldMapping?.length > 0) {
    fieldMappingData = JSON.parse(productDetailSummaryFieldMapping);
  }
  const fieldData = fieldMappingData.filter(function (field) {
    return allProductFields[field.name];
  }).map(function (field) {
    return {
      label: field.label,
      name: field.name,
      value: allProductFields[field.name],
      type: field.type
    };
  });
  if (skuFieldLabel) {
    fieldData.unshift({
      label: skuFieldLabel,
      name: 'StockKeepingUnit',
      value: allProductFields.StockKeepingUnit,
      type: 'STRING'
    });
  }
  return fieldData;
}