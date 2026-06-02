import { api, LightningElement } from 'lwc';
import { resolve as resolveResource } from 'experience/resourceResolver';
import { SUBSCRIPTION_CANCEL_OPERATION_STATUSES, CANCEL_STATUS_DISPLAY_DETAILS } from './cancelStatusConfig';
import { getNumberOfDaysToGivenDate, formatDate } from './dateUtil';
import { getSubscriptionFrequencyLabel, getExpiringInNDaysText } from './labelTextGenerator';
import timeZone from '@salesforce/i18n/timeZone';
import LOCALE from '@salesforce/i18n/locale';
import { getIconPath } from './paymentIconPath';
import { paymentMethodsLoadError, paymentMethodAddNewLabel, updatePaymentTextLabel, paymentFailureText, savedPaymentMethodDeletedText, subscriptionBundleExpandedLabel, childSubscriptionsLoadError, childSubscriptionQuantityLabel } from './labels';
const DAYS_UNTIL_EXPIRATION = 10;
const IMAGE_WIDTH_SMALL = 120;
const ADD_NEW_PAYMENT_METHOD = 'ADD_NEW_PAYMENT_METHOD';
const UPDATE_PAYMENT_OPTION_VALUE = 'UPDATE_PAYMENT_OPTION_VALUE';
const UPDATE_PAYMENT_OBJECT = {
  label: updatePaymentTextLabel,
  value: UPDATE_PAYMENT_OPTION_VALUE
};
export default class SubscriptionCard extends LightningElement {
  static renderMode = 'light';
  _menuAlignment = 'right';
  _item;
  _selectedPaymentMethod = [];
  _isChildSubscriptionsExpanded = false;
  @api
  set item(value) {
    this._item = value;
    this._selectedPaymentMethod = value?.billing?.savedPaymentMethod ? [value?.billing?.savedPaymentMethod?.id] : [UPDATE_PAYMENT_OPTION_VALUE];
  }
  get item() {
    return this._item;
  }
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
  cancelButtonLabel;
  @api
  retryCancelButtonLabel;
  @api
  taxLabel;
  @api
  cancelledPillLabel;
  @api
  expiredPillLabel;
  @api
  iconBasePath;
  @api
  rlmSubscriptionEnabled = false;
  @api
  showSubscriptionActions = false;
  @api
  isRenderedInModal = false;
  @api
  showChildSubscriptions = false;
  @api
  productUrl;
  @api
  childSubscriptionsData;
  @api
  childSubscriptionsError;
  get _hasPaymentFailureExceptions() {
    return Boolean((this.item?.processExceptions || []).length > 0);
  }
  get _showPaymentMethodDeletedMessage() {
    return UPDATE_PAYMENT_OPTION_VALUE === this._selectedPaymentMethod[0] && !this._showCancellationStatusDetails && !this._hasPaymentFailureExceptions && this._isSubscriptionActive;
  }
  get _paymentFailureText() {
    return paymentFailureText;
  }
  get _savedPaymentMethodDeletedText() {
    return savedPaymentMethodDeletedText;
  }
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
  get _showSubscriptionTermPill() {
    return this._isSubscriptionActive && !this.isSubscriptionCancelled() && !this.isSubscriptionExpiringSoon();
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
  get _showExpiringInNDaysPill() {
    return this._isSubscriptionActive && !this.isSubscriptionCancelled() && this.isSubscriptionExpiringSoon();
  }
  get _expiringInNDaysLabel() {
    const daysLeft = getNumberOfDaysToGivenDate(this.item?.endDate);
    return getExpiringInNDaysText(daysLeft);
  }
  get _showExpiredPill() {
    return !this._isSubscriptionActive && !this.isSubscriptionCancelled();
  }
  get _showCancelledPill() {
    return !this._isSubscriptionActive && this.isSubscriptionCancelled();
  }
  get _showCancellationStatusDetails() {
    return this._isSubscriptionActive && this.cancelStatusExists();
  }
  get _customCancelStatusIcon() {
    const iconPathForCancelStatus = CANCEL_STATUS_DISPLAY_DETAILS[this.item?.cancelStatus].iconPath;
    return iconPathForCancelStatus ? `${this.iconBasePath}/${iconPathForCancelStatus}` : undefined;
  }
  get _cancelStatusMainText() {
    return CANCEL_STATUS_DISPLAY_DETAILS[this.item?.cancelStatus].mainText;
  }
  get _cancelStatusMainTextClasses() {
    return this.isSubscriptionCancelled() ? 'success-status-main-text' : '';
  }
  get _cancelStatusSupportText() {
    const supportText = CANCEL_STATUS_DISPLAY_DETAILS[this.item?.cancelStatus].supportText;
    return supportText?.replace('{endDate}', this._endDate);
  }
  get _displayDates() {
    return this.showStartDate || this._showEndDate || this._showNextBillingDate;
  }
  get _startDate() {
    return formatDate(LOCALE, timeZone, this.item?.startDate);
  }
  get _showEndDate() {
    return this.showEndDate && this.item?.endDate != null;
  }
  get _endDate() {
    return formatDate(LOCALE, timeZone, this.item?.endDate);
  }
  get _showNextBillingDate() {
    return this.showNextBillingDate && !!this._nextBillingDate && this._isSubscriptionActive && !this.isSubscriptionCancelled();
  }
  get _nextBillingDate() {
    return formatDate(LOCALE, timeZone, this.item?.billing?.nextBillingDate);
  }
  get _isSubscriptionActive() {
    if (this.item?.endDate) {
      return new Date() <= new Date(this.item.endDate);
    }
    return true;
  }
  get _currencyCode() {
    return this.item?.billing?.currencyIsoCode;
  }
  get _billingPeriodAmount() {
    return this.item?.billing?.billingPeriodAmount;
  }
  get _billingFrequency() {
    const billingTermUnit = this.item?.billing?.billingTermUnit;
    return billingTermUnit ? getSubscriptionFrequencyLabel(billingTermUnit) : undefined;
  }
  get _showPaymentMethodDropdown() {
    return this.rlmSubscriptionEnabled && this.item?.cancelStatus !== 'Success' && this.item?.billing?.nextBillingDate != null;
  }
  get _paymentMethodImageClasses() {
    return this._disablePaymentMethodDropdown ? 'opaque-50' : '';
  }
  get _iconUrl() {
    return getIconPath(this.item?.billing?.savedPaymentMethod ? this.item?.billing?.savedPaymentMethod?.network ?? 'credit_card' : '');
  }
  get _disablePaymentMethodDropdown() {
    return this.item?.cancelStatus === 'InProgress';
  }
  get _savedPaymentMethodOptions() {
    let result = [];
    const availablePaymentMethods = (this.item?.availablePaymentMethods ?? []).map(spm => ({
      label: spm.name ?? '',
      value: spm.id
    }));
    const addNewPaymentMethod = {
      label: paymentMethodAddNewLabel,
      value: ADD_NEW_PAYMENT_METHOD,
      prefixIconName: 'utility:add'
    };
    if (!this.item?.billing?.savedPaymentMethod) {
      result = [UPDATE_PAYMENT_OBJECT];
    } else {
      const savedPaymentMethodAvailable = this.item?.availablePaymentMethods?.find(paymentMethod => paymentMethod.id === this.item?.billing?.savedPaymentMethod?.id);
      if (!savedPaymentMethodAvailable && this.item?.billing?.savedPaymentMethod?.id && this.item?.billing?.savedPaymentMethod?.name) {
        result = [{
          label: this.item?.billing?.savedPaymentMethod?.name,
          value: this.item?.billing?.savedPaymentMethod?.id
        }];
      }
    }
    return result.concat(availablePaymentMethods, addNewPaymentMethod);
  }
  get _paymentsDropdownMenuAlignment() {
    return this._menuAlignment;
  }
  get _paymentMethodName() {
    return this.item?.billing?.savedPaymentMethod?.name;
  }
  get _showPaymentMethodsLoadError() {
    return this._showPaymentMethodDropdown && !this._disablePaymentMethodDropdown && this.item?.availablePaymentMethods === null;
  }
  get _paymentMethodsLoadErrorMessage() {
    return paymentMethodsLoadError;
  }
  get _showCancelButton() {
    return this.rlmSubscriptionEnabled && this.item?.cancelStatus !== 'Success' && this.item?.billing?.nextBillingDate != null;
  }
  get _disableCancelButton() {
    return this.item?.cancelStatus === 'InProgress';
  }
  get _cancelButtonLabel() {
    return this.item?.cancelStatus === 'Failed' ? this.retryCancelButtonLabel : this.cancelButtonLabel;
  }
  get subscriptionCardStyles() {
    const paddingClass = this.isRenderedInModal ? 'slds-p-vertical_small' : 'slds-p-vertical_large slds-border_bottom';
    return `${paddingClass} subscription-card`;
  }
  get _showChildSubscriptions() {
    return Boolean(this.showChildSubscriptions && this.rlmSubscriptionEnabled && this._childSubscriptionsCount > 0);
  }
  get _showChildSubscriptionsError() {
    return Boolean(this.rlmSubscriptionEnabled && this.childSubscriptionsError);
  }
  get _childSubscriptionsErrorMessage() {
    return childSubscriptionsLoadError;
  }
  get _childSubscriptionsCount() {
    return this._childSubscriptions.length;
  }
  get _subscriptionsBundleExpandedLabel() {
    const count = this._childSubscriptionsCount;
    return subscriptionBundleExpandedLabel.replace('{0}', count.toString());
  }
  get _childSubscriptions() {
    return this.childSubscriptionsData?.items || [];
  }
  get _convertedChildSubscriptions() {
    return this._childSubscriptions.map(childSubscription => this._convertChildSubscriptionToOrderItem(childSubscription));
  }
  renderedCallback() {
    const cmp = this.refs?.subscriptionCard;
    if (cmp) {
      this._menuAlignment = getComputedStyle(cmp).getPropertyValue('--subscription-card-payment-dropdown-menu-alignment');
    }
  }
  cancelStatusExists() {
    return this.item?.cancelStatus != null;
  }
  isSubscriptionCancelled() {
    return this.item?.cancelStatus === SUBSCRIPTION_CANCEL_OPERATION_STATUSES.SUCCESS;
  }
  isSubscriptionExpiringSoon() {
    if (this.item?.sellingModel?.sellingModelType === 'TermDefined' && this.item.endDate) {
      const daysLeft = getNumberOfDaysToGivenDate(this.item.endDate);
      return daysLeft <= DAYS_UNTIL_EXPIRATION;
    }
    return false;
  }
  handleCancelClick() {
    this.dispatchEvent(new CustomEvent('cancel', {
      bubbles: true,
      composed: true
    }));
  }
  handleProductNavigation(event) {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('navigatetoproduct', {
      bubbles: true,
      composed: true
    }));
  }
  handlePaymentMethodChange(event) {
    event.stopPropagation();
    this._selectedPaymentMethod = this?.item?.billing?.savedPaymentMethod ? [this?.item?.billing?.savedPaymentMethod?.id] : [UPDATE_PAYMENT_OPTION_VALUE];
    const currentSavedPaymentMethodId = this?.item?.billing?.savedPaymentMethod?.id;
    if (event.detail.selected === currentSavedPaymentMethodId) {
      return;
    }
    let payload = {};
    if (event.detail.selected !== UPDATE_PAYMENT_OPTION_VALUE) {
      if (event.detail.selected !== ADD_NEW_PAYMENT_METHOD) {
        const selectedPaymentMethod = this.item?.availablePaymentMethods?.find(paymentMethod => paymentMethod.id === event.detail.selected);
        payload = {
          savedPaymentMethodId: selectedPaymentMethod?.id,
          merchantAccountId: selectedPaymentMethod?.merchantAccountId
        };
      }
      this.dispatchEvent(new CustomEvent('addorupdatesavedpaymentmethod', {
        bubbles: true,
        composed: true,
        detail: payload
      }));
    }
  }
  toggleChildSubscriptions(event) {
    event.stopPropagation();
    this._isChildSubscriptionsExpanded = !this._isChildSubscriptionsExpanded;
  }
  _convertChildSubscriptionToOrderItem(childSubscription) {
    const fields = [];
    fields.push({
      label: childSubscriptionQuantityLabel,
      text: childSubscription.quantity != null ? String(childSubscription.quantity) : '',
      type: 'String'
    });
    return {
      id: childSubscription.id || '',
      productId: childSubscription.product?.id || '',
      name: childSubscription.product?.name || '',
      totalPrice: 0,
      isValid: childSubscription.product?.canViewProduct || true,
      media: childSubscription.product?.image ? childSubscription.product.image : {
        url: '',
        alternateText: '',
        contentVersionId: '',
        id: '',
        mediaType: 'image',
        title: '',
        sortOrder: 1,
        thumbnailUrl: ''
      },
      variants: [],
      fields: fields,
      adjustments: [],
      associatedOrderItems: [],
      itemClass: 'Simple',
      isAssetizable: true,
      productSellingModel: childSubscription.sellingModel,
      subscriptionTerm: childSubscription.subscriptionTerm,
      firstPaymentPriceExists: false,
      processExceptions: childSubscription.processExceptions || [],
      orderItemSummaryId: ''
    };
  }
}