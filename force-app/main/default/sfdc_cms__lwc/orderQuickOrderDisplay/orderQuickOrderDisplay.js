import { LightningElement, api } from 'lwc';
import { isThereAnyProductToAdd, isEntryButtonDisabled, isThereAnyProductWithInvalidQuantity } from './utils';
import { generateButtonSizeClass, generateButtonStretchClass, generateElementAlignmentClass, generateButtonVariantClass } from 'experience/styling';
import { addEntryButtonAriaLabel, addToCartButtonAriaLabel } from './labels';
import { ADD_TO_CART_EVENT, UPDATE_ENTRIES_EVENT } from './constants';
export default class OrderQuickOrderDisplay extends LightningElement {
  static renderMode = 'light';
  labels = {
    addEntryButtonAriaLabel,
    addToCartButtonAriaLabel
  };
  @api
  addToCartButtonText;
  @api
  addEntryButtonText;
  @api
  addToCartInProgress = false;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  maximumNumberOfEntries;
  @api
  incrementValueGuideText;
  @api
  searchInputPlaceHolderText;
  @api
  skuLabelText;
  @api
  displayEntries;
  get isEntryButtonDisabled() {
    return isEntryButtonDisabled(this.displayEntries, this.maximumNumberOfEntries, this.addToCartInProgress);
  }
  get isAddToCartDisabled() {
    return this.addToCartInProgress || !isThereAnyProductToAdd(this.displayEntries || []) || isThereAnyProductWithInvalidQuantity(this.displayEntries);
  }
  get customAddEntryButtonClasses() {
    const classes = ['slds-button add-entry-button ', generateElementAlignmentClass('left'), generateButtonVariantClass('tertiary'), generateButtonSizeClass('standard'), generateButtonStretchClass('standard')];
    return classes.join(' ');
  }
  handleAddToCartButtonClick() {
    this.dispatchEvent(new CustomEvent(ADD_TO_CART_EVENT, {
      bubbles: true
    }));
  }
  handleEntryButtonClick() {
    this.dispatchEvent(new CustomEvent(UPDATE_ENTRIES_EVENT, {
      detail: {
        updateType: 'AddEmptyEntries'
      },
      bubbles: true
    }));
  }
}