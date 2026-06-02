import { api } from 'lwc';
import { CheckoutContainerBase } from 'commerce/checkoutApi';
import { CheckoutLayout, defaultContainerAspect } from 'commerce/checkoutApi';
import { isPreviewMode } from 'experience/clientApi';

/**
 * @slot title
 * @slot edit
 * @slot content
 * @slot proceed
 */
export default class CheckoutSection extends CheckoutContainerBase {
  static renderMode = 'light';
  _containerAspect = defaultContainerAspect();
  _isAccordion = false;
  _isOnePage = false;
  a11yTitle;
  isHidden = false;
  isEdit = false;
  isCollapsed = false;
  @api
  expandedMode = isPreviewMode;
  @api
  proceedButtonAlignment;
  setDomKey(suggestedDomKey) {
    this.setAttribute('data-checkout-domkey', suggestedDomKey);
    return suggestedDomKey;
  }
  setAspect(newAspect) {
    const {
      layout,
      ...ourAspect
    } = newAspect;
    this._containerAspect = ourAspect;
    this.getSubscribers().map(component => this.subscriberSetAspect(component, this._containerAspect));
    if (newAspect.hide !== undefined) {
      this.isHidden = newAspect.hide;
    }
    this.isEdit = !newAspect.summary && !newAspect.collapse;
    this.isCollapsed = !newAspect.summary && newAspect.collapse;
    if (!this._isAccordion && !this._isOnePage) {
      switch (newAspect.layout) {
        case CheckoutLayout.Accordion:
          this._isAccordion = true;
          break;
        case CheckoutLayout.OnePage:
        default:
          this._isOnePage = true;
          break;
      }
    }
  }
  handleConnect(component) {
    this.subscriberSetAspect(component, this._containerAspect);
  }
  handleCommit(component, containerChild) {
    this.dispatchCommit(containerChild ?? component);
    return Promise.resolve();
  }
  get customClasses() {
    return this.isHidden ? 'slds-hide' : 'slds-show';
  }
  get customStyles() {
    return '';
  }
  renderedCallback() {
    const titleSlotLocator = 'div[data-automation=title]';
    const textBlockLocators = ['h1', 'h2', 'h3', 'h4', 'h5', 'p'];
    let text;
    for (const h of textBlockLocators) {
      text = this.querySelector(`${titleSlotLocator} ${h}`)?.textContent;
      if (text !== undefined) {
        break;
      }
    }
    this.a11yTitle = text || undefined;
  }
}