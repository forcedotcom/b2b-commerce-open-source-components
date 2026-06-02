import { LightningElement, api } from 'lwc';
import { transformShippingFields } from './transformShippingFields';
import ORDER_LABELS from './labels';
const PAGE_SIZE = 15;
export default class OrderDeliveryGroupDisplay extends LightningElement {
  static renderMode = 'light';
  get currencyCode() {
    return this.orderDeliveryGroup?.currencyCode;
  }
  _focusedItemId;
  @api
  isMultipleOrderDeliveryGroups = false;
  _orderDeliveryGroup;
  @api
  get orderDeliveryGroup() {
    return this._orderDeliveryGroup;
  }
  set orderDeliveryGroup(orderDeliveryGroup) {
    this._orderDeliveryGroup = orderDeliveryGroup;
    this.handleShowMoreItems();
  }
  @api
  productUnavailableMessage;
  @api
  showProductImage = false;
  @api
  showChildProductImage = false;
  @api
  showMoreProductLabel;
  @api
  bundleExpandCollapseLabel;
  @api
  showTotal = false;
  @api
  textDisplayInfo;
  @api
  totalPriceTextColor;
  _allProductsLoaded = false;
  @api
  get allProductsLoaded() {
    return this._allProductsLoaded;
  }
  _lastFocusedItemId;
  _visibleProducts = [];
  _currentPage = 0;
  renderedCallback() {
    if (Boolean(this._focusedItemId?.length) && this._focusedItemId !== this._lastFocusedItemId) {
      const element = this.querySelector(`[item-id='${this._focusedItemId}']`);
      if (element) {
        const orderItemInfo = element.querySelector('site-order-item-info');
        orderItemInfo?.focusTitle();
        this._lastFocusedItemId = this._focusedItemId;
      }
    }
  }
  get _hasError() {
    return Boolean(this.orderDeliveryGroup?.orderItemsErrorMessage?.length);
  }
  get _hasItems() {
    return Boolean(this.orderDeliveryGroup?.orderItems?.length);
  }
  get _isItemListIndeterminate() {
    return !this._hasError && !Array.isArray(this.orderDeliveryGroup?.orderItems);
  }
  get _labels() {
    return ORDER_LABELS;
  }
  get _showShippingFields() {
    const shippingFields = this.orderDeliveryGroup?.shippingFields;
    const deliveryMethodNameField = shippingFields?.find(field => field.dataName === 'Name');
    return Boolean(shippingFields?.length) && (!deliveryMethodNameField || deliveryMethodNameField.text !== 'UNKNOWN');
  }
  get _transformedShippingFields() {
    return transformShippingFields(this.orderDeliveryGroup?.shippingFields);
  }
  handleShowMoreItems() {
    const focusedItemId = this._currentPage * PAGE_SIZE;
    const endIndex = (this._currentPage + 1) * PAGE_SIZE;
    this._visibleProducts = this.orderDeliveryGroup?.orderItems?.slice(0, endIndex);
    if (this.orderDeliveryGroup?.orderItems && endIndex >= this.orderDeliveryGroup?.orderItems.length) {
      this._allProductsLoaded = true;
    }
    this._focusedItemId = this._visibleProducts?.[focusedItemId]?.productId;
    this._currentPage++;
  }
}