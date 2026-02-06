import { LightningElement } from 'lwc';
import { isPreviewMode } from 'experience/clientApi';
import { errorHeading, errorDescription } from './labels';
import BasePath from '@salesforce/community/basePath';
const ACTIVE_SUBSCRIPTION_STATE = 'Active';

/**
 * @slot emptyBodyForActiveSubscription
 * @slot emptyBodyForPastSubscription
 * @slot subscriptionsRepeater
 */
export default class ProductSubscriptions extends LightningElement {
  static renderMode = 'light';
  _subscriptionsCount;
  _subscriptionsState;
  _error = false;
  _handleStatus = evt => this.handleStatus(evt);
  get showEmptyState() {
    return isPreviewMode || this._subscriptionsCount === 0 && !this._error;
  }
  get isActiveSubscription() {
    return this._subscriptionsState === ACTIVE_SUBSCRIPTION_STATE;
  }
  get hasError() {
    return !isPreviewMode && this._error;
  }
  get errorHeading() {
    return errorHeading;
  }
  get errorDescription() {
    return errorDescription;
  }
  get warningIconPath() {
    return `${BasePath}/assets/icons/warning-filled.svg#warning-filled`;
  }
  connectedCallback() {
    this.addEventListener('subscriptionstatechange', this._handleStatus);
  }
  disconnectedCallback() {
    this.removeEventListener('subscriptionstatechange', this._handleStatus);
  }
  handleStatus(event) {
    event.stopPropagation();
    this._subscriptionsCount = event?.detail?.count;
    this._subscriptionsState = event?.detail?.status;
    this._error = event?.detail?.error;
  }
}