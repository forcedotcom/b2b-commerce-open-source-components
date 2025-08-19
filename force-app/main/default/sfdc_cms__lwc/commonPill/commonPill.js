import { LightningElement, api } from 'lwc';
import { removePillAssistiveText } from './labels';
const REMOVE_PILL = 'removepill';
export default class CommonPill extends LightningElement {
  static renderMode = 'light';
  @api
  labelText;
  @api
  pillData;
  @api
  showRemoveButton;
  get removePillAccessibilityText() {
    return removePillAssistiveText?.replace('{0}', this.labelText ?? '');
  }
  removePill() {
    const removeEvent = new CustomEvent(REMOVE_PILL, {
      composed: true,
      bubbles: true,
      detail: {
        data: this.pillData
      }
    });
    this.dispatchEvent(removeEvent);
  }
}