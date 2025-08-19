import { LightningElement, api } from 'lwc';
import previousPriceAssistiveText from '@salesforce/label/site.productPricingDetailsUi.previousPriceAssistiveText';
import displayOriginalPriceEvaluator from './productPricingDetailsUiUtils';
import { getEffectivePrice, getProductSellingModelNegotiatedPrice, isPromotionPriceApplicable, isSubscriptionActive, getNormalizedValue } from './productSellingModelService';
import { subscriptionPrice, combinedPromotionText } from './labels';
import { getPriceTermUnitLabel } from 'site/productSubscriptionSelector';
import format from 'site/commonFormatterCurrency';
export default class ProductPricingDetailsUi extends LightningElement {
  static renderMode = 'light';
  get previousPriceAssistiveText() {
    return previousPriceAssistiveText;
  }
  @api
  productPricing;
  @api
  promotionalPricing;
  @api
  lifeTimeProductSellingModelPrice;
  @api
  selectedProductSellingModel;
  @api
  priceType;
  @api
  mainPriceLabel;
  @api
  strikethroughPriceLabel;
  @api
  finalPriceLabel;
  @api
  unavailablePriceLabel;
  @api
  lowestUnitPriceLabel;
  @api
  combinePromosThreshold;
  @api
  get negotiatedPrice() {
    return getEffectivePrice(this.lifeTimeProductSellingModelPrice?.negotiatedPrice, getProductSellingModelNegotiatedPrice(this.selectedProductSellingModel?.price, this.selectedProductSellingModel?.subscriptionTerm), this.productPricing?.negotiatedPrice, this.priceType);
  }
  @api
  get originalPrice() {
    return getEffectivePrice(this.lifeTimeProductSellingModelPrice?.listPrice, this.selectedProductSellingModel?.price.listPrice, this.productPricing?.listPrice, this.priceType);
  }
  @api
  get promotionalPrice() {
    if (isPromotionPriceApplicable(this.priceType, this.selectedProductSellingModel?.detail.sellingModelType) && this.promotionalPricing && this.promotionalPricing.promotionPriceAdjustmentList) {
      return this.promotionalPricing?.promotionalPrice;
    }
    return undefined;
  }
  get mainPrice() {
    switch (this.pricingType) {
      case '2_TIER':
      case '1_TIER':
        return this.promotionalPrice || this.negotiatedPrice || this.originalPrice;
      default:
        if (this.promotionalPrice && this.negotiatedPrice && this.originalPrice) {
          return this.negotiatedPrice;
        }
        return this.promotionalPrice || this.negotiatedPrice || this.originalPrice;
    }
  }
  get mainPriceStyles() {
    return ['main-price-container', ...(!this.displayFinalPrice ? ['no-promotions'] : [])];
  }
  get subscriptionMainPrice() {
    return subscriptionPrice.replace('{price}', format(getNormalizedValue(this.productPricing?.currencyIsoCode), this.mainPrice)).replace('{priceTermUnit}', getPriceTermUnitLabel(getNormalizedValue(this.selectedProductSellingModel?.detail.pricingTermUnit)));
  }
  get subscriptionStrikethroughPrice() {
    return subscriptionPrice.replace('{price}', format(getNormalizedValue(this.productPricing?.currencyIsoCode), this.strikethroughPrice)).replace('{priceTermUnit}', getPriceTermUnitLabel(getNormalizedValue(this.selectedProductSellingModel?.detail.pricingTermUnit)));
  }
  get _displaySubscriptionPrice() {
    return isSubscriptionActive(this.priceType, this.selectedProductSellingModel?.detail.sellingModelType);
  }
  @api
  get strikethroughPrice() {
    if (this.pricingType === '2_TIER' && !!this.originalPrice && !!this.negotiatedPrice && !!this.promotionalPrice) {
      return this.negotiatedPrice;
    } else if (!!this.originalPrice && (!!this.negotiatedPrice && this.displayOriginalPrice || this.promotionalPrice)) {
      return this.originalPrice;
    } else if (!!this.negotiatedPrice && !!this.promotionalPrice) {
      return this.negotiatedPrice;
    }
    return undefined;
  }
  @api
  get finalPrice() {
    if (!!this.promotionalPrice && !!this.negotiatedPrice && !!this.originalPrice && !!this.displayOriginalPrice) {
      return this.promotionalPrice;
    }
    return undefined;
  }
  @api
  get promotionalMessages() {
    if (this.promotionalPricing) {
      const messageArray = [];
      if (this.promotionalPricing.promotionPriceAdjustmentList) {
        this.promotionalPricing?.promotionPriceAdjustmentList?.forEach(adjustment => {
          if (adjustment.displayName) {
            messageArray.push(adjustment.displayName);
          }
        });
        return messageArray;
      }
    }
    return undefined;
  }
  @api
  get currencyCode() {
    return this.productPricing?.currencyIsoCode || undefined;
  }
  @api
  pricingType;
  @api
  showTaxIndication = false;
  @api
  taxIncludedLabel;
  @api
  taxLocaleType;
  @api
  taxRate;
  get taxInfoVisible() {
    if (this.showTaxIndication) {
      return this.isPriceAvailable && (this.taxLocaleType === 'Gross' || this.taxLocaleType === 'Automatic') && this.taxRate !== 0 && this.taxRate !== undefined;
    }
    return false;
  }
  get displayOriginalPrice() {
    return displayOriginalPriceEvaluator(true, this.pricingType === '3_TIER' || this.pricingType === '2_TIER', this.negotiatedPrice, this.originalPrice);
  }
  get displayStrikethroughPrice() {
    return (this.pricingType === '3_TIER' || this.pricingType === '2_TIER') && !!this.strikethroughPrice;
  }
  get displayFinalPrice() {
    return this.pricingType === '3_TIER' && !!this.finalPrice;
  }
  get displayPromotionalMessage() {
    return Boolean(this.promotionalMessages && !this.isPromotionsThresholdExceeded);
  }
  get displayAssistiveText() {
    return this.displayStrikethroughPrice;
  }
  get isPriceAvailable() {
    return !!this.mainPrice;
  }
  get hasMainPriceLabel() {
    return !!this.mainPriceLabel;
  }
  get hasStrikethroughPriceLabel() {
    return !!this.displayStrikethroughPrice && !!this.strikethroughPriceLabel;
  }
  get hasFinalPriceLabel() {
    return !!this.finalPriceLabel;
  }
  get hasLowestUnitPriceLabel() {
    return !!this.lowestUnitPriceLabel;
  }
  get hasLowestUnitPrice() {
    return !!this.productPricing?.lowestUnitPrice;
  }
  get lowestUnitPrice() {
    return this.productPricing?.lowestUnitPrice;
  }
  get isPromotionsThresholdExceeded() {
    if (this.promotionalPricing?.promotionPriceAdjustmentList && this.combinePromosThreshold) {
      return this.promotionalPricing.promotionPriceAdjustmentList.length > Number(this.combinePromosThreshold);
    }
    return false;
  }
  get combinedPromotionMessage() {
    if (this.strikethroughPrice) {
      const originalPrice = Number(this.strikethroughPrice);
      const adjustedPrice = Number(this.mainPrice);
      const adjustment = String(Math.round(100 * (originalPrice - adjustedPrice) / originalPrice));
      return combinedPromotionText.replace('{promotionAdjustment}', adjustment);
    }
    return '';
  }
}