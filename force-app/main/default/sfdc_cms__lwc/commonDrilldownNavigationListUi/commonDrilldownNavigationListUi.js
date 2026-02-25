import { api, LightningElement, track } from 'lwc';
import { closeLabel, allLabel, backLabel, compNameLabel } from './labels';
import { mappedStyles, NAVIGATE_EVENT, DEFAULT_ITEM_LIMIT } from './constants';
import { generateConditionalStyles } from 'experience/styling';
import { LookupTable } from './utils';
export default class CommonDrilldownNavigationListUi extends LightningElement {
  static renderMode = 'light';
  _menuItems = [];
  _parentItem;
  _focusOnFirstItem = true;
  _focusOnLastItem = false;
  _isMobileView = false;
  _isBackButtonClicked = false;
  _previousParent;
  _showAnimation = false;
  _drilledDown = 0;
  _focusedListItemIndex = -1;
  _cssClasses = 'slds-p-vertical_small slds-p-horizontal_large slds-truncate';
  _isMoreMenu = false;
  @track
  _menuItemsById;
  @track
  _listStack = [];
  @api
  showBackLabel = false;
  @api
  itemLimit;
  @api
  get menuItems() {
    return this._menuItems;
  }
  set menuItems(value) {
    this._menuItemsById = new LookupTable(value);
    this._menuItems = value;
  }
  @api
  noFocusNextOnClose = false;
  @api
  get parentItem() {
    return this._parentItem;
  }
  set parentItem(value) {
    this._parentItem = value;
    if (value) {
      this._listStack.push(value);
    }
  }
  @api
  get isMoreMenu() {
    return this._isMoreMenu;
  }
  set isMoreMenu(value) {
    this._isMoreMenu = value;
  }
  @api
  get focusOnFirstItem() {
    return this._focusOnFirstItem;
  }
  set focusOnFirstItem(value) {
    this._focusOnFirstItem = value;
  }
  @api
  get focusOnLastItem() {
    return this._focusOnLastItem;
  }
  set focusOnLastItem(value) {
    this._focusOnLastItem = value;
  }
  @api
  get isMobileView() {
    return this._isMobileView;
  }
  set isMobileView(value) {
    this._isMobileView = value;
  }
  @api
  hideCloseIcon = false;
  get showCloseIcon() {
    return this._isMobileView && !this.hideCloseIcon;
  }
  @api
  disableFocusTrap = false;
  get isFocusTrapEnabled() {
    return !this.disableFocusTrap;
  }
  @api
  customThemeStyles;
  get customStyles() {
    return this.getCustomStyles();
  }
  get closeButtonElement() {
    return this.refs?.closeButton;
  }
  get resolvedItemLimit() {
    return typeof this.itemLimit === 'number' ? this.itemLimit : DEFAULT_ITEM_LIMIT;
  }
  getCustomStyles(opts = {
    isHovering: false,
    isActive: false
  }) {
    if (this.customThemeStyles) {
      return generateConditionalStyles(this.customThemeStyles, mappedStyles, opts);
    }
    return '';
  }
  get focusedItem() {
    return this.menuItems[this._focusedListItemIndex];
  }
  get styledVisibleItems() {
    return this.visibleItems.map(item => {
      const hasFocus = this.focusedItem && this.focusedItem.id === item.id;
      const cssClasses = item.active && this._isMobileView ? this._cssClasses + ' isActive' : this._cssClasses;
      const ariaCurrent = item.active && this._isMobileView ? 'page' : undefined;
      return {
        ...item,
        customStyles: this.getCustomStyles({
          isHovering: hasFocus ?? false,
          isActive: item.active ?? false
        }),
        cssClasses,
        ariaCurrent
      };
    });
  }
  get customListStyles() {
    return this.isMoreMenu ? 'position: absolute; right: 0;' + this.getCustomStyles() : this.getCustomStyles();
  }
  get activeClass() {
    return this._drilledDown > 0 ? 'activeMenu' : undefined;
  }
  get backButtonLabel() {
    return (this.showBackLabel ? backLabel : this._parentItem?.label) ?? '';
  }
  get labels() {
    return {
      closeLabel,
      backLabel,
      compNameLabel
    };
  }
  get visibleItems() {
    let items;
    if (!this.parentItem || typeof this.parentItem === 'object' && Object.keys(this.parentItem).length === 0) {
      items = this.menuItems;
    } else {
      items = this._listStack[this._listStack.length - 1]?.subMenu ?? [];
    }
    return items.slice(0, this.resolvedItemLimit);
  }
  get hasProperParentItem() {
    return !!this._parentItem?.href?.length;
  }
  renderedCallback() {
    const listItems = this.menuItemsElements;
    if (listItems.length) {
      if (this._showAnimation) {
        listItems.forEach(item => {
          this.computeSlideDirectionClass(item, 'add');
        });
        this._showAnimation = false;
      }
      if (this._isBackButtonClicked) {
        const parentMenuItem = this.querySelectorAll(`[data-id="${this._previousParent}"]`);
        parentMenuItem[0]?.focus();
        listItems.forEach((listItem, index) => {
          if (listItem === parentMenuItem[0]) {
            this._focusedListItemIndex = index;
          }
        });
        this._isBackButtonClicked = false;
      } else if (this._focusOnFirstItem) {
        if (this._drilledDown === 0 && this.isMobileView) {
          this.closeButtonElement?.focus();
          this._focusedListItemIndex = -1;
        } else {
          listItems[0].focus();
          this._focusedListItemIndex = 0;
        }
        this._focusOnFirstItem = false;
      }
    }
  }
  fireNavigationEvent(event) {
    const itemId = event?.currentTarget?.dataset?.id;
    if (itemId) {
      const item = this._menuItemsById?.findItemById(itemId);
      this.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: {
          menuItemId: itemId,
          type: item?.type,
          href: item?.href,
          target: item?.target,
          pageReference: item?.pageReference
        }
      }));
    }
  }
  fireNavigationEventForAll(event) {
    const targetEl = event?.currentTarget;
    const itemId = targetEl?.dataset?.id;
    const href = targetEl?.getAttribute('href');
    const type = 'InternalLink';
    const pageReference = this.parentItem?.pageReference;
    this.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        menuItemId: itemId,
        type: type,
        href: href,
        pageReference: pageReference
      }
    }));
  }
  handleFocusOut(event) {
    const root = this.refs?.rootContainer;
    if (!this._isMobileView && event.relatedTarget && !root?.contains(event.relatedTarget) && event.relatedTarget.tagName?.toLowerCase() !== 'site-common-drilldown-navigation-list-ui') {
      this.fireCloseNavigationListEvent();
    }
  }
  handleCloseClick() {
    this.fireCloseNavigationListEvent();
  }
  handleParentClick(event) {
    event.stopPropagation();
    const itemId = event?.currentTarget?.dataset?.id;
    if (itemId) {
      const newItem = this._menuItemsById?.findItemById(itemId);
      this._isBackButtonClicked = false;
      this._showAnimation = true;
      this._parentItem = newItem;
      this._listStack.push(newItem);
      this.setDrillDownLevel(this._drilledDown + 1);
      this._focusOnFirstItem = true;
    }
  }
  handleAnimationEnd(event) {
    this.computeSlideDirectionClass(event.target, 'remove');
  }
  computeSlideDirectionClass(element, action) {
    if (action === 'add') {
      element?.classList.add(`slide-${this._isBackButtonClicked ? 'left-to-right' : 'right-to-left'}`);
    } else {
      element?.classList.remove('slide-left-to-right');
      element?.classList.remove('slide-right-to-left');
    }
  }
  handleBack() {
    this._isBackButtonClicked = true;
    this._showAnimation = true;
    this._listStack.pop();
    this._previousParent = this._parentItem?.id;
    this._parentItem = this._listStack[this._listStack.length - 1];
    this.setDrillDownLevel(this._drilledDown - 1);
  }
  handleBackClick(event) {
    event.stopPropagation();
    this.handleBack();
  }
  handleAllClick(event) {
    event.preventDefault();
    this.fireNavigationEventForAll(event);
    this.fireCloseNavigationListEvent();
  }
  handleLeafClick(event) {
    event.preventDefault();
    this.fireNavigationEvent(event);
    this.fireCloseNavigationListEvent();
  }
  handleHoverOrFocus(event) {
    const targetEl = event.currentTarget;
    if (this.customThemeStyles?.['background-hover']) {
      targetEl.style.setProperty('background-color', String(this.customThemeStyles['background-hover']));
      targetEl.style.color = this.customThemeStyles['text-hover-color'];
    }
    targetEl.focus();
  }
  handleHoverOrFocusOut(event) {
    const targetEl = event.currentTarget;
    if (this.customThemeStyles?.['background-color']) {
      targetEl.style.setProperty('background-color', String(this.customThemeStyles['background-color']));
      targetEl.style.color = this.customThemeStyles['text-color'];
    }
  }
  resetListStackToFirstLevel() {
    while (this._listStack.length > 1) {
      this._listStack.pop();
    }
    this._drilledDown = 0;
    this.setDrillDownLevel(0);
    this._parentItem = this._listStack[0];
  }
  setDrillDownLevel(level) {
    this._drilledDown = level;
    this.dispatchEvent(new CustomEvent('levelchange', {
      detail: {
        level: this._drilledDown
      }
    }));
  }
  get showBackButton() {
    return this._drilledDown > 0;
  }
  get navMenuLabel() {
    return this.parentItem ? this.parentItem.label : '';
  }
  get allLabel() {
    return allLabel.replace('{categoryName}', this.navMenuLabel);
  }
  get menuItemsElements() {
    return this.querySelectorAll('[data-menulist-item]');
  }
  handleCommonKeyDown(event) {
    switch (event.key) {
      case 'Esc':
      case 'Escape':
        if (this.showBackButton) {
          event.stopPropagation();
          this.handleBack();
        } else {
          this.fireCloseNavigationListEvent();
        }
        event.preventDefault();
        break;
      default:
        break;
    }
  }
  handleLeafKeyDown(event) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        this.handleLeafClick(event);
        event.preventDefault();
        break;
      default:
        this.handleCommonKeyDown(event);
        break;
    }
  }
  handleParentKeyDown(event) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        this._focusedListItemIndex = 0;
        this._focusOnFirstItem = true;
        this.handleParentClick(event);
        event.preventDefault();
        break;
      default:
        this.handleCommonKeyDown(event);
        break;
    }
  }
  handleBackKeyDown(event) {
    if (event.key !== 'Tab') {
      event.preventDefault();
    }
    switch (event.key) {
      case 'Enter':
      case ' ':
        this.handleBack();
        break;
      default:
        this.handleCommonKeyDown(event);
        break;
    }
  }
  handleAllKeyDown(event) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        this.fireNavigationEventForAll(event);
        this.fireCloseNavigationListEvent();
        event.preventDefault();
        break;
      default:
        this.handleCommonKeyDown(event);
        break;
    }
  }
  fireCloseNavigationListEvent() {
    this.resetListStackToFirstLevel();
    if (this._isMobileView) {
      this.dispatchEvent(new CustomEvent('closesubmenus', {
        bubbles: true
      }));
    } else if (this.parentItem?.id) {
      this.dispatchEvent(new CustomEvent('closesubmenus', {
        bubbles: true,
        detail: {
          parentItemId: this.parentItem.id
        }
      }));
    }
  }
}