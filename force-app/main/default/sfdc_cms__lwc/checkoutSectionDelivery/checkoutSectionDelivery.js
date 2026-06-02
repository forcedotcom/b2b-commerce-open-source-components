import CheckoutSection from 'site/checkoutSection';
import { api } from 'lwc';

/**
 * @slot title
 * @slot edit
 * @slot content
 * @slot proceed
 */
export default class CheckoutSectionDelivery extends CheckoutSection {
  static renderMode = 'light';
  @api
  proceedButtonAlignment;
}