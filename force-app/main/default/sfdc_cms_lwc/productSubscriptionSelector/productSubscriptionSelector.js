import { LightningElement, api } from 'lwc';
import { subscriptionDetail, subscriptionType } from './labels';
import { getSubscriptionDetailOptionValue, getSubscriptionTypeOptionValue } from './productSubscriptionOptionGenerator';
import { generateProductSubscriptionOptions } from './productSubscriptionTypeGroupingService';
const SUBSCRIPTION_CHANGED = 'subscriptionchanged';
export default class ProductSubscriptionSelector extends LightningElement {
  static renderMode = 'light';
  @api
  set currency(currency) {
    this._currency = currency;
    this.updateSubscriptionOption();
  }
  get currency() {
    return this._currency;
  }
  @api
  set productSellingModels(productSellingModels) {
    this._productSellingModels = productSellingModels;
    this.updateSubscriptionOption();
  }
  get productSellingModels() {
    return this._productSellingModels;
  }
  @api
  set readOnly(readOnly) {
    this._readOnly = readOnly;
  }
  get readOnly() {
    return this._readOnly;
  }
  @api
  set selectedSubscription(selectedSubscription) {
    this._selectedSubscription = selectedSubscription;
    this.updateActiveSubscription();
  }
  get selectedSubscription() {
    return this._selectedSubscription;
  }
  _currency;
  _productSellingModels;
  _readOnly = false;
  _selectedSubscription;
  _subscriptionTypeOptions;
  _subscriptionDetailOptionsMap;
  _activeSubscriptionType;
  _activeSubscriptionDetail;
  _activeSubscriptionDetailOptions;
  get _subscriptionTypeLabel() {
    return subscriptionType;
  }
  get _subscriptionDetailLabel() {
    return subscriptionDetail;
  }
  get _displaySubscriptionTypeOptions() {
    return (this._subscriptionTypeOptions?.length || 0) > 1;
  }
  get _displaySubscriptionDetailOptions() {
    return this._displaySubscriptionTypeOptions || (this._activeSubscriptionDetailOptions?.length || 0) > 1;
  }
  get _displaySubscriptionDetailOptionsText() {
    return !this._displaySubscriptionTypeOptions && (this._activeSubscriptionDetailOptions?.length || 0) === 1;
  }
  get _activeSubscriptionDetailOptionsText() {
    return this._activeSubscriptionDetailOptions?.[0].label;
  }
  updateSubscriptionOption() {
    if (this.productSellingModels && this.currency) {
      const {
        subscriptionTypeOptions,
        subscriptionDetailOptionsMap
      } = generateProductSubscriptionOptions(this.productSellingModels, this.currency);
      this._subscriptionTypeOptions = subscriptionTypeOptions;
      this._subscriptionDetailOptionsMap = subscriptionDetailOptionsMap;
      this.updateActiveSubscription();
    }
  }
  updateActiveSubscription() {
    if (this._selectedSubscription) {
      this._activeSubscriptionType = getSubscriptionTypeOptionValue(this._selectedSubscription.detail?.sellingModelType, this._selectedSubscription.detail?.pricingTermUnit);
      this._activeSubscriptionDetailOptions = this._subscriptionDetailOptionsMap?.get(this._activeSubscriptionType);
      this._activeSubscriptionDetail = getSubscriptionDetailOptionValue(this._selectedSubscription.productSellingModelId, this._selectedSubscription.subscriptionTerm);
    } else {
      this._activeSubscriptionType = this._subscriptionTypeOptions?.[0]?.value;
      this._activeSubscriptionDetailOptions = this._subscriptionDetailOptionsMap?.get(this._activeSubscriptionType);
      this._activeSubscriptionDetail = this._activeSubscriptionDetailOptions?.[0]?.value;
    }
  }
  handleProductSellingTypeChange(event) {
    this._activeSubscriptionType = event?.detail?.value;
    this._activeSubscriptionDetailOptions = this._subscriptionDetailOptionsMap?.get(this._activeSubscriptionType);
    this._activeSubscriptionDetail = this._activeSubscriptionDetailOptions?.[0]?.value;
    this.activateSubscription();
  }
  handleProductSellingSubTypeChange(event) {
    this._activeSubscriptionDetail = event?.detail?.value;
    this.activateSubscription();
  }
  activateSubscription() {
    const {
      productSellingModelId,
      subscriptionTerm
    } = JSON.parse(this._activeSubscriptionDetail || '{}');
    if (!this.readOnly && productSellingModelId) {
      this.dispatchEvent(new CustomEvent(SUBSCRIPTION_CHANGED, {
        bubbles: true,
        composed: true,
        detail: {
          productSellingModelId,
          subscriptionTerm
        }
      }));
    }
  }
}
export { getPriceTermUnitFrequencyLabel, getPriceTermUnitLabel, getSubscriptionTermUnitLabel } from './priceTermUnitService';