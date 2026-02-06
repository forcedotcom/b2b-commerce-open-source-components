import { api, wire } from 'lwc';
import { getI18nCountries } from 'experience/internationalizationApi';
import { AppContextAdapter } from 'commerce/contextApi';
import { CheckoutComponentBase } from 'commerce/checkoutApi';
import { Labels } from './labels';
import { checkoutDeliveryMethodLabels } from './checkoutDeliverymethodLabels';
import { getSummarizedDeliveryDatesRange } from 'site/checkoutDeliveryestimates';
export default class CheckoutDeliverymethod extends CheckoutComponentBase {
  static renderMode = 'light';
  _rawInternationalizationData;
  _supportedCountries;
  _showSplitShipMethods = false;
  _shippingMethodsEnabled = false;
  @api
  expandedMode = false;
  connectedCallback() {
    this.summarize();
    this.hideDeliveryMethodComponent();
  }
  _checkoutDetails;
  @api
  get checkoutDetails() {
    return this._checkoutDetails;
  }
  set checkoutDetails(value) {
    this._checkoutDetails = value;
    this.summarize();
    this.hideDeliveryMethodComponent();
  }
  get areOnlyDigitalGoodsInCart() {
    return this.checkoutDetails?.deliveryGroups?.items.length === 1 && this.checkoutDetails?.deliveryGroups?.items[0].isAllDigitalCartItems;
  }
  summarize() {
    if (!this._summaryMode && this.checkoutDetails?.deliveryGroups?.items?.length === 1 && this.checkoutDetails?.deliveryGroups?.items?.[0]?.selectedDeliveryMethod) {
      this.dispatchRequestAspect({
        summarizable: true,
        uneditable: false
      });
    }
  }
  hideDeliveryMethodComponent() {
    if (this.areOnlyDigitalGoodsInCart) {
      this.dispatchRequestAspect({
        hideable: true
      });
    }
  }
  get _deliveryGoup() {
    return this.checkoutDetails?.deliveryGroups?.items[0];
  }
  checkoutDeliveryMethodLabels = {
    ...checkoutDeliveryMethodLabels,
    dateRangeDeliveryEstimateText: Labels.dateRangeDeliverySummaryEstimateText
  };
  setAspect(newAspect) {
    this._summaryMode = newAspect.summary;
  }
  get summarisedLabel() {
    return getSummarizedDeliveryDatesRange(this.checkoutDetails?.deliveryGroups?.items, this.checkoutDeliveryMethodLabels);
  }
  @wire(AppContextAdapter)
  appContextHandler(response) {
    if (!response.loading) {
      this._supportedCountries = response?.data?.shippingCountries;
      this._showSplitShipMethods = !!response?.data?.splitShipmentEnabled;
      this._shippingMethodsEnabled = response?.data?.checkoutSettings.shippingMethodsEnabled;
    }
  }
  @api
  get shippingMethodsEnabled() {
    return this._shippingMethodsEnabled;
  }
  _summaryMode = false;
  get _showScopedNotification() {
    return this._showWithGroupName && !this._summaryMode && this._showSplitShipMethods;
  }
  set shippingMethodsEnabled(value) {
    this._shippingMethodsEnabled = value;
  }
  splitShipmentScopeNotificationLabel = Labels.splitShipmentScopeNotificationLabel;
  multipleShippingMethodsLabel = Labels.multipleShippingMethodsLabel;
  @wire(getI18nCountries, {
    countries: '$_supportedCountries',
    excludeCountryFilter: false
  })
  internationalizationHandler(response) {
    if (!response.loading && this._supportedCountries !== undefined) {
      this._rawInternationalizationData = response.data;
    }
  }
  get _showWithGroupName() {
    return this.expandedMode && this._showSplitShipMethods || Number(this.checkoutDetails?.deliveryGroups?.items.length) > 1;
  }
  get _showWithoutGroupName() {
    return this.expandedMode || !this._showWithGroupName;
  }
}