const accountDisplayField = {
  objectApiName: 'Account',
  fieldApiName: 'Name'
};
const quoteDisplayField = {
  objectApiName: 'Quote',
  fieldApiName: 'QuoteNumber'
};
const contactDisplayField = {
  objectApiName: 'Contact',
  fieldApiName: 'Name'
};
const entityFieldMap = new Map([['001', accountDisplayField], ['0Q0', quoteDisplayField], ['003', contactDisplayField]]);
export function getFieldNameFromEntity(entityId) {
  let field;
  if (entityId && (entityId.length === 15 || entityId.length === 18)) {
    const prefix = entityId.substring(0, 3);
    if (entityFieldMap.has(prefix)) {
      field = entityFieldMap.get(prefix);
    }
  }
  return field;
}