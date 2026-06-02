import { LightningElement, wire, api } from 'lwc';
import { SessionContextAdapter } from 'commerce/contextApi';
import { effectiveAccount } from 'commerce/effectiveAccountApi';
import { navigate, CurrentPageReference, NavigationContext } from 'lightning/navigation';
import LABELS from './labels';
/**
 * @slot content
 */
export default class QuoteSummaryContentLayout extends LightningElement {
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
  HOME_PAGE_REF = {
    type: 'comm__namedPage',
    attributes: {
      name: 'Home'
    }
  };
  @api
  quoteSummaryDetails;
  @api
  errorComponentHeadingText;
  @api
  errorComponentSubHeadingText;
  @api
  errorComponentButtonText;
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
  get showContent() {
    return !this.showLoader && this.isAuthUser && !this.hasError;
  }
  get showError() {
    return this.isAuthUser && this.hasError;
  }
  get hasError() {
    return this.quoteSummaryDetails !== undefined && this.quoteSummaryDetails?.id === null || (this._errors || []).length > 0 || !!this.clientState?.hasErrors;
  }
  get isGuestUser() {
    return !!this.isSessionLoaded && !this.isUserLoggedIn;
  }
  get isAuthUser() {
    return !!this.isSessionLoaded && this.isUserLoggedIn;
  }
  updateEffectiveAccountContextFromPageRef() {
    const effectiveAccountId = this.pageRef?.state?.effectiveAccountId ?? null;
    if (effectiveAccountId && effectiveAccount.accountId !== effectiveAccountId) {
      effectiveAccount.update(effectiveAccountId, null);
    }
  }
  processError() {
    if (this.isGuestUser && this.navContext) {
      navigate(this.navContext, this.HOME_PAGE_REF);
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