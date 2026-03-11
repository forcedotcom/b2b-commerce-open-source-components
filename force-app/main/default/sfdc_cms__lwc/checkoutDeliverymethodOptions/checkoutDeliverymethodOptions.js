import { api, track } from 'lwc';
import { CheckoutStencilType } from 'site/checkoutStencil';
import { isSameAvailableDeliveryMethods, CheckoutError, CheckoutStage, CheckoutComponentBase, checkoutStatusIsReady, ekgElapsedTime, ekgPublishLogs } from 'commerce/checkoutApi';
import currencyFormatter from 'site/commonFormatterCurrency';
import { labels } from './checkoutDeliverymethodOptionsLabels';
import { getFormattedDeliveryEstimate } from 'site/checkoutDeliveryestimates';
import { createCheckoutShippingOptionsDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
export default class CheckoutDeliverymethodOptions extends CheckoutComponentBase {
  static renderMode = 'light';
  @api
  labels = labels;
  @api
  showMultipleShipmentsUi = false;
  _uniqueId = (Math.random() + 1).toString(36).substring(7);
  @track
  _checkoutDetails;
  @api
  get checkoutDetails() {
    return this._checkoutDetails;
  }
  set checkoutDetails(value) {
    this._checkoutDetails = value;
    this.onSetProperties();
  }
  @track
  _deliveryGroup;
  @api
  get deliveryGroup() {
    return this._deliveryGroup;
  }
  set deliveryGroup(value) {
    this._deliveryGroup = value;
    this.onSetProperties();
  }
  get _emptyMessage() {
    return this.labels.emptyMessage;
  }
  _availableDeliveryMethods = [];
  _stencilType = CheckoutStencilType.SHIPPING_METHOD;
  _showSummary = false;
  _readOnlyIfValid = false;
  get _showStencil() {
    return !this._showSummary && this._hasAddress && this._isLoading && this._availableDeliveryMethods.length === 0;
  }
  get _isShowEmptyMessage() {
    return !this._showStencil && !this._showSummary && !this._hasAddress;
  }
  get _showEdit() {
    return !this._showStencil && !this._showSummary && this._hasAddress && !!this.shippingMethodsEnabled;
  }
  get _readOnly() {
    return this._readOnlyIfValid && this.checkValidity();
  }
  get _hasAddress() {
    return !!this._deliveryGroup?.deliveryAddress;
  }
  get _isLoading() {
    return !checkoutStatusIsReady(this.checkoutDetails?.checkoutStatus);
  }
  _helpMessage;
  get _ariaInvalid() {
    return !!this._helpMessage;
  }
  get _showErrorNotification() {
    return !this._isLoading && !this.checkoutDetails?.formStatus?.dirty && this._hasAddress && this._deliveryGroup?.availableDeliveryMethods?.length === 0;
  }
  get transformedSelectedOption() {
    return this.transformedOptions.filter(opt => opt.isChecked)[0];
  }
  get transformedOptions() {
    return this._availableDeliveryMethods.map(opt => ({
      name: `delivery-method-${this._uniqueId}`,
      radioId: `radio-${this._uniqueId}-${opt.id}`,
      radioAria: `radio-${opt.id}`,
      isChecked: this.selectedDeliveryMethodId === opt.id,
      value: opt.id,
      labelId: `label-${this._uniqueId}-${opt.id}`,
      labelAria: `label-${opt.id}`,
      label: opt.name,
      priceAria: 'price-' + opt.id,
      originalPriceAria: 'original-price-' + opt.id,
      shippingFeeOriginal: opt.shippingFee,
      hasAdjustedShippingFee: !!opt.adjustedShippingFee && opt.adjustedShippingFee !== opt.shippingFee,
      shippingFee: opt.adjustedShippingFee || opt.shippingFee,
      currencyIsoCode: opt.currencyIsoCode,
      deliveryEstimate: getFormattedDeliveryEstimate(opt, this.labels)
    }));
  }
  connectedCallback() {
    this.onSetProperties();
  }
  @api
  shippingMethodsEnabled = undefined;
  onSetProperties() {
    if (this.isConnected && this.checkoutDetails && this.deliveryGroup) {
      if (this.shippingMethodsEnabled !== undefined && !this.shippingMethodsEnabled) {
        this.dispatchRequestAspect({
          hideable: true
        });
        return;
      }
      const availableDeliveryMethods = this._deliveryGroup?.availableDeliveryMethods ?? [];
      const optionsChanged = !isSameAvailableDeliveryMethods(this._availableDeliveryMethods, availableDeliveryMethods);
      if (!this._isLoading && !this.checkoutDetails.formStatus?.dirty && this._deliveryGroup?.isDefault) {
        const groupId = 'DbbDeliveryMethod';
        const type = '/site/commerceErrors/shipping-failure';
        const types = [type, '/commerce/integrations/shipping', '/commerce/integrations/other'];
        const hasErrorTypeNotGroup = this.checkoutDetails?.notifications?.find(n => n.groupId !== groupId && n.type && types.includes(n.type)) || this.checkoutDetails?.errors?.find(n => n.type && types.includes(n.type));
        const hasErrorGroup = this.checkoutDetails?.notifications?.find(n => n.groupId === groupId);
        const anyDeliveryOptionsMissing = this.checkoutDetails.deliveryGroups?.items.reduce((acc, dg) => {
          const hasAddress = !!dg.deliveryAddress;
          acc = acc || hasAddress && !dg.availableDeliveryMethods?.length;
          return acc;
        }, false);
        if (!hasErrorTypeNotGroup && anyDeliveryOptionsMissing) {
          if (!hasErrorGroup) {
            this.dispatchUpdateErrorAsync({
              groupId,
              type,
              exception: new Error(CheckoutError.NO_DELIVERY_METHODS)
            });
          }
        } else if (hasErrorGroup) {
          this.dispatchUpdateErrorAsync({
            groupId
          });
        }
      }
      if (optionsChanged) {
        this._availableDeliveryMethods = availableDeliveryMethods;
        ekgElapsedTime('method');
        ekgPublishLogs();
      }
      const summarizable = !!this._deliveryGroup?.selectedDeliveryMethod?.id;
      const uneditable = availableDeliveryMethods.length === 1;
      if (summarizable !== this._showSummary) {
        this.dispatchRequestAspect({
          summarizable,
          uneditable
        });
      }
    }
  }
  setAspect(newAspect) {
    this._readOnlyIfValid = newAspect.readOnlyIfValid;
    this._showSummary = newAspect.summary;
  }
  stageAction(checkoutStage) {
    switch (checkoutStage) {
      case CheckoutStage.CHECK_VALIDITY_UPDATE:
        return Promise.resolve(this.checkValidity());
      case CheckoutStage.REPORT_VALIDITY_SAVE:
        return Promise.resolve(this.reportValidity());
      case CheckoutStage.BEFORE_PAYMENT:
        return this.dispatchShippingOptionsDataEvent();
      default:
        return Promise.resolve(true);
    }
  }
  get cartId() {
    return this.checkoutDetails?.cartSummary?.cartId;
  }
  dispatchShippingOptionsDataEvent() {
    if (this.cartId) {
      dispatchDataEvent(this, createCheckoutShippingOptionsDataEvent(this.cartId));
    }
    return Promise.resolve(true);
  }
  get selectedDeliveryMethodId() {
    return this._deliveryGroup?.selectedDeliveryMethod?.id;
  }
  async handleShippingMethodChange(event) {
    event.stopPropagation();
    const selectedDeliveryMethodId = event.target.value;
    const id = this._deliveryGroup?.id;
    if (id && this.checkValidity()) {
      await this.dispatchUpdateAsync({
        deliveryGroups: {
          items: [{
            id,
            selectedDeliveryMethodId
          }]
        }
      });
      this.dispatchCommit();
    }
  }
  getFormElement() {
    return this.querySelector('.slds-form-element');
  }
  getFirstInputElement() {
    return this.querySelector('input');
  }
  checkValidity() {
    return !this._showStencil && (!this._showEdit || (this.getFirstInputElement()?.checkValidity() ?? false));
  }
  reportValidity() {
    const valid = !this._showStencil && (!this._showEdit || (this.getFirstInputElement()?.reportValidity() ?? false));
    this.getFormElement()?.classList.toggle('slds-has-error', !valid);
    this._helpMessage = valid ? undefined : this.labels.labelRequired;
    return valid;
  }
  get deliveryMethodAssistiveText() {
    let assistiveText = '';
    if (this._showEdit && this.transformedSelectedOption && this.labels.deliveryMethodsAssistiveTextLabel) {
      assistiveText = this.labels.deliveryMethodsAssistiveTextLabel.replace('{deliveryOptions}', this.transformedOptions.map(opt => this.generateDeliveryOptionText(opt)).join(', ')).replace('{selectedOption}', this.generateDeliveryOptionText(this.transformedSelectedOption));
    }
    return assistiveText;
  }
  generateDeliveryOptionText(option) {
    return option?.label + ' ' + currencyFormatter(option?.currencyIsoCode, option?.shippingFee);
  }
  get fieldSetClasses() {
    const themeVersion = getComputedStyle(document.documentElement).getPropertyValue('--com-c-theme-version');
    if (Number(themeVersion) >= 2 && this.showMultipleShipmentsUi) {
      return 'separators';
    }
    return '';
  }
}