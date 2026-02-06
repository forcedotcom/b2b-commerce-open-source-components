import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import currency from '@salesforce/i18n/currency';
import { createCartItemDeleteAction, createCartItemsLoadAction, createCartItemsLoadPageAction, createCartItemUpdateAction, dispatchAction } from 'commerce/actionApi';
import { generateStyleProperties, generateTextFontSize } from 'experience/styling';

/**
 * @slot showMore
 */
export default class CartItems extends LightningElement {
  static renderMode = 'light';
  @api
  items;
  @api
  pagination;
  @api
  hasNextPageItems = false;
  @api
  displayShowMoreItems = false;
  @api
  displayPagination = false;
  @api
  currencyIsoCode;
  get _currencyIsoCode() {
    return this.currencyIsoCode || currency;
  }
  @api
  showRemoveItem = false;
  @api
  showModifyItem = false;
  @api
  showProductImage = false;
  @api
  showProductVariants = false;
  @api
  showPricePerUnit = false;
  @api
  pricePerUnitFontColor;
  @api
  productDescriptionFontColor;
  @api
  pricePerUnitFontSize;
  @api
  showTotalPrices = false;
  @api
  showOriginalPrice = false;
  @api
  originalPriceFontColor;
  @api
  originalPriceFontSize;
  @api
  showActualPrice = false;
  @api
  actualPriceFontColor;
  @api
  actualPriceFontSize;
  @api
  hideQuantitySelector = false;
  @api
  quantitySelectorLabel;
  @api
  showQuantitySelectorLabel = false;
  @api
  showCountInName = false;
  @api
  removeProductLinks = false;
  @api
  showPromotions = false;
  @api
  promotionsAppliedSavingsButtonText;
  @api
  promotionsAppliedSavingsButtonFontColor;
  @api
  promotionsAppliedSavingsButtonFontSize;
  @api
  promotionsAppliedSavingsButtonTextHoverColor;
  @api
  promotionsAppliedSavingsButtonBackgroundColor;
  @api
  promotionsAppliedSavingsButtonBackgroundHoverColor;
  @api
  promotionsAppliedSavingsButtonBorderColor;
  @api
  promotionsAppliedSavingsButtonBorderRadius;
  @api
  showSku = false;
  @api
  skuLabel;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  @api
  productFieldMapping;
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
  _paginationType;
  @api
  set paginationType(value) {
    this._paginationType = value;
  }
  get paginationType() {
    return this._paginationType;
  }
  @api
  imageAspectRatio;
  @api
  imageSize;
  get paginationTypeValue() {
    if (!this.paginationType) {
      if (this.displayPagination) {
        return 'pages';
      } else if (this.displayShowMoreItems) {
        return this.hasNextPageItems ? 'showMore' : undefined;
      }
      return 'scroll';
    }
    if ((this.paginationType === 'scroll' || this.paginationType === 'showMore') && !this.hasNextPageItems) {
      return undefined;
    }
    return this.paginationType;
  }
  get productFieldMappingValue() {
    return this.productFieldMapping ? JSON.parse(this.productFieldMapping) : [];
  }
  get cartItemsStyles() {
    const styles = [{
      name: '--com-c-cart-item-unit-price-font-color',
      value: this.pricePerUnitFontColor
    }, {
      name: '--com-c-cart-item-product-description-font-color',
      value: this.productDescriptionFontColor
    }, {
      name: '--com-c-cart-item-unit-price-font-size',
      value: generateTextFontSize(this.pricePerUnitFontSize)
    }, {
      name: '--com-c-cart-item-original-price-font-color',
      value: this.originalPriceFontColor
    }, {
      name: '--com-c-cart-item-original-price-font-size',
      value: generateTextFontSize(this.originalPriceFontSize)
    }, {
      name: '--com-c-cart-item-actual-price-font-color',
      value: this.actualPriceFontColor
    }, {
      name: '--com-c-cart-item-actual-price-font-size',
      value: generateTextFontSize(this.actualPriceFontSize)
    }, {
      name: '--com-c-cart-item-applied-savings-button-text-color',
      value: this.promotionsAppliedSavingsButtonFontColor
    }, {
      name: '--com-c-cart-item-applied-savings-button-font-size',
      value: generateTextFontSize(this.promotionsAppliedSavingsButtonFontSize)
    }, {
      name: '--com-c-cart-item-applied-savings-button-background-color',
      value: this.promotionsAppliedSavingsButtonBackgroundColor
    }, {
      name: '--com-c-cart-item-applied-savings-button-border-radius',
      value: this.promotionsAppliedSavingsButtonBorderRadius ? this.promotionsAppliedSavingsButtonBorderRadius + 'px' : ''
    }, {
      name: '--com-c-cart-item-applied-savings-button-border-color',
      value: this.promotionsAppliedSavingsButtonBorderColor
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
    }, {
      name: '--com-c-cart-item-image-aspect-ratio',
      value: this.imageAspectRatio && parseFloat(this.imageAspectRatio) || 1
    }, {
      name: '--com-c-cart-item-image-object-fit',
      value: this.imageSize || 'contain'
    }];
    return generateStyleProperties(styles);
  }
  handleCartShowMore() {
    dispatchAction(this, createCartItemsLoadAction());
  }
  handleCartGoToPage(event) {
    dispatchAction(this, createCartItemsLoadPageAction(event.detail.pageNumber, event.detail.pageSize));
  }
  handleDeleteCartItem(event) {
    dispatchAction(this, createCartItemDeleteAction(event.detail));
  }
  handleUpdateCartItem(event) {
    const {
      cartItemId,
      quantity
    } = event.detail;
    dispatchAction(this, createCartItemUpdateAction(cartItemId, quantity));
  }
  @wire(NavigationContext)
  navContext;
  handleProductNavigation(event) {
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
}