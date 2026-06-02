import { StockKeepingUnit, Quantity } from './labels';
export function getDefaultProductFields() {
  return [{
    entity: 'OrderItemSummary',
    name: 'StockKeepingUnit',
    label: StockKeepingUnit,
    type: 'Text(255)'
  }, {
    entity: 'OrderItemSummary',
    name: 'Quantity',
    label: Quantity,
    type: 'Number(18, 0)'
  }];
}
export function getDefaultChildProductFields() {
  return [{
    entity: 'OrderItemSummary',
    name: 'StockKeepingUnit',
    label: StockKeepingUnit,
    type: 'Text(255)'
  }, {
    entity: 'OrderItemSummary',
    name: 'Quantity',
    label: Quantity,
    type: 'Number(18, 0)'
  }];
}