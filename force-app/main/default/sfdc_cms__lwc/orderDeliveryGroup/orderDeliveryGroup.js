import { LightningElement, api } from 'lwc';
import { getDefaultShippingFields } from './defaultOrderDeliveryShippingFields';
import BasePath from '@salesforce/community/basePath';

/**
 * @slot orderItemsRepeater
 */
export default class OrderDeliveryGroup extends LightningElement {
  static renderMode = 'light';
  _parsedShippingFieldMapping;
  _shippingFieldMapping;
  @api
  orderDeliveryGroup;
  @api
  prefixToShippingGroup;
  @api
  giftOrderLabel;
  @api
  giftMessageLabel;
  @api
  set shippingGroupFieldMapping(value) {
    this._shippingFieldMapping = value;
    this._parsedShippingFieldMapping = value ? JSON.parse(value) : getDefaultShippingFields();
  }
  get shippingGroupFieldMapping() {
    return this._shippingFieldMapping;
  }
  @api
  productCountTitle;
  get _basePath() {
    return BasePath;
  }
  get isOnlyDeliveryGroup() {
    return this.orderDeliveryGroup?.clientState?.isOnlyDeliveryGroup ?? false;
  }
  get isFirstDeliveryGroup() {
    return this.orderDeliveryGroup?.clientState?.isFirstDeliveryGroup ?? false;
  }
  get shippingPhoneNumber() {
    return this.orderDeliveryGroup?.fields.PhoneNumber?.text ?? undefined;
  }
  get shippingPhoneNumberLabel() {
    return this.orderDeliveryGroup?.fields.PhoneNumber?.label ?? undefined;
  }
}