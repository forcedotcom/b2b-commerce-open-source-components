import { api, LightningElement } from 'lwc';
import { generateStyleProperties } from 'experience/styling';

/**
 * @slot storeLogo
 * @slot icons
 */
export default class LayoutHeaderSimple extends LightningElement {
  static renderMode = 'light';
  @api
  headerIconsColor;
  @api
  headerIconsHoverColor;
  get _customStyles() {
    return generateStyleProperties([{
      name: '--com-c-layout-header-icons-color',
      value: this.headerIconsColor
    }, {
      name: '--com-c-layout-header-icons-color-hover',
      value: this.headerIconsHoverColor
    }]);
  }
}