import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import BasePath from '@salesforce/community/basePath';
import Toast from 'site/commonToast';
import { createCartItemAddAction, createWishlistItemDeleteAction, dispatchAction } from 'commerce/actionApi';
import LABELS from './labels';
/**
 * @slot breadcrumb - Breadcrumb navigation trail, rendered above the header.
 * @slot headerLabel - Order template name and item count
 * @slot addAllButton - "Add All to Cart" action control
 * @slot options - Options menu action control
 * @slot description - Order template description, rendered beneath the header.
 * @slot itemsBody - Items grid body beneath the header
 */
export default class OrderTemplateView extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  _labels = LABELS;
  @api
  displayStates;
  @api
  get orderTemplateData() {
    return this._orderTemplateDataRaw;
  }
  set orderTemplateData(value) {
    this._orderTemplateDataRaw = value;
    if (!value) {
      this._normalisedData = undefined;
    } else if (typeof value === 'string') {
      try {
        this._normalisedData = JSON.parse(value);
      } catch {
        this._normalisedData = undefined;
      }
    } else {
      this._normalisedData = value;
    }
  }
  _orderTemplateDataRaw;
  _normalisedData;
  get normalisedData() {
    return this._normalisedData;
  }
  get isLoaded() {
    return this.normalisedData?.Details != null;
  }
  get hasError() {
    return this.normalisedData?.Error === true;
  }
  get hasForcedDisplayState() {
    return (this.displayStates?.length ?? 0) > 0;
  }
  get showBody() {
    return !this.hasError && (this.hasForcedDisplayState || this.isLoaded);
  }
  get showSpinner() {
    return !this.hasForcedDisplayState && !this.isLoaded && !this.hasError;
  }
  get errorSvg() {
    return `${BasePath}/assets/icons/warning-filled.svg#warning-filled`;
  }
  get showHeader() {
    return this.showBody;
  }
  handleAddItemToCart(event) {
    event.stopPropagation();
    const productId = event.detail?.productId;
    const productName = event.detail?.productName;
    if (!productId) {
      return;
    }
    dispatchAction(this, createCartItemAddAction(productId), {
      onError: () => {
        Toast.show({
          label: this._labels.addToCartErrorText.replace('{productName}', productName ?? ''),
          variant: 'error'
        }, this);
      }
    });
  }
  handleRemoveItem(event) {
    event.stopPropagation();
    const wishlistItemId = event.detail?.wishlistItemId;
    const productName = event.detail?.productName;
    if (!wishlistItemId) {
      return;
    }
    dispatchAction(this, createWishlistItemDeleteAction(wishlistItemId), {
      onError: () => {
        Toast.show({
          label: this._labels.removeErrorText.replace('{productName}', productName ?? ''),
          variant: 'error'
        }, this);
      }
    });
  }
  handleTemplateDeleted() {
    if (this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Order_Template_List'
        }
      });
    }
  }
}