import { wire, api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import { SubscriptionActionHistoryAdapter } from 'commerce/subscriptionApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import { viewHistoryPanelLabel, subscriptionHistoryEmptyHeader, subscriptionHistoryEmptyMessage, subscriptionHistoryLoadError, subscriptionHistoryTryAgainButtonLabel } from './labels';
import BasePath from '@salesforce/community/basePath';
export default class SubscriptionHistoryPanel extends LightningModal {
  static renderMode = 'light';
  _effectiveAccountId;
  _subscriptionActionHistoryData = {
    actions: []
  };
  _subscriptionActionHistoryError;
  @track
  _subscriptionId;
  _loading = true;
  _hasRendered = false;
  @api
  set item(value) {
    this._itemValue = value;
    this._subscriptionId = value?.id || undefined;
  }
  get item() {
    return this._itemValue;
  }
  _itemValue;
  renderedCallback() {
    if (!this._loading && !this._hasRendered) {
      this._hasRendered = true;
      const panelHeading = this.refs?.panelHeading;
      panelHeading?.focus();
    }
  }
  @api
  showQuantity = false;
  @api
  quantityLabel;
  @api
  showStartDate = false;
  @api
  startDateLabel;
  @api
  showEndDate = false;
  @api
  endDateLabel;
  @api
  showNextBillingDate = false;
  @api
  nextBillingDateLabel;
  @api
  taxLabel;
  get _subscriptionHistoryPanelHeaderLabel() {
    return viewHistoryPanelLabel;
  }
  handleCloseSubHistoryPanel(event) {
    event.stopPropagation();
    this.close('close');
  }
  @api
  getActionHistoryData(data) {
    if (!data) {
      return [];
    }
    const actions = data.actions || [];
    const actionsWithKeys = actions.map((action, index) => ({
      ...action,
      key: `${action.type}-${action.details.status}-${index}`
    }));
    return actionsWithKeys;
  }
  @api
  get actionHistoryData() {
    return this.getActionHistoryData(this._subscriptionActionHistoryData);
  }
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (response?.data) {
      if (response?.data?.isLoggedIn) {
        this._effectiveAccountId = response?.data?.effectiveAccountId;
      }
    }
  }
  @wire(SubscriptionActionHistoryAdapter, {
    subscriptionId: '$_subscriptionId',
    effectiveAccountId: '$_effectiveAccountId'
  })
  wireSubscriptionActionHistoryData({
    data,
    error,
    loaded
  }) {
    if (loaded) {
      this._loading = false;
      if (error) {
        this._subscriptionActionHistoryError = error;
        this._subscriptionActionHistoryData = {
          actions: []
        };
      } else if (data?.actions?.length) {
        this._subscriptionActionHistoryData = data;
        this._subscriptionActionHistoryError = undefined;
      } else {
        this._subscriptionActionHistoryData = {
          actions: []
        };
        this._subscriptionActionHistoryError = undefined;
      }
    }
  }
  get showEmptyState() {
    return !this._loading && !this._subscriptionActionHistoryError && this._subscriptionActionHistoryData?.actions?.length === 0;
  }
  get isNotEmpty() {
    return !this._loading && !this._subscriptionActionHistoryError && this._subscriptionActionHistoryData?.actions?.length > 0;
  }
  get emptySvg() {
    return `${BasePath}/assets/images/empty-search.svg`;
  }
  get errorSvg() {
    return `${BasePath}/assets/icons/warning-outline.svg`;
  }
  get emptyHeader() {
    return subscriptionHistoryEmptyHeader;
  }
  get emptyDescription() {
    return subscriptionHistoryEmptyMessage;
  }
  get loadErrorMessage() {
    return subscriptionHistoryLoadError;
  }
  get retryButtonLabel() {
    return subscriptionHistoryTryAgainButtonLabel;
  }
  get isLoading() {
    return this._loading;
  }
  handleRetryClick() {
    this._loading = true;
    this._subscriptionId = undefined;
    setTimeout(() => {
      this._subscriptionId = this.item?.id || undefined;
    }, 0);
  }
  get hasWireError() {
    return !this._loading && !!this._subscriptionActionHistoryError;
  }
}