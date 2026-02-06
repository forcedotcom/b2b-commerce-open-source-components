import { LightningElement, api, wire } from 'lwc';
import { hasBlanketConsent, needsBlanketConsent, setBlanketConsent } from 'commerce/consentApi';
import { isDesignMode } from 'experience/clientApi';
import BasePath from '@salesforce/community/basePath';
import { labels } from './labels';
import { CurrentPageReference } from 'lightning/navigation';

/**
 * @slot content
 */
export default class LegalConsentBlanket extends LightningElement {
  static renderMode = 'light';
  isRuntime = !isDesignMode;
  isDesignMode = isDesignMode;
  closeIconPath = `${BasePath}/assets/icons/action-sprite/svg/symbols.svg#close`;
  labels = labels;
  _needsBlanketConsent = false;
  _isInitialized = false;
  @api
  acceptButtonText;
  @api
  rejectButtonText;
  @api
  excludedPages;
  @wire(CurrentPageReference)
  currentPageRef;
  get acceptText() {
    return this.acceptButtonText ?? '';
  }
  get rejectText() {
    return this.rejectButtonText ?? '';
  }
  get excludedPageList() {
    return (this.excludedPages?.split('\n') ?? []).map(value => value.trim()).filter(Boolean);
  }
  get classes() {
    return {
      wrapper: true,
      'design-mode': isDesignMode
    };
  }
  get isVisible() {
    return !this.isStorefrontEditor && (isDesignMode || !this.isPageExcluded() && this._needsBlanketConsent);
  }
  get isStorefrontEditor() {
    if (!import.meta.env.SSR) {
      const urlParams = new URLSearchParams(globalThis.location.search);
      return urlParams.get('isLivePreview') === 'true';
    }
    return false;
  }
  connectedCallback() {
    this._needsBlanketConsent = needsBlanketConsent();
    if (!this._isInitialized && !this._needsBlanketConsent) {
      this._isInitialized = true;
      this.setConsentAndClose(hasBlanketConsent());
    }
  }
  handleAcceptClick() {
    this.setConsentAndClose(true);
  }
  handleRejectClick() {
    this.setConsentAndClose(false);
  }
  handleCloseClick() {
    this.setConsentAndClose(false);
  }
  setConsentAndClose(hasConsent) {
    setBlanketConsent(hasConsent, this);
    this._needsBlanketConsent = false;
  }
  isPageExcluded() {
    return this.excludedPageList.some(page => this.currentPageRef?.type === 'comm__namedPage' && this.currentPageRef.attributes?.name === page);
  }
}