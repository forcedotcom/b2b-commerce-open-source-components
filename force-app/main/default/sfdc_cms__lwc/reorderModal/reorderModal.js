import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { startReOrder } from 'commerce/orderApi';
import { refreshCartSummary } from 'commerce/cartApi';
import LABELS from './labels';
export default class ReorderModal extends LightningModal {
  @api
  orderSummaryIdOrRefNumber;
  @api
  cartUrl;
  @api
  accessToken;
  _succeededProductCount = 0;
  _failedProductCount = 0;
  _unaddedProductList = [];
  _errors = false;
  _errorCode;
  _isLoading = false;
  get _modalHeading() {
    if (this._errors) {
      return LABELS.errorScreenHeaderText;
    } else if (this._succeededProductCount === 0 && this._failedProductCount > 0) {
      return LABELS.noItemAvailableInStoreHeaderText;
    } else if (this._failedProductCount > 0) {
      return LABELS.itemsNotAvailableInStoreHeaderText;
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
      orderSummaryId: this.orderSummaryIdOrRefNumber,
      accessToken: this.accessToken,
      cartStateOrId: 'current'
    };
    startReOrder(options).then(data => {
      if (data) {
        this._isLoading = false;
        this._succeededProductCount = data.totalSucceededProductCount;
        this._failedProductCount = data.totalFailedProductCount;
        this._unaddedProductList = data.unaddedProducts || [];
        refreshCartSummary();
      }
    }, error => {
      this._isLoading = false;
      this._errors = true;
      this._errorCode = Array.isArray(error.errors) ? error.errors[0]?.type : error.errors?.type;
    });
  }
  handleViewCart() {
    const viewcart = new CustomEvent('viewcart');
    this.dispatchEvent(viewcart);
    this.handleClose();
  }
  handleClose() {
    this.close('close');
  }
}