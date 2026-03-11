import { api, LightningElement, unwrap } from 'lwc';
import { toMenuItems } from './transformation';
import { mobileTrigger } from './labels';
import { coerceAlignment } from 'experience/styling';
import { MEDIA_QUERY_SMALL, MEDIA_QUERY_MEDIUM, MEDIA_QUERY_LARGE, FORM_FACTOR } from './constants';
const CLOSE_MOBILE_EVENT = 'closemobile';
const DEFAULT_ALIGNMENT = 'left';
export default class CommonDrilldownNavigationUi extends LightningElement {
  static renderMode = 'light';
  _menuItems = [];
  _viewMenuItems = [];
  _mobileMenuOpen = false;
  _showMobileTrigger = true;
  mqlSmall = window.matchMedia(MEDIA_QUERY_SMALL);
  mqlMedium = window.matchMedia(MEDIA_QUERY_MEDIUM);
  mqlLarge = window.matchMedia(MEDIA_QUERY_LARGE);
  formFactor = FORM_FACTOR.LARGE;
  @api
  alignment;
  @api
  get menuItems() {
    return this._menuItems;
  }
  set menuItems(val) {
    this.viewMenuItems = toMenuItems(unwrap(val));
    this._menuItems = val;
  }
  @api
  hideMoreMenu = false;
  @api
  showAppLauncher = false;
  @api
  showListView = false;
  @api
  showBackLabel = false;
  @api
  customThemeStylesBar = undefined;
  @api
  customThemeStylesList = undefined;
  @api
  get showMobileTrigger() {
    return this._showMobileTrigger;
  }
  set showMobileTrigger(value) {
    this._showMobileTrigger = value;
  }
  @api
  toggleMobileView(toggleValue) {
    this._mobileMenuOpen = toggleValue;
  }
  get isMobile() {
    return this.formFactor === FORM_FACTOR.SMALL;
  }
  get isTablet() {
    return this.formFactor === FORM_FACTOR.MEDIUM;
  }
  get isDesktop() {
    return this.formFactor === FORM_FACTOR.LARGE;
  }
  get normalizedAlignment() {
    return coerceAlignment(this.alignment, DEFAULT_ALIGNMENT);
  }
  get mobileTriggerLabel() {
    return mobileTrigger;
  }
  get viewMenuItems() {
    return this._viewMenuItems;
  }
  set viewMenuItems(val) {
    this._viewMenuItems = val;
  }
  get mobileMenuOpen() {
    return this._mobileMenuOpen;
  }
  connectedCallback() {
    this.computeFormFactor();
    this.mqlSmall.addEventListener('change', event => {
      if (event.matches) {
        this.formFactor = FORM_FACTOR.SMALL;
      }
    });
    this.mqlMedium.addEventListener('change', event => {
      if (event.matches) {
        this.formFactor = FORM_FACTOR.MEDIUM;
      }
    });
    this.mqlLarge.addEventListener('change', event => {
      if (event.matches) {
        this.formFactor = FORM_FACTOR.LARGE;
      }
    });
  }
  computeFormFactor() {
    this.formFactor = this.mqlSmall.matches ? FORM_FACTOR.SMALL : this.mqlMedium.matches ? FORM_FACTOR.MEDIUM : FORM_FACTOR.LARGE;
  }
  handleNavigationTriggerClicked() {
    this._mobileMenuOpen = !this._mobileMenuOpen;
  }
  focusMobileNavigationTrigger() {
    this._mobileMenuOpen = false;
    if (this._showMobileTrigger) {
      this.refs?.hamburgerButton?.focus();
    } else {
      this.dispatchEvent(new CustomEvent(CLOSE_MOBILE_EVENT, {
        detail: {
          mobileMenuOpened: false
        }
      }));
    }
  }
}