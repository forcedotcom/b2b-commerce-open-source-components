import { api, LightningElement } from 'lwc';
import { dynamicAttributeAccordionTitlePlural, dynamicAttributeAccordionTitleSingular } from './labels';
const MAX_DYNAMIC_ATTRIBUTES_DISPLAY_COUNT = 20;
export default class ProductDynamicAttrAccordion extends LightningElement {
  static renderMode = 'light';
  @api
  dynamicAttributes;
  @api
  currencyCode;
  _isExpanded = false;
  get _slicedDynamicAttributes() {
    if (!this.dynamicAttributes) {
      return [];
    }
    return this.dynamicAttributes.slice(0, MAX_DYNAMIC_ATTRIBUTES_DISPLAY_COUNT).map((attr, idx) => {
      return {
        key: idx,
        ...attr
      };
    });
  }
  get accordionTitle() {
    if (this.dynamicAttributes?.length === 1) {
      return dynamicAttributeAccordionTitleSingular;
    }
    return dynamicAttributeAccordionTitlePlural.replace('{0}', (this.dynamicAttributes?.length || 0).toString());
  }
  get iconName() {
    return this._isExpanded ? 'utility:chevronup' : 'utility:chevrondown';
  }
  get contentAriaHidden() {
    return !this._isExpanded;
  }
  handleTitleClick(event) {
    event.stopPropagation();
    this._isExpanded = !this._isExpanded;
  }
}