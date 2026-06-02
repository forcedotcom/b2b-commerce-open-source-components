import LightningModal from 'lightning/modal';
import { api } from 'lwc';
import { labels } from './labels';
import { ITEM_TYPES } from 'site/cartItemDropdown';
export default class CheckoutNewshipmentModal extends LightningModal {
  selectedAddress = {};
  itemType = ITEM_TYPES.DELIVERY_ADDRESS;
  @api
  shipmentName;
  @api
  addresses;
  @api
  selectedAddressId;
  @api
  rawInternationalizationData;
  get labels() {
    return labels;
  }
  handleCancel() {
    this.close();
  }
  handleSubmit() {
    const submitEvent = new CustomEvent('submit', {
      composed: true,
      bubbles: true,
      detail: {
        selectedAddress: this.selectedAddress,
        close: this.close.bind(this)
      }
    });
    this.dispatchEvent(submitEvent);
  }
  handleValueChanged(event) {
    const selectedAddressId = event.detail.deliveryGroupId;
    const selectedAddress = this.addresses?.find(adr => adr.addressId === selectedAddressId);
    if (selectedAddress) {
      this.selectedAddress = selectedAddress;
      this.selectedAddressId = this.selectedAddress.addressId;
    }
  }
  openAddressModal(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('openaddressmodal'));
    this.close();
  }
}