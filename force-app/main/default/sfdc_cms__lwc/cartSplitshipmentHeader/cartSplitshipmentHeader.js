import { LightningElement, wire } from 'lwc';
import { NavigationContext, navigate } from 'lightning/navigation';
import { createSplitShipmentSaveAction, createSplitShipmentMergeSaveAction, dispatchActionAsync } from 'commerce/actionApi';
import Toast from 'site/commonToast';
import { genericApiErrorMessage, emptyDefaultDeliveryGroupErrorMessage, shipToOneAddress, cancelMergeShipments, shipToOneAddressModalMessage, shipToOneAddressModalTitle } from './labels';
import ActionModal from 'site/commonModal';
/**
 * @slot splitShipmentTitle
 * @slot saveAndCheckoutButton
 * @slot shipToOneAddressButton
 */
export default class CartSplitshipmentHeader extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  _navigationContext;
  async handleSaveAndCheckout(event) {
    event.stopPropagation();
    try {
      await dispatchActionAsync(this, createSplitShipmentSaveAction());
      await this.navigateToCheckout();
    } catch (error) {
      const isDefaultDeliveryGroupError = error?.message.includes('DEFAULT_DELIVERY_GROUP_ERROR');
      const toast = {
        label: isDefaultDeliveryGroupError ? emptyDefaultDeliveryGroupErrorMessage : genericApiErrorMessage,
        variant: 'error'
      };
      Toast.show(toast, this);
    }
  }
  handleShipToOneAddress(event) {
    event.stopPropagation();
    ActionModal.open({
      label: shipToOneAddressModalTitle,
      size: 'small',
      message: shipToOneAddressModalMessage,
      secondaryActionLabel: cancelMergeShipments,
      primaryActionLabel: shipToOneAddress,
      onprimaryactionclick: async clickEvent => {
        clickEvent.preventDefault();
        await dispatchActionAsync(this, createSplitShipmentMergeSaveAction());
        await this.navigateToCheckout();
        clickEvent.detail.close();
      }
    });
  }
  navigateToCheckout() {
    this._navigationContext && navigate(this._navigationContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Current_Checkout'
      }
    });
  }
}