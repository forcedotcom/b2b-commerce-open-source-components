import { LightningElement, api, wire } from 'lwc';
import CreateCartModal from 'site/cartCreateModal';
import { navigate, NavigationContext } from 'lightning/navigation';
import { SessionContextAdapter } from 'commerce/contextApi';
import BasePath from '@salesforce/community/basePath';
import LABELS from './labels';
export default class CartCreateButton extends LightningElement {
  static renderMode = 'light';
  _labels = LABELS;
  _sessionContext;
  _isLoggedIn = false;
  @api
  newCartButtonLabel;
  @api
  cartNameLabel;
  @api
  cartDescriptionLabel;
  @api
  navigateToNewCart;
  get _newCartButtonLabelText() {
    return this.newCartButtonLabel || LABELS.newCartButton;
  }
  get _addIconUrl() {
    return `${BasePath}/assets/icons/add.svg#add`;
  }
  @wire(NavigationContext)
  navContext;
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (!response.loading) {
      this._sessionContext = response.data;
      this._isLoggedIn = this._sessionContext?.isLoggedIn || false;
    }
  }
  static MODAL_DISMISSAL_VALUES = new Set(['error', 'close']);
  async handleOpenCreateCart(event) {
    if (!this._isLoggedIn) {
      event.preventDefault();
      event.stopPropagation();
      this.navigateToLogin();
    } else {
      const result = await CreateCartModal.open({
        size: 'small',
        cartNameLabel: this.cartNameLabel,
        cartDescriptionLabel: this.cartDescriptionLabel
      });
      if (this.navigateToNewCart && result && !CartCreateButton.MODAL_DISMISSAL_VALUES.has(result)) {
        this.navigateToCartDetail(result);
      }
    }
  }
  navigateToCartDetail(cartId) {
    this.navContext && navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Cart_Detail'
      },
      state: {
        recordId: cartId
      }
    });
  }
  navigateToLogin() {
    this.navContext && navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
}