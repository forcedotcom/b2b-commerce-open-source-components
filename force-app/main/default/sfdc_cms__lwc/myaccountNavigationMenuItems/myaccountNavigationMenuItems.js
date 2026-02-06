import { api, LightningElement, wire } from 'lwc';
import { generatePaddingClass } from 'experience/styling';
import { CurrentPageReference, generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import { isCurrentPage } from './navigationMenuItemSelector';
import LABELS from './labels';
export const MENU_ITEMS_TO_SKIP = new Set(['Event', 'GlobalAction', 'MenuLabel', 'NavigationalTopic', 'SystemLink', 'Modal']);
export default class MyaccountNavigationMenuItems extends LightningElement {
  static renderMode = 'light';
  _currentPageUrl = '';
  _pageRef;
  _navContext;
  @api
  navigationLinkSetDevName;
  @api
  navItemSpacing;
  @wire(NavigationContext)
  getNavContext(navContext) {
    if (this._pageRef) {
      this._currentPageUrl = generateUrl(navContext, this._pageRef);
    }
    this._navContext = navContext;
  }
  @wire(CurrentPageReference)
  updateCurrentPageReference(pageRef) {
    if (this._navContext) {
      this._currentPageUrl = generateUrl(this._navContext, pageRef);
    }
    this._pageRef = pageRef;
  }
  get menuItems() {
    const paddingClass = generatePaddingClass(this.navItemSpacing ?? 'medium', 'vertical');
    return (this.navigationLinkSetDevName || []).reduce((menuItems, menuItem, index) => {
      if (menuItem.actionValue && !MENU_ITEMS_TO_SKIP.has(menuItem.actionType)) {
        const selected = isCurrentPage(menuItem, this._currentPageUrl, this._pageRef);
        const id = index.toString();
        const listItemCssClasses = `slds-nav-vertical__item ${selected ? 'slds-is-active' : ''}`;
        const linkCssClasses = `slds-nav-vertical__action ${paddingClass}`;
        menuItems.push({
          ...menuItem,
          id,
          selected,
          listItemCssClasses,
          linkCssClasses
        });
      }
      return menuItems;
    }, []);
  }
  _labels = LABELS;
  get showMenuItems() {
    return this.menuItems.length > 0;
  }
  handleMenuItemClicked(event) {
    event.preventDefault();
    this.handleMenuItemNavigation(event.target.dataset.itemId);
  }
  handleMenuItemChange(event) {
    this.handleMenuItemNavigation(event.target.value);
  }
  handleMenuItemNavigation(selectedMenuItemId) {
    if (selectedMenuItemId) {
      const menuItem = this.menuItems.find(menu => menu.id === selectedMenuItemId);
      if (menuItem && menuItem.actionValue) {
        if (menuItem.actionType === 'InternalLink' && this._navContext) {
          navigate(this._navContext, {
            type: 'standard__webPage',
            attributes: {
              url: menuItem.actionValue
            }
          });
        } else if (menuItem.actionType === 'ExternalLink') {
          globalThis.open(menuItem.actionValue, menuItem.target === 'NewWindow' ? '_blank' : '_self', 'noopener,noreferrer');
        }
      }
    }
  }
}