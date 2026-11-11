import { LightningElement, api } from 'lwc';
import labels from './labels';
import { ORDER_STATUS, STATUS_CLASS_BASE, STATUS_CLASS_PENDING_CLOSED, STATUS_CLASS_FAILED } from './constants';
import { getFieldNameFromEntity } from './fieldNameGenerator';
export default class OrderSummaryUi extends LightningElement {
  static renderMode = 'light';
  @api
  orderId;
  @api
  orderNumber;
  @api
  currencyCode;
  @api
  status;
  @api
  statusDisplayText;
  @api
  orderedDate;
  @api
  fields;
  @api
  viewDetailsLinkLabel;
  @api
  reorderButtonLabel;
  @api
  showTooltip = false;
  @api
  pendingTooltipMessage;
  @api
  failedTooltipMessage;
  @api
  subStatus;
  @api
  showOrderFailureMessage = false;
  @api
  products;
  @api
  productCount;
  @api
  orderDetailUrl;
  get productMedia() {
    return this.products?.map(product => ({
      ...product.media,
      alternateText: product.fields?.['Product2.Name']?.text || product.media.alternateText || labels.productImageAssistiveText
    })) ?? [];
  }
  get _labels() {
    return labels;
  }
  get _statusClass() {
    switch (this.status) {
      case ORDER_STATUS.PENDING:
        return STATUS_CLASS_PENDING_CLOSED;
      case ORDER_STATUS.FAILED:
        return STATUS_CLASS_FAILED;
      default:
        return STATUS_CLASS_BASE;
    }
  }
  get _statusText() {
    return this.statusDisplayText || this.status;
  }
  get _tooltipMessage() {
    switch (this.status) {
      case ORDER_STATUS.PENDING:
        return this.pendingTooltipMessage || '';
      case ORDER_STATUS.FAILED:
        return this.failedTooltipMessage || '';
      default:
        return '';
    }
  }
  get _showTooltipIcon() {
    return this.showTooltip && this._tooltipMessage.length > 0;
  }
  get _showSubStatus() {
    return this.showOrderFailureMessage && !!this.subStatus;
  }
  get _showViewDetailsLink() {
    return !!((this.viewDetailsLinkLabel || []).length && (this.orderId || this.orderNumber));
  }
  get _recordIdentifier() {
    return this.orderId || this.orderNumber;
  }
  get _viewDetailAssistiveText() {
    return labels.detailsAssistiveText.replace('{orderNumber}', this.orderNumber || '');
  }
  get _showReorderButton() {
    return !!((this.reorderButtonLabel || []).length && this.orderId);
  }
  get _reorderButtonAssistiveText() {
    return labels.startReorderAssistiveText.replace('{orderNumber}', this.orderNumber || '');
  }
  get _updatedFields() {
    return (this.fields || []).map((field, index) => {
      return {
        ...field,
        id: index,
        isReference: field.type === 'reference' || field.type === 'id',
        showFieldName: (field.name || '').length > 0,
        ...((field.type === 'reference' || field.type === 'id') && {
          fieldName: getFieldNameFromEntity(field.value)
        })
      };
    });
  }
  handleReorder() {
    this.dispatchEvent(new CustomEvent('reorder', {
      bubbles: true,
      composed: true,
      detail: {
        orderId: this.orderId
      }
    }));
  }
}