import { api, LightningElement } from 'lwc';
import { createCommunicationSubscriptionsChangeAction, dispatchAction } from 'commerce/actionApi';
import { isDesignMode } from 'experience/clientApi';
import { transformMarketingConsentSubscriptions, showErrorToast } from './marketingEmailSignupUtils';
import { emailErrorMessage, checkboxErrorMessage, systemErrorMessage } from './labels';
const generateRandomId = (() => {
  let lastId = 0;
  return () => crypto?.randomUUID?.() || String(++lastId);
})();

/**
 * @slot header
 * @slot footer
 */
export default class MarketingEmailsignup extends LightningElement {
  static renderMode = 'light';
  _showEmailErrorMessage = false;
  _showCheckboxErrorMessage = false;
  _showSuccessMessage = isDesignMode;
  _email = '';
  _subscriptions;
  _transformedSubscriptions = [];
  _subscriptionCheckboxes = [];
  dataId;
  @api
  get subscriptions() {
    return this._subscriptions;
  }
  set subscriptions(val) {
    this._subscriptions = val;
    this._transformedSubscriptions = transformMarketingConsentSubscriptions(this._subscriptions);
    this.resetSubscriptions();
    if (this.showEmailSignup) {
      this.classList.remove('slds-hide');
    } else {
      this.classList.add('slds-hide');
    }
  }
  @api
  inputFieldLabel;
  @api
  placeholderText;
  @api
  successMessage;
  @api
  buttonText;
  get successMessageContent() {
    return this._showSuccessMessage ? this.successMessage : '';
  }
  get errorMessages() {
    const errors = [];
    if (this._showEmailErrorMessage) {
      errors.push({
        id: 'invalid-email-error',
        message: emailErrorMessage
      });
    }
    if (this._showCheckboxErrorMessage) {
      errors.push({
        id: 'invalid-selection-error',
        message: checkboxErrorMessage
      });
    }
    return errors;
  }
  get showCheckboxes() {
    return this._subscriptionCheckboxes.length > 1;
  }
  get showSingleSubscription() {
    return this._subscriptionCheckboxes.length === 1;
  }
  get singleSubscription() {
    return this._subscriptionCheckboxes[0];
  }
  get inputContainerClasses() {
    return {
      'slds-has-error': this._showEmailErrorMessage
    };
  }
  get checkboxClasses() {
    return {
      'slds-form-element__control': true,
      'consent-list': true,
      'slds-has-error': this._showCheckboxErrorMessage
    };
  }
  get emailInput() {
    return this.refs?.emailInput;
  }
  get showEmailSignup() {
    return isDesignMode || (this._subscriptions?.length ?? 0) > 0;
  }
  connectedCallback() {
    const dataId = this.getAttribute('data-id');
    if (!dataId) {
      this.dataId = generateRandomId();
      this.setAttribute('data-id', this.dataId);
    } else {
      this.dataId = dataId;
    }
    this._subscriptionCheckboxes = this.appendDataIdToSubscriptions(this._subscriptionCheckboxes);
  }
  handleOnInput(event) {
    this._showEmailErrorMessage = false;
    this._showSuccessMessage = false;
    this._email = event.target.value;
  }
  handleCheckboxChange(event) {
    this._showCheckboxErrorMessage = false;
    this._showSuccessMessage = false;
    this._subscriptionCheckboxes = this._subscriptionCheckboxes.map(subscription => ({
      ...subscription,
      value: subscription.id === event.target.id ? event.target.checked : subscription.value
    }));
  }
  resetSubscriptions() {
    this._subscriptionCheckboxes = this._subscriptions ? this._transformedSubscriptions : [];
    this._subscriptionCheckboxes = this.appendDataIdToSubscriptions(this._subscriptionCheckboxes);
    if (this._subscriptionCheckboxes?.length === 1) {
      this._subscriptionCheckboxes[0] = {
        ...this._subscriptionCheckboxes[0],
        value: true
      };
    }
  }
  appendDataIdToSubscriptions(subscriptions) {
    return subscriptions.map((subscription, index) => ({
      ...subscription,
      id: this.dataId ? `${this._transformedSubscriptions[index].id}_${this.dataId}` : subscription.id
    }));
  }
  getSelectedSubscriptions() {
    return this._subscriptionCheckboxes.filter(subscription => subscription.value).map(subscription => ({
      commSubscriptionChannelTypeId: subscription.id.split('_')[0],
      consentValue: 'OptIn'
    }));
  }
  checkCheckboxValidity() {
    return !this._subscriptionCheckboxes.length || this._subscriptionCheckboxes.some(subscription => subscription.value);
  }
  checkFormValidity() {
    const emailValue = this.emailInput?.value.trim();
    this._showEmailErrorMessage = !this.emailInput?.validity.valid || emailValue === '';
    this._showCheckboxErrorMessage = !this.checkCheckboxValidity();
    return !this._showEmailErrorMessage && !this._showCheckboxErrorMessage;
  }
  handleButtonClick(event) {
    event.preventDefault();
    const isFormValid = this.checkFormValidity();
    if (isFormValid) {
      this.updateSubscriptions();
    } else {
      this._showSuccessMessage = false;
    }
  }
  updateSubscriptions() {
    const params = {
      contactPointValue: this._email,
      communicationSubscriptionConsentItemList: this.getSelectedSubscriptions()
    };
    dispatchAction(this, createCommunicationSubscriptionsChangeAction(params), {
      onSuccess: () => {
        this._showSuccessMessage = true;
        this._email = '';
        this.resetSubscriptions();
      },
      onError: () => {
        this._showSuccessMessage = false;
        showErrorToast(systemErrorMessage, this);
      }
    });
  }
}