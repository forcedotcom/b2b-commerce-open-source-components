import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import { defaultButtonLabel } from './labels';

/**
 * @slot errorMessageText
 */
export default class QuoteConfirmationErrorMessage extends LightningElement {
  static renderMode = 'light';
  @api
  buttonText;
  get displayButtonText() {
    return this.buttonText || defaultButtonLabel;
  }
  iconPath = `${basePath}/assets/icons/exclamation-outline.svg#exclamation-outline`;
  @wire(NavigationContext)
  navContext;
  navigateToMyQuotesPage() {
    if (this.navContext) {
      navigate(this.navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'Quote_Summary_List'
        }
      });
    }
  }
  handleOnClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.navigateToMyQuotesPage();
  }
}