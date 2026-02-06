import { LightningElement, api, wire } from 'lwc';
import { resolve } from 'experience/resourceResolver';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { createImageDataMap } from 'experience/picture';
import { CartStatusAdapter } from 'commerce/cartApi';
import { EVENT, QUANTITY_RULES } from './constants';
import { i18n } from './labels';
export default class SearchProductCard extends LightningElement {
  static renderMode = 'light';
  _imageSizes = {
    mobile: 300,
    tablet: 130,
    desktop: 330
  };
  _isProcessingAddToCart = false;
  _cartStatus;
  _displayData;
  _navigationContext;
  _productUrl;
  @wire(NavigationContext)
  wiredNavigationContext(context) {
    this._navigationContext = context;
    this.updateCallToActionButtonUrl();
  }
  @wire(SessionContextAdapter)
  sessionContext;
  @wire(AppContextAdapter)
  appContext;
  @wire(CartStatusAdapter)
  cartStatus(cartStatusData) {
    this._cartStatus = cartStatusData;
    if (!this.isCartProcessing) {
      this._isProcessingAddToCart = false;
    }
  }
  @api
  set displayData(data) {
    this._displayData = data;
    this.updateCallToActionButtonUrl();
  }
  get displayData() {
    return this._displayData;
  }
  get isConfigurableProduct() {
    return this.displayData?.isConfigurationAllowed === true;
  }
  get dynamicBundleLabel() {
    return i18n.configurableLabel;
  }
  @api
  configuration;
  @api
  focus() {
    if (this.configuration?.showCallToActionButton) {
      const focusTarget = this.querySelector('site-common-action-link') || this.querySelector('site-common-button-ui');
      focusTarget?.focus();
    } else {
      const index = this.fields?.findIndex(field => field.displayData.tabStoppable) || 0;
      const focusTarget = Array.from(this.querySelectorAll('site-search-product-field'))[index];
      focusTarget?.focus();
    }
  }
  get pricingInfo() {
    const prices = this.displayData?.prices;
    const isPromotionalPriceApplied = prices?.promotionalPrices && Number(prices.promotionalPrices?.promotionalPrice) < Number(prices.promotionalPrices?.salesPrice);
    if (isPromotionalPriceApplied) {
      return {
        negotiatedPrice: prices?.promotionalPrices?.promotionalPrice,
        listingPrice: prices?.promotionalPrices?.salesPrice,
        currencyIsoCode: prices?.currencyIsoCode ?? '',
        isLoading: Boolean(prices?.isLoading)
      };
    }
    return {
      negotiatedPrice: prices?.negotiatedPrice ?? '',
      listingPrice: prices?.listingPrice ?? '',
      currencyIsoCode: prices?.currencyIsoCode ?? '',
      isLoading: !!prices?.isLoading
    };
  }
  get tooltipText() {
    return this.displayData?.name ?? '';
  }
  get addToCartButtonAriaLabel() {
    if (this.displayData?.name) {
      return i18n.addToCartAriaLabel.replace('{productTitle}', this.displayData.name);
    }
    return '';
  }
  get viewOptionsButtonAriaLabel() {
    if (this.displayData?.name) {
      return i18n.viewOptionsAriaLabel.replace('{productTitle}', this.displayData.name);
    }
    return '';
  }
  get fields() {
    return (this.displayData?.fields ?? []).map(field => {
      return {
        displayData: field,
        configuration: this.configuration?.fieldConfiguration[field.name] ?? {}
      };
    });
  }
  get image() {
    const img = this.displayData?.image;
    return {
      alternateText: img?.alternateText ?? '',
      url: resolve(img?.url ?? '', false, {
        width: 460
      }),
      images: createImageDataMap(img?.url, this._imageSizes)
    };
  }
  get cardContainerClass() {
    return this.isGridLayout ? 'cardContainerGrid' : 'cardContainerList';
  }
  get isGridLayout() {
    return this.configuration?.layout === 'grid';
  }
  get actionButtonVariant() {
    const section = this?.querySelector('section');
    const variant = section && getComputedStyle(section).getPropertyValue('--com-c-product-card-button-variant');
    return ['primary', 'secondary', 'tertiary'].includes(variant) ? variant : 'primary';
  }
  get minimumText() {
    const min = Number.parseFloat(this.quantityRules?.minimum ?? '');
    return this.configuration?.minimumQuantityGuideText.replace('{0}', `${min}`);
  }
  get maximumText() {
    const max = Number.parseFloat(this.quantityRules?.maximum ?? '');
    return this.configuration?.maximumQuantityGuideText.replace('{0}', `${max}`);
  }
  get incrementText() {
    const increment = Number.parseFloat(this.quantityRules?.increment ?? '');
    return this.configuration?.incrementQuantityGuideText.replace('{0}', `${increment}`);
  }
  isQuantityValid = true;
  get addToCartButtonDisabled() {
    const priceAvailable = !!this.pricingInfo?.negotiatedPrice || !!this.pricingInfo?.listingPrice;
    return this._isProcessingAddToCart || this.configuration?.addToCartDisabled || !this.isQuantityValid || !priceAvailable;
  }
  get addToCartButtonText() {
    return this._isProcessingAddToCart ? this.configuration?.addToCartButtonProcessingText : this.configuration?.addToCartButtonText;
  }
  currentQuantity;
  handleValueChanged(evt) {
    if (evt?.detail?.isValid) {
      this.currentQuantity = evt.detail.value;
      this.isQuantityValid = true;
    }
  }
  handleValidityChanged(event) {
    this.isQuantityValid = event.detail.isValid;
  }
  get quantityRules() {
    if (!this.displayData?.purchaseQuantityRule && this.configuration?.showQuantitySelector) {
      return {
        minimum: QUANTITY_RULES.DEFAULT_MIN.toString(),
        maximum: QUANTITY_RULES.DEFAULT_MAX.toString(),
        increment: QUANTITY_RULES.DEFAULT_INCREMENT.toString()
      };
    }
    return this.displayData?.purchaseQuantityRule;
  }
  get quantityRuleMinimum() {
    return this.quantityRules?.minimum;
  }
  get quantityRuleMaximum() {
    return this.quantityRules?.maximum;
  }
  get quantityRuleIncrement() {
    return this.quantityRules?.increment;
  }
  get quantitySelectorLabelText() {
    return this.configuration?.quantitySelectorLabelText;
  }
  get quantityRuleCombinedText() {
    const rules = [this.minimumText, this.maximumText, this.incrementText];
    return rules.filter(item => item).join(' • ');
  }
  get isCTAButtonViewOptions() {
    return this.displayData?.productClass === 'VariationParent' || this.displayData?.productClass === 'Set' || (this.displayData?.productClass === 'Simple' || this.displayData?.productClass === 'Variation') && Boolean(this.quantityRules) && !this.configuration?.showQuantitySelector || this.isSubscriptionProduct || this.isConfigurableProduct;
  }
  get isCTAButtonAddToCart() {
    return (this.displayData?.productClass === 'Simple' || this.displayData?.productClass === 'Variation' || this.displayData?.productClass === 'Bundle') && !this.isConfigurableProduct;
  }
  get showInlineQuantitySelector() {
    return !!(this.quantityRules && this.configuration?.showQuantitySelector);
  }
  get showInlineQuantitySelectorText() {
    return !!(!this.isCTAButtonViewOptions && this.configuration?.showQuantitySelector && this.configuration?.showQuantityRulesText && this.displayData?.purchaseQuantityRule);
  }
  handleProductDetailPageNavigation(event) {
    event.preventDefault();
    event.stopPropagation();
    const {
      productId,
      productUrlName,
      productName
    } = this.productNavInfo;
    if (productId) {
      this.dispatchEvent(new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
        detail: {
          productId,
          productName,
          productUrlName
        }
      }));
    }
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
  get isSubscriptionProduct() {
    const hasSubscriptionInfo = this.displayData?.productSellingModelInformation?.isSubscriptionProduct ?? false;
    return this.shouldIncludePSMs(this.appContext?.data) && hasSubscriptionInfo;
  }
  get subscriptionOptionsLabelText() {
    return this.configuration?.subscriptionOptionsText;
  }
  get showPrice() {
    const {
      showListingPrice,
      showNegotiatedPrice
    } = this.configuration?.priceConfiguration || {};
    return !!(showListingPrice || showNegotiatedPrice);
  }
  get showNegotiatedPrice() {
    return !!this.configuration?.priceConfiguration?.showNegotiatedPrice;
  }
  get showOriginalPrice() {
    return !!this.configuration?.priceConfiguration?.showListingPrice;
  }
  get quantitySelectorClassList() {
    const classes = [];
    if (this.showInlineQuantitySelector) {
      classes.push('quantitySelectorContainer');
      if (this.isGridLayout) {
        classes.push('stacked');
      }
    }
    return classes;
  }
  get showProductImage() {
    return this.configuration?.showProductImage ?? false;
  }
  get productNavInfo() {
    let productId, productName, productUrlName;
    if (this.displayData) {
      productId = this.displayData.id;
      productName = this.displayData.name;
      productUrlName = this.displayData.urlName;
      if (this._displayData?.productClass === 'VariationParent' && !this.configuration?.navigateToParentProduct) {
        productId = this._displayData?.variationInfo?.attributesToProductMappings?.[0]?.productId ?? this._displayData.id;
        productUrlName = this._displayData?.variationInfo?.attributesToProductMappings?.[0]?.urlName ?? undefined;
      }
    }
    return {
      productId,
      productName,
      productUrlName
    };
  }
  get showCallToActionButton() {
    return this.configuration?.showCallToActionButton ?? false;
  }
  get isCartProcessing() {
    return !!this._cartStatus?.data?.isProcessing || !!this._cartStatus?.loading;
  }
  get isAddToCartEnabled() {
    const isLoggedIn = Boolean(this.sessionContext?.data?.isLoggedIn);
    const guestCartEnabled = Boolean(this.appContext?.data?.guestCartEnabled);
    return isLoggedIn || guestCartEnabled;
  }
  handleAddToCart() {
    if (!this.isAddToCartEnabled) {
      this.navigateToLogin();
      return;
    }
    if (this.isCartProcessing) {
      return;
    }
    this._isProcessingAddToCart = true;
    const productId = this.displayData?.id;
    const quantityMin = this.quantityRules && this.quantityRules.minimum ? this.quantityRules.minimum : 1;
    const quantity = this.currentQuantity ?? Number(quantityMin);
    this.dispatchEvent(new CustomEvent(EVENT.ADD_PRODUCT_TO_CART_EVT, {
      detail: {
        productId,
        quantity
      }
    }));
  }
  handleKeydown(evt) {
    if (evt.key === 'Enter') {
      this.handleProductDetailPageNavigation(evt);
    }
  }
  navigateToLogin() {
    navigate(this._navigationContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
  updateCallToActionButtonUrl() {
    if (this._navigationContext) {
      let pageRef = null;
      if (this._displayData?.pageReference) {
        pageRef = this._displayData.pageReference;
      } else if (this._displayData?.id) {
        const {
          productId,
          productUrlName
        } = this.productNavInfo;
        pageRef = {
          type: 'standard__recordPage',
          attributes: {
            objectApiName: 'Product2',
            recordId: productId,
            actionName: 'view',
            urlName: productUrlName
          }
        };
      }
      if (pageRef) {
        this._productUrl = generateUrl(this._navigationContext, pageRef);
      }
    }
  }
}