import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { getValueOfNameFieldForEntity } from './entityFieldValueGenerator';
export default class CommonRecordFieldValue extends LightningElement {
  static renderMode = 'light';
  @api
  field;
  @api
  recordId;
  @api
  isLink = false;
  @wire(getRecord, {
    recordId: '$recordId',
    fields: '$fieldsArray'
  })
  _record;
  get fieldsArray() {
    if (this.field) {
      return [this.field];
    }
    return [];
  }
  get valueOfNameField() {
    return getValueOfNameFieldForEntity(this.field, this.recordId, this._record);
  }
  get _objectApiName() {
    return this.field?.objectApiName;
  }
}