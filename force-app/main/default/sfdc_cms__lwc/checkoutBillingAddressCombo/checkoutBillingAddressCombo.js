import { api, LightningElement } from 'lwc';
import { formatAddressSingleLine } from 'site/checkoutAddresses';
export default class CheckoutBillingAddressCombo extends LightningElement {
  static renderMode = 'light';
  @api
  rawInternationalizationData;
  @api
  deliveryGroupAddresses;
  @api
  selectedAddress;
  @api
  a11yBillingAddressLabel;
  get _value() {
    let result;
    if (this.selectedAddress) {
      const label = formatAddressSingleLine(this.selectedAddress, this.rawInternationalizationData);
      result = this._options.find(opt => opt.label === label)?.value;
    } else if (this.deliveryGroupAddresses?.length) {
      result = '0';
    }
    return result;
  }
  _handleChange(event) {
    event.stopPropagation();
    const selectedAddress = this.deliveryGroupAddresses?.[Number(event.detail.value)];
    this.dispatchEvent(new CustomEvent('changeaddressoption', {
      detail: {
        value: selectedAddress
      }
    }));
  }
  get _options() {
    if (!this.deliveryGroupAddresses) {
      return [];
    }
    return this.deliveryGroupAddresses.map((itm, index) => ({
      label: formatAddressSingleLine(itm, this.rawInternationalizationData),
      value: index.toString()
    })).reduce((acc, opt) => {
      if (!acc.find(accOpt => accOpt.label === opt.label)) {
        acc.push(opt);
      }
      return acc;
    }, []);
  }
}