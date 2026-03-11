import { LightningElement, api } from 'lwc';
import { isPreviewMode } from 'experience/clientApi';
import { addToCartErrorText, alternativeSpinnerText, removeErrorText } from './labels';
import Toast from 'site/commonToast';
import { createCartItemAddAction, createWishlistItemDeleteAction, dispatchAction } from 'commerce/actionApi';
import { getLabelForToast } from './labelTextGenerator';

/**
 * @slot emptyHeaderLabel
 * @slot emptyHeaderCount
 * @slot emptyBody
 * @slot itemsHeaderLabel
 * @slot itemsHeaderCount
 * @slot itemsBody
 */
export default class ProductWishlist extends LightningElement {
  static renderMode = 'light';
  _isLoadingData = true;
  _actionProcessing = false;
  _wishlistsData;
  @api
  get wishlistsData() {
    return this._wishlistsData;
  }
  set wishlistsData(value) {
    if (value === undefined) {
      this._isLoadingData = true;
    } else if (!this._actionProcessing) {
      this._isLoadingData = false;
    }
    this._wishlistsData = value;
  }
  labels = {
    alternativeSpinnerText
  };
  get showSpinner() {
    return !isPreviewMode && this._isLoadingData;
  }
  get showEmptyState() {
    return isPreviewMode || this.wishlistsData?.WishlistCount === 0 || this.wishlistsData?.Details?.summary?.wishlistProductCount === 0;
  }
  get showItemState() {
    return isPreviewMode || this.wishlistsData !== undefined && !this.showEmptyState;
  }
  setActionState({
    processing,
    loadingData
  }) {
    if (processing) {
      this._isLoadingData = true;
    }
    if (loadingData !== undefined) {
      this._isLoadingData = loadingData;
    }
    this._actionProcessing = processing;
  }
  handleAddToCartClicked(event) {
    event.stopPropagation();
    this.setActionState({
      processing: true
    });
  }
  handleAddToCartSuccess(event) {
    event.stopPropagation();
    this.setActionState({
      processing: false,
      loadingData: false
    });
  }
  handleAddToCartError(event) {
    event.stopPropagation();
    this.setActionState({
      processing: false,
      loadingData: false
    });
  }
  handleDeleteFromWishlistClicked(event) {
    event.stopPropagation();
    this.setActionState({
      processing: true
    });
  }
  handleDeleteFromWishlistSuccess(event) {
    event.stopPropagation();
    this.setActionState({
      processing: false
    });
  }
  handleDeleteFromWishlistError(event) {
    event.stopPropagation();
    this.setActionState({
      processing: false
    });
  }
  handleAddItemToCart(event) {
    this.setActionState({
      processing: true
    });
    dispatchAction(this, createCartItemAddAction(event.detail.productId), {
      onSuccess: () => {
        this.setActionState({
          processing: false,
          loadingData: false
        });
      },
      onError: () => {
        this.setActionState({
          processing: false,
          loadingData: false
        });
        Toast.show({
          label: getLabelForToast(addToCartErrorText, event.detail.productName),
          variant: 'error'
        }, this);
      }
    });
  }
  handleRemoveItem(event) {
    this.setActionState({
      processing: true
    });
    dispatchAction(this, createWishlistItemDeleteAction(event.detail.wishlistItemId), {
      onSuccess: () => this.setActionState({
        processing: false
      }),
      onError: () => {
        this.setActionState({
          processing: false
        });
        Toast.show({
          label: getLabelForToast(removeErrorText, event.detail.productName),
          variant: 'error'
        }, this);
      }
    });
  }
}