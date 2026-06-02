const userDisplayField = {
  objectApiName: 'User',
  fieldApiName: 'Name'
};
const accountDisplayField = {
  objectApiName: 'Account',
  fieldApiName: 'Name'
};
const orderDisplayField = {
  objectApiName: 'Order',
  fieldApiName: 'OrderNumber'
};
const orderSummaryDisplayField = {
  objectApiName: 'OrderSummary',
  fieldApiName: 'OrderNumber'
};
const contactDisplayField = {
  objectApiName: 'Contact',
  fieldApiName: 'Name'
};
const entityFieldMap = new Map([['005', userDisplayField], ['001', accountDisplayField], ['801', orderDisplayField], ['1Os', orderSummaryDisplayField], ['003', contactDisplayField]]);
export function getFieldNameFromEntity(orderId) {
  let field;
  if (orderId && (orderId.length === 15 || orderId.length === 18)) {
    const prefix = orderId.substring(0, 3);
    if (entityFieldMap.has(prefix)) {
      field = entityFieldMap.get(prefix);
    }
  }
  return field;
}