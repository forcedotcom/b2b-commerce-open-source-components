import { LightningElement, api } from 'lwc';
import { labels } from './labels';
import { formatAddressSingleLine } from 'site/checkoutAddresses';
import { buildFullName } from 'site/checkoutInternationalization';
import addressSingleLineBreak from '@salesforce/label/site.cartItemDropdown.addressSingleLineBreak';
import BasePath from '@salesforce/community/basePath';
const KEY = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ENTER: 'Enter'
};
export let ITEM_TYPES = function (ITEM_TYPES) {
  ITEM_TYPES[ITEM_TYPES["DELIVERY_GROUP"] = 0] = "DELIVERY_GROUP";
  ITEM_TYPES[ITEM_TYPES["DELIVERY_ADDRESS"] = 1] = "DELIVERY_ADDRESS";
  return ITEM_TYPES;
}({});
const VALUE_CHANGED_EVENT = 'valuechange';
export default class CartItemDropdown extends LightningElement {
  static renderMode = 'light';
  _comboboxClassList = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
  _dropDownOpen = false;
  _selectedItemId;
  _actionButtonSelected = false;
  @api
  itemType;
  @api
  showDropdownLabel = false;
  @api
  cartItemId;
  @api
  rawInternationalizationData;
  @api
  itemList;
  @api
  get selectedItemId() {
    let defaultId;
    if (this.itemType === ITEM_TYPES.DELIVERY_GROUP) {
      defaultId = this.itemList?.find(item => item.isDefault)?.id;
    }
    return this._selectedItemId || defaultId;
  }
  set selectedItemId(val) {
    this._selectedItemId = val;
  }
  get isDeliveryGroupType() {
    return this.itemType === ITEM_TYPES.DELIVERY_GROUP;
  }
  get isDeliveryAddressType() {
    return this.itemType === ITEM_TYPES.DELIVERY_ADDRESS;
  }
  get dropdownLabel() {
    if (this.itemType === ITEM_TYPES.DELIVERY_GROUP) {
      return this.labels.deliveryGroupSelectorLabel;
    }
    if (this.itemType === ITEM_TYPES.DELIVERY_ADDRESS) {
      return this.labels.deliveryAddressSelectorLabel;
    }
    return '';
  }
  get actionButtonLabel() {
    if (this.itemType === ITEM_TYPES.DELIVERY_GROUP) {
      return this.labels.newShipmentButtonText;
    }
    if (this.itemType === ITEM_TYPES.DELIVERY_ADDRESS) {
      return this.labels.createNewAddressLabel;
    }
    return '';
  }
  get actionOptionClassList() {
    const listBoxClassList = 'slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-listbox__option_has-meta';
    return this._actionButtonSelected ? `${listBoxClassList} slds-is-selected slds-has-focus` : listBoxClassList;
  }
  get labels() {
    return labels;
  }
  get _deliveryGroupDataLoading() {
    return this.itemList === undefined;
  }
  get dropDownDisplayValue() {
    if (this._actionButtonSelected) {
      return this.actionButtonLabel;
    }
    if (this.itemType === ITEM_TYPES.DELIVERY_GROUP) {
      const selectedDeliveryGroup = this.itemList?.find(item => item.id === this.selectedItemId);
      const deliveryGroupName = selectedDeliveryGroup?.name || '';
      const recipientName = buildFullName(selectedDeliveryGroup?.deliveryAddress?.name, selectedDeliveryGroup?.deliveryAddress?.firstName, selectedDeliveryGroup?.deliveryAddress?.lastName, selectedDeliveryGroup?.deliveryAddress?.country);
      const address = formatAddressSingleLine(selectedDeliveryGroup?.deliveryAddress, this.rawInternationalizationData);
      const isDisplayValueAvailable = !!deliveryGroupName && !!recipientName && !!address;
      const displayValue = isDisplayValueAvailable ? this.labels.dropdownDisplayValue.replace('{0}', deliveryGroupName).replace('{1}', recipientName).replace('{2}', address) : this.labels.deliveryGroupDataLoading;
      return displayValue;
    }
    if (this.itemType === ITEM_TYPES.DELIVERY_ADDRESS) {
      const selectedDeliveryAddress = this.itemList?.find(item => item.addressId === this.selectedItemId);
      if (!selectedDeliveryAddress) {
        return this.labels.defaultDropdownTextForShipmentModal;
      }
      const {
        name,
        firstName,
        lastName,
        country
      } = selectedDeliveryAddress;
      const recipientName = buildFullName(name, firstName, lastName, country);
      const singleLineAddress = formatAddressSingleLine(selectedDeliveryAddress, this.rawInternationalizationData);
      return `${recipientName}${addressSingleLineBreak}${singleLineAddress}`;
    }
    return '';
  }
  get itemOptions() {
    let options = [];
    const listBoxClassList = 'slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-listbox__option_has-meta';
    if (!this.itemList) {
      return options;
    }
    if (this.itemType === ITEM_TYPES.DELIVERY_GROUP) {
      options = this.itemList?.map(deliveryGroup => {
        const recipientName = buildFullName(deliveryGroup?.deliveryAddress?.name, deliveryGroup?.deliveryAddress?.firstName, deliveryGroup?.deliveryAddress?.lastName, deliveryGroup?.deliveryAddress?.country);
        const singleLineAddress = formatAddressSingleLine(deliveryGroup?.deliveryAddress, this.rawInternationalizationData);
        return {
          label: deliveryGroup.name,
          value: deliveryGroup.id,
          recipient: recipientName,
          address: singleLineAddress,
          selected: this.isItemOptionSelected(deliveryGroup.id),
          classList: this.isItemOptionSelected(deliveryGroup.id) ? `${listBoxClassList} slds-is-selected slds-has-focus` : listBoxClassList
        };
      });
    } else if (this.itemType === ITEM_TYPES.DELIVERY_ADDRESS) {
      options = this.itemList?.map(address => {
        const {
          name,
          firstName,
          lastName,
          country,
          addressId
        } = address;
        const recipientName = buildFullName(name, firstName, lastName, country);
        const singleLineAddress = formatAddressSingleLine(address, this.rawInternationalizationData);
        const fullNameAddress = `${recipientName}${addressSingleLineBreak}${singleLineAddress}`;
        return {
          value: addressId,
          recipientNameAndAddress: fullNameAddress,
          selected: this.isItemOptionSelected(addressId),
          classList: this.isItemOptionSelected(addressId) ? `${listBoxClassList} slds-is-selected slds-has-focus` : listBoxClassList
        };
      });
    }
    return options;
  }
  get comboboxClassList() {
    return this._dropDownOpen ? `${this._comboboxClassList} slds-is-open` : this._comboboxClassList;
  }
  get dropdownLabelClassList() {
    return this.showDropdownLabel ? 'dropdown-label' : 'slds-assistive-text';
  }
  isItemOptionSelected(optionId) {
    return !this._actionButtonSelected && optionId === this.selectedItemId;
  }
  toggleDropdown() {
    this._dropDownOpen = !this._dropDownOpen;
  }
  handleBlur() {
    this._dropDownOpen = false;
    this._actionButtonSelected = false;
  }
  handleKeyDown(event) {
    if (this._dropDownOpen) {
      let index = this.itemOptions.findIndex(option => option.selected) || 0;
      const length = this.itemOptions.length + 1;
      if (index === -1) {
        index = length - 1;
      }
      switch (event.key) {
        case KEY.ARROW_DOWN:
          event.preventDefault();
          index = (index + 1) % length;
          break;
        case KEY.ARROW_UP:
          event.preventDefault();
          index = index > 0 ? (index - 1) % length : length - 1;
          break;
        case KEY.ENTER:
          event.preventDefault();
          if (this._actionButtonSelected) {
            this.handleActionButton(event);
          }
          this.toggleDropdown();
          break;
        default:
          return;
      }
      if (index === length - 1) {
        this._actionButtonSelected = true;
      } else {
        this._actionButtonSelected = false;
        this._selectedItemId = this.itemOptions[index].value;
        this.handleValueChange(event);
      }
    }
  }
  handleValueChange(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent(VALUE_CHANGED_EVENT, {
      detail: {
        deliveryGroupId: this.selectedItemId
      },
      bubbles: true
    }));
  }
  selectOption(event) {
    this._selectedItemId = event.currentTarget.dataset.value;
    this.handleValueChange(event);
  }
  get chevronDownIconPath() {
    return `${BasePath}/assets/icons/chevron-down.svg#chevron-down`;
  }
  handleActionButton = e => {
    e.stopPropagation();
    this._actionButtonSelected = false;
    if (this.itemType === ITEM_TYPES.DELIVERY_GROUP) {
      this.dispatchEvent(new CustomEvent('opennewshipmentmodal', {
        detail: {
          cartItemId: this.cartItemId
        },
        bubbles: true,
        composed: true
      }));
    } else if (this.itemType === ITEM_TYPES.DELIVERY_ADDRESS) {
      this.dispatchEvent(new CustomEvent('openaddressmodal', {
        bubbles: true,
        composed: true
      }));
    }
  };
  preventScrollBarClickClose(e) {
    e.preventDefault();
  }
}