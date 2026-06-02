import { api, LightningElement, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import BasePath from '@salesforce/community/basePath';
import { FORM_FACTOR_LARGE, FORM_FACTOR_SMALL, getFormFactor } from 'experience/clientApi';
import { generateStyleProperties } from 'experience/styling';
import { ariaCloseButtonLabel } from './labels';
/**
 * @slot promoBanner
 * @slot storeLogo
 * @slot navigation
 * @slot searchInput
 * @slot shopperCopilot
 * @slot icons
 */
export default class LayoutHeaderOne extends LightningElement {
  static renderMode = 'light';
  isSearchExpanded = false;
  transitionEndQueue = [];
  formFactor = FORM_FACTOR_LARGE;
  _showCopilotShortcut = false;
  ariaCloseButtonLabel = ariaCloseButtonLabel;
  closeIconPath = `${BasePath}/assets/icons/action-sprite/svg/symbols.svg#close`;
  outsideClickListener = event => this.handleOutsideClick(event);
  @wire(AppContextAdapter)
  getAppContext({
    data
  }) {
    this._showCopilotShortcut = Boolean(data?.shopperCopilotUIEnabled);
  }
  @wire(getFormFactor)
  wireFormFactor(formFactor) {
    if (this.formFactor !== formFactor && formFactor === FORM_FACTOR_SMALL && this.isSearchExpanded) {
      this.drawerFocusTrapManager?.activateFocusTrap();
    } else if (this.formFactor !== formFactor && this.formFactor === FORM_FACTOR_SMALL && this.isSearchExpanded) {
      this.drawerFocusTrapManager?.deactivateFocusTrap();
    }
    this.formFactor = formFactor;
  }
  @api
  headerIconsColor;
  @api
  headerIconsHoverColor;
  get showCopilotShortcut() {
    return this._showCopilotShortcut;
  }
  get headerClasses() {
    const classes = {
      'search-expanded': this.isSearchExpanded
    };
    return Object.values(classes).some(Boolean) ? classes : undefined;
  }
  get searchInput() {
    return this.refs?.headerSearchInput?.querySelector('[part="searchInput"]');
  }
  get searchIcon() {
    return this.refs?.headerSearchIcon?.querySelector('[part="searchIcon"]');
  }
  get focusTrapManager() {
    return this.refs?.headerFocusTrapManager;
  }
  get drawerFocusTrapManager() {
    return this.refs?.headerDrawerFocusTrapManager;
  }
  get _customStyles() {
    return generateStyleProperties([{
      name: '--com-c-layout-header-icons-color',
      value: this.headerIconsColor
    }, {
      name: '--com-c-layout-header-icons-color-hover',
      value: this.headerIconsHoverColor
    }]);
  }
  get _ariaModalAttribute() {
    return this.isSearchExpanded ? 'true' : null;
  }
  get _roleAttribute() {
    return this.isSearchExpanded ? 'dialog' : null;
  }
  connectedCallback() {
    globalThis.document?.addEventListener('click', this.outsideClickListener);
  }
  disconnectedCallback() {
    globalThis.document?.removeEventListener('click', this.outsideClickListener);
  }
  handleSearchIconClick() {
    if (this.isSearchExpanded) {
      this.searchInput?.focus?.();
    } else {
      this.isSearchExpanded = true;
      this.transitionEndQueue.push(() => this.focusTrapManager?.activateFocusTrap(undefined, this.searchInput));
      if (this.formFactor === FORM_FACTOR_SMALL) {
        this.transitionEndQueue.push(() => this.drawerFocusTrapManager?.activateFocusTrap(undefined, this.searchInput));
      }
    }
  }
  handleSearchDrawerTransitionEnd() {
    this.emptyQueue(this.transitionEndQueue);
  }
  handleSearchDrawerCloseClick() {
    this.closeSearchDrawer({
      focusIcon: true
    });
  }
  handleSearchInputEscape() {
    this.closeSearchDrawer({
      focusIcon: true
    });
  }
  handleContentOverlayClick() {
    this.closeSearchDrawer();
  }
  handleSearchNavigate() {
    this.closeSearchDrawer();
  }
  isClickedOutsideSearch(event) {
    return !this.refs?.headerSearchIcon?.contains(event.target) && !this.refs?.headerSearchDrawer?.contains(event.target);
  }
  handleOutsideClick(event) {
    if (event.target && this.isSearchExpanded && this.isClickedOutsideSearch(event)) {
      this.closeSearchDrawer();
    }
  }
  closeSearchDrawer({
    focusIcon = false
  } = {}) {
    const searchInput = this.searchInput;
    this.isSearchExpanded = false;
    this.focusTrapManager?.deactivateFocusTrap();
    this.drawerFocusTrapManager?.deactivateFocusTrap();
    if (focusIcon) {
      this.searchIcon?.focus?.();
    }
    if (searchInput) {
      searchInput.value = '';
      searchInput.dispatchEvent(new InputEvent('input', {
        bubbles: true
      }));
    }
  }
  emptyQueue(queue) {
    let fn;
    while (fn = queue.shift()) {
      fn();
    }
  }
}