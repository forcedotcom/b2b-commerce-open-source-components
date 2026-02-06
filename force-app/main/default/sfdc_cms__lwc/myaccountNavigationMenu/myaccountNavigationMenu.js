import { LightningElement, api } from 'lwc';
/**
 * @slot welcomeMessage
 * @slot navigationMenuItemList
 */
export default class MyaccountNavigationMenu extends LightningElement {
  static renderMode = 'light';
  @api
  backgroundColor;
  get computeStyle() {
    return `--com-c-navigation-menu-container-background-color_wide:${this.backgroundColor || `var(--dxp-g-root)`}`;
  }
}