import { LightningElement, api, wire, track } from 'lwc';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import { effectiveAccount } from 'commerce/effectiveAccountApi';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { ACTION_TYPES } from 'site/myAccountUserProfileMenuUi';
import LightningModal from 'lightning/modal';
import CommerceMyAccountSwitcherModal from 'site/myAccountSwitcherModal';
export const MENU_ITEMS_TO_SKIP = ['DataSourceDriven', 'MenuLabel'];
const TEXT_ORIENTATION = {
  leftOfIcon: 'left',
  rightOfIcon: 'right'
};
const LOGOUT_MENU_ITEM = {
  actionType: 'LogOut',
  label: '',
  imageUrl: null,
  subMenu: [],
  actionValue: 'LogOut',
  target: 'CurrentWindow',
  id: ''
};
const HOME_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Home'
  }
};
export default class MyAccountUserProfileMenu extends LightningElement {
  static renderMode = 'light';
  firstName;
  accountId = effectiveAccount.accountId;
  accountName;
  defaultAccountName;
  sessionContextLoaded = false;
  @track
  _state = {
    isLoggedIn: false,
    logoutUrl: ''
  };
  @api
  loginLinkText;
  @api
  loginLinkTextColor;
  @api
  loginLinkTextHoverColor;
  @api
  loginLinkTextOrientation;
  @api
  loginLinkTextDecoration;
  @api
  menuStyle;
  @api
  includeCompanyName = false;
  @api
  iconStyle;
  @api
  userNameTextOrientation;
  @api
  navigationMenuData;
  get userProfileMenuItems() {
    const navMenuItems = this.navigationMenuData;
    LOGOUT_MENU_ITEM.label = this.logOutLabel ?? '';
    return (navMenuItems || []).concat(LOGOUT_MENU_ITEM).filter(item => !MENU_ITEMS_TO_SKIP.includes(item.actionType)).reduce((menuItems, menuItem, index) => {
      if (menuItem.actionValue) {
        const item = {
          ...menuItem,
          id: index.toString()
        };
        menuItems.push(item);
      }
      return menuItems;
    }, []);
  }
  @api
  logOutLabel;
  get showNameInTrigger() {
    return this.menuStyle === 'iconAndName';
  }
  get menuNameTextOrientation() {
    return TEXT_ORIENTATION[this.userNameTextOrientation];
  }
  get loginTextTextOrientation() {
    return TEXT_ORIENTATION[this.loginLinkTextOrientation];
  }
  get _accountName() {
    return this.accountName || this.defaultAccountName;
  }
  get isLoggedInUser() {
    return this._state.isLoggedIn;
  }
  @wire(SessionContextAdapter)
  updateSessionContext({
    data,
    loaded
  }) {
    this.sessionContextLoaded = loaded;
    this.firstName = data?.profile?.firstName;
    this.accountId = data?.effectiveAccountId ?? null;
    this.accountName = data?.effectiveAccountName;
    this._state = {
      ...this._state,
      isLoggedIn: data?.isLoggedIn || false
    };
  }
  @wire(AppContextAdapter)
  updateAppContext({
    data
  }) {
    this._state = {
      ...this._state,
      logoutUrl: data?.logoutUrl ?? ''
    };
  }
  @wire(NavigationContext)
  navContext;
  handleNavigateToPage(event) {
    const selectedMenuItem = event.detail.id;
    if (selectedMenuItem) {
      const menuItem = this.userProfileMenuItems.find(menu => menu.id === selectedMenuItem);
      if (menuItem && menuItem.actionValue) {
        if (menuItem.actionType === ACTION_TYPES.internalLink) {
          this.navContext && navigate(this.navContext, {
            type: 'standard__webPage',
            attributes: {
              url: menuItem.actionValue
            }
          });
        } else if (menuItem.actionType === ACTION_TYPES.logOut) {
          effectiveAccount.update(null, null);
          globalThis.open?.(this._state.logoutUrl, '_self', 'nofollow,noopener,noreferrer');
        } else if (menuItem.actionType === ACTION_TYPES.externalLink) {
          globalThis.open(menuItem.actionValue, menuItem.target === 'NewWindow' ? '_blank' : '_self', 'nofollow,noopener,noreferrer,popup=0');
        } else if (menuItem.actionType === ACTION_TYPES.modal) {
          this.openModal();
        }
      }
    }
  }
  async openModal() {
    const modal = await LightningModal.open({
      component: CommerceMyAccountSwitcherModal,
      listeners: {
        accountselect: e => {
          e.stopPropagation();
          effectiveAccount.update(e.detail.accountId, e.detail.accountName);
          const url = generateUrl(this.navContext, HOME_PAGE_REF);
          globalThis.location?.assign?.(url);
        }
      }
    });
  }
  handleUserLogin() {
    this.navContext && navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
}