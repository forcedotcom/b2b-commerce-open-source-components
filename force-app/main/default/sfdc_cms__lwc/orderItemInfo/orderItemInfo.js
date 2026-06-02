import { LightningElement, api, wire, track } from 'lwc';
import { NavigationContext, generateUrl } from 'lightning/navigation';
import { withLabel, subscriptionPriceMonthlyLabel, subscriptionPriceYearlyLabel } from './labels';
import { resolve as resolveResource } from 'experience/resourceResolver';
import currencyFormatter from 'site/commonFormatterCurrency';
const NAV_TO_PRODUCT_DETAIL_EVENT = 'navigatetoproductdetailpage';
export default class OrderItemInfo extends LightningElement {
  static renderMode = 'light';
  @api
  currencyCode;
  @api
  productUnavailableMessage;
  @api
  showImage = false;
  @api
  showChildImage = false;
  @api
  showTotal = false;
  @api
  showCgxStyles = false;
  @api
  totalPriceTextColor;
  @api
  bundleExpandCollapseLabel;
  @api
  subscriptionActivationInProgressLabel;
  @api
  subscriptionActivationSuccessLabel;
  @api
  subscriptionActivationFailedLabel;
  @api
  iconBasePath;
  @api
  textDisplayInfo;
  @api
  rlmSubscriptionEnabled = false;
  @wire(NavigationContext)
  navigationContextHandler(navContext) {
    this._navContext = navContext;
    if (this.orderItem?.productId) {
      this.updateUrl();
    }
  }
  _navContext;
  updateUrl() {
    this._productUrl = generateUrl(this._navContext, {
      type: 'standard__recordPage',
      attributes: {
        objectApiName: 'Product2',
        recordId: this._orderItem?.productId,
        actionName: 'view'
      }
    });
  }
  @api
  set orderItem(orderItem) {
    const isProductIdUpdated = Boolean(this._orderItem?.productId !== orderItem?.productId);
    this._orderItem = orderItem;
    if (this._orderItem?.productId && this._navContext && isProductIdUpdated) {
      this.updateUrl();
    }
  }
  get orderItem() {
    return this._orderItem;
  }
  @api
  focusTitle() {
    const productTitle = this.querySelector('site-product-title');
    productTitle?.focusTitle();
  }
  @track
  _orderItem;
  _productUrl = '';
  _isBundleCollapsed = false;
  get _showOrderItem() {
    return this.orderItem ? true : false;
  }
  get _showImage() {
    return Boolean(this.showImage && (this.orderItem?.media?.url || '').length > 0);
  }
  get _showProductTitle() {
    return (this.orderItem?.name || '').length > 0;
  }
  get _showDynamicAttributes() {
    return !!this._dynamicAttributes?.length;
  }
  get _dynamicAttributes() {
    const dynamicAttributes = this.orderItem?.dynamicAttributes;
    if (!dynamicAttributes || Object.keys(dynamicAttributes).length === 0) {
      return [];
    }
    return Object.entries(dynamicAttributes).map(([key, attr]) => {
      return {
        name: key,
        value: attr?.displayValue || attr?.value,
        type: attr?.type,
        label: attr?.name,
        unitOfMeasure: attr?.unitOfMeasure
      };
    });
  }
  get _showVariants() {
    return (this.orderItem?.variants || []).length > 0;
  }
  get _showFields() {
    return (this.orderItem?.fields || []).length > 0;
  }
  get _showFieldsInSecondColumn() {
    return this.orderItem?.fields?.length > 5;
  }
  get _showTotalPrice() {
    return this.showTotal && this.currencyCode && this.orderItem?.totalPrice ? true : false;
  }
  get _productId() {
    return this.orderItem?.isValid ? this.orderItem.productId : undefined;
  }
  get _resolvedUrl() {
    const cmsImageScalingProps = {
      width: 150
    };
    return resolveResource(this.orderItem?.media.url, false, cmsImageScalingProps);
  }
  get _fieldsForColumnOne() {
    return this.orderItem?.fields?.slice(0, 5);
  }
  get _classesForColumnOne() {
    return 'slds-col slds-size_1-of-1 slds-large-size_1-of-2';
  }
  get _fieldsForColumnTwo() {
    return this.orderItem?.fields?.slice(5);
  }
  get _classesForColumnTwo() {
    return 'slds-col slds-size_1-of-1 slds-large-size_1-of-2 slds-order_2 slds-large-order_1';
  }
  get _orderItemClasses() {
    return this.showCgxStyles ? 'slds-grid order-line-item' : 'slds-grid';
  }
  get _isItemASubscriptionProduct() {
    return this.rlmSubscriptionEnabled && Boolean(this._orderItem?.isAssetizable) && (this._orderItem?.productSellingModel?.sellingModelType ? ['Evergreen', 'TermDefined'].includes(this._orderItem?.productSellingModel?.sellingModelType) : false);
  }
  get _formattedTotalPriceValue() {
    if (this._isItemASubscriptionProduct && this._orderItem?.firstPaymentPriceExists) {
      const formattedPriceValue = currencyFormatter(this.currencyCode, this.orderItem?.totalPrice?.toString());
      return this._orderItem?.productSellingModel?.pricingTermUnit === 'Annual' ? subscriptionPriceYearlyLabel.replace('{price}', formattedPriceValue) : subscriptionPriceMonthlyLabel.replace('{price}', formattedPriceValue);
    }
    return currencyFormatter(this.currencyCode, this.orderItem?.totalPrice?.toString());
  }
  get _totalPriceClasses() {
    const textStyle = this.textDisplayInfo?.textStyle;
    const styleClass = textStyle ? `dxp-text-${textStyle}` : 'dxp-text-body';
    return `total-price-text ${styleClass}`;
  }
  get _totalPriceStyle() {
    return this.totalPriceTextColor ? `color: ${this.totalPriceTextColor};` : '';
  }
  get showBundleChildren() {
    return this._orderItem?.itemClass === 'Bundle' && this._orderItem.associatedOrderItems.length > 0;
  }
  get childCount() {
    return this._orderItem.associatedOrderItems.length;
  }
  get childProductsExpandBtnLabel() {
    return this.bundleExpandCollapseLabel?.replace('{0}', `${this.childCount}`) ?? '';
  }
  get withProductLabel() {
    return withLabel.replace('{productName}', `<strong>${this.orderItem?.name}</strong>`);
  }
  get expandBtnIcon() {
    return this.isBundleExpanded ? 'utility:chevronup' : 'utility:chevrondown';
  }
  get bundleSectionId() {
    return `bundle-section-${this.orderItem?.id}`;
  }
  get isBundleExpanded() {
    return !this._isBundleCollapsed;
  }
  get _sellingModelType() {
    return this.orderItem?.productSellingModel?.sellingModelType;
  }
  get _pricingTerm() {
    return this.orderItem?.productSellingModel?.pricingTerm;
  }
  get _pricingTermUnit() {
    return this.orderItem?.productSellingModel?.pricingTermUnit;
  }
  get _subscriptionTerm() {
    return this.orderItem?.subscriptionTerm;
  }
  get _susbscirptionProcessExceptions() {
    return this._orderItem?.processExceptions?.filter(processException => processException.category === 'Order Item Summary To Asset');
  }
  get _subscriptionActivationStatusLabel() {
    if (this._susbscirptionProcessExceptions?.length !== 0 && !this._orderItem?.assetId) {
      return this.subscriptionActivationFailedLabel;
    }
    return this._orderItem?.assetId ? this.subscriptionActivationSuccessLabel : this.subscriptionActivationInProgressLabel;
  }
  get _customSubscriptionActivationStatusIcon() {
    if (this._susbscirptionProcessExceptions?.length !== 0 && !this._orderItem?.assetId) {
      return `${this.iconBasePath}/assets/icons/subscriptions-status.svg#failed`;
    }
    return this._orderItem?.assetId ? `${this.iconBasePath}/assets/icons/subscriptions-status.svg#success` : `${this.iconBasePath}/assets/icons/subscriptions-status.svg#in-progress`;
  }
  get _showSubscriptionActivationStatus() {
    return Boolean(this._isItemASubscriptionProduct && this._subscriptionActivationStatusLabel);
  }
  toggleChildren(event) {
    event.stopPropagation();
    this._isBundleCollapsed = !this._isBundleCollapsed;
  }
  navigateToProductDetailPage(event) {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent(NAV_TO_PRODUCT_DETAIL_EVENT, {
      bubbles: true,
      composed: true,
      detail: {
        productId: this._productId
      }
    }));
  }
}