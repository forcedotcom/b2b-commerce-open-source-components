import BasePath from '@salesforce/community/basePath';
export const CUSTOM_ICON_TOAST_VARIANTS = ['success', 'error', 'processing'];
export const TOAST_VARIANT_ICON_MAPPING = {
  info: 'utility:info',
  success: `${BasePath}/assets/images/success-icon.svg#success-icon`,
  error: `${BasePath}/assets/images/error-icon.svg#error-icon`,
  warning: 'utility:warning',
  processing: `${BasePath}/assets/images/processing-icon.svg#processing-icon`
};