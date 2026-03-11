import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext, CurrentPageReference } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import { SessionContextAdapter } from 'commerce/contextApi';
import { defaultButtonLabel } from './labels';

/**
 * @slot errorMessageText
 */
export default class OrderConfirmationMessageError extends LightningElement {
  static renderMode = 'light';
  @api
  authUserButtonText;
  @api
  guestUserButtonText;
  _isLoggedIn = false;
  iconPath = `${basePath}/assets/icons/exclamation-outline.svg#exclamation-outline`;
  orderReferenceNumber;
  get buttonText() {
    return (this._isLoggedIn ? this.authUserButtonText : this.guestUserButtonText) || defaultButtonLabel;
  }
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (response.data) {
      this._isLoggedIn = response?.data?.isLoggedIn;
    }
  }
  @wire(NavigationContext)
  navContext;
  @wire(CurrentPageReference)
  getORNFromPageRef(currentPageReference) {
    if (currentPageReference) {
      this.orderReferenceNumber = currentPageReference?.state?.orderNumber;
    }
  }
  navigateToOrderLookupPage() {
    if (this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Order_Lookup'
        },
        state: {
          orderNumber: this.orderReferenceNumber
        }
      });
    }
  }
  navigateToOrderHistoryPage() {
    if (this.navContext) {
      navigate(this.navContext, {
        type: 'standard__objectPage',
        attributes: {
          objectApiName: 'OrderSummary',
          actionName: 'list'
        },
        state: {
          filterName: 'Default'
        }
      });
    }
  }
  handleOnClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this._isLoggedIn) {
      this.navigateToOrderHistoryPage();
    } else {
      this.navigateToOrderLookupPage();
    }
  }
}