import { api } from 'lwc';
import { resolve as resolveResource } from 'experience/resourceResolver';
import LightningModal from 'lightning/modal';
import LABELS from './labels';
import { getSubscriptionFrequencyLabel, getSubscriptionAmendmentSuccessMsg } from './labelTextGenerator';
import { formatDate } from './dateUtil';
import LOCALE from '@salesforce/i18n/locale';
import { amendSubscription, getARCToastMsg } from 'commerce/subscriptionApi';
import Toast from 'site/commonToast';
import { defaultRules } from 'site/commonQuantitySelector';
export { formatDate };
const IMAGE_WIDTH_SMALL = 120;
const SELLING_MODEL_TYPE_EVERGREEN = 'Evergreen';
export default class SubscriptionAmendModal extends LightningModal {
  _labels = LABELS;
  _isLoading = false;
  get _isNotLoading() {
    return !this._isLoading;
  }
  _item;
  @api
  set item(value) {
    this._item = value;
    this.currentQuantity = value?.quantity;
  }
  get item() {
    return this._item;
  }
  changeQuantity = 0;
  @api
  quantityLabel;
  @api
  taxLabel;
  @api
  amendButtonLabel;
  get _amendButtonLabel() {
    return this.amendButtonLabel || LABELS.amendSubscriptionButtonLabel;
  }
  isQuantityInvalid = false;
  isNegativeAmendment = false;
  isPositiveAmendment = false;
  enableAmendButton = false;
  get disableAmendButton() {
    return !this.enableAmendButton;
  }
  _selectedDate = this.minStartDate;
  _amendStartDate = '';
  get minStartDate() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  get subscriptionEndDate() {
    const endDate = this.item?.endDate;
    if (endDate === null || endDate === undefined) {
      return endDate;
    }
    return endDate.split('T')[0];
  }
  get isEvergreenModel() {
    return this._sellingModelType === SELLING_MODEL_TYPE_EVERGREEN;
  }
  handleDateSelect(event) {
    if (event.detail) {
      this._selectedDate = event.detail.value;
      this._amendStartDate = this._selectedDate;
      if (this.isEvergreenModel) {
        this.enableAmendButton = this._selectedDate >= this.minStartDate;
      } else {
        this.enableAmendButton = this._selectedDate >= this.minStartDate && this.subscriptionEndDate !== null && this.subscriptionEndDate !== undefined && this._selectedDate <= this.subscriptionEndDate;
      }
      const dateInput = this.template.querySelector('lightning-input.date-input');
      dateInput?.reportValidity();
    }
  }
  get _nextBillingDate() {
    return formatDate(LOCALE, this.item?.billing?.nextBillingDate);
  }
  currentQuantity;
  handleClose() {
    this.close('close');
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
  handleValueChanged(event) {
    this.isQuantityInvalid = !event?.detail?.isValid;
    if (!this.isQuantityInvalid) {
      this.currentQuantity = event?.detail?.value;
      this.changeQuantity = (this.currentQuantity || 0) - (this.item?.quantity || 0);
      if (this.changeQuantity === 0) {
        this.isNegativeAmendment = false;
        this.isPositiveAmendment = false;
        this.enableAmendButton = false;
        this._amendStartDate = '';
        this._selectedDate = this.minStartDate;
      } else if (this.changeQuantity < 0) {
        this.isNegativeAmendment = true;
        this.isPositiveAmendment = false;
        this.enableAmendButton = true;
        this._amendStartDate = this.item?.billing?.nextBillingDate ? this.item?.billing?.nextBillingDate.split('T')[0] : '';
      } else {
        this.isNegativeAmendment = false;
        this.isPositiveAmendment = true;
        this.enableAmendButton = true;
        this._amendStartDate = this._selectedDate;
      }
    } else {
      this.enableAmendButton = false;
    }
  }
  get quantityRuleMinimum() {
    return this._item?.product?.purchaseQuantityRule?.minimum || defaultRules.minimum;
  }
  get quantityRuleMaximum() {
    return this._item?.product?.purchaseQuantityRule?.maximum || defaultRules.maximum;
  }
  get quantityRuleIncrement() {
    return this._item?.product?.purchaseQuantityRule?.increment || defaultRules.step;
  }
  async handleAmendSubscription() {
    try {
      if (!this._amendStartDate) {
        throw Error;
      }
      const subscriptionIds = [this.item?.id];
      const amendSubscriptionRequestOptions = {
        subscriptionIds: subscriptionIds.filter(id => id !== null && id !== undefined),
        quantityChange: this.changeQuantity,
        amendStartDate: this._amendStartDate + 'T00:00:00'
      };
      this.enableAmendButton = false;
      this._isLoading = true;
      await amendSubscription(amendSubscriptionRequestOptions);
      const formattedDate = formatDate(LOCALE, this._amendStartDate);
      Toast.show({
        label: getSubscriptionAmendmentSuccessMsg(formattedDate),
        variant: 'success'
      }, this);
      this.close('close');
    } catch (exception) {
      this._isLoading = false;
      const toastMsg = getARCToastMsg(exception, LABELS.amendSubscriptionErrorMsg);
      Toast.show({
        label: toastMsg,
        variant: 'error'
      }, this);
    }
    this.enableAmendButton = true;
  }
}