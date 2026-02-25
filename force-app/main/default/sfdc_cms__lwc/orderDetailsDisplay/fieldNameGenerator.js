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
export default function getFieldNameFromRecord(recordId) {
  let field;
  if (recordId && (recordId.length === 15 || recordId.length === 18)) {
    const prefix = recordId.substring(0, 3);
    field = entityFieldMap.get(prefix);
  }
  return field;
}