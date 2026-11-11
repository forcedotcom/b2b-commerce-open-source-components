import { LightningElement, api, track, wire } from 'lwc';
import ReorderModal from 'site/reorderModal';
import { NavigationContext, generateUrl, navigate } from 'lightning/navigation';
import { isPreviewMode } from 'experience/clientApi';
import { generateStyleProperties } from 'experience/styling';
import { getDefaultOrderFields } from './constants';
import { ORDER_SUMMARY_PREVIEW_VARIANTS } from './previewData';
import { getOrderFields } from './orderSummaryDataProcessor';
const ORDER_SUMMARY_TAG = 'site-order-summary';
const ORDER_LIST_TAG = 'site-order-list';
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
  showTooltip = false;
  @api
  pendingTooltipMessage;
  @api
  failedTooltipMessage;
  @api
  showOrderFailureMessage = false;
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
  @track
  _previewRowIndex = 0;
  @track
  _previewIncludePendingAndFailedOrders = false;
  _previewObserver;
  get _resolvedOrder() {
    if (isPreviewMode) {
      return this._previewOrder;
    }
    return this._order;
  }
  get _isPreviewMode() {
    return isPreviewMode;
  }
  get _previewOrder() {
    if (!this._previewIncludePendingAndFailedOrders || this._previewRowIndex >= ORDER_SUMMARY_PREVIEW_VARIANTS.length) {
      return ORDER_SUMMARY_PREVIEW_VARIANTS[0];
    }
    return ORDER_SUMMARY_PREVIEW_VARIANTS[this._previewRowIndex];
  }
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
  get _resolvedStatus() {
    return this._resolvedOrder?.fields?.Status?.text || this._resolvedOrder?.status;
  }
  get _subStatus() {
    return this._resolvedOrder?.fields?.SubStatus?.text ?? undefined;
  }
  get _orderFieldsData() {
    return getOrderFields(this._resolvedOrder?.fields, this._orderInputFields);
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
    return this._resolvedOrder?.orderProductTopLevelLineCount;
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
  renderedCallback() {
    this.setupPreview();
  }
  disconnectedCallback() {
    this._previewObserver?.disconnect();
    this._previewObserver = undefined;
  }
  setupPreview() {
    if (!isPreviewMode || this._previewObserver) {
      return;
    }
    const host = this.getHostElement();
    if (!host) {
      return;
    }
    const list = host.closest(ORDER_LIST_TAG);
    if (!list) {
      this.applyPreviewResolution(0, false);
      return;
    }
    this.recomputePreview(host, list);
    this._previewObserver = new MutationObserver(() => this.recomputePreview(host, list));
    this._previewObserver.observe(list, {
      childList: true,
      subtree: true
    });
  }
  recomputePreview(host, list) {
    const rows = Array.from(list.querySelectorAll(ORDER_SUMMARY_TAG));
    const index = Math.max(rows.indexOf(host), 0);
    this.applyPreviewResolution(index, Boolean(list.includePendingAndFailedOrders));
  }
  applyPreviewResolution(rowIndex, includePendingAndFailedOrders) {
    if (this._previewRowIndex !== rowIndex) {
      this._previewRowIndex = rowIndex;
    }
    if (this._previewIncludePendingAndFailedOrders !== includePendingAndFailedOrders) {
      this._previewIncludePendingAndFailedOrders = includePendingAndFailedOrders;
    }
  }
  getHostElement() {
    const rendered = this.querySelector('*');
    return rendered ? rendered.parentElement : null;
  }
}