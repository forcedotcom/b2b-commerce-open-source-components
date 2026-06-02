import { LightningElement, api } from 'lwc';
import { createCommunicationSubscriptionsChangeAction, dispatchAction } from 'commerce/actionApi';
import Toast from 'site/commonToast';
import { errorToastMessage, successToastMessage, updatingStencilAssistiveText } from './labels';
import { transformMarketingConsentSubscriptions } from './utils';
import { COMMUNICATION_CONSENT_STATUS } from './constants';
import { generateStyleProperties } from 'experience/styling';
import { isDesignMode } from 'experience/clientApi';

/**
 * @slot consentOptionsHeaderText
 * @slot consentOptionsFooterText
 */
export default class MyaccountMarketingconsentSettings extends LightningElement {
  static renderMode = 'light';
  _isUpdatingConsent = false;
  _shadowConsentData;
  get consentOptions() {
    return transformMarketingConsentSubscriptions(this._shadowConsentData?.communications);
  }
  get isConsentOptionPresent() {
    return isDesignMode || (this._shadowConsentData?.communications || []).length > 0;
  }
  get updatingStencilAssistiveText() {
    return updatingStencilAssistiveText;
  }
  get customStyles() {
    const styles = this._isUpdatingConsent ? [{
      name: 'visibility',
      value: 'hidden'
    }] : [];
    return generateStyleProperties(styles);
  }
  @api
  get consentData() {
    return this._shadowConsentData;
  }
  set consentData(newConsentData) {
    this._shadowConsentData = newConsentData;
  }
  handleConsentOptionUpdated(event) {
    event.stopPropagation();
    this._isUpdatingConsent = true;
    const commSubscriptionChannelTypeIdToBeUpdated = event.detail.id;
    const newConsentStatus = event.detail.value ? COMMUNICATION_CONSENT_STATUS.OPT_IN : COMMUNICATION_CONSENT_STATUS.OPT_OUT;
    const updateConsentParams = {
      contactPointValue: this.consentData?.contactPointValue || '',
      communicationSubscriptionConsentItemList: [{
        commSubscriptionChannelTypeId: commSubscriptionChannelTypeIdToBeUpdated,
        consentValue: newConsentStatus
      }]
    };
    dispatchAction(this, createCommunicationSubscriptionsChangeAction(updateConsentParams), {
      onSuccess: () => {
        this._isUpdatingConsent = false;
        this._shadowConsentData = {
          ...this._shadowConsentData,
          communications: this.consentData?.communications?.map(option => {
            return {
              ...option,
              consentStatus: option.commSubscriptionChannelTypeId === commSubscriptionChannelTypeIdToBeUpdated ? newConsentStatus : option.consentStatus
            };
          })
        };
        Toast.show({
          label: successToastMessage,
          variant: 'success'
        }, this);
      },
      onError: () => {
        this._isUpdatingConsent = false;
        Toast.show({
          label: errorToastMessage,
          variant: 'error'
        }, this);
      }
    });
  }
}