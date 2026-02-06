import { LightningElement, api, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import basePath from '@salesforce/community/basePath';
import { isPreviewMode } from 'experience/clientApi';

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
    return isPreviewMode || this._showTracker;
  }
  get showStatusText() {
    return isPreviewMode || !this._showTracker;
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