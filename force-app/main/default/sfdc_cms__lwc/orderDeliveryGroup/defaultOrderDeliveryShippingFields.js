import { Name, TotalLineAmount } from './labels';
export function getDefaultShippingFields() {
  return [{
    entity: 'OrderDeliveryMethod',
    name: 'Name',
    label: Name,
    type: 'Text(255)'
  }, {
    entity: 'OrderDeliveryGroupSummary',
    name: 'TotalLineAmount',
    label: TotalLineAmount,
    type: 'Currency(16, 2)'
  }];
}