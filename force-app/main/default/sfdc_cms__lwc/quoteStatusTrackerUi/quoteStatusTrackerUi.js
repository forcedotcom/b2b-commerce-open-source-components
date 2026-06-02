import { LightningElement, api } from 'lwc';
export default class QuoteStatusTrackerUi extends LightningElement {
  static renderMode = 'light';
  @api
  get statuses() {
    return this._statuses;
  }
  set statuses(value) {
    this._statuses = value;
  }
  @api
  get currentStatus() {
    return this._currentStatus;
  }
  set currentStatus(value) {
    this._currentStatus = value;
  }
  @api
  iconBasePath;
  _currentStatus;
  _statuses = [];
  _isStatusCompleted(statusIndex) {
    return this._selectedIndex !== -1 && this._selectedIndex !== undefined ? statusIndex <= this._selectedIndex : false;
  }
  get _selectedIndex() {
    return this.statuses?.findIndex(status => status.apiName === this._currentStatus);
  }
  _getStatusTextCssClass(statusIndex) {
    let cssClass = 'text dxp-text-body';
    if (this._selectedIndex !== undefined) {
      if (statusIndex < this._selectedIndex) {
        cssClass += ' previous-status-text';
      } else if (statusIndex === this._selectedIndex) {
        cssClass += ' bold status-text-color';
      }
    }
    return cssClass;
  }
  _getIconCssClass(statusIndex) {
    let cssClass = 'icon';
    if (this._selectedIndex !== undefined) {
      if (statusIndex === this._selectedIndex) {
        cssClass += ' current-status';
      }
    }
    return cssClass;
  }
  _getCssClassForStatusWidth(statusIndex) {
    let cssClass = '';
    if (this.statuses?.length) {
      cssClass = `step slds-size_1-of-${this.statuses.length}`;
      if (this._isStatusCompleted(statusIndex)) {
        cssClass += ' active';
      }
    }
    return cssClass;
  }
  _isRejectedOrDeniedStatus(statusApiName) {
    const rejectedStatuses = ['Rejected', 'Denied', 'rejected', 'denied'];
    return rejectedStatuses.includes(statusApiName);
  }
  _getIconPath(statusApiName) {
    const iconType = statusApiName && this._isRejectedOrDeniedStatus(statusApiName) ? 'error' : 'success';
    return `${this.iconBasePath}/assets/icons/quote-status-tracker.svg#${iconType}`;
  }
  get showShipmentTracker() {
    return this.statuses?.length > 0;
  }
  get normalizedStatus() {
    return this.statuses.map((status, index) => {
      const isRejected = this._isRejectedOrDeniedStatus(status.apiName);
      const isCompleted = this._isStatusCompleted(index);
      const nextStatus = this.statuses[index + 1];
      const nextIsError = nextStatus && this._isRejectedOrDeniedStatus(nextStatus.apiName);
      const nextIsCompleted = nextStatus && this._isStatusCompleted(index + 1);
      const leadsToError = isCompleted && !isRejected && nextIsError && nextIsCompleted;
      const errorTrailingPending = isCompleted && isRejected && nextStatus && !nextIsCompleted;
      const isCurrentStatus = index === this._selectedIndex;
      return {
        ...status,
        completed: isCompleted,
        textCssClass: this._getStatusTextCssClass(index),
        widthCssClass: this._getCssClassForStatusWidth(index),
        iconCssClass: this._getIconCssClass(index),
        iconPath: this._getIconPath(status.apiName),
        dataStatusType: isRejected ? 'error' : 'success',
        dataLeadsToError: leadsToError ? 'true' : undefined,
        dataErrorTrailingPending: errorTrailingPending ? 'true' : undefined,
        assistiveText: `${status.displayValue} - ${isRejected ? 'Rejected' : 'Completed'}`,
        isCurrentStatus: isCurrentStatus ? 'true' : undefined
      };
    });
  }
  renderedCallback() {
    const currentStatusIcon = this.querySelector('[data-current-status="true"]');
    if (currentStatusIcon) {
      currentStatusIcon.scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }
}