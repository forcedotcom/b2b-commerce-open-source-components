import LightningModal from 'lightning/modal';
import LABELS from './labels';
import { api } from 'lwc';
import { cartCreate } from 'commerce/checkoutCartApi';
import { createCartEditAction, dispatchActionAsync } from 'commerce/actionApi';
import { getCreateCartToastMsg } from './createCartErrorHandler';
import { showCreateCartToast, getDefaultCartName } from './createCartUtils';
export const DISALLOWED_CART_FIELD_CHARACTERS = '"\'<>@!$#&%\\{[]}';
export default class CartCreateModal extends LightningModal {
  @api
  mode = 'create';
  @api
  cartId;
  static MAX_CART_NAME_LENGTH = 250;
  static MAX_CART_DESCRIPTION_LENGTH = 250;
  static DEFAULT_IS_SECONDARY = true;
  static DEFAULT_CART_TYPE = 'Cart';
  static MAX_CART_NAME_DISPLAY_LENGTH = 25;
  static CART_NAME_ELLIPSIS = '...';
  static DISMISSAL = {
    success: 'success',
    error: 'error',
    close: 'close'
  };
  static DISALLOWED_CART_FIELD_REGEXP = (() => {
    const escaped = DISALLOWED_CART_FIELD_CHARACTERS.replace(/\\/g, '\\\\').replace(/]/g, '\\]').replace(/\[/g, '\\[');
    return new RegExp(`[${escaped}]`);
  })();
  _labels = LABELS;
  @api
  cartNameLabel;
  @api
  cartDescriptionLabel;
  get _headerLabel() {
    return this.mode === 'edit' ? LABELS.editCartConfirmTitle : LABELS.createNewCartHeader;
  }
  get _cartNameLabelText() {
    return this.cartNameLabel || LABELS.cartNameLabel;
  }
  get _cartDescriptionLabelText() {
    return this.cartDescriptionLabel || LABELS.cartDescription;
  }
  get _saveButtonLabel() {
    return this.mode === 'edit' ? LABELS.editCartConfirmButton : LABELS.createCartSaveButton;
  }
  get _spinnerHelpText() {
    return this.mode === 'edit' ? LABELS.editCartSpinnerHelpText : LABELS.spinnerHelpText;
  }
  _name = getDefaultCartName();
  _description = '';
  isCreateCartInProgress = false;
  get _isNotLoading() {
    return !this.isCreateCartInProgress;
  }
  _isSaveButtonDisabled = false;
  @api
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value || '';
  }
  @api
  get cartDescription() {
    return this._description;
  }
  set cartDescription(value) {
    this._description = value || '';
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
        input.setCustomValidity(LABELS.cartNameMandatoryErrorMessage);
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
  async handleSave() {
    const input = this.template?.querySelector('lightning-input');
    const {
      nameValue,
      isNameValid
    } = this.validateNameField(input);
    const textarea = this.template?.querySelector('lightning-textarea');
    const {
      descValue,
      isDescriptionValid
    } = this.validateDescriptionField(textarea);
    this._isSaveButtonDisabled = !isNameValid || !isDescriptionValid;
    if (isNameValid && isDescriptionValid) {
      await this.createCartAndClose(nameValue, descValue);
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
      input.setCustomValidity(LABELS.cartNameMandatoryErrorMessage);
    } else if (this.containsDisallowedCharacters(nameValue)) {
      input.setCustomValidity(LABELS.cartNameInvalidCharactersErrMsg);
    } else if (nameValue.length > CartCreateModal.MAX_CART_NAME_LENGTH) {
      input.setCustomValidity(this.cartNameMaxLengthErrorMsg());
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
        descValue,
        isDescriptionValid
      };
    }
    descValue = textarea.value?.trim() ?? '';
    if (this.containsDisallowedCharacters(descValue)) {
      textarea.setCustomValidity(LABELS.cartDescInvalidCharactersErrMsg);
    } else if (descValue.length > CartCreateModal.MAX_CART_DESCRIPTION_LENGTH) {
      textarea.setCustomValidity(this.cartDescriptionMaxLengthErrorMsg());
    } else {
      textarea.setCustomValidity('');
    }
    isDescriptionValid = textarea.reportValidity();
    return {
      descValue,
      isDescriptionValid
    };
  }
  async createCartAndClose(nameValue, descValue) {
    this.isCreateCartInProgress = true;
    try {
      if (this.mode === 'edit') {
        if (!this.cartId) {
          throw new Error('Cart ID is required for edit mode');
        }
        await dispatchActionAsync(this, createCartEditAction({
          cartId: this.cartId,
          name: nameValue,
          description: descValue || undefined
        }));
        const cartNameForToast = this.getCartNameForSuccessToast(nameValue);
        const successToastMsg = LABELS.editCartSuccessMessage.replace('{cartName}', cartNameForToast);
        showCreateCartToast(successToastMsg, 'success', this);
        if (typeof document !== 'undefined') {
          document.dispatchEvent(new CustomEvent('cartupdated', {
            bubbles: true,
            composed: true
          }));
        }
      } else {
        const cartDetails = {
          name: nameValue,
          description: descValue || undefined,
          isSecondary: CartCreateModal.DEFAULT_IS_SECONDARY,
          type: CartCreateModal.DEFAULT_CART_TYPE
        };
        const result = await cartCreate(cartDetails, {
          silent: true
        });
        const cartNameForToast = this.getCartNameForSuccessToast(nameValue);
        const successToastMsg = LABELS.createCartApiSuccessMessage.replace('{cartName}', cartNameForToast);
        showCreateCartToast(successToastMsg, 'success', this);
        if (typeof document !== 'undefined') {
          document.dispatchEvent(new CustomEvent('reloadCartList', {
            bubbles: true,
            composed: true
          }));
        }
        this.close(result?.cartId);
        return;
      }
      this.close(CartCreateModal.DISMISSAL.success);
    } catch (error) {
      const toastMsg = this.mode === 'edit' ? LABELS.editCartErrorMessage : getCreateCartToastMsg(error);
      this.notifyErrorAndDismiss(toastMsg);
    } finally {
      this.isCreateCartInProgress = false;
    }
  }
  cartNameMaxLengthErrorMsg() {
    return LABELS.cartNameMaxLengthErrMsg.replace('{maxLength}', String(CartCreateModal.MAX_CART_NAME_LENGTH));
  }
  containsDisallowedCharacters(value) {
    return CartCreateModal.DISALLOWED_CART_FIELD_REGEXP.test(value);
  }
  cartDescriptionMaxLengthErrorMsg() {
    return LABELS.cartDescriptionMaxLengthErrMsg.replace('{maxLength}', String(CartCreateModal.MAX_CART_DESCRIPTION_LENGTH));
  }
  getCartNameForSuccessToast(cartName) {
    if (cartName.length > CartCreateModal.MAX_CART_NAME_DISPLAY_LENGTH) {
      const truncateLength = CartCreateModal.MAX_CART_NAME_DISPLAY_LENGTH - CartCreateModal.CART_NAME_ELLIPSIS.length;
      return cartName.slice(0, truncateLength) + CartCreateModal.CART_NAME_ELLIPSIS;
    }
    return cartName;
  }
  notifyErrorAndDismiss(toastMessage) {
    showCreateCartToast(toastMessage, 'error', this);
    this.close(CartCreateModal.DISMISSAL.error);
  }
  handleClose() {
    this.close(CartCreateModal.DISMISSAL.close);
  }
}