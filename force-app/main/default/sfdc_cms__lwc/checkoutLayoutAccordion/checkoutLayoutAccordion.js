import { api } from 'lwc';
import { CheckoutContainerBase } from 'commerce/checkoutApi';
import { defaultContainerAspect, CheckoutStage, CheckoutLayout } from 'commerce/checkoutApi';
import { setCheckoutLayoutType } from 'commerce/dataEventApi';
import { createStyleString } from './styleUtils';
/**
 * @slot content
 * @slot column
 */
export default class CheckoutLayoutAccordion extends CheckoutContainerBase {
  static renderMode = 'light';
  _sortedSections = [];
  _visitedSections = [];
  _containerAspect = defaultContainerAspect();
  _hidden = new Set();
  _summarizable = new Map();
  _suggestProceed = false;
  _showSummaryExpanded = false;
  get _summaryColumnClass() {
    return `column-content ${this._showSummaryExpanded ? 'show' : ''}`;
  }
  @api
  expandedMode = false;
  @api
  canSummarizePlaceOrder = false;
  @api
  showSummaryColumn = false;
  @api
  checkoutSummaryColumnBackgroundColor;
  get checkoutSummaryColumnStyles() {
    const styles = {
      '--checkout-summary-background-color': this.checkoutSummaryColumnBackgroundColor || 'rgba(242, 245, 249, 1))',
      '--com-c-checkout-summary-container-cart-items-height': '25rem'
    };
    return createStyleString(styles);
  }
  setSectionsAspect() {
    if (this.expandedMode) {
      this._sortedSections.forEach(section => this.subscriberSetAspect(section, {
        ...this._containerAspect,
        collapse: false,
        summary: false
      }));
      return;
    }
    this._visitedSections = [];
    let ssIdx = 0;
    const sortedSectionsCanSummarize = this.canSummarizePlaceOrder ? this._sortedSections.length : this._sortedSections.length - 1;
    while (ssIdx < sortedSectionsCanSummarize && this._summarizable.get(this._sortedSections[ssIdx])) {
      this._visitedSections.push(this._sortedSections[ssIdx]);
      this.subscriberSetAspect(this._sortedSections[ssIdx], {
        ...this._containerAspect,
        hide: this._hidden.has(this._sortedSections[ssIdx]),
        collapse: false,
        summary: true,
        showPlaceOrder: ssIdx === this._sortedSections.length - 1
      });
      ssIdx += 1;
    }
    if (ssIdx < this._sortedSections.length) {
      this._visitedSections.push(this._sortedSections[ssIdx]);
      this.subscriberSetAspect(this._sortedSections[ssIdx], {
        ...this._containerAspect,
        hide: false,
        collapse: false,
        summary: false,
        showPlaceOrder: false
      });
      ssIdx += 1;
    }
    while (ssIdx < this._sortedSections.length) {
      this.subscriberSetAspect(this._sortedSections[ssIdx], {
        ...this._containerAspect,
        hide: this._hidden.has(this._sortedSections[ssIdx]),
        collapse: true,
        summary: false,
        showPlaceOrder: false
      });
      ssIdx += 1;
    }
  }
  async stageAction(checkoutStage) {
    if (![CheckoutStage.CHECK_VALIDITY_UPDATE, CheckoutStage.REPORT_VALIDITY_SAVE].includes(checkoutStage)) {
      return super.stageAction(checkoutStage);
    }
    this._suggestProceed = false;
    const results = await Promise.all(this._visitedSections.map(component => this.subscriberStageAction(component, checkoutStage)));
    if (!results.every(r => r)) {
      return false;
    }
    this._suggestProceed = this._visitedSections.length < this._sortedSections.length;
    return !this._suggestProceed;
  }
  setAspect(newAspect) {
    this._containerAspect = {
      ...newAspect,
      layout: CheckoutLayout.Accordion
    };
    this.setSectionsAspect();
  }
  getSectionDomKeys() {
    const childLocator = '[data-checkout-domkey]';
    const domKeys = [];
    const slot = this.querySelector('div[data-automation="content"]');
    slot?.querySelectorAll(childLocator).forEach(element => {
      const domKey = element.dataset?.checkoutDomkey;
      if (domKey) {
        domKeys.push(domKey);
      }
    });
    return domKeys;
  }
  connectedCallback() {
    setCheckoutLayoutType(CheckoutLayout.Accordion);
  }
  handleConnect(_component) {
    const domKeys = this.getSectionDomKeys();
    this._sortedSections = this.sortSubscribers(domKeys);
    this.setSectionsAspect();
  }
  handleDisconnect(component) {
    this._sortedSections = this._sortedSections.filter(c => c !== component);
    this._visitedSections = this._visitedSections.filter(c => c !== component);
    this._hidden.delete(component);
    this._summarizable.delete(component);
    this.setSectionsAspect();
  }
  handleRequestAspect(component, {
    summarizable,
    hideable
  }) {
    if (hideable) {
      this._hidden.add(component);
    } else if (hideable === false) {
      this._hidden.delete(component);
    }
    if (this._hidden.has(component)) {
      summarizable = true;
    }
    if (summarizable !== undefined) {
      const lastVisited = this._visitedSections[this._visitedSections.length - 1];
      if (lastVisited === component && summarizable) {
        this._suggestProceed = false;
      }
      const componentWasSummarizable = !!this._summarizable.get(component);
      this._summarizable.set(component, summarizable);
      if (hideable !== undefined || summarizable !== componentWasSummarizable) {
        if (!summarizable) {
          let ssIdx = this._sortedSections.findIndex(comp => comp === component);
          if (ssIdx >= 0) {
            for (; ssIdx < this._sortedSections.length; ssIdx++) {
              this._summarizable.set(this._sortedSections[ssIdx], this._hidden.has(this._sortedSections[ssIdx]));
            }
          }
        }
        this.setSectionsAspect();
      }
    } else if (hideable === false) {
      this.setSectionsAspect();
    }
  }
  get suggestProceedClass() {
    return `column-content ${this._suggestProceed ? 'suggest-proceed' : ''}`;
  }
  handleSummaryToggle() {
    this._showSummaryExpanded = !this._showSummaryExpanded;
  }
  get containerClasses() {
    return `container ${this.showSummaryColumn ? 'show-summary-column' : ''}`;
  }
}