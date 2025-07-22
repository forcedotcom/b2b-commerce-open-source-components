import { childCostsExtraText, childIsIncludedAddOnText, childIsOptionalAddOnText, childIsRequiredText, noExtraCostText } from './labels';
export const CHILD_PARENT_LABEL_CONFIGS = [{
  outputValue: childIsRequiredText,
  conditions: [{
    field: 'isRequired',
    fieldValue: true
  }]
}, {
  outputValue: childIsIncludedAddOnText,
  conditions: [{
    field: 'isDefault',
    fieldValue: true
  }]
}, {
  outputValue: childIsOptionalAddOnText,
  conditions: [{
    field: 'isDefault',
    fieldValue: false
  }, {
    operation: 'AND',
    field: 'isRequired',
    fieldValue: false
  }]
}];
export const PRICING_LABEL_CONFIGS = [{
  outputValue: noExtraCostText,
  conditions: [{
    field: 'isPriceIncludedInParent',
    fieldValue: true
  }]
}, {
  outputValue: childCostsExtraText,
  conditions: [{
    field: 'isPriceIncludedInParent',
    fieldValue: false
  }]
}];