import { api, LightningElement } from 'lwc';
export default class QuoteNotesThread extends LightningElement {
  static renderMode = 'light';
  @api
  notesTitle;
  @api
  notesData;
  get _notes() {
    return this.notesData;
  }
}