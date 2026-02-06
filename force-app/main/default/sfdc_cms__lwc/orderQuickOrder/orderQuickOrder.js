import { LightningElement, wire, api } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import { cartItemsAdd, CartStatusAdapter, toCommerceError } from 'commerce/checkoutCartApi';
import { createCartItemAddDataEvent, dispatchDataEvent, getAndRemoveSearchCorrelationId } from 'commerce/dataEventApi';
import { getErrorInfo } from 'site/cartFailedActionEvaluator';
import FORM_FACTOR from '@salesforce/client/formFactor';
import { NavigationContext, navigate } from 'lightning/navigation';
import { getEntriesWithProductDetails, createAddToCartPayload, initializeQuickOrderEntries, getInvalidEntries, addEmptyEntries, updateEntry, deleteEntry } from './orderQuickOrderUtil';
import { createToastMessage, showToastMessage } from './messageUtil';
import { defaultErrorMessage, failedItemsToastNotificationHeaderText, partiallyAddedItemsToastNotificationHeaderText, webstoreNotFoundErrorMessage, effectiveAccountNotFoundErrorMessage, invalidInputErrorMessage, insufficientAccessErrorMessage, tooManyRecordsLimitErrorMessage, notFoundErrorMessage } from './labels';
import { DEFAULT_NUMBER_OF_ENTRIES_TO_ADD_EACH_TIME, DEFAULT_NUMBER_OF_ENTRIES_TO_START, MAXIMUM_NUMBER_OF_ENTRIES, GUEST_INSUFFICIENT_ACCESS } from './constants';
const LOGIN_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Login'
  }
};

/**
 * @slot header
 * @slot productHeader
 * @slot quantityHeader
 */

