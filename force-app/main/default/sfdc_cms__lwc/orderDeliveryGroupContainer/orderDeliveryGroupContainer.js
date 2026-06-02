import { LightningElement, api, track } from 'lwc';
import { processOrderItemData, formatOrderItems } from './processOrderItemDataResponse';
export { processOrderItemData, formatOrderItems } from './processOrderItemDataResponse';
export default class OrderDeliveryGroupContainer extends LightningElement {
  static renderMode = 'light';
  @api
  productFieldMapping = [];
  @api
  childProductFieldMapping = [];
  @api
  isMultipleGroups = false;
  @api
  orderDeliveryGroup;
  @api
  orderDeliveryGroupSummaryId;
  @track
  _orderItemIds = [];
  @track
  _orderSummaryItemAdjustments;
  @api
  otherAdjustmentsLabel;
  @api
  showMoreProductLabel;
  @api
  bundleExpandCollapseLabel;
  @api
  prefixToShippingGroup;
  @api
  productUnavailableMessage;
  @api
  pageSize;
  @api
  showProductImage = false;
  @api
  showChildProductImage = false;
  @api
  showTotal = false;
  @api
  textDisplayInfo;
  @api
  totalPriceTextColor;
  get _orderDeliveryGroup() {
    if (this.orderDeliveryGroup && this.orderDeliveryGroup?.lineItems) {
      const odg = processOrderItemData(this.orderDeliveryGroup, formatOrderItems(this.orderDeliveryGroup?.lineItems, this.productFieldMapping, this.childProductFieldMapping, this.showTotal, this.otherAdjustmentsLabel || ''), null);
      return odg;
    }
    return undefined;
  }
  handleShowMoreItems() {
    // Delegate to the display component; event is handled internally there
  }
}