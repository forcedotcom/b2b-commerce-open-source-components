import { api, LightningElement } from 'lwc';
export default class SubscriptionStatus extends LightningElement {
  @api
  iconBasePath;
  @api
  mainText;
  @api
  supportText;
  @api
  containerClass;
  @api
  iconClass;
  @api
  textContainerClass;
  @api
  mainTextClass;
  @api
  supportTextClass;
  get subscriptionStatusIcon() {
    return this.iconBasePath ?? '';
  }
  get subscriptionStatusMainText() {
    return this.mainText ?? '';
  }
  get subscriptionStatusSupportText() {
    return this.supportText ?? '';
  }
  get subscriptionStatusContainerClass() {
    return this.containerClass ?? 'subscription-status';
  }
  get subscriptionStatusIconClass() {
    return this.iconClass ?? 'slds-icon slds-icon_small';
  }
  get subscriptionStatusTextContainerClass() {
    return this.textContainerClass ?? 'dxp-text-body';
  }
  get subscriptionStatusMainTextClass() {
    return this.mainTextClass ? this.mainTextClass : '';
  }
  get subscriptionStatusSupportTextClass() {
    return this.supportTextClass ? this.supportTextClass : '';
  }
}