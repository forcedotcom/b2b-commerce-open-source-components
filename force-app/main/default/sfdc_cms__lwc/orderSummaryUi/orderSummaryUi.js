import { LightningElement, api } from 'lwc';
import labels from './labels';
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
  orderedDate;
  @api
  fields;
  @api
  viewDetailsLinkLabel;
  @api
  reorderButtonLabel;
  @api
  products;
  @api
  productCount;
  @api
  orderDetailUrl;
  get productMedia() {
    return this.products?.map(product => product.media) ?? [];
  }
  get _labels() {
    return labels;
  }
  get _showViewDetailsLink() {
    return !!((this.viewDetailsLinkLabel || []).length && this.orderId);
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