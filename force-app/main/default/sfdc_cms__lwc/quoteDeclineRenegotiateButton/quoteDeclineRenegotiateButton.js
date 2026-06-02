import { api, LightningElement } from 'lwc';
import QuoteRenegotiateDeclineModal from 'site/quoteDeclineRenegotiateModalUi';
import { isDesignMode } from 'experience/clientApi';
export default class QuoteDeclineRenegotiateButton extends LightningElement {
  static renderMode = 'light';
  @api
  buttonText;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  headerText;
  @api
  subheadingText;
  @api
  notesPlaceholder;
  @api
  declineButtonLabel;
  @api
  renegotiateButtonLabel;
  @api
  quoteStatus;
  @api
  quoteId;
  modalConfiguration = {};
  get content() {
    return this.buttonText ?? 'Renegotiate or Decline';
  }
  get shouldShowButton() {
    if (isDesignMode) {
      return true;
    }
    return (this.quoteStatus ?? '').trim().toLowerCase() === 'approved';
  }
  renderedCallback() {
    this.modalConfiguration = {
      quoteId: this.quoteId,
      headerText: this.headerText,
      subheadingText: this.subheadingText,
      notesPlaceholder: this.notesPlaceholder,
      declineButtonLabel: this.declineButtonLabel,
      renegotiateButtonLabel: this.renegotiateButtonLabel
    };
  }
  handleButtonClick() {
    this.openDeclineRenegotiateModal();
  }
  async openDeclineRenegotiateModal() {
    await QuoteRenegotiateDeclineModal.open({
      size: 'small',
      ...this.modalConfiguration
    });
  }
}