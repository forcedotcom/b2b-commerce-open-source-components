import { LightningElement, api } from 'lwc';
import labels from './labels';
import { SELECTED_FILTERS_SECTION_ID, FACETVALUE_TOGGLE_EVT, FACETVALUE_PRICE_UPDATE_EVT } from './constants';
export default class SearchFiltersSelected extends LightningElement {
  static renderMode = 'light';
  _selectedFilters;
  @api
  customClasses;
  @api
  isHeadingH1;
  @api
  isHeadingH2;
  @api
  isHeadingH3;
  @api
  isHeadingH4;
  @api
  isHeadingH5;
  @api
  isHeadingH6;
  @api
  isBody;
  @api
  customStyles;
  @api
  filterPanelState;
  @api
  set selectedFilters(value) {
    this._selectedFilters = value;
  }
  get selectedFilters() {
    return this._selectedFilters ?? [];
  }
  get sectionId() {
    return SELECTED_FILTERS_SECTION_ID;
  }
  get sectionHeader() {
    const totalAppliedFilters = this.selectedFilters?.length;
    return labels.appliedFiltersSectionTitle.replace('{count}', `(${totalAppliedFilters})`);
  }
  handleRemoveFilter(event) {
    const data = event.detail?.data;
    if (data.id === 'UnitPrice') {
      this.dispatchEvent(new CustomEvent(FACETVALUE_PRICE_UPDATE_EVT, {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: {
          shouldClearUnitPrice: true
        }
      }));
    } else {
      this.dispatchEvent(new CustomEvent(FACETVALUE_TOGGLE_EVT, {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: {
          id: data?.id,
          facetId: data?.facetId,
          checked: false
        }
      }));
    }
  }
}