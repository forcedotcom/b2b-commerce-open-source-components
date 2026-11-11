import { LightningElement, api, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import basePath from '@salesforce/community/basePath';
import { isPreviewMode } from 'experience/clientApi';
import { ORDER_STATUS, STATUS_TEXT_CLASS_BASE } from './constants';

/**
 * @slot orderStatus
 */
export default class OrderShipmentTracker extends LightningElement {
  static renderMode = 'light';
  @api
  designSubstituteStatuses;
  @api
  orderStatus;
  @api
  statusDisplayText;
  get _statusDisplayText() {
    return this.statusDisplayText || this.orderStatus;
  }
  @api
  subStatus;
  @api
  showOrderFailureMessage = false;
  get showSubStatus() {
    return this.showOrderFailureMessage && !!this.subStatus;
  }
  @api
  showTooltip = false;
  @api
  pendingTooltipMessage;
  @api
  failedTooltipMessage;
  @api
  trackerCardBorderColor;
  @api
  trackerCardTextColor;
  @api
  trackerCardBorderRadius;
  get _trackerCardBorderRadius() {
    return this.trackerCardBorderRadius ? this.trackerCardBorderRadius + 'px' : '';
  }
  _statuses;
  _showTracker = true;
  @wire(AppContextAdapter)
  getAppContext({
    data
  }) {
    this._statuses = data?.orderStatuses;
    this._showTracker = this._statuses !== undefined ? this._statuses?.length > 0 && this._statuses?.length <= 5 : false;
  }
  get orderStatuses() {
    return (this.designSubstituteStatuses !== undefined ? this.designSubstituteStatuses : this._statuses) ?? [];
  }
  get showTracker() {
    return !this.isCartBackedOrder && (isPreviewMode || this._showTracker);
  }
  get isCartBackedOrder() {
    return this.orderStatus === ORDER_STATUS.PENDING || this.orderStatus === ORDER_STATUS.FAILED;
  }
  get showStatusText() {
    return this.isCartBackedOrder || isPreviewMode || !this._showTracker;
  }
  get statusTextClass() {
    if (!this.isCartBackedOrder) {
      return STATUS_TEXT_CLASS_BASE;
    }
    const colorClass = this.orderStatus === ORDER_STATUS.FAILED ? 'order-creation-failed' : 'order-creation-pending';
    return `${STATUS_TEXT_CLASS_BASE} ${colorClass}`;
  }
  get _tooltipMessage() {
    switch (this.orderStatus) {
      case ORDER_STATUS.PENDING:
        return this.pendingTooltipMessage || '';
      case ORDER_STATUS.FAILED:
        return this.failedTooltipMessage || '';
      default:
        return '';
    }
  }
  get showStatusTooltip() {
    return this.showTooltip && this._tooltipMessage.length > 0;
  }
  get iconBasePath() {
    return basePath;
  }
  get trackerCustomCssStyles() {
    return `
            --com-c-order-shipment-tracker-border-color: ${this.trackerCardBorderColor || 'initial'};
            --com-c-order-shipment-tracker-text-color: ${this.trackerCardTextColor || 'initial'};
            --com-c-order-shipment-tracker-border-radius: ${this._trackerCardBorderRadius || 'initial'};
        `;
  }
}