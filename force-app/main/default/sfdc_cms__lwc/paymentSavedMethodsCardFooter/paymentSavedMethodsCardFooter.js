import { LightningElement, api } from 'lwc';
import { AriaDeleteLabel, AriaDefaultLabel, ShareCheckboxLabel } from './labels';
import { DELETE_SAVED_PAYMENT_METHOD_EVENT_NAME, DEFAULT_SAVED_PAYMENT_METHOD_EVENT_NAME, DELETE_SAVED_PAYMENT_METHOD_MODAL_NAME, DEFAULT_SAVED_PAYMENT_METHOD_MODAL_NAME, SAVED_PAYMENT_METHOD_DEPENDENTS_EVENT_NAME, SHARE_SAVED_PAYMENT_METHOD_MODAL_NAME, SHARE_SAVED_PAYMENT_METHOD_EVENT_NAME, UNSHARE_SAVED_PAYMENT_METHOD_MODAL_NAME, CONTACT_ACCOUNT_KEY_PREFIX } from './utils';
import PaymentSavedMethodsActionModal from 'site/paymentSavedMethodsActionModal';
export default class PaymentSavedMethodsCardFooter extends LightningElement {
  static renderMode = 'light';
  deleteEvent = DELETE_SAVED_PAYMENT_METHOD_EVENT_NAME;
  defaultEvent = DEFAULT_SAVED_PAYMENT_METHOD_EVENT_NAME;
  deleteMethodDialog = DELETE_SAVED_PAYMENT_METHOD_MODAL_NAME;
  defaultMethodDialog = DEFAULT_SAVED_PAYMENT_METHOD_MODAL_NAME;
  @api
  recordId;
  @api
  recordTitle;
  @api
  deleteLabel;
  isDefaultCheckBoxChecked = false;
  @api
  set isDefault(value) {
    this.isDefaultCheckBoxChecked = value;
  }
  get isDefault() {
    return this.isDefaultCheckBoxChecked;
  }
  @api
  isExpired = false;
  @api
  defaultLabel;
  @api
  disabled = false;
  @api
  isSpmSharingEnabled = false;
  @api
  set isSavedPaymentMethodShared(value) {
    this._isSharedCheckboxChecked = value;
  }
  get isSavedPaymentMethodShared() {
    return this._isSharedCheckboxChecked;
  }
  _isSharedCheckboxChecked = false;
  @api
  isOwner = false;
  dependents;
  @api
  referenceOwnerId = '';
  handleDeleteClick() {
    this.dispatchEvent(new CustomEvent(SAVED_PAYMENT_METHOD_DEPENDENTS_EVENT_NAME, {
      bubbles: true,
      composed: true,
      cancelable: false,
      detail: {
        recordId: this.recordId,
        dependents: this.updateDependentsAndRenderModal.bind(this)
      }
    }));
  }
  handleDefaultClick(event) {
    const target = event.target;
    this.isDefaultCheckBoxChecked = target.checked;
    this.renderDefaultModal();
  }
  handleShareClick(event) {
    const target = event.target;
    this._isSharedCheckboxChecked = target.checked;
    this.renderShareModal();
  }
  async renderDeleteModal() {
    const result = await PaymentSavedMethodsActionModal.open({
      modalName: DELETE_SAVED_PAYMENT_METHOD_MODAL_NAME,
      eventActionType: DELETE_SAVED_PAYMENT_METHOD_EVENT_NAME,
      recordId: this.recordId,
      recordTitle: this.recordTitle,
      subscriptions: this.dependents?.subscriptions,
      size: 'small'
    });
    if (result && result.eventName) {
      this.dispatchEvent(new CustomEvent(result.eventName, {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail: {
          recordId: result.recordId,
          recordTitle: result.recordTitle
        }
      }));
    }
  }
  updateDependentsAndRenderModal(value) {
    this.dependents = value;
    this.renderDeleteModal();
  }
  async renderDefaultModal() {
    const result = await PaymentSavedMethodsActionModal.open({
      modalName: DEFAULT_SAVED_PAYMENT_METHOD_MODAL_NAME,
      eventActionType: DEFAULT_SAVED_PAYMENT_METHOD_EVENT_NAME,
      recordId: this.recordId,
      recordTitle: this.recordTitle,
      size: 'small'
    });
    if (result && result.eventName) {
      this.dispatchEvent(new CustomEvent(result.eventName, {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail: {
          recordId: result.recordId,
          recordTitle: result.recordTitle,
          markAsDefault: this.isDefaultCheckBoxChecked
        }
      }));
    } else if (result === undefined || result === 'close') {
      this.isDefaultCheckBoxChecked = !this.isDefaultCheckBoxChecked;
    }
  }
  async renderShareModal() {
    const result = await PaymentSavedMethodsActionModal.open({
      modalName: this.isSavedPaymentMethodShared ? SHARE_SAVED_PAYMENT_METHOD_MODAL_NAME : UNSHARE_SAVED_PAYMENT_METHOD_MODAL_NAME,
      eventActionType: SHARE_SAVED_PAYMENT_METHOD_EVENT_NAME,
      recordId: this.recordId,
      recordTitle: this.recordTitle,
      size: 'small'
    });
    if (result && result.eventName) {
      this.dispatchEvent(new CustomEvent(result.eventName, {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail: {
          recordId: result.recordId,
          recordTitle: result.recordTitle,
          markAsShared: this.isSavedPaymentMethodShared
        }
      }));
    } else if (result === undefined || result === 'close') {
      this._isSharedCheckboxChecked = !this.isSavedPaymentMethodShared;
    }
  }
  get ariaDeleteLabel() {
    return AriaDeleteLabel.replace('{deleteLabel}', `${this.deleteLabel}`).replace('{recordTitle}', `${this.recordTitle}`);
  }
  get ariaDefaultLabel() {
    return AriaDefaultLabel.replace('{defaultLabel}', `${this.defaultLabel}`).replace('{recordTitle}', `${this.recordTitle}`);
  }
  get renderDefaultButton() {
    return !this.isDefault && !this.isExpired;
  }
  get renderShareOption() {
    return this.isSpmSharingEnabled && this.isSpmContactTagged;
  }
  get renderAllowedUserActions() {
    return this.isOwner;
  }
  get shareCheckboxLabel() {
    return ShareCheckboxLabel;
  }
  get isSpmContactTagged() {
    return this.referenceOwnerId.startsWith(CONTACT_ACCOUNT_KEY_PREFIX);
  }
}