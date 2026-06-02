import basePath from '@salesforce/community/basePath';
const SF_PAYMENTS_ASSETS_PATH = `${basePath}/sfsites/assets/payments`;
export function getIconPath(iconName) {
  return `${SF_PAYMENTS_ASSETS_PATH}/icons/${iconName}.svg`;
}