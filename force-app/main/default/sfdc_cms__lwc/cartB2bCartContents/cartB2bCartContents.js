import { api } from 'lwc';
import CartContents from 'site/cartContents';
/**
 * @slot emptyHeaderLabel
 * @slot emptyBody
 * @slot itemsHeaderLabel
 * @slot itemsHeaderCount
 * @slot discountsApproaching
 * @slot itemsBody
 * @slot footerClearCart
 */
export default class CartB2bCartContents extends CartContents {
  static renderMode = 'light';
  @api
  items;
  @api
  messages;
  @api
  showSortOptions = false;
}