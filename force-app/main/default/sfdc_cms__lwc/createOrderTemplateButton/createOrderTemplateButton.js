import { LightningElement, api, wire } from 'lwc';
import CreateOrderTemplateModal from 'site/productCreateOrderTemplateModal';
import { navigate, NavigationContext } from 'lightning/navigation';
import { SessionContextAdapter } from 'commerce/contextApi';
import BasePath from '@salesforce/community/basePath';
import LABELS from './labels';
export default class CreateOrderTemplateButton extends LightningElement {
  static renderMode = 'light';
  _labels = LABELS;
  _sessionContext;
  _isLoggedIn = false;
  @api
  orderTemplateListData;
  @api
  newTemplateButtonLabel;
  @api
  templateNameLabel;
  @api
  templateDescriptionLabel;
  @api
  saveButtonLabel;
  @api
  cancelButtonLabel;
  @api
  variant;
  @api
  size;
  @api
  width;
  get _variant() {
    return this.variant || 'primary';
  }
  get _width() {
    return this.width || 'stretch';
  }
  get _newTemplateButtonLabelText() {
    return this.newTemplateButtonLabel || LABELS.newTemplateButton;
  }
  get _addIconUrl() {
    return `${BasePath}/assets/icons/add.svg#add`;
  }
  @wire(NavigationContext)
  navContext;
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (!response.loading) {
      this._sessionContext = response.data;
      this._isLoggedIn = this._sessionContext?.isLoggedIn || false;
    }
  }
  async handleOpenCreateTemplate(event) {
    if (!this._isLoggedIn) {
      event.preventDefault();
      event.stopPropagation();
      this.navigateToLogin();
    } else {
      await CreateOrderTemplateModal.open({
        size: 'small',
        templateNameLabel: this.templateNameLabel,
        templateDescriptionLabel: this.templateDescriptionLabel,
        saveButtonLabel: this.saveButtonLabel,
        cancelButtonLabel: this.cancelButtonLabel
      });
    }
  }
  navigateToLogin() {
    this.navContext && navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
}