import { LightningElement, api } from 'lwc';
import { getCarts, cartReload } from 'commerce/checkoutCartApi';
import { createCartDeleteAction, createCartMakePrimaryAction, createCartClearAction, dispatchAction } from 'commerce/actionApi';
import CartOptionsConfirmationModal from 'site/cartOptionsConfirmationModal';
import CreateCartModal from 'site/cartCreateModal';
import Toast from 'site/commonToast';
import LABELS from './labels';
export default class CartOptions extends LightningElement {
  static renderMode = 'light';
  static MAX_CART_NAME_DISPLAY_LENGTH = 25;
  static CART_NAME_ELLIPSIS = '...';
  @api
  cartData;
  @api
  variant = 'container';
  @api
  cartNameLabel;
  @api
  cartDescriptionLabel;
  @api
  optionsDropdownLabel;
  @api
  editCartLabel;
  @api
  markAsDefaultLabel;
  @api
  deleteCartLabel;
  isLoading = false;
  get _optionsLabel() {
    return this.optionsDropdownLabel || LABELS.optionsLabel;
  }
  get _editCartLabel() {
    return this.editCartLabel || LABELS.editCart;
  }
  get _clearCartLabel() {
    return LABELS.clearCart;
  }
  get _markAsDefaultLabel() {
    return this.markAsDefaultLabel || LABELS.setAsDefault;
  }
  get options() {
    const opts = [{
      label: this._editCartLabel,
      value: 'edit'
    }, {
      label: this._clearCartLabel,
      value: 'clear'
    }];
    if (this.cartData?.isSecondary) {
      opts.push({
        label: this._markAsDefaultLabel,
        value: 'setAsDefault'
      });
    }
    return opts;
  }
  get _deleteCartLabel() {
    return this.deleteCartLabel || LABELS.deleteCart;
  }
  async handleSelect(event) {
    const action = event.detail.value;
    try {
      switch (action) {
        case 'edit':
          await this.handleEdit();
          break;
        case 'clear':
          await this.handleClear();
          break;
        case 'delete':
          await this.handleDelete();
          break;
        case 'setAsDefault':
          await this.handleSetAsDefault();
          break;
        default:
          console.warn('[cartOptions] Unknown action:', action);
      }
    } catch {
      // Swallowed to prevent unhandled rejections from async event handlers
    }
  }
  async handleEdit() {
    try {
      const result = await CreateCartModal.open({
        size: 'small',
        mode: 'edit',
        cartId: this.cartData?.cartId,
        name: this.cartData?.name,
        cartDescription: this.cartData?.description,
        cartNameLabel: this.cartNameLabel,
        cartDescriptionLabel: this.cartDescriptionLabel
      });
      if (result === 'success') {
        this.dispatchEvent(new CustomEvent('cartupdated', {
          bubbles: true,
          composed: true
        }));
      }
    } catch (error) {
      console.error('[cartOptions] Error opening edit modal:', error);
    }
  }
  async handleClear() {
    try {
      const result = await CartOptionsConfirmationModal.open({
        size: 'small',
        headerText: LABELS.clearCart,
        confirmationMessage: LABELS.clearCartConfirmMessage,
        confirmButtonLabel: LABELS.clearCartConfirmButton,
        closeButtonLabel: LABELS.cancelButton,
        iconType: 'confirmDelete',
        spinnerHelpText: LABELS.clearCartSpinnerHelpText,
        confirmAction: () => this.executeClearCart()
      });
      if (result === 'confirm') {
        cartReload();
        this.dispatchEvent(new CustomEvent('cartcleared', {
          bubbles: true,
          composed: true,
          detail: {
            cartId: this.cartData?.cartId
          }
        }));
      }
    } catch (error) {
      console.error('[cartOptions] Error opening clear cart modal:', error);
    }
  }
  executeClearCart() {
    if (!this.cartData?.cartId) {
      return Promise.reject(new Error('Cart ID is required for clear cart action'));
    }
    return new Promise((resolve, reject) => {
      dispatchAction(this, createCartClearAction(), {
        onSuccess: () => {
          const cartNameForToast = this.getCartNameForSuccessToast(this.cartData?.name ?? '');
          const successMsg = cartNameForToast ? LABELS.clearCartSuccessMessage.replace('{cartName}', cartNameForToast) : LABELS.clearCartSuccessMessage.replace(' "{cartName}"', '');
          const toast = {
            label: successMsg,
            variant: 'success'
          };
          Toast.show(toast, this);
          resolve();
        },
        onError: error => {
          console.error('[cartOptions] Error clearing cart:', error);
          const toast = {
            label: LABELS.clearCartErrorMessage,
            variant: 'error'
          };
          Toast.show(toast, this);
          reject(error);
        }
      });
    });
  }
  async handleDelete() {
    try {
      const result = await CartOptionsConfirmationModal.open({
        size: 'small',
        headerText: LABELS.deleteCartConfirmTitle,
        confirmationMessage: LABELS.deleteCartConfirmMessage,
        confirmButtonLabel: LABELS.deleteCartConfirmButton,
        closeButtonLabel: LABELS.cancelButton,
        iconType: 'confirmDelete',
        spinnerHelpText: LABELS.deleteCartSpinnerHelpText,
        confirmAction: () => this.executeDeleteAsync()
      });
      if (result === 'confirm') {
        this.dispatchEvent(new CustomEvent('cartdeleted', {
          bubbles: true,
          composed: true,
          detail: {
            cartId: this.cartData?.cartId
          }
        }));
      }
    } catch (error) {
      console.error('[cartOptions] Error showing delete confirmation:', error);
    }
  }
  executeDeleteAsync() {
    return new Promise((resolve, reject) => {
      dispatchAction(this, createCartDeleteAction({
        cartId: this.cartData?.cartId ?? ''
      }), {
        onSuccess: () => {
          const cartNameForToast = this.getCartNameForSuccessToast(this.cartData?.name ?? '');
          const successMsg = LABELS.deleteCartSuccessMessage.replace('{cartName}', cartNameForToast);
          const toast = {
            label: successMsg,
            variant: 'success'
          };
          Toast.show(toast, this);
          resolve();
        },
        onError: error => {
          console.error('[cartOptions] Error deleting cart:', error);
          const toast = {
            label: LABELS.deleteCartErrorMessage,
            variant: 'error'
          };
          Toast.show(toast, this);
          reject(error);
        }
      });
    });
  }
  async handleSetAsDefault() {
    const hasDefaultCart = await this.checkDefaultCartExists();
    if (hasDefaultCart) {
      const result = await CartOptionsConfirmationModal.open({
        size: 'small',
        headerText: LABELS.setAsDefaultTitle,
        confirmationMessage: LABELS.setAsDefaultConfirmMessage,
        confirmButtonLabel: LABELS.setAsDefaultConfirmButton,
        closeButtonLabel: LABELS.cancelButton,
        iconType: 'confirmSave',
        spinnerHelpText: LABELS.setAsDefaultSpinnerHelpText,
        confirmAction: () => this.executeSetAsDefaultAsync()
      });
      if (result === 'confirm') {
        cartReload();
        this.dispatchEvent(new CustomEvent('cartprimarychanged', {
          bubbles: true,
          composed: true
        }));
      }
    } else {
      await this.executeSetAsDefaultAsync();
      cartReload();
      this.dispatchEvent(new CustomEvent('cartprimarychanged', {
        bubbles: true,
        composed: true
      }));
    }
  }
  async checkDefaultCartExists() {
    try {
      const cartListData = await getCarts({
        pageSize: 1,
        pageNumber: 1
      });
      const firstCart = cartListData?.carts?.[0];
      return firstCart?.isSecondary === false;
    } catch (error) {
      console.error('[cartOptions] Error checking for default cart:', error);
      return false;
    }
  }
  executeSetAsDefaultAsync() {
    if (!this.cartData?.cartId) {
      return Promise.reject(new Error('Cart ID is required for set as default action'));
    }
    const cartId = this.cartData.cartId;
    return new Promise((resolve, reject) => {
      dispatchAction(this, createCartMakePrimaryAction({
        cartId
      }), {
        onSuccess: () => {
          const cartNameForToast = this.getCartNameForSuccessToast(this.cartData?.name ?? '');
          const successMsg = LABELS.setAsDefaultSuccessMessage.replace('{cartName}', cartNameForToast);
          const toast = {
            label: successMsg,
            variant: 'success'
          };
          Toast.show(toast, this);
          resolve();
        },
        onError: error => {
          console.error('[cartOptions] Error setting cart as default:', error);
          const toast = {
            label: LABELS.setAsDefaultErrorMessage,
            variant: 'error'
          };
          Toast.show(toast, this);
          reject(error);
        }
      });
    });
  }
  getCartNameForSuccessToast(cartName) {
    if (cartName.length > CartOptions.MAX_CART_NAME_DISPLAY_LENGTH) {
      const truncateLength = CartOptions.MAX_CART_NAME_DISPLAY_LENGTH - CartOptions.CART_NAME_ELLIPSIS.length;
      return cartName.slice(0, truncateLength) + CartOptions.CART_NAME_ELLIPSIS;
    }
    return cartName;
  }
}