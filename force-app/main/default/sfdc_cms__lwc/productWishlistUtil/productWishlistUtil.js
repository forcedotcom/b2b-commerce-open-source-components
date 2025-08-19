import Toast from 'site/commonToast';
import addToWishlistSuccessToastMessage from '@salesforce/label/site.productWishlistUtil.addToWishlistSuccessToastMessage';
import addToWishlistErrorToastMessage from '@salesforce/label/site.productWishlistUtil.addToWishlistErrorToastMessage';
export function handleAddToWishlistErrorWithToast(target) {
  Toast.show({
    label: addToWishlistErrorToastMessage,
    variant: 'error'
  }, target);
}
export function handleAddToWishlistSuccessWithToast(target) {
  Toast.show({
    label: addToWishlistSuccessToastMessage,
    variant: 'success'
  }, target);
}