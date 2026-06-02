import { LightningElement, api, wire } from 'lwc';
import { generateAlignClass, generateSizeClass, generateStretchClass, generateStyleClass } from './showMoreButtonClassGenerator';
import { NoAccess, SharedSPMTabLabel, MySPMTabLabel } from './labels';
import { navigate, NavigationContext } from 'lightning/navigation';
import { createPaymentSpmDataRefreshAction, dispatchAction } from 'commerce/actionApi';
import { createPaymentSpmLoadMoreAction } from 'commerce/actionApi';
import { MYSPM, SHAREDSPM } from './utils';
export default class PaymentSavedMethodsGridUi extends LightningElement {
  _hideAddNewSPMView = false;
  static renderMode = 'light';
  _itemsPerPage = 0;
  ADD_PAYMENT_METHOD_PAGE = 'AddPaymentMethods';
  @api
  paymentMethodSet;
  @api
  effectiveAccountId;
  @api
  itemSpacing;
  @api
  emptyMessageTitle;
  @api
  cardDefaultBadgeColor;
  @api
  cardDefaultBorderRadius;
  @api
  cardDefaultLabel;
  @api
  hasNextPage;
  @api
  cardExpiredBadgeColor;
  @api
  cardExpiredLabel;
  @api
  expiresOnLabel;
  @api
  cardExpiredBorderRadius;
  @api
  footerDeleteLabel;
  @api
  footerDefaultLabel;
  @api
  showMoreButtonLabel;
  @api
  showMoreButtonStyle;
  @api
  showMoreButtonSize;
  @api
  showMoreButtonWidth;
  @api
  showMoreButtonAlign;
  @api
  recordsData;
  @api
  billingDetails;
  @api
  defaultCountry;
  @api
  sepaDebitMandate;
  @api
  preferLegacyForms;
  @api
  rawInternationalizationData;
  @api
  headerLabel;
  @api
  displayAddButton;
  @api
  disableSave = false;
  @api
  addButtonLabel;
  @api
  savedPaymentMethods = [];
  _sharedSavedPaymentMethods = [];
  _activeSavedPaymentMethodTab = '';
  get _savedPaymentMethods() {
    if (this._activeSavedPaymentMethodTab === MYSPM) {
      return this.savedPaymentMethods?.filter(spm => spm.isOwner === true) ?? [];
    } else if (this._activeSavedPaymentMethodTab === SHAREDSPM) {
      return this.savedPaymentMethods?.filter(spm => spm.isOwner === false) ?? [];
    }
    return this.savedPaymentMethods ?? [];
  }
  @api
  get itemsPerPage() {
    return this._itemsPerPage;
  }
  set itemsPerPage(value) {
    this._itemsPerPage = value;
  }
  @api
  hasAccess = false;
  @api
  disableActions = false;
  get disableFooterButtons() {
    return !this.userCanViewData;
  }
  get userCanViewData() {
    return this.hasAccess || this.disableActions;
  }
  get isSpmSharingEnabled() {
    let isSpmSharingEnabled = false;
    if (this.recordsData) {
      isSpmSharingEnabled = this.recordsData.isSharingEnabled ?? false;
    }
    return isSpmSharingEnabled;
  }
  get userHasNoAccessLabel() {
    return NoAccess;
  }
  get sharedSPMTabLabel() {
    return SharedSPMTabLabel;
  }
  get mySPMTabLabel() {
    return MySPMTabLabel;
  }
  get showEmptyState() {
    return !this.hasData && (this.disableActions || this.hasAccess);
  }
  get hasData() {
    return !!this.recordsData?.items && this.recordsData.items?.length > 0;
  }
  handleShowMoreClicked() {
    this.dispatchEvent(new CustomEvent('showmoresavedpaymentmethods', {
      bubbles: true,
      composed: true,
      detail: {
        pageSize: this._itemsPerPage,
        nextPageToken: this.recordsData?.nextPageToken
      }
    }));
    dispatchAction(this, createPaymentSpmLoadMoreAction());
  }
  get gridStyleClass() {
    return `payment-saved-methods-grid payment-saved-methods-grid-gap-${this.itemSpacing || 'small'}`;
  }
  get customButtonClasses() {
    return `slds-button show-more-button ${generateStyleClass(this.showMoreButtonStyle)} ${generateSizeClass(this.showMoreButtonSize)} ${generateStretchClass(this.showMoreButtonWidth)} ${generateAlignClass(this.showMoreButtonAlign)}`;
  }
  get addButtonEnabled() {
    return !!this.displayAddButton;
  }
  get showAddNewSPMView() {
    return this.addButtonEnabled && !this._hideAddNewSPMView && !this.hasData;
  }
  handleCancel() {
    this._hideAddNewSPMView = true;
  }
  handleRedirect() {
    this.dispatchEvent(new CustomEvent('spmadded', {
      bubbles: true,
      composed: true,
      detail: {
        hash: Date.now()
      }
    }));
    dispatchAction(this, createPaymentSpmDataRefreshAction());
  }
  @api
  handleActiveTab(event) {
    if (event) {
      const target = event.target;
      this._activeSavedPaymentMethodTab = target.value;
    }
  }
  @wire(NavigationContext)
  navContext;
  handleAddSPMClicked() {
    navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: this.ADD_PAYMENT_METHOD_PAGE
      }
    });
  }
}