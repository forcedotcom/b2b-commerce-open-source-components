import { LightningElement, api, wire } from 'lwc';
import { generateButtonVariantClass, generateButtonSizeClass, generateButtonStretchClass } from 'experience/styling';
import ReorderModal from 'site/reorderModal';
import { CurrentPageReference, NavigationContext, generateUrl, navigate } from 'lightning/navigation';
import { isDesignMode } from 'experience/clientApi';
export const MODAL_SIZE = 'small';
const CART_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Current_Cart'
  }
};
const ORDER_SUMMARY_KEY_PREFIX = '1Os';
function generateAlignmentClass(alignment) {
  if (alignment === 'center') {
    return 'slds-grid_align-center';
  } else if (alignment === 'right') {
    return 'slds-grid_align-end';
  }
  return '';
}
export default class ReorderButton extends LightningElement {
  static renderMode = 'light';
  @api
  orderSummaryId;
  @api
  variant;
  @api
  size;
  @api
  width;
  @api
  alignment;
  @api
  buttonText;
  @api
  orderDetails;
  get showReorderButton() {
    if (isDesignMode) {
      return true;
    }
    const orderSummaryId = this.orderDetails === undefined ? this.orderSummaryId : this.orderDetails?.orderSummaryId;
    return !!orderSummaryId?.startsWith(ORDER_SUMMARY_KEY_PREFIX);
  }
  _cartUrl;
  _accessToken;
  _navContext;
  @wire(NavigationContext)
  navigationContextHandler(navContext) {
    this._cartUrl = generateUrl(navContext, CART_PAGE_REF);
    this._navContext = navContext;
  }
  @wire(CurrentPageReference)
  getCurrentPageReference(pageRef) {
    this._accessToken = pageRef?.state?.accessToken && decodeURIComponent(pageRef.state.accessToken);
  }
  handleViewCart() {
    navigate(this._navContext, CART_PAGE_REF);
  }
  async handleReorder() {
    await ReorderModal.open({
      size: MODAL_SIZE,
      orderSummaryIdOrRefNumber: this.orderSummaryId,
      accessToken: this._accessToken,
      cartUrl: this._cartUrl,
      onviewcart: () => {
        this.handleViewCart();
      }
    });
  }
  get customButtonClasses() {
    return ['slds-button', generateButtonVariantClass(this.variant ?? null), generateButtonSizeClass(this.size ?? null), generateButtonStretchClass(this.width ?? null)].filter(Boolean).join(' ');
  }
  get alignmentClasses() {
    return ['slds-grid', generateAlignmentClass(this.alignment)].filter(Boolean).join(' ');
  }
}