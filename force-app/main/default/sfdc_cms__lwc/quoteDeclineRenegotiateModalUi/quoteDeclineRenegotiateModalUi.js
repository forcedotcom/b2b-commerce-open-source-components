import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import Toast from 'site/commonToast';
import { updateStatusAndNotes, refreshQuoteDetail } from 'commerce/quoteApi';
import declineOperationFailedMessage from '@salesforce/label/site.quoteDeclineRenegotiateModalUi.declineOperationFailedMessage';
import renegotiateOperationFailedMessage from '@salesforce/label/site.quoteDeclineRenegotiateModalUi.renegotiateOperationFailedMessage';
import { ACTION_DECLINE, ACTION_RENEGOTIATE, QUOTE_STATUS_DRAFT, QUOTE_STATUS_DENIED } from './constants';
export { ACTION_DECLINE, ACTION_RENEGOTIATE, QUOTE_STATUS_DRAFT, QUOTE_STATUS_DENIED, QUOTE_STATUS_APPROVED } from './constants';
export default class QuoteDeclineRenegotiateModalUi extends LightningModal {
  @api
  quoteId;
  @api
  headerText;
  @api
  subheadingText;
  @api
  notesPlaceholder;
  @api
  declineButtonLabel;
  @api
  renegotiateButtonLabel;
  notes = '';
  _isSubmitting = false;
  get isSubmitting() {
    return this._isSubmitting;
  }
  get isNotSubmitting() {
    return !this._isSubmitting;
  }
  handleNotesChange(event) {
    const target = event.target;
    this.notes = target.value;
  }
  showErrorToast(message) {
    Toast.show({
      label: message,
      variant: 'error'
    }, this);
  }
  buildPayload(action) {
    const payload = {};
    if (action === ACTION_DECLINE) {
      payload.status = QUOTE_STATUS_DENIED;
    } else if (action === ACTION_RENEGOTIATE) {
      payload.status = QUOTE_STATUS_DRAFT;
    }
    const trimmedNotes = this.notes?.trim();
    if (trimmedNotes) {
      payload.note = {
        content: trimmedNotes
      };
    }
    return payload;
  }
  async handleDeclineClick() {
    if (!this.quoteId) {
      this.close({
        action: ACTION_DECLINE
      });
      return;
    }
    this._isSubmitting = true;
    try {
      const input = this.buildPayload(ACTION_DECLINE);
      const response = await updateStatusAndNotes({
        quoteId: this.quoteId,
        input
      });
      if (response?.errors?.length) {
        this.showErrorToast(declineOperationFailedMessage);
        this.close({
          action: ACTION_DECLINE
        });
        return;
      }
      await refreshQuoteDetail({
        quoteId: this.quoteId
      });
      this.close({
        action: ACTION_DECLINE
      });
    } catch {
      this.showErrorToast(declineOperationFailedMessage);
      this.close({
        action: ACTION_DECLINE
      });
    } finally {
      this._isSubmitting = false;
    }
  }
  async handleRenegotiateClick() {
    if (!this.quoteId) {
      this.close({
        action: ACTION_RENEGOTIATE
      });
      return;
    }
    this._isSubmitting = true;
    try {
      const input = this.buildPayload(ACTION_RENEGOTIATE);
      const response = await updateStatusAndNotes({
        quoteId: this.quoteId,
        input
      });
      if (response?.errors?.length) {
        this.showErrorToast(renegotiateOperationFailedMessage);
        this.close({
          action: ACTION_RENEGOTIATE
        });
        return;
      }
      await refreshQuoteDetail({
        quoteId: this.quoteId
      });
      this.close({
        action: ACTION_RENEGOTIATE
      });
    } catch {
      this.showErrorToast(renegotiateOperationFailedMessage);
      this.close({
        action: ACTION_RENEGOTIATE
      });
    } finally {
      this._isSubmitting = false;
    }
  }
}