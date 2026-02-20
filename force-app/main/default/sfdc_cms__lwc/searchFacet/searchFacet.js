import { LightningElement, api } from 'lwc';
import currencyFormatter from 'site/commonFormatterCurrency';
export const FACET_SECTION_ID = 'search-facet-section';
export default class SearchFacet extends LightningElement {
  static renderMode = 'light';
  @api
  customStyles;
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
  displayData;
  @api
  showFacetCounts;
  @api
  filterPanelState;
  get sectionId() {
    return `${FACET_SECTION_ID}-${this.normalizedDisplayData.nameOrId}`;
  }
  get normalizedDisplayData() {
    return {
      ...(this.displayData ?? {}),
      nameOrId: this.displayData?.nameOrId ?? '',
      displayType: this.displayData?.displayType ?? 'checkbox',
      values: this.displayData?.values ?? []
    };
  }
  get type() {
    return this.normalizedDisplayData.displayType;
  }
  get name() {
    if (this.normalizedDisplayData.displayName === 'Price') {
      const formattedCurrency = currencyFormatter(this.normalizedDisplayData.displayMetadata?.currencyInfo.isoCode, 1);
      return this.normalizedDisplayData.displayName + ` (${formattedCurrency.replace(/[0-9,. ]/g, '')})`;
    }
    return this.normalizedDisplayData.displayName;
  }
  get values() {
    return this.normalizedDisplayData.values;
  }
  get isRangeType() {
    return this.type === 'Range';
  }
  get currencyCode() {
    return this.normalizedDisplayData.displayMetadata?.currencyInfo.isoCode;
  }
  get minLimit() {
    return this.normalizedDisplayData.minLimit;
  }
  get maxLimit() {
    return this.normalizedDisplayData.maxLimit;
  }
  get minPrice() {
    return this.normalizedDisplayData.minPrice;
  }
  get maxPrice() {
    return this.normalizedDisplayData.maxPrice;
  }
  handleFacetToggle(event) {
    event.stopImmediatePropagation();
    this.dispatchEvent(new CustomEvent('facetvaluetoggle', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        ...event.detail,
        facetId: this.normalizedDisplayData.id
      }
    }));
  }
}