export default class OrderQuickOrder extends LightningElement {
  static renderMode = 'light';
  @api
  addEntryButtonTextColor;
  @api
  addEntryButtonTextHoverColor;
  @api
  addToCartButtonBackgroundColor;
  @api
  addToCartButtonBackgroundHoverColor;
  @api
  addToCartButtonBorderColor;
  @api
  addToCartButtonBorderRadius;
  @api
  addToCartButtonProcessingText;
  @api
  addToCartButtonTextColor;
  @api
  addToCartButtonTextHoverColor;
  @api
  addToCartButtonText;
  get _computedAddToCartButtonText() {
    return this._addToCartHandlingAlreadyInProgress ? this.addToCartButtonProcessingText : this.addToCartButtonText;
  }
  get _addToCartLocalizedErrorMessages() {
    return {
      webstoreNotFound: webstoreNotFoundErrorMessage,
      effectiveAccountNotFound: effectiveAccountNotFoundErrorMessage,
      insufficientAccess: insufficientAccessErrorMessage,
      defaultErrorMessage: defaultErrorMessage,
      maximumLimitExceeded: tooManyRecordsLimitErrorMessage,
      itemNotFound: notFoundErrorMessage,
      invalidInput: invalidInputErrorMessage,
      invalidBatchSize: '',
      maximumCartItemLimitExceeded: '',
      unqualifiedCart: '',
      alreadyApplied: '',
      blockedExclusive: '',
      limitExceeded: '',
      gateDisabled: '',
      tooManyRecords: '',
      missingRecord: ''
    };
  }
  @api
  addEntryButtonText;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  @api
  numberOfLineItemsToStart = DEFAULT_NUMBER_OF_ENTRIES_TO_START;
  @api
  numberOfLineItemsToAddEachTime = DEFAULT_NUMBER_OF_ENTRIES_TO_ADD_EACH_TIME;
  @api
  searchInputPlaceHolderText;
  @api
  skuLabelText;
  _displayEntries = [];
  @api
  get displayEntries() {
    return this._displayEntries;
  }
  set displayEntries(value) {
    this._displayEntries = value;
  }
  _navContext;
  _idCounter = 0;
  _addToCartHandlingAlreadyInProgress = false;
  _showQuickOrder = false;
  get getMaximumEntryLength() {
    return MAXIMUM_NUMBER_OF_ENTRIES;
  }
  @wire(CartStatusAdapter)
  cartCapabilitiesHandler(entry) {
    if (!entry.loading) {
      this._showQuickOrder = entry?.data?.isGuestCartEnabled ?? false;
    }
  }
  connectedCallback() {
    if (this._displayEntries.length === 0) {
      this._displayEntries = initializeQuickOrderEntries(this.numberOfLineItemsToStart);
      this._idCounter += this.numberOfLineItemsToStart;
    }
  }
  handleUpdateQuickOrderEntries(event) {
    const {
      updateType,
      data
    } = event.detail;
    if (updateType === 'AddEmptyEntries') {
      this._displayEntries = addEmptyEntries(this.numberOfLineItemsToAddEachTime, [...this._displayEntries], this._idCounter, this.getMaximumEntryLength);
      this._idCounter += this.numberOfLineItemsToAddEachTime;
    } else if (updateType === 'DeleteEntry' && data) {
      this._displayEntries = deleteEntry(data, [...this._displayEntries]);
    } else if (updateType === 'UpdateEntry' && data) {
      this._displayEntries = updateEntry(data, [...this._displayEntries]);
    }
  }
  navigateToLogin() {
    navigate(this._navContext, LOGIN_PAGE_REF);
  }
  clearEntries() {
    this._displayEntries = initializeQuickOrderEntries(this.numberOfLineItemsToStart);
  }
  showToast(entriesThatCouldNotBeAddedToCart, numberofEntriesWeTriedToAdd) {
    const toastMessage = createToastMessage(entriesThatCouldNotBeAddedToCart, numberofEntriesWeTriedToAdd);
    const toastLabel = numberofEntriesWeTriedToAdd === entriesThatCouldNotBeAddedToCart.length ? failedItemsToastNotificationHeaderText : partiallyAddedItemsToastNotificationHeaderText;
    const args = FORM_FACTOR === 'Small' ? [toastMessage, '', 'warning', this] : [toastLabel, toastMessage, 'warning', this];
    showToastMessage(...args);
  }
  async handleAddToCart() {
    try {
      if (!this._addToCartHandlingAlreadyInProgress) {
        this._addToCartHandlingAlreadyInProgress = true;
        const numberOfEntriesWeTriedToAdd = getEntriesWithProductDetails(this._displayEntries).length;
        const result = await cartItemsAdd(createAddToCartPayload(this._displayEntries));
        const entriesThatCouldNotBeAddedToCart = getInvalidEntries(result, [...this._displayEntries]);
        if (result.hasErrors) {
          this.showToast(entriesThatCouldNotBeAddedToCart, numberOfEntriesWeTriedToAdd);
        }
        if (!result.hasErrors && result.results) {
          result.results.forEach(item => {
            const cartItemData = item.result;
            if (cartItemData.listPrice && cartItemData.cartId && cartItemData.currencyIsoCode) {
              const correlationId = getAndRemoveSearchCorrelationId();
              dispatchDataEvent(this, createCartItemAddDataEvent(cartItemData, cartItemData.cartId, cartItemData.currencyIsoCode, null, correlationId));
            }
          });
        }
        this.clearEntries();
      }
    } catch (error) {
      if (toCommerceError(error).code === GUEST_INSUFFICIENT_ACCESS) {
        this._addToCartHandlingAlreadyInProgress = false;
        this.navigateToLogin();
        return;
      }
      const {
        message
      } = getErrorInfo(toCommerceError(error).code, this._addToCartLocalizedErrorMessages);
      showToastMessage(message, '', 'error', this);
    } finally {
      this._addToCartHandlingAlreadyInProgress = false;
    }
  }
  @wire(NavigationContext)
  navigationContextHandler(navContext) {
    this._navContext = navContext;
  }
  get quickOrderCustomCssStyles() {
    const customStylingProperties = [{
      name: '--com-c-order-quick-order-add-entry-button-text-color',
      value: this.addEntryButtonTextColor
    }, {
      name: '--com-c-order-quick-order-add-entry-button-text-hover-color',
      value: this.addEntryButtonTextHoverColor
    }, {
      name: '--com-c-product-details-add-to-cart-button-background-color',
      value: this.addToCartButtonBackgroundColor
    }, {
      name: '--com-c-product-details-add-to-cart-button-border-color',
      value: this.addToCartButtonBorderColor
    }, {
      name: '--com-c-product-details-add-to-cart-button-border-radius',
      value: this.addToCartButtonBorderRadius ? this.addToCartButtonBorderRadius : '',
      suffix: 'px'
    }, {
      name: '--com-c-product-details-add-to-cart-button-text-color',
      value: this.addToCartButtonTextColor
    }, {
      name: '--com-c-product-details-add-to-cart-button-background-hover-color',
      value: this.addToCartButtonBackgroundHoverColor
    }, {
      name: '--com-c-product-details-add-to-cart-button-text-hover-color',
      value: this.addToCartButtonTextHoverColor
    }];
    return generateStyleProperties(customStylingProperties);
  }
}