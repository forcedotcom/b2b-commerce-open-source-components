import basePath from '@salesforce/community/basePath';
const SF_PAYMENTS_ASSETS_PATH = `${basePath}/sfsites/assets/payments`;
const SF_PAYMENTS_LATEST_VERSION = 'v8';
export function getSdkUrl(version) {
  const resolvedVersion = !version || version === 'latest' ? SF_PAYMENTS_LATEST_VERSION : version;
  return `${SF_PAYMENTS_ASSETS_PATH}/${resolvedVersion}/sfp.js`;
}