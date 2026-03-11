import { api, LightningElement, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import { getNavigationMenu } from 'experience/navigationMenuApi';
const DEFAULT_ALIGNMENT = 'left';
const MENU_ITEMS_TO_SKIP = ['Event', 'GlobalAction', 'MenuLabel', 'NavigationalTopic', 'SystemLink', 'Modal'];
export default class CommonDrilldownNavigation extends LightningElement {
  static renderMode = 'light';
  @api
  showHomeLink = false;
  @api
  showBackLabel = false;
  @api
  alignment;
  @api
  navigationMenuEditor;
  _navigationMenuItems = [];
  get menuItems() {
    return this._navigationMenuItems;
  }
  @wire(getNavigationMenu, {
    menuItemTypesToSkip: MENU_ITEMS_TO_SKIP,
    includeImageUrl: false,
    addHomeMenuItem: true
  })
  handleProductCategoryMenuItems(result) {
    if (result.data?.menuItems) {
      this._navigationMenuItems = result.data.menuItems;
    } else if (result.error) {
      console.error('[myaccountNavigationMenuItems] Wire error:', result.error);
      this._navigationMenuItems = [];
    }
  }
  @wire(NavigationContext)
  navContext;
  get normalizedAlignment() {
    return typeof this.alignment === 'string' && ['left', 'center', 'right'].includes(this.alignment) ? this.alignment : DEFAULT_ALIGNMENT;
  }
  handleNavigateToPage(event) {
    const {
      type,
      href,
      target,
      pageReference
    } = event.detail;
    if (!href) {
      return;
    }
    event.stopPropagation();
    if (pageReference && this.navContext) {
      navigate(this.navContext, JSON.parse(JSON.stringify(pageReference)));
      return;
    }
    let navUrl = href;
    if (type === 'InternalLink' && href) {
      if (href.startsWith(basePath)) {
        navUrl = href.substring(basePath.length);
      }
      this.navContext && navigate(this.navContext, {
        type: 'standard__webPage',
        attributes: {
          url: navUrl
        }
      });
    } else if (type === 'ExternalLink') {
      window.open(href, target, 'noopener,noreferrer');
    }
  }
}