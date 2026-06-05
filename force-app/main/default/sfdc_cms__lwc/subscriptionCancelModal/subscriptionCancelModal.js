import { api } from 'lwc';
import { unsubscribeItem, getARCToastMsg } from 'commerce/subscriptionApi';
import LightningModal from 'lightning/modal';
import Toast from 'site/commonToast';
import LABELS from './labels';
import { formatDate } from 'site/subscriptionAmendModal';
import LOCALE from '@salesforce/i18n/locale';
export default class SubscriptionCancelModal extends LightningModal {
  @api
  subscriptionId;
  @api
  nextBillingDate;
  @api
  cancelButtonLabel;
  get _cancelButtonLabel() {
    return this.cancelButtonLabel || LABELS.cancelSubscriptionButtonLabel;
  }
  _cancelConfirmationOnNextBillingDateMsg = '';
  get _showCancelConfirmationWithNBDMsg() {
    if (this.nextBillingDate == null || this.nextBillingDate === '' || this.nextBillingDate === undefined) {
      return false;
    }
    this._cancelConfirmationOnNextBillingDateMsg = this.cancelConfirmationOnNextBillingDateMsg;
    return true;
  }
  _isLoading = false;
  _labels = LABELS;
  get _isNotLoading() {
    return !this._isLoading;
  }
  handleClose() {
    this.close('close');
  }
  get cancelConfirmationOnNextBillingDateMsg() {
    const nextBillingDate = formatDate(LOCALE, this.nextBillingDate);
    return (LABELS.cancelConfirmationMsg ?? '').replace('{nextBillingDate}', nextBillingDate);
  }
  async handleCancelSubscription() {
    if (!this.subscriptionId) {
      return;
    }
    this._isLoading = true;
    try {
      await unsubscribeItem({
        subscriptionIds: [this.subscriptionId]
      });
      Toast.show({
        label: LABELS.cancellationInitiationSuccessToastLabel,
        variant: 'success'
      }, this);
      this.close('close');
    } catch (exception) {
      this._isLoading = false;
      const toastMsg = getARCToastMsg(exception, LABELS.cancellationInitiationFailedToastLabel);
      Toast.show({
        label: toastMsg,
        variant: 'error'
      }, this);
    }
  }
}