import { api } from 'lwc';
import CheckoutSection from 'site/checkoutSection';
/**
 * @slot title
 * @slot edit
 * @slot content
 * @slot proceed
 */
export default class CheckoutSectionShipping extends CheckoutSection {
  static renderMode = 'light';
  @api
  proceedButtonAlignment;
}