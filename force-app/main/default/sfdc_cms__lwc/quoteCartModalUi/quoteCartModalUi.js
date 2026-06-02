import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { createCartFromQuote, refreshQuoteDetail } from 'commerce/quoteApi';
import Toast from 'site/commonToast';
import cartAlreadyContainsQuoteItemsErrorMessage from '@salesforce/label/site.quoteCartModalUi.cartAlreadyContainsQuoteItemsErrorMessage';
import subscriptionProductsNotSupportedErrorMessage from '@salesforce/label/site.quoteCartModalUi.subscriptionProductsNotSupportedErrorMessage';
import subscriptionProductCheckFailedErrorMessage from '@salesforce/label/site.quoteCartModalUi.subscriptionProductCheckFailedErrorMessage';
import duplicateToCartWithInactiveProductFailed from '@salesforce/label/site.quoteCartModalUi.duplicateToCartWithInactiveProductFailed';
import acceptAndBuyOperationErrorMessage from '@salesforce/label/site.quoteCartModalUi.acceptAndBuyOperationErrorMessage';
import duplicateCartOperationErrorMessage from '@salesforce/label/site.quoteCartModalUi.duplicateCartOperationErrorMessage';
import duplicateProductInCartErrorMessage from '@salesforce/label/site.quoteCartModalUi.duplicateProductInCartErrorMessage';
import cartCreationFailedErrorMessage from '@salesforce/label/site.quoteCartModalUi.cartCreationFailedErrorMessage';
import outOfStockError from '@salesforce/label/site.quoteCartModalUi.outOfStockError';
const DUPLICATE_PRODUCT_IN_CART = 'DUPLICATE_PRODUCT_IN_CART';
const CART_CREATION_FAILED = 'CART_CREATION_FAILED';
const CART_ALREADY_CONTAINS_QUOTE_ITEMS = 'CART_ALREADY_CONTAINS_QUOTE_ITEMS';
const SUBSCRIPTION_PRODUCTS_NOT_SUPPORTED = 'SUBSCRIPTION_PRODUCTS_NOT_SUPPORTED';
const SUBSCRIPTION_PRODUCT_CHECK_FAILED = 'SUBSCRIPTION_PRODUCT_CHECK_FAILED';
const QUOTE_CONTAINS_INVALID_PRODUCTS = 'QUOTE_CONTAINS_INVALID_PRODUCTS';
const OUT_OF_STOCK_API_MESSAGE = 'Out of stock.';
const NOT_ENOUGH_STOCK_API_MESSAGE_PATTERN = /^Not enough stock\. There is\/are only \d[\d,]*(?:\.\d+)? left in stock\.$/;
export default class QuoteCartModalUi extends LightningModal {
  @api
  mode = 'acceptQuote';
  @api
  quoteId;
  @api
  titleText;
  @api
  descriptionLabel;
  @api
  infoText;
  @api
  cancelButtonLabel;
  @api
  sendRequestButtonLabel;
  _isLoading = false;
  get _isNotLoading() {
    return !this._isLoading;
  }
  handleCloseClick() {
    if (this._isLoading) {
      return;
    }
    this.close({
      success: false,
      cancelled: true
    });
  }
  getQuoteToCartErrorMessage(error, fallback) {
    if (error?.code === CART_ALREADY_CONTAINS_QUOTE_ITEMS) {
      return cartAlreadyContainsQuoteItemsErrorMessage;
    } else if (error?.code === SUBSCRIPTION_PRODUCTS_NOT_SUPPORTED) {
      return subscriptionProductsNotSupportedErrorMessage;
    } else if (error?.code === SUBSCRIPTION_PRODUCT_CHECK_FAILED) {
      return subscriptionProductCheckFailedErrorMessage;
    }
    if (error?.code === DUPLICATE_PRODUCT_IN_CART) {
      return duplicateProductInCartErrorMessage;
    }
    if (error?.code === CART_CREATION_FAILED) {
      return cartCreationFailedErrorMessage;
    }
    if (error?.code === QUOTE_CONTAINS_INVALID_PRODUCTS) {
      return duplicateToCartWithInactiveProductFailed;
    }
    const trimmedErrorMessage = error?.message?.trim() ?? '';
    if (trimmedErrorMessage === OUT_OF_STOCK_API_MESSAGE) {
      return outOfStockError;
    }
    if (NOT_ENOUGH_STOCK_API_MESSAGE_PATTERN.test(trimmedErrorMessage)) {
      return outOfStockError;
    }
    return fallback;
  }
  get errorFallbackMessage() {
    return this.mode === 'duplicateToCart' ? duplicateCartOperationErrorMessage : acceptAndBuyOperationErrorMessage;
  }
  showErrorAndClose(firstError) {
    const message = this.getQuoteToCartErrorMessage(firstError, this.errorFallbackMessage);
    Toast.show({
      label: message,
      variant: 'error'
    }, this);
    this.close({
      success: false
    });
  }
  async handleConfirmClick() {
    if (!this.quoteId || this._isLoading) {
      return;
    }
    const operationType = this.mode === 'acceptQuote' ? 'CONVERT_TO_CART' : 'DUPLICATE_TO_CART';
    this._isLoading = true;
    try {
      const response = await createCartFromQuote({
        quoteId: this.quoteId,
        operationType
      });
      if (response.errors?.length) {
        this.showErrorAndClose(response.errors[0]);
        return;
      }
      await refreshQuoteDetail({
        quoteId: this.quoteId
      });
      this.close({
        success: true,
        cartId: response.cartId
      });
    } catch (error) {
      const err = error;
      let errorBody;
      if (typeof err?.error === 'string') {
        try {
          errorBody = JSON.parse(err.error);
        } catch {
          errorBody = undefined;
        }
      } else if (err?.error && typeof err.error === 'object') {
        errorBody = err.error;
      }
      const firstError = Array.isArray(errorBody?.errors) ? errorBody.errors[0] : undefined;
      this.showErrorAndClose(firstError);
    } finally {
      this._isLoading = false;
    }
  }
}