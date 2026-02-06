import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { ProductAdapter } from 'commerce/productApi';
import { isVariantSupportedProductClass } from 'site/productVariantSelectorUi';
import { createProductVariantUpdateAction, dispatchAction } from 'commerce/actionApi';
import { generateStyleProperties } from 'experience/styling';
import { isDesignMode } from 'experience/clientApi';
/**
 * @slot heading
 */
export default class ProductVariantSelector extends LightningElement {
  static renderMode = 'light';
  @api
  product;
  @api
  pillTextColor;
  @api
  pillBackgroundColor;
  @api
  pillBorderColor;
  @api
  pillBorderHoverColor;
  @api
  pillBorderSelectedColor;
  @api
  pillBorderRadius = 5;
  @api
  swatchBorderColor;
  @api
  swatchBorderHoverColor;
  @api
  swatchBorderSelectedColor;
  @api
  swatchBorderRadius = 50;
  @api
  outOfStockText;
  @api
  assistiveOutOfStockText;
  @wire(NavigationContext)
  navContext;
  selectedProductId;
  selectedUrlName;
  shouldNavigate = false;
  @wire(ProductAdapter, {
    productId: '$selectedProductId'
  })
  handleProductAdapter({
    loaded
  }) {
    if (loaded && this.shouldNavigate && this.selectedProductId) {
      navigate(this.navContext, {
        type: 'standard__recordPage',
        attributes: {
          objectApiName: 'Product2',
          recordId: this.selectedProductId,
          actionName: 'view',
          urlName: this.selectedUrlName
        },
        state: {
          recordName: 'Product2'
        }
      });
      this.shouldNavigate = false;
      this.selectedProductId = undefined;
      this.selectedUrlName = undefined;
    }
  }
  get isDisplayable() {
    return isVariantSupportedProductClass(this.product?.productClass);
  }
  async handleVariantOptionChanged(event) {
    event.stopPropagation();
    const {
      productId,
      options,
      isValid,
      urlName
    } = event.detail;
    dispatchAction(this, createProductVariantUpdateAction(options, isValid));
    if (isValid && productId && !isDesignMode) {
      this.selectedProductId = productId;
      this.selectedUrlName = urlName;
      this.shouldNavigate = true;
    }
  }
  get productVariantStyleString() {
    return generateStyleProperties([{
      name: '--com-c-site-product-variant-pill-text-color',
      value: this.pillTextColor
    }, {
      name: '--com-c-site-product-variant-pill-background-color',
      value: this.pillBackgroundColor
    }, {
      name: '--com-c-site-product-variant-pill-border-color',
      value: this.pillBorderColor
    }, {
      name: '--com-c-site-product-variant-pill-border-radius',
      value: this.pillBorderRadius,
      suffix: 'px'
    }, {
      name: '--com-c-site-product-variant-pill-border-hover-color',
      value: this.pillBorderHoverColor
    }, {
      name: '--com-c-site-product-variant-pill-border-selected-color',
      value: this.pillBorderSelectedColor
    }, {
      name: '--com-c-commerce-product-variant-swatch-border-color',
      value: this.swatchBorderColor
    }, {
      name: '--com-c-commerce-product-variant-swatch-border-selected-color',
      value: this.swatchBorderSelectedColor
    }, {
      name: '--com-c-commerce-product-variant-swatch-border-radius',
      value: this.swatchBorderRadius,
      suffix: 'px'
    }, {
      name: '--com-c-commerce-product-variant-swatch-border-hover-color',
      value: this.swatchBorderHoverColor
    }]);
  }
  renderedCallback() {
    this.classList.toggle('slds-hide', !this.isDisplayable);
  }
}