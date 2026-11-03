import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { getWishlists, addCartToWishlist, createWishlist } from 'commerce/wishlistApi';
import { MAX_ORDER_TEMPLATES, CREATE_NEW_TEMPLATE_VALUE, DISALLOWED_TEMPLATE_FIELD_CHARACTERS, MAX_TEMPLATE_NAME_LENGTH, MAX_TEMPLATE_DESCRIPTION_LENGTH, ORDER_TEMPLATES_SORT_ORDER, getTemplateMenuLabel, getTruncatedName } from 'site/productAddToOrderTemplate';
import Toast from 'site/commonToast';
import LABELS from './labels';
const DISALLOWED_REGEXP = (() => {
  const escaped = DISALLOWED_TEMPLATE_FIELD_CHARACTERS.replace(/\\/g, '\\\\').replace(/]/g, '\\]').replace(/\[/g, '\\[');
  return new RegExp(`[${escaped}]`);
})();
export default class CartSaveAsTemplateModal extends LightningModal {
  static DISMISSAL = {
    success: 'success',
    error: 'error',
    close: 'close'
  };
  @api
  cartId;
  @api
  cartName;
  orderTemplates = [];
  _isLoadingTemplates = true;
  _hasFetchError = false;
  _isSaving = false;
  _selectedTemplateId = null;
  _currentView = 'select';
  _newTemplateName = '';
  _newTemplateDescription = '';
  _createdWishlistId = null;
  _createdWishlistName = null;
  _isConfirmButtonDisabled = true;
  get _headerLabel() {
    return this._currentView === 'create' ? LABELS.createNewTemplateHeader : LABELS.modalHeader;
  }
  get _confirmButtonLabel() {
    return this._currentView === 'create' ? LABELS.confirmAndSaveButton : LABELS.addToTemplateButton;
  }
  get _cancelButtonLabel() {
    return LABELS.cancelButtonLabel;
  }
  get _spinnerHelpText() {
    return LABELS.savingSpinnerText;
  }
  get _dropdownLabel() {
    return LABELS.dropdownLabel;
  }
  get _dropdownPlaceholder() {
    return LABELS.dropdownPlaceholder;
  }
  get _loadingLabel() {
    return LABELS.loadingTemplates;
  }
  get _errorLabel() {
    return LABELS.fetchError;
  }
  get _goBackLabel() {
    return LABELS.goBackLabel;
  }
  get _templateNameLabel() {
    return LABELS.templateNameLabel;
  }
  get _templateDescriptionLabel() {
    return LABELS.templateDescriptionLabel;
  }
  get _showSelectView() {
    return this._currentView === 'select' && !this._isSaving;
  }
  get _showCreateView() {
    return this._currentView === 'create' && !this._isSaving;
  }
  get _showLoading() {
    return this._isLoadingTemplates;
  }
  get _showError() {
    return !this._isLoadingTemplates && this._hasFetchError;
  }
  get _showDropdown() {
    return !this._isLoadingTemplates && !this._hasFetchError;
  }
  get _isNotLoading() {
    return !this._isSaving && !this._showLoading;
  }
  updateConfirmButtonState() {
    if (this._isSaving) {
      this._isConfirmButtonDisabled = true;
    } else if (this._currentView === 'create') {
      this._isConfirmButtonDisabled = this._newTemplateName.trim().length === 0;
    } else {
      this._isConfirmButtonDisabled = !this._selectedTemplateId;
    }
  }
  get _dropdownOptions() {
    const opts = [{
      label: LABELS.createNewTemplate,
      value: CREATE_NEW_TEMPLATE_VALUE
    }];
    for (const t of this.orderTemplates) {
      opts.push({
        label: t.label,
        value: t.id
      });
    }
    return opts;
  }
  connectedCallback() {
    this.loadTemplates();
  }
  async loadTemplates() {
    this._isLoadingTemplates = true;
    this._hasFetchError = false;
    try {
      const data = await getWishlists({
        sortItemsBy: ORDER_TEMPLATES_SORT_ORDER
      });
      const summaries = data?.summaries ?? [];
      this.orderTemplates = summaries.slice(0, MAX_ORDER_TEMPLATES).map(summary => ({
        id: summary.id ?? '',
        name: summary.name ?? '',
        label: getTemplateMenuLabel(summary.name, summary.wishlistProductCount, LABELS.itemsLabel, LABELS.itemSingularLabel, true)
      }));
    } catch {
      this._hasFetchError = true;
      this.orderTemplates = [];
    } finally {
      this._isLoadingTemplates = false;
    }
  }
  handleDropdownChange(event) {
    const value = event.detail.value;
    if (value === CREATE_NEW_TEMPLATE_VALUE) {
      this._selectedTemplateId = null;
      this._currentView = 'create';
      this.updateConfirmButtonState();
      return;
    }
    this._selectedTemplateId = value;
    this.updateConfirmButtonState();
  }
  handleGoBack() {
    this._currentView = 'select';
    this._newTemplateName = '';
    this._newTemplateDescription = '';
    this._createdWishlistId = null;
    this._createdWishlistName = null;
    this.updateConfirmButtonState();
  }
  handleNameChange(event) {
    this._newTemplateName = event?.target?.value ?? '';
    this.updateConfirmButtonState();
  }
  handleNameBlur() {
    const input = this.template?.querySelector('[data-name="name"]');
    if (input) {
      const nameValue = input.value?.trim() ?? '';
      if (nameValue.length === 0) {
        input.setCustomValidity(LABELS.nameRequiredError);
      } else {
        input.setCustomValidity('');
      }
      input.reportValidity();
    }
  }
  handleDescriptionChange(event) {
    this._newTemplateDescription = event?.target?.value ?? '';
  }
  async handleConfirm() {
    if (this._isSaving) {
      return;
    }
    if (this._currentView === 'create') {
      await this.handleCreateAndSave();
    } else {
      await this.handleAddToExisting();
    }
  }
  async handleAddToExisting() {
    if (!this._selectedTemplateId) {
      return;
    }
    this._isSaving = true;
    this.updateConfirmButtonState();
    try {
      await addCartToWishlist({
        cartId: this.cartId,
        wishlistId: this._selectedTemplateId,
        persistItemQuantities: true
      });
      const template = this.orderTemplates.find(t => t.id === this._selectedTemplateId);
      const successMsg = this.formatCartTemplateMessage(LABELS.addToExistingSuccess, template?.name ?? '');
      Toast.show({
        label: successMsg,
        variant: 'success'
      }, this);
      this.close(CartSaveAsTemplateModal.DISMISSAL.success);
    } catch {
      const template = this.orderTemplates.find(t => t.id === this._selectedTemplateId);
      const errorMsg = this.formatCartTemplateMessage(LABELS.errorMessage, template?.name ?? '');
      Toast.show({
        label: errorMsg,
        variant: 'error'
      }, this);
    } finally {
      this._isSaving = false;
      this.updateConfirmButtonState();
    }
  }
  async handleCreateAndSave() {
    if (!this.validateCreateFields()) {
      return;
    }
    const name = this._newTemplateName.trim();
    this._isSaving = true;
    this.updateConfirmButtonState();
    try {
      if (!this._createdWishlistId) {
        const result = await createWishlist({
          wishlistInput: {
            name,
            description: this._newTemplateDescription.trim() || undefined
          }
        });
        const newWishlistId = result?.summary?.id;
        if (!newWishlistId) {
          const errorMsg = this.formatCartTemplateMessage(LABELS.errorMessage, name);
          Toast.show({
            label: errorMsg,
            variant: 'error'
          }, this);
          return;
        }
        this._createdWishlistId = newWishlistId;
        this._createdWishlistName = name;
      }
      await addCartToWishlist({
        cartId: this.cartId,
        wishlistId: this._createdWishlistId,
        persistItemQuantities: true
      });
      const successMsg = this.formatCartTemplateMessage(LABELS.createAndAddSuccess, this._createdWishlistName);
      Toast.show({
        label: successMsg,
        variant: 'success'
      }, this);
      if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('reloadWishlistList', {
          bubbles: true,
          composed: true
        }));
      }
      this.close(CartSaveAsTemplateModal.DISMISSAL.success);
    } catch {
      const errorMsg = this.formatCartTemplateMessage(LABELS.errorMessage, this._createdWishlistName ?? name);
      Toast.show({
        label: errorMsg,
        variant: 'error'
      }, this);
    } finally {
      this._isSaving = false;
      this.updateConfirmButtonState();
    }
  }
  formatCartTemplateMessage(labelTemplate, templateName) {
    const values = {
      cartName: getTruncatedName(this.cartName),
      templateName: getTruncatedName(templateName)
    };
    return labelTemplate.replace(/\{(cartName|templateName)\}/g, (_match, key) => values[key]);
  }
  validateCreateFields() {
    const input = this.template?.querySelector('[data-name="name"]');
    const textarea = this.template?.querySelector('[data-name="templateDescription"]');
    let isValid = true;
    if (input) {
      const nameValue = input.value?.trim() ?? '';
      if (nameValue.length === 0) {
        input.setCustomValidity(LABELS.nameRequiredError);
        isValid = false;
      } else if (DISALLOWED_REGEXP.test(nameValue)) {
        input.setCustomValidity(LABELS.nameInvalidCharsError);
        isValid = false;
      } else if (nameValue.length > MAX_TEMPLATE_NAME_LENGTH) {
        input.setCustomValidity(LABELS.nameMaxLengthError.replace('{maxLength}', String(MAX_TEMPLATE_NAME_LENGTH)));
        isValid = false;
      } else {
        input.setCustomValidity('');
      }
      input.reportValidity();
    }
    if (textarea) {
      const descValue = textarea.value?.trim() ?? '';
      if (DISALLOWED_REGEXP.test(descValue)) {
        textarea.setCustomValidity(LABELS.descInvalidCharsError);
        isValid = false;
      } else if (descValue.length > MAX_TEMPLATE_DESCRIPTION_LENGTH) {
        textarea.setCustomValidity(LABELS.descMaxLengthError.replace('{maxLength}', String(MAX_TEMPLATE_DESCRIPTION_LENGTH)));
        isValid = false;
      } else {
        textarea.setCustomValidity('');
      }
      textarea.reportValidity();
    }
    return isValid;
  }
  handleClose() {
    this.close(CartSaveAsTemplateModal.DISMISSAL.close);
  }
}