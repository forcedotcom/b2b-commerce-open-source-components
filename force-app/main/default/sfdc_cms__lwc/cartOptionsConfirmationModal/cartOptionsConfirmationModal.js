import { api } from 'lwc';
import LightningModal from 'lightning/modal';
export default class CartOptionsConfirmationModal extends LightningModal {
  @api
  headerText;
  @api
  confirmationMessage;
  @api
  confirmButtonLabel;
  @api
  closeButtonLabel;
  @api
  iconType;
  @api
  spinnerHelpText;
  @api
  confirmAction;
  get _showIcon() {
    return this.iconType === 'confirmDelete' || this.iconType === 'confirmSave';
  }
  get _iconClass() {
    return `icon-circle icon-${this.iconType}`;
  }
  get _iconText() {
    if (this.iconType === 'confirmDelete') {
      return 'i';
    }
    if (this.iconType === 'confirmSave') {
      return '!';
    }
    return '';
  }
  _isLoading = false;
  get _isNotLoading() {
    return !this._isLoading;
  }
  handleClose() {
    this.close('close');
  }
  async handleConfirm() {
    if (this.confirmAction) {
      this._isLoading = true;
      try {
        await this.confirmAction();
        this.close('confirm');
      } catch {
        this._isLoading = false;
        this.close('error');
      }
    } else {
      this.close('confirm');
    }
  }
}