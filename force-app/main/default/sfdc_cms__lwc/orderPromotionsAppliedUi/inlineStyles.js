export class SimpleStyleMap {
  constructor(styleMaps) {
    this.styleMaps = styleMaps;
  }
  createForStyles(styles) {
    const resolved = {};
    for (const [cssVar, stateKey] of Object.entries(this.styleMaps)) {
      const value = styles[stateKey];
      if (value !== undefined && value !== null && value !== '') {
        resolved[cssVar] = String(value);
      }
    }
    return resolved;
  }
}
export class DynamicStyleMap {
  constructor(styleMaps) {
    this.styleMaps = styleMaps;
  }
  static createStatefulStyleSelector(normalStyleName, conditionalStyleName, conditionPredicate) {
    return `${conditionPredicate} ? ${conditionalStyleName} : ${normalStyleName}`;
  }
  createForStyles(styles) {
    const resolved = {};
    for (const [cssVar, stateKey] of Object.entries(this.styleMaps)) {
      const value = styles[stateKey];
      if (value !== undefined && value !== null && value !== '') {
        resolved[cssVar] = String(value);
      }
    }
    return resolved;
  }
}
export class StyleStringGenerator {
  constructor(styleMaps) {
    this.styleMaps = styleMaps;
  }
  createForStyles(styles, _state) {
    const merged = {};
    for (const map of this.styleMaps) {
      Object.assign(merged, map.createForStyles(styles));
    }
    return Object.entries(merged).map(([cssVar, value]) => `${cssVar}: ${value};`).join(' ');
  }
}