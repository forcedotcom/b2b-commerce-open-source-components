import { api, LightningElement, wire } from 'lwc';
import { formatAddressSingleLine } from 'site/checkoutAddresses';
import { buildFullName } from 'site/checkoutInternationalization';
import currency from '@salesforce/i18n/currency';
import { remapCartItems } from './util';
import { deliveryGroupCartItemsSubTotalTextLabel, showMoreItemsLabel, nameAddressSingleLineBreak, itemsTextLabel, deliveryEmailPrompt } from './labels';
import { CheckoutDeliveryGroupCartItemsAdapter } from 'commerce/cartApi';
import currencyFormatter from 'site/commonFormatterCurrency';
export default class CheckoutDeliverymethodGroup extends LightningElement {
  static renderMode = 'light';
  _deliveryEmailPrompt = deliveryEmailPrompt;
  _cartItems;
  showTotalPrices = true;
  showProductImage = true;
  hideQuantitySelector = true;
  showCountInName = true;
  removeProductLinks = true;
  showActualPrice = true;
  showOriginalPrice = true;
  showMoreLabel = showMoreItemsLabel;
  _numberOfItems;
  _totalProductAmount;
  hasNextPageItems = false;
  _deliveryGroup;
  _deliveryGroupId;
  isExpanded = true;
  @api
  checkoutDetails;
  @api
  get deliveryGroup() {
    return this._deliveryGroup;
  }
  @api
  shippingMethodsEnabled;
  set deliveryGroup(value) {
    this._deliveryGroup = value;
    this._deliveryGroupId = value?.id;
  }
  @api
  rawInternationalizationData;
  @api
  currencyIsoCode;
  get _currencyIsoCode() {
    return this.currencyIsoCode || currency;
  }
  get _shipmentName() {
    return this.deliveryGroup?.name ?? '';
  }
  get isDigitalDeliveryGroup() {
    return this.deliveryGroup?.isAllDigitalCartItems ?? false;
  }
  get _showDeliveryShippingOptions() {
    return !this.isDigitalDeliveryGroup;
  }
  get _buyerEmailText() {
    const email = this.checkoutDetails?.contactInfo?.email ?? '';
    return `${this._deliveryEmailPrompt.replace('{0}', email)}`;
  }
  _nextPageToken;
  nextPageToken;
  get paginationType() {
    return this.hasNextPageItems ? 'showMore' : undefined;
  }
  @wire(CheckoutDeliveryGroupCartItemsAdapter, {
    deliveryGroupId: '$_deliveryGroupId',
    nextPageToken: '$nextPageToken'
  })
  deliveryGroupCartItemsHandler({
    data,
    loaded
  }) {
    const currentItems = this._cartItems ?? [];
    if (loaded) {
      const nextPageItems = remapCartItems(data?.cartItems?.cartItems) ?? [];
      this._nextPageToken = data?.cartItems?.nextPageToken;
      this._numberOfItems = data?.totalCartItemCount;
      this._totalProductAmount = data?.totalProductAmount;
      this.hasNextPageItems = Boolean(data?.cartItems?.nextPageToken);
      if (!data?.cartItems?.previousPageToken) {
        this._cartItems = nextPageItems;
      } else if (currentItems.length === 0 || this.nextPageToken !== this._nextPageToken) {
        this._cartItems = [...currentItems, ...nextPageItems];
      }
    }
  }
  handleCartShowMore() {
    this.nextPageToken = this._nextPageToken;
  }
  get shipmentCartItemsHeaderText() {
    if (this._numberOfItems && this._totalProductAmount) {
      return `${deliveryGroupCartItemsSubTotalTextLabel} ${itemsTextLabel.replace('{0}', currencyFormatter(this._currencyIsoCode, this._totalProductAmount, 'symbol')).replace('{1}', this._numberOfItems)}`;
    }
    return deliveryGroupCartItemsSubTotalTextLabel;
  }
  get _fullNameAddress() {
    const addressName = buildFullName(this.deliveryGroup?.deliveryAddress?.name, this.deliveryGroup?.deliveryAddress?.firstName, this.deliveryGroup?.deliveryAddress?.lastName, this.deliveryGroup?.deliveryAddress?.country);
    const singleLineAddress = formatAddressSingleLine(this.deliveryGroup?.deliveryAddress, this.rawInternationalizationData);
    return addressName ? addressName + nameAddressSingleLineBreak + singleLineAddress : singleLineAddress;
  }
  handleClick() {
    this.isExpanded = !this.isExpanded;
  }
  get expanderIconName() {
    return this.isExpanded ? 'utility:chevronup' : 'utility:chevrondown';
  }
  get expandableShipmentCartStyles() {
    return `${this.isExpanded ? 'slds-show' : 'slds-hide'}`;
  }
}