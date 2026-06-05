import { api, wire, LightningElement } from 'lwc';
import { generateStyleProperties, generateTextDecorationStyle } from 'experience/styling';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import SubscriptionCancelModal from 'site/subscriptionCancelModal';
import SubscriptionAmendModal from 'site/subscriptionAmendModal';
import SubscriptionRenewModal from 'site/subscriptionRenewModal';
import SubscriptionPaymentMethodModal from 'site/subscriptionPaymentMethodModal';
import { ChildSubscriptionsAdapter } from 'commerce/subscriptionApi';
import SubscriptionHistoryPanel from 'site/subscriptionHistoryPanel';
import { PRODUCT_CLASS } from './constants';
export default class SubscriptionCardBuilder extends LightningElement {
  static renderMode = 'light';
  _effectiveAccountId;
  _childSubscriptionsData = {
    items: []
  };
  _childSubscriptionsError;
  @api
  item;
  @api
  imageSize;
  @api
  imageAspectRatio;
  @api
  subscriptionPillFontColor;
  @api
  subscriptionPillBackgroundColor;
  @api
  subscriptionPillBorderRadius;
  @api
  cancelledPillLabel;
  @api
  expiredPillLabel;
  @api
  showQuantity = false;
  @api
  quantityLabel;
  @api
  showStartDate = false;
  @api
  startDateLabel;
  @api
  showEndDate = false;
  @api
  endDateLabel;
  @api
  showNextBillingDate = false;
  @api
  nextBillingDateLabel;
  @api
  amendButtonLabel;
  @api
  viewHistoryButtonLabel;
  @api
  renewButtonLabel;
  @api
  renewSectionTitle;
  @api
  renewSectionDescription;
  @api
  cancelButtonLabel;
  @api
  retryCancelButtonLabel;
  @api
  subscriptionDetailColor;
  @api
  subscriptionPriceColor;
  _subscriptionPriceTextEmphasis;
  _subscriptionPriceTextEmphasisObject = {};
  @api
  get subscriptionPriceTextEmphasis() {
    return this._subscriptionPriceTextEmphasis;
  }
  set subscriptionPriceTextEmphasis(subscriptionPriceTextEmphasis) {
    this._subscriptionPriceTextEmphasis = subscriptionPriceTextEmphasis;
    this._subscriptionPriceTextEmphasisObject = JSON.parse(this._subscriptionPriceTextEmphasis || '{}');
  }
  @api
  subscriptionTaxLabel;
  @wire(AppContextAdapter)
  updateAppContext({
    data,
    error
  }) {
    this._rlmSubscriptionEnabled = Boolean(data?.subscriptionConfig.rlmSubscriptionEnabled);
  }
  @wire(NavigationContext)
  navigationContext(navContext) {
    this._navContext = navContext;
  }
  @wire(SessionContextAdapter)
  sessionHandler(response) {
    if (response?.data) {
      if (response?.data?.isLoggedIn) {
        this._effectiveAccountId = response?.data?.effectiveAccountId;
      }
    }
  }
  @wire(ChildSubscriptionsAdapter, {
    subscriptionId: '$_subscriptionBundleId',
    effectiveAccountId: '$_effectiveAccountId'
  })
  wireChildSubscriptionsData({
    data,
    error,
    loaded
  }) {
    if (this._subscriptionBundleId && loaded) {
      if (error) {
        this._childSubscriptionsError = error;
        this._childSubscriptionsData = {
          items: []
        };
      } else if (data?.items?.length) {
        this._childSubscriptionsData = data;
        this._childSubscriptionsError = undefined;
      } else {
        this._childSubscriptionsData = {
          items: []
        };
        this._childSubscriptionsError = undefined;
      }
    }
  }
  _rlmSubscriptionEnabled = false;
  _isRenderedInModal = false;
  _navContext;
  get iconBasePath() {
    return basePath;
  }
  get _showChildSubscriptions() {
    return !!this._subscriptionBundleId;
  }
  get _subscriptionBundleId() {
    if (this.item?.product?.productClass === PRODUCT_CLASS.BUNDLE) {
      return this.item?.id || undefined;
    }
    return undefined;
  }
  get _productUrl() {
    if (this.item?.product.id && this._navContext) {
      return generateUrl(this._navContext, {
        type: 'standard__recordPage',
        attributes: {
          objectApiName: 'Product2',
          recordId: this.item.product.id,
          actionName: 'view'
        }
      });
    }
    return undefined;
  }
  get _customStyles() {
    const styles = [{
      name: '--com-c-subscription-card-image-aspect-ratio',
      value: this.imageAspectRatio && parseFloat(this.imageAspectRatio) || 1
    }, {
      name: '--com-c-subscription-card-image-fit',
      value: this.imageSize || 'contain'
    }, {
      name: '--com-c-subscription-card-pill-font-color',
      value: this.subscriptionPillFontColor
    }, {
      name: '--com-c-subscription-card-pill-background-color',
      value: this.subscriptionPillBackgroundColor
    }, {
      name: '--com-c-subscription-card-pill-border-radius',
      value: this.subscriptionPillBorderRadius ? this.subscriptionPillBorderRadius + 'px' : ''
    }, {
      name: '--com-c-subscription-card-detail-font-color',
      value: this.subscriptionDetailColor
    }, {
      name: '--com-c-subscription-card-price-font-color',
      value: this.subscriptionPriceColor
    }, {
      name: '--com-c-subscription-card-price-font-weight',
      value: this._subscriptionPriceTextEmphasisObject.bold ? 'bold' : ''
    }, {
      name: '--com-c-subscription-card-price-font-style',
      value: this._subscriptionPriceTextEmphasisObject.italic ? 'italic' : ''
    }];
    return `${generateStyleProperties(styles)}
                ${generateTextDecorationStyle('--com-c-subscription-card-price-text-decoration', this._subscriptionPriceTextEmphasisObject)}
                `;
  }
  async handleCancel(event) {
    event.stopPropagation();
    await SubscriptionCancelModal.open({
      size: 'small',
      subscriptionId: this.item?.id,
      nextBillingDate: this.item?.billing?.nextBillingDate,
      cancelButtonLabel: this.cancelButtonLabel
    });
  }
  async handleAmend(event) {
    event.stopPropagation();
    await SubscriptionAmendModal.open({
      size: 'small',
      item: this.item,
      quantityLabel: this.quantityLabel,
      taxLabel: this.subscriptionTaxLabel,
      amendButtonLabel: this.amendButtonLabel,
      style: this._customStyles
    });
  }
  async handleViewHistory(event) {
    event.stopPropagation();
    await SubscriptionHistoryPanel.open({
      size: 'medium',
      item: this.item,
      showQuantity: this.showQuantity,
      quantityLabel: this.quantityLabel,
      showStartDate: this.showStartDate,
      startDateLabel: this.startDateLabel,
      showEndDate: this.showEndDate,
      endDateLabel: this.endDateLabel,
      showNextBillingDate: this.showNextBillingDate,
      nextBillingDateLabel: this.nextBillingDateLabel,
      taxLabel: this.subscriptionTaxLabel
    });
  }
  async handleRenew(event) {
    event.stopPropagation();
    await SubscriptionRenewModal.open({
      size: 'small',
      item: this.item,
      quantityLabel: this.quantityLabel,
      renewButtonLabel: this.renewButtonLabel,
      style: this._customStyles
    });
  }
  handleProductNavigation(event) {
    event.stopPropagation();
    if (this.item?.product.id && this._navContext) {
      navigate(this._navContext, {
        type: 'standard__recordPage',
        attributes: {
          objectApiName: 'Product2',
          recordId: this.item.product.id,
          actionName: 'view'
        }
      });
    }
  }
  async handleAddOrUpdateSavedPaymentMethod(event) {
    event.stopPropagation();
    if (!event?.detail?.savedPaymentMethodId) {
      this._navContext && navigate(this._navContext, {
        type: 'comm__namedPage',
        attributes: {
          name: 'AddPaymentMethods'
        },
        state: {
          redirect: 'subscriptions'
        }
      });
      return;
    }
    await SubscriptionPaymentMethodModal.open({
      size: 'small',
      subscriptionId: this.item?.id,
      subscriptionName: this.item?.product?.name,
      savedPaymentMethodId: event.detail?.savedPaymentMethodId,
      merchantAccountId: event.detail?.merchantAccountId
    });
  }
}