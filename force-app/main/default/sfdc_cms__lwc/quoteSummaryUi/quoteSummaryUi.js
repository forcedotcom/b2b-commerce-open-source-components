import { LightningElement, api } from 'lwc';
import labels from './labels';
import { getFieldNameFromEntity } from './fieldNameGenerator';
export default class QuoteSummaryUi extends LightningElement {
  static renderMode = 'light';
  @api
  quoteId;
  @api
  quoteNumber;
  @api
  currencyCode;
  @api
  status;
  @api
  products;
  @api
  productCount;
  @api
  quoteDetailUrl;
  @api
  fields;
  @api
  viewDetailsLinkLabel;
  get _labels() {
    return labels;
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
  get productMedia() {
    return this.products?.map(product => product.image) ?? [];
  }
  get _viewDetailAssistiveText() {
    return this._labels.detailsAssistiveText.replace('{quoteNumber}', this.quoteNumber || '');
  }
  get _showViewDetailsLink() {
    return !!((this.viewDetailsLinkLabel || []).length && this.quoteId);
  }
  handleQuoteDetailNavigation(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('navigatetoquotedetail', {
      bubbles: true,
      composed: true
    }));
  }
}