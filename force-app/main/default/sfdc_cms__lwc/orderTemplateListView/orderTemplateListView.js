import { LightningElement } from 'lwc';
import { isDesignMode } from 'experience/clientApi';
import { ORDER_TEMPLATE_LIST_SORT_CHANGE_EVENT } from 'site/orderTemplateListSortDropdownUi';
import LABELS from './labels';
import BasePath from '@salesforce/community/basePath';

/**
 * @slot sortDropdown - Slot for the sort options component
 * @slot emptyListView - Custom empty state content
 * @slot templatesRepeater - Slot for dxp_content_layout:list with template items
 */
export default class OrderTemplateListView extends LightningElement {
  static renderMode = 'light';
  _labels = LABELS;
  _templatesCount;
  _error = false;
  _isLoading = true;
  _handleStatus = event => {
    const detail = event.detail;
    if (!detail) {
      return;
    }
    this._templatesCount = detail.count;
    this._error = detail.error;
  };
  _handleLoading = event => {
    const detail = event.detail;
    if (!detail) {
      return;
    }
    this._isLoading = detail.loading;
  };
  connectedCallback() {
    this.addEventListener(ORDER_TEMPLATE_LIST_SORT_CHANGE_EVENT, this._handleSortChange);
    this.addEventListener('ordertemplatelist:status', this._handleStatus);
    this.addEventListener('ordertemplatelist:loading', this._handleLoading);
  }
  disconnectedCallback() {
    this.removeEventListener(ORDER_TEMPLATE_LIST_SORT_CHANGE_EVENT, this._handleSortChange);
    this.removeEventListener('ordertemplatelist:status', this._handleStatus);
    this.removeEventListener('ordertemplatelist:loading', this._handleLoading);
  }
  _handleSortChange = event => {
    event.stopPropagation();
    const newSortOrder = event.detail;
    if (!newSortOrder || !this.isValidSortOrder(newSortOrder)) {
      return;
    }
    this._dispatchSortToDataProvider(newSortOrder);
  };
  _dispatchSortToDataProvider(sort) {
    const dataProvider = this.querySelector('commerce_data_provider-order-template-list-data-provider');
    if (!dataProvider) {
      return;
    }
    dataProvider.dispatchEvent(new CustomEvent('ordertemplatelist:sortchange', {
      bubbles: false,
      detail: {
        sort
      }
    }));
  }
  isValidSortOrder(value) {
    return ['CreatedDateAsc', 'CreatedDateDesc'].includes(value);
  }
  get _showLoading() {
    return !isDesignMode && this._isLoading;
  }
  get _showSlotEmptyState() {
    return isDesignMode || this._templatesCount === 0 && !this._error && !this._isLoading;
  }
  get _hasTemplates() {
    return isDesignMode || (this._templatesCount ?? 0) > 0;
  }
  get _sortDropdownSlotClasses() {
    return isDesignMode ? 'order-template-list-sort-dropdown-slot is-design-mode' : 'order-template-list-sort-dropdown-slot';
  }
  get _hasError() {
    return !isDesignMode && this._error;
  }
  get _errorSvg() {
    return `${BasePath}/assets/icons/warning-filled.svg#warning-filled`;
  }
  get _emptySvg() {
    return `${BasePath}/assets/images/empty-orderTemplate.svg`;
  }
}