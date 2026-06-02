import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { AriaEditLabel, AriaDeleteLabel } from './labels';
import MyAccountAddressDeleteConfirmationModal from 'site/myAccountAddressDeleteConfirmationModal';
import { SessionContextAdapter } from 'commerce/contextApi';
export default class MyAccountAddressFooter extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @api
  editLabel;
  @api
  deleteLabel;
  @api
  addressId = '';
  @api
  disable = false;
  @api
  addressName = '';
  isPreviewMode = false;
  @wire(SessionContextAdapter)
  updateSessionContext({
    data
  }) {
    this.isPreviewMode = data?.isPreview === true;
  }
  async handleDeleteAddressClick(event) {
    event.stopPropagation();
    const result = await MyAccountAddressDeleteConfirmationModal.open({
      addressId: this.addressId,
      isPreviewMode: this.isPreviewMode,
      size: 'small'
    });
    return result;
  }
  handleEditAddressClick() {
    navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Address_Form'
      },
      state: {
        addressId: this.addressId
      }
    });
  }
  get ariaEditLabel() {
    return AriaEditLabel.replace('{editLabel}', `${this.editLabel}`).replace('{addressName}', `${this.addressName}`);
  }
  get ariaDeleteLabel() {
    return AriaDeleteLabel.replace('{deleteLabel}', `${this.deleteLabel}`).replace('{addressName}', `${this.addressName}`);
  }
  @api
  focusCell() {
    this.refs?.editAddressButton?.focus();
  }
}