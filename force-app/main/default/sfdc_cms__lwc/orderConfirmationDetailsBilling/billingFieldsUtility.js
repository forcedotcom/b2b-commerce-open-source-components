const transformToFieldData = (name, label, type, value, isAddress = false, isPaymentMethod = false) => {
  return {
    name,
    label,
    value,
    type,
    isAddress,
    isPaymentMethod
  };
};
export const getBillingDetailsFields = (billingDetails, ownerInfo, fieldLabels) => {
  const fields = [];
  if (billingDetails && billingDetails.paymentMethod && Object.keys(billingDetails.paymentMethod.fields).length) {
    fields.push(transformToFieldData('billingAddress', fieldLabels.billingAddressLabel, 'ADDRESS', {
      street: billingDetails.paymentMethod.fields.BillingStreet?.text,
      city: billingDetails.paymentMethod.fields.BillingCity?.text,
      country: billingDetails.paymentMethod.fields.BillingCountry?.text,
      state: billingDetails.paymentMethod.fields.BillingState?.text,
      postalCode: billingDetails.paymentMethod.fields.BillingPostalCode?.text
    }, true));
  }
  if (ownerInfo?.email) {
    fields.push(transformToFieldData('email', fieldLabels.emailAddressLabel, 'TEXT', ownerInfo?.email));
  }
  const PoNumber = billingDetails?.paymentMethod?.fields?.PoNumber;
  if (PoNumber) {
    fields.push(transformToFieldData('poNumber', PoNumber.label, 'TEXT', PoNumber.text, false, false));
  }
  if (billingDetails?.paymentMethod?.fields?.PaymentMethodDetails?.text) {
    fields.push(transformToFieldData('paymentMethod', fieldLabels.paymentMethodLabel, 'PAYMENTMETHOD', {
      paymentType: billingDetails.paymentMethod.fields.PaymentMethodType?.text,
      paymentMethodDetails: `****${billingDetails.paymentMethod.fields.PaymentMethodDetails?.text}`,
      paymentSubType: billingDetails.paymentMethod.fields.PaymentMethodSubType?.text
    }, false, true));
  }
  return fields;
};