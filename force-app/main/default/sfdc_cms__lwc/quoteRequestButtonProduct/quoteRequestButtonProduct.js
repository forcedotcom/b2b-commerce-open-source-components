import { api, LightningElement, wire } from 'lwc';
import Toast from 'site/commonToast';
import { getAppContext, SessionContextAdapter } from 'commerce/contextApi';
import { navigate, NavigationContext } from 'lightning/navigation';
import QuoteRequestModal from 'site/quoteRequestModal';
import { getCreateQuoteFromProduct } from 'commerce/quoteApi';
import { toCommerceErrors } from 'commerce/checkoutCartApi';
import { isDesignMode } from 'experience/clientApi';
import { quoteRequestError } from './labels';
import { isProductOutOfStock } from './utils';
export default class QuoteRequestButtonProduct extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @wire(SessionContextAdapter)
  sessionContext;
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
  quantityLabel;
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
  product;
  @api
  productInventory;
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
  get shouldShowQuoteRequestButton() {
    if (isDesignMode) {
      return true;
    }
    if (this.isDynamicBundle || this.isSetProduct || this.isSubscriptionProduct || this.isStaticBundleInNonRlmOrg) {
      return false;
    }
    const productId = this.product?.id;
    return !!productId && productId.trim().length > 0;
  }
  get isDynamicBundle() {
    return this.product?.isConfigurationAllowed === true;
  }
  get isSetProduct() {
    return this.product?.productClass === 'Set';
  }
  get isSubscriptionProduct() {
    const models = this.product?.productSellingModels;
    return Array.isArray(models) && models.length > 0;
  }
  get isStaticBundleInNonRlmOrg() {
    return this.product?.productClass === 'Bundle' && this.product?.isConfigurationAllowed === undefined;
  }
  get isQuoteRequestDisabledForInventory() {
    if (isDesignMode) {
      return false;
    }
    const quantity = Number(this.product?.quantity);
    const rawAvailable = this.productInventory?.details?.availableToOrder;
    if (!quantity || rawAvailable === undefined) {
      return false;
    }
    const availableToOrder = Number(rawAvailable);
    const purchaseQuantityRuleMinimum = this.product?.purchaseQuantityRule?.minimum;
    const classicOutOfStock = isProductOutOfStock(availableToOrder, purchaseQuantityRuleMinimum ?? null);
    const notEnoughInventory = quantity > availableToOrder;
    return classicOutOfStock || notEnoughInventory;
  }
  modalConfiguration = {};
  renderedCallback() {
    const productQuantity = Math.max(1, Number(this.product?.quantity) || 1);
    this.modalConfiguration = {
      ...this.modalConfiguration,
      showTitle: this.showTitle,
      titleText: this.titleText,
      showQuoteRequiredByDate: this.showQuoteRequiredByDate,
      isRequiredQuoteRequiredByDate: this.isRequiredQuoteRequiredByDate,
      quoteRequiredByDateLabel: this.quoteRequiredByDateLabel,
      showQuantitySelector: true,
      quantityLabel: this.quantityLabel,
      initialQuantity: productQuantity,
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
    if (this.isQuoteRequestDisabledForInventory) {
      return;
    }
    if (!this.isUserLoggedIn) {
      this.redirectToLogin();
      return;
    }
    this.processQuoteRequest();
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
    const productId = this.product?.id?.trim();
    if (!productId) {
      data.close?.();
      return;
    }
    const quantity = data.quantity != null ? Math.max(1, Number(data.quantity) || 1) : Math.max(1, Number(this.product?.quantity) || 1);
    const input = {
      quantity: String(quantity),
      comments: data.description,
      additionalFields: Object.keys(additionalFieldsMap).length > 0 ? additionalFieldsMap : undefined
    };
    const effectiveAccountId = this.sessionContext?.data?.effectiveAccountId;
    const appContext = await getAppContext();
    const currencyIsoCode = appContext?.defaultCurrency ?? undefined;
    const requestOptions = {
      productId,
      input,
      ...(effectiveAccountId != null && {
        effectiveAccountId
      }),
      ...(currencyIsoCode != null && currencyIsoCode !== '' && {
        currencyIsoCode
      })
    };
    let quoteResponse;
    try {
      quoteResponse = (await getCreateQuoteFromProduct(requestOptions)) ?? {
        quoteId: null,
        errors: []
      };
      if (quoteResponse.errors?.length > 0) {
        this.handleQuoteResponseError(quoteResponse.errors);
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
        } catch {
          // Ignore parse failures; fall through to default error handling
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
  handleQuoteResponseError(errors) {
    if (!errors?.length) {
      return;
    }
    Toast.show({
      label: quoteRequestError,
      variant: 'error'
    }, this);
  }
  handleQuoteResponseSuccess(quoteResponse) {
    if (quoteResponse.quoteId && this.navContext) {
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
  async processQuoteRequest() {
    const productQuantity = Number(this.product?.quantity);
    const quantityRule = this.product?.purchaseQuantityRule;
    await QuoteRequestModal.open({
      size: 'small',
      onsubmit: e => {
        return this.handleSubmitQuoteRequest(e.detail);
      },
      ...this.modalConfiguration,
      initialQuantity: productQuantity,
      quantityMinimum: quantityRule?.minimum,
      quantityMaximum: quantityRule?.maximum,
      quantityIncrement: quantityRule?.increment
    });
  }
}