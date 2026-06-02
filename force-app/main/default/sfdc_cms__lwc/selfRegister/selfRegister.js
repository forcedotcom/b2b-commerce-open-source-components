import { LightningElement, api } from 'lwc';
import { COMMUNICATION_CONSENT_STATUS } from './constants';
import labels from './labels';
import { selfRegister as selfRegisterApex } from 'commerce/selfRegistrationApi';
const loginUrl = './login';
/**
 * @slot emailConsentOptionsFooterText
 */
export default class SelfRegister extends LightningElement {
  static renderMode = 'light';
  @api
  firstnameLabel;
  @api
  lastnameLabel;
  @api
  emailLabel;
  @api
  includePasswordField = false;
  @api
  createPasswordLabel;
  @api
  confirmPasswordLabel;
  @api
  submitButtonLabel;
  @api
  cancelLinkLabel;
  @api
  startUrl;
  @api
  regConfirmUrl;
  @api
  phoneNumberLabel;
  @api
  showPhoneNumberField = false;
  @api
  phoneNumberRequired = false;
  @api
  rawInternationalizationData;
  @api
  consentData;
  @api
  additionalFields;
  get emailConsentOptions() {
    return this.consentData?.communications?.map(comm => {
      const updatedItem = this.consentItemsToUpdate.find(item => item.commSubscriptionChannelTypeId === comm.commSubscriptionChannelTypeId);
      return {
        id: comm.commSubscriptionChannelTypeId,
        title: comm.title,
        description: comm.description,
        value: updatedItem ? updatedItem.consentValue === COMMUNICATION_CONSENT_STATUS.OPT_IN : comm.consentStatus === 'OptIn'
      };
    });
  }
  get showError() {
    return this._showError;
  }
  get errorMessage() {
    return this._errorMessage;
  }
  _isLoading = false;
  _showError = false;
  _errorMessage;
  checkEmailUrl = './CheckPasswordResetEmail';
  _extraFieldsJsonArray = JSON.parse('[]');
  consentItemsToUpdate = [];
  handleConsentOptionUpdated(event) {
    event.stopPropagation();
    const consentId = event.detail.id;
    const consentStatus = event.detail.value ? COMMUNICATION_CONSENT_STATUS.OPT_IN : COMMUNICATION_CONSENT_STATUS.OPT_OUT;
    if (consentStatus === COMMUNICATION_CONSENT_STATUS.OPT_IN) {
      this.consentItemsToUpdate.push({
        commSubscriptionChannelTypeId: event.detail.id,
        consentValue: COMMUNICATION_CONSENT_STATUS.OPT_IN
      });
    } else if (consentStatus === COMMUNICATION_CONSENT_STATUS.OPT_OUT) {
      const existingIndex = this.consentItemsToUpdate.findIndex(item => item.commSubscriptionChannelTypeId === consentId);
      if (existingIndex >= 0) {
        this.consentItemsToUpdate.splice(existingIndex, 1);
      }
    }
  }
  get extraFieldsJsonArray() {
    const addFieldsRaw = this.additionalFields ? JSON.parse(this.additionalFields) : JSON.parse('[]');
    this._extraFieldsJsonArray = this.convertToExtraFieldsArray(addFieldsRaw);
    return this._extraFieldsJsonArray;
  }
  convertToExtraFieldsArray(addFieldsRaw) {
    return addFieldsRaw.map(field => {
      const extraFieldJSON = {
        dbRequired: false,
        fieldPath: field.name,
        label: field.label,
        required: false,
        value: ''
      };
      return extraFieldJSON;
    });
  }
  registrationHandler(efi) {
    return params => {
      const finalParams = {
        ...params
      };
      finalParams.extraFields = JSON.stringify(efi);
      return selfRegisterApex(finalParams);
    };
  }
  extraFieldsInput(phoneNumber, extraFieldsInput) {
    let jsonstr = '[]';
    if (this.showPhoneNumberField && (this.phoneNumberRequired || phoneNumber.length > 0)) {
      jsonstr = '[{"dbRequired":false,"fieldPath":"Phone","label":"Phone","required":false,"value":"' + phoneNumber + '"}]';
    }
    const arr = JSON.parse(jsonstr);
    for (let i = 0; i < extraFieldsInput.length; i++) {
      this._extraFieldsJsonArray[i].value = extraFieldsInput[i];
      arr.push(this._extraFieldsJsonArray[i]);
    }
    return arr;
  }
  handleSubmit(event) {
    const register = this.registrationHandler(this.extraFieldsInput(event.detail.phoneNumber, event.detail.extraFieldsInput));
    const registrationInfo = {
      firstname: event.detail.firstname,
      lastname: event.detail.lastname,
      email: event.detail.email,
      password: event.detail.password,
      confirmPassword: event.detail.confirmPassword,
      regConfirmUrl: event.detail.regConfirmUrl || './CheckPasswordResetEmail',
      startUrl: event.detail.startUrl,
      includePassword: this.includePasswordField,
      redirect: false,
      consentItemsToUpdate: this.consentItemsToUpdate
    };
    if (register !== undefined) {
      this._isLoading = true;
      register(registrationInfo).then(rawResult => {
        if (rawResult.includes(this.checkEmailUrl)) {
          return this.appendStartUrlToTargetUrl(rawResult, this.getStartUrlFromCurrentUrl());
        }
        try {
          return new URL(rawResult).href;
        } catch (e) {
          this._isLoading = false;
          return Promise.reject(rawResult);
        }
      }).then(url => {
        globalThis.location.assign(url);
        this._isLoading = false;
      }).catch(error => {
        if (this.showError && this.errorMessage === error) {
          this._isLoading = false;
          this.refs?.selfRegisterUi?.focusError();
        } else {
          this._isLoading = false;
          this._showError = true;
          if (!!error && typeof error === 'string') {
            this._errorMessage = error;
          } else {
            this._errorMessage = labels.genericError;
          }
        }
      });
    }
  }
  async handleCancel() {
    const targetUrl = this.appendStartUrlToTargetUrl(loginUrl, this.getStartUrlFromCurrentUrl());
    await globalThis.location.assign(targetUrl);
  }
  getStartUrlFromCurrentUrl() {
    try {
      const urlParams = new URLSearchParams(globalThis.location.search);
      const encodedURI = urlParams?.get('startURL') || '';
      return decodeURI(encodedURI);
    } catch (URIError) {
      return '';
    }
  }
  appendStartUrlToTargetUrl(targetUrl, startUrl) {
    if (targetUrl && startUrl) {
      if (targetUrl.includes('?')) {
        targetUrl = targetUrl + '&startURL=' + startUrl;
      } else {
        targetUrl = targetUrl + '?startURL=' + startUrl;
      }
    }
    return targetUrl;
  }
}