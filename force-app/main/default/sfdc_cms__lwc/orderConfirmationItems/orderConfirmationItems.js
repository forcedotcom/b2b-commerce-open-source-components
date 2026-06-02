import { LightningElement, api, wire } from 'lwc';
import currency from '@salesforce/i18n/currency';
import { transformDeliveryToCartItems } from './itemMapperUtil';
import { generateStyleProperties, generateTextFontSize } from 'experience/styling';
import { getDefaultProductFields } from './defaultOrderProductFields';
import ProductBundleDetailsModal from 'site/productBundleDetailsModal';
import { NavigationContext } from 'lightning/navigation';
import { formatOrderItems } from './formatOrderItemsUtil';
import { Labels } from './labels';
const DEFAULT_PAGE_SIZE = 10;

/**
 * @slot header
 * @slot showMore
 */
export default class OrderConfirmationItems extends LightningElement {
  static renderMode = 'light';
  _items = [];
  _itemsWithIds = [];
  _isDataFromCart = false;
  @api
  get items() {
    return this._items;
  }
  set items(value) {
    this._isDataFromCart = this.checkIfDataFromCart(value);
    this._itemsWithIds = this.itemsWithIds(value);
    this._items = value;
  }
  @api
  currencyIsoCode;
  @api
  showViewBundleDetail = false;
  @api
  viewBundleDetailLabel;
  @api
  deliveryGroupId;
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
  get _currencyIsoCode() {
    return this.currencyIsoCode || currency;
  }
  get paginationType() {
    if (this.itemsLength > this._itemsToLoadCount) {
      return 'showMore';
    }
    return undefined;
  }
  _pageSize = DEFAULT_PAGE_SIZE;
  _itemsToLoadCount = DEFAULT_PAGE_SIZE;
  get displayShowMore() {
    return this.itemsLength > this._itemsToLoadCount;
  }
  get showMoreSectionClass() {
    return this.displayShowMore ? 'show-more-btn' : 'show-more-btn show-more-hidden';
  }
  get itemsLength() {
    return this.items?.length || 0;
  }
  get showItems() {
    return this.itemsLength > 0;
  }
  get itemsData() {
    return transformDeliveryToCartItems(this._itemsWithIds.slice(0, this._itemsToLoadCount), this._isDataFromCart);
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
  get productFieldMappingValue() {
    return this.productFieldMapping ? JSON.parse(this.productFieldMapping) : getDefaultProductFields();
  }
  checkIfDataFromCart(items) {
    return !items.some(item => item.id);
  }
  itemsWithIds(value) {
    if (!value || !value.length) {
      return [];
    }
    return value.map((item, index) => {
      if (item.id) {
        return item;
      }
      return {
        ...item,
        id: `${index}`
      };
    });
  }
  handleShowMore() {
    const updatedPageSize = this._itemsToLoadCount + this.pageSize;
    this._itemsToLoadCount = updatedPageSize >= this.itemsLength ? this.itemsLength : updatedPageSize;
  }
  @wire(NavigationContext)
  navContext;
  async handleSeeConfiguration(event) {
    const {
      cartItemId
    } = event.detail;
    if (!cartItemId) {
      return;
    }
    const item = this._itemsWithIds.find(i => i.id === cartItemId);
    if (!item) {
      return;
    }
    ProductBundleDetailsModal.open({
      size: 'small',
      headerTitle: Labels.productBundleDetailsModalHeaderTitle,
      currencyIsoCode: this._currencyIsoCode,
      orderItem: this.orderLineItem(item),
      navContext: this.navContext,
      label: Labels.productBundleDetailsModalHeaderTitle
    });
  }
  orderLineItem(item) {
    const productFieldsMapping = this.productFieldMappingValue;
    const childProductFieldsMapping = productFieldsMapping;
    return formatOrderItems([item], productFieldsMapping, childProductFieldsMapping, true, '')[0];
  }
}