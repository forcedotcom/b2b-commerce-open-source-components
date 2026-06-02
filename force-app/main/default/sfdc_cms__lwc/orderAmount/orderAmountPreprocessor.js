import { TotalProductAmount, TotalProductPromotionDiscount, TotalAdjustedDeliveryAmount, TotalTaxAmount, GrandTotalAmount, TotalProductAmountWithTax, TotalAdjDeliveryAmtWithTax } from './labels';
export function getDefaultNetTaxFields() {
  return [{
    entity: 'OrderSummary',
    name: 'TotalProductAmount',
    label: TotalProductAmount,
    type: 'Currency'
  }, {
    entity: 'OrderAdjustmentAggregateSummary',
    name: 'TotalProductPromotionDiscount',
    label: TotalProductPromotionDiscount,
    type: 'Currency'
  }, {
    entity: 'OrderSummary',
    name: 'TotalAdjustedDeliveryAmount',
    label: TotalAdjustedDeliveryAmount,
    type: 'Currency'
  }, {
    entity: 'OrderSummary',
    name: 'TotalTaxAmount',
    label: TotalTaxAmount,
    type: 'Currency'
  }, {
    entity: 'OrderSummary',
    name: 'GrandTotalAmount',
    label: GrandTotalAmount,
    type: 'Currency'
  }];
}
export function getDefaultGrossTaxFields() {
  return [{
    entity: 'OrderSummary',
    name: 'TotalProductAmountWithTax',
    label: TotalProductAmountWithTax,
    type: 'Formula (Currency)'
  }, {
    entity: 'OrderAdjustmentAggregateSummary',
    name: 'TotalProductPromotionDiscount',
    label: TotalProductPromotionDiscount,
    type: 'Formula (Currency)'
  }, {
    entity: 'OrderSummary',
    name: 'TotalAdjDeliveryAmtWithTax',
    label: TotalAdjDeliveryAmtWithTax,
    type: 'Formula (Currency)'
  }, {
    entity: 'OrderSummary',
    name: 'TotalTaxAmount',
    label: TotalTaxAmount,
    type: 'Roll-Up Summary (SUM Order Product Summary)'
  }, {
    entity: 'OrderSummary',
    name: 'GrandTotalAmount',
    label: GrandTotalAmount,
    type: 'Formula (Currency)'
  }];
}