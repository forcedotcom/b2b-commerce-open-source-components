import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { termsAndConditionsModalCloseButtonText } from './labels';
export default class LegalTermsandconditionsModal extends LightningModal {
  labels = {
    termsAndConditionsModalCloseButtonText
  };
  @api
  headerText;
  @api
  bodyText;
  handleClose() {
    this.close('close');
  }
}