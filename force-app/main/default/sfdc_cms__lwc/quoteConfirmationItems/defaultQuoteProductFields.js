import { StockKeepingUnit } from './labels';
export function getDefaultProductFields() {
  return [{
    entity: 'Product2',
    name: 'StockKeepingUnit',
    label: StockKeepingUnit,
    type: 'Text(255)'
  }];
}