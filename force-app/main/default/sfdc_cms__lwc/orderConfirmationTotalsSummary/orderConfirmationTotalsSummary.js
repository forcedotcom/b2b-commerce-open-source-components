import { api, LightningElement, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import currency from '@salesforce/i18n/currency';
import canDisplayOriginalPrice from 'site/cartEvaluatePriceOriginal';
import { displayDiscountPrice } from 'site/promotionEvaluatePriceDiscount';
import { generateStyleProperties } from 'experience/styling';
function getNumberOfDecimalPlaces(value) {
  if (Math.floor(value) === value) {
    return 0;
  }
  return value.toString().split('.')[1].length;
}
function addAndFormatValues(...values) {
  const scale = Math.max(0, ...values.map(getNumberOfDecimalPlaces));
  return values.reduce((sum, val) => sum + val, 0).toFixed(scale);
}

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
export default class OrderConfirmationTotalsSummary extends LightningElement {
  static renderMode = 'light';
  @api
  summary;
  @api
  backgroundColor;
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
  @api
  showShippingPrice = false;
  @api
  showSubtotalPrice = false;
  @api
  showTaxPrice = false;
  @api
  showTaxIncludedLabel = false;
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
  @api
  get shippingMethodsEnabled() {
    return this._shippingMethodsEnabled;
  }
  set shippingMethodsEnabled(value) {
    this._shippingMethodsEnabled = value;
  }
  @wire(AppContextAdapter)
  appContextHandler(response) {
    if (!response.loading && response.data?.checkoutSettings) {
      this._shippingMethodsEnabled = response.data.checkoutSettings.shippingMethodsEnabled;
    }
  }
  get summaryCustomCssStyles() {
    const discountAmountDxpTextSize = this.dxpTextSize(this.discountAmountTextSize);
    const originalDxpTextSize = this.dxpTextSize(this.originalTextSize);
    const shippingDxpTextSize = this.dxpTextSize(this.shippingTextSize);
    const subtotalDxpTextSize = this.dxpTextSize(this.subtotalTextSize);
    const taxIncludedLabelDxpTextSize = this.dxpTextSize(this.taxIncludedLabelFontSize);
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
      value: `var(${taxIncludedLabelDxpTextSize})`
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
  get paymentSummaryTotals() {
    return this.transformTotals();
  }
  get displaySummary() {
    return !!this.summary;
  }
  _shippingMethodsEnabled = false;
  get currencyCode() {
    return this.summary?.currencyIsoCode || currency;
  }
  get discountAmount() {
    return (this.summary?.fields?.TotalCartLevelAdjAmount?.text || this.summary?.adjustmentAggregates?.totalProductPromotionDistAmount) ?? undefined;
  }
  get originalPrice() {
    return this.getPriceVal(this.summary?.fields?.TotalFirstPymtListAmount?.text, this.summary?.fields?.TotalProductListAmount?.text);
  }
  get shippingPrice() {
    return this.summary?.fields?.TaxLocaleType?.text === 'Gross' && this.summary?.id ? this.summary?.fields?.TotalAdjDeliveryAmtWithTax?.text ?? undefined : this.summary?.fields?.TotalAdjustedDeliveryAmount?.text ?? undefined;
  }
  get _showDiscountAmount() {
    return displayDiscountPrice(this.showDiscountAmount, this.discountAmount);
  }
  get _showOriginalPrice() {
    return canDisplayOriginalPrice(true, this.showOriginalPrice, this.subtotalPrice, this.originalPrice);
  }
  get _showTaxPrice() {
    return this.summary?.fields?.TaxLocaleType?.text === 'Net' && this.showTaxPrice;
  }
  get subtotalPrice() {
    let priceField;
    if (this.summary?.id) {
      const isGross = this.summary?.fields?.TaxLocaleType?.text === 'Gross';
      const getFieldValue = fieldName => this.summary?.fields?.[fieldName]?.text || '';
      const fields = isGross ? ['TotalProductFirstPmtAmtWithTax', 'TotalProductFirstPmtLineAdjAmtWithTax', 'TotalAdjProductAmtWithTax'] : ['TotalProductFirstPmtAmt', 'TotalProductFirstPmtLineAdjAmt', 'TotalAdjustedProductAmount'];
      const firstPmtAmt = Number(getFieldValue(fields[0]));
      const firstPmtLineAdj = Number(getFieldValue(fields[1]));
      priceField = firstPmtAmt > 0 ? addAndFormatValues(firstPmtAmt, firstPmtLineAdj) : getFieldValue(fields[2]);
    } else {
      const hasSubscriptionProducts = Number(this.summary?.fields?.TotalSubProductCount?.text || 0) > 0;
      priceField = hasSubscriptionProducts && this.summary?.fields?.FirstPymtTotalProductAmountWithItemAdjustments?.text ? this.summary?.fields?.FirstPymtTotalProductAmountWithItemAdjustments?.text : this.summary?.fields?.TotalAdjustedProductAmount?.text;
    }
    return priceField ?? undefined;
  }
  get _showTaxIncludedLabel() {
    return this.summary?.fields?.TaxLocaleType?.text === 'Gross' && this.showTaxIncludedLabel;
  }
  get taxIncludedLabelClass() {
    return this._showTaxIncludedLabel ? 'slds-p-top_small' : 'slds-p-top_small slds-hide';
  }
  get taxPrice() {
    return this.getPriceVal(this.summary?.fields?.TotalFirstPaymentTaxAmount?.text, this.summary?.fields?.TotalTaxAmount?.text);
  }
  get totalPrice() {
    return this.getPriceVal(this.summary?.fields?.GrandTotalFirstPaymentAmount?.text, this.summary?.fields?.GrandTotalAmount?.text);
  }
  getPriceVal(subscriptionPrice, price) {
    if (!this.summary?.id && subscriptionPrice && Number(subscriptionPrice) > 0) {
      return subscriptionPrice;
    }
    return price ?? undefined;
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
  transformTotals() {
    return {
      discountAmount: this._showDiscountAmount ? this.discountAmount : undefined,
      originalPrice: this._showOriginalPrice ? this.originalPrice : undefined,
      shippingPrice: this.showShippingPrice && this.shippingMethodsEnabled ? this.shippingPrice : undefined,
      subtotal: this.showSubtotalPrice ? this.subtotalPrice : undefined,
      tax: this._showTaxPrice ? this.taxPrice : undefined,
      total: this.totalPrice ? this.totalPrice : undefined
    };
  }
}