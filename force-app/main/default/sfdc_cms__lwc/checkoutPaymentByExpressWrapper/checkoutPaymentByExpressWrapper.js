import { api, LightningElement, wire } from 'lwc';
import { checkoutLoadAsyncPoll } from 'commerce/checkoutCartApi';
import { getI18nCountries } from 'experience/internationalizationApi';
import { paymentByExpressLabels } from './labels';
import { ExpressMode } from 'site/checkoutPaymentByExpress';
export default class CheckoutPaymentByExpressWrapper extends LightningElement {
  static renderMode = 'light';
  @api
  paymentMethodSetId;
  @api
  isLoggedIn = false;
  @api
  cartSummary;
  @api
  useManualCapture = false;
  @api
  inventoryConfiguration;
  @api
  defaultCurrency;
  @api
  guestCheckoutEnabled = false;
  @api
  effectiveAccountId;
  @api
  webstoreId;
  @api
  expressMode = ExpressMode.DEFAULT;
  @api
  buttonSize = 'standard';
  _checkoutInformation;
  _rawInternationalizationData;
  _paymentByExpressLabels = paymentByExpressLabels;
  _maximumButtonCount = 1;
  @wire(getI18nCountries, {
    excludeCountryFilter: true
  })
  internationalizationHandler(response) {
    if (!response.loading && response.data) {
      this._rawInternationalizationData = JSON.parse(JSON.stringify(response.data));
    }
  }
  async handleExpressButtonClick(event) {
    const checkoutPaymentByExpressCmp = this.refs?.checkoutPaymentByExpress;
    const response = await checkoutLoadAsyncPoll();
    if (response && response.checkoutStatus === 200) {
      checkoutPaymentByExpressCmp.checkoutDetails = JSON.parse(JSON.stringify(response));
    }
  }
  disconnectedCallback() {
    // No unsubscribables to clean up in this implementation
  }
}