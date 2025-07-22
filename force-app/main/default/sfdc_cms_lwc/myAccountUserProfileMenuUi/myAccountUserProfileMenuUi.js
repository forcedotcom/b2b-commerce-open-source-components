import { api, LightningElement, track, wire } from 'lwc';
import { NavigationContext, generateUrl } from 'lightning/navigation';
import { generateStyleProperties } from 'experience/styling';
import { cssClassesForMenuItem } from './menuItemClassesGenerator';
import userProfileMenuAltLabelGenerator from './userProfileMenuAltTextGenerator';
import { createInteractionDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
import BasePath from '@salesforce/community/basePath';
const KEY_NAMES = {
  UP: 'Up',
  DOWN: 'Down',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ENTER: 'Enter',
  ESC: 'Esc',
  ESCAPE: 'Escape',
  TAB: 'Tab'
};
export const ACTION_TYPES = {
  internalLink: 'InternalLink',
  externalLink: 'ExternalLink',
  logOut: 'LogOut',
  modal: 'Modal'
};
export default class MyAccountUserProfileMenuUi extends LightningElement {
  static renderMode = 'light';
  @api
  loginButtonText;
  @api
  userName;
  @api
  includeCompanyName = false;
  @api
  companyName;
  @api
  loginTextAlignment;
  @api
  textAlignment;
  @api
  iconStyle;
  @api
  showNameInTrigger = false;
  @api
  menuItems;
  @api
  loginLinkTextColor;
  @api
  loginLinkTextHoverColor;
  @api
  loginLinkTextDecoration;
  @api
  isLoggedIn = false;
  @wire(NavigationContext)
  navContext;
  isMenuItemRenderingTrigger = false;
  renderedCallback() {
    if (this.isMenuItemRenderingTrigger) {
      if (!this._state.focusedMenuItem && this._menuItems.length > 0) {
        this._state.focusedMenuItem = this._menuItems[0].id;
      }
      if (this._state.focusedMenuItem) {
        this.focusMenuItem();
      }
      this.isMenuItemRenderingTrigger = false;
    }
  }
  get _loginPageUrl() {
    return this.navContext ? generateUrl(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    }) : '';
  }
  get _menuItems() {
    return this.menuItems || [];
  }
  get _userDetailsForMobileAndTablet() {
    const userNameObj = {
      id: 'userName',
      label: this.userName || ''
    };
    const companyNameObj = {
      id: 'companyName',
      label: this.companyName || ''
    };
    if (this.includeCompanyName) {
      return [userNameObj, companyNameObj];
    }
    return [userNameObj];
  }
  @track
  _state = {
    loginButtonHover: false,
    menuTriggerHover: false,
    focusedMenuItem: null,
    isMenuExpanded: false
  };
  _menuTriggerLeftBound = 0;
  _menuTriggerTopBound = 0;
  _menuTriggerRightBound = 0;
  get userProfileMenuButtonAltText() {
    return userProfileMenuAltLabelGenerator(this.userName ?? '', this.includeCompanyName ? this.companyName : '');
  }
  get nubbinStyleString() {
    return `left: ${this._menuTriggerLeftBound + 10}px`;
  }
  get dropDownTopAndRightStyleString() {
    return `top: ${this._menuTriggerTopBound + 40}px; right: ${globalThis.innerWidth - this._menuTriggerRightBound}px`;
  }
  get iconSrc() {
    if (this.iconStyle === 'userIcon') {
      return `${BasePath}/assets/icons/user-account.svg#user-account`;
    }
    return `${BasePath}/assets/icons/company.svg#company`;
  }
  get showMenu() {
    return this._state.isMenuExpanded && Boolean(this._menuItems.length);
  }
  get styleMappedMenuItems() {
    return this._menuItems.map(item => {
      const id = item.id;
      const hasFocus = this._state.focusedMenuItem === id.toString();
      let hrefValue = '#';
      if (item.actionType === ACTION_TYPES.internalLink || item.actionType === ACTION_TYPES.externalLink) {
        hrefValue = item.actionValue ?? hrefValue;
      }
      return {
        ...item,
        classes: cssClassesForMenuItem(hasFocus, false),
        hrefValue
      };
    });
  }
  get styleUserDetailsForMobileAndTablet() {
    return this._userDetailsForMobileAndTablet.map((item, index) => {
      const hasBorder = index === this._userDetailsForMobileAndTablet.length - 1;
      return {
        ...item,
        classes: cssClassesForMenuItem(false, hasBorder)
      };
    });
  }
  get menuTriggerContainerClasses() {
    return ['slds-media', 'slds-media_center', 'slds-no-space', 'slds-truncate', ...(this.textAlignment === 'right' ? ['menu-trigger-ctn'] : []), ...(Boolean(this.showNameInTrigger) && Boolean(this.includeCompanyName) ? ['company-name-max-width'] : [])];
  }
  get loginLinkClasses() {
    return ['slds-media', 'slds-media_center', 'slds-no-space', 'slds-truncate', 'guest-login-max-width', ...(this.loginTextAlignment === 'right' ? ['menu-trigger-ctn'] : [])];
  }
  get menuTriggerUserNameClasses() {
    return ['menu-trigger-p', 'slds-text-align_right', 'slds-truncate', ...(this.companyName ? ['slds-m-top_xx-small'] : ['slds-m-vertical_xx-small'])];
  }
  get loginLinkStyle() {
    if (!this.loginLinkTextDecoration) {
      return '';
    }
    const loginTextStyleObject = JSON.parse(this.loginLinkTextDecoration);
    const customStylingProperties = {
      ...(loginTextStyleObject.bold && {
        '--com-c-my-account-user-profile-login-link-font-weight': 'bold'
      }),
      ...(loginTextStyleObject.italic && {
        '--com-c-my-account-user-profile-login-link-font-style': 'italic'
      }),
      ...((loginTextStyleObject.underline || loginTextStyleObject.strike) && {
        '--com-c-my-account-user-profile-login-link-text-decoration': loginTextStyleObject.strike ? 'line-through' : 'underline'
      })
    };
    return generateStyleProperties(customStylingProperties);
  }
  get cssCustomStyleForLoginLink() {
    return generateStyleProperties([{
      name: '--com-c-my-account-user-profile-login-link-color',
      value: this.loginLinkTextColor
    }, {
      name: '--com-c-my-account-user-profile-login-link-hover-color',
      value: this.loginLinkTextHoverColor
    }]);
  }
  get menuDropDownContainerClasses() {
    return ['dropdown-ctn', 'slds-dropdown', 'slds-dropdown_right'];
  }
  handleFocusOrHoverOnMenuItem(event) {
    const eventTarget = event.target.dataset.id;
    if (eventTarget) {
      this._state.focusedMenuItem = eventTarget;
      this.focusMenuItem();
    }
  }
  handleMenuItemClick(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.id;
    if (itemId) {
      this.dispatchNavigateToPageEvent(itemId);
    }
    this.closeMenu();
  }
  handleLoginButtonClick(event) {
    dispatchDataEvent(event.currentTarget, createInteractionDataEvent('login'));
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('userlogin', {
      bubbles: true,
      cancelable: true
    }));
  }
  dispatchMenuToggleEvent(isMenuOpen) {
    this.dispatchEvent(new CustomEvent('menutoggle', {
      bubbles: true,
      cancelable: true,
      detail: {
        isMenuOpen: isMenuOpen
      }
    }));
  }
  get menuContainerClasses() {
    return ['slds-dropdown-trigger', 'slds-dropdown-trigger_click', 'slds-grid', ...(this._state.isMenuExpanded ? ['slds-is-open'] : [])];
  }
  handleMenuTriggerClick() {
    this.toggleMenu(!this._state.isMenuExpanded);
  }
  handleFocusOutOnMenu(event) {
    const eventRelatedTarget = event.relatedTarget;
    if (!eventRelatedTarget || !this.querySelector('.slds-dropdown-trigger')?.contains(eventRelatedTarget)) {
      this.closeMenu();
    }
  }
  toggleMenu(isOpen) {
    this._state.isMenuExpanded = isOpen;
    this.dispatchMenuToggleEvent(isOpen);
    if (isOpen) {
      this.isMenuItemRenderingTrigger = true;
      const menuTrigger = this.refs?.menuButton;
      if (menuTrigger) {
        menuTrigger.focus();
        this._menuTriggerLeftBound = menuTrigger.getBoundingClientRect().left;
        this._menuTriggerTopBound = menuTrigger.getBoundingClientRect().top;
        this._menuTriggerRightBound = menuTrigger.getBoundingClientRect().right;
      }
    } else {
      this._state.focusedMenuItem = null;
    }
  }
  closeMenu() {
    this.toggleMenu(false);
  }
  handleKeyDownOnMenu(event) {
    const key = event.key;
    let preventDefault = true;
    switch (key) {
      case KEY_NAMES.UP:
      case KEY_NAMES.ARROW_UP:
        {
          this.moveFocusOnMenuItem(true);
          break;
        }
      case KEY_NAMES.DOWN:
      case KEY_NAMES.ARROW_DOWN:
        {
          this.moveFocusOnMenuItem(false);
          break;
        }
      case KEY_NAMES.ENTER:
        {
          if (this._state.isMenuExpanded) {
            if (this._state.focusedMenuItem) {
              this.dispatchNavigateToPageEvent(this._state.focusedMenuItem);
              this.closeMenu();
            }
          } else {
            this.toggleMenu(true);
            this.moveFocusOnMenuItem(false);
          }
          break;
        }
      case KEY_NAMES.ESC:
      case KEY_NAMES.ESCAPE:
        {
          this.closeMenu();
          const focusElement = this.refs?.menuButton;
          if (focusElement) {
            focusElement.focus();
          }
          break;
        }
      case KEY_NAMES.TAB:
        {
          if (this._state.isMenuExpanded) {
            this.closeMenu();
            const focusElement = this.refs?.menuButton;
            if (focusElement) {
              focusElement.focus();
            }
          }
          preventDefault = false;
          break;
        }
      default:
        {
          preventDefault = false;
        }
    }
    if (preventDefault) {
      event.preventDefault();
    }
  }
  moveFocusOnMenuItem(moveUp) {
    if (!this._state.isMenuExpanded) {
      this.toggleMenu(true);
    }
    if (this._menuItems.length > 0) {
      const numberOfMenuItems = this._menuItems.length;
      let highlightedIndex = -1;
      if (this._state.focusedMenuItem) {
        highlightedIndex = this._menuItems.findIndex(item => {
          return this._state.focusedMenuItem === item.id.toString();
        });
      }
      let nextHighlightedIndex = -1;
      if (moveUp) {
        nextHighlightedIndex = this.getFocusUpMenuItemIndex(highlightedIndex, numberOfMenuItems);
      } else {
        nextHighlightedIndex = this.getFocusDownMenuItemIndex(highlightedIndex, numberOfMenuItems);
      }
      this._state.focusedMenuItem = this._menuItems[nextHighlightedIndex].id.toString();
      this.focusMenuItem();
    }
  }
  focusMenuItem() {
    const focusMenuItem = this.querySelector(`[data-id='${this._state.focusedMenuItem}']`);
    focusMenuItem?.focus();
  }
  getFocusUpMenuItemIndex(highlightedIndex, numberOfMenuItems) {
    if (highlightedIndex === 0 || highlightedIndex === -1) {
      return numberOfMenuItems - 1;
    }
    return highlightedIndex - 1;
  }
  getFocusDownMenuItemIndex(highlightedIndex, numberOfMenuItems) {
    if (highlightedIndex === -1 || highlightedIndex === numberOfMenuItems - 1) {
      return 0;
    }
    return highlightedIndex + 1;
  }
  dispatchNavigateToPageEvent(itemId) {
    this.dispatchEvent(new CustomEvent('navigatetopage', {
      bubbles: true,
      cancelable: true,
      detail: {
        id: itemId
      }
    }));
  }
}