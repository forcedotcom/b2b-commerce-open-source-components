import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { Labels } from './labels';
import { navigate } from 'lightning/navigation';
export default class ProductBundleDetailsModal extends LightningModal {
  @api
  headerTitle;
  @api
  currencyIsoCode;
  @api
  orderItem;
  @api
  customCssStyles;
  @api
  productUnavailableMessage;
  @api
  navContext;
  get bundleExpandCollapseLabel() {
    return (this.orderItem?.associatedOrderItems?.length ?? 0) > 1 ? Labels.bundleExpandCollapseLabelPlural : Labels.bundleExpandCollapseLabelSingular;
  }
  handleProductDetailNavigation(event) {
    if (!this.navContext) {
      return;
    }
    this.close();
    navigate(this.navContext, {
      type: 'standard__recordPage',
      attributes: {
        objectApiName: 'Product2',
        recordId: event.detail.productId,
        actionName: 'view'
      }
    });
  }
}