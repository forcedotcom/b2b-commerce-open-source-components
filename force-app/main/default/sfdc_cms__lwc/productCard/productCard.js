import { api, LightningElement, wire } from 'lwc';
import { generateStyleProperties, generateTextDecorationStyle } from 'experience/styling';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import { getPrimaryPrice, getSecondaryPrice } from './pricingService';
import { cartItemAdd, toCommerceError } from 'commerce/checkoutCartApi';
import { addToCartErrorText, removeErrorText, productQuickViewButtonLabel } from './labels';
import { getLabelForToast } from './labelTextGenerator';
import { createCartItemAddDataEvent, createProductRecommendationDataEvent, createWishlistItemAddDataEvent, createWishlistItemRemoveDataEvent, dispatchDataEvent, getAndRemoveSearchCorrelationId, updateSearchCorrelationId } from 'commerce/dataEventApi';
import Toast from 'site/commonToast';
import BasePath from '@salesforce/community/basePath';
import { sanitizeValueAndDecodeEntities } from 'site/commonRichtextsanitizerUtils';
import { isPreviewMode } from 'experience/clientApi';
import { addItemToWishlist, deleteItemFromWishlist, WishlistsAdapter } from 'commerce/wishlistApi';
import { generateTextFontSizeV2 } from './stylingUtils';
import { isWishlistItemData, transformProductData, transformWishlistItemData } from './productTransformations';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { CARD_LAYOUT, WISHLIST_PAGE_SIZE } from './constants';
const GUEST_INSUFFICIENT_ACCESS = 'GUEST_INSUFFICIENT_ACCESS';
const DEFAULT_INFO_PADDING = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
};
const alignmentMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end'
};
const defaultAlignment = 'flex-start';
const PRODUCT_FIELD_NAME = 'Name';
const PRODUCT_DESCRIPTION_FIELD_NAME = 'Description';
const PRODUCT_SKU_FIELD_NAME = 'StockKeepingUnit';
const PRODUCT_CODE_FIELD_NAME = 'ProductCode';
const MAX_ADDITIONAL_FIELDS = 3;
function decodeHtmlEntities(value) {
  if (!value) {
    return '';
  }
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
export default class ProductCard extends LightningElement {
  static renderMode = 'light';
  @api
  cardLayout = CARD_LAYOUT.GRID;
  _htmlProductNameGate = false;
  @api
  get htmlProductNameGate() {
    return this._htmlProductNameGate;
  }
  set htmlProductNameGate(value) {
    this._htmlProductNameGate = value;
  }
  _item;
  _normalizedItem;
  _defaultCurrency;
  _wishlistClicks = 0;
  _wishlistProcessing = false;
  _event;
  @api
  get item() {
    return this._item;
  }
  set item(val) {
    this._item = val;
    if (isWishlistItemData(val)) {
      this._normalizedItem = transformWishlistItemData(val);
      if (isPreviewMode) {
        this._isOnWishlist = true;
      }
    } else if (val) {
      this._normalizedItem = transformProductData(val);
    } else {
      this._normalizedItem = undefined;
    }
  }
  get listImages() {
    return this.transformMediaContents(this._normalizedItem?.mediaGroups);
  }
  transformMediaContents(mediaGroups) {
    return (mediaGroups || []).flatMap(group => {
      return group.usageType === 'Listing' ? group.mediaItems : [];
    });
  }
  @api
  cardBackgroundColor;
  @api
  cardBorderColor;
  @api
  cardBorderRadius;
  @api
  cardBorderWeight;
  @api
  cardImageSize;
  @api
  cardImageBorderColor;
  @api
  showProductImage = false;
  @api
  cardContentMapping;
  @api
  searchResultsFields;
  @api
  showSku = false;
  @api
  skuLabel;
  @api
  unavailableProductLabel;
  @api
  showAddToCartButton = false;
  @api
  addToCartButtonLabel;
  @api
  addToCartButtonStyle;
  @api
  addToCartButtonSize;
  @api
  priceType;
  @api
  primaryPriceTextColor;
  @api
  primaryPriceFontSize;
  @api
  secondaryPriceTextColor;
  @api
  secondaryPriceFontSize;
  @api
  unavailablePriceLabel;
  @api
  promotionTextColor;
  @api
  combinePromosThreshold;
  @api
  showWishlistIcon = false;
  @api
  wishlistIconUnselectedColor;
  @api
  wishlistIconSelectedColor;
  @api
  imageAspectRatio;
  @api
  iconBorderColor;
  @api
  imageHoverAction;
  @api
  showButtonOnDesktop = false;
  @api
  showButtonOnMobile = false;
  @api
  swatchBorderRadius;
  @api
  swatchBorderColor;
  @api
  swatchBorderHoverColor;
  @api
  swatchBorderSelectedColor;
  @api
  viewProductOptionsButtonLabel;
  @api
  subscriptionOptionsLabel;
  @api
  get cardTextFlexAlign() {
    return this._cardTextFlexAlign;
  }
  set cardTextFlexAlign(cardTextFlexAlign) {
    this._cardTextFlexAlign = cardTextFlexAlign;
  }
  @api
  get addToCartButtonTextStyle() {
    return this._addToCartButtonTextStyle;
  }
  set addToCartButtonTextStyle(addToCartButtonTextStyle) {
    this._addToCartButtonTextStyle = addToCartButtonTextStyle;
    try {
      this._addToCartButtonTextStyleObject = JSON.parse(decodeHtmlEntities(this._addToCartButtonTextStyle) || '{}');
    } catch {
      this._addToCartButtonTextStyleObject = {};
    }
  }
  @api
  get primaryPriceTextStyle() {
    return this._primaryPriceTextStyle;
  }
  set primaryPriceTextStyle(primaryPriceTextStyle) {
    this._primaryPriceTextStyle = primaryPriceTextStyle;
    try {
      this._primaryPriceTextStyleObject = JSON.parse(decodeHtmlEntities(this._primaryPriceTextStyle) || '{}');
    } catch {
      this._primaryPriceTextStyleObject = {};
    }
  }
  @api
  get secondaryPriceTextStyle() {
    return this._secondaryPriceTextStyle;
  }
  set secondaryPriceTextStyle(secondaryPriceTextStyle) {
    this._secondaryPriceTextStyle = secondaryPriceTextStyle;
    try {
      this._secondaryPriceTextStyleObject = JSON.parse(decodeHtmlEntities(this._secondaryPriceTextStyle) || '{}');
    } catch {
      this._secondaryPriceTextStyleObject = {};
    }
  }
  @api
  showQuantitySelector = false;
  @api
  quantityMinimum;
  @api
  quantityMaximum;
  @api
  quantityStep;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  @api
  showQuantityRulesText = false;
  @api
  showProductQuickView = false;
  @api
  showWishlistInQuickView = false;
  @api
  productQuickViewButtonLabel = productQuickViewButtonLabel;
  _addToCartButtonTextStyle;
  _addToCartButtonTextStyleObject = {};
  _secondaryPriceTextStyle;
  _secondaryPriceTextStyleObject = {};
  _primaryPriceTextStyle;
  _primaryPriceTextStyleObject = {};
  _cardTextFlexAlign;
  _isOnWishlist = false;
  _isOnWishlistOverride;
  _wishlistId;
  _wishlistItemId;
  _quantity = 1;
  get isWishlistPage() {
    return isWishlistItemData(this._item);
  }
  get isOnWishlist() {
    if (this._isOnWishlistOverride !== undefined) {
      return this._isOnWishlistOverride;
    }
    return this._isOnWishlist;
  }
  get _productId() {
    return this._normalizedItem?.id;
  }
  get _productUrl() {
    if (this._productId && this.navContext) {
      return generateUrl(this.navContext, {
        type: 'standard__recordPage',
        attributes: {
          objectApiName: 'Product2',
          recordId: this._productId,
          actionName: 'view',
          urlName: this._normalizedItem?.urlName
        }
      });
    }
    return undefined;
  }
  get _productName() {
    return this._normalizedItem?.name;
  }
  get _productClass() {
    return this._normalizedItem?.productClass;
  }
  get _isConfigurationAllowed() {
    return this._normalizedItem?.isConfigurationAllowed;
  }
  get _isSubscriptionProduct() {
    const hasSubscriptionInfo = this._normalizedItem?.productSellingModelInformation?.isSubscriptionProduct ?? false;
    return this.shouldIncludePSMs(this.appContext?.data) && hasSubscriptionInfo;
  }
  shouldIncludePSMs(appContext) {
    if (appContext?.subscriptionConfig) {
      const {
        subscriptionPlusEnabled,
        rlmSubscriptionEnabled
      } = appContext.subscriptionConfig;
      return subscriptionPlusEnabled === true || rlmSubscriptionEnabled === true;
    }
    return false;
  }
  get _subscriptionOptionsLabel() {
    return this.subscriptionOptionsLabel;
  }
  get _sku() {
    return this.showSku ? this._normalizedItem?.sku || '' : '';
  }
  get _productVariants() {
    return this._normalizedItem?.variationAttributeSet;
  }
  get _image() {
    return this.showProductImage ? this._normalizedItem?.thumbnailImage || this.defaultProductImage() : undefined;
  }
  get normalizedCardContentMapping() {
    try {
      return JSON.parse(decodeHtmlEntities(this.cardContentMapping) || '[]');
    } catch (e) {
      return [];
    }
  }
  get _additionalFields() {
    const mapping = this.normalizedCardContentMapping;
    const itemFields = this._normalizedItem?.fields;
    if (!mapping.length || !itemFields) {
      return [];
    }
    const mappedFields = mapping.map(field => {
      const value = this.getFieldValue(itemFields, field.name);
      return {
        name: field.name,
        label: field.label || field.name,
        value,
        showLabel: Boolean(field.showLabel),
        isDescription: field.name === PRODUCT_DESCRIPTION_FIELD_NAME,
        isSku: field.name === PRODUCT_SKU_FIELD_NAME || field.name === PRODUCT_CODE_FIELD_NAME
      };
    }).filter(field => {
      if (field.name === PRODUCT_FIELD_NAME || !field.value?.toString().trim()) {
        return false;
      }
      if (this.showSku && field.isSku) {
        return false;
      }
      return true;
    });
    const descriptionField = mappedFields.find(field => field.isDescription);
    const skuFields = mappedFields.filter(field => field.isSku);
    const otherFields = mappedFields.filter(field => !field.isDescription && !field.isSku);
    const orderedFields = [...(descriptionField ? [descriptionField] : []), ...skuFields, ...otherFields];
    return orderedFields.slice(0, MAX_ADDITIONAL_FIELDS);
  }
  get _primaryPrice() {
    return getPrimaryPrice(this.priceType, this.listPrice, this.salePrice);
  }
  get _secondaryPrice() {
    return getSecondaryPrice(this.priceType, this.listPrice, this.salePrice);
  }
  get _currency() {
    return this._normalizedItem?.currencyIsoCode || this._defaultCurrency;
  }
  get _addToCartButtonLabel() {
    return this._isProductAvailable ? this.addToCartButtonLabel : this.unavailableProductLabel;
  }
  get _isProductAvailable() {
    return this._normalizedItem?.isAvailable;
  }
  get _wishlistIconVisible() {
    const item = this._normalizedItem;
    const isSubscription = this._isSubscriptionProduct;
    const isVariation = item?.productClass === 'VariationParent';
    const isConfigurable = item?.isConfigurationAllowed;
    const isSimpleProduct = !isSubscription && !isVariation && !isConfigurable;
    const isLoggedIn = this.sessionContext?.data?.isLoggedIn;
    return Boolean(this.showWishlistIcon && isLoggedIn && isSimpleProduct);
  }
  get listPrice() {
    return this._normalizedItem?.listPrice;
  }
  get salePrice() {
    return this._normalizedItem?.salesPrice;
  }
  get promotionalPricing() {
    return this._normalizedItem?.promotionalPrices || null;
  }
  get productVariationInfoData() {
    return this._normalizedItem?.productVariationInfoData || null;
  }
  _cardInfoPadding;
  _cardInfoPaddingStyle = DEFAULT_INFO_PADDING;
  @api
  get cardInfoPadding() {
    return this._cardInfoPadding;
  }
  set cardInfoPadding(value) {
    this._cardInfoPadding = value;
    try {
      this._cardInfoPaddingStyle = value ? JSON.parse(decodeHtmlEntities(value)) : DEFAULT_INFO_PADDING;
    } catch {
      /* keep previous _cardInfoPaddingStyle on parse failure */
    }
  }
  get displayQuickViewButton() {
    if (this.imageHoverAction !== 'zoom' && this.showProductQuickView && this._normalizedItem?.productClass && ['Simple', 'VariationParent', 'Variation'].includes(this._normalizedItem.productClass) && !this._isSubscriptionProduct) {
      return true;
    }
    return false;
  }
  _sCardTextAlign = '';
  _mCardTextAlign = '';
  _lCardTextAlign = '';
  connectedCallback() {
    const style = this.getAttribute('style');
    this._lCardTextAlign = style?.split('--dxp-c-l-card-text-align: ')[1]?.split(';')[0] || '';
    this._mCardTextAlign = style?.split('--dxp-c-m-card-text-align: ')[1]?.split(';')[0] || '';
    this._sCardTextAlign = style?.split('--dxp-c-s-card-text-align: ')[1]?.split(';')[0] || '';
  }
  get _customStyles() {
    return `
            ${generateStyleProperties([{
      name: '--com-c-product-card-info-padding-top',
      value: this._cardInfoPaddingStyle.top
    }, {
      name: '--com-c-product-card-info-padding-bottom',
      value: this._cardInfoPaddingStyle.bottom
    }, {
      name: '--com-c-product-card-info-padding-left',
      value: this._cardInfoPaddingStyle.left
    }, {
      name: '--com-c-product-card-info-padding-right',
      value: this._cardInfoPaddingStyle.right
    }, {
      name: '--com-c-product-card-wishlist-icon-empty-stroke',
      value: this.iconBorderColor
    }, {
      name: '--com-c-product-card-background-color',
      value: this.cardBackgroundColor || ''
    }, {
      name: '--com-c-product-card-border-color',
      value: this.cardBorderColor || ''
    }, {
      name: '--com-c-product-card-add-to-cart-button-font-weight',
      value: this._addToCartButtonTextStyleObject.bold ? 'bold' : ''
    }, {
      name: '--com-c-product-card-add-to-cart-button-font-style',
      value: this._addToCartButtonTextStyleObject.italic ? 'italic' : ''
    }, {
      name: '--com-c-product-card-image-border-color',
      value: this.cardImageBorderColor || ''
    }, {
      name: '--com-c-product-card-primary-price-font-size',
      value: generateTextFontSizeV2(this.primaryPriceFontSize)
    }, {
      name: '--com-c-product-card-primary-price-text-color',
      value: this.primaryPriceTextColor || ''
    }, {
      name: '--com-c-product-card-primary-price-font-weight',
      value: this._primaryPriceTextStyleObject.bold ? 'bold' : ''
    }, {
      name: '--com-c-product-card-primary-price-font-style',
      value: this._primaryPriceTextStyleObject.italic ? 'italic' : ''
    }, {
      name: '--com-c-product-card-secondary-price-font-weight',
      value: this._secondaryPriceTextStyleObject.bold ? 'bold' : ''
    }, {
      name: '--com-c-product-card-secondary-price-font-style',
      value: this._secondaryPriceTextStyleObject.italic ? 'italic' : ''
    }, {
      name: '--com-c-product-card-secondary-price-font-size',
      value: generateTextFontSizeV2(this.secondaryPriceFontSize)
    }, {
      name: '--com-c-product-card-secondary-price-text-color',
      value: this.secondaryPriceTextColor || ''
    }, {
      name: '--com-c-product-card-s-align-product-info-items',
      value: `var(--dxp-c-s-card-text-flex-align, ${alignmentMap[this._sCardTextAlign] || defaultAlignment})`
    }, {
      name: '--com-c-product-card-m-align-product-info-items',
      value: `var(--dxp-c-m-card-text-flex-align, ${alignmentMap[this._mCardTextAlign] || defaultAlignment})`
    }, {
      name: '--com-c-product-card-l-align-product-info-items',
      value: `var(--dxp-c-l-card-text-flex-align, ${alignmentMap[this._lCardTextAlign] || defaultAlignment})`
    }, {
      name: '--com-c-product-pricing-details-promotional-message-color',
      value: this.promotionTextColor || 'initial'
    }, {
      name: '--com-c-product-card-wishlist-icon-color',
      value: this.wishlistIconSelectedColor || ''
    }, {
      name: '--com-c-product-card-wishlist-icon-empty-fill',
      value: this.wishlistIconUnselectedColor || ''
    }, {
      name: '--com-c-product-pricing-details-promotional-message-label-size',
      value: generateTextFontSizeV2('small')
    }, {
      name: '--com-c-image-aspect-ratio',
      value: this.imageAspectRatio && parseFloat(this.imageAspectRatio) || 1
    }, {
      name: '--com-c-commerce-product-card-swatch-border-radius',
      value: this.swatchBorderRadius,
      suffix: 'px'
    }, {
      name: '--com-c-commerce-product-card-swatch-border-color',
      value: this.swatchBorderColor
    }, {
      name: '--com-c-commerce-product-card-swatch-border-hover-color',
      value: this.swatchBorderHoverColor
    }, {
      name: '--com-c-commerce-product-card-swatch-border-selected-color',
      value: this.swatchBorderSelectedColor
    }])}
        ${generateTextDecorationStyle('--com-c-product-card-add-to-cart-button-text-decoration', this._addToCartButtonTextStyleObject)}
        ${generateTextDecorationStyle('--com-c-product-card-primary-price-text-decoration', this._primaryPriceTextStyleObject)}
        ${generateTextDecorationStyle('--com-c-product-card-secondary-price-text-decoration', this._secondaryPriceTextStyleObject)}
        `;
  }
  @wire(NavigationContext)
  navContext;
  dispatchAction(eventName) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true
    }));
  }
  @wire(SessionContextAdapter)
  sessionContext;
  @wire(AppContextAdapter)
  appContext;
  @wire(AppContextAdapter)
  getDefaultCurrency({
    data,
    loaded,
    error
  }) {
    if (loaded && data && !error) {
      this._defaultCurrency = data.defaultCurrency;
    }
  }
  defaultProductImage() {
    return {
      alternateText: 'defaultProduct',
      contentVersionId: null,
      id: '',
      mediaType: 'Image',
      sortOrder: 0,
      thumbnailUrl: null,
      title: null,
      url: `${BasePath}/assets/images/defaultProductImage.svg`
    };
  }
  getFieldValue(fields, fieldName) {
    if (Array.isArray(fields)) {
      const field = fields.find(item => item.name === fieldName);
      return field?.value ? `${field.value}` : '';
    }
    const record = fields;
    const rawField = record[fieldName];
    if (!rawField || typeof rawField !== 'object') {
      return '';
    }
    const value = rawField.value;
    return value == null ? '' : `${value}`;
  }
  handleAddToCartSuccess(cartItem) {
    this.dispatchAction('addtocartsuccess');
    if (this._normalizedItem?.salesPrice && cartItem.cartId && this._currency) {
      const correlationId = getAndRemoveSearchCorrelationId();
      dispatchDataEvent(this, createCartItemAddDataEvent(cartItem, cartItem.cartId, this._currency, null, correlationId));
    }
  }
  handleAddToCartError(error) {
    this.dispatchAction('addtocarterror');
    const productName = sanitizeValueAndDecodeEntities(this._normalizedItem?.name || '');
    Toast.show({
      label: getLabelForToast(addToCartErrorText, productName),
      variant: 'error'
    }, this);
    if (toCommerceError(error).code === GUEST_INSUFFICIENT_ACCESS) {
      this.navigateToLogin();
    }
  }
  async handleAddToCart(event) {
    event.stopPropagation();
    const productId = this._productId;
    if (productId) {
      this.dispatchAction('addtocartclicked');
      try {
        const cartItem = await cartItemAdd(productId, this._quantity);
        this.handleAddToCartSuccess(cartItem);
      } catch (error) {
        this.handleAddToCartError(error);
      }
    }
  }
  handleQuantityChanged(event) {
    event.stopPropagation();
    if (event.detail?.isValid) {
      this._quantity = event.detail.value ?? 1;
    }
  }
  navigateToLogin() {
    navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
  handleProductClicked(event) {
    event.stopPropagation();
    const productId = event.detail?.productId ?? this._productId;
    if (productId) {
      const {
        target
      } = event;
      const productCardDetail = this._item;
      const correlationId = productCardDetail?.correlationId;
      const rank = productCardDetail?.rank ?? 0;
      const pageSize = productCardDetail?.pageSize ?? 0;
      const pageOffset = productCardDetail?.pageOffset ?? 0;
      updateSearchCorrelationId(correlationId ?? '');
      const productName = event.detail?.productName ?? this._productName;
      dispatchDataEvent(target, createProductRecommendationDataEvent({
        id: productId,
        type: 'Product',
        attributes: {
          categoryId: event.detail?.categoryId,
          correlationId: correlationId,
          searchResultTitle: productName,
          searchResultPosition: rank + pageOffset * pageSize,
          searchResultPositionInPage: rank,
          searchResultPageNumber: pageOffset,
          searchResultId: correlationId
        }
      }));
      let urlName = this._normalizedItem?.urlName;
      if (this._productClass === 'VariationParent' || this._productClass === 'Variation') {
        urlName = this.productVariationInfoData?.attributesToProductMappings?.find(mapping => mapping.productId === productId)?.urlName || undefined;
      }
      navigate(this.navContext, {
        type: 'standard__recordPage',
        attributes: {
          objectApiName: 'Product2',
          recordId: productId,
          actionName: 'view',
          urlName
        }
      });
    }
  }
  @wire(WishlistsAdapter, {
    includeDisplayedList: true,
    pageSize: WISHLIST_PAGE_SIZE,
    productFields: ['CurrencyIsoCode', 'Description', 'DisplayUrl', 'Family', 'Name', 'ProductCode', 'QuantityUnitOfMeasure', 'StockKeepingUnit', 'ProductClass']
  })
  receiveWishlistData(response) {
    if (response.loaded && !response.error && response.data) {
      const item = response.data.displayedList?.page?.items?.find(wishlistItem => wishlistItem.productSummary?.productId === this._productId);
      if (item?.wishlistItemId && response.data.displayedList?.summary?.id) {
        this._isOnWishlist = true;
        this._wishlistId = response.data.displayedList.summary.id;
        this._wishlistItemId = item.wishlistItemId;
      } else {
        this._isOnWishlist = false;
        this._wishlistId = undefined;
        this._wishlistItemId = undefined;
      }
      if (this._wishlistClicks % 2 && this._isOnWishlistOverride === this._isOnWishlist) {
        return;
      }
      if (this._wishlistClicks % 2) {
        this._wishlistClicks = 0;
        this._wishlistProcessing = false;
        this.handleWishlistButtonClicked(this._event);
      } else if (this._isOnWishlistOverride === this._isOnWishlist) {
        this._isOnWishlistOverride = undefined;
        this._wishlistProcessing = false;
        this._wishlistClicks = 0;
      }
    }
  }
  getWishlistItemEventData() {
    return {
      id: this._wishlistItemId,
      catalogObject: {
        id: this._productId,
        type: 'Product'
      },
      attributes: {
        quantity: 1,
        price: Number(this._primaryPrice || '')
      }
    };
  }
  async handleWishlistButtonClicked(event) {
    event.stopPropagation();
    const {
      target
    } = event;
    if (!this._event) {
      this._event = event;
    }
    if (!this._productId) {
      return;
    } else if (this._wishlistProcessing) {
      this._wishlistClicks += 1;
      this._isOnWishlistOverride = !this._isOnWishlistOverride;
      return;
    }
    if (!this._isOnWishlist) {
      this._isOnWishlistOverride = true;
      this._wishlistProcessing = true;
      try {
        this.dispatchAction('addtowishlistclicked');
        await addItemToWishlist({
          wishlistItemInput: {
            productId: this._productId
          },
          wishlistId: this._wishlistId
        });
        dispatchDataEvent(target, createWishlistItemAddDataEvent(this.getWishlistItemEventData(), this._currency));
        this.dispatchAction('addtowishlistsuccess');
      } catch (e) {
        this.dispatchAction('addtowishlisterror');
        this._isOnWishlistOverride = undefined;
        this._wishlistProcessing = false;
        console.error(e);
      }
    } else if (this._wishlistId && this._wishlistItemId) {
      this._isOnWishlistOverride = false;
      this._wishlistProcessing = true;
      try {
        this.dispatchAction('deletefromwishlistclicked');
        await deleteItemFromWishlist({
          wishlistId: this._wishlistId,
          wishlistItemId: this._wishlistItemId
        });
        dispatchDataEvent(target, createWishlistItemRemoveDataEvent(this.getWishlistItemEventData(), this._currency));
        this.dispatchAction('deletefromwishlistsuccess');
      } catch (e) {
        this.dispatchAction('deletefromwishlisterror');
        const productName = sanitizeValueAndDecodeEntities(this._normalizedItem?.name || '');
        this._isOnWishlistOverride = undefined;
        this._wishlistProcessing = false;
        Toast.show({
          label: getLabelForToast(removeErrorText, productName),
          variant: 'error'
        }, this);
        console.error(e);
      }
    }
  }
}