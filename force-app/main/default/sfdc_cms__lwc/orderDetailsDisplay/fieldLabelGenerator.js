import labels from './labels';
const {
  keyValueSeparatorWithSpace
} = labels;
export default function getFieldLabel(fieldLabel) {
  return fieldLabel ? fieldLabel.concat(keyValueSeparatorWithSpace) : '';
}