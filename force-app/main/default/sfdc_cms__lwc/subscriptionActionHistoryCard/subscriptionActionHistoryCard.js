import { LightningElement, api } from 'lwc';
import { formatDate } from 'site/subscriptionCardV2';
import LOCALE from '@salesforce/i18n/locale';
import { SUBSCRIPTION_ACTIONS, SUBSCRIPTION_ACTION_ICON_PATH, SUBSCRIPTION_ACTION_FROM_TO_LABELS, SUBSCRIPTION_ACTION_OPERATION_STATUSES, SUBSCRIPTION_ACTION_HISTORY_DISPLAY_DETAILS } from './subscriptionActionHistoryConfig';
import { subscriptionHistoryInitiatedDateLabel, subscriptionHistoryEffectiveDateLabel } from './labels';
const PRICING_TERM_UNITS = {
  MONTHS: 'Months',
  ANNUAL: 'Annual'
};
export default class SubscriptionActionHistoryCard extends LightningElement {
  static renderMode = 'light';
  @api
  actionHistoryRecord;
  @api
  item;
  get pricingTermUnit() {
    return this.item?.sellingModel?.pricingTermUnit;
  }
  getTermUnitLabel(value) {
    let termUnitLabel = '';
    if (this.pricingTermUnit) {
      const isPlural = value !== 1;
      if (this.pricingTermUnit === PRICING_TERM_UNITS.MONTHS) {
        termUnitLabel = isPlural ? 'months' : 'month';
      } else if (this.pricingTermUnit === PRICING_TERM_UNITS.ANNUAL) {
        termUnitLabel = isPlural ? 'years' : 'year';
      }
    }
    return termUnitLabel;
  }
  get statusIcon() {
    const status = this.actionHistoryRecord?.details?.status;
    return status ? SUBSCRIPTION_ACTION_ICON_PATH[status] : '';
  }
  get mainText() {
    let mainText = 'mainText';
    const status = this.actionHistoryRecord?.details?.status;
    const operation = this.actionHistoryRecord?.type;
    if (!operation || !status) {
      return '';
    }
    if (operation === SUBSCRIPTION_ACTIONS.AMEND) {
      const quantityChange = this.actionHistoryRecord?.details.changes.find(change => change.field === 'quantity');
      if (quantityChange) {
        mainText += quantityChange.previousValue > quantityChange.newValue ? 'Negative' : 'Positive';
      }
    }
    const key = mainText;
    return SUBSCRIPTION_ACTION_HISTORY_DISPLAY_DETAILS[operation][status][key];
  }
  getFromToData() {
    const operation = this.actionHistoryRecord?.type;
    const fromToLabels = SUBSCRIPTION_ACTION_FROM_TO_LABELS[operation];
    const fieldName = operation === SUBSCRIPTION_ACTIONS.AMEND ? 'quantity' : 'subscriptionTerm';
    const quantityChange = this.actionHistoryRecord?.details.changes.find(change => change.field === fieldName);
    if (!quantityChange) {
      return null;
    }
    return {
      fromToLabels,
      quantityChange
    };
  }
  get fromText() {
    const data = this.getFromToData();
    if (!data) {
      return '';
    }
    const operation = this.actionHistoryRecord?.type;
    const value = data.quantityChange.previousValue;
    if (operation === SUBSCRIPTION_ACTIONS.RENEW) {
      const termUnit = this.getTermUnitLabel(value);
      return termUnit ? `${data.fromToLabels.from} ${value} ${termUnit}` : `${data.fromToLabels.from} ${value}`;
    }
    return `${data.fromToLabels.from} ${value}`;
  }
  get toText() {
    const data = this.getFromToData();
    if (!data) {
      return '';
    }
    const operation = this.actionHistoryRecord?.type;
    const value = data.quantityChange.newValue;
    if (operation === SUBSCRIPTION_ACTIONS.RENEW) {
      const termUnit = this.getTermUnitLabel(value);
      return termUnit ? `${data.fromToLabels.to} ${value} ${termUnit}` : `${data.fromToLabels.to} ${value}`;
    }
    return `${data.fromToLabels.to} ${value}`;
  }
  get fromToTextExist() {
    const operation = this.actionHistoryRecord?.type;
    return operation === SUBSCRIPTION_ACTIONS.AMEND || operation === SUBSCRIPTION_ACTIONS.RENEW;
  }
  get displayDateTime() {
    const status = this.actionHistoryRecord?.details?.status;
    let dateTime = null;
    let label = '';
    if (status === SUBSCRIPTION_ACTION_OPERATION_STATUSES.IN_PROGRESS || status === SUBSCRIPTION_ACTION_OPERATION_STATUSES.FAILED) {
      dateTime = this.actionHistoryRecord?.performedDateTime || null;
      label = subscriptionHistoryInitiatedDateLabel;
    } else if (status === SUBSCRIPTION_ACTION_OPERATION_STATUSES.SUCCESS) {
      dateTime = this.actionHistoryRecord?.effectiveDateTime || null;
      label = subscriptionHistoryEffectiveDateLabel;
    }
    const formattedDate = dateTime ? formatDate(LOCALE, dateTime) ?? null : null;
    return formattedDate ? `${label}: ${formattedDate}` : null;
  }
}