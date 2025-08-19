import { api, LightningElement, wire } from 'lwc';
import { ManagedAccountsAdapter, loadEffectiveAccounts, effectiveAccount } from 'commerce/effectiveAccountApi';
import { getUserDefaultAccount, moveSelectedAccountToTop, updateSelectedStatus } from './managedAccountsUtils';
import { errorActionLabel, errorDescription, errorHeading, spinnerAltText } from './labels';
const MANAGED_ACCOUNTS_REQUEST_OPTIONS = {
  includeMyAccount: true
};
const ACCOUNTS_LOAD_SUCCESS_EVENT_NAME = 'accountsloadsuccess';
const ACCOUNTS_LOAD_FAILURE_EVENT_NAME = 'accountsloadfailure';
const LABELS = {
  errorActionLabel,
  errorDescription,
  errorHeading,
  spinnerAltText
};
export default class MyAccountSwitcherList extends LightningElement {
  static renderMode = 'light';
  userDefaultAccount;
  effectiveAccountId = '';
  isLoading = true;
  managedAccounts = [];
  hasError = false;
  @api
  reloadManagedAccounts() {
    loadEffectiveAccounts(MANAGED_ACCOUNTS_REQUEST_OPTIONS);
  }
  @wire(ManagedAccountsAdapter, {
    ...MANAGED_ACCOUNTS_REQUEST_OPTIONS
  })
  getManagedAccountsData({
    error,
    data = [],
    loading
  }) {
    this.hasError = Boolean(error);
    this.effectiveAccountId = effectiveAccount.accountId || getUserDefaultAccount(data) || '';
    this.managedAccounts = moveSelectedAccountToTop(updateSelectedStatus(data, this.effectiveAccountId));
    if (this.hasError) {
      this.dispatchAccountsLoadStatusEvent(ACCOUNTS_LOAD_FAILURE_EVENT_NAME);
    } else if (!loading) {
      this.dispatchAccountsLoadStatusEvent(ACCOUNTS_LOAD_SUCCESS_EVENT_NAME);
    }
    this.isLoading = loading;
  }
  get labels() {
    return LABELS;
  }
  get hasManagedAccounts() {
    return !!this.managedAccounts.length;
  }
  handleAccountSelect(e) {
    this.isLoading = true;
    this.effectiveAccountId = e.detail.accountId;
    this.managedAccounts = updateSelectedStatus(this.managedAccounts, this.effectiveAccountId);
    this.dispatchEvent(new CustomEvent('accountselect', {
      detail: e.detail
    }));
    this.isLoading = false;
  }
  dispatchAccountsLoadStatusEvent(eventName) {
    this.dispatchEvent(new CustomEvent(eventName));
  }
}