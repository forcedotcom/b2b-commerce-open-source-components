import { api, LightningElement } from 'lwc';
import { resolve as resolveResource } from 'experience/resourceResolver';
import { SUBSCRIPTION_CANCEL_OPERATION_STATUSES, CANCEL_STATUS_DISPLAY_DETAILS, SUBSCRIPTION_BANNER_CANCEL_DISPLAY_DETAILS } from './cancelStatusConfig';
import { SUBSCRIPTION_BANNER_RENEWAL_DISPLAY_DETAILS, RENEWAL_STATUS_DISPLAY_DETAILS } from './renewalStatusConfig';
import { AMENDMENT_STATUS_DISPLAY_DETAILS, SUBSCRIPTION_BANNER_AMENDMENT_DISPLAY_DETAILS } from './amendmentStatusConfig';
import { getNumberOfDaysToGivenDate, formatDate } from './dateUtil';
import { getSubscriptionFrequencyLabel, getExpiringOnDateText } from './labelTextGenerator';
import LOCALE from '@salesforce/i18n/locale';
import { getIconPath } from './paymentIconPath';
import { paymentMethodsLoadError, paymentMethodAddNewLabel, updatePaymentTextLabel, paymentFailureText, savedPaymentMethodDeletedText, amendSubscriptionCardMoreButtonLabel, amendSubscriptionCardAmendButtonLabel, viewHistoryButtonLabel, renewSubscriptionButtonLabel, renewSectionHeadingLabel, renewSectionDescriptionLabel, subscriptionBundleExpandedLabel, childSubscriptionsLoadError, childSubscriptionQuantityLabel, cancelSubscriptionButtonLabel } from './labels';
import { generateStyleProperties } from 'experience/styling';
export { getSubscriptionFrequencyLabel } from './labelTextGenerator';
export { formatDate } from './dateUtil';
export { SUBSCRIPTION_CANCEL_OPERATION_STATUSES } from './cancelStatusConfig';
const IMAGE_WIDTH_SMALL = 120;
const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;
const ADD_NEW_PAYMENT_METHOD = 'ADD_NEW_PAYMENT_METHOD';
const UPDATE_PAYMENT_OPTION_VALUE = 'UPDATE_PAYMENT_OPTION_VALUE';
const UPDATE_PAYMENT_OBJECT = {
  label: updatePaymentTextLabel,
  value: UPDATE_PAYMENT_OPTION_VALUE
};
export default class SubscriptionCardV2 extends LightningElement {
  static renderMode = 'light';
  static cancelSubscriptionVal = 'cancelSubscription';
  static viewHistoryVal = 'viewHistory';
  _menuAlignment = 'right';
  _item;
  _selectedPaymentMethod = [];
  @api
  set item(value) {
    this._item = value;
    this._selectedPaymentMethod = value?.billing?.savedPaymentMethod ? [value?.billing?.savedPaymentMethod?.id] : [UPDATE_PAYMENT_OPTION_VALUE];
    this.updateSubscriptionStatus();
  }
  get item() {
    return this._item;
  }
  @api
  amendButtonLabel;
  @api
  viewHistoryButtonLabel;
  @api
  renewButtonLabel;
  @api
  renewSectionTitle;
  @api
  renewSectionDescription;
  @api
  moreButtonLabel;
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
  productUrl;
  @api
  childSubscriptionsData;
  @api
  childSubscriptionsError;
  @api
  showChildSubscriptions = false;
  _isChildSubscriptionsExpanded = false;
  showSubscriptionStatus = false;
  subscriptionStatusMainText;
  subscriptionStatusIcon;
  subscriptionStatusMainTextClasses;
  subscriptionStatusSupportText;
  showSubscriptionBanner = false;
  subscriptionBannerMainText;
  subscriptionBannerIcon;
  subscriptionBannerMainTextClasses;
  subscriptionBannerStyles;
  _expiresOnDateLabel;
  getAbsoluteAmendmentQuantityChange() {
    const changeLog = this.item?.lastAction?.details?.changes;
    const quantityChange = changeLog?.find(change => change?.field === 'quantity');
    const previousQuantity = Number(quantityChange?.previousValue);
    const newQuantity = Number(quantityChange?.newValue);
    const bothAreValidNumbers = Number.isFinite(previousQuantity) && Number.isFinite(newQuantity);
    return bothAreValidNumbers ? newQuantity - previousQuantity : 0;
  }
  getARCEffectiveDate() {
    const lastActionDate = this.item?.lastAction?.effectiveDateTime;
    return lastActionDate || undefined;
  }
  formatBannerText(label) {
    if (!label || !label.includes('{')) {
      return label;
    }
    const quantityChange = Math.abs(this.getAbsoluteAmendmentQuantityChange());
    const effectiveDate = formatDate(LOCALE, this.getARCEffectiveDate());
    return label.replace(/\{0}/g, String(quantityChange)).replace(/\{1}/g, effectiveDate);
  }
  updateSubscriptionStatus() {
    if (!this._isSubscriptionActive) {
      this.showSubscriptionStatus = false;
      this.showSubscriptionBanner = false;
      return;
    }
    let subscriptionStatus;
    let subscriptionStatusDetails;
    let subscriptionBannerDetails;
    if (this.amendmentStatusExists()) {
      subscriptionStatus = this.item?.amendmentStatus;
      subscriptionStatusDetails = AMENDMENT_STATUS_DISPLAY_DETAILS;
      subscriptionBannerDetails = SUBSCRIPTION_BANNER_AMENDMENT_DISPLAY_DETAILS[this.getAbsoluteAmendmentQuantityChange() >= 0 ? 'Positive' : 'Negative'];
    } else if (this.cancelStatusExists()) {
      subscriptionStatus = this.item?.cancelStatus;
      subscriptionStatusDetails = CANCEL_STATUS_DISPLAY_DETAILS;
      subscriptionBannerDetails = SUBSCRIPTION_BANNER_CANCEL_DISPLAY_DETAILS;
    } else if (this.renewalStatusExists()) {
      subscriptionStatus = this.item?.renewalStatus;
      subscriptionStatusDetails = RENEWAL_STATUS_DISPLAY_DETAILS;
      subscriptionBannerDetails = SUBSCRIPTION_BANNER_RENEWAL_DISPLAY_DETAILS;
    } else {
      this.showSubscriptionStatus = false;
      this.showSubscriptionBanner = false;
      return;
    }
    if (subscriptionStatus === 'InProgress') {
      this.subscriptionStatusMainText = subscriptionStatusDetails.InProgress.mainText;
      this.subscriptionStatusSupportText = subscriptionStatusDetails.InProgress.supportText;
      this.subscriptionStatusIcon = subscriptionStatusDetails.InProgress.iconPath;
      this.showSubscriptionBanner = false;
    } else if (subscriptionStatus === 'Failed') {
      this.subscriptionStatusMainText = subscriptionStatusDetails.Failed.mainText;
      this.subscriptionStatusSupportText = subscriptionStatusDetails.Failed.supportText;
      this.subscriptionStatusIcon = subscriptionStatusDetails.Failed.iconPath;
      this.showSubscriptionBanner = false;
    } else if (subscriptionStatus === 'Success') {
      this.subscriptionStatusMainText = subscriptionStatusDetails.Success.mainText;
      this.subscriptionStatusSupportText = subscriptionStatusDetails.Success.supportText;
      this.subscriptionStatusIcon = subscriptionStatusDetails.Success.iconPath;
      this.showSubscriptionBanner = true;
      this.subscriptionBannerMainText = this.formatBannerText(subscriptionBannerDetails.mainText);
      this.subscriptionBannerIcon = subscriptionBannerDetails.iconPath;
      this.subscriptionBannerMainTextClasses = 'success-status-main-text slds-p-left_small';
      if (this.amendmentStatusExists()) {
        this.subscriptionBannerStyles = 'amendment-subscription-banner-styles';
      } else if (this.cancelStatusExists()) {
        this.subscriptionBannerStyles = 'cancel-subscription-banner-styles';
      } else if (this.renewalStatusExists()) {
        this.subscriptionBannerStyles = 'renewal-subscription-banner-styles';
      }
    }
    this.showSubscriptionStatus = true;
    this.subscriptionStatusMainTextClasses = 'success-status-main-text';
  }
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
    return this._isSubscriptionActive && !this.isSubscriptionCancelled();
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
  get _showExpiringText() {
    return this._isSubscriptionActive && !this.isSubscriptionCancelled() && this.isInLastTerm();
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
  get _isSubscriptionInActive() {
    return !this._isSubscriptionActive;
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
    return this._isSubscriptionActive && this.rlmSubscriptionEnabled && !this._showRenewSection && this.item?.billing?.nextBillingDate != null && this.item?.cancelStatus !== 'Success' && this.item?.renewalStatus !== 'Success';
  }
  get hasNoPendingAmendments() {
    return !((this.item?.amendmentStatus === 'InProgress' || this.item?.amendmentStatus === 'Success') && this.item?.lastAction?.effectiveDateTime && new Date() <= new Date(this.item.lastAction.effectiveDateTime));
  }
  get _showAmendButton() {
    return this._isSubscriptionActive && this.rlmSubscriptionEnabled && !this._showRenewSection && this.item?.billing?.nextBillingDate != null && this.item?.cancelStatus !== 'Success' && this.item?.renewalStatus !== 'Success';
  }
  get _showRenewSection() {
    return this._isSubscriptionActive && !this.isSubscriptionCancelled() && this.isInLastTerm() && this.item?.renewalStatus !== 'Success';
  }
  get _disableCancelButton() {
    return (this.item?.cancelStatus || '') === 'InProgress' || (this.item?.amendmentStatus || '') === 'InProgress' || !this.hasNoPendingAmendments;
  }
  get _disableRenewButton() {
    return (this.item?.renewalStatus || '') === 'InProgress';
  }
  get _disableAmendButton() {
    return (this.item?.amendmentStatus || '') === 'InProgress' || (this.item?.cancelStatus || '') === 'InProgress' || !this.hasNoPendingAmendments;
  }
  @api
  get finalCancelButtonLabel() {
    return (this.item?.cancelStatus === 'Failed' ? this.retryCancelButtonLabel : this.cancelButtonLabel) || cancelSubscriptionButtonLabel;
  }
  handleRenewClick() {
    this.dispatchEvent(new CustomEvent('renew', {
      bubbles: true,
      composed: true
    }));
  }
  @api
  handleAmendClick() {
    this.dispatchEvent(new CustomEvent('amend', {
      bubbles: true,
      composed: true
    }));
  }
  get _amendButtonLabel() {
    return this.amendButtonLabel || amendSubscriptionCardAmendButtonLabel;
  }
  get _viewHistoryButtonLabel() {
    return this.viewHistoryButtonLabel || viewHistoryButtonLabel;
  }
  get _renewButtonLabel() {
    return this.renewButtonLabel || renewSubscriptionButtonLabel;
  }
  get _renewSectionTitle() {
    return this.renewSectionTitle || renewSectionHeadingLabel;
  }
  get _renewSectionDescription() {
    return this.renewSectionDescription || renewSectionDescriptionLabel;
  }
  get _moreButtonLabel() {
    return this.moreButtonLabel || amendSubscriptionCardMoreButtonLabel;
  }
  get subscriptionCardStyles() {
    const paddingClass = this.isRenderedInModal ? 'slds-p-vertical_small' : 'slds-p-vertical_large slds-border_bottom';
    return `${paddingClass} subscription-card-border-box slds-m-around_medium subscription-card`;
  }
  isInLastTerm() {
    if (this.item?.sellingModel?.sellingModelType === 'TermDefined' && this.item?.endDate) {
      const expiresOnDate = new Date(this.item?.endDate);
      expiresOnDate.setDate(expiresOnDate.getDate() + 1);
      this._expiresOnDateLabel = getExpiringOnDateText(formatDate(LOCALE, expiresOnDate.toISOString().split('T')[0]));
      const daysLeft = getNumberOfDaysToGivenDate(this.item.endDate);
      return daysLeft <= this.getBillingUnitDays();
    }
    return false;
  }
  getBillingUnitDays() {
    const unit = this.item?.sellingModel?.pricingTermUnit;
    switch (unit) {
      case 'Monthly':
        return DAYS_IN_MONTH;
      case 'Annual':
        return DAYS_IN_YEAR;
      default:
        return DAYS_IN_MONTH;
    }
  }
  get subscriptionMenuItemStyles() {
    return 'slds-dropdown_x-small slds-align-middle slds-text-body_small slds-p-vertical_xx-small';
  }
  get cancelSubscriptionMenuItemStyles() {
    return 'slds-dropdown_x-small slds-align-middle slds-text-body_small slds-p-vertical_xx-small cancel-menu-item';
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
    return (subscriptionBundleExpandedLabel ?? '').replace('{0}', count.toString());
  }
  get _childSubscriptions() {
    return this.childSubscriptionsData?.items || [];
  }
  get _convertedChildSubscriptions() {
    return this._childSubscriptions.map(childSubscription => this._convertChildSubscriptionToOrderItem(childSubscription));
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
  toggleChildSubscriptions(event) {
    event.stopPropagation();
    this._isChildSubscriptionsExpanded = !this._isChildSubscriptionsExpanded;
  }
  renderedCallback() {
    const cmp = this.refs?.subscriptionCard;
    if (cmp) {
      this._menuAlignment = getComputedStyle(cmp).getPropertyValue('--subscription-card-payment-dropdown-menu-alignment');
    }
  }
  cancelStatusExists() {
    return this.item?.cancelStatus != null && this.item?.lastAction?.type === 'Cancel';
  }
  isSubscriptionCancelled() {
    return this.item?.cancelStatus === SUBSCRIPTION_CANCEL_OPERATION_STATUSES.SUCCESS;
  }
  amendmentStatusExists() {
    return this.item?.amendmentStatus != null && this.item?.lastAction?.type === 'Amend';
  }
  renewalStatusExists() {
    return this.item?.renewalStatus != null && this.item?.lastAction?.type === 'Renew';
  }
  @api
  handleCancelClick() {
    this.dispatchEvent(new CustomEvent('cancel', {
      bubbles: true,
      composed: true
    }));
  }
  @api
  handleViewHistoryClick() {
    this.dispatchEvent(new CustomEvent('viewhistory', {
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
  get childSubscriptionListStyles() {
    const styles = [{
      name: '--com-c-order-product-title-font-weight',
      value: 'regular'
    }];
    return generateStyleProperties(styles);
  }
}