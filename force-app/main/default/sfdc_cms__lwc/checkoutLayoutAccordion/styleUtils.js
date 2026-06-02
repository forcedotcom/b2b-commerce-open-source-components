function isStyleDefined(val) {
  return val !== undefined && val !== null && val !== '';
}
export function createStyleString(styles) {
  let stylesArray;
  if (!Array.isArray(styles)) {
    stylesArray = Object.entries(styles).map(([styleName, styleValue]) => ({
      name: styleName,
      value: styleValue
    }));
  } else {
    stylesArray = styles;
  }
  return stylesArray.filter(s => isStyleDefined(s.value)).map(s => ({
    ...s,
    suffix: s.suffix || ''
  })).map(s => `${s.name}: ${s.value}${s.suffix}`).join('; ');
}