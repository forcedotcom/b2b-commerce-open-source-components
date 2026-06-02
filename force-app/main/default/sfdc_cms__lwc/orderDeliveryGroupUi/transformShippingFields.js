export function transformShippingFields(fields) {
  return fields.map((field, index) => {
    return {
      ...field,
      id: index,
      hasFieldName: Boolean(field.label.length)
    };
  });
}