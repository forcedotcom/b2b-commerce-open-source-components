import { api, LightningElement } from 'lwc';
import { prepareProductSellingModelData } from './productSellingModelDataGenerator';
const SUBSCRIPTION_CHANGED = 'subscriptionchanged';
export default class ProductSellingmodelSelectorUi extends LightningElement {
  static renderMode = 'light';
  @api
  set product(product) {
    this._product = product;
    this.initializeSubscriptionOptions();
  }
  get product() {
    return this._product;
  }
  @api
  set productPricing(productPricing) {
    this._productPricing = productPricing;
    this.initializeSubscriptionOptions();
  }
  get productPricing() {
    return this._productPricing;
  }
  @api
  set selectedProductSellingModel(selectedProductSellingModel) {
    this._selectedProductSellingModel = selectedProductSellingModel;
    this.initializeSelectedSectionStatus();
  }
  get selectedProductSellingModel() {
    return this._selectedProductSellingModel;
  }
  @api
  showBorder = false;
  _selectedProductSellingModel;
  _product;
  _productPricing;
  _productSellingModels;
  _oneTimeProductSellingModelDetail;
  _subscriptionsExist = false;
  _subscriptionActive = false;
  _subscriptionModelId;
  _subscriptionTerm;
  _radioGroupPrefix = Math.floor(Math.random() * 100);
  get _currency() {
    return this._productPricing?.currencyIsoCode;
  }
  get _oneTimeExist() {
    return Boolean(this._oneTimeProductSellingModelDetail);
  }
  get _hasOneTimeDescription() {
    return this._oneTimeExist && Boolean(this._oneTimeProductSellingModelDetail?.displayName);
  }
  get _hasSubscribeDescription() {
    return this._subscriptionsExist && Boolean(this._selectedSubscription?.detail?.description);
  }
  get _oneTimeActive() {
    return !this._subscriptionActive;
  }
  get _selectedSubscription() {
    return this._subscriptionActive ? this.selectedProductSellingModel : null;
  }
  get _displayAllOptions() {
    return this._oneTimeExist && this._subscriptionsExist;
  }
  get _productName() {
    return this.product?.fields?.Name;
  }
  get _sellingModelContainerCSSClass() {
    return ['slds-card', 'sellingmodelcontainer', ...(!this.showBorder || !this._displayAllOptions ? ['border_none'] : [])].join(' ');
  }
  get _lifeTimeSellingModelCSSClasses() {
    return ['sellingmodel', 'slds-var-p-top_xx-small', 'slds-var-p-bottom_medium', ...(this.showBorder && this._displayAllOptions ? ['slds-p-horizontal_medium'] : []), ...(this._oneTimeActive ? ['active'] : [])].join(' ');
  }
  get _subscriptionSellingModelCSSClasses() {
    return ['sellingmodel', 'slds-p-top_xx-small', ...(this.showBorder && this._displayAllOptions ? ['slds-p-horizontal_medium'] : []), ...(this.showBorder && this._oneTimeExist ? ['border_top'] : []), ...(this._subscriptionActive ? ['active slds-p-bottom_x-small'] : [])].join(' ');
  }
  get _sellingModelDetailsCSSClasses() {
    return ['sellingmodel-info', ...(this._displayAllOptions ? ['slds-m-left_large'] : [])].join(' ');
  }
  get _radioButtonGroupName() {
    return `${this.product?.id}_${this._radioGroupPrefix}`;
  }
  get _oneTimeRadioButtonId() {
    return this._radioButtonGroupName + '_onetime';
  }
  get _subscribeRadioButtonId() {
    return this._radioButtonGroupName + '_subscribe';
  }
  initializeSubscriptionOptions() {
    this._productSellingModels = prepareProductSellingModelData(this.product, this.productPricing);
    this._oneTimeProductSellingModelDetail = this.product?.productSellingModels?.find(productSellingModel => productSellingModel.sellingModelType === 'OneTime');
    this._subscriptionsExist = Boolean(this.product?.productSellingModels?.find(productSellingModel => productSellingModel.sellingModelType === 'Evergreen' || productSellingModel.sellingModelType === 'TermDefined'));
    this.initializeSelectedSectionStatus();
  }
  updateSelectedSellingModel(productSellingModelId, subscriptionTerm) {
    this.dispatchEvent(new CustomEvent(SUBSCRIPTION_CHANGED, {
      bubbles: true,
      composed: true,
      detail: {
        productSellingModelId,
        subscriptionTerm
      }
    }));
  }
  initializeSelectedSectionStatus() {
    if (this.selectedProductSellingModel) {
      this._subscriptionActive = this.selectedProductSellingModel.detail.sellingModelType === 'Evergreen' || this.selectedProductSellingModel.detail.sellingModelType === 'TermDefined';
    } else if (!this._oneTimeProductSellingModelDetail) {
      this._subscriptionActive = true;
    }
  }
  handlePurchaseOptionChange(event) {
    this._subscriptionActive = event.target.value === 'subscription';
    if (!this._subscriptionActive) {
      this.updateSelectedSellingModel(this._oneTimeProductSellingModelDetail?.id);
    } else if (!this._subscriptionModelId) {
      let subscribePSM = this._productSellingModels?.find(productSellingModel => productSellingModel.detail.sellingModelType === 'Evergreen');
      if (!subscribePSM) {
        subscribePSM = this._productSellingModels?.find(productSellingModel => productSellingModel.detail.sellingModelType === 'TermDefined');
      }
      this._subscriptionModelId = subscribePSM?.productSellingModelId;
      this._subscriptionTerm = subscribePSM?.detail.subscriptionTermRule?.minimum;
      this.updateSelectedSellingModel(this._subscriptionModelId, this._subscriptionTerm);
    } else {
      this.updateSelectedSellingModel(this._subscriptionModelId, this._subscriptionTerm);
    }
  }
  handleSubscriptionSelectorChange(event) {
    const {
      productSellingModelId,
      subscriptionTerm
    } = event.detail;
    this._subscriptionModelId = productSellingModelId;
    this._subscriptionTerm = subscriptionTerm;
  }
}