import { LightningElement, wire, api } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
export default class QuoteSummaryErrorMessage extends LightningElement {
  static renderMode = 'light';
  @api
  errorHeadingText;
  @api
  errorSubHeadingText;
  @api
  errorButtonText;
  @wire(NavigationContext)
  navContext;
  handleOnClick(event) {
    event.preventDefault();
    event.stopPropagation();
    navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Home'
      }
    });
  }
}