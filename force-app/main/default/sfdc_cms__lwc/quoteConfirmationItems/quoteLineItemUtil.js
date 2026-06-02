export function buildQuoteLineItemsWithAssociatedLineItems(items) {
  const map = new Map();
  const validItems = (items ?? []).filter(item => !!item);
  validItems.forEach(item => {
    map.set(item.id, {
      item,
      associatedLineItems: []
    });
  });
  validItems.forEach(item => {
    const parentId = item.fields?.ParentQuoteLineItemId?.text?.trim();
    if (parentId) {
      const parentEntry = map.get(parentId);
      if (parentEntry) {
        parentEntry.associatedLineItems.push(item);
      }
    }
  });
  return map;
}