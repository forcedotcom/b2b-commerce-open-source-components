import { api, LightningElement, wire } from 'lwc';
import Toast from 'site/commonToast';
import { SessionContextAdapter } from 'commerce/contextApi';
import { CurrentPageReference, navigate, NavigationContext } from 'lightning/navigation';
import QuoteRequestModal from 'site/quoteRequestModal';
import { createQuoteFromCart } from 'commerce/quoteApi';
import { CartContentsAdapter, CartStatusAdapter, toCommerceErrors } from 'commerce/checkoutCartApi';
import { isDesignMode } from 'experience/clientApi';
import { bundleRequestError, quoteRequestError, subscriptionRequestError, secondaryCartQuoteError } from './labels';
import { asNonEmptyString } from './utils';
export default class QuoteRequestButton extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @wire(SessionContextAdapter)
  sessionContext;
  _currentPageReference;
  get effectiveCartId() {
    if (this._currentPageReference?.attributes?.name === 'Current_Cart') {
      return 'current';
    }
    const cartIdFromRecordId = asNonEmptyString(this._currentPageReference?.state?.recordId);
    return cartIdFromRecordId ?? 'current';
  }
  @wire(CurrentPageReference)
  wireCurrentPageReference(pageRef) {
    if (pageRef) {
      this._currentPageReference = pageRef;
    }
  }
  @wire(CartContentsAdapter, {
    cartId: '$effectiveCartId'
  })
  cartContentsEntry;
  @wire(CartStatusAdapter)
  cartStatusHandler;
  @api
  buttonText;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  showTitle = false;
  @api
  titleText;
  @api
  showQuoteRequiredByDate = false;
  @api
  quoteRequiredByDateLabel;
  @api
  isRequiredQuoteRequiredByDate = false;
  @api
  showDescription = false;
  @api
  descriptionLabel;
  @api
  isRequiredDescription = false;
  @api
  showInfotext = false;
  @api
  infoText;
  @api
  additionalFields;
  @api
  cancelButtonLabel;
  @api
  sendRequestButtonLabel;
  @api
  sendRequestButtonSize;
  @api
  cancelButtonSize;
  @api
  cartId;
  get additionalFieldsArray() {
    const fieldsRaw = this.additionalFields ? JSON.parse(this.additionalFields) : JSON.parse('[]');
    return this.convertToCustomFieldsArray(fieldsRaw);
  }
  convertToCustomFieldsArray(fieldsRaw) {
    return fieldsRaw.map(field => {
      const fieldJSON = {
        name: field.name,
        label: field.label,
        required: false,
        value: ''
      };
      return fieldJSON;
    });
  }
  get content() {
    return this.buttonText ?? 'Request Quote';
  }
  get isUserLoggedIn() {
    return this.sessionContext?.data?.isLoggedIn ?? false;
  }
  get activeCartId() {
    return this.cartId;
  }
  get cartSummary() {
    return this.cartContentsEntry?.data?.cartSummary;
  }
  get hasProducts() {
    if (isDesignMode) {
      return true;
    }
    return Number(this.cartSummary?.totalProductCount) > 0;
  }
  get hasQuoteLineItemsInCart() {
    const cartItems = this.cartContentsEntry?.data?.cartItems;
    if (!Array.isArray(cartItems)) {
      return false;
    }
    return cartItems.some(itemSummary => itemSummary?.cartItem?.quoteLineItemId != null);
  }
  get shouldShowQuoteRequestButton() {
    if (isDesignMode) {
      return true;
    }
    return this.hasProducts && !this.hasQuoteLineItemsInCart;
  }
  get isSecondaryCart() {
    return this.cartSummary?.isSecondary === true;
  }
  get isCartProcessing() {
    let val = !!this.cartStatusHandler?.data?.isProcessing || !!this.cartContentsEntry?.loading;
    if (typeof window !== 'undefined') {
      val = val || !!this.cartStatusHandler?.loading;
    }
    return val;
  }
  get cartHasError() {
    return !!this.cartStatusHandler?.error || !!this.cartContentsEntry?.error;
  }
  get isDisabled() {
    return !this.hasProducts || this.isCartProcessing || this.cartHasError || this.cartStatusHandler?.data?.isReadyForCheckout === false;
  }
  cartToQuotePayload = {};
  modalConfiguration = {};
  renderedCallback() {
    this.modalConfiguration = {
      ...this.modalConfiguration,
      showTitle: this.showTitle,
      titleText: this.titleText,
      showQuoteRequiredByDate: this.showQuoteRequiredByDate,
      isRequiredQuoteRequiredByDate: this.isRequiredQuoteRequiredByDate,
      quoteRequiredByDateLabel: this.quoteRequiredByDateLabel,
      showDescription: this.showDescription,
      isRequiredDescription: this.isRequiredDescription,
      descriptionLabel: this.descriptionLabel,
      showInfotext: this.showInfotext,
      infoText: this.infoText,
      sendRequestButtonLabel: this.sendRequestButtonLabel,
      sendRequestButtonSize: this.sendRequestButtonSize,
      cancelButtonLabel: this.cancelButtonLabel,
      cancelButtonSize: this.cancelButtonSize,
      additionalFields: this.additionalFieldsArray
    };
  }
  handleRequestQuote() {
    if (this.isSecondaryCart) {
      this.showSecondaryCartError();
      return;
    }
    if (!this.isUserLoggedIn) {
      this.redirectToLogin();
      return;
    }
    this.processQuoteRequest();
  }
  showSecondaryCartError() {
    Toast.show({
      label: secondaryCartQuoteError,
      variant: 'error'
    }, this);
  }
  redirectToLogin() {
    if (this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Login'
        }
      });
    }
  }
  async handleSubmitQuoteRequest(data) {
    const additionalFieldsMap = data.additionalFields?.reduce((acc, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {}) ?? {};
    const requiredBy = (data.requiredByDate ?? '').trim();
    if (requiredBy.length > 0) {
      additionalFieldsMap.ExpirationDate = requiredBy;
    }
    this.cartToQuotePayload = {
      comments: data.description,
      additionalFields: additionalFieldsMap
    };
    let quoteResponse;
    try {
      quoteResponse = await createQuoteFromCart({
        activeCartOrId: this.activeCartId ?? '',
        input: this.cartToQuotePayload
      });
      if (quoteResponse.errors && quoteResponse.errors.length > 0) {
        const commerceErrors = quoteResponse.errors;
        this.handleQuoteResponseError(commerceErrors);
      }
      if (quoteResponse.quoteId) {
        this.handleQuoteResponseSuccess(quoteResponse);
      }
    } catch (error) {
      const storeActionError = error;
      let commerceErrors;
      if (storeActionError?.error) {
        try {
          if (typeof storeActionError.error === 'object' && storeActionError.error !== null) {
            const errorObj = storeActionError.error;
            if (Array.isArray(errorObj.errors)) {
              commerceErrors = errorObj.errors;
            }
          } else if (typeof storeActionError.error === 'string') {
            const parsed = JSON.parse(storeActionError.error);
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.errors)) {
              commerceErrors = parsed.errors;
            }
          }
        } catch (parseError) {
          // Ignore JSON parse errors - fallback to toCommerceErrors() below
        }
      }
      if (!commerceErrors || commerceErrors.length === 0) {
        commerceErrors = toCommerceErrors(error);
      }
      this.handleQuoteResponseError(commerceErrors ?? []);
    } finally {
      data.close?.();
    }
  }
  async processQuoteRequest() {
    const modal = await QuoteRequestModal.open({
      size: 'small',
      onsubmit: e => {
        this.handleSubmitQuoteRequest(e.detail);
      },
      ...this.modalConfiguration
    });
  }
  handleQuoteResponseError(errors) {
    if (!errors || errors.length === 0) {
      return;
    }
    const bundlesNotSupportedError = errors.find(error => error.code === 'BUNDLES_NOT_SUPPORTED');
    const subscriptionNotSupportedError = errors.find(error => error.code === 'SUBSCRIPTION_PRODUCTS_NOT_SUPPORTED');
    const label = subscriptionNotSupportedError ? subscriptionRequestError : bundlesNotSupportedError ? bundleRequestError : quoteRequestError;
    Toast.show({
      label,
      variant: 'error'
    }, this);
  }
  handleQuoteResponseSuccess(quoteResponse) {
    if (this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Quote'
        },
        state: {
          quoteId: quoteResponse.quoteId
        }
      });
    }
  }
}