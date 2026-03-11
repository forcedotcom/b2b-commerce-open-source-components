import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { EditAddressLabel, MakeDefaultAddressLabel, PhoneNumberLabel, saveAddressLabel, cancelActionLabel, NewAddressLabel } from './labels';
export let AddressModalMode = function (AddressModalMode) {
  AddressModalMode[AddressModalMode["CREATE"] = 0] = "CREATE";
  AddressModalMode[AddressModalMode["EDIT"] = 1] = "EDIT";
  return AddressModalMode;
}({});
export default class CheckoutAddressModal extends LightningModal {
  _showPersonName = true;
  @api
  isLoggedIn = false;
  @api
  rawInternationalizationData = {};
  @api
  rawInternationalizationDataPhone = {};
  supportedCountries = [];
  makeDefaultAddressLabel = MakeDefaultAddressLabel;
  phoneNumberLabel = PhoneNumberLabel;
  cancelActionLabel = cancelActionLabel;
  addressForForm = {};
  @api
  isFormValid = false;
  @api
  shipmentName;
  @api
  headingLabel;
  get _headingLabel() {
    return this.headingLabel || NewAddressLabel;
  }
  @api
  saveButtonLabel;
  get _saveButtonLabel() {
    return this.saveButtonLabel || saveAddressLabel;
  }
  get isSubmitButtonDisabled() {
    return !this.isFormValid;
  }
  @api
  defaultCountry = '';
  @api
  address = {};
  @api
  get headerLabel() {
    return this.mode === AddressModalMode.CREATE ? this._headingLabel : EditAddressLabel;
  }
  @api
  mode = AddressModalMode.CREATE;
  @api
  showCompanyName = false;
  @api
  showPhoneNumber = false;
  @api
  phoneNumberRequired = false;
  @api
  phoneNumberPlaceholderText;
  @api
  showAddressLookup = false;
  @api
  skipPhoneNumberValidationEnabled = false;
  @api
  handleSubmit() {
    const submitEvent = new CustomEvent('submit', {
      composed: true,
      bubbles: true,
      detail: {
        addressForForm: this.addressForForm,
        close: this.close.bind(this)
      }
    });
    this.dispatchEvent(submitEvent);
  }
  handleCancel() {
    this.close();
  }
  onAddressChanged(_event) {
    _event.stopPropagation();
    this.isFormValid = Boolean(_event.detail?.valid);
    this.addressForForm = _event.detail?.address;
  }
  connectedCallback() {
    this.addEventListener('addresschanged', this.onAddressChanged.bind(this));
  }
  disconnectedCallback() {
    this.removeEventListener('addresschanged', this.onAddressChanged.bind(this));
  }
}