import { api, LightningElement, wire } from 'lwc';
import { createWishlistItemAddAction, dispatchAction } from 'commerce/actionApi';
import { handleAddToWishlistErrorWithToast, handleAddToWishlistSuccessWithToast } from 'site/productWishlistUtil';
import { SessionContextAdapter } from 'commerce/contextApi';
import { navigate, NavigationContext } from 'lightning/navigation';
export default class ProductWishlistButtonAdd extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @wire(SessionContextAdapter)
  sessionContext;
  @api
  product;
  @api
  text;
  @api
  type;
  @api
  size;
  @api
  width;
  @api
  alignment;
  get buttonClass() {
    return ['action-button', ...(this.width ? [this.width] : []), ...(this.alignment ? [`align-${this.alignment}`] : [])].join(' ');
  }
  handleAddToWishlist() {
    if (this.product) {
      dispatchAction(this, createWishlistItemAddAction(this.product.id), {
        onSuccess: () => handleAddToWishlistSuccessWithToast(this),
        onError: () => {
          const isLoggedIn = this.sessionContext?.data?.isLoggedIn;
          if (!isLoggedIn) {
            this.navigateToLogin();
          } else {
            handleAddToWishlistErrorWithToast(this);
          }
        }
      });
    }
  }
  get isDisplayable() {
    const prohibitedClasses = ['VariationParent', 'Set'];
    const productClass = this.product?.productClass ?? '';
    return !(Boolean(this.product?.productSellingModels) || prohibitedClasses.includes(productClass));
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