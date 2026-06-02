import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { CancelLabel, DeleteLabel, DeleteHeaderText, DeleteText, DefaultLabel, DefaultHeaderText, DefaultText, ShareLabel, UnshareLabel, ShareModalHeaderText, UnshareModalHeaderText, ShareButtonLabel, UnShareButtonLabel } from './labels';
import { DELETE_SAVED_PAYMENT_METHOD_EVENT_NAME, DEFAULT_SAVED_PAYMENT_METHOD_EVENT_NAME, SHARE_SAVED_PAYMENT_METHOD_MODAL_NAME, UNSHARE_SAVED_PAYMENT_METHOD_MODAL_NAME } from './utils';
export default class PaymentSavedMethodsActionModal extends LightningModal {
  _modalName;
  _eventActionType;
  _recordId;
  _recordTitle;
  _subscriptions = [];
  labels = {};
  @api
  get eventActionType() {
    return this._eventActionType;
  }
  set eventActionType(value) {
    this._eventActionType = value;
  }
  @api
  get modalName() {
    return this._modalName;
  }
  set modalName(value) {
    this._modalName = value;
  }
  @api
  get recordId() {
    return this._recordId;
  }
  set recordId(value) {
    this._recordId = value;
  }
  @api
  get recordTitle() {
    return this._recordTitle;
  }
  set recordTitle(value) {
    this._recordTitle = value;
    this.setLabels();
  }
  @api
  get subscriptions() {
    return this._subscriptions;
  }
  set subscriptions(value) {
    this._subscriptions = value;
  }
  get hasSubscriptions() {
    return this.subscriptions.length > 0;
  }
  handleCancel() {
    this.close('close');
  }
  handleConfirm() {
    this.close({
      recordId: this.recordId,
      recordTitle: this.recordTitle,
      eventName: this.eventActionType
    });
  }
  setLabels() {
    if (this.eventActionType === DELETE_SAVED_PAYMENT_METHOD_EVENT_NAME) {
      this.labels = {
        cancelLabel: CancelLabel,
        confirmLabel: DeleteLabel,
        headerText: DeleteHeaderText,
        bodyText: DeleteText.replace('{0}', `${this.recordTitle}`)
      };
    } else if (this.eventActionType === DEFAULT_SAVED_PAYMENT_METHOD_EVENT_NAME) {
      this.labels = {
        cancelLabel: CancelLabel,
        confirmLabel: DefaultLabel,
        headerText: DefaultHeaderText,
        bodyText: DefaultText.replace('{0}', `${this.recordTitle}`)
      };
    } else if (this.modalName === SHARE_SAVED_PAYMENT_METHOD_MODAL_NAME) {
      this.labels = {
        cancelLabel: CancelLabel,
        confirmLabel: ShareButtonLabel,
        headerText: ShareModalHeaderText,
        bodyText: ShareLabel.replace('{0}', `${this.recordTitle}`)
      };
    } else if (this.modalName === UNSHARE_SAVED_PAYMENT_METHOD_MODAL_NAME) {
      this.labels = {
        cancelLabel: CancelLabel,
        confirmLabel: UnShareButtonLabel,
        headerText: UnshareModalHeaderText,
        bodyText: UnshareLabel.replace('{0}', `${this.recordTitle}`)
      };
    }
  }
}