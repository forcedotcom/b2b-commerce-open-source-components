export function generateStyleClass(style) {
  if (style === 'primary') {
    return 'slds-button_brand';
  } else if (style === 'secondary') {
    return 'slds-button_outline-brand';
  }
  return '';
}
export function generateSizeClass(size) {
  if (size === 'small') {
    return 'dxp-button-small';
  } else if (size === 'large') {
    return 'dxp-button-large';
  }
  return '';
}
export function generateStretchClass(stretch) {
  if (stretch === 'stretch') {
    return 'slds-button_stretch';
  }
  return '';
}
export function generateAlignClass(align) {
  return `show-more-button_${align}`;
}