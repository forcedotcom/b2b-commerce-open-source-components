import { LightningElement, api } from 'lwc';
import { resolve as resolveResource } from 'experience/resourceResolver';
import LOCALE from '@salesforce/i18n/locale';
import { formatDate, SUBSCRIPTION_CANCEL_OPERATION_STATUSES, getSubscriptionFrequencyLabel } from 'site/subscriptionCardV2';
const IMAGE_WIDTH_SMALL = 120;
export default class SubscriptionDetailsCard extends LightningElement {
  @api
  item;
  @api
  showQuantity = false;
  @api
  quantityLabel;
  @api
  showStartDate = false;
  @api
  startDateLabel;
  @api
  showEndDate = false;
  @api
  endDateLabel;
  @api
  showNextBillingDate = false;
  @api
  nextBillingDateLabel;
  @api
  taxLabel;
  get _resolvedUrl() {
    const cmsImageScalingProps = {
      width: IMAGE_WIDTH_SMALL
    };
    return resolveResource(this.item?.product.image?.url, false, cmsImageScalingProps);
  }
  get _productName() {
    return this.item?.product.name;
  }
  get _quantity() {
    return this.item?.quantity;
  }
  get _sellingModelType() {
    return this.item?.sellingModel?.sellingModelType;
  }
  get _pricingTerm() {
    return this.item?.sellingModel?.pricingTerm;
  }
  get _pricingTermUnit() {
    return this.item?.sellingModel?.pricingTermUnit;
  }
  get _subscriptionTerm() {
    return this.item?.subscriptionTerm;
  }
  get _billingPeriodAmount() {
    return this.item?.billing?.billingPeriodAmount;
  }
  get _currencyCode() {
    return this.item?.billing?.currencyIsoCode;
  }
  get _billingFrequency() {
    const billingTermUnit = this.item?.billing?.billingTermUnit;
    return billingTermUnit ? getSubscriptionFrequencyLabel(billingTermUnit) : undefined;
  }
  get _displayDates() {
    return this.showStartDate || this._showEndDate || this._showNextBillingDate;
  }
  get _startDate() {
    return formatDate(LOCALE, this.item?.startDate);
  }
  get _showEndDate() {
    return this.showEndDate && this.item?.endDate != null;
  }
  get _endDate() {
    return formatDate(LOCALE, this.item?.endDate);
  }
  get _showNextBillingDate() {
    return this.showNextBillingDate && !!this._nextBillingDate && this._isSubscriptionActive && !this.isSubscriptionCancelled();
  }
  get _nextBillingDate() {
    return formatDate(LOCALE, this.item?.billing?.nextBillingDate);
  }
  get _isSubscriptionActive() {
    if (this.item?.endDate) {
      return new Date() <= new Date(this.item.endDate);
    }
    return true;
  }
  isSubscriptionCancelled() {
    return this.item?.cancelStatus === SUBSCRIPTION_CANCEL_OPERATION_STATUSES.SUCCESS;
  }
}