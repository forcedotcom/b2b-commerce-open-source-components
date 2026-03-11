import { api, LightningElement } from 'lwc';
import { labelAppLauncherTitle, labelOverflowLabel, componentNameLabel } from './labels';
import { addOverflowMenu } from './overflow';
import { coerceAlignment, generateConditionalStyles } from 'experience/styling';
import { mappedStyles, NAVIGATE_EVENT, SHOW_APP_LAUNCHER, DEFAULT_ALIGNMENT, MAX_DISPLAYABLE_ITEMS } from './constants';
import { throttle } from './util';
export default class CommonDrilldownNavigationBarUi extends LightningElement {
  static renderMode = 'light';
  itemWidth = [];
  overflowItems = [];
  setFocusOnFirstSubMenuItem = false;
  setFocusOnLastSubMenuItem = false;
  menuItemsChanged = false;
  _resizeObserver;
  isResizeObserving = false;
  knownWindowWidth = 0;
  moreMenuItem = {
    id: 'more-item',
    label: labelOverflowLabel,
    subMenu: [],
    active: false,
    isSelected: false,
    href: null,
    type: 'MoreMenu'
  };
  appLauncherMenuItem = {
    id: 'app-launcher-item',
    appLauncher: true,
    label: '',
    isSelected: false
  };
  _showAppLauncher = false;
  _focusedItemId;
  _menuItems = [];
  _menuAlignment = DEFAULT_ALIGNMENT;
  _isMoreMenu = false;
  _outsideClickListener = event => {
    if (event.target && !this.refs?.navbar?.parentNode?.contains(event.target)) {
      this.closeSubMenus();
    }
  };
  visibleMenuItems = [];
  @api
  hideMoreMenu = false;
  @api
  showBackLabel = false;
  @api
  get menuItems() {
    return this._menuItems;
  }
  set menuItems(value) {
    this.resetMenuItems(value ?? []);
  }
  get componentNameLabel() {
    return componentNameLabel;
  }
  @api
  get isMoreMenu() {
    return this._isMoreMenu;
  }
  @api
  get menuAlignment() {
    return this._menuAlignment;
  }
  set menuAlignment(value) {
    this._menuAlignment = coerceAlignment(value, DEFAULT_ALIGNMENT);
  }
  @api
  customThemeStylesBar;
  @api
  customThemeStylesList;
  get navCustomStyles() {
    return this.getCustomStyles();
  }
  get styledVisibleItems() {
    const styledItems = this.visibleMenuItems.map(item => {
      const hasFocus = !!(item.id && this._focusedItemId === item.id.toString());
      return {
        ...item,
        customStyles: this.getCustomStyles({
          isHovering: hasFocus,
          isActive: !!item.active
        }),
        ...(!!item.active && {
          activeClass: 'isActive'
        }),
        ...(!!item.active && {
          ariaCurrent: 'page'
        })
      };
    });
    return styledItems;
  }
  @api
  get showAppLauncher() {
    return this._showAppLauncher;
  }
  set showAppLauncher(value) {
    this._showAppLauncher = value;
    this.resetMenuItems(this._menuItems);
  }
  get appLauncherLabel() {
    return labelAppLauncherTitle;
  }
  resetMenuItems(menuItems) {
    if (Array.isArray(menuItems)) {
      this._menuItems = [];
      this.visibleMenuItems = [];
      if (this._showAppLauncher) {
        this._menuItems.push(this.appLauncherMenuItem);
        this.visibleMenuItems.push(this.appLauncherMenuItem);
      }
      for (const item of menuItems) {
        this._menuItems.push(item);
        this.visibleMenuItems.push(item);
      }
      this.visibleMenuItems = this.visibleMenuItems.slice(0, MAX_DISPLAYABLE_ITEMS);
    } else {
      this._menuItems = [];
      this.visibleMenuItems = [];
    }
    this.menuItemsChanged = true;
  }
  getCustomStyles(opts = {
    isHovering: false,
    isActive: false
  }) {
    if (this.customThemeStylesBar) {
      return generateConditionalStyles(this.customThemeStylesBar, mappedStyles, opts);
    }
    return '';
  }
  getNavAvailableWidth() {
    const navElement = this.refs?.navbar;
    const navElementWidth = navElement?.getBoundingClientRect()?.width;
    return navElementWidth && navElementWidth > window.innerWidth ? window.innerWidth : navElementWidth;
  }
  calculateNavItemWidth() {
    this.itemWidth = [];
    const elements = this.querySelectorAll('nav ul>li');
    elements.forEach(el => {
      this.itemWidth.push(this.getWidth(el));
    });
  }
  getNavRequiredWidth() {
    const visibleItemsCount = this.visibleMenuItems.length;
    return this.itemWidth.slice(0, visibleItemsCount).reduce((sum, width) => sum + width, 0);
  }
  getOverflowWidth() {
    return Math.min(...this.itemWidth);
  }
  getWidth(el) {
    return el.getBoundingClientRect().width;
  }
  calculateOverflow() {
    const selectedItem = this.getSelectedItem()?.id;
    this.visibleMenuItems = this._menuItems.slice(0, MAX_DISPLAYABLE_ITEMS);
    let availableWidth = this.getNavAvailableWidth();
    const requiredWidth = this.getNavRequiredWidth();
    const overflowMenuWidth = this.getOverflowWidth();
    if (availableWidth && availableWidth < requiredWidth) {
      availableWidth -= overflowMenuWidth;
      const [newVisibleItems, newOverflow, containsActiveItem] = addOverflowMenu(this._menuItems, this.itemWidth, availableWidth);
      this.overflowItems = newOverflow;
      this.moreMenuItem.active = containsActiveItem;
      this.visibleMenuItems = [...newVisibleItems, {
        ...this.moreMenuItem,
        subMenu: [...this.overflowItems]
      }];
    } else if (this._menuItems.length > this.visibleMenuItems.length) {
      this.visibleMenuItems.push({
        ...this.moreMenuItem,
        subMenu: [...this._menuItems.slice(MAX_DISPLAYABLE_ITEMS)]
      });
    } else if (!availableWidth) {
      this.visibleMenuItems = [];
    }
    if (selectedItem) {
      this.setItemSelected(selectedItem, true);
    }
  }
  connectedCallback() {
    globalThis.document?.addEventListener('click', this._outsideClickListener);
    if (!this.hideMoreMenu) {
      if (!import.meta.env.SSR) {
        this._resizeObserver = new ResizeObserver(throttle(() => this.calculateOverflow(), 100));
      }
    }
  }
  disconnectedCallback() {
    globalThis.document?.removeEventListener('click', this._outsideClickListener);
    this._resizeObserver?.disconnect();
  }
  renderedCallback() {
    if (this._resizeObserver && this.refs?.navbar && !this.hideMoreMenu && !this.isResizeObserving) {
      this._resizeObserver.observe(this.refs?.navbar);
      this.isResizeObserving = true;
    }
    if (this.menuItemsChanged && !this.hideMoreMenu) {
      this.menuItemsChanged = false;
      this.calculateNavItemWidth();
      this.calculateOverflow();
    }
  }
  get menuAlignmentClass() {
    const cssClasses = ['comm-drilldown-navigation__bar', 'slds-grid', 'slds-has-flexi-truncate'];
    if (this.menuAlignment === 'center') {
      cssClasses.push('slds-grid_align-center');
    } else if (this.menuAlignment === 'right') {
      cssClasses.push('slds-grid_align-end');
    }
    if (this.hideMoreMenu) {
      cssClasses.push('comm-drilldown-navigation__bar-wrap');
    }
    return cssClasses;
  }
  fireNavigationEvent(event) {
    const targetEl = event?.currentTarget;
    const itemId = targetEl?.dataset?.id;
    const item = itemId && this.findItem(itemId);
    if (item) {
      this.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: {
          menuItemId: itemId,
          type: item.type,
          href: item.href,
          target: item.target,
          pageReference: item?.pageReference
        }
      }));
    }
  }
  setItemSelected(id, isSelected) {
    const itemIndex = this.findItemIndex(id);
    if (isSelected) {
      this.deselectSelectedItem();
    }
    if (itemIndex !== -1) {
      const mutatedItem = {
        ...this.visibleMenuItems[itemIndex],
        isSelected
      };
      this.visibleMenuItems = [...this.visibleMenuItems.slice(0, itemIndex), mutatedItem, ...this.visibleMenuItems.slice(itemIndex + 1)];
    }
  }
  findItem(id) {
    return this.visibleMenuItems.find(el => el.id === id);
  }
  findItemIndex(id) {
    return this.visibleMenuItems.findIndex(el => el.id === id);
  }
  isItemMoreMenu(id) {
    return id === this.moreMenuItem.id;
  }
  getSelectedItem() {
    return this.visibleMenuItems.find(el => !!el.isSelected);
  }
  deselectSelectedItem() {
    const selectedItem = this.getSelectedItem();
    if (selectedItem?.id) {
      this.setItemSelected(selectedItem.id, false);
    }
  }
  setItemCustomStyles(item, styles) {
    for (const {
      cssStyleName,
      customStyleName
    } of styles) {
      if (this.customThemeStylesBar?.[customStyleName]) {
        item.style.setProperty(cssStyleName, String(this.customThemeStylesBar[customStyleName]));
      }
    }
  }
  closeSubMenus() {
    this.setFocusOnFirstSubMenuItem = false;
    this.setFocusOnLastSubMenuItem = false;
    this.deselectSelectedItem();
  }
  setFocusToMenuItem(menuItemId, targetSubMenuSelected) {
    if (menuItemId) {
      const listItems = this.getMenuItemsElements();
      const itemToFocus = listItems[this.findItemIndex(menuItemId)];
      itemToFocus.focus();
      if (targetSubMenuSelected) {
        this.setItemSelected(menuItemId, true);
      }
      this._focusedItemId = menuItemId;
    }
  }
  getMenuItemsElements() {
    return this.querySelectorAll('[data-menubar-item]');
  }
  handleHover(event) {
    const item = event.currentTarget;
    if (item) {
      this.setItemCustomStyles(item, [{
        cssStyleName: 'background-color',
        customStyleName: 'background-hover'
      }, {
        cssStyleName: 'color',
        customStyleName: 'text-hover-color'
      }]);
    }
  }
  handleHoverOut(event) {
    const item = event.currentTarget;
    this.setItemCustomStyles(item, [{
      cssStyleName: 'background-color',
      customStyleName: 'background-color'
    }, {
      cssStyleName: 'color',
      customStyleName: 'text-color'
    }]);
  }
  handleParentClick(event) {
    event.preventDefault();
    this.handleFocus(event);
    this.setFocusOnFirstSubMenuItem = true;
    this.setFocusOnLastSubMenuItem = false;
    this.handleParentSelect(event, false);
  }
  handleParentSelect(event, reset) {
    const itemId = event?.currentTarget?.dataset?.id;
    if (itemId) {
      const item = this.findItem(itemId);
      this._isMoreMenu = this.isItemMoreMenu(itemId);
      this.deselectSelectedItem();
      this.setFocusToMenuItem(itemId, reset || !item?.isSelected);
    }
  }
  handleLeafClick(event) {
    event.preventDefault();
    this.closeSubMenus();
    this.fireNavigationEvent(event);
  }
  handleLeafKeyDown(event) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        this.handleLeafClick(event);
        break;
      default:
        break;
    }
  }
  handleNavClick(event) {
    event.preventDefault();
    if (event.target?.hasAttribute('data-menubar')) {
      this.closeSubMenus();
    }
  }
  handleCloseSubmenus(event) {
    const parentId = event.detail.parentItemId;
    const selectedItemId = this.getSelectedItem()?.id;
    if (selectedItemId && selectedItemId === parentId) {
      this.setFocusToMenuItem(parentId, false);
      this.closeSubMenus();
    }
  }
  handleFocus(event) {
    event.preventDefault();
    const targetEl = event.currentTarget;
    this._focusedItemId = targetEl?.dataset?.id;
  }
  handleAppLauncher(event) {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent(SHOW_APP_LAUNCHER, {
      bubbles: true,
      cancelable: true,
      composed: true
    }));
  }
}