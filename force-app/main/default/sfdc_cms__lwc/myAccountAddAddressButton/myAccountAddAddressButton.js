import { LightningElement, wire, api } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { generateStyleClass, generateSizeClass, generateStretchClass } from './utils';
export default class MyAccountAddAddressButton extends LightningElement {
  static renderMode = 'light';
  @api
  text;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  alignment;
  get disabled() {
    return false;
  }
  get customButtonClasses() {
    return `slds-button add-address-button_${this.alignment} ${generateStyleClass(this.variant)} ${generateSizeClass(this.size)} ${generateStretchClass(this.width)}`;
  }
  @wire(NavigationContext)
  navContext;
  handleButtonClick() {
    navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Address_Form'
      }
    });
  }
}