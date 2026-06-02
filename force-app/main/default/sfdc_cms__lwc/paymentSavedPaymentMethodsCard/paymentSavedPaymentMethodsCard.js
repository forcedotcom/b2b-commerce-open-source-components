import { LightningElement, api } from 'lwc';
import { generateIconTitle, generateIcon, formatExpiredDate } from './utils';
export default class PaymentSavedPaymentMethodsCard extends LightningElement {
  static renderMode = 'light';
  _cardType = '';
  _iconUrl = '';
  @api
  isDefault = false;
  @api
  status;
  @api
  cardLast4;
  @api
  network;
  @api
  expirationYear;
  @api
  bankName;
  @api
  expirationMonth;
  @api
  recordId;
  @api
  accountHolderEmail;
  @api
  accountHolderName;
  @api
  expiredBadgeLabel;
  @api
  expiredBadgeColor;
  @api
  expiredBorderRadius;
  @api
  disabled = false;
  @api
  recordTitle;
  @api
  deleteLabel;
  @api
  defaultLabel;
  @api
  expiresOnLabel;
  @api
  defaultBadgeColor;
  @api
  defaultBorderRadius;
  @api
  defaultBadgeLabel;
  @api
  cardType;
  @api
  isSpmSharingEnabled;
  @api
  isSavedPaymentMethodShared = false;
  @api
  isOwner = false;
  @api
  referenceOwnerId;
  get isExpired() {
    return this.status === 'Expired';
  }
  get showDefaultLabel() {
    return this.isDefault && (this.defaultBadgeLabel || '').length > 0;
  }
  get showExpiredLabel() {
    return this.isExpired && (this.expiredBadgeLabel || '').length > 0;
  }
  get defaultBadgeStyle() {
    return `
            --slds-c-badge-color-background: ${this.defaultBadgeColor};
            --slds-c-badge-radius-border: ${this.defaultBorderRadius || 50}px;
             font-size: 14px;
             font-weight: 500;
        `;
  }
  get expiredBadgeStyle() {
    return `--slds-c-badge-color-background: ${this.expiredBadgeColor};--slds-c-badge-radius-border:${this.expiredBorderRadius || 50}px;`;
  }
  get showFormattedExpiredDateLabel() {
    return !!this.expirationYear && !!this.expirationMonth;
  }
  @api
  get formattedExpiredDate() {
    return formatExpiredDate(this.expirationMonth, this.expirationYear);
  }
  @api
  get formattedDateDisplay() {
    return this.expiresOnLabel ? `${this.expiresOnLabel} : ${this.formattedExpiredDate}` : this.formattedExpiredDate;
  }
  get maskedCardNumber() {
    return '**** ' + this.cardLast4;
  }
  get iconUrl() {
    return generateIcon(this.cardType, this.network);
  }
  get iconTitle() {
    return generateIconTitle(this.cardType, this.network);
  }
}