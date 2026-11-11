import { ALPINE_NUTRITION_CHAI_PRODUCT_IMAGE_URL, ALPINE_NUTRITION_GO_BAR_CRAN_BERRY_PRODUCT_IMAGE_URL, ALPINE_NUTRITION_GO_BAR_CHERRY_PRODUCT_IMAGE_URL, ALPINE_NUTRITION_GREEN_TEA_PRODUCT_IMAGE_URL, ALPINE_NUTRITION_GO_BREW_COFFEE_PRODUCT_IMAGE_URL, ALPINE_NUTRITION_GO_BAR_BLUE_BERRY_PRODUCT_IMAGE_URL } from './previewImages';
const BASE_ORDER_SUMMARY_DATA = {
  adjustmentAggregates: {
    available: true,
    status: null,
    totalProductPromotionDistAmount: '-5.0',
    totalProductPromotionLineAmount: '-10.0',
    totalProductPromotionTotalAmount: '-15.0',
    totalDeliveryPromotionDistAmount: '-2.0',
    totalDeliveryPromotionLineAmount: '-3.0',
    totalDeliveryPromotionTotalAmount: '-5.0'
  },
  products: [{
    id: '01tSG000000REBlYAO',
    fields: {},
    media: {
      alternateText: '',
      contentVersionId: null,
      id: '2mgxx0000000001AAA',
      mediaType: 'Image',
      sortOrder: 0,
      thumbnailUrl: null,
      title: '/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/6Pack-Chai-Post-Large.jpg',
      url: ALPINE_NUTRITION_CHAI_PRODUCT_IMAGE_URL
    },
    errorCode: null,
    errorMessage: null,
    canViewProduct: true,
    variationAttributes: {}
  }, {
    id: '01tSG000000REBqYAO',
    fields: {},
    media: {
      alternateText: '',
      contentVersionId: '',
      id: '2mgxx0000000002AAA',
      mediaType: 'Image',
      sortOrder: 0,
      thumbnailUrl: null,
      title: '/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/BarsBoxof6_Go_Cherry_Large.png',
      url: ALPINE_NUTRITION_GO_BAR_CHERRY_PRODUCT_IMAGE_URL
    },
    errorCode: null,
    errorMessage: null,
    canViewProduct: true,
    variationAttributes: {}
  }, {
    id: '01tSG000000REBvYAO',
    fields: {},
    media: {
      alternateText: '',
      contentVersionId: '',
      id: '2mgxx0000000003AAA',
      mediaType: 'Image',
      sortOrder: 0,
      thumbnailUrl: null,
      title: '/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/BarsBoxof6_Go_GreenTea_Large.png',
      url: ALPINE_NUTRITION_GREEN_TEA_PRODUCT_IMAGE_URL
    },
    errorCode: null,
    errorMessage: null,
    canViewProduct: true,
    variationAttributes: {}
  }, {
    id: '01tSG000000REC7YAO',
    fields: {},
    media: {
      alternateText: '',
      contentVersionId: '',
      id: '2mgxx0000000004AAA',
      mediaType: 'Image',
      sortOrder: 0,
      thumbnailUrl: null,
      title: '/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
      url: ALPINE_NUTRITION_GO_BAR_CRAN_BERRY_PRODUCT_IMAGE_URL
    },
    errorCode: null,
    errorMessage: null,
    canViewProduct: true,
    variationAttributes: {}
  }, {
    id: '01tSG000000REBxYAO',
    fields: {},
    media: {
      alternateText: '',
      contentVersionId: '',
      id: '2mgxx0000000005AAA',
      mediaType: 'Image',
      sortOrder: 0,
      thumbnailUrl: null,
      title: '/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-blends-gobrew-coffee-wholebean-frenchroast.jpg',
      url: ALPINE_NUTRITION_GO_BREW_COFFEE_PRODUCT_IMAGE_URL
    },
    errorCode: null,
    errorMessage: null,
    canViewProduct: true,
    variationAttributes: {}
  }, {
    id: '01tSG000000RECFYA4',
    fields: {},
    media: {
      alternateText: '',
      contentVersionId: '',
      id: '2mgxx0000000006AAA',
      mediaType: 'Image',
      sortOrder: 0,
      thumbnailUrl: null,
      title: '/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-nutrition-bigfoot-blueberrysunflower.jpg',
      url: ALPINE_NUTRITION_GO_BAR_BLUE_BERRY_PRODUCT_IMAGE_URL
    },
    errorCode: null,
    errorMessage: null,
    canViewProduct: true,
    variationAttributes: {}
  }],
  createdDate: '2024-01-30T07:25:21.000Z',
  currencyIsoCode: 'USD',
  fields: {
    BillingAddress: {
      dataName: 'BillingAddress',
      dataType: 'urn:address',
      label: 'Billing Address',
      text: 'API address [ 214 Fairway Drive, Ukiah, CA, 95482, US, null, null, null, null, null]',
      type: 'address'
    },
    BillingCountry: {
      dataName: 'BillingCountry',
      dataType: 'xsd:string',
      label: 'Country',
      text: 'US',
      type: 'string'
    },
    BillingCity: {
      dataName: 'BillingCity',
      dataType: 'xsd:string',
      label: 'City',
      text: 'Burlington',
      type: 'string'
    },
    BillingStreet: {
      dataName: 'BillingStreet',
      dataType: 'xsd:string',
      label: 'Address',
      text: '5 Wall St',
      type: 'textarea'
    },
    BillingPostalCode: {
      dataName: 'BillingPostalCode',
      dataType: 'xsd:string',
      label: 'Zip',
      text: '01803',
      type: 'string'
    },
    BillingState: {
      dataName: 'BillingState',
      dataType: 'xsd:string',
      label: 'State/Province',
      text: 'MA',
      type: 'string'
    },
    AccountId: {
      dataName: 'AccountId',
      dataType: 'tns:ID',
      label: 'Account ID',
      text: 'Lighting Energy',
      type: 'reference'
    },
    BillToContactId: {
      dataName: 'BillToContactId',
      dataType: 'tns:ID',
      label: 'Bill To Contact Id',
      text: 'Abby Elton',
      type: 'reference'
    },
    BillingEmailAddress: {
      dataName: 'BillingEmailAddress',
      label: 'Billing Email Address',
      text: 'mkosak@company.com',
      type: 'email'
    },
    BillingPhoneNumber: {
      dataName: 'BillingPhoneNumber',
      label: 'Billing Phone Number',
      text: '403-123-4567',
      type: 'Phone'
    },
    CreatedDate: {
      dataName: 'CreatedDate',
      dataType: 'xsd:dateTime',
      label: 'Created Date',
      text: '2024-01-30T07:25:21.000Z',
      type: 'datetime'
    },
    Description: {
      dataName: 'Description',
      dataType: 'STANDARD',
      label: 'Description',
      text: 'A signature Alpine health and fitness beverage. This post-workout beverage with Chai flavor is designed to help athletes maximize recovery and gains. 0.5L PET',
      type: 'TEXTAREA'
    },
    TotalFeeAmount: {
      dataName: 'TotalFeeAmount',
      dataType: 'xsd:double',
      label: 'Fee Subtotal',
      text: '0.0',
      type: 'currency'
    },
    TotalFeeTaxAmount: {
      dataName: 'TotalFeeTaxAmount',
      dataType: 'xsd:double',
      label: 'Fee Subtotal Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalFeeAmountWithTax: {
      dataName: 'TotalFeeAmountWithTax',
      dataType: 'xsd:double',
      label: 'Fee Subtotal With Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalAdjustedFeeAmount: {
      dataName: 'TotalAdjustedFeeAmount',
      dataType: 'xsd:double',
      label: 'Fees',
      text: '0.0',
      type: 'currency'
    },
    TotalAdjustedFeeTaxAmount: {
      dataName: 'TotalAdjustedFeeTaxAmount',
      dataType: 'xsd:double',
      label: 'Fees Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalAdjFeeAmtWithTax: {
      dataName: 'TotalAdjFeeAmtWithTax',
      dataType: 'xsd:double',
      label: 'Fees with Tax',
      text: '0.0',
      type: 'currency'
    },
    CurrencyIsoCode: {
      dataName: 'CurrencyIsoCode',
      dataType: 'xsd:string',
      label: 'Currency ISO Code',
      text: 'USD',
      type: 'picklist'
    },
    LastModifiedDate: {
      dataName: 'LastModifiedDate',
      dataType: 'xsd:dateTime',
      label: 'Last Modified Date',
      text: '2024-01-30T07:25:21.000Z',
      type: 'datetime'
    },
    TotalAdjDistAmount: {
      dataName: 'TotalAdjDistAmount',
      dataType: 'xsd:double',
      label: 'Order Adjustments',
      text: '0.0',
      type: 'currency'
    },
    TotalAdjDistTaxAmount: {
      dataName: 'TotalAdjDistTaxAmount',
      dataType: 'xsd:double',
      label: 'Order Adjustments Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalAdjDistAmountWithTax: {
      dataName: 'TotalAdjDistAmountWithTax',
      dataType: 'xsd:double',
      label: 'Order Adjustments with Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalFeeAdjDistAmount: {
      dataName: 'TotalFeeAdjDistAmount',
      dataType: 'xsd:double',
      label: 'Order Fee Adjustments',
      text: '0.0',
      type: 'currency'
    },
    TotalFeeAdjDistTaxAmount: {
      dataName: 'TotalFeeAdjDistTaxAmount',
      dataType: 'xsd:double',
      label: 'Order Fee Adjustments Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalFeeAdjDistAmtWithTax: {
      dataName: 'TotalFeeAdjDistAmtWithTax',
      dataType: 'xsd:double',
      label: 'Order Fee Adjustments with Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalProductAdjDistAmount: {
      dataName: 'TotalProductAdjDistAmount',
      dataType: 'xsd:double',
      label: 'Order Product Adjustments',
      text: '0.0',
      type: 'currency'
    },
    TotalProductAdjDistTaxAmount: {
      dataName: 'TotalProductAdjDistTaxAmount',
      dataType: 'xsd:double',
      label: 'Order Product Adjustments Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalProductAdjDistAmtWithTax: {
      dataName: 'TotalProductAdjDistAmtWithTax',
      dataType: 'xsd:double',
      label: 'Order Product Adjustments with Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalDeliveryAdjDistAmount: {
      dataName: 'TotalDeliveryAdjDistAmount',
      dataType: 'xsd:double',
      label: 'Order Shipping Adjustments',
      text: '0.0',
      type: 'currency'
    },
    TotalDeliveryAdjDistTaxAmount: {
      dataName: 'TotalDeliveryAdjDistTaxAmount',
      dataType: 'xsd:double',
      label: 'Order Shipping Adjustments Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalDeliveryAdjDistAmtWithTax: {
      dataName: 'TotalDeliveryAdjDistAmtWithTax',
      dataType: 'xsd:double',
      label: 'Order Shipping Adjustments with Tax',
      text: '0.0',
      type: 'currency'
    },
    Id: {
      dataName: 'Id',
      dataType: 'tns:ID',
      label: 'Order Summary ID',
      text: 'XNDM7-EYWWK-YWFLM-DT4LP',
      type: 'id'
    },
    OrderNumber: {
      dataName: 'OrderNumber',
      dataType: 'xsd:string',
      label: 'Order Summary Number',
      text: 'XNDM7-EYWWK-YWFLM-DT4LP',
      type: 'string'
    },
    OrderProductLineCount: {
      dataName: 'OrderProductLineCount',
      label: 'Order Product Line Count',
      text: '10',
      type: 'int'
    },
    OrderedDate: {
      dataName: 'OrderedDate',
      dataType: 'xsd:dateTime',
      label: 'Ordered Date',
      text: '2024-01-30T07:25:20.000Z',
      type: 'datetime'
    },
    OwnerId: {
      dataName: 'OwnerId',
      dataType: 'tns:ID',
      label: 'Owner ID',
      text: 'Andy Jordan',
      type: 'reference'
    },
    PoNumber: {
      dataName: 'PoNumber',
      dataType: 'xsd:string',
      label: 'PO Number',
      text: '1234',
      type: 'string'
    },
    TotalAmount: {
      dataName: 'TotalAmount',
      dataType: 'xsd:double',
      label: 'Pretax Subtotal',
      text: '30.63',
      type: 'currency'
    },
    TotalProductAmount: {
      dataName: 'TotalProductAmount',
      dataType: 'xsd:double',
      label: 'Product Subtotal',
      text: '18.64',
      type: 'currency'
    },
    TotalProductTaxAmount: {
      dataName: 'TotalProductTaxAmount',
      dataType: 'xsd:double',
      label: 'Product Subtotal Tax',
      text: '1.86',
      type: 'currency'
    },
    TotalProductAmountWithTax: {
      dataName: 'TotalProductAmountWithTax',
      dataType: 'xsd:double',
      label: 'Product Subtotal With Tax',
      text: '20.5',
      type: 'currency'
    },
    TotalAdjustedDeliveryAmount: {
      dataName: 'TotalAdjustedDeliveryAmount',
      dataType: 'xsd:double',
      label: 'Shipping',
      text: '11.99',
      type: 'currency'
    },
    TotalDeliveryAmount: {
      dataName: 'TotalDeliveryAmount',
      dataType: 'xsd:double',
      label: 'Shipping Subtotal',
      text: '11.99',
      type: 'currency'
    },
    TotalDeliveryTaxAmount: {
      dataName: 'TotalDeliveryTaxAmount',
      dataType: 'xsd:double',
      label: 'Shipping Subtotal Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalDeliveryAmountWithTax: {
      dataName: 'TotalDeliveryAmountWithTax',
      dataType: 'xsd:double',
      label: 'Shipping Subtotal With Tax',
      text: '11.99',
      type: 'currency'
    },
    TotalAdjustedDeliveryTaxAmount: {
      dataName: 'TotalAdjustedDeliveryTaxAmount',
      dataType: 'xsd:double',
      label: 'Shipping Tax',
      text: '0.0',
      type: 'currency'
    },
    TotalAdjDeliveryAmtWithTax: {
      dataName: 'TotalAdjDeliveryAmtWithTax',
      dataType: 'xsd:double',
      label: 'Shipping with Tax',
      text: '11.99',
      type: 'currency'
    },
    Status: {
      dataName: 'Status',
      dataType: 'xsd:string',
      label: 'Status',
      text: 'Created',
      type: 'picklist'
    },
    TotalAdjustedProductAmount: {
      dataName: 'TotalAdjustedProductAmount',
      dataType: 'xsd:double',
      label: 'Subtotal',
      text: '18.64',
      type: 'currency'
    },
    TotalAdjustedProductTaxAmount: {
      dataName: 'TotalAdjustedProductTaxAmount',
      dataType: 'xsd:double',
      label: 'Subtotal Tax',
      text: '1.86',
      type: 'currency'
    },
    TotalAdjProductAmtWithTax: {
      dataName: 'TotalAdjProductAmtWithTax',
      dataType: 'xsd:double',
      label: 'Subtotal with Tax',
      text: '20.5',
      type: 'currency'
    },
    TotalTaxAmount: {
      dataName: 'TotalTaxAmount',
      dataType: 'xsd:double',
      label: 'Tax',
      text: '1.86',
      type: 'currency'
    },
    TaxLocaleType: {
      dataName: 'TaxLocaleType',
      dataType: 'xsd:string',
      label: 'Tax Locale Type',
      text: 'Gross',
      type: 'picklist'
    },
    GrandTotalAmount: {
      dataName: 'GrandTotalAmount',
      dataType: 'xsd:double',
      label: 'Total',
      text: '32.49',
      type: 'currency'
    }
  },
  orderNumber: 'XNDM7-EYWWK-YWFLM-DT4LP',
  orderProductTopLevelLineCount: 10,
  ownerId: '005SG000005sKYZYA2',
  status: 'Created',
  totalAmount: '30.63'
};
const buildVariant = (status, statusText, includeIdentifiers) => {
  const fields = {
    ...BASE_ORDER_SUMMARY_DATA.fields,
    Status: {
      ...BASE_ORDER_SUMMARY_DATA.fields.Status,
      text: statusText
    }
  };
  if (!includeIdentifiers) {
    delete fields.OrderedDate;
    delete fields.Id;
  }
  return {
    ...BASE_ORDER_SUMMARY_DATA,
    status,
    fields,
    orderSummaryId: includeIdentifiers ? BASE_ORDER_SUMMARY_DATA.fields.Id.text : ''
  };
};
export const ORDER_SUMMARY_PREVIEW_VARIANTS = [buildVariant('Created', 'Created', true), buildVariant('PendingClosed', 'In progress', false), buildVariant('Failed', 'Failed', false)];
export const ORDER_SUMMARY_DESIGN_SUBSTITUTE_DATA = ORDER_SUMMARY_PREVIEW_VARIANTS[0];