import { dateAddedNew, dateAddedOld, nameAZ, nameZA } from './labels';
export const SORT_OPTIONS = [{
  value: 'CreatedDateDesc',
  label: dateAddedNew
}, {
  value: 'CreatedDateAsc',
  label: dateAddedOld
}, {
  value: 'NameDesc',
  label: nameZA
}, {
  value: 'NameAsc',
  label: nameAZ
}];
export const CHANGE_SORT_ORDER_EVENT = 'cartchangesortorder';
export const CLEAR_CART_EVENT = 'cartclear';