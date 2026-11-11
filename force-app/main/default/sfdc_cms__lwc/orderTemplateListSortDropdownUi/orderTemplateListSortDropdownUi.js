import { LightningElement, api } from 'lwc';
import { sortByLabel, dateAddedNewest, dateAddedOldest } from './labels';
export const ORDER_TEMPLATE_LIST_SORT_CHANGE_EVENT = 'ordertemplatelistsortchange';
export default class OrderTemplateListSortDropdownUi extends LightningElement {
  static renderMode = 'light';
  _sortOrder = 'CreatedDateDesc';
  @api
  get sortOrder() {
    return this._sortOrder;
  }
  set sortOrder(value) {
    this._sortOrder = value ?? 'CreatedDateDesc';
  }
  @api
  label = sortByLabel;
  @api
  dateCreatedNewestLabel = dateAddedNewest;
  @api
  dateCreatedOldestLabel = dateAddedOldest;
  get selectedLabel() {
    const option = this.sortingOptions.find(opt => opt.value === this.sortOrder);
    return option?.label || this.dateCreatedNewestLabel;
  }
  get sortingOptions() {
    return [{
      label: this.dateCreatedNewestLabel,
      value: 'CreatedDateDesc',
      checked: this.sortOrder === 'CreatedDateDesc'
    }, {
      label: this.dateCreatedOldestLabel,
      value: 'CreatedDateAsc',
      checked: this.sortOrder === 'CreatedDateAsc'
    }];
  }
  handleSortChange(event) {
    event.stopPropagation();
    const newSortOrder = event.detail.value;
    this._sortOrder = newSortOrder;
    this.dispatchEvent(new CustomEvent(ORDER_TEMPLATE_LIST_SORT_CHANGE_EVENT, {
      detail: newSortOrder,
      bubbles: true,
      composed: true
    }));
    const menu = this.querySelector('lightning-button-menu');
    menu?.blur();
  }
}