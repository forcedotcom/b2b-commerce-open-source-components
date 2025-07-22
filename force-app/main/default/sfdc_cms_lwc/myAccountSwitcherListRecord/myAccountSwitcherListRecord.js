import { LightningElement, api } from 'lwc';
import { accountIconAltText, checkIconAltText } from './labels';
import BasePath from '@salesforce/community/basePath';
const LABELS = {
  accountIconAltText,
  checkIconAltText
};
export default class MyAccountSwitcherListRecord extends LightningElement {
  static renderMode = 'light';
  @api
  accountId;
  @api
  accountName;
  @api
  accountAddress;
  @api
  selected = false;
  get computedClassNames() {
    let classNames = `account-switcher-list-record slds-var-p-vertical_medium slds-var-p-horizontal_large`;
    if (this.selected) {
      classNames = classNames + ' selected';
    }
    return classNames;
  }
  get labels() {
    return LABELS;
  }
  get checkFilledIconPath() {
    return `${BasePath}/assets/icons/check-filled.svg#check-filled`;
  }
  handleClick(e) {
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('accountswitchlistrecordclick', {
      detail: {
        accountId: this.accountId,
        accountName: this.accountName
      }
    }));
  }
}