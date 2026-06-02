import { LightningElement, wire, api } from 'lwc';
import { SessionContextAdapter } from 'commerce/contextApi';
import { effectiveAccount } from 'commerce/effectiveAccountApi';
import { navigate, CurrentPageReference, NavigationContext } from 'lightning/navigation';
import LABELS from './labels';
const ORDER_LOOKUP_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Order_Lookup'
  }
};
/**
 * @slot content
 */
export default class OrderSummaryContentlayout extends LightningElement {
  static renderMode = 'light';
  isUserLoggedIn = false;
  pageRef;
  isSessionLoaded = false;
  get labels() {
    return LABELS;
  }
  _clientState;
  @api
  get clientState() {
    return this._clientState;
  }
  set clientState(clientState) {
    this._clientState = clientState;
    this.processError();
  }
  @api
  errorComponentHeadingText;
  @api
  errorComponentSubHeadingText;
  @api
  errorComponentButtonText;
  @api
  orderSummaryDetails;
  _errors;
  @api
  get errors() {
    return this._errors;
  }
  set errors(value) {
    this._errors = value;
    this.processError();
  }
  get showLoader() {
    return this.clientState !== undefined && !!this.clientState?.isLoading || !this.isSessionLoaded;
  }
  get showError() {
    return this.isAuthUser && this.hasError;
  }
  get hasError() {
    return this.orderSummaryDetails !== undefined && this.orderSummaryDetails?.id === null || (this._errors || []).length > 0;
  }
  get showContent() {
    return !this.showLoader && !this.hasError;
  }
  get isGuestUser() {
    return !!this.isSessionLoaded && !this.isUserLoggedIn;
  }
  get isAuthUser() {
    return !!this.isSessionLoaded && this.isUserLoggedIn;
  }
  updateEffectiveAccountContextFromPageRef() {
    const effectiveAccountId = this.pageRef?.state?.effectiveAccountId;
    if (effectiveAccountId && effectiveAccount.accountId !== effectiveAccountId) {
      effectiveAccount.update(effectiveAccountId, null);
    }
  }
  processError() {
    if (this.isGuestUser && this.hasError && this.navContext) {
      navigate(this.navContext, {
        ...ORDER_LOOKUP_PAGE_REF,
        state: {
          orderNumber: this.pageRef?.attributes?.recordId
        }
      });
    }
  }
  navContext;
  @wire(NavigationContext)
  navigationContextHandler(navContext) {
    this.navContext = navContext;
    this.processError();
  }
  @wire(CurrentPageReference)
  getCurrentPageReference(pageRef) {
    this.pageRef = pageRef;
    if (this.isUserLoggedIn) {
      this.updateEffectiveAccountContextFromPageRef();
    }
  }
  @wire(SessionContextAdapter)
  getUserContext({
    data
  }) {
    if (!data) {
      return;
    }
    this.isUserLoggedIn = data.isLoggedIn;
    if (this.isUserLoggedIn) {
      this.updateEffectiveAccountContextFromPageRef();
    }
    this.isSessionLoaded = true;
    this.processError();
  }
}