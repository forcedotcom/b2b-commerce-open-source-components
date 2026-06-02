import { api } from 'lwc';
import { CheckoutContainerBase, CheckoutStage, defaultContainerAspect } from 'commerce/checkoutApi';
import { debounce } from 'experience/utils';
import { generateElementAlignmentClass } from 'experience/styling';

/**
 * @slot title
 * @slot edit
 * @slot content
 * @slot proceed
 */
export default class CheckoutSectionAccordion extends CheckoutContainerBase {
  static renderMode = 'light';
  _containerAspect = defaultContainerAspect();
  _showPlaceOrder = false;
  _collapsed = false;
  _summarized = false;
  _summarizable = new Map();
  _editRequested = false;
  _uneditable = new Map();
  _expandedMode = false;
  get _showProceed() {
    return this._showPlaceOrder || !this._collapsed && !this._summarized;
  }
  set collapsed(value) {
    if (!value && this._collapsed && !this._summarized) {
      this.setFocusOnEdit();
    }
    this._collapsed = value;
  }
  set summarized(value) {
    if (!value && this._summarized && !this._collapsed) {
      this.setFocusOnEdit();
    }
    this._summarized = value;
  }
  setFocusOnEdit() {
    debounce(() => {
      const formControls = [...this.querySelectorAll('input, select, textarea, button')];
      const focusable = formControls.filter(h => h.offsetParent !== null);
      focusable?.[0]?.focus();
    }, 200)();
  }
  @api
  a11yTitle;
  @api
  set expandedMode(value) {
    if (value) {
      this._editRequested = true;
    }
    this._expandedMode = value;
  }
  get expandedMode() {
    return this._expandedMode;
  }
  @api
  proceedButtonAlignment;
  get _proceedClasses() {
    return generateElementAlignmentClass(this.proceedButtonAlignment ?? null);
  }
  get _showEditButton() {
    if (this.expandedMode) {
      return true;
    }
    const hasEditableComponents = !this.getSubscribers().reduce((acc, comp) => {
      return acc && !!this._uneditable.get(comp);
    }, true);
    return this._summarized && (!this.getSubscribers().length || hasEditableComponents);
  }
  get _editClasses() {
    return this._showEditButton ? 'slds-show' : 'slds-hide';
  }
  get _contentClasses() {
    return this._collapsed ? 'slds-hide' : 'slds-show';
  }
  setAspect(newAspect) {
    const {
      showPlaceOrder,
      ...ourAspect
    } = newAspect;
    this._containerAspect = ourAspect;
    if (newAspect.showPlaceOrder !== undefined) {
      this._showPlaceOrder = newAspect.showPlaceOrder;
    }
    this.collapsed = newAspect.collapse;
    this.summarized = newAspect.summary;
    this.getSubscribers().map(component => this.subscriberSetAspect(component, newAspect));
  }
  handleConnect(component) {
    this.subscriberSetAspect(component, this._containerAspect);
  }
  handleRequestAspect(component, {
    summarizable,
    uneditable,
    hideable
  }) {
    if (summarizable !== undefined) {
      this._summarizable.set(component, summarizable);
      this._uneditable.set(component, uneditable ?? false);
      const sectionSummarizable = !this._editRequested && this.getSubscribers().reduce((acc, comp) => acc && !!this._summarizable.get(comp), true);
      if (hideable !== undefined || sectionSummarizable !== this._summarized) {
        this.dispatchRequestAspect({
          summarizable: sectionSummarizable,
          hideable
        });
      }
    } else if (hideable !== undefined) {
      this.dispatchRequestAspect({
        hideable
      });
    }
  }
  handleEdit(event) {
    event.stopPropagation();
    if (!this.expandedMode) {
      this._editRequested = true;
      this.dispatchRequestAspect({
        summarizable: false
      });
    }
  }
  async handleProceed(event) {
    event.stopPropagation();
    const subscribers = this.getSubscribers();
    const results = await Promise.all(subscribers.map(comp => this.subscriberStageAction(comp, CheckoutStage.REPORT_VALIDITY_SAVE)));
    if (!results.every(r => r)) {
      await Promise.all(subscribers.map(comp => this.subscriberStageAction(comp, CheckoutStage.ABORT_PAYMENT_SESSION)));
      return;
    }
    this._editRequested = false;
    this.dispatchRequestAspect({
      summarizable: true
    });
    this.dispatchCommit();
  }
  async handleCommit(_component, containerChild) {
    if (!containerChild) {
      this._editRequested = true;
      await Promise.all(this.getSubscribers().map(comp => this.subscriberStageAction(comp, CheckoutStage.CHECK_VALIDITY_UPDATE)));
    }
  }
  handleDisconnect(component) {
    this._summarizable.delete(component);
    this._uneditable.delete(component);
  }
  get sectionClass() {
    const themeVersion = getComputedStyle(document.documentElement).getPropertyValue('--com-c-theme-version');
    if (Number(themeVersion) >= 2) {
      if (this._summarized) {
        return `separators summary`;
      } else if (this._collapsed) {
        return 'separators collapsed';
      }
      return 'separators';
    }
    return '';
  }
}