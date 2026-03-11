import { LightningElement } from 'lwc';
import basePath from '@salesforce/community/basePath';

/**
 * @slot title
 * @slot description
 */
export default class OrderConfirmationMessageSuccess extends LightningElement {
  static renderMode = 'light';
  iconPath = `${basePath}/assets/icons/order-shipment-tracker.svg#success`;
}