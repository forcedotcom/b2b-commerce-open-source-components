import { LightningElement, api, wire } from 'lwc';
import { getI18nCountries } from 'experience/internationalizationApi';
import { transformShippingFields } from './transformShippingFields';
import ORDER_LABELS from './labels';
import { processODGData } from './processOrderDeliveryGroupsData';
import { stateNameRequiredForCountries } from './formatAddress';
export default class OrderDeliveryGroupUi extends LightningElement {
  static renderMode = 'light';
  _formattedOrderDeliveryGroup;
  _orderDeliveryGroup;
  _shippingFieldMapping;
  _isFirstDeliveryGroup = false;
  _isExpanded = false;
  _recomputeDeliveryGroup = true;
  _countries = [];
  @api
  iconBasePath;
  @api
  prefixToShippingGroup;
  @api
  productCountTitle;
  @api
  isOnlyDeliveryGroup = false;
  @api
  shippingPhoneNumber;
  @api
  shippingPhoneNumberLabel;
  @api
  giftOrderLabel;
  @api
  giftMessageLabel;
  @api
  set orderDeliveryGroup(value) {
    this._orderDeliveryGroup = value;
    this._recomputeDeliveryGroup = true;
  }
  get orderDeliveryGroup() {
    return this._orderDeliveryGroup;
  }
  @api
  set shippingFieldMapping(value) {
    this._shippingFieldMapping = value;
    this._recomputeDeliveryGroup = true;
  }
  get shippingFieldMapping() {
    return this._shippingFieldMapping;
  }
  @api
  set isFirstDeliveryGroup(value) {
    this._isFirstDeliveryGroup = value ?? false;
    this._isExpanded = this._isFirstDeliveryGroup;
  }
  get isFirstDeliveryGroup() {
    return this._isFirstDeliveryGroup;
  }
  get formattedOrderDeliveryGroup() {
    if (this._recomputeDeliveryGroup && this.orderDeliveryGroup) {
      this._formattedOrderDeliveryGroup = processODGData(this.orderDeliveryGroup, this.shippingFieldMapping || [], this._countries);
      this._recomputeDeliveryGroup = false;
    }
    return this._formattedOrderDeliveryGroup;
  }
  get _hasMoreThanOneOrderDeliveryGroup() {
    return !this.isOnlyDeliveryGroup;
  }
  get _formattedPrefixToShippingGroup() {
    return this.prefixToShippingGroup ? `${this.prefixToShippingGroup}: ` : '';
  }
  get currencyCode() {
    return this.formattedOrderDeliveryGroup?.currencyCode;
  }
  get _labels() {
    return ORDER_LABELS;
  }
  get _showShippingFields() {
    const shippingFields = this.formattedOrderDeliveryGroup?.shippingFields;
    const deliveryMethodNameField = shippingFields?.find(field => field.dataName === 'Name');
    return Boolean(shippingFields?.length) && (!deliveryMethodNameField || deliveryMethodNameField.text !== 'UNKNOWN');
  }
  get _transformedShippingFields() {
    return transformShippingFields(this.formattedOrderDeliveryGroup?.shippingFields);
  }
  get expandedSectionClasses() {
    const classes = 'expand-section';
    return this.isOnlyDeliveryGroup ? `${classes} slds-p-left_x-small` : `${classes} slds-p-left_large`;
  }
  get fetchIcon() {
    return `${this.iconBasePath}/assets/icons/location.svg#location`;
  }
  get fetchPhoneIcon() {
    return `${this.iconBasePath}/assets/icons/phone.svg#phone`;
  }
  get _shipToCity() {
    return this.formattedOrderDeliveryGroup?.shipToCity;
  }
  get _deliveryGroupAddress() {
    return this.formattedOrderDeliveryGroup?.groupTitle;
  }
  get _totalProductsCount() {
    return this.formattedOrderDeliveryGroup?.lineItems ? this.formattedOrderDeliveryGroup?.lineItems.length.toString() : '';
  }
  get totalProductsCountLabel() {
    return this.productCountTitle?.replace('{0}', `${this._totalProductsCount}`) ?? '';
  }
  get _groupTitle() {
    return `${this._formattedPrefixToShippingGroup} ${this._shipToCity} ${this._deliveryGroupAddress}`;
  }
  get _deliveryGroupSummarySectionId() {
    return `order-delivery-group-section-${this._formattedOrderDeliveryGroup?.orderDeliveryGroupSummaryId}`;
  }
  get _isGift() {
    return Boolean(this._formattedOrderDeliveryGroup?.isGift);
  }
  get _giftMessage() {
    return this._formattedOrderDeliveryGroup?.giftMessage;
  }
  get _showIsGift() {
    return Boolean(this._isGift && this.giftOrderLabel);
  }
  get _showGiftingDetails() {
    return Boolean(this._showIsGift || this._giftMessage);
  }
  @wire(getI18nCountries, {
    countries: stateNameRequiredForCountries,
    excludeCountryFilter: false
  })
  internationalizationHandler(response) {
    this._countries = response?.data?.addressCountries || [];
    this._recomputeDeliveryGroup = true;
  }
  handleClick() {
    this.toggleVisibility();
  }
  toggleVisibility() {
    this._isExpanded = !this._isExpanded;
  }
}