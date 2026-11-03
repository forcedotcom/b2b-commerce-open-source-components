import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import BasePath from '@salesforce/community/basePath';
import LABELS from './labels';
import { CartStatusAdapter, cartReload } from 'commerce/checkoutCartApi';
import { createCartSortUpdateAction, createCartStatusUpdateAction, dispatchAction } from 'commerce/actionApi';
import { defaultSortOrder } from 'site/commonConfig';
const SORT_OPTIONS = [{
  value: 'CreatedDateDesc',
  label: LABELS.dateAddedNew
}, {
  value: 'CreatedDateAsc',
  label: LABELS.dateAddedOld
}, {
  value: 'NameDesc',
  label: LABELS.nameZA
}, {
  value: 'NameAsc',
  label: LABELS.nameAZ
}];
export default class CartView extends LightningElement {
  static renderMode = 'light';
  _labels = LABELS;
  @wire(NavigationContext)
  navContext;
  get _emptyCartImageUrl() {
    return `${BasePath}/assets/images/empty-cart.svg`;
  }
  sortOrder;
  @api
  displayStates;
  @api
  items;
  @api
  showSortOptions = false;
  @api
  messages;
  @api
  cartDetails;
  @api
  newCartButtonLabel;
  @api
  cartNameLabel;
  @api
  cartDescriptionLabel;
  @api
  defaultPillLabel;
  @api
  optionsDropdownLabel;
  @api
  editCartLabel;
  @api
  markAsDefaultLabel;
  @api
  deleteCartLabel;
  @api
  errors;
  @wire(CartStatusAdapter)
  cartStatus;
  sortChanged = false;
  get normalisedCartDetails() {
    if (!this.cartDetails) {
      return undefined;
    }
    if (typeof this.cartDetails === 'string') {
      try {
        return JSON.parse(this.cartDetails);
      } catch {
        return undefined;
      }
    }
    return this.cartDetails;
  }
  get hasDescription() {
    const desc = this.normalisedCartDetails?.description;
    return desc !== null && desc !== undefined;
  }
  get isCartPresent() {
    return !!this.normalisedCartDetails?.cartId;
  }
  get isCartProcessing() {
    const hasError = this.errors && this.errors.length > 0;
    const isItemsLoading = this.items === undefined && !hasError;
    return !!this.cartStatus?.data?.isProcessing || !!this.cartStatus?.loading || isItemsLoading;
  }
  get forceEmptyState() {
    return !!this.displayStates?.includes('empty');
  }
  get forceItemsState() {
    return !!this.displayStates?.includes('items');
  }
  get showEmptyState() {
    return this.isCartPresent && (this.forceEmptyState || Array.isArray(this.items) && !this.items.length);
  }
  get showItemState() {
    return this.forceItemsState || !!this.items?.length;
  }
  get showSpinner() {
    return this.isCartProcessing && !this.forceEmptyState && !this.forceItemsState;
  }
  get message() {
    return this.messages && this.messages.length > 0 ? this.messages[0] : undefined;
  }
  get messageSeverity() {
    return this.message?.severity?.toLocaleLowerCase();
  }
  get sortOptions() {
    return SORT_OPTIONS;
  }
  get selectedSortOrder() {
    return this.sortOrder ?? defaultSortOrder;
  }
  get _showDefaultPill() {
    return this.normalisedCartDetails?.isSecondary === false;
  }
  get _defaultPillLabel() {
    return this.defaultPillLabel || LABELS.defaultCartTypePillLabel;
  }
  handleSortChange(event) {
    this.sortChanged = true;
    const detail = event.detail;
    const sortValue = typeof detail === 'string' ? detail : detail.value;
    if (!sortValue) {
      console.error('Sort change event missing value');
      return;
    }
    this.sortOrder = sortValue;
    dispatchAction(this, createCartSortUpdateAction(this.sortOrder));
  }
  handleCartUpdateStatus(event) {
    dispatchAction(this, createCartStatusUpdateAction(event.detail));
  }
  handleReloadAfterCartMetadataChange() {
    cartReload();
  }
  handleCartDeleted() {
    if (this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Cart_List'
        }
      });
    }
  }
  renderedCallback() {
    if (this.showSortOptions) {
      const sortOptionElement = this.refs?.sortMenu;
      if (this.sortChanged && sortOptionElement) {
        sortOptionElement.focus?.();
        this.sortChanged = false;
      }
    }
  }
}