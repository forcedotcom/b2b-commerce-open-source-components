import { LightningElement, api } from 'lwc';
import { getDeliveryGroupFields, getSubscriptionDeliveryGroupFields, getGiftingFields } from './fieldsUtility';
/**
 * @slot header
 * @slot giftingHeader
 * @slot deliveryItems
 */
export default class OrderConfirmationDeliverygroup extends LightningElement {
  _noOfColumns = 3;
  static renderMode = 'light';
  @api
  deliveryGroup;
  @api
  ownerInfo;
  @api
  companyNameLabel;
  @api
  shippingAddressLabel;
  @api
  phoneNumberLabel;
  @api
  shippingMethodLabel;
  @api
  shippingChargesLabel;
  @api
  deliveryTimelineLabel;
  @api
  emailAddressLabel;
  @api
  giftOrderLabel;
  @api
  giftMessageLabel;
  get fields() {
    const fieldLabels = {
      companyNameLabel: this.companyNameLabel ?? '',
      shippingAddressLabel: this.shippingAddressLabel ?? '',
      phoneNumberLabel: this.phoneNumberLabel ?? '',
      shippingMethodLabel: this.shippingMethodLabel ?? '',
      shippingChargesLabel: this.shippingChargesLabel ?? '',
      deliveryTimelineLabel: this.deliveryTimelineLabel ?? '',
      emailAddressLabel: this.emailAddressLabel ?? ''
    };
    if (this.hasAllSubscriptionProducts()) {
      return getSubscriptionDeliveryGroupFields(this.deliveryGroup, this.ownerInfo, fieldLabels);
    }
    return getDeliveryGroupFields(this.deliveryGroup, fieldLabels);
  }
  get giftingFields() {
    const fieldLabels = {
      giftOrderLabel: this.giftOrderLabel ?? '',
      giftMessageLabel: this.giftMessageLabel ?? ''
    };
    return getGiftingFields(this.deliveryGroup, fieldLabels);
  }
  get showGiftingDetails() {
    return this.giftingFields.length > 0;
  }
  hasAllSubscriptionProducts() {
    const lineItems = this.deliveryGroup?.lineItems;
    return !!lineItems?.length && lineItems?.every(item => item.productSellingModel !== null);
  }
  get currencyCode() {
    return this.deliveryGroup?.currencyIsoCode ?? '';
  }
}