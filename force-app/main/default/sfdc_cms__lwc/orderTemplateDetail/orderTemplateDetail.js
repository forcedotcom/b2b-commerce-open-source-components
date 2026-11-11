import { LightningElement, api } from 'lwc';
/**
 * @slot breadcrumb
 * @slot headerLabel
 * @slot addAllButton
 * @slot options
 * @slot description
 * @slot itemsBody
 */
export default class OrderTemplateDetail extends LightningElement {
  static renderMode = 'light';
  @api
  displayStates;
  @api
  orderTemplateData;
}