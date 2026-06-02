import { productNameWithUnavailableMessage } from './labels';
export default function generateProductTitle(productName, productUnavailableMessage) {
  return productNameWithUnavailableMessage.replace('{productName}', productName).replace('{productUnavailableMessage}', productUnavailableMessage);
}