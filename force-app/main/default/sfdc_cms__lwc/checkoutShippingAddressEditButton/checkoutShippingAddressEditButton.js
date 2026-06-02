import { LightningElement, api, wire } from 'lwc';
import { NavigationContext, navigate } from 'lightning/navigation';
import { AppContextAdapter } from 'commerce/contextApi';
/**
 * @slot edit
 */
export default class CheckoutShippingAddressEditButton extends LightningElement {
  static renderMode = 'light';
  _splitShipEnabled = false;
  @api
  checkoutDetails;
  @wire(NavigationContext)
  navContext;
  @wire(AppContextAdapter)
  appContextHandler(response) {
    if (!response.loading) {
      this._splitShipEnabled = !!response?.data?.splitShipmentEnabled;
    }
  }
  handleEdit(event) {
    if (this._splitShipEnabled && Number(this.checkoutDetails?.deliveryGroups?.items.length) > 1) {
      event.stopPropagation();
      this.navContext && navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Split_Shipment'
        }
      });
    }
  }
}