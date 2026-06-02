import { LightningElement, api, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import { navigate, NavigationContext } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import { getDefaultChildProductFields, getDefaultProductFields } from './defaultOrderProductFields';
import { formatOrderItems } from 'site/orderDeliveryGroupContainer';
const DEFAULT_SUBSCRIPTION_PILL_BORDER_RADIUS = 8;
export default class OrderLineitem extends LightningElement {
  static renderMode = 'light';
  @api
  showTotal = false;
  @api
  showProductImage = false;
  @api
  showChildProductImage = false;
  @api
  orderItem;
  @api
  productFieldMapping;
  @api
  childProductFieldMapping;
  @api
  otherAdjustmentsLabel;
  @api
  bundleExpandCollapseLabel;
  @api
  adjustmentsAmountTextColor;
  @api
  productUnavailableMessage;
  @api
  totalPriceTextColor;
  @api
  textDisplayInfo;
  @api
  imageAspectRatio;
  @api
  imageSize;
  @api
  subscriptionActivationSuccessLabel;
  @api
  subscriptionActivationInProgressLabel;
  @api
  subscriptionActivationFailedLabel;
  @api
  subscriptionPillFontColor;
  @api
  subscriptionPillBackgroundColor;
  @api
  subscriptionPillBorderRadius;
  get orderLineItem() {
    let formattedOrderItems;
    if (this.orderItem) {
      formattedOrderItems = formatOrderItems([this.orderItem], this.productFieldMapping ? JSON.parse(this.productFieldMapping) : getDefaultProductFields(), this.childProductFieldMapping ? JSON.parse(this.childProductFieldMapping) : getDefaultChildProductFields(), this.showTotal, this.otherAdjustmentsLabel || '')[0];
    }
    return formattedOrderItems;
  }
  get orderProductsCustomCssStyles() {
    return `--com-c-my-account-order-products-image-aspect-ratio: ${this.imageAspectRatio && parseFloat(this.imageAspectRatio) || 1};
            --com-c-order-product-image-object-fit: ${this.imageSize || 'contain'};` + `--com-c-subscription-card-pill-border-radius: ${(this.subscriptionPillBorderRadius ?? DEFAULT_SUBSCRIPTION_PILL_BORDER_RADIUS) + 'px'};` + (this.subscriptionPillFontColor ? `--com-c-subscription-card-pill-font-color: ${this.subscriptionPillFontColor};` : '') + (this.subscriptionPillBackgroundColor ? `--com-c-subscription-card-pill-background-color: ${this.subscriptionPillBackgroundColor};` : '');
  }
  get currencyIsoCode() {
    return this.orderItem?.currencyIsoCode;
  }
  get iconBasePath() {
    return basePath;
  }
  @wire(NavigationContext)
  navContext;
  _rlmSubscriptionEnabled = false;
  @wire(AppContextAdapter)
  updateAppContext({
    data
  }) {
    this._rlmSubscriptionEnabled = Boolean(data?.subscriptionConfig.rlmSubscriptionEnabled);
  }
  handleProductDetailNavigation(event) {
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