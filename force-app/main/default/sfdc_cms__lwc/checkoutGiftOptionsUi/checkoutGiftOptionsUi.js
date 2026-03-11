import { api } from 'lwc';
import { CheckoutComponentBase } from 'commerce/checkoutApi';
import { createCartItemAddAction, dispatchActionAsync, createCartItemDeleteAction } from 'commerce/actionApi';
import { CheckoutStage } from 'commerce/checkoutApi';
export default class CheckoutGiftOptionsUi extends CheckoutComponentBase {
  static renderMode = 'light';
  _labels;
  _items;
  @api
  set items(cartItems) {
    this._items = cartItems;
    this._isGiftWrapSelected = this.checkGiftWrapPresence(this._items);
  }
  get items() {
    return this._items;
  }
  _checkoutDetails;
  @api
  set checkoutDetails(details) {
    this._checkoutDetails = details;
    this.updateGiftingDetails(this._checkoutDetails);
    this.updateSplitShipmentDetails(this._checkoutDetails);
  }
  get checkoutDetails() {
    return this._checkoutDetails;
  }
  get badgeContent() {
    if (!this._isGiftingOptedByUser) {
      return this._labels?.noGiftOptionsLabel ?? '';
    }
    if (this._giftMessage && this._isGiftWrapSelected) {
      return this._labels?.giftMessageAndWrapLabel ?? '';
    }
    if (this._giftMessage) {
      return this._labels?.giftMessageLabel ?? '';
    }
    if (this._isGiftWrapSelected) {
      return this._labels?.giftWrapLabel ?? '';
    }
    return this._labels?.orderIsAGiftLabel ?? '';
  }
  _summaryMode = false;
  setAspect(newAspect) {
    this._summaryMode = newAspect.summary;
  }
  @api
  giftWraps;
  hasGiftWrap() {
    return !!this.giftWraps?.productIds?.length;
  }
  @api
  get showGiftWrap() {
    return this.isGiftWrapEnabled && this.hasGiftWrap();
  }
  @api
  set labels(value) {
    this._labels = value;
  }
  get labels() {
    return this._labels;
  }
  _isGiftingEnabled = false;
  _isGiftMessageEnabled = false;
  _isGiftWrapEnabled = false;
  _isGiftingOptedByUser = false;
  _giftMessage = '';
  giftWrapCartItemId;
  _isGiftWrapSelected = false;
  _isGiftMessagingSelected = false;
  _showDefaultGiftDelivery = false;
  @api
  get showDefaultGiftDelivery() {
    return this._showDefaultGiftDelivery;
  }
  connectedCallback() {
    this._isGiftWrapSelected = this.checkGiftWrapPresence(this._items);
    this.updateGiftingDetails(this._checkoutDetails);
    this.updateSplitShipmentDetails(this._checkoutDetails);
    this.dispatchRequestAspect({
      summarizable: true
    });
  }
  checkGiftWrapPresence(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return false;
    }
    for (const item of items) {
      if (item?.ProductDetails?.fields?.ProductPurpose === 'GiftWrap') {
        this.giftWrapCartItemId = item.id;
        return true;
      }
    }
    return false;
  }
  updateGiftingDetails(checkoutDetails) {
    const giftGroup = checkoutDetails?.deliveryGroups?.items?.find(group => group.isGift);
    if (giftGroup) {
      this._isGiftingOptedByUser = true;
      this._giftMessage = giftGroup.giftMessage ?? '';
      this._isGiftMessagingSelected = true;
    } else {
      this._isGiftingOptedByUser = false;
      this._giftMessage = '';
      this._isGiftMessagingSelected = false;
    }
  }
  updateSplitShipmentDetails(checkoutDetails) {
    const deliveryGroupSize = checkoutDetails?.deliveryGroups?.items?.length ?? 0;
    this._showDefaultGiftDelivery = this._isGiftingOptedByUser && deliveryGroupSize > 1;
  }
  @api
  get isGiftingEnabled() {
    return this._isGiftingEnabled;
  }
  set isGiftingEnabled(value) {
    this._isGiftingEnabled = value;
  }
  @api
  get isGiftingOptedByUser() {
    return this._isGiftingOptedByUser;
  }
  @api
  get isGiftMessageEnabled() {
    return this._isGiftMessageEnabled;
  }
  set isGiftMessageEnabled(value) {
    this._isGiftMessageEnabled = value;
  }
  @api
  get isGiftWrapEnabled() {
    return this._isGiftWrapEnabled;
  }
  set isGiftWrapEnabled(value) {
    this._isGiftWrapEnabled = value;
  }
  @api
  get giftMessage() {
    return this._giftMessage;
  }
  @api
  get isGiftWrapSelected() {
    return this._isGiftWrapSelected;
  }
  @api
  get isGiftMessagingSelected() {
    return this._isGiftMessagingSelected;
  }
  @api
  get getGiftWrapCartItemId() {
    return String(this.giftWrapCartItemId);
  }
  get defaultDeliveryGroupId() {
    return this.checkoutDetails?.deliveryGroups?.items[0]?.id;
  }
  handleToggleGiftOptions(event) {
    const isChecked = event.target.checked;
    this._isGiftingOptedByUser = isChecked;
    this.updateSplitShipmentDetails(this._checkoutDetails);
  }
  handleGiftMessagingSelection(event) {
    event.stopPropagation();
    this._isGiftMessagingSelected = event.detail.isGiftMessagingSelected;
  }
  handleGiftWrapEvent(event) {
    event.stopPropagation();
    this._isGiftWrapSelected = event.detail;
  }
  handleGiftMessageEvent(event) {
    event.stopPropagation();
    this._giftMessage = event.detail.giftMessage;
    this.dispatchCommit();
  }
  async reportValiditySave() {
    if (!this._isGiftingOptedByUser) {
      this._giftMessage = '';
      this._isGiftWrapSelected = false;
      this.dispatchCommit();
    }
    if (!this.isGiftMessagingSelected) {
      this._giftMessage = '';
    }
    const promises = [];
    if (this.isGiftWrapSelected && !this.checkGiftWrapPresence(this.items)) {
      promises.push(dispatchActionAsync(this, createCartItemAddAction(String(this.giftWraps?.productIds[0]))));
    } else if (!this.isGiftWrapSelected && this.checkGiftWrapPresence(this.items)) {
      promises.push(dispatchActionAsync(this, createCartItemDeleteAction(String(this.giftWrapCartItemId))));
    }
    if (this.isGiftingEnabled) {
      promises.push(this.dispatchUpdateAsync({
        deliveryGroups: {
          items: [{
            id: this.defaultDeliveryGroupId,
            isGift: this._isGiftingOptedByUser,
            giftMessage: this._giftMessage
          }]
        }
      }));
    }
    await Promise.all(promises);
    return true;
  }
  stageAction(checkoutStage) {
    switch (checkoutStage) {
      case CheckoutStage.REPORT_VALIDITY_SAVE:
        return Promise.resolve(this.reportValiditySave());
      default:
        return Promise.resolve(true);
    }
  }
}