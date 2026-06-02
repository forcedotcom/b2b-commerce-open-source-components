export function generateTextFontSizeV2(textSize) {
  switch (textSize) {
    case 'small':
      return 'var(--dxp-s-body-font-size)';
    case 'medium':
      return 'var(--dxp-s-text-heading-small-font-size)';
    case 'large':
      return 'var(--dxp-s-text-heading-medium-font-size)';
    default:
      return 'initial';
  }
}