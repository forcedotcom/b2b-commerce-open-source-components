import { getErrorMessage } from './errorMessageUtils';
import CommonToast from 'site/commonToast';
function showErrorToast(message, target) {
  CommonToast.show({
    label: message,
    variant: 'error'
  }, target);
}
export function handleAddToCartErrorWithToast(error, target) {
  if (error) {
    showErrorToast(getErrorMessage(error?.code || undefined, error?.message), target);
  } else {
    showErrorToast(getErrorMessage(), target);
  }
}
export function handleAddToCartSuccessWithToast(label, target) {
  CommonToast.show({
    label: label,
    variant: 'success'
  }, target);
}