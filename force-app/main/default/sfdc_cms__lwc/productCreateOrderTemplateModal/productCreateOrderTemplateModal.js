import LightningModal from 'lightning/modal';
import { api } from 'lwc';
import { createWishlist, updateWishlist, addItemToWishlist } from 'commerce/wishlistApi';
import Toast from 'site/commonToast';
import LABELS from './labels';
export const DISALLOWED_TEMPLATE_FIELD_CHARACTERS = '"\'<>@!$#&%\\{[]}';
const DISALLOWED_REGEXP = (() => {
  const escaped = DISALLOWED_TEMPLATE_FIELD_CHARACTERS.replace(/\\/g, '\\\\').replace(/]/g, '\\]').replace(/\[/g, '\\[');
  return new RegExp(`[${escaped}]`);
})();
export default class ProductCreateOrderTemplateModal extends LightningModal {
  @api
  mode = 'create';
  @api
  wishlistId;
  @api
  productId;
  @api
  productName;
  @api
  quantity;
  @api
  productSellingModelId;
  @api
  subscriptionTerm;
  @api
  templateNameLabel;
  @api
  templateDescriptionLabel;
  @api
  saveButtonLabel;
  @api
  cancelButtonLabel;
  static MAX_NAME_LENGTH = 250;
  static MAX_DESCRIPTION_LENGTH = 255;
  static MAX_NAME_DISPLAY_LENGTH = 25;
  static ELLIPSIS = '...';
  static DISMISSAL = {
    success: 'success',
    error: 'error',
    close: 'close'
  };
  _name = '';
  _description = '';
  isCreateInProgress = false;
  _isSaveButtonDisabled = false;
  _createdWishlistId = null;
  _createdWishlistName = null;
  _createdWishlistDescription = null;
  get _headerLabel() {
    return this.mode === 'edit' ? LABELS.editModalHeader : LABELS.modalHeader;
  }
  get _templateNameLabel() {
    return this.templateNameLabel || LABELS.templateNameLabel;
  }
  get _descriptionLabel() {
    return this.templateDescriptionLabel || LABELS.descriptionLabel;
  }
  get _saveButtonLabel() {
    if (this.mode === 'edit') {
      return LABELS.editSaveButtonLabel;
    }
    return this.saveButtonLabel || LABELS.saveButtonLabel;
  }
  get _cancelButtonLabel() {
    return this.cancelButtonLabel || LABELS.cancelButtonLabel;
  }
  get _spinnerHelpText() {
    return this.mode === 'edit' ? LABELS.editSpinnerHelpText : LABELS.spinnerHelpText;
  }
  get _isNotLoading() {
    return !this.isCreateInProgress;
  }
  @api
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value ?? '';
  }
  @api
  get templateDescription() {
    return this._description;
  }
  set templateDescription(value) {
    this._description = value ?? '';
  }
  handleNameChange(event) {
    this._name = event?.target?.value || '';
    this._isSaveButtonDisabled = false;
  }
  handleNameBlur() {
    const input = this.template?.querySelector('lightning-input');
    if (input) {
      const nameValue = input.value?.trim() ?? '';
      if (nameValue.length === 0) {
        input.setCustomValidity(LABELS.nameRequiredError);
        this._isSaveButtonDisabled = true;
      } else {
        input.setCustomValidity('');
        this._isSaveButtonDisabled = false;
      }
      input.reportValidity();
    }
  }
  handleDescriptionChange(event) {
    this._description = event?.target?.value || '';
    this._isSaveButtonDisabled = false;
  }
  handleDescriptionBlur() {
    const textarea = this.template?.querySelector('lightning-textarea');
    if (textarea) {
      const {
        isDescriptionValid
      } = this.validateDescriptionField(textarea);
      this._isSaveButtonDisabled = !isDescriptionValid;
    }
  }
  async handleSave() {
    const input = this.template?.querySelector('lightning-input');
    const textarea = this.template?.querySelector('lightning-textarea');
    const {
      nameValue,
      isNameValid
    } = this.validateNameField(input);
    const {
      descValue,
      isDescriptionValid
    } = this.validateDescriptionField(textarea);
    this._isSaveButtonDisabled = !isNameValid || !isDescriptionValid;
    if (isNameValid && isDescriptionValid) {
      await this.createTemplateAndClose(nameValue, descValue);
    }
  }
  validateNameField(input) {
    let nameValue = '';
    let isNameValid = false;
    if (!input) {
      return {
        nameValue,
        isNameValid
      };
    }
    nameValue = input.value?.trim() ?? '';
    if (nameValue.length === 0) {
      input.setCustomValidity(LABELS.nameRequiredError);
    } else if (DISALLOWED_REGEXP.test(nameValue)) {
      input.setCustomValidity(LABELS.nameInvalidCharsError);
    } else if (nameValue.length > ProductCreateOrderTemplateModal.MAX_NAME_LENGTH) {
      input.setCustomValidity(LABELS.nameMaxLengthError.replace('{maxLength}', String(ProductCreateOrderTemplateModal.MAX_NAME_LENGTH)));
    } else {
      input.setCustomValidity('');
    }
    isNameValid = input.reportValidity();
    return {
      nameValue,
      isNameValid
    };
  }
  validateDescriptionField(textarea) {
    let descValue = '';
    let isDescriptionValid = false;
    if (!textarea) {
      return {
        descValue: '',
        isDescriptionValid: true
      };
    }
    descValue = textarea.value?.trim() ?? '';
    if (DISALLOWED_REGEXP.test(descValue)) {
      textarea.setCustomValidity(LABELS.descInvalidCharsError);
    } else if (descValue.length > ProductCreateOrderTemplateModal.MAX_DESCRIPTION_LENGTH) {
      textarea.setCustomValidity(LABELS.descMaxLengthError.replace('{maxLength}', String(ProductCreateOrderTemplateModal.MAX_DESCRIPTION_LENGTH)));
    } else {
      textarea.setCustomValidity('');
    }
    isDescriptionValid = textarea.reportValidity();
    return {
      descValue,
      isDescriptionValid
    };
  }
  async createTemplateAndClose(nameValue, descValue) {
    if (this.isCreateInProgress) {
      return;
    }
    this.isCreateInProgress = true;
    try {
      if (this.mode === 'edit') {
        if (!this.wishlistId) {
          throw new Error('Wishlist ID is required for edit mode');
        }
        await updateWishlist({
          wishlistId: this.wishlistId,
          wishlistUpdateInput: {
            name: nameValue,
            description: descValue || undefined
          }
        });
        const displayName = this.getDisplayName(nameValue);
        const successMsg = LABELS.editSuccessMessage.replace('{templateName}', () => displayName);
        Toast.show({
          label: successMsg,
          variant: 'success'
        }, this);
        this.reloadWishlistList();
      } else {
        if (!this._createdWishlistId) {
          const result = await createWishlist({
            wishlistInput: {
              name: nameValue,
              description: descValue || undefined
            }
          });
          const newWishlistId = result?.summary?.id;
          if (!newWishlistId) {
            const displayName = this.getDisplayName(nameValue);
            const failureMsg = LABELS.createFailureMessage.replace('{templateName}', () => displayName);
            Toast.show({
              label: failureMsg,
              variant: 'error'
            }, this);
            return;
          }
          this._createdWishlistId = newWishlistId;
          this._createdWishlistName = nameValue;
          this._createdWishlistDescription = descValue;
        } else if (nameValue !== this._createdWishlistName || descValue !== this._createdWishlistDescription) {
          await updateWishlist({
            wishlistId: this._createdWishlistId,
            wishlistUpdateInput: {
              name: nameValue,
              description: descValue || undefined
            }
          });
          this._createdWishlistName = nameValue;
          this._createdWishlistDescription = descValue;
        }
        if (this.productId) {
          await addItemToWishlist({
            wishlistId: this._createdWishlistId,
            persistItemQuantities: true,
            wishlistItemInput: {
              productId: this.productId,
              ...(Number.isFinite(this.quantity) ? {
                quantity: this.quantity
              } : {}),
              ...(this.productSellingModelId ? {
                productSellingModelId: this.productSellingModelId
              } : {}),
              ...(Number.isFinite(this.subscriptionTerm) ? {
                subscriptionTerm: this.subscriptionTerm
              } : {})
            }
          });
        }
        const templateName = this._createdWishlistName;
        Toast.show({
          label: this.getCreateSuccessMessage(templateName),
          variant: 'success'
        }, this);
        this.reloadWishlistList();
        this.close(ProductCreateOrderTemplateModal.DISMISSAL.success);
        return;
      }
      this.close(ProductCreateOrderTemplateModal.DISMISSAL.success);
    } catch {
      const errorMsg = this.getSaveErrorMessage(nameValue);
      Toast.show({
        label: errorMsg,
        variant: 'error'
      }, this);
    } finally {
      this.isCreateInProgress = false;
    }
  }
  static formatMessage(template, ...values) {
    return template.replace(/\{(\d+)\}/g, (_match, index) => values[Number(index)] ?? '');
  }
  getCreateSuccessMessage(templateName) {
    if (this.productId) {
      const values = {
        templateName: this.getDisplayName(templateName),
        productName: this.getDisplayName(this.productName ?? '')
      };
      return LABELS.createAndAddSuccessToast.replace(/\{(templateName|productName)\}/g, (_match, key) => values[key]);
    }
    return LABELS.createSuccessMessage.replace('{templateName}', () => this.getDisplayName(templateName));
  }
  getSaveErrorMessage(templateName) {
    if (this.mode === 'edit') {
      return LABELS.editFailureMessage.replace('{templateName}', () => this.getDisplayName(templateName));
    }
    const productName = this.getDisplayName(this.productName ?? '');
    if (this._createdWishlistId && this.productId && productName) {
      return ProductCreateOrderTemplateModal.formatMessage(LABELS.addToOrderTemplateFailureToast, productName, this.getDisplayName(this._createdWishlistName));
    }
    return LABELS.createFailureMessage.replace('{templateName}', () => this.getDisplayName(templateName));
  }
  reloadWishlistList() {
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('reloadWishlistList', {
        bubbles: true,
        composed: true
      }));
    }
  }
  getDisplayName(name) {
    if (name.length > ProductCreateOrderTemplateModal.MAX_NAME_DISPLAY_LENGTH) {
      const truncateLength = ProductCreateOrderTemplateModal.MAX_NAME_DISPLAY_LENGTH - ProductCreateOrderTemplateModal.ELLIPSIS.length;
      return name.slice(0, truncateLength) + ProductCreateOrderTemplateModal.ELLIPSIS;
    }
    return name;
  }
  handleClose() {
    this.close(ProductCreateOrderTemplateModal.DISMISSAL.close);
  }
}