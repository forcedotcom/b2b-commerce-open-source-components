import { api } from 'lwc';
import { updateSavedPaymentMethod } from 'commerce/subscriptionApi';
import LightningModal from 'lightning/modal';
import Toast from 'site/commonToast';
import LABELS from './labels';
export default class SubscriptionPaymentMethodModal extends LightningModal {
  @api
  subscriptionId;
  @api
  subscriptionName;
  @api
  savedPaymentMethodId;
  @api
  merchantAccountId;
  _isLoading = false;
  _labels = LABELS;
  get _isNotLoading() {
    return !this._isLoading;
  }
  handleClose() {
    this.close('close');
  }
  async handleUpdateSavedPaymentMethod() {
    if (!this.subscriptionId || !this.savedPaymentMethodId || !this.merchantAccountId) {
      return;
    }
    this._isLoading = true;
    const updateSavedPaymentPayload = {
      subscriptionRecordId: this.subscriptionId,
      merchantAccountId: this.merchantAccountId,
      savedPaymentMethodId: this.savedPaymentMethodId
    };
    try {
      await updateSavedPaymentMethod(updateSavedPaymentPayload);
      Toast.show({
        label: (LABELS.updateSavedPaymentMethodSuccessToastLabel ?? '').replace('{subscriptionName}', this.subscriptionName || ''),
        variant: 'success'
      }, this);
    } catch (error) {
      Toast.show({
        label: LABELS.updateSavedPaymentMethodFailedToastLabel,
        variant: 'error'
      }, this);
    }
    this.close('close');
  }
}