import { LightningElement, api, wire } from 'lwc';
import { debounce, clearDebounceTimeout } from 'experience/utils';
import { displayDiscountPrice } from 'site/promotionEvaluatePriceDiscount';
import canDisplayOriginalPrice from 'site/cartEvaluatePriceOriginal';
import currencyFormatter from 'site/commonFormatterCurrency';
import { getPriceLabel, getProductCountNameLabel, getProductLabel, getTermDefinedSubscriptionLabel, getBundleChildProductCountLabel } from './labelGenerators';
import { changeSign } from './transformers';
import { DELETE_ITEM_EVENT, UPDATE_ITEM_EVENT, NAVIGATE_PRODUCT_EVENT, PRODUCT_DETAIL_FIELDS, CART_UPDATE_STATUS_EVENT, UPDATE_QUANTITY_DEBOUNCE } from './constants';
import { Labels } from './labels';
import { NavigationContext, generateUrl } from 'lightning/navigation';
import { resolve as resourceResolver } from 'experience/resourceResolver';
import sanitizeValue from 'site/commonRichtextsanitizerUtils';
import { createImageDataMap } from 'experience/picture';
export { getBundleChildProductCountLabel } from './labelGenerators';
export { DELETE_ITEM_EVENT, UPDATE_ITEM_EVENT, NAVIGATE_PRODUCT_EVENT, CART_UPDATE_STATUS_EVENT } from './constants';
export { Labels } from './labels';
export default class CartItem extends LightningElement {
  static renderMode = 'light';
  imageSizes = {
    mobile: 100,
    tablet: 100,
    desktop: 200
  };
  _item;
  @api
  set item(value) {
    this._item = value;
    this._overrideOuantity = undefined;
  }
  get item() {
    return this._item;
  }
  @api
  currencyIsoCode;
  @api
  showRemoveItem = false;
  @api
  disableQuantitySelector = false;
  @api
  showProductImage = false;
  @api
  showProductVariants = false;
  @api
  showPricePerUnit = false;
  @api
  showTotalPrices = false;
  @api
  showOriginalPrice = false;
  @api
  showActualPrice = false;
  @api
  hideQuantitySelector = false;
  @api
  removeProductLinks = false;
  @api
  showCountInName = false;
  @api
  showPromotions = false;
  @api
  promotionsAppliedSavingsButtonText;
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
  quantitySelectorLabel;
  @api
  showQuantitySelectorLabel = false;
  @api
  showSmallLayout;
  _htmlProductNameGate = false;
  @api
  set htmlProductNameGate(value) {
    this._htmlProductNameGate = value;
  }
  get htmlProductNameGate() {
    return this._htmlProductNameGate;
  }
  get containerClasses() {
    if (!this.showProductImage) {
      return this.showRemoveItem ? 'container no-image' : 'container no-image-no-delete';
    } else if (this.showSmallLayout) {
      return this.showRemoveItem ? `container image-small` : `container image-small-no-delete`;
    }
    return this.showRemoveItem ? `container image` : `container image-no-delete`;
  }
  get _hideQuantitySelectorLabel() {
    return !this.showQuantitySelectorLabel;
  }
  get _showOriginalPrice() {
    return canDisplayOriginalPrice(true, this.showOriginalPrice, this.item?.price, this.item?.listPrice);
  }
  get _showQuantitySelector() {
    return !this.hideQuantitySelector;
  }
  get quantity() {
    if (this.item?.quantity === undefined) {
      return 0;
    }
    return this._overrideOuantity ?? this.item.quantity;
  }
  get _showPromotions() {
    return displayDiscountPrice(this.showPromotions, this.item?.itemizedAdjustmentAmount?.toString());
  }
  get bonusProductPromotionLabel() {
    return this.item?.promotionDisplayName;
  }
  get minimum() {
    return this.item?.ProductDetails.purchaseQuantityRule?.minimum;
  }
  get maximum() {
    return this.item?.ProductDetails.purchaseQuantityRule?.maximum;
  }
  get step() {
    return this.item?.ProductDetails.purchaseQuantityRule?.increment;
  }
  @wire(NavigationContext)
  navContext;
  get _productUrl() {
    const productId = this.item?.ProductDetails.productId;
    const urlName = this.item?.ProductDetails.productUrlName;
    if (productId && this.navContext) {
      return generateUrl(this.navContext, {
        type: 'standard__recordPage',
        attributes: {
          objectApiName: 'Product2',
          recordId: productId,
          actionName: 'view',
          ...(urlName && {
            urlName: urlName
          })
        }
      });
    }
    return '';
  }
  get errorMessage() {
    return this.item?.Messages?.[0]?.message;
  }
  get _productFieldMapping() {
    return this.productFieldMapping?.flatMap(fieldMapping => {
      const fieldValue = this.getFieldValue(fieldMapping.name);
      if (!fieldValue) {
        return [];
      }
      const fieldData = {
        name: fieldMapping.name,
        label: fieldMapping.label,
        type: fieldMapping.type,
        value: fieldValue
      };
      return fieldData;
    }) ?? [];
  }
  get imgAltText() {
    return this.item?.ProductDetails?.thumbnailImage?.alternateText || '';
  }
  handleDeleteItem() {
    this.clearDebounce();
    this.dispatchEvent(new CustomEvent(DELETE_ITEM_EVENT, {
      detail: this.item?.id,
      composed: true,
      bubbles: true
    }));
  }
  handleValueChangedPromise;
  disconnectedCallback() {
    this.clearDebounce();
  }
  clearDebounce() {
    this.handleValueChangedPromise && clearDebounceTimeout(this.handleValueChangedPromise);
  }
  handleValueChanged(event) {
    if (event?.detail?.isValid) {
      event.stopPropagation();
      const quantity = event.detail?.value;
      this.handleValueChangedPromise = this._handleValueChangedDebounce(quantity);
    }
  }
  _overrideOuantity;
  _handleValueChangedDebounce = debounce(quantity => {
    this._overrideOuantity = quantity;
    this.dispatchEvent(new CustomEvent(UPDATE_ITEM_EVENT, {
      detail: {
        cartItemId: this.item?.id,
        quantity
      },
      composed: true,
      bubbles: true
    }));
  }, UPDATE_QUANTITY_DEBOUNCE);
  handleValidityChanged(event) {
    event.stopPropagation();
    const isValid = event.detail?.isValid;
    this.dispatchEvent(new CustomEvent(CART_UPDATE_STATUS_EVENT, {
      detail: {
        isReadyForCheckout: isValid
      },
      composed: true,
      bubbles: true
    }));
  }
  handleProductNameClick(event) {
    event.stopPropagation();
    event.preventDefault();
    const productId = this.item?.ProductDetails.productId;
    const urlName = this.item?.ProductDetails.productUrlName;
    this.dispatchEvent(new CustomEvent(NAVIGATE_PRODUCT_EVENT, {
      detail: {
        productId: productId,
        ...(urlName && {
          urlName: urlName
        })
      },
      composed: true,
      bubbles: true
    }));
  }
  getFieldValue(fieldName) {
    if (Object.keys(PRODUCT_DETAIL_FIELDS).includes(fieldName)) {
      const productDetailField = PRODUCT_DETAIL_FIELDS[fieldName];
      return this.item?.ProductDetails[productDetailField];
    }
    return this.item?.ProductDetails?.fields?.[fieldName];
  }
  get _promotionsAppliedSavingsButtonText() {
    return getPriceLabel(this.promotionsAppliedSavingsButtonText, changeSign(this.item?.itemizedAdjustmentAmount, true), this.currencyIsoCode, '{amount}');
  }
  get pricePerItemText() {
    return getPriceLabel(Labels.pricePerItem, this.item?.unitAdjustedPriceWithItemAdj, this.currencyIsoCode, '{0}');
  }
  get pricePerItemAssistiveText() {
    return getPriceLabel(Labels.pricePerItemAssistiveText, this.item?.unitAdjustedPrice, this.currencyIsoCode, '{0}');
  }
  get originalPriceAssistiveText() {
    if (this._hasSubscription) {
      const hasFirstPymtTotalListPrice = this._hasFirstPaymentTotalListPrice();
      const originalPrice = hasFirstPymtTotalListPrice ? this.item?.firstPymtTotalListPrice : this.item?.listPrice;
      const labelText = this._isMonthlySubscription ? Labels.originalPricePerMonthSubscriptionAssistiveText : Labels.originalPricePerYearSubscriptionAssistiveText;
      if (hasFirstPymtTotalListPrice || this._isEvergreenSubscription) {
        return getPriceLabel(labelText, originalPrice, this.currencyIsoCode, '{originalPrice}');
      }
    }
    return getPriceLabel(Labels.originalPriceAssistiveText, this.item?.listPrice, this.currencyIsoCode, '{originalPrice}');
  }
  get originalPriceText() {
    if (this._hasSubscription) {
      const hasFirstPymtTotalListPrice = this._hasFirstPaymentTotalListPrice();
      const originalPrice = hasFirstPymtTotalListPrice ? this.item?.firstPymtTotalListPrice : this.item?.listPrice;
      const labelText = this._isMonthlySubscription ? Labels.originalPricePerMonthSubscriptionText : Labels.originalPricePerYearSubscriptionText;
      if (hasFirstPymtTotalListPrice || this._isEvergreenSubscription) {
        return getPriceLabel(labelText, originalPrice, this.currencyIsoCode, '{originalPrice}');
      }
    }
    return currencyFormatter(this.currencyIsoCode, this.item?.listPrice, 'symbol');
  }
  get actualPriceAssistiveText() {
    return getPriceLabel(Labels.actualPriceAssistiveText, this.item?.price, this.currencyIsoCode, '{actualPrice}');
  }
  get subscriptionPriceAssistiveText() {
    const hasFirstPymtPrice = this._hasFirstPaymentPrice();
    if (hasFirstPymtPrice || this._isEvergreenSubscription) {
      const labelText = this._isMonthlySubscription ? Labels.actualPricePerMonthSubscriptionAssistiveText : Labels.actualPricePerYearSubscriptionAssistiveText;
      const amount = hasFirstPymtPrice ? this.item?.firstPymtPrice : this.item?.price;
      return getPriceLabel(labelText, amount, this.currencyIsoCode, '{actualPrice}');
    }
    return getPriceLabel(Labels.actualPriceAssistiveText, this.item?.price, this.currencyIsoCode, '{actualPrice}');
  }
  get actualPriceText() {
    return currencyFormatter(this.currencyIsoCode, this.item?.price, 'symbol');
  }
  _hasFirstPaymentPrice() {
    return Boolean(this.item?.firstPymtPrice);
  }
  _hasFirstPaymentTotalListPrice() {
    return Boolean(this.item?.firstPymtTotalListPrice);
  }
  get subscriptionPriceText() {
    const hasFirstPymtPrice = this._hasFirstPaymentPrice();
    const actualSubscriptionPrice = hasFirstPymtPrice ? this.item?.firstPymtPrice : this.item?.price;
    return currencyFormatter(this.currencyIsoCode, actualSubscriptionPrice, 'symbol');
  }
  get subscriptionTimeUnitText() {
    if (this._hasFirstPaymentPrice() || this._isEvergreenSubscription) {
      const labelTemplate = this._isMonthlySubscription ? Labels.actualPricePerMonthSubscriptionText : Labels.actualPricePerYearSubscriptionText;
      return labelTemplate?.replace('{actualPrice}', '');
    }
    return '';
  }
  get removeButtonAssistiveText() {
    return getProductLabel(Labels.removeItemAssistiveText, this.item?.ProductDetails.name, '{name}');
  }
  get sanitizedProductName() {
    const label = this.item?.ProductDetails.name ?? '';
    if (!import.meta.env.SSR && this.htmlProductNameGate) {
      return sanitizeValue(label);
    }
    return label;
  }
  get itemNameQuantityText() {
    return getProductCountNameLabel(Labels.itemNameQuantityText, this.sanitizedProductName, '{name}', this.item?.quantity?.toString(), '{count}');
  }
  get thumbnailImageUrl() {
    const cmsImageScalingProps = {
      width: 150
    };
    return resourceResolver(this.imageUrl, false, cmsImageScalingProps);
  }
  get imageUrl() {
    return this.item?.ProductDetails.thumbnailImage?.thumbnailUrl || this.item?.ProductDetails.thumbnailImage?.url || '';
  }
  get generatedSkuLabel() {
    const sku = this.item?.ProductDetails?.sku;
    return this.skuLabel.replace('{0}', sku);
  }
  get displaySku() {
    const sku = this.item?.ProductDetails?.sku;
    return this.showSku && !!this.skuLabel?.length && !!sku?.length;
  }
  get displayProductVariants() {
    return this.showProductVariants && Object.keys(this.normalizedProductVariants).length > 0;
  }
  get normalizedProductVariants() {
    return this.item?.ProductDetails?.variationAttributes || {};
  }
  get productVariants() {
    return Object.values(this.normalizedProductVariants).map(variant => {
      return {
        name: variant.label,
        value: variant.value
      };
    });
  }
  get removeButtonText() {
    return Labels.removeButtonText;
  }
  get _showPills() {
    return this._showPromotions || this._showSubscriptions;
  }
  get _showSubscriptions() {
    return Boolean(this.item?.subscriptionType && this.item?.subscriptionType !== 'OneTime');
  }
  get _isMonthlySubscription() {
    return Boolean(this.item?.subscriptionTermUnit && this.item?.subscriptionTermUnit === 'Monthly');
  }
  get _isAnnualSubscription() {
    return Boolean(this.item?.subscriptionTermUnit && this.item?.subscriptionTermUnit === 'Annual');
  }
  get _isEvergreenSubscription() {
    return Boolean(this.item?.subscriptionType && this.item?.subscriptionType === 'Evergreen');
  }
  get _isTermDefinedSubscription() {
    return Boolean(this.item?.subscriptionType && this.item?.subscriptionType === 'TermDefined');
  }
  get _isEvergreenMonthlySubscription() {
    return this._isEvergreenSubscription && this._isMonthlySubscription;
  }
  get _isEvergreenAnnualSubscription() {
    return this._isEvergreenSubscription && this._isAnnualSubscription;
  }
  get _isTermDefinedMonthlySubscription() {
    return this._isTermDefinedSubscription && this._isMonthlySubscription;
  }
  get _isTermDefinedAnnualSubscription() {
    return this._isTermDefinedSubscription && this._isAnnualSubscription;
  }
  get _hasSubscription() {
    return this._isEvergreenMonthlySubscription || this._isEvergreenAnnualSubscription || this._isTermDefinedMonthlySubscription || this._isTermDefinedAnnualSubscription;
  }
  get _subscriptionText() {
    if (this._isEvergreenMonthlySubscription) {
      return Labels.evergreenMonthlySubscriptionTypeText;
    }
    if (this._isEvergreenAnnualSubscription) {
      return Labels.evergreenAnnualSubscriptionTypeText;
    }
    if (this._isTermDefinedMonthlySubscription) {
      return getTermDefinedSubscriptionLabel(Labels.termDefinedMonthlySubscriptionTypeText, String(this.item?.subscriptionTerm), '{subscriptionTerm}');
    }
    if (this._isTermDefinedAnnualSubscription) {
      return getTermDefinedSubscriptionLabel(Labels.termDefinedAnnualSubscriptionTypeText, String(this.item?.subscriptionTerm), '{subscriptionTerm}');
    }
    return '';
  }
  get _isBundleCartItem() {
    return Boolean(this.item?.productClass === 'Bundle');
  }
  get _bundleProductCountText() {
    if (this.item?.childProductCount) {
      return getBundleChildProductCountLabel(this.item.childProductCount);
    }
    return '';
  }
  get images() {
    return createImageDataMap(this.imageUrl, this.imageSizes);
  }
}