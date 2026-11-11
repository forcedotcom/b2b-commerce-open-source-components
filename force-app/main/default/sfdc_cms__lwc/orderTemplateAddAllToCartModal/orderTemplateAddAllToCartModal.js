import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { addWishlistToCart } from 'commerce/wishlistApi';
import { refreshCartSummary } from 'commerce/cartApi';
import LABELS from './labels';
export default class OrderTemplateAddAllToCartModal extends LightningModal {
  @api
  wishlistId;
  @api
  cartId;
  _succeededProductCount = 0;
  _failedProductCount = 0;
  _failedItems = [];
  _errors = false;
  _isLoading = false;
  _resolvedCartId;
  get _modalHeading() {
    if (this._errors) {
      return LABELS.errorHeaderText;
    } else if (this._succeededProductCount === 0 && this._failedProductCount > 0) {
      return LABELS.allFailedHeaderText;
    } else if (this._failedProductCount > 0) {
      return LABELS.partialHeaderText;
    }
    return LABELS.defaultHeaderText;
  }
  get _closeButtonLabel() {
    return LABELS.closeButtonLabel;
  }
  get _viewCartButtonText() {
    return LABELS.viewCartButtonLabel;
  }
  get _continueShoppingButtonText() {
    return LABELS.continueShoppingButton;
  }
  connectedCallback() {
    this._isLoading = true;
    const options = {
      wishlistId: this.wishlistId
    };
    if (this.cartId) {
      options.cartId = this.cartId;
    }
    addWishlistToCart(options).then(data => {
      if (data) {
        this._isLoading = false;
        this._succeededProductCount = data.productsSucceededCount;
        this._failedProductCount = data.productsFailedCount;
        this._failedItems = data.failedWishlistToCartItems || [];
        this._resolvedCartId = data.cartId;
        refreshCartSummary();
      }
    }, () => {
      this._isLoading = false;
      this._errors = true;
    });
  }
  handleViewCart() {
    this.close({
      action: 'viewcart',
      cartId: this._resolvedCartId
    });
  }
  handleClose() {
    this.close({
      action: 'close'
    });
  }
}