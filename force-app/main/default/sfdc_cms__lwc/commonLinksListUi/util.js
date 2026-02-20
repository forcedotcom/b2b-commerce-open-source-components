function isNotEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
export const isClickableItem = item => {
  const {
    actionValue,
    actionType,
    isClickable
  } = item;
  return typeof isClickable === 'boolean' ? isClickable : isNotEmpty(actionValue) && isNotEmpty(actionType);
};
export const isExternalItem = item => {
  const {
    actionType,
    target,
    isExternal
  } = item;
  return typeof isExternal === 'boolean' ? isExternal : actionType === 'ExternalLink' && target === 'NewWindow';
};