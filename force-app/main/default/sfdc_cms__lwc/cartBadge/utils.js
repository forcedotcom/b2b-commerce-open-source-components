export function isOptimisticCountEnabled(countType) {
  return countType === 'Total';
}
function extractCartItemsData(raw) {
  if (!raw || raw instanceof Error) {
    return undefined;
  }
  const direct = raw;
  if (direct.cartItems) {
    return direct;
  }
  if (typeof raw === 'object') {
    const values = Object.values(raw);
    for (const value of values) {
      const entry = value;
      if (entry?.data?.cartItems) {
        return entry.data;
      }
    }
  }
  return undefined;
}
export function getCartItemQuantityFromState(state, itemId) {
  const storeState = state;
  const raw = storeState.get?.('cartContentsAdapter');
  const data = extractCartItemsData(raw);
  if (!data) {
    return undefined;
  }
  const item = data.cartItems?.find(entry => entry.cartItem?.cartItemId === itemId);
  const quantity = item?.cartItem?.quantity;
  return quantity !== undefined ? Number(quantity) : undefined;
}
export function getOptimisticDelta(action, state) {
  if (action.type === 'ACTION_CART_ITEM_ADD') {
    const quantity = action.payload?.quantity ?? 1;
    return Number(quantity);
  }
  if (action.type === 'ACTION_CART_ITEM_ADD_CONFIGURATION') {
    const quantity = action.payload?.quantity;
    return quantity !== undefined ? Number(quantity) : null;
  }
  if (action.type === 'ACTION_CART_ITEM_UPDATE') {
    const payload = action.payload;
    const itemId = payload?.itemId;
    const newQuantity = payload?.quantity;
    if (!itemId || newQuantity === undefined) {
      return null;
    }
    const oldQuantity = getCartItemQuantityFromState(state, itemId);
    return oldQuantity === undefined ? null : newQuantity - oldQuantity;
  }
  if (action.type === 'ACTION_CART_ITEM_UPDATE_CONFIGURATION') {
    const payload = action.payload;
    const itemId = payload?.itemId;
    const newQuantity = payload?.quantity;
    if (!itemId || newQuantity === undefined) {
      return null;
    }
    const oldQuantity = getCartItemQuantityFromState(state, itemId);
    return oldQuantity === undefined ? null : newQuantity - oldQuantity;
  }
  if (action.type === 'ACTION_CART_ITEM_DELETE') {
    const payload = action.payload;
    const itemId = payload?.itemId;
    if (!itemId) {
      return null;
    }
    const oldQuantity = getCartItemQuantityFromState(state, itemId);
    return oldQuantity !== undefined ? -oldQuantity : -1;
  }
  return null;
}
export function getTotalCountFromCartData(cart, defaultCount) {
  const total = Number(cart?.cartSummary?.totalProductCount);
  return isNaN(total) ? defaultCount : total;
}
export function getNumberOfDecimalPlaces(value) {
  const numValue = Number(value);
  if (!isFinite(numValue)) {
    return 0;
  }
  if (Math.floor(numValue.valueOf()) === numValue.valueOf()) {
    return 0;
  }
  const parts = numValue.toString().split('.');
  return parts.length > 1 ? parts[1].length : 0;
}
export function addAndFormatValues(...values) {
  const validValues = values.map(v => isFinite(v) ? v : 0);
  const scale = Math.max(0, ...validValues.map(v => getNumberOfDecimalPlaces(v)));
  const numValue = validValues.reduce((sum, val) => sum + val, 0);
  return numValue.toFixed(scale);
}