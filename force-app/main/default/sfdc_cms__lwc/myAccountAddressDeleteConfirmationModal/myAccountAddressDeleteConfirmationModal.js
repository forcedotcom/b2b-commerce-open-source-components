import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { DeleteLabel, CancelLabel, DeleteAddressHeaderText, DeleteAddressText } from './labels';
import { deleteMyAccountAddress } from 'commerce/myAccountApi';
import { getErrorInfo } from './errorHandler';
export default class MyAccountAddressDeleteConfirmationModal extends LightningModal {
  _showPageSpinner = false;
  @api
  isPreviewMode = false;
  @api
  addressId = '';
  get labels() {
    return {
      cancelLabel: CancelLabel,
      deleteLabel: DeleteLabel,
      confirmDeleteAddressHeaderText: DeleteAddressHeaderText,
      confirmDeleteAddressText: DeleteAddressText
    };
  }
  closeModal() {
    this.close('cancel');
  }
  async handleConfirmDeleteAddress() {
    try {
      this._showPageSpinner = true;
      await deleteMyAccountAddress(this.addressId);
    } catch (e) {
      if (!import.meta.env.SSR) {
        this.dispatchEvent(new CustomEvent('addresserror', {
          bubbles: true,
          composed: true,
          cancelable: false,
          detail: {
            value: getErrorInfo(e, this.isPreviewMode)
          }
        }));
      }
    } finally {
      this._showPageSpinner = false;
    }
    this.close('success');
  }
}