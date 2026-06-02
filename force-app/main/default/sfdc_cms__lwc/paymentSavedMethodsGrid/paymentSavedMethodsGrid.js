import { api, LightningElement, wire, track } from 'lwc';
import { defaultComponentErrorDescription, DeleteActionFailed, DeleteActionSucceed, DefaultActionFailed, DefaultActionSucceed, missingPaymentMethodSetKeyDescription, missingPaymentMethodSetKeyTitle, ShareActionSucceed, ShareActionFailed, UnshareActionFailed, UnshareActionSucceed } from './labels';
import { deleteSavedPaymentMethod, defaultSavedPaymentMethod, getPaymentMethodSet, getSavedPaymentMethods, getSavedPaymentMethodDependents, shareSavedPaymentMethod } from 'experience/paymentApi';
import { AppContextAdapter } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import { getI18nCountries } from 'experience/internationalizationApi';
import { MyAccountProfileAdapter, MyAccountAddressesAdapter } from 'commerce/myAccountApi';
import { buildFullName } from 'site/checkoutInternationalization';
const SAVED_PAYMENT_METHOD_DEFAULT_EVENT_NAME = 'defaultsavedpaymentmethod';
const SAVED_PAYMENT_METHOD_DELETE_EVENT_NAME = 'deletesavedpaymentmethod';
const SAVED_PAYMENT_METHOD_DEPENDENTS_EVENT_NAME = 'payment-saved-payment-method-dependents';
const SAVED_PAYMENT_METHOD_ERROR_EVENT_NAME = 'spmerror';
const SAVED_PAYMENT_METHOD_SHARE_EVENT_NAME = 'sharesavedpaymentmethod';
const PAYMENT_METHOD_SET_RESPONSE_CODES = {
  NOT_FOUND: 'Not Found',
  UNAUTHORIZED: 'Unauthorized'
};
const SAVED_PAYMENT_METHOD_RESPONSE_CODES = {
  FORBIDDEN: 'Forbidden'
};
const defaultSortOrder = 'IsDefaultDesc';
const fallbackRecordsData = Object.freeze({
  items: [],
  hasErrors: null,
  nextPageToken: null,
  nextPageUrl: null
});
export default class PaymentSavedMethodsGrid extends LightningElement {
  static renderMode = 'light';
  _notificationMessage = '';
  _notificationType = '';
  _itemsPerPage = 0;
  _showPageSpinner = false;
  _recordsDataLoaded = false;
  _merchantAccountId;
  _emptyStateTitle = missingPaymentMethodSetKeyTitle;
  _emptyStateDescription = missingPaymentMethodSetKeyDescription;
  _handleErrors = this.handleErrors.bind(this);
  _handleDelete = this.handleDelete.bind(this);
  _handleDefault = this.handleDefault.bind(this);
  _handleShare = this.handleShare.bind(this);
  _handleDependents = this.handleDependents.bind(this);
  _recordsData = fallbackRecordsData;
  _paymentMethodSetId;
  _paymentMethodSet;
  _expiresOnLabel;
  _rawInternationalizationData;
  _defaultCountry;
  _userEmail;
  hash;
  _pendingDependentsRecordId;
  _pendingDependentsCallback;
  _excludeUnsupportedCountries = false;
  _addressType = 'Billing';
  _showOnlyDefaultAddress = true;
  _billingDetails = {
    isDefault: false,
    address: {
      country: '',
      name: '',
      line1: ''
    }
  };
  @api
  preferLegacyForms;
  @track
  _hasAccess = true;
  hasNextPage = true;
  pageToken = '';
  savedPaymentMethods = [];
  sortOrder = defaultSortOrder;
  @api
  get paymentMethodSetId() {
    return this._paymentMethodSetId;
  }
  set paymentMethodSetId(value) {
    this._paymentMethodSetId = value;
  }
  @api
  get itemsPerPage() {
    return `${this._itemsPerPage}`;
  }
  set itemsPerPage(value) {
    this._itemsPerPage = Number(value);
  }
  @api
  get expiresOnLabel() {
    return this._expiresOnLabel;
  }
  set expiresOnLabel(value) {
    this._expiresOnLabel = value;
  }
  @api
  itemSpacing;
  @api
  emptyMessageTitle;
  @api
  cardDefaultBadgeColor;
  @api
  cardExpiredBadgeColor;
  @api
  cardExpiredLabel;
  @api
  cardExpiredBorderRadius;
  @api
  cardDefaultBorderRadius;
  @api
  cardDefaultLabel;
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
  showAllStates = false;
  @api
  sepaDebitMandate;
  @api
  headerLabel;
  @api
  displayAddButton;
  @api
  addButtonLabel;
  @api
  previewState;
  @api
  get recordsData() {
    return this._recordsData;
  }
  set recordsData(value) {
    this._recordsDataLoaded = true;
    this._recordsData = value;
  }
  get merchantAccountId() {
    return this._merchantAccountId;
  }
  get hasAccess() {
    return this._hasAccess;
  }
  get disableSave() {
    return !this._billingDetails.isDefault;
  }
  get effectiveAccountId() {
    return this.wireSessionContext?.data?.effectiveAccountId;
  }
  get showNoPaymentMethodSetMessage() {
    return !this.paymentMethodSetId || this.paymentMethodSetId.length === 0;
  }
  get showCardsGrid() {
    return this._recordsDataLoaded && !this.showNoPaymentMethodSetMessage && (this.merchantAccountId || '').length > 0;
  }
  get showPageSpinner() {
    return !this.showAllStates && (this._showPageSpinner || !this._recordsDataLoaded);
  }
  get billingDetails() {
    return this._billingDetails;
  }
  get paymentMethodSet() {
    return this._paymentMethodSet;
  }
  connectedCallback() {
    this.addEventListener(SAVED_PAYMENT_METHOD_ERROR_EVENT_NAME, this._handleErrors);
    this.addEventListener(SAVED_PAYMENT_METHOD_DELETE_EVENT_NAME, this._handleDelete);
    this.addEventListener(SAVED_PAYMENT_METHOD_DEFAULT_EVENT_NAME, this._handleDefault);
    this.addEventListener(SAVED_PAYMENT_METHOD_SHARE_EVENT_NAME, this._handleShare);
    this.addEventListener(SAVED_PAYMENT_METHOD_DEPENDENTS_EVENT_NAME, this._handleDependents);
  }
  disconnectedCallback() {
    this.removeEventListener(SAVED_PAYMENT_METHOD_ERROR_EVENT_NAME, this._handleErrors);
    this.removeEventListener(SAVED_PAYMENT_METHOD_DELETE_EVENT_NAME, this._handleDelete);
    this.removeEventListener(SAVED_PAYMENT_METHOD_DEFAULT_EVENT_NAME, this._handleDefault);
    this.addEventListener(SAVED_PAYMENT_METHOD_SHARE_EVENT_NAME, this._handleShare);
    this.removeEventListener(SAVED_PAYMENT_METHOD_DEPENDENTS_EVENT_NAME, this._handleDependents);
  }
  handleErrors(event) {
    event.stopPropagation();
    const mesg = event.detail?.error?.message;
    this._notificationMessage = mesg;
    this._notificationType = 'error';
  }
  handleShowMoreItems(event) {
    event.stopPropagation();
    if (this.showAllStates) {
      return;
    }
    this._itemsPerPage = event.detail.pageSize;
    this.pageToken = event.detail.nextPageToken;
  }
  handleNewSPMAdded(event) {
    event.stopPropagation();
    this.hash = event.detail.hash;
  }
  handleDelete(event) {
    event.stopPropagation();
    this._showPageSpinner = true;
    const eventDetails = event.detail;
    deleteSavedPaymentMethod({
      savedPaymentMethodId: eventDetails.recordId,
      merchantAccountId: this.merchantAccountId,
      effectiveAccountId: this.effectiveAccountId
    }).then(() => {
      this.savedPaymentMethods = this.savedPaymentMethods?.filter(item => item.id !== eventDetails.recordId);
      this._showPageSpinner = false;
      this._notificationType = 'success';
      this._notificationMessage = DeleteActionSucceed.replace('{0}', `${eventDetails.recordTitle}`);
    }).catch(() => {
      this._showPageSpinner = false;
      this._notificationMessage = DeleteActionFailed.replace('{0}', `${eventDetails.recordTitle}`);
      this._notificationType = 'error';
    });
  }
  handleDependents(event) {
    event.stopPropagation();
    this._showPageSpinner = true;
    const {
      recordId,
      dependents
    } = event.detail;
    this._pendingDependentsCallback = dependents;
    this._pendingDependentsRecordId = recordId;
  }
  @wire(getSavedPaymentMethodDependents, {
    savedPaymentMethodId: '$_pendingDependentsRecordId',
    merchantAccountId: '$merchantAccountId',
    effectiveAccountId: '$effectiveAccountId'
  })
  wireSavedPaymentMethodDependents({
    data,
    error,
    loaded
  }) {
    if (!this._pendingDependentsRecordId || !this._pendingDependentsCallback || !loaded) {
      return;
    }
    const callback = this._pendingDependentsCallback;
    this._pendingDependentsRecordId = undefined;
    this._pendingDependentsCallback = undefined;
    this._showPageSpinner = false;
    callback(error ? undefined : data);
  }
  handleDefault(event) {
    event.stopPropagation();
    this._showPageSpinner = true;
    const eventDetails = event.detail;
    defaultSavedPaymentMethod({
      savedPaymentMethodId: eventDetails.recordId,
      merchantAccountId: this.merchantAccountId,
      effectiveAccountId: this.effectiveAccountId,
      markAsDefault: eventDetails.markAsDefault
    }).then(() => {
      const updatedPaymentMethods = this.savedPaymentMethods?.map(item => ({
        ...item,
        isDefault: item.id === eventDetails.recordId
      }));
      updatedPaymentMethods?.sort((a, b) => {
        if (a.isDefault && !b.isDefault) {
          return -1;
        }
        if (!a.isDefault && b.isDefault) {
          return 1;
        }
        return 0;
      });
      this.savedPaymentMethods = updatedPaymentMethods;
      this._showPageSpinner = false;
      this._notificationType = 'success';
      this._notificationMessage = DefaultActionSucceed.replace('{0}', `${eventDetails.recordTitle}`);
    }).catch(() => {
      this._showPageSpinner = false;
      this._notificationMessage = DefaultActionFailed.replace('{0}', `${eventDetails.recordTitle}`);
      this._notificationType = 'error';
    });
  }
  handleShare(event) {
    event.stopPropagation();
    this._showPageSpinner = true;
    const eventDetails = event.detail;
    shareSavedPaymentMethod({
      savedPaymentMethodId: eventDetails.recordId,
      merchantAccountId: this.merchantAccountId,
      effectiveAccountId: this.effectiveAccountId,
      markAsShared: eventDetails.markAsShared
    }).then(() => {
      const updatedPaymentMethods = this.savedPaymentMethods?.map(item => ({
        ...item,
        isSharedWithinSameAccount: item.id === eventDetails.recordId ? eventDetails.markAsShared : item.isSharedWithinSameAccount
      }));
      this.savedPaymentMethods = updatedPaymentMethods;
      this._showPageSpinner = false;
      this._notificationType = 'success';
      this._notificationMessage = eventDetails.markAsShared ? ShareActionSucceed.replace('{0}', `${eventDetails.recordTitle}`) : UnshareActionSucceed.replace('{0}', `${eventDetails.recordTitle}`);
    }).catch(() => {
      this._showPageSpinner = false;
      this._notificationMessage = eventDetails.markAsShared ? ShareActionFailed.replace('{0}', `${eventDetails.recordTitle}`) : UnshareActionFailed.replace('{0}', `${eventDetails.recordTitle}`);
      this._notificationType = 'error';
    });
  }
  @wire(SessionContextAdapter)
  wireSessionContext;
  @wire(AppContextAdapter)
  appContextHandler(response) {
    this._defaultCountry = response?.data?.country || response?.data?.shippingCountries[0] || '';
    if (response?.data?.checkoutSettings?.isManagedCheckoutEnabled) {
      this._paymentMethodSetId = response?.data?.checkoutSettings?.paymentConfiguration?.paymentMethodSetDevName;
    }
  }
  @wire(MyAccountProfileAdapter)
  getBuyerProfileInfo(response) {
    this._userEmail = response?.data?.email;
  }
  @wire(getI18nCountries, {
    excludeCountryFilter: true
  })
  i18nHandler(response) {
    this._rawInternationalizationData = response?.data;
  }
  @wire(getPaymentMethodSet, {
    developerName: '$paymentMethodSetId'
  })
  wirePaymentMethodSetRecord({
    data,
    error,
    loaded
  }) {
    const loadedWithoutError = loaded && !error && data;
    if (loadedWithoutError) {
      this._merchantAccountId = data?.merchantAccountId;
      this._paymentMethodSet = data;
    } else if (error && loaded) {
      if (error?.message === PAYMENT_METHOD_SET_RESPONSE_CODES.UNAUTHORIZED) {
        this._notificationMessage = defaultComponentErrorDescription;
      } else if (error?.message === PAYMENT_METHOD_SET_RESPONSE_CODES.NOT_FOUND) {
        this._notificationMessage = missingPaymentMethodSetKeyDescription;
      } else if (!this.showAllStates) {
        this._notificationMessage = error?.message;
      }
      if (error.name === 'TypeError') {
        this._notificationType = '';
      } else {
        this._notificationType = 'error';
      }
    }
  }
  @wire(getSavedPaymentMethods, {
    pageSize: '$itemsPerPage',
    sortOrder: '$sortOrder',
    merchantAccountId: '$merchantAccountId',
    effectiveAccountId: '$effectiveAccountId',
    pageToken: '$pageToken',
    hash: '$hash'
  })
  wireSavedPaymentMethodsRecords({
    data,
    error,
    loaded
  }) {
    this._recordsDataLoaded = loaded;
    if (this.showAllStates) {
      this.recordsData?.items?.forEach(item => {
        this.savedPaymentMethods?.push(item);
      });
      return;
    }
    const items = data?.items != null ? data?.items : [];
    const loadedWithoutError = loaded && !error && items;
    if (loadedWithoutError) {
      this._hasAccess = true;
      this._recordsData = {
        ...this.recordsData,
        ...data,
        hasErrors: !!error
      };
      this.recordsData?.items?.forEach(item => {
        const index = this.savedPaymentMethods?.findIndex(method => method.id === item.id);
        if (index === -1) {
          this.savedPaymentMethods?.push(item);
        } else {
          this.savedPaymentMethods?.splice(index, 1, item);
        }
      });
      this.hasNextPage = !!data?.nextPageToken;
    } else if (error && this._merchantAccountId) {
      if (error?.message === SAVED_PAYMENT_METHOD_RESPONSE_CODES.FORBIDDEN) {
        this._hasAccess = false;
      } else {
        this._notificationMessage = error?.message;
        this._notificationType = 'error';
      }
    }
  }
  @wire(MyAccountAddressesAdapter, {
    accountId: '$effectiveAccountId',
    addressType: '$_addressType',
    excludeUnsupportedCountries: '$_excludeUnsupportedCountries',
    defaultOnly: '$_showOnlyDefaultAddress'
  })
  AddressesHandler(response) {
    this._billingDetails.email = this._userEmail ?? undefined;
    if (response?.data?.items && response.data.items.length > 0) {
      const savedAddress = response?.data?.items[0];
      this._billingDetails = {
        ...this._billingDetails,
        isDefault: true,
        name: buildFullName(savedAddress.name, savedAddress.firstName, savedAddress.lastName, savedAddress.country),
        address: {
          ...this._billingDetails.address,
          line1: savedAddress.street ?? '',
          street: savedAddress.street,
          country: savedAddress.country ?? '',
          city: savedAddress.city,
          region: savedAddress.region,
          state: savedAddress.region,
          postalCode: savedAddress.postalCode,
          firstName: savedAddress.firstName,
          lastName: savedAddress.lastName
        }
      };
    }
  }
}