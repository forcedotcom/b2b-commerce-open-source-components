import { LightningElement, api } from 'lwc';
export default class OrderShipmentTrackerUi extends LightningElement {
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
        cssClass += ' bold';
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
  get fetchIcon() {
    return `${this.iconBasePath}/assets/icons/order-shipment-tracker.svg#success`;
  }
  get showShipmentTracker() {
    return this.statuses?.length <= 5;
  }
  get normalizedStatus() {
    return this.statuses.map((status, index) => {
      return {
        ...status,
        completed: this._isStatusCompleted(index),
        textCssClass: this._getStatusTextCssClass(index),
        widthCssClass: this._getCssClassForStatusWidth(index),
        iconCssClass: this._getIconCssClass(index)
      };
    });
  }
  renderedCallback() {
    const currentStatusDiv = this.querySelector('.current-status');
    if (currentStatusDiv) {
      currentStatusDiv.scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }
}