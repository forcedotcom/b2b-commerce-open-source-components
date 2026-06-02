import { LightningElement, api, wire } from 'lwc';
import ReorderModal from 'site/reorderModal';
import { NavigationContext, generateUrl, navigate } from 'lightning/navigation';
import { generateStyleProperties } from 'experience/styling';
import { getDefaultOrderFields } from './constants';
import { getOrderFields } from './orderSummaryDataProcessor';
const CART_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Current_Cart'
  }
};
const ORDER_DETAIL_PAGE_REF = {
  type: 'standard__recordPage',
  attributes: {
    objectApiName: 'OrderSummary',
    actionName: 'view'
  }
};

/**
 * @slot orderNumberLabel
 * @slot orderNumber
 */
export default class OrderSummary extends LightningElement {
  static renderMode = 'light';
  @api
  get order() {
    return this._order;
  }
  set order(order) {
    this._order = order;
    if (this._navContext) {
      this.generateOrderDetailUrl(this._navContext);
    }
  }
  @api
  orderSummaryFieldMapping;
  @api
  viewDetailsLinkLabel;
  @api
  showReorderButton = false;
  @api
  reorderButtonLabel;
  @api
  headerBgColor;
  @api
  borderColor;
  @api
  imageAspectRatio;
  @api
  imageSize;
  _navContext;
  _cartUrl;
  _order;
  _orderDetailUrl;
  @wire(NavigationContext)
  navigationContextHandler(navContext) {
    if (navContext) {
      this._cartUrl = generateUrl(navContext, CART_PAGE_REF);
      this._navContext = navContext;
      this.generateOrderDetailUrl(navContext);
    }
  }
  get _reorderButtonLabel() {
    return this.showReorderButton ? this.reorderButtonLabel : '';
  }
  get _orderFieldsData() {
    return getOrderFields(this._order?.fields, this._orderInputFields);
  }
  get _orderInputFields() {
    if (this.orderSummaryFieldMapping && this.orderSummaryFieldMapping !== '[]') {
      return JSON.parse(this.orderSummaryFieldMapping);
    }
    return getDefaultOrderFields();
  }
  get _customStyles() {
    return generateStyleProperties({
      '--com-c-order-history-card-header-bg-color': this.headerBgColor ?? '',
      '--com-c-order-history-card-border-color': this.borderColor ?? '',
      '--com-c-image-aspect-ratio': this.imageAspectRatio && parseFloat(this.imageAspectRatio) || 1,
      '--com-c-order-summary-product-object-fit': this.imageSize || 'contain'
    });
  }
  get productCount() {
    return this._order?.orderProductTopLevelLineCount;
  }
  async handleReorder(event) {
    await ReorderModal.open({
      size: 'small',
      orderSummaryIdOrRefNumber: event.detail.orderId,
      cartUrl: this._cartUrl,
      onviewcart: () => {
        navigate(this._navContext, CART_PAGE_REF);
      }
    });
  }
  generateOrderDetailUrl(navContext) {
    if (this._order) {
      ORDER_DETAIL_PAGE_REF.attributes.recordId = this._order.orderSummaryId;
      this._orderDetailUrl = generateUrl(navContext, ORDER_DETAIL_PAGE_REF);
    }
  }
  handleOrderDetailNavigation(event) {
    event.stopPropagation();
    if (this._order && this._navContext) {
      ORDER_DETAIL_PAGE_REF.attributes.recordId = this._order.orderSummaryId;
      navigate(this._navContext, ORDER_DETAIL_PAGE_REF);
    }
  }
}