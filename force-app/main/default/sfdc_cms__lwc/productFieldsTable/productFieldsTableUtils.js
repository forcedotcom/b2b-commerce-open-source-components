export function transformProductData(productDetailDataContentMapping, product) {
  const allProductFields = product?.fields;
  if (!!allProductFields && productDetailDataContentMapping?.length > 0) {
    const fieldMappingData = JSON.parse(productDetailDataContentMapping);
    const fieldData = fieldMappingData.filter(function (field) {
      return !!field.name && !!allProductFields[field.name];
    }).map(function (field) {
      return {
        name: field.name,
        label: field.label,
        value: allProductFields[field.name],
        type: field.type
      };
    });
    return fieldData;
  }
  return [];
}