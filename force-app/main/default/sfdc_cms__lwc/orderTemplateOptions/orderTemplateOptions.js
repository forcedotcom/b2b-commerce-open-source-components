import { LightningElement, api } from 'lwc';
import { createWishlistDeleteAction, dispatchAction } from 'commerce/actionApi';
import CreateOrderTemplateModal from 'site/productCreateOrderTemplateModal';
import CartOptionsConfirmationModal from 'site/cartOptionsConfirmationModal';
import Toast from 'site/commonToast';
import LABELS from './labels';
const BUTTON_STYLE_TO_MENU_VARIANT = {
  primary: 'border-filled',
  secondary: 'border',
  tertiary: 'bare'
};
export default class OrderTemplateOptions extends LightningElement {
  static renderMode = 'light';
  isLoading = false;
  @api
  orderTemplateSummaryData;
  @api
  optionsDropdownLabel;
  @api
  editTemplateLabel;
  @api
  deleteTemplateLabel;
  @api
  templateNameLabel;
  @api
  templateDescriptionLabel;
  @api
  variant;
  @api
  showTemplateOptions;
  @api
  showEditTemplateOption;
  @api
  showDeleteTemplateOption;
  get _showTemplateOptions() {
    return this.showTemplateOptions !== false;
  }
  get _optionsLabel() {
    return this.optionsDropdownLabel || LABELS.optionsMenuLabel;
  }
  get _editTemplateLabel() {
    return this.editTemplateLabel || LABELS.editTemplateLabel;
  }
  get _deleteTemplateLabel() {
    return this.deleteTemplateLabel || LABELS.deleteTemplateLabel;
  }
  get _menuVariant() {
    return BUTTON_STYLE_TO_MENU_VARIANT[this.variant ?? ''] ?? 'container';
  }
  get options() {
    const opts = [];
    if (this.showEditTemplateOption !== false) {
      opts.push({
        label: this._editTemplateLabel,
        value: 'edit',
        itemClass: 'edit-menu-item'
      });
    }
    return opts;
  }
  get showDeleteOption() {
    return this.showDeleteTemplateOption !== false;
  }
  async handleSelect(event) {
    const action = event.detail.value;
    try {
      switch (action) {
        case 'edit':
          await this.handleEdit();
          break;
        case 'delete':
          await this.handleDelete();
          break;
        default:
          break;
      }
    } catch {
      // Swallowed to prevent unhandled rejections
    }
  }
  async handleEdit() {
    try {
      const result = await CreateOrderTemplateModal.open({
        size: 'small',
        mode: 'edit',
        wishlistId: this.orderTemplateSummaryData?.id,
        name: this.orderTemplateSummaryData?.name ?? '',
        templateDescription: this.orderTemplateSummaryData?.description ?? '',
        templateNameLabel: this.templateNameLabel,
        templateDescriptionLabel: this.templateDescriptionLabel
      });
      if (result === 'success') {
        this.dispatchEvent(new CustomEvent('templateupdated', {
          bubbles: true,
          composed: true
        }));
      }
    } catch (error) {
      console.error('[orderTemplateOptions] Error opening edit modal:', error);
    }
  }
  async handleDelete() {
    const wishlistId = this.orderTemplateSummaryData?.id;
    if (!wishlistId) {
      return;
    }
    try {
      const result = await CartOptionsConfirmationModal.open({
        size: 'small',
        headerText: LABELS.deleteConfirmTitle,
        confirmationMessage: LABELS.deleteConfirmMessage,
        confirmButtonLabel: LABELS.deleteConfirmButton,
        closeButtonLabel: LABELS.cancelButton,
        iconType: 'confirmDelete',
        spinnerHelpText: LABELS.deletingTemplate,
        confirmAction: () => this.executeDeleteAsync(wishlistId)
      });
      if (result === 'confirm') {
        this.dispatchEvent(new CustomEvent('templatedeleted', {
          bubbles: true,
          composed: true,
          detail: {
            wishlistId
          }
        }));
      }
    } catch (error) {
      console.error('[orderTemplateOptions] Error showing delete confirmation:', error);
    }
  }
  executeDeleteAsync(wishlistId) {
    this.isLoading = true;
    return new Promise((resolve, reject) => {
      dispatchAction(this, createWishlistDeleteAction({
        wishlistId
      }), {
        onSuccess: () => {
          const templateName = this.orderTemplateSummaryData?.name ?? '';
          const label = LABELS.deleteSuccessMessage.replace('{templateName}', () => templateName);
          const toast = {
            label,
            variant: 'success'
          };
          Toast.show(toast, this);
          this.isLoading = false;
          resolve();
        },
        onError: error => {
          console.error('[orderTemplateOptions] Error deleting template:', error);
          const templateName = this.orderTemplateSummaryData?.name ?? '';
          const label = LABELS.deleteFailureMessage.replace('{templateName}', () => templateName);
          const toast = {
            label,
            variant: 'error'
          };
          Toast.show(toast, this);
          this.isLoading = false;
          reject(error);
        }
      });
    });
  }
}