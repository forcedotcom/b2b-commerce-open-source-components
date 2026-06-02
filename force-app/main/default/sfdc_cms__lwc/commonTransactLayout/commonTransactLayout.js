import { LightningElement, api } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
export default class CommonTransactLayout extends LightningElement {
  static renderMode = 'light';
  @api
  hideSummaryColumn = false;
  @api
  flexDirectionMobile;
  @api
  flexDirectionTablet;
  @api
  flexDirectionDesktop;
  @api
  hideColumnSeparator = false;
  get showColumnSeparator() {
    return !this.hideColumnSeparator && !this.hideSummaryColumn;
  }
  get showSummaryColumn() {
    return !this.hideSummaryColumn;
  }
  get computedClassNames() {
    let computedClassNames = 'transact-layout';
    if (this.hideSummaryColumn) {
      computedClassNames += ' hide-summary-column';
    }
    return computedClassNames;
  }
  get computedStyles() {
    const styles = {
      '--com-c-transact-layout-flex-direction-mobile': this.flexDirectionMobile || '',
      '--com-c-transact-layout-flex-direction-tablet': this.flexDirectionTablet || '',
      '--com-c-transact-layout-flex-direction-desktop': this.flexDirectionDesktop || ''
    };
    return generateStyleProperties(styles);
  }
}