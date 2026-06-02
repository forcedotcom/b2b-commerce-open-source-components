import { fieldLabel as labels_fieldLabel } from './labels';
export function generateFieldLabelText(fieldLabel) {
  if (fieldLabel) {
    return labels_fieldLabel.replace('{fieldLabel}', fieldLabel);
  }
  return '';
}