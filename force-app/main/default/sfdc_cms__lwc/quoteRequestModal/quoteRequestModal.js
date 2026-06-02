import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { defaultRules } from 'site/commonQuantitySelector';
export default class QuoteRequestModal extends LightningModal {
  additionalFieldsWithValues;
  @api
  showTitle = false;
  @api
  titleText;
  @api
  showQuoteRequiredByDate = false;
  @api
  quoteRequiredByDateLabel;
  @api
  isRequiredQuoteRequiredByDate = false;
  @api
  showDescription = false;
  @api
  descriptionLabel;
  @api
  isRequiredDescription = false;
  @api
  showInfotext = false;
  @api
  infoText;
  @api
  cancelButtonLabel;
  @api
  sendRequestButtonLabel;
  @api
  cancelButtonSize;
  @api
  sendRequestButtonSize;
  @api
  set additionalFields(additionalFields) {
    this.additionalFieldsWithValues = additionalFields;
  }
  get additionalFields() {
    return this?.additionalFieldsWithValues || [];
  }
  @api
  showQuantitySelector = false;
  @api
  quantityLabel;
  _initialQuantity;
  @api
  get initialQuantity() {
    return this._initialQuantity ?? this.quantityMinimum ?? defaultRules.minimum;
  }
  requiredByDate;
  set initialQuantity(value) {
    const n = value != null ? Number(value) : 1;
    this._initialQuantity = Number.isFinite(n) && n > 0 ? n : this.quantityMinimum ?? defaultRules.minimum;
    this.quantity = this.initialQuantity;
  }
  @api
  quantityMinimum;
  @api
  quantityMaximum;
  @api
  quantityIncrement;
  @api
  get quantityRuleMinimum() {
    return this.quantityMinimum ?? defaultRules.minimum;
  }
  @api
  get quantityRuleMaximum() {
    return this.quantityMaximum ?? defaultRules.maximum;
  }
  @api
  get quantityRuleIncrement() {
    return this.quantityIncrement ?? defaultRules.step;
  }
  description;
  quantity;
  _isQuantityValid = true;
  currentDate = new Date().toISOString().split('T')[0];
  _isSubmitting = false;
  get isSubmitting() {
    return this._isSubmitting;
  }
  get isNotSubmitting() {
    return !this._isSubmitting;
  }
  get isSendButtonDisabled() {
    if (this._isSubmitting) {
      return true;
    }
    if (!this.validateRequiredFields()) {
      return true;
    }
    return false;
  }
  connectedCallback() {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    this.requiredByDate = futureDate.toISOString().split('T')[0];
    this.quantity = this.initialQuantity;
  }
  handleDateChange(event) {
    const target = event.target;
    this.requiredByDate = target.value;
  }
  handleDescriptionChange(event) {
    const target = event.target;
    this.description = target.value;
  }
  handleCustomFieldChange(event) {
    const target = event.target;
    const values = this.additionalFieldsWithValues?.map(field => {
      if (field.name === target.name) {
        return {
          ...field,
          value: target.value
        };
      }
      return field;
    });
    this.additionalFieldsWithValues = values;
  }
  handleQuantityChange(event) {
    const detail = event?.detail;
    const raw = detail?.value ?? detail?.lastValue ?? this.quantityRuleMinimum;
    const value = Number(raw);
    this.quantity = Number.isFinite(value) ? value : this.quantityRuleMinimum;
  }
  handleQuantityValidityChange(event) {
    const detail = event?.detail;
    this._isQuantityValid = detail?.isValid ?? true;
  }
  handleAcceptClick() {
    if (!this.validateRequiredFields()) {
      return;
    }
    this._isSubmitting = true;
    const detail = {
      requiredByDate: this.requiredByDate,
      description: this.description?.trim(),
      additionalFields: this.additionalFieldsWithValues,
      close: this.close.bind(this)
    };
    if (this.showQuantitySelector) {
      detail.quantity = this.quantity;
    }
    this.dispatchEvent(new CustomEvent('submit', {
      detail,
      bubbles: true,
      composed: true
    }));
  }
  handleCloseClick() {
    this.close({
      success: false,
      cancelled: true
    });
  }
  validateRequiredFields() {
    if (this.showQuantitySelector) {
      if (!this._isQuantityValid || typeof this.quantity !== 'number' || !Number.isFinite(this.quantity)) {
        return false;
      }
    }
    if (this.isRequiredQuoteRequiredByDate && !this.requiredByDate) {
      return false;
    }
    if (this.requiredByDate && new Date(this.requiredByDate) < new Date(this.currentDate)) {
      return false;
    }
    if (this.isRequiredDescription && !this.description?.trim()) {
      return false;
    }
    if (this.additionalFieldsWithValues?.some(field => field.required && !field.value.trim())) {
      return false;
    }
    return true;
  }
}