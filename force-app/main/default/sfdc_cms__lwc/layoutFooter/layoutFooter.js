import { api, LightningElement } from 'lwc';
/**
 * @slot content
 */
export default class LayoutFooter extends LightningElement {
  static renderMode = 'light';
  @api
  backgroundColor;
}