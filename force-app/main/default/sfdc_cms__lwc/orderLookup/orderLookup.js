import { LightningElement, api, wire } from 'lwc';
import { SessionContextAdapter } from 'commerce/contextApi';
import { navigate, CurrentPageReference, NavigationContext } from 'lightning/navigation';
import { authorizeOrderSummaryAccess } from 'commerce/orderApi';
function splitStringToObj(delimiter1, delimiter2, str) {
  const result = {};
  if (!str) {
    return result;
  }
  const pairs = str.split(delimiter1).filter(s => s.trim());
  for (const pair of pairs) {
    const [key, value] = pair.split(delimiter2);
    if (key && value) {
      result[key.trim()] = value.trim();
    }
  }
  return result;
}
function propertySet(properties) {
  return {
    toString() {
      return Object.entries(properties).map(([key, value]) => {
        const displayValue = value === undefined || value === null || value === '' ? 'initial' : value;
        return `${key}: ${displayValue};`;
      }).join(' ');
    }
  };
}

/**
 * @slot actions
 */
export default class OrderLookup extends LightningElement {
  static renderMode = 'light';
  _hasRendered = false;
  _isLoggedIn = false;
  orderLookupElem;
  errorMessage;
  email;
  lastName;
  orderNumber;
  phoneNumber;
  @api
  emailFieldLabel;
  @api
  inputFieldBorderColor;
  @api
  hideLastName = false;
  @api
  lastNameFieldLabel;
  @api
  orderNumberFieldLabel;
  @api
  orderNumberFieldTooltip;
  @api
  phoneNumberFieldLabel;
  @api
  validationFailureMessage;
  @api
  width = 25;
  get verificationDetailsRequired() {
    return !this._isLoggedIn;
  }
  navigateToOrderDetailsPage(recordId, accessToken) {
    navigate(this.navContext, {
      type: 'standard__recordPage',
      attributes: {
        actionName: 'view',
        objectApiName: 'OrderSummary',
        recordId: recordId
      },
      state: {
        accessToken: accessToken
      }
    });
  }
  @wire(NavigationContext)
  navContext;
  @wire(CurrentPageReference)
  getOrderNumbeFromPageRef(pageRef) {
    this.orderNumber = pageRef?.state?.orderNumber;
  }
  @wire(SessionContextAdapter)
  getUserContext({
    data
  }) {
    this._isLoggedIn = data?.isLoggedIn ?? false;
  }
  handleSubmit(event) {
    if (this._isLoggedIn) {
      this.navigateToOrderDetailsPage(event.detail.orderNumber);
    } else {
      this.errorMessage = '';
      this.orderLookupElem?.showLoader(true);
      const {
        orderNumber: orderSummaryIdOrRefNumber,
        email,
        lastName,
        phoneNumber
      } = event.detail;
      authorizeOrderSummaryAccess({
        orderSummaryRefNumber: orderSummaryIdOrRefNumber,
        email,
        lastName,
        phoneNumber
      }).then(({
        accessToken
      }) => {
        this.navigateToOrderDetailsPage(event.detail.orderNumber, encodeURIComponent(accessToken));
      }).catch(() => {
        this.errorMessage = this.validationFailureMessage;
        this.orderLookupElem?.showLoader(false);
      });
    }
  }
  renderedCallback() {
    if (!this._hasRendered) {
      this._hasRendered = true;
      let responsiveStyleString = this.getAttribute('style');
      if (responsiveStyleString) {
        responsiveStyleString = responsiveStyleString.split(';').map(s => s + '%').join(';');
      }
      const responsiveCSSPropertiesObj = splitStringToObj(';', ':', responsiveStyleString);
      const style = propertySet({
        ...responsiveCSSPropertiesObj,
        '--com-c-order-lookup-form-width': `${this.width}%`,
        '--com-c-order-lookup-form-element-border': this.inputFieldBorderColor
      }).toString();
      this.setAttribute('style', style);
    }
  }
}