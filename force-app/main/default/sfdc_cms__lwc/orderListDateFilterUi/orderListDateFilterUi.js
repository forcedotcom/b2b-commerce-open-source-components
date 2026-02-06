import { LightningElement } from 'lwc';
import { DATE_FILTER_OPTIONS, PAST_6_MONTHS, PAST_YEAR, ALL_TIME } from './constants';
import { filterText } from './labels';
const DEFAULT_SORTING_OPTION = null;
export function dateSubtract(date, duration) {
  if (date instanceof Date) {
    const newdate = new Date(date);
    if (typeof duration?.years === 'number') {
      newdate.setFullYear(newdate.getFullYear() - duration.years);
    }
    if (typeof duration?.months === 'number') {
      newdate.setMonth(newdate.getMonth() - duration.months);
    }
    if (typeof duration?.days === 'number') {
      newdate.setDate(newdate.getDate() - duration.days);
    }
    return newdate;
  }
  return undefined;
}
export default class OrderListDateFilterUi extends LightningElement {
  static renderMode = 'light';
  get _dateFilterByOptions() {
    return DATE_FILTER_OPTIONS;
  }
  get _filterByLabel() {
    return filterText;
  }
  get menuAlignment() {
    return this._layoutAlignment;
  }
  get containerClass() {
    return `slds-align-middle slds-grid slds-wrap slds-container--${this._layoutAlignment}`;
  }
  get defaultSelected() {
    return [PAST_6_MONTHS];
  }
  _layoutAlignment = 'right';
  renderedCallback() {
    const container = this.querySelector('.container');
    if (container) {
      this._layoutAlignment = getComputedStyle(container).getPropertyValue('--order-list-filter-layout-alignment');
    }
  }
  connectedCallback() {
    const dateFilterOption = this._calculateDateRange(PAST_6_MONTHS, new Date());
    this.dispatchEvent(new CustomEvent('initfilter', {
      bubbles: true,
      composed: true,
      detail: {
        dateFilterOption
      }
    }));
  }
  dropdownSelectHandler(event) {
    const selectedDateFilter = event.detail.selected;
    const dateFilterOption = this._calculateDateRange(selectedDateFilter, new Date());
    this.dispatchEvent(new CustomEvent('filterbydate', {
      bubbles: true,
      composed: true,
      detail: {
        dateFilterOption
      }
    }));
  }
  _calculateDate(monthsToSubtract, yearsToSubtract, date) {
    const subtractedDate = dateSubtract(date, {
      months: monthsToSubtract,
      years: yearsToSubtract
    });
    subtractedDate?.setHours(0, 0, 0, 0);
    return this._getUTCDate(subtractedDate);
  }
  _getEndDate(date) {
    date.setHours(23, 59, 59, 999);
    return this._getUTCDate(date);
  }
  _calculateDateRange(selectedDateFilter, date) {
    switch (selectedDateFilter) {
      case ALL_TIME:
        return {
          startDate: null,
          endDate: null,
          sort: DEFAULT_SORTING_OPTION
        };
      case PAST_6_MONTHS:
        return {
          startDate: this._calculateDate(6, 0, date),
          endDate: this._getEndDate(date),
          sort: DEFAULT_SORTING_OPTION
        };
      case PAST_YEAR:
        return {
          startDate: this._calculateDate(0, 1, date),
          endDate: this._getEndDate(date),
          sort: DEFAULT_SORTING_OPTION
        };
      default:
        return {
          startDate: this._calculateDate(6, 0, date),
          endDate: this._getEndDate(date),
          sort: DEFAULT_SORTING_OPTION
        };
    }
  }
  _getUTCDate(date) {
    return date?.toISOString().replace('Z', '-0000');
  }
}