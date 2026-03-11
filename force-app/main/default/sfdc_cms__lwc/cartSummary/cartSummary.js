import { api, LightningElement, wire } from 'lwc';
import { CartStatusAdapter, CartContentsAdapter } from 'commerce/checkoutCartApi';
import { AppContextAdapter } from 'commerce/contextApi';
import currency from '@salesforce/i18n/currency';
import canDisplayOriginalPrice from 'site/cartEvaluatePriceOriginal';
import { displayDiscountPrice } from 'site/promotionEvaluatePriceDiscount';
import { generateStyleProperties } from 'experience/styling';
/**
 * @slot headerText
 * @slot originalPriceLabel
 * @slot promotionsLabel
 * @slot shippingLabel
 * @slot subtotalLabel
 * @slot taxIncludedLabel
 * @slot taxLabel
 * @slot totalLabel
 */
export default class CartSummary extends LightningElement {
  static renderMode = 'light';
  _shippingMethodsEnabled = false;
  @api
  backgroundColor;
  @api
  cartTotals;
  @api
  discountAmountTextColor;
  @api
  discountAmountTextSize;
  @api
  originalTextColor;
  @api
  originalTextSize;
  @api
  shippingTextColor;
  @api
  shippingTextSize;
  @api
  showDiscountAmount = false;
  @api
  showOriginalPrice = false;
  @wire(AppContextAdapter)
  appContextHandler(response) {
    if (!response.loading && response.data?.checkoutSettings) {
      this._shippingMethodsEnabled = response.data.checkoutSettings.shippingMethodsEnabled;
    }
  }
  @api
  showShippingPrice = false;
  @api
  showSubtotalPrice = false;
  @api
  showTaxIncludedLabel = false;
  @api
  showTaxPrice = false;
  @api
  subtotalTextColor;
  @api
  subtotalTextSize;
  @api
  taxIncludedLabelFontColor;
  @api
  taxIncludedLabelFontSize;
  @api
  taxTextColor;
  @api
  taxTextSize;
  @api
  totalTextColor;
  @api
  totalTextSize;
  cartSummaryInfo = {};
  _hasCartItems = false;
  _hasSubscriptionProducts = false;
  get cartSummaryCustomCssStyles() {
    const discountAmountDxpTextSize = this.dxpTextSize(this.discountAmountTextSize);
    const originalDxpTextSize = this.dxpTextSize(this.originalTextSize);
    const shippingDxpTextSize = this.dxpTextSize(this.shippingTextSize);
    const subtotalDxpTextSize = this.dxpTextSize(this.subtotalTextSize);
    const textIncludedLabelDxpTextSize = this.dxpTextSize(this.taxIncludedLabelFontSize);
    const taxDxpTextSize = this.dxpTextSize(this.taxTextSize);
    const totalDxpTextSize = this.dxpTextSize(this.totalTextSize);
    const customStylingProperties = [{
      name: 'background-color',
      value: this.backgroundColor
    }, {
      name: '--com-c-cart-summary-discount-amount-text-color',
      value: this.discountAmountTextColor
    }, {
      name: '--com-c-cart-summary-discount-amount-text-size',
      value: `var(${discountAmountDxpTextSize})`
    }, {
      name: '--com-c-cart-summary-original-text-color',
      value: this.originalTextColor
    }, {
      name: '--com-c-cart-summary-original-text-size',
      value: `var(${originalDxpTextSize})`
    }, {
      name: '--com-c-cart-summary-shipping-text-color',
      value: this.shippingTextColor
    }, {
      name: '--com-c-cart-summary-shipping-text-size',
      value: `var(${shippingDxpTextSize})`
    }, {
      name: '--com-c-cart-summary-subtotal-text-color',
      value: this.subtotalTextColor
    }, {
      name: '--com-c-cart-summary-subtotal-text-size',
      value: `var(${subtotalDxpTextSize})`
    }, {
      name: '--com-c-cart-summary-tax-included-label-font-color',
      value: this.taxIncludedLabelFontColor
    }, {
      name: '--com-c-cart-summary-tax-included-label-font-size',
      value: `var(${textIncludedLabelDxpTextSize})`
    }, {
      name: '--com-c-cart-summary-tax-text-color',
      value: this.taxTextColor
    }, {
      name: '--com-c-cart-summary-tax-text-size',
      value: `var(${taxDxpTextSize})`
    }, {
      name: '--com-c-cart-summary-total-text-color',
      value: this.totalTextColor
    }, {
      name: '--com-c-cart-summary-total-text-size',
      value: `var(${totalDxpTextSize})`
    }];
    return generateStyleProperties(customStylingProperties);
  }
  get cartSummaryTotals() {
    return this.cartTotals || this.transformCartTotals();
  }
  get currencyCode() {
    return this.cartSummaryInfo.currencyCode || currency;
  }
  get discountAmount() {
    return this.cartSummaryInfo.totals?.discountAmount;
  }
  get displayCartSummary() {
    return this.cartTotals !== undefined || this._hasCartItems;
  }
  get originalPrice() {
    return this.cartSummaryInfo.totals?.originalPrice;
  }
  get shippingPrice() {
    return this.cartSummaryInfo.totals?.shippingPrice;
  }
  get _showDiscountAmount() {
    return displayDiscountPrice(this.showDiscountAmount, this.discountAmount);
  }
  get _showOriginalPrice() {
    return canDisplayOriginalPrice(true, this.showOriginalPrice, this.subtotalPrice, this.originalPrice);
  }
  get _showTaxPrice() {
    return this.taxType === 'Net' && this.showTaxPrice;
  }
  get subtotalPrice() {
    return this.cartSummaryInfo.totals?.subtotal;
  }
  get _showTaxIncludedLabel() {
    return (!this.cartTotals && this.taxType === 'Gross' || !!this.cartTotals) && this.showTaxIncludedLabel;
  }
  get taxPrice() {
    return this.cartSummaryInfo.totals?.tax;
  }
  get totalPrice() {
    return this.cartSummaryInfo.totals?.total;
  }
  get taxType() {
    switch (this.cartSummaryInfo.taxType) {
      case 'Net':
        return 'Net';
      case 'Gross':
        return 'Gross';
      default:
        return undefined;
    }
  }
  _isCartSummaryLoading = false;
  cartStatusHandler;
  @wire(CartStatusAdapter)
  getCartStatus(cartStatusHandler) {
    this.cartStatusHandler = cartStatusHandler;
    if (this.cartStatusHandler?.data?.isProcessing) {
      this._isCartSummaryLoading = true;
    } else {
      setTimeout(() => {
        if (this._isCartSummaryLoading) {
          this._isCartSummaryLoading = false;
        }
      }, 2000);
    }
  }
  get isCartProcessing() {
    return !!this.cartStatusHandler?.data?.isProcessing || !!this.cartStatusHandler?.loading || !!this._isCartSummaryLoading;
  }
  @wire(CartContentsAdapter)
  cartSummary({
    data
  }) {
    if (data?.cartSummary) {
      this._isCartSummaryLoading = false;
      const summaryData = data.cartSummary;
      this._hasSubscriptionProducts = summaryData.totalSubProductCount !== undefined && parseFloat(summaryData.totalSubProductCount) > 0;
      this.cartSummaryInfo = {
        currencyCode: summaryData.currencyIsoCode || undefined,
        taxType: summaryData.taxType || undefined,
        totals: {
          discountAmount: summaryData.totalCartLevelAdjustmentAmount,
          originalPrice: this._hasSubscriptionProducts && summaryData.firstPymtTotalListPrice ? summaryData.firstPymtTotalListPrice : summaryData.totalProductListAmount,
          shippingPrice: summaryData.totalChargeAmountWithItemAdjustment,
          subtotal: this._hasSubscriptionProducts && summaryData.firstPymtTotalAmount ? summaryData.firstPymtTotalAmount : summaryData.totalAmountWithItemAdjustment,
          tax: this._hasSubscriptionProducts && summaryData.firstPymtTotalTaxAmount ? summaryData.firstPymtTotalTaxAmount : summaryData.totalTaxAmount,
          total: this._hasSubscriptionProducts && summaryData.firstPymtGrandTotalAmount ? summaryData.firstPymtGrandTotalAmount : summaryData.grandTotalAmount
        }
      };
      this._hasCartItems = summaryData.uniqueProductCount !== undefined && summaryData.uniqueProductCount > 0;
    }
  }
  dxpTextSize(fontSizeValue) {
    switch (fontSizeValue) {
      case 'small':
        return '--dxp-s-text-heading-small-font-size';
      case 'medium':
        return '--dxp-s-text-heading-medium-font-size';
      case 'large':
        return '--dxp-s-text-heading-large-font-size';
      default:
        return '';
    }
  }
  transformCartTotals() {
    return {
      discountAmount: this._showDiscountAmount ? this.discountAmount : undefined,
      originalPrice: this._showOriginalPrice ? this.originalPrice : undefined,
      shippingPrice: this.showShippingPrice && this._shippingMethodsEnabled ? this.shippingPrice : undefined,
      subtotal: this.showSubtotalPrice ? this.subtotalPrice : undefined,
      tax: this._showTaxPrice ? this.taxPrice : undefined,
      total: this.totalPrice ? this.totalPrice : undefined
    };
  }
}