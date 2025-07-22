import { api, LightningElement, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { isPreviewMode } from 'experience/clientApi';
import { computePurchaseRuleSet } from './utils';
import { handleAddToCartErrorWithToast } from 'site/productAddToCartUtils';
import { handleAddToWishlistSuccessWithToast, handleAddToWishlistErrorWithToast } from 'site/productWishlistUtil';
import { toCommerceError } from 'commerce/checkoutCartApi';
import { SessionContextAdapter } from 'commerce/contextApi';
import { generateStyleProperties } from 'experience/styling';
import { ProductErrors } from 'site/commerceErrors';
import { createCartItemAddAction, createProductQuantityUpdateAction, createWishlistItemAddAction, dispatchAction } from 'commerce/actionApi';
const GUEST_INSUFFICIENT_ACCESS = 'GUEST_INSUFFICIENT_ACCESS';

/**
 * @slot combinedPurchaseQuantityRuleInfo
 */
export default class ProductPurchaseOptions extends LightningElement {
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @wire(SessionContextAdapter)
  sessionContext;
  @api
  product;
  @api
  productPricing;
  @api
  productInventory;
  @api
  productVariant;
  @api
  selectedProductSellingModel;
  @api
  addToCartButtonBackgroundColor;
  @api
  addToCartButtonBackgroundHoverColor;
  @api
  addToCartButtonBorderColor;
  @api
  addToCartButtonBorderRadius;
  @api
  addToCartButtonText;
  @api
  addToCartButtonProcessingText;
  @api
  addToCartButtonTextColor;
  _errors;
  @api
  get errors() {
    return this._errors;
  }
  set errors(value) {
    this._errors = value;
  }
  @api
  get parsedErrors() {
    if (Array.isArray(this.errors)) {
      return this.errors;
    }
    if (typeof this.errors === 'string') {
      try {
        return JSON.parse(this.errors);
      } catch {
        return [];
      }
    }
    return [];
  }
  @api
  addToCartButtonTextHoverColor;
  @api
  addToListButtonText;
  @api
  showAddToListButton;
  @api
  addToListButtonTextColor;
  @api
  addToListButtonTextHoverColor;
  @api
  addToListButtonBackgroundColor;
  @api
  addToListButtonBackgroundHoverColor;
  @api
  addToListButtonBorderColor;
  @api
  addToListButtonBorderRadius;
  @api
  quantitySelectorLabel;
  @api
  minimumValueGuideText;
  @api
  maximumValueGuideText;
  @api
  incrementValueGuideText;
  @api
  outOfStockText;
  get quantity() {
    return Number(this.product?.quantity);
  }
  get computedAddToCartButtonText() {
    return this.isCartProcessing && this.addToCartButtonProcessingText ? this.addToCartButtonProcessingText : this.addToCartButtonText;
  }
  get isAddToListButtonDisabled() {
    return Boolean(this.product?.productSellingModels) || this.product?.productClass === 'VariationParent';
  }
  isAddToCartInProgress = false;
  get isCartProcessing() {
    return this.isAddToCartInProgress;
  }
  get availableQuantity() {
    return this.productInventory?.details?.availableToOrder ?? null;
  }
  get quantityRule() {
    return this.product?.purchaseQuantityRule;
  }
  get quantityGuides() {
    return {
      minimumValueGuideText: this.minimumValueGuideText,
      maximumValueGuideText: this.maximumValueGuideText,
      incrementValueGuideText: this.incrementValueGuideText
    };
  }
  handleQuantityChanged({
    detail
  }) {
    dispatchAction(this, createProductQuantityUpdateAction(this.product.id, Number(detail.value), detail.isValid));
  }
  get addToCartButtonCssStyles() {
    return generateStyleProperties({
      '--com-c-button-primary-color': this.addToCartButtonTextColor || 'initial',
      '--com-c-button-primary-color-background': this.addToCartButtonBackgroundColor || 'initial',
      '--com-c-button-primary-color-background-hover': this.addToCartButtonBackgroundHoverColor || 'initial',
      '--com-c-button-primary-color-border': this.addToCartButtonBorderColor || 'initial',
      '--com-c-button-primary-color-hover': this.addToCartButtonTextHoverColor || 'initial',
      '--com-c-button-radius-border': this.addToCartButtonBorderRadius ? this.addToCartButtonBorderRadius + 'px' : 'initial'
    });
  }
  get addToWishlistButtonCssStyles() {
    return generateStyleProperties({
      '--com-c-button-primary-color': this.addToListButtonTextColor || 'initial',
      '--com-c-button-primary-color-background': this.addToListButtonBackgroundColor || 'initial',
      '--com-c-button-primary-color-background-hover': this.addToListButtonBackgroundHoverColor || 'initial',
      '--com-c-button-primary-color-border': this.addToListButtonBorderColor || 'initial',
      '--com-c-button-primary-color-hover': this.addToListButtonTextHoverColor || 'initial',
      '--com-c-button-radius-border': this.addToListButtonBorderRadius ? this.addToListButtonBorderRadius + 'px' : 'initial'
    });
  }
  get isAddToCartButtonDisabled() {
    if (isPreviewMode) {
      return false;
    }
    return this.isCartProcessing || !this.productPricing || Object.keys(this.productPricing).length === 0 || this.productVariant?.isValid === false || this.product?.productClass === 'VariationParent' || (this.product?.productSellingModels?.length ?? 0) > 0 && !this.selectedProductSellingModel;
  }
  handleAddToCart({
    detail,
    target
  }) {
    this.isAddToCartInProgress = true;
    dispatchAction(target, createCartItemAddAction(this.product.id, detail.quantity), {
      onSuccess: () => {
        this.isAddToCartInProgress = false;
      },
      onError: error => {
        this.isAddToCartInProgress = false;
        const {
          code
        } = toCommerceError(error);
        if (code === GUEST_INSUFFICIENT_ACCESS) {
          this.navigateToLogin();
        } else {
          handleAddToCartErrorWithToast(toCommerceError(error), this);
        }
      }
    });
  }
  handleAddToWishlist() {
    if (this.product) {
      dispatchAction(this, createWishlistItemAddAction(this.product.id), {
        onSuccess: () => handleAddToWishlistSuccessWithToast(this),
        onError: () => {
          const isLoggedIn = this.sessionContext?.data?.isLoggedIn;
          if (!isLoggedIn) {
            this.navigateToLogin();
          } else {
            handleAddToWishlistErrorWithToast(this);
          }
        }
      });
    }
  }
  navigateToLogin() {
    this.navContext && navigate(this.navContext, {
      type: 'comm__namedPage',
      attributes: {
        name: 'Login'
      }
    });
  }
  get purchaseRuleSet() {
    return computePurchaseRuleSet(this.quantityRule, this.quantityGuides);
  }
  get displayCombinedPurchaseQuantityRule() {
    return Boolean(typeof this.product?.purchaseQuantityRule?.increment === 'number' && typeof this.product?.purchaseQuantityRule?.maximum === 'number' && typeof this.product?.purchaseQuantityRule?.minimum === 'number');
  }
  @api
  get isOutOfStock() {
    const inventoryErrors = this.parsedErrors?.filter(err => err?.code === ProductErrors.OUT_OF_STOCK.code);
    return inventoryErrors.length > 0;
  }
  get displayAddQuantity() {
    return this.product !== undefined && this.product !== null;
  }
  get isDisplayable() {
    return this.product?.productClass !== 'Set';
  }
  renderedCallback() {
    this.classList.toggle('slds-hide', !this.isDisplayable);
  }
}