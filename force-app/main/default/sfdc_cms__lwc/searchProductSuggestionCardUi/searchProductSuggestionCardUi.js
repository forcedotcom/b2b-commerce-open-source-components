import { LightningElement, api, wire } from 'lwc';
import { createImageDataMap } from 'experience/picture';
import { resolve } from 'experience/resourceResolver';
import { generateUrl, NavigationContext, navigate } from 'lightning/navigation';
import { sanitizeValueAndDecodeEntities } from 'site/commonRichtextsanitizerUtils';
const IMAGE_SIZES = {
  mobile: 300,
  tablet: 130,
  desktop: 330
};
export default class SearchProductSuggestionCardUi extends LightningElement {
  static renderMode = 'light';
  @api
  displayData;
  @wire(NavigationContext)
  navContext;
  get tooltipText() {
    return sanitizeValueAndDecodeEntities(this.displayData?.name);
  }
  get image() {
    const img = this.displayData?.defaultImage;
    return {
      alternateText: img?.alternateText ?? '',
      url: resolve(img?.url ?? '', false, {
        width: 460
      }),
      images: createImageDataMap(img?.url, IMAGE_SIZES)
    };
  }
  get productUrl() {
    return this.displayData?.id && this.navContext ? generateUrl(this.navContext, {
      type: 'standard__recordPage',
      attributes: {
        objectApiName: 'Product2',
        recordId: this.displayData.id,
        actionName: 'view'
      }
    }) : undefined;
  }
  get pricingInfo() {
    const prices = this.displayData?.prices;
    const isPromotionalPriceApplied = prices?.promotionalPrices && Number(prices.promotionalPrices?.promotionalPrice) < Number(prices.promotionalPrices?.salesPrice);
    return isPromotionalPriceApplied ? {
      negotiatedPrice: prices?.promotionalPrices?.promotionalPrice,
      listPrice: prices?.promotionalPrices?.salesPrice,
      currencyIsoCode: prices?.currencyIsoCode
    } : {
      negotiatedPrice: prices?.negotiatedPrice,
      listPrice: prices?.listingPrice,
      currencyIsoCode: prices?.currencyIsoCode
    };
  }
  handleProductDetailPageNavigation(event) {
    event.stopPropagation();
    const productId = this.displayData?.id;
    if (productId) {
      navigate(this.navContext, {
        type: 'standard__recordPage',
        attributes: {
          objectApiName: 'Product2',
          recordId: productId,
          actionName: 'view'
        }
      });
    }
  }
}