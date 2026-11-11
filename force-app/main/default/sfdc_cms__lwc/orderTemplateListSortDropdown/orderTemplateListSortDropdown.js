import { LightningElement, api } from 'lwc';
import sortByLabel from '@salesforce/label/site.orderTemplateListSortDropdown.sortByLabel';
import dateAddedNewest from '@salesforce/label/site.orderTemplateListSortDropdown.sortDateCreatedNewest';
import dateAddedOldest from '@salesforce/label/site.orderTemplateListSortDropdown.sortDateCreatedOldest';
export default class OrderTemplateListSortDropdown extends LightningElement {
  static renderMode = 'light';
  @api
  label = sortByLabel;
  @api
  dateCreatedNewestLabel = dateAddedNewest;
  @api
  dateCreatedOldestLabel = dateAddedOldest;
}