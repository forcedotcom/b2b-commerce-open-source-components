import { LightningElement, api, wire } from 'lwc';
import { isPreviewMode } from 'experience/clientApi';
import basePath from '@salesforce/community/basePath';
import { AppContextAdapter } from 'commerce/contextApi';
export default class QuoteStatusTracker extends LightningElement {
  static renderMode = 'light';
  @api
  includeDraftStatus;
  @api
  includeNeedsReviewStatus;
  @api
  includeInReviewStatus;
  @api
  includeApprovedStatus;
  @api
  includeRejectedStatus;
  @api
  includePresentedStatus;
  @api
  includeAcceptedStatus;
  @api
  includeDeniedStatus;
  @api
  quoteStatus;
  @api
  trackerCardBorderColor;
  @api
  trackerCardTextColor;
  @api
  trackerCardBorderRadius;
  get _trackerCardBorderRadius() {
    return this.trackerCardBorderRadius ? this.trackerCardBorderRadius + 'px' : '';
  }
  @api
  get customStatuses() {
    return this._customStatuses;
  }
  set customStatuses(value) {
    this._customStatuses = value;
    this._parseCustomStatuses();
  }
  _customStatuses;
  _runtimeStatuses;
  _customStatusesList = [];
  _validApiNamesSet;
  @wire(AppContextAdapter)
  getAppContext({
    data
  }) {
    this._runtimeStatuses = data?.quoteStatuses;
    if (this._runtimeStatuses && this._runtimeStatuses.length > 0) {
      this._validApiNamesSet = new Set(this._runtimeStatuses.map(status => status.apiName));
    } else {
      this._validApiNamesSet = undefined;
    }
  }
  connectedCallback() {
    this._parseCustomStatuses();
  }
  _parseCustomStatuses() {
    if (this._customStatuses) {
      try {
        const apiNames = JSON.parse(this._customStatuses);
        this._customStatusesList = Array.isArray(apiNames) ? apiNames.map(apiName => ({
          apiName: apiName,
          displayValue: apiName
        })) : [];
      } catch (error) {
        console.error('Failed to parse customStatuses:', error);
        this._customStatusesList = [];
      }
    } else {
      this._customStatusesList = [];
    }
  }
  get _defaultStatuses() {
    return [{
      apiName: 'Draft',
      displayValue: 'Draft'
    }, {
      apiName: 'Needs Review',
      displayValue: 'Needs Review'
    }, {
      apiName: 'In Review',
      displayValue: 'In Review'
    }, {
      apiName: 'Approved',
      displayValue: 'Approved'
    }, {
      apiName: 'Rejected',
      displayValue: 'Rejected'
    }, {
      apiName: 'Presented',
      displayValue: 'Presented'
    }, {
      apiName: 'Accepted',
      displayValue: 'Accepted'
    }, {
      apiName: 'Denied',
      displayValue: 'Denied'
    }];
  }
  get _selectedStatuses() {
    const statusMap = {
      Draft: this.includeDraftStatus === true,
      'Needs Review': this.includeNeedsReviewStatus === true,
      'In Review': this.includeInReviewStatus === true,
      Approved: this.includeApprovedStatus === true,
      Rejected: this.includeRejectedStatus === true,
      Presented: this.includePresentedStatus === true,
      Accepted: this.includeAcceptedStatus === true,
      Denied: this.includeDeniedStatus === true
    };
    return this._defaultStatuses.filter(status => statusMap[status.apiName]);
  }
  get _mergedStatuses() {
    const selected = this._selectedStatuses;
    if (isPreviewMode || !this._runtimeStatuses || this._runtimeStatuses.length === 0) {
      return selected;
    }
    const selectedApiNames = new Set(selected.map(s => s.apiName));
    const merged = [];
    for (let i = 0; i < this._runtimeStatuses.length; i++) {
      const runtimeStatus = this._runtimeStatuses[i];
      if (selectedApiNames.has(runtimeStatus.apiName)) {
        merged.push(runtimeStatus);
      }
    }
    return merged;
  }
  get _validatedCustomStatuses() {
    if (this._customStatusesList.length === 0) {
      return [];
    }
    if (isPreviewMode || !this._runtimeStatuses || this._runtimeStatuses.length === 0) {
      return this._customStatusesList;
    }
    const customStatusMap = new Map();
    this._customStatusesList.forEach(status => {
      customStatusMap.set(status.apiName, status);
    });
    const validated = [];
    const invalidStatuses = [];
    for (let i = 0; i < this._runtimeStatuses.length; i++) {
      const runtimeStatus = this._runtimeStatuses[i];
      const customStatus = customStatusMap.get(runtimeStatus.apiName);
      if (customStatus) {
        validated.push(runtimeStatus);
        customStatusMap.delete(runtimeStatus.apiName);
      }
    }
    customStatusMap.forEach(status => {
      invalidStatuses.push(status.apiName);
    });
    if (invalidStatuses.length > 0) {
      console.warn('Invalid custom statuses ignored:', invalidStatuses.join(', '));
    }
    return validated;
  }
  @api
  get quoteStatuses() {
    const baseStatuses = this._mergedStatuses;
    let combined = [...baseStatuses, ...this._validatedCustomStatuses];
    const terminalStatuses = ['Accepted', 'Rejected', 'Denied'];
    const currentStatus = this.quoteStatus;
    if (currentStatus && this._runtimeStatuses && this._runtimeStatuses.length > 0) {
      const currentIndex = this._runtimeStatuses.findIndex(s => s.apiName === currentStatus);
      if (currentIndex !== -1) {
        if (terminalStatuses.includes(currentStatus)) {
          combined = combined.filter(s => s.apiName === currentStatus || !terminalStatuses.includes(s.apiName));
        } else {
          combined = combined.filter(s => {
            if (!terminalStatuses.includes(s.apiName)) {
              return true;
            }
            const terminalIndex = this._runtimeStatuses.findIndex(rs => rs.apiName === s.apiName);
            return terminalIndex !== -1 && terminalIndex > currentIndex;
          });
        }
      }
    }
    if (this._runtimeStatuses && this._runtimeStatuses.length > 0 && !isPreviewMode) {
      return this._sortByRuntimeOrder(combined);
    }
    return combined;
  }
  _sortByRuntimeOrder(statuses) {
    const orderMap = new Map();
    this._runtimeStatuses?.forEach((status, index) => {
      orderMap.set(status.apiName, index);
    });
    return statuses.slice().sort((a, b) => {
      return orderMap.get(a.apiName) - orderMap.get(b.apiName);
    });
  }
  get showTracker() {
    return isPreviewMode || this.quoteStatuses.length > 0;
  }
  get effectiveCurrentStatus() {
    const currentStatus = this.quoteStatus;
    if (!currentStatus) {
      return undefined;
    }
    const selectedStatuses = this.quoteStatuses;
    const isCurrentStatusSelected = selectedStatuses.some(status => status.apiName === currentStatus);
    if (isCurrentStatusSelected) {
      return currentStatus;
    }
    if (!this._runtimeStatuses) {
      return undefined;
    }
    const currentStatusIndex = this._runtimeStatuses.findIndex(status => status.apiName === currentStatus);
    if (currentStatusIndex === -1) {
      return undefined;
    }
    const selectedApiNames = new Set(selectedStatuses.map(s => s.apiName));
    let lastSelectedBeforeCurrent;
    for (let i = currentStatusIndex - 1; i >= 0; i--) {
      const status = this._runtimeStatuses[i];
      if (selectedApiNames.has(status.apiName)) {
        lastSelectedBeforeCurrent = status.apiName;
        break;
      }
    }
    return lastSelectedBeforeCurrent;
  }
  get iconBasePath() {
    return basePath;
  }
  get trackerCustomCssStyles() {
    return `
            --com-c-quote-status-tracker-border-color: ${this.trackerCardBorderColor || 'initial'};
            --com-c-quote-status-tracker-text-color: ${this.trackerCardTextColor || 'initial'};
            --com-c-quote-status-tracker-border-radius: ${this._trackerCardBorderRadius || 'initial'};
        `;
  }
}