import { generateThemeTextSizeProperty } from 'experience/styling';
export function dxpTextSize(textSize) {
  const themeSize = generateThemeTextSizeProperty(`heading-${textSize}`);
  return themeSize ? `var(${themeSize}-font-size)` : 'initial';
}
export function dxpSmallerTextSize(textSize) {
  let smallerTextSize = '';
  switch (textSize) {
    case 'small':
      smallerTextSize = 'body-small';
      break;
    case 'medium':
      smallerTextSize = 'body-regular';
      break;
    case 'large':
      smallerTextSize = 'heading-small';
      break;
    default:
      smallerTextSize = 'body-regular';
  }
  const themeSize = generateThemeTextSizeProperty(smallerTextSize);
  return `var(${themeSize}-font-size)`;
}