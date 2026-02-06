export function refinementsFromFacetsMap(facetsMap, minPrice, maxPrice) {
  const facetMapValues = facetsMap ? Array.from(facetsMap.values()) : [];
  return facetMapValues.reduce((acc, {
    searchFacet,
    valuesCheckMap
  }) => {
    const {
      nameOrId,
      facetType: type,
      attributeType
    } = searchFacet;
    if (type === 'Range') {
      if (minPrice !== undefined && maxPrice !== undefined) {
        acc.push({
          nameOrId,
          type,
          attributeType: attributeType ?? '',
          min: minPrice.toString(),
          max: maxPrice.toString()
        });
      }
    } else {
      const values = Array.from(valuesCheckMap.entries()).filter(([, checked]) => checked).map(([facetValueId]) => facetValueId);
      if (values?.length > 0) {
        acc.push({
          nameOrId,
          type: type ?? '',
          attributeType: attributeType ?? '',
          values: values
        });
      }
    }
    return acc;
  }, []);
}