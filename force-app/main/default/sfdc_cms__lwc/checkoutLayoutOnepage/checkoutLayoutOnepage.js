import { CheckoutContainerBase } from 'commerce/checkoutApi';
import { CheckoutLayout, defaultContainerAspect } from 'commerce/checkoutApi';
import { api } from 'lwc';
import { setCheckoutLayoutType } from 'commerce/dataEventApi';
import { generateStyleProperties } from 'experience/styling';

/**
 * @slot content
 * @slot column
 */
export default class CheckoutLayoutOnepage extends CheckoutContainerBase {
  static renderMode = 'light';
  _containerAspect = defaultContainerAspect();
  _showSummaryExpanded = false;
  get _summaryColumnClass() {
    return `column-content ${this._showSummaryExpanded ? 'show' : ''}`;
  }
  @api
  showSummaryColumn = false;
  @api
  checkoutSummaryColumnBackgroundColor;
  get checkoutSummaryColumnStyles() {
    return generateStyleProperties({
      '--checkout-summary-background-color': this.checkoutSummaryColumnBackgroundColor || 'rgba(242, 245, 249, 1))',
      '--com-c-checkout-summary-container-cart-items-height': '25rem'
    });
  }
  setAspect(newAspect) {
    this._containerAspect = {
      ...newAspect,
      layout: CheckoutLayout.OnePage
    };
    this.getSubscribers().map(component => this.subscriberSetAspect(component, this._containerAspect));
  }
  handleRequestAspect(component, {
    hideable
  }) {
    if (hideable !== undefined) {
      this.subscriberSetAspect(component, {
        ...this._containerAspect,
        hide: hideable
      });
    }
  }
  connectedCallback() {
    setCheckoutLayoutType(CheckoutLayout.OnePage);
  }
  handleConnect(component) {
    this.subscriberSetAspect(component, this._containerAspect);
  }
  handleSummaryToggle() {
    this._showSummaryExpanded = !this._showSummaryExpanded;
  }
  get containerClasses() {
    return `container ${this.showSummaryColumn ? 'show-summary-column' : ''}`;
  }
}