import { LightningElement, api, wire } from 'lwc';
import currency from '@salesforce/i18n/currency';
import { transformQuoteToCartItems } from './itemMapperUtil';
import { generateStyleProperties, generateTextFontSize } from 'experience/styling';
import { getDefaultProductFields } from './defaultQuoteProductFields';
import { Labels } from './labels';
import { NavigationContext, navigate } from 'lightning/navigation';
import { buildQuoteLineItemsWithAssociatedLineItems } from './quoteLineItemUtil';
import { formatQuoteItemToOrderItem } from './quoteToOrderItemFormatter';
const DEFAULT_PAGE_SIZE = 10;

/**
 * @slot header
 * @slot showMore
 */
export default class QuoteConfirmationItems extends LightningElement {
  static renderMode = 'light';
  Labels = Labels;
  @api
  items = [];
  @api
  currencyIsoCode;
  @api
  totalPrice;
  get _totalPrice() {
    if (this.totalPrice !== undefined) {
      return this.totalPrice;
    }
    return undefined;
  }
  @api
  productFieldMapping;
  @api
  get pageSize() {
    return this._pageSize;
  }
  set pageSize(value) {
    this._pageSize = value || DEFAULT_PAGE_SIZE;
    this._itemsToLoadCount = value || DEFAULT_PAGE_SIZE;
  }
  @api
  showProductImage = false;
  @api
  removeProductLinks = false;
  @api
  showViewBundleDetail = false;
  @api
  viewBundleDetailLabel;
  @api
  productUnavailableMessage;
  @api
  hideQuantitySelector = false;
  @api
  quantitySelectorLabel;
  @api
  showQuantitySelectorLabel = false;
  @api
  imageAspectRatio;
  @api
  imageSize;
  @api
  productDetailsPillFontColor;
  @api
  productDetailsPillFontSize;
  @api
  productDetailsPillBackgroundColor;
  @api
  productDetailsPillBorderColor;
  @api
  productDetailsPillBorderRadius;
  _pageSize = DEFAULT_PAGE_SIZE;
  _itemsToLoadCount = DEFAULT_PAGE_SIZE;
  _error;
  get _currencyIsoCode() {
    return this.currencyIsoCode || currency;
  }
  get paginationType() {
    if (this.itemsLength > this._itemsToLoadCount) {
      return 'showMore';
    }
    return undefined;
  }
  get productFieldMappingValue() {
    if (!this.productFieldMapping) {
      return getDefaultProductFields();
    }
    try {
      return JSON.parse(this.productFieldMapping);
    } catch (error) {
      return getDefaultProductFields();
    }
  }
  get itemsLength() {
    if (!Array.isArray(this.items)) {
      return 0;
    }
    return this.items.filter(item => !item?.fields?.ParentQuoteLineItemId?.text?.trim()).length;
  }
  get displayShowMore() {
    return this.itemsLength > this._itemsToLoadCount;
  }
  get showItems() {
    return this.itemsLength > 0;
  }
  get showError() {
    return !!this._error;
  }
  get itemsData() {
    if (!Array.isArray(this.items)) {
      return [];
    }
    const productFieldsMapping = this.productFieldMappingValue;
    const allTopLevelItems = transformQuoteToCartItems(this.items, productFieldsMapping, this.productUnavailableMessage);
    return allTopLevelItems.slice(0, this._itemsToLoadCount);
  }
  get cartItemsStyles() {
    const styles = [{
      name: '--com-c-cart-item-image-aspect-ratio',
      value: this.imageAspectRatio && parseFloat(this.imageAspectRatio) || 1
    }, {
      name: '--com-c-cart-item-image-object-fit',
      value: this.imageSize || 'contain'
    }, {
      name: '--com-c-cart-item-product-details-pill-text-color',
      value: this.productDetailsPillFontColor
    }, {
      name: '--com-c-cart-item-product-details-pill-font-size',
      value: generateTextFontSize(this.productDetailsPillFontSize)
    }, {
      name: '--com-c-cart-item-product-details-pill-background-color',
      value: this.productDetailsPillBackgroundColor
    }, {
      name: '--com-c-cart-item-product-details-pill-border-radius',
      value: this.productDetailsPillBorderRadius ? this.productDetailsPillBorderRadius + 'px' : ''
    }, {
      name: '--com-c-cart-item-product-details-pill-border-color',
      value: this.productDetailsPillBorderColor
    }];
    return generateStyleProperties(styles);
  }
  handleShowMore() {
    const updatedPageSize = this._itemsToLoadCount + this.pageSize;
    this._itemsToLoadCount = updatedPageSize >= this.itemsLength ? this.itemsLength : updatedPageSize;
  }
  @wire(NavigationContext)
  navContext;
  handleProductNavigation(event) {
    const productId = event.detail.productId;
    if (!productId) {
      return;
    }
    const item = this.itemsData.find(i => i.ProductDetails?.productId === productId);
    if (item && item.canViewProduct === false) {
      return;
    }
    navigate(this.navContext, {
      type: 'standard__recordPage',
      attributes: {
        objectApiName: 'Product2',
        recordId: event.detail.productId,
        actionName: 'view',
        ...(event.detail.urlName && {
          urlName: event.detail.urlName
        })
      }
    });
  }
  handleSeeConfiguration(event) {
    const {
      cartItemId
    } = event.detail;
    if (!cartItemId || !Array.isArray(this.items)) {
      return;
    }
    const lookup = buildQuoteLineItemsWithAssociatedLineItems(this.items);
    const entry = lookup.get(cartItemId);
    if (!entry) {
      return;
    }
    const productFieldsMapping = this.productFieldMappingValue;
    const orderItem = formatQuoteItemToOrderItem(entry, productFieldsMapping, productFieldsMapping);
    this.dispatchEvent(new CustomEvent('showbundledetails', {
      detail: {
        size: 'small',
        headerTitle: Labels.productBundleDetailsModalHeaderTitle,
        currencyIsoCode: this._currencyIsoCode,
        orderItem,
        label: Labels.productBundleDetailsModalHeaderTitle,
        productUnavailableMessage: this.productUnavailableMessage || ''
      },
      bubbles: true,
      composed: true
    }));
  }
}