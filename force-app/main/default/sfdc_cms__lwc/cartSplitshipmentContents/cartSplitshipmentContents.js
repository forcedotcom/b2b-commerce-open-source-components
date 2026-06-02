import { LightningElement, api, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import { getI18nCountries } from 'experience/internationalizationApi';
import { generateStyleProperties, generateTextFontSize } from 'experience/styling';
import NewShipmentModal from 'site/checkoutNewshipmentModal';
import { getFormFactor, FORM_FACTOR_LARGE } from 'experience/clientApi';
import AddressModal from 'site/checkoutAddressModal';
import { SessionContextAdapter } from 'commerce/contextApi';
import { createSplitShipmentAddressesCreateAction, createSplitShipmentCartItemDeleteAction, createSplitShipmentCartItemMoveAction, createSplitShipmentCartItemQuantityUpdateAction, createSplitShipmentCartItemSplitAction, createSplitShipmentDeliveryGroupAddAction, createSplitShipmentPageLoadAction, dispatchAction, dispatchActionAsync } from 'commerce/actionApi';
import { isSameDeliveryAddress } from 'site/checkoutAddresses';
import { generateDeliveryGroupName } from './utils';
import { addressModalDescriptionLabel, shipmentModalDescriptionLabel, genericApiErrorMessage, splitShipAddressModalHeading, saveNewShipmentLabel } from './labels';
import Toast from 'site/commonToast';
import EmptyShipmentModal from 'site/checkoutEmptyshipmentModal';
import { NavigationContext, navigate } from 'lightning/navigation';
export const OPEN_ADDRESS_MODAL_EVENT = 'openaddressmodal';
export const OPEN_NEW_SHIPMENT_MODAL_EVENT = 'opennewshipmentmodal';
export default class CartSplitshipmentContents extends LightningElement {
  static renderMode = 'light';
  _rawInternationalizationData;
  _rawInternationalizationDataPhone;
  _defaultCurrencyIsoCode;
  _defaultCountry;
  _deliveryGroupName;
  _supportedCountries;
  @wire(AppContextAdapter)
  getAppContext({
    data
  }) {
    this._defaultCurrencyIsoCode = data?.defaultCurrency;
    this._supportedCountries = data?.shippingCountries;
    this._defaultCountry = data?.country || data?.shippingCountries?.[0] || '';
  }
  @wire(NavigationContext)
  _navigationContext;
  get _currencyIsoCode() {
    const cartCurrency = this.products?.[0].currencyIsoCode;
    return cartCurrency || this._defaultCurrencyIsoCode;
  }
  @wire(getI18nCountries, {
    excludeCountryFilter: true
  })
  internationalizationHandler(response) {
    if (!response.loading && this._supportedCountries !== undefined) {
      this._rawInternationalizationDataPhone = response.data;
      this._rawInternationalizationData = {
        addressCountries: response.data?.addressCountries?.filter(country => this._supportedCountries?.includes(country.isoCode))
      };
    }
  }
  @api
  deliveryGroups;
  @api
  addresses;
  get dedupedAddresses() {
    let uniqueAddresses = [];
    if (this._sessionContext?.isLoggedIn) {
      uniqueAddresses = this.addresses || [];
    } else {
      this.deliveryGroups?.forEach(deliveryGroup => {
        let isUniqueAddress = true;
        let {
          deliveryAddress
        } = deliveryGroup;
        deliveryAddress = {
          ...deliveryAddress,
          addressId: deliveryGroup.id
        };
        uniqueAddresses.forEach(address => {
          if (isSameDeliveryAddress(address, deliveryAddress)) {
            isUniqueAddress = false;
          }
        });
        if (isUniqueAddress && deliveryAddress) {
          uniqueAddresses.push(deliveryAddress);
        }
      });
    }
    return uniqueAddresses;
  }
  @api
  products;
  @api
  splitShipPagination;
  _deliveryGroupCartProps;
  @api
  deliveryGroupCartProps;
  @api
  showSku = false;
  @api
  skuLabel;
  @api
  showProductImage = false;
  @api
  imageAspectRatio;
  @api
  imageSize;
  @api
  showProductVariants = false;
  @api
  priceTextColor;
  @api
  priceTextSize;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  @api
  showPhoneNumber = false;
  @api
  phoneNumberRequired = false;
  get itemsStyles() {
    return generateStyleProperties([{
      name: '--com-c-cart-item-unit-price-font-color',
      value: this.priceTextColor
    }, {
      name: '--com-c-cart-item-unit-price-font-size',
      value: generateTextFontSize(this.priceTextSize)
    }, {
      name: '--com-c-split-shipment-item-image-aspect-ratio',
      value: this.imageAspectRatio && parseFloat(this.imageAspectRatio) || 1
    }, {
      name: '--com-c-split-shipment-item-image-object-fit',
      value: this.imageSize || 'contain'
    }]);
  }
  @wire(getFormFactor)
  formFactor;
  _sessionContext;
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (!response.loading) {
      this._sessionContext = response.data;
    }
  }
  cartItemId;
  async createDeliveryGroup(address, deliveryGroupName, cartItemId) {
    if (this._sessionContext?.isLoggedIn && !address.addressId) {
      address = await dispatchActionAsync(this, createSplitShipmentAddressesCreateAction({
        ...address,
        addressType: 'Shipping'
      }));
    }
    const deliveryGroup = await dispatchActionAsync(this, createSplitShipmentDeliveryGroupAddAction(address, deliveryGroupName));
    if (cartItemId) {
      await this.handleChangeDeliveryGroup(new CustomEvent('changedeliverygroup', {
        detail: {
          cartItemId,
          deliveryGroupId: deliveryGroup.id
        }
      }));
    }
  }
  toastErrorMessage(errorMessage) {
    const toast = {
      label: errorMessage,
      variant: 'error'
    };
    Toast.show(toast, this);
  }
  get modalSize() {
    return this.formFactor === FORM_FACTOR_LARGE ? 'small' : 'full';
  }
  handleCreateDeliveryGroupError = error => {
    if (error instanceof Error && error.name === 'FetchError' && 'errors' in error && Array.isArray(error.errors)) {
      const message = error.errors?.[0]?.message;
      this.toastErrorMessage(message);
    } else {
      this.toastErrorMessage(genericApiErrorMessage);
    }
  };
  openNewShipmentModal = event => {
    event.stopPropagation();
    this.cartItemId = event.detail?.cartItemId;
    this._deliveryGroupName = generateDeliveryGroupName(this.deliveryGroups);
    NewShipmentModal.open({
      size: this.modalSize,
      description: shipmentModalDescriptionLabel,
      addresses: this.dedupedAddresses,
      selectedAddressId: '',
      shipmentName: this._deliveryGroupName,
      rawInternationalizationData: this._rawInternationalizationData,
      onsubmit: async e => {
        try {
          const {
            selectedAddress,
            close
          } = e.detail;
          const {
            addressId,
            ...rest
          } = selectedAddress;
          let addressForForm = rest;
          if (this._sessionContext?.isLoggedIn) {
            addressForForm = {
              addressId,
              ...addressForForm
            };
          }
          await this.createDeliveryGroup(addressForForm, this._deliveryGroupName, this.cartItemId);
          close();
          this.cartItemId = undefined;
          this._deliveryGroupName = undefined;
        } catch (error) {
          this.handleCreateDeliveryGroupError(error);
        }
      },
      onopenaddressmodal: e => {
        e.stopPropagation();
        this.openAddressModal(e);
      }
    });
  };
  openAddressModal = event => {
    event.stopPropagation();
    AddressModal.open({
      size: this.modalSize,
      description: addressModalDescriptionLabel,
      address: {
        street: '',
        isDefault: false
      },
      showPhoneNumber: this.showPhoneNumber,
      phoneNumberRequired: this.phoneNumberRequired,
      rawInternationalizationData: this._rawInternationalizationData,
      rawInternationalizationDataPhone: this._rawInternationalizationDataPhone,
      isLoggedIn: this._sessionContext?.isLoggedIn,
      supportedCountries: this._supportedCountries,
      showAddressLookup: true,
      defaultCountry: this._defaultCountry,
      shipmentName: this._deliveryGroupName,
      headingLabel: splitShipAddressModalHeading,
      saveButtonLabel: saveNewShipmentLabel,
      onsubmit: async e => {
        try {
          const {
            addressForForm,
            close
          } = e.detail;
          await this.createDeliveryGroup(addressForForm, this._deliveryGroupName, this.cartItemId);
          close();
          this.cartItemId = undefined;
          this._deliveryGroupName = undefined;
        } catch (error) {
          this.handleCreateDeliveryGroupError(error);
        }
      }
    });
  };
  handleChangeDeliveryGroup(event) {
    event.stopPropagation();
    const {
      cartItemId,
      deliveryGroupId
    } = event.detail;
    dispatchAction(this, createSplitShipmentCartItemMoveAction(cartItemId, deliveryGroupId));
  }
  handleChangeQty(event) {
    event.stopPropagation();
    const {
      cartItemId,
      quantity
    } = event.detail;
    dispatchAction(this, createSplitShipmentCartItemQuantityUpdateAction(cartItemId, quantity));
  }
  handleDeleteCartItem(event) {
    event.stopPropagation();
    this.cartItemId = event.detail.cartItemId;
    let _totalItemCount = 0;
    this.products?.forEach(product => {
      if (product.cartItems) {
        _totalItemCount += product.cartItems.length;
      }
    });
    if (_totalItemCount === 1) {
      EmptyShipmentModal.open({
        size: this.modalSize,
        cartItemId: this.cartItemId,
        onsubmit: e => {
          const {
            cartItemId,
            close
          } = e.detail;
          dispatchAction(this, createSplitShipmentCartItemDeleteAction(cartItemId));
          this.navigateToCartPage();
          close();
          this.cartItemId = undefined;
        }
      });
    } else {
      dispatchAction(this, createSplitShipmentCartItemDeleteAction(this.cartItemId));
    }
  }
  navigateToCartPage() {
    this._navigationContext && navigate(this._navigationContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Current_Cart'
      }
    });
  }
  handleSplitShipGoToPage(event) {
    dispatchAction(this, createSplitShipmentPageLoadAction(event.detail.pageNumber, event.detail.pageSize));
  }
  handleSplitCartItem(event) {
    event.stopPropagation();
    const {
      cartItemId,
      productId,
      deliveryGroupId
    } = event.detail;
    dispatchAction(this, createSplitShipmentCartItemSplitAction(cartItemId, productId, deliveryGroupId));
  }
}