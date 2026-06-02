import { api } from 'lwc';
import { CheckoutContainerBase, CheckoutStage, defaultContainerAspect } from 'commerce/checkoutApi';
import { debounce } from 'experience/utils';

/**
 * @slot title
 * @slot edit
 * @slot content
 */
export default class CheckoutSectionOnePage extends CheckoutContainerBase {
  static renderMode = 'light';
  _containerAspect = defaultContainerAspect();
  _summarized = false;
  _summarizable = new Map();
  _editRequested = false;
  _showEdit = false;
  _uneditable = new Map();
  _expandedMode = false;
  @api
  a11yTitle;
  @api
  set expandedMode(value) {
    if (value) {
      this._showEdit = true;
      this._editRequested = true;
    }
    this._expandedMode = value;
  }
  get expandedMode() {
    return this._expandedMode;
  }
  get _editClasses() {
    return this._showEdit ? 'slds-show' : 'slds-hide';
  }
  setAspect(newAspect) {
    if (newAspect.readOnlyIfValid) {
      this._editRequested = false;
    }
    this._containerAspect = {
      ...newAspect,
      summary: this._summarized
    };
    this.getSubscribers().map(component => this.subscriberSetAspect(component, this._containerAspect));
    if (!this._summarized && this._editRequested) {
      debounce(() => {
        const formControls = [...this.querySelectorAll('input, select, textarea, button')];
        const focusable = formControls.filter(h => h.offsetParent !== null);
        focusable?.[0]?.focus();
      }, 100)();
    }
  }
  handleConnect(component) {
    this.subscriberSetAspect(component, this._containerAspect);
  }
  handleDisconnect(component) {
    this._summarizable.delete(component);
    this._uneditable.delete(component);
  }
  handleRequestAspect(component, {
    summarizable,
    uneditable,
    hideable
  }) {
    if (hideable !== undefined) {
      this.dispatchRequestAspect({
        hideable
      });
    }
    if (summarizable !== undefined) {
      this._summarizable.set(component, summarizable);
      this._uneditable.set(component, uneditable ?? false);
      const prevSummarized = this._summarized;
      this._summarized = !this._editRequested && this.getSubscribers().reduce((acc, comp) => acc && !!this._summarizable.get(comp), true);
      this._showEdit = this._summarized && !this.getSubscribers().reduce((acc, comp) => acc && !!this._uneditable.get(comp), true);
      if (prevSummarized !== this._summarized) {
        this.setAspect(this._containerAspect);
      }
    }
  }
  handleEdit(event) {
    event.stopPropagation();
    if (!this.expandedMode) {
      this._editRequested = true;
      this._summarized = false;
      this._showEdit = false;
      this.setAspect(this._containerAspect);
    }
  }
  async handleNavToSplitShip(event) {
    event.stopPropagation();
    const subscribers = this.getSubscribers();
    await Promise.all(subscribers.map(comp => this.subscriberStageAction(comp, CheckoutStage.CHECK_VALIDITY_UPDATE)));
    const results = await Promise.all(subscribers.map(comp => this.subscriberStageAction(comp, CheckoutStage.REPORT_VALIDITY_SAVE)));
    if (!results.every(r => r)) {
      await Promise.all(subscribers.map(comp => this.subscriberStageAction(comp, CheckoutStage.ABORT_PAYMENT_SESSION)));
      return;
    }
    this.dispatchCommit();
  }
  get sectionClass() {
    const themeVersion = getComputedStyle(document.documentElement).getPropertyValue('--com-c-theme-version');
    return Number(themeVersion) >= 2 ? 'separators' : '';
  }
}