import { LightningElement } from 'lwc';

/**
 * @slot heading - Slot for the title displayed at the top-left of the header row.
 * @slot newTemplateButton - Slot for the create-template action button at the top-right of the header row.
 * @slot templateList - Slot for the template list view below the header row.
 */
export default class OrderTemplateListContainer extends LightningElement {
  static renderMode = 'light';
}