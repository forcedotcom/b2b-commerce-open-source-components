import { api, LightningElement, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { SessionContextAdapter } from 'commerce/contextApi';
import { createWishlistsGetAction, createWishlistItemAddAction, dispatchAction } from 'commerce/actionApi';
import ProductCreateOrderTemplateModal from 'site/productCreateOrderTemplateModal';
import { MAX_ORDER_TEMPLATES, CREATE_NEW_TEMPLATE_VALUE, ORDER_TEMPLATES_SORT_ORDER } from './constants';
import { addToOrderTemplate, addToOrderTemplateSuccessToast, addToOrderTemplateFailureToast, fetchOrderTemplatesNoResult, fetchOrderTemplatesErrorLine1, fetchOrderTemplatesErrorLine2, fetchOrderTemplatesLoading, createNewTemplate, itemsLabel, itemSingularLabel, openModalError, configurableProductError } from './labels';
import { getTemplateMenuLabel, getOrderTemplateCountByType, getTruncatedName, showOrderTemplateSuccessToast, showOrderTemplateErrorToast, formatMessage } from './utils';
export { MAX_ORDER_TEMPLATES, MAX_NAME_LENGTH, TRAILING_DOTS, CREATE_NEW_TEMPLATE_VALUE, DISALLOWED_TEMPLATE_FIELD_CHARACTERS, MAX_TEMPLATE_NAME_LENGTH, MAX_TEMPLATE_DESCRIPTION_LENGTH, ORDER_TEMPLATES_SORT_ORDER } from './constants';
export { getTemplateMenuLabel, getTruncatedName, showOrderTemplateErrorToast } from './utils';
export default class ProductAddToOrderTemplate extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @api
  disabled;
  @api
  productId;
  @api
  productName;
  @api
  showItemCount;
  @api
  countType;
  @api
  quantity;
  @api
  isConfigurableProduct;
  @api
  productSellingModelId;
  @api
  subscriptionTerm;
  @wire(SessionContextAdapter)
  sessionContext;
  orderTemplates = [];
  _isMenuPopulated = false;
  _hasFetchError = false;
  _hasUserOpenedMenu = false;
  get _addToOrderTemplateLabel() {
    return addToOrderTemplate;
  }
  get _fetchOrderTemplatesNoResultLabel() {
    return fetchOrderTemplatesNoResult;
  }
  get _fetchOrderTemplatesErrorLine1Label() {
    return fetchOrderTemplatesErrorLine1;
  }
  get _fetchOrderTemplatesErrorLine2Label() {
    return fetchOrderTemplatesErrorLine2;
  }
  get _fetchOrderTemplatesLoadingLabel() {
    return fetchOrderTemplatesLoading;
  }
  get _createNewTemplateLabel() {
    return createNewTemplate;
  }
  get _createNewTemplateValue() {
    return CREATE_NEW_TEMPLATE_VALUE;
  }
  get _showLoading() {
    return !this._isMenuPopulated;
  }
  get _showFetchError() {
    return this._isMenuPopulated && this._hasFetchError;
  }
  get _hasNoOrderTemplates() {
    return this._isMenuPopulated && !this._hasFetchError && this.orderTemplates.length === 0;
  }
  get _hasOrderTemplates() {
    return this._isMenuPopulated && !this._hasFetchError && this.orderTemplates.length > 0;
  }
  get _showAssistiveErrorMirror() {
    return this._hasUserOpenedMenu && this._showFetchError;
  }
  get _assistiveErrorStatusText() {
    return `${this._fetchOrderTemplatesErrorLine1Label} ${this._fetchOrderTemplatesErrorLine2Label}`.trim();
  }
  get _showAssistivePoliteMirror() {
    return this._hasUserOpenedMenu && (this._showLoading || this._hasNoOrderTemplates);
  }
  get _assistivePoliteStatusText() {
    if (this._showLoading) {
      return this._fetchOrderTemplatesLoadingLabel;
    } else if (this._hasNoOrderTemplates) {
      return this._fetchOrderTemplatesNoResultLabel;
    }
    return '';
  }
  populateOrderTemplateMenuItems() {
    this._isMenuPopulated = false;
    dispatchAction(this, createWishlistsGetAction({
      sortItemsBy: ORDER_TEMPLATES_SORT_ORDER
    }), {
      onSuccess: data => {
        const summaries = data?.summaries ?? [];
        const shouldShowItemCount = this.showItemCount !== false;
        this.orderTemplates = summaries.slice(0, MAX_ORDER_TEMPLATES).map(summary => ({
          id: summary.id ?? '',
          name: summary.name ?? '',
          label: getTemplateMenuLabel(summary.name, getOrderTemplateCountByType(this.countType, summary.wishlistProductCount, summary.wishlistTotalProductCount), itemsLabel, itemSingularLabel, shouldShowItemCount)
        }));
        this._hasFetchError = false;
        this._isMenuPopulated = true;
      },
      onError: () => {
        this.orderTemplates = [];
        this._hasFetchError = true;
        this._isMenuPopulated = true;
      }
    });
  }
  handleOrderTemplateMenuOpen(event) {
    const isLoggedIn = this.sessionContext?.data?.isLoggedIn;
    if (!isLoggedIn) {
      event.preventDefault();
      event.stopPropagation();
      this.navigateToLogin();
      return;
    }
    this._hasUserOpenedMenu = true;
    this.populateOrderTemplateMenuItems();
  }
  handleMenuSelect(event) {
    const selectedValue = event?.detail?.value;
    if (!selectedValue) {
      return;
    }
    if (this.isConfigurableProduct) {
      showOrderTemplateErrorToast(configurableProductError, this);
      return;
    }
    if (selectedValue === CREATE_NEW_TEMPLATE_VALUE) {
      this.handleCreateNewTemplate();
      return;
    }
    this.handleAddToExistingTemplate(selectedValue);
  }
  handleAddToExistingTemplate(templateId) {
    const productId = this.productId;
    if (!productId) {
      return;
    }
    const selectedTemplate = this.orderTemplates.find(t => t.id === templateId);
    const selectedTemplateName = getTruncatedName(selectedTemplate?.name);
    const selectedProductName = getTruncatedName(this.productName);
    const options = {
      persistItemQuantities: true,
      ...(Number.isFinite(this.quantity) ? {
        quantity: this.quantity
      } : {}),
      ...(this.productSellingModelId ? {
        productSellingModelId: this.productSellingModelId
      } : {}),
      ...(Number.isFinite(this.subscriptionTerm) ? {
        subscriptionTerm: this.subscriptionTerm
      } : {})
    };
    dispatchAction(this, createWishlistItemAddAction(productId, templateId, options), {
      onSuccess: () => {
        const msg = this.formatToastMessage(addToOrderTemplateSuccessToast, selectedProductName, selectedTemplateName);
        showOrderTemplateSuccessToast(msg, this);
      },
      onError: () => {
        const msg = this.formatToastMessage(addToOrderTemplateFailureToast, selectedProductName, selectedTemplateName);
        showOrderTemplateErrorToast(msg, this);
      }
    });
  }
  formatToastMessage(messageTemplate, productName, templateName) {
    return formatMessage(messageTemplate, productName, templateName);
  }
  async handleCreateNewTemplate() {
    try {
      await ProductCreateOrderTemplateModal.open({
        size: 'small',
        productId: this.productId,
        productName: this.productName,
        quantity: this.quantity,
        productSellingModelId: this.productSellingModelId,
        subscriptionTerm: this.subscriptionTerm
      });
    } catch {
      showOrderTemplateErrorToast(openModalError, this);
    }
  }
  navigateToLogin() {
    this.navContext && navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
}