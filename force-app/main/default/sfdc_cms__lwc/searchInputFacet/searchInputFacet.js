import { api, LightningElement } from 'lwc';
import { NUM_FACETVALUES_ALWAYS_DISPLAYED, FACETVALUE_SHOW_MORE_LIMIT } from './constants';
import labels from './labels';
export default class SearchInputFacet extends LightningElement {
  static renderMode = 'light';
  _expanded = false;
  @api
  values;
  @api
  showFacetCounts;
  get normalizedValues() {
    return this.values || [];
  }
  @api
  type;
  @api
  facetName;
  get displayedValues() {
    let facetValues = Array.from(this.normalizedValues);
    if (this.displayShowMore && !this._expanded) {
      facetValues = facetValues.slice(0, NUM_FACETVALUES_ALWAYS_DISPLAYED);
    } else if (this.displayShowMore && this._expanded) {
      facetValues = facetValues.map((facetValue, index) => ({
        ...facetValue,
        focusOnInit: index === NUM_FACETVALUES_ALWAYS_DISPLAYED
      }));
    }
    return facetValues;
  }
  get displayShowMore() {
    return this.normalizedValues.length > FACETVALUE_SHOW_MORE_LIMIT;
  }
  get showMoreOrLessLabel() {
    return this._expanded ? labels.showLessLabel : '+' + labels.moreButtonText.replace('{count}', (this.normalizedValues.length - NUM_FACETVALUES_ALWAYS_DISPLAYED).toString());
  }
  get facetAriaLabel() {
    if (this.facetName) {
      let labelSrc = this._expanded ? labels.showLessAriaLabel : labels.showMoreAriaLabel;
      labelSrc = labelSrc.replace('{name}', this.facetName);
      return labelSrc;
    }
    return this.showMoreOrLessLabel;
  }
  handleShowMoreOrLess() {
    this._expanded = !this._expanded;
  }
  handleKeyDown(evt) {
    if (evt.key === 'Enter' || evt.code === 'Space') {
      evt.stopPropagation();
      evt.preventDefault();
      this.handleShowMoreOrLess();
    }
  }
}