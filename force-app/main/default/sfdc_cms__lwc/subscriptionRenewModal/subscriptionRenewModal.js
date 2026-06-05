import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import LABELS from './labels';
import { resolve as resolveResource } from 'experience/resourceResolver';
import month from '@salesforce/label/site.subscriptionRenewModal.month';
import year from '@salesforce/label/site.subscriptionRenewModal.year';
import { renewSubscription, getARCToastMsg } from 'commerce/subscriptionApi';
import Toast from 'site/commonToast';
import locale from '@salesforce/i18n/locale';
import { formatDate } from 'site/subscriptionAmendModal';
const IMAGE_WIDTH_SMALL = 120;
const MAX_SUBSCRIPTION_DURATION_COUNT = 50;
export const subscriptionPriceTermUnitMap = new Map([['Months', month], ['Annual', year]]);
export default class SubscriptionRenewModal extends LightningModal {
  _labels = LABELS;
  _isLoading = false;
  get _isNotLoading() {
    return !this._isLoading;
  }
  _item;
  _subscriptionDurationOptions = [];
  _selectedDuration = '1';
  _computedRenewalStartDate = undefined;
  _disableRenewButton = false;
  @api
  set item(value) {
    this._item = value;
    this._selectedDuration = this._item?.subscriptionTerm ? this._item?.subscriptionTerm <= MAX_SUBSCRIPTION_DURATION_COUNT ? String(this._item?.subscriptionTerm) : '1' : '1';
    const pricingTermUnit = this._item?.sellingModel?.pricingTermUnit;
    if (pricingTermUnit) {
      const subscriptionTermUnit = subscriptionPriceTermUnitMap.get(pricingTermUnit);
      if (subscriptionTermUnit) {
        this._subscriptionDurationOptions = this.generateSubscriptionDurationOptions(subscriptionTermUnit, MAX_SUBSCRIPTION_DURATION_COUNT);
      }
    }
    this._computedRenewalStartDate = this.calculateRenewalStartDate();
  }
  get _formattedBodyHeader() {
    return this._item?.endDate ? this._labels.renewBodyHeader.replace('{0}', formatDate(locale, this.calculateRenewalStartDate()) ?? '') : '';
  }
  get item() {
    return this._item;
  }
  @api
  quantityLabel;
  @api
  renewButtonLabel;
  get _renewButtonLabel() {
    return this.renewButtonLabel || this._labels.renewSubscriptionButtonLabel;
  }
  get _resolvedUrl() {
    const cmsImageScalingProps = {
      width: IMAGE_WIDTH_SMALL
    };
    return resolveResource(this._item?.product.image?.url, false, cmsImageScalingProps);
  }
  get _quantity() {
    return this._item?.quantity;
  }
  get _subscriptionTermUnit() {
    switch (this._item?.sellingModel?.pricingTermUnit?.toLowerCase()) {
      case 'months':
        return 'Monthly';
      case 'annual':
        return 'Yearly';
      default:
        return undefined;
    }
  }
  get _renewalTermUnit() {
    switch (this._subscriptionTermUnit) {
      case 'Monthly':
        return 'Month';
      case 'Yearly':
        return 'Year';
      default:
        return undefined;
    }
  }
  get _productName() {
    return this._item?.product.name;
  }
  handleClose() {
    this.close('close');
  }
  handleSubscriptionDurationChange(event) {
    this._selectedDuration = event.detail.value;
  }
  async handleRenewSubscription() {
    try {
      if (this._computedRenewalStartDate) {
        const subscriptionIds = [this._item?.id];
        const renewSubscriptionRequestOptions = {
          subscriptionIds: subscriptionIds.filter(id => id !== null && id !== undefined),
          renewalStartDate: this._computedRenewalStartDate,
          renewalEndDate: null,
          renewalTermLength: parseInt(this._selectedDuration, 10),
          renewalTermUnit: this._renewalTermUnit
        };
        this._disableRenewButton = true;
        this._isLoading = true;
        await renewSubscription(renewSubscriptionRequestOptions);
        Toast.show({
          label: this._labels.renewSubscriptionSuccessMessage.replace('{0}', formatDate(locale, this._computedRenewalStartDate) ?? ''),
          variant: 'success'
        }, this);
        this.close('close');
      }
    } catch (exception) {
      this._isLoading = false;
      const toastMsg = getARCToastMsg(exception, this._labels.renewSubscriptionErrorMessage);
      Toast.show({
        label: toastMsg,
        variant: 'error'
      }, this);
    }
    this._disableRenewButton = false;
  }
  @api
  calculateRenewalStartDate() {
    if (this._item?.endDate) {
      const date = new Date(this._item?.endDate?.split('T')[0]);
      date.setDate(date.getDate() + 1);
      return date.toISOString();
    }
    return undefined;
  }
  @api
  calculateRenewalEndDate(renewalStartDate) {
    const start = new Date(renewalStartDate);
    const startDay = start.getDate();
    const date = new Date(start);
    const selectedDuration = parseInt(this._selectedDuration, 10);
    if (this._subscriptionTermUnit === 'Monthly') {
      date.setMonth(date.getMonth() + selectedDuration);
      date.setDate(date.getDate() - 1);
    } else {
      date.setFullYear(date.getFullYear() + selectedDuration);
      date.setDate(date.getDate() - 1);
    }
    return date.toISOString().split('T')[0] + 'T23:59:59.000Z';
  }
  generateSubscriptionDurationOptions(termUnit, maxValue) {
    return Array.from({
      length: maxValue
    }, (_, i) => {
      const n = i + 1;
      return {
        label: `${n} ${termUnit}${n > 1 ? 's' : ''}`,
        value: String(n)
      };
    });
  }
}