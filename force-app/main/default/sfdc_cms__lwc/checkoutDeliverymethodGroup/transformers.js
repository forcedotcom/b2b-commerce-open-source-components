export function remapData(dataMap, data) {
  return Object.entries(dataMap).reduce((acc, [newName, originalName]) => {
    Reflect.set(acc, newName, data[originalName]);
    return acc;
  }, {});
}
export function transformCartItemData(cartItemData, itemDataMap) {
  const cartItemNumberData = {};
  const tempCartItemData = {};
  for (const key in itemDataMap) {
    if (Object.prototype.hasOwnProperty.call(itemDataMap, key)) {
      tempCartItemData[key] = cartItemData[itemDataMap[key]];
    }
  }
  for (const key in tempCartItemData) {
    if (Object.prototype.hasOwnProperty.call(tempCartItemData, key)) {
      if (!tempCartItemData[key]) {
        cartItemNumberData[key] = undefined;
      } else {
        cartItemNumberData[key] = parseFloat(tempCartItemData[key]);
      }
    }
  }
  return cartItemNumberData;
}