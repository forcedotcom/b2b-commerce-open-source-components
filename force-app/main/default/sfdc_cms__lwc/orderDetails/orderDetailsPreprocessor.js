import { OrderedDate, AccountId, OwnerId, Status } from './labels';
export function getDefaultFields() {
  return [{
    entity: 'OrderSummary',
    label: OrderedDate,
    name: 'OrderedDate',
    type: 'Date/Time'
  }, {
    entity: 'OrderSummary',
    label: AccountId,
    name: 'AccountId',
    type: 'Lookup(Account)'
  }, {
    entity: 'OrderSummary',
    label: OwnerId,
    name: 'OwnerId',
    type: 'Lookup(User,Group)'
  }, {
    entity: 'OrderSummary',
    label: Status,
    name: 'Status',
    type: 'Picklist'
  }];
}