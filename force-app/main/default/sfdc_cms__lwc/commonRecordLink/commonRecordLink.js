import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext, generateUrl } from 'lightning/navigation';
export default class CommonRecordLink extends LightningElement {
  static renderMode = 'light';
  @api
  assistiveText;
  @wire(NavigationContext)
  navigationContextHandler(navContext) {
    this._navContext = navContext;
    this.updateUrl();
  }
  _navContext;
  updateUrl() {
    if (this._navContext && this._recordId && this._objectApiName) {
      this._url = generateUrl(this._navContext, {
        type: 'standard__recordPage',
        attributes: {
          recordId: this._recordId,
          objectApiName: this._objectApiName,
          actionName: 'view'
        }
      });
    }
  }
  @api
  set recordId(recordId) {
    this._recordId = recordId;
    this.updateUrl();
  }
  get recordId() {
    return this._recordId;
  }
  _recordId = '';
  _url = '';
  _objectApiName;
  @api
  set objectApiName(objectApiName) {
    this._objectApiName = objectApiName;
    this.updateUrl();
  }
  get objectApiName() {
    return this._objectApiName;
  }
  @api
  label;
  get _hasRecordId() {
    return (this.recordId || '').length > 0;
  }
  get assistiveTextLabel() {
    return this.assistiveText || '';
  }
  navigateToRecord(event) {
    event.preventDefault();
    if (this._recordId && this._objectApiName && this._navContext) {
      navigate(this._navContext, {
        type: 'standard__recordPage',
        attributes: {
          recordId: this._recordId,
          objectApiName: this._objectApiName,
          actionName: 'view'
        }
      });
    }
  }
}