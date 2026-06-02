import { api, LightningElement } from 'lwc';
import templateWithWishlistSlot from './templateWithWishlistSlot.html';
import templateWithoutWishlistSlot from './templateWithoutWishlistSlot.html';
const DEFAULT_LAYOUT = 'desktop';
export default class LayoutHeaderUi extends LightningElement {
  static renderMode = 'light';
  @api
  hidePromoBanner = false;
  @api
  hideWishlistShortcut = false;
  @api
  hideMobileNavigation = false;
  @api
  layout;
  @api
  showCopilotShortcut = false;
  get showPromoBanner() {
    return !this.hidePromoBanner;
  }
  get isDesktop() {
    return this.layout === 'desktop';
  }
  get isTablet() {
    return this.layout === 'tablet';
  }
  get isMobile() {
    return this.layout === 'mobile';
  }
  get headerClass() {
    return this.layout ?? DEFAULT_LAYOUT;
  }
  render() {
    return this.hideWishlistShortcut ? templateWithoutWishlistSlot : templateWithWishlistSlot;
  }
}