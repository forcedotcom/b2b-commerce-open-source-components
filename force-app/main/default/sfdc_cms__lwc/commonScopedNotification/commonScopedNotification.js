import { LightningElement, api } from 'lwc';
import labels from './labels';
export default class CommonScopedNotification extends LightningElement {
  static renderMode = 'light';
  @api
  type;
  @api
  headerText;
  @api
  bodyText;
  @api
  hideIcon = false;
  get iconAltText() {
    switch (this.type) {
      case 'success':
        return labels.successIconAltText;
      case 'warning':
        return labels.warningIconAltText;
      case 'error':
        return labels.errorIconAltText;
      default:
        return labels.infoIconAltText;
    }
  }
  get _classList() {
    return `notification-container slds-scoped-notification slds-media slds-theme_${this.type}`;
  }
  get iconName() {
    return `utility:${this.type}`;
  }
  get showNotification() {
    return !!this.type && (!!this.headerText || !!this.bodyText);
  }
}