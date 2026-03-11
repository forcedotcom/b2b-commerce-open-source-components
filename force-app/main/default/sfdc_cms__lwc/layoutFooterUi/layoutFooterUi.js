import { api, LightningElement } from 'lwc';
export const DEFAULT_FOOTER_BACKGROUND_COLOR = 'var(--dxp-g-root-contrast, transparent)';
export default class LayoutFooterUi extends LightningElement {
  static renderMode = 'light';
  @api
  backgroundColor;
  get _backgroundColor() {
    return this.backgroundColor || DEFAULT_FOOTER_BACKGROUND_COLOR;
  }
  get backgroundStyle() {
    return `background-color: ${this._backgroundColor}`;
  }
}