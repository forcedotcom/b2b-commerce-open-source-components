import { LightningElement, api } from 'lwc';
import { addPaymentMethodHeader, billingAddressSubHeader, paymentMethodSubHeader, CancelLabel, saveLabel } from './labels';
import { buildFullName } from 'site/checkoutInternationalization';
export default class PaymentAddPaymentMethodsUi extends LightningElement {
  static renderMode = 'light';
  @api
  paymentMethodSet;
  @api
  userAccountId;
  @api
  sepaDebitMandate;
  @api
  preferLegacyForms;
  @api
  defaultCountry;
  @api
  rawInternationalizationData;
  @api
  get billingDetails() {
    return this._billingDetails;
  }
  set billingDetails(value) {
    this._billingDetails = value;
  }
  _billingDetails = {
    isDefault: false,
    address: {
      country: '',
      line1: '',
      name: ''
    }
  };
  get defaultaddress() {
    return this._billingDetails?.address;
  }
  _addPaymentMethodHeader = addPaymentMethodHeader;
  _billingAddressSubHeader = billingAddressSubHeader;
  _paymentMethodSubHeader = paymentMethodSubHeader;
  _cancelLabel = CancelLabel;
  _saveLabel = saveLabel;
  _disableSave = false;
  _readOnly = false;
  _showAllCountries = true;
  _showName = true;
  @api
  get disableSave() {
    return this._disableSave;
  }
  set disableSave(value) {
    this._disableSave = value;
  }
  handleSaveClick() {
    const paymentComponent = this.refs?.paymentSheet;
    if (paymentComponent && 'savePaymentMethod' in paymentComponent) {
      paymentComponent.savePaymentMethod?.();
    }
  }
  handleCancelClick() {
    this.dispatchEvent(new CustomEvent('spmredirectcancel', {
      bubbles: true
    }));
  }
  handleAddressChange(event) {
    this._disableSave = false;
    const billingAddress = event.target.address;
    const updatedAddress = {
      ...this._billingDetails.address,
      line1: billingAddress?.street || '',
      city: billingAddress?.city || '',
      country: billingAddress?.country || '',
      postalCode: billingAddress?.postalCode || '',
      state: billingAddress?.region || '',
      firstName: billingAddress?.firstName || '',
      lastName: billingAddress?.lastName || '',
      street: billingAddress?.street || '',
      region: billingAddress?.region || ''
    };
    this._billingDetails = {
      ...this._billingDetails,
      address: updatedAddress,
      name: buildFullName(billingAddress?.name, billingAddress?.firstName, billingAddress?.lastName, billingAddress?.country)
    };
  }
  handleAddressDirty() {
    this._disableSave = true;
  }
}