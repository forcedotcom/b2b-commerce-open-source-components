import { StockKeepingUnit } from './labels';
export function getDefaultProductFields() {
  return [{
    entity: 'OrderItemSummary',
    name: 'StockKeepingUnit',
    label: StockKeepingUnit,
    type: 'Text(255)'
  }];
}