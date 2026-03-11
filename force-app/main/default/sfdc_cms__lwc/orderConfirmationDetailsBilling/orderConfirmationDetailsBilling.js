import { LightningElement, api } from 'lwc';
import { getBillingDetailsFields } from './billingFieldsUtility';
/**
 * @slot header
 */
export default class OrderConfirmationDetailsBilling extends LightningElement {
  static renderMode = 'light';
  _noOfColumns = 2;
  @api
  billingDetails;
  @api
  ownerInfo;
  @api
  billingAddressLabel;
  @api
  emailAddressLabel;
  @api
  paymentMethodLabel;
  get fields() {
    const fieldLabels = {
      billingAddressLabel: this.billingAddressLabel ?? '',
      emailAddressLabel: this.emailAddressLabel ?? '',
      paymentMethodLabel: this.paymentMethodLabel ?? ''
    };
    return getBillingDetailsFields(this.billingDetails, this.ownerInfo, fieldLabels);
  }
}