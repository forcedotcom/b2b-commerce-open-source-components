import { transformCartItemData } from './transformers';
import { remapData } from './transformers';
import { ANCHOR_PRODUCT_RECORD, ANCHOR_CATEGORY_RECORD } from './constants';
import { getProductCollection, getProductPricingCollection, getProductRecommendations } from 'commerce/productApi';
import { getPromotionPricingCollection } from 'commerce/promotionApi';
import { generateUrl } from 'lightning/navigation';
const cartItemDescDataMap = {
  id: 'cartItemId',
  name: 'name',
  type: 'type',
  messages: 'messagesSummary',
  subscriptionId: 'productSellingModelId',
  subscriptionType: 'sellingModelType',
  subscriptionTermUnit: 'billingFrequency',
  productClass: 'productClass',
  childProductCount: 'childProductCount',
  subType: 'subType',
  promotionDisplayName: 'promotionDisplayName'
};
const cartItemNumberDataMap = {
  quantity: 'quantity',
  salesPrice: 'salesPrice',
  itemizedAdjustmentAmount: 'itemizedAdjustmentAmount',
  adjustmentAmount: 'totalAdjustmentAmount',
  amount: 'totalAmount',
  listPrice: 'totalListPrice',
  price: 'totalPrice',
  tax: 'totalTax',
  unitAdjustedPrice: 'unitAdjustedPrice',
  unitAdjustedPriceWithItemAdj: 'unitAdjustedPriceWithItemAdj',
  unitAdjustmentAmount: 'unitAdjustmentAmount',
  unitItemAdjustmentAmount: 'unitItemAdjustmentAmount',
  subscriptionTerm: 'subscriptionTerm',
  firstPymtAmount: 'firstPymtTotalAmount',
  firstPymtPrice: 'firstPymtTotalPrice'
};
const productDetailsDataMap = {
  name: 'name',
  fields: 'fields',
  purchaseQuantityRule: 'purchaseQuantityRule',
  sku: 'sku',
  thumbnailImage: 'thumbnailImage',
  productId: 'productId',
  variationAttributes: 'variationAttributes',
  productSubscriptionInformation: 'productSubscriptionInformation',
  productUrlName: 'productUrlName'
};
function remapCartMessages(messagesData) {
  if (!messagesData) {
    return undefined;
  }
  const remappedCartMessages = messagesData.reduce((messaageDataAccumulator, messageData) => {
    if (messageData.severity === 'Error' && (messageData.type === 'Inventory' || messageData.type === 'Pricing' || messageData.type === 'Promotions' || messageData.type === 'Entitlement')) {
      messaageDataAccumulator.push({
        message: messageData.message,
        severity: messageData.severity,
        type: messageData.type
      });
    }
    return messaageDataAccumulator;
  }, []);
  return remappedCartMessages;
}
export function remapCartItems(data) {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map(({
    cartItem
  }) => {
    const cartItemDataBase = remapData(cartItemDescDataMap, cartItem);
    const cartItemNumberData = transformCartItemData(cartItem, cartItemNumberDataMap);
    const productDetailData = remapData(productDetailsDataMap, cartItem?.productDetails);
    const enhancedCartItemDataBase = {
      ...cartItemDataBase,
      subscriptionType: productDetailData.productSubscriptionInformation?.sellingModelType
    };
    return {
      ...enhancedCartItemDataBase,
      ...cartItemNumberData,
      ProductDetails: productDetailData,
      Messages: remapCartMessages(cartItem?.messagesSummary?.limitedMessages)
    };
  });
}
const getProductPricesById = productPrices => {
  return productPrices.reduce((acc, prices) => {
    acc[prices.productId] = prices;
    return acc;
  }, {});
};
export const getProductDataById = productOverview => {
  return productOverview.reduce((acc, productData) => {
    acc[productData.id] = productData;
    return acc;
  }, {});
};
export const transformToFieldValues = fields => {
  const fieldsData = {};
  Object.entries(fields).forEach(([key, val]) => {
    fieldsData[key] = {
      value: val
    };
  });
  return fieldsData;
};
export function getPromotionalPricesById(promotionProducts) {
  return promotionProducts.reduce((acc, prices) => {
    acc[prices.productId] = prices;
    return acc;
  }, {});
}
export function getAnchorValues(anchor, recordId, anchorValues) {
  const isRecordAnchor = anchor === ANCHOR_PRODUCT_RECORD || anchor === ANCHOR_CATEGORY_RECORD;
  if (isRecordAnchor && recordId) {
    return [recordId];
  } else if (anchorValues) {
    return anchorValues;
  }
  return [];
}
export function extendRecommendationWithProductData(products, productOverview, productPrices, promotionProducts) {
  const productDataById = getProductDataById(productOverview);
  const productPrice = getProductPricesById(productPrices);
  const promotionalPrices = getPromotionalPricesById(promotionProducts);
  products.forEach(product => {
    const productId = product.id;
    if (!productId) {
      return;
    }
    const productOverviewData = productDataById[productId];
    const priceData = productPrice[productId];
    const promotionData = promotionalPrices[productId];
    if (!productOverviewData?.success) {
      return;
    }
    if (productOverviewData) {
      const transformedFields = transformToFieldValues(productOverviewData.fields);
      product.data = {
        ...product.data,
        defaultImage: productOverviewData.defaultImage,
        mediaGroups: productOverviewData.mediaGroups,
        fields: transformedFields,
        name: productOverviewData?.name || null,
        productClass: productOverviewData?.productClass || null,
        variationAttributeSet: productOverviewData.variationAttributeSet || null,
        productSellingModelInformation: {
          isSubscriptionProduct: Boolean(productOverviewData.productSellingModels?.length)
        },
        variationInfo: productOverviewData.variationInfo
      };
    }
    if (priceData || promotionData) {
      const {
        salesPrice,
        promotionalPrice,
        promotionPriceAdjustmentList
      } = promotionData || {};
      const prices = {
        ...priceData,
        promotionalPrices: {
          salesPrice,
          promotionalPrice,
          promotionPriceAdjustmentList
        }
      };
      product.data = {
        ...product.data,
        prices
      };
    }
  });
  return products;
}
export function toCollection(records) {
  return records.map(data => ({
    id: data.id,
    key: data.id,
    data
  }));
}
export async function getProductInformation(productIds, recommendationItems) {
  const promotionProducts = productIds.map(productId => ({
    productId
  }));
  const productDetailsPromise = getProductCollection({
    ids: productIds,
    excludePrices: true
  });
  const priceDataPromise = getProductPricingCollection({
    productIds
  });
  const productPromotionPriceDataPromise = getPromotionPricingCollection({
    products: promotionProducts
  });
  const [productDetailResults, priceDataResults, productPromotionResults] = await Promise.all([productDetailsPromise, priceDataPromise, productPromotionPriceDataPromise]);
  const productDetails = productDetailResults.products;
  const priceData = priceDataResults.pricingLineItemResults;
  const productPromotionPriceData = productPromotionResults.promotionProductEvaluationResults;
  return extendRecommendationWithProductData(recommendationItems, productDetails, priceData, productPromotionPriceData);
}
export function isItemOnWishlist(wishlistProducts, itemId) {
  const wishlistItem = wishlistProducts.find(item => {
    return item.productId === itemId;
  });
  return Boolean(wishlistItem);
}
export function transformRecommendationCollection(recommendationData, recommendationPriceDisplayType, wishlistProducts, navContext) {
  return recommendationData?.map((item, index) => {
    const length = recommendationData?.length;
    const data = item.data;
    return {
      id: `${item.id}`,
      key: `media-gallery-slide-${item.id}`,
      data: {
        ...data,
        prices: {
          ...data.prices,
          listPrice: recommendationPriceDisplayType === 'displayAllPrices' && data.prices ? data.prices.listPrice : undefined
        },
        urlName: item.id ? generateUrl(navContext, {
          type: 'standard__recordPage',
          attributes: {
            objectApiName: 'Product2',
            recordId: item.id,
            actionName: 'view',
            ...(item.data.urlName && {
              urlName: item.data.urlName
            })
          }
        }) : undefined,
        images: data.defaultImage,
        isOnWishlist: isItemOnWishlist(wishlistProducts, item.id || '')
      },
      isActive: index === 0,
      slideTitle: `slide ${index + 1} of ${length}`
    };
  });
}
export async function retrieveRecommendationData() {
  let result = [];
  try {
    const recResult = await getProductRecommendations({
      anchorValues: [],
      recommender: 'CustomersWhoBoughtAlsoBought',
      includePricingAndProductInformation: false,
      anchorFromCurrentCart: true
    });
    if (recResult) {
      const recommendationItems = toCollection(recResult.productPage.products);
      if (recResult.productPage.products) {
        const validProducts = recResult.productPage.products.filter(product => product.id !== null && product.id !== undefined);
        const productIds = validProducts.map(product => product.id);
        result = await getProductInformation(productIds, recommendationItems);
      }
    } else {
      result = [];
    }
  } catch (e) {
    result = [];
  }
  return result;
}
export function updateIsOnWishlistStatus(collection, productId, isOnWishlist) {
  return collection?.map(item => {
    if (item.id === productId) {
      return {
        ...item,
        data: {
          ...item.data,
          isOnWishlist
        }
      };
    }
    return item;
  }) || [];
}