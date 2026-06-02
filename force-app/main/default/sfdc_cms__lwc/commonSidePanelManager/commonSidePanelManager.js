import { LightningElement, api } from 'lwc';
/**
 * @slot storefrontChat - slot for the storefront chat content.
 */
export default class CommonSidePanelManager extends LightningElement {
  static renderMode = 'light';
  @api
  displayStates = ['storefrontChat'];
  @api
  shopperAgentContextData;
  get showStorefrontChatState() {
    return !!this.displayStates?.includes('storefrontChat');
  }
}