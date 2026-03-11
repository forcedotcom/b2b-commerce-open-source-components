import { LightningElement, wire, api } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { getDefaultIcon } from './iconHelper';
const MENU_ITEMS_TO_SKIP = ['SystemLink', 'Modal', 'InternalLink'];
export default class CommonLinksSocial extends LightningElement {
  static renderMode = 'light';
  @api
  orientation;
  @api
  flexAlignment;
  @api
  navigationMenuData;
  get items() {
    return this.transformItems(this.navigationMenuData ?? []);
  }
  transformItems(items) {
    return items.filter(item => !MENU_ITEMS_TO_SKIP.includes(item.actionType)).map((menuItem, index) => ({
      id: index,
      target: menuItem.target,
      label: menuItem.label,
      actionValue: menuItem.actionValue,
      imageUrl: menuItem.imageUrl || getDefaultIcon(menuItem.actionValue || ''),
      useIcon: !menuItem.imageUrl
    }));
  }
  get hasItems() {
    return !!this.items?.length;
  }
  get containerClass() {
    return ['container', this.orientation === 'vertical' ? 'vertical-container' : 'horizontal-container'];
  }
  @wire(NavigationContext)
  navContext;
  handleItemClick(e) {
    e.preventDefault();
    const url = e.currentTarget?.href;
    navigate(this.navContext, {
      type: 'standard__webPage',
      attributes: {
        url
      }
    });
  }
}