import LightningModal from 'lightning/modal';
import { cancelActionLabel, description, headerLabel, tryAgainActionLabel } from './labels';
const LABELS = {
  cancelActionLabel,
  description,
  headerLabel,
  tryAgainActionLabel
};
const MODAL_SIZE = 'medium';
export default class MyAccountSwitcherModal extends LightningModal {
  showAccountsLoadFailureActions = false;
  static open(props) {
    return super.open({
      description: LABELS.description,
      size: MODAL_SIZE,
      ...(props || {})
    });
  }
  get labels() {
    return LABELS;
  }
  handleAccountSelect(e) {
    if (!import.meta.env.SSR) {
      this.dispatchEvent(new CustomEvent('accountselect', {
        detail: e.detail
      }));
    }
    this.closeModal('accountselected');
  }
  handleAccountsLoadSuccess() {
    this.showAccountsLoadFailureActions = false;
  }
  handleAccountsLoadFailure() {
    this.showAccountsLoadFailureActions = true;
  }
  handleTryAgain() {
    const accountListComp = this.template?.querySelector('site-my-account-switcher-list');
    accountListComp?.reloadManagedAccounts();
  }
  handleCancel() {
    this.closeModal('cancel');
  }
  closeModal(closeMessage) {
    this.close(closeMessage);
  }
}