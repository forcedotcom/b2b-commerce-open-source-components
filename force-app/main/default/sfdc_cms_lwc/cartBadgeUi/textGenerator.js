import { emptyCart, itemInCart, itemsInCart, productTypeInCart, productTypesInCart } from './labels';
export default function generateLabel(countType, count) {
  let text;
  let textSrc;
  count = Math.max(count ?? 0, 0);
  if (count === 0) {
    return emptyCart;
  }
  if (countType === 'Total') {
    textSrc = count === 1 ? itemInCart : itemsInCart;
  } else if (countType === 'Unique') {
    textSrc = count === 1 ? productTypeInCart : productTypesInCart;
  }
  if (textSrc) {
    text = textSrc.replace('{0}', count.toString());
  }
  return text;
}