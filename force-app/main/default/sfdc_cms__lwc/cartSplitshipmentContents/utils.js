import { newDeliveryGroupName } from './labels';
const MAX_UNIQUE_NAMES = 500;
export function generateDeliveryGroupName(deliveryGroups) {
  function nameUnused(name) {
    return !deliveryGroups?.find(dg => dg.name === name);
  }
  let next = 1;
  if (deliveryGroups?.length) {
    next += deliveryGroups.length;
  }
  let name;
  do {
    name = newDeliveryGroupName.replace('{0}', next.toString());
    next++;
  } while (next < MAX_UNIQUE_NAMES && !nameUnused(name));
  return name;
